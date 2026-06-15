import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Platform,
  Animated,
  Image,
  Pressable,
  LayoutChangeEvent,
} from 'react-native';
import Svg, { Circle, Line, G } from 'react-native-svg';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import { supabase } from '@/lib/supabase';
import { Colors, Fonts } from '../../../constants/theme';

interface GraphNode {
  id: string;
  quote: string;
  book_title: string;
  author: string;
  tag: string | null;
}

interface GraphEdge {
  source: string;
  target: string;
  similarity: number;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface PositionedNode extends GraphNode {
  x: number;
  y: number;
  radius: number;
}

interface PositionedLink {
  source: string;
  target: string;
  similarity: number;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}

interface KnowledgeGraphProps {
  onHighlightSelect: (id: string) => void;
}

// 8 brand-aligned colors: greens, golds, creams
const COLOR_PALETTE = [
  '#1E3A2F', // forest
  '#C9A84C', // gold
  '#4A7C59', // slate
  '#E9C46A', // amber
  '#8CA895', // sage green
  '#D9B48F', // warm sand
  '#2E5A44', // dark emerald
  '#E8DDCB', // soft cream
];

const getEdgeOpacity = (similarity: number) => {
  const minSim = 0.82;
  const maxSim = 1.0;
  const normalized = (similarity - minSim) / (maxSim - minSim || 1);
  return 0.05 + normalized * 0.10;
};

// D3 Force layout precomputation
const runLayout = (
  rawNodes: GraphNode[],
  rawEdges: GraphEdge[],
  width: number,
  height: number
): { nodes: PositionedNode[]; links: PositionedLink[] } => {
  const degrees: Record<string, number> = {};
  rawNodes.forEach((n) => {
    degrees[n.id] = 0;
  });
  
  rawEdges.forEach((e) => {
    if (degrees[e.source] !== undefined) degrees[e.source]++;
    if (degrees[e.target] !== undefined) degrees[e.target]++;
  });

  const maxDegree = Math.max(...Object.values(degrees), 1);
  const minRadius = 6;
  const maxRadius = 14;

  const nodes = rawNodes.map((n) => ({
    ...n,
    radius: minRadius + ((degrees[n.id] || 0) / maxDegree) * (maxRadius - minRadius),
    x: width / 2 + (Math.random() - 0.5) * 50,
    y: height / 2 + (Math.random() - 0.5) * 50,
  }));

  const links = rawEdges.map((e) => ({
    source: e.source,
    target: e.target,
    similarity: e.similarity,
  }));

  const simulation = forceSimulation(nodes as any)
    .force('link', forceLink(links).id((d: any) => d.id).distance(80))
    .force('charge', forceManyBody().strength(-120))
    .force('center', forceCenter(width / 2, height / 2))
    .force('collide', forceCollide().radius((d: any) => d.radius + 12))
    .stop();

  for (let i = 0; i < 300 && simulation.alpha() >= 0.01; ++i) {
    simulation.tick();
  }

  const positionedNodes: PositionedNode[] = nodes.map((n) => ({
    id: n.id,
    quote: n.quote,
    book_title: n.book_title,
    author: n.author,
    tag: n.tag,
    x: n.x || width / 2,
    y: n.y || height / 2,
    radius: n.radius,
  }));

  const nodeMap = new Map(positionedNodes.map((n) => [n.id, n]));

  const positionedLinks: PositionedLink[] = links.map((l: any) => {
    const sNode = nodeMap.get(l.source.id || l.source);
    const tNode = nodeMap.get(l.target.id || l.target);
    return {
      source: l.source.id || l.source,
      target: l.target.id || l.target,
      similarity: l.similarity,
      sourceX: sNode?.x || width / 2,
      sourceY: sNode?.y || height / 2,
      targetX: tNode?.x || width / 2,
      targetY: tNode?.y || height / 2,
    };
  });

  return { nodes: positionedNodes, links: positionedLinks };
};

export function KnowledgeGraph({ onHighlightSelect }: KnowledgeGraphProps) {
  const [containerWidth, setContainerWidth] = useState(340);
  const height = 300;

  // Zoom & Pan state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialDistance = useRef<number | null>(null);

  const [hoveredNode, setHoveredNode] = useState<PositionedNode | null>(null);

  // Skeleton Pulse Animation
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Fetch graph data scoped to session token using supabase client
  const { data: graphRawData, isLoading, error } = useQuery<GraphData>({
    queryKey: ['knowledge-graph-data'],
    queryFn: async () => {
      const { data, error: rpcError } = await supabase.rpc('get_graph_edges');
      if (rpcError) throw rpcError;
      return data as GraphData;
    },
  });

  // Calculate layout once data is loaded and width is measured
  const { nodes, links, bookColors, uniqueBooks } = useMemo(() => {
    if (!graphRawData || !graphRawData.nodes || graphRawData.nodes.length < 5) {
      return { nodes: [], links: [], bookColors: {}, uniqueBooks: [] };
    }

    const { nodes: pNodes, links: pLinks } = runLayout(
      graphRawData.nodes,
      graphRawData.edges,
      containerWidth,
      height
    );

    const uBooks = Array.from(new Set(pNodes.map((n) => n.book_title)));
    const colors: Record<string, string> = {};
    uBooks.forEach((book, idx) => {
      colors[book] = COLOR_PALETTE[idx % COLOR_PALETTE.length];
    });

    return {
      nodes: pNodes,
      links: pLinks,
      bookColors: colors,
      uniqueBooks: uBooks,
    };
  }, [graphRawData, containerWidth]);

  // Adjust tooltip calculations to account for current zoom & pan transform
  const tooltipPosition = useMemo(() => {
    if (!hoveredNode) return null;
    const tooltipW = 220;
    const tooltipH = 120;

    // Apply scale and offsets
    const rx = hoveredNode.x * transform.scale + transform.x;
    const ry = hoveredNode.y * transform.scale + transform.y;
    const rRadius = hoveredNode.radius * transform.scale;

    let tx = rx - tooltipW / 2;
    let ty = ry - rRadius - tooltipH - 12;

    if (tx < 10) tx = 10;
    if (tx + tooltipW > containerWidth - 10) tx = containerWidth - tooltipW - 10;

    if (ty < 10) {
      ty = ry + rRadius + 12;
    }

    return { x: tx, y: ty };
  }, [hoveredNode, transform, containerWidth]);

  // Gesture responder handlers for pan and pinch zoom
  const onResponderGrant = (e: any) => {
    const touch = e.nativeEvent.touches?.[0] || e.nativeEvent;
    dragStart.current = {
      x: touch.pageX - transform.x,
      y: touch.pageY - transform.y,
    };
    isDragging.current = true;
  };

  const onResponderMove = (e: any) => {
    const touches = e.nativeEvent.touches;
    if (touches && touches.length === 2) {
      // Pinch-to-zoom logic
      const t1 = touches[0];
      const t2 = touches[1];
      const dist = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);

      if (initialDistance.current === null) {
        initialDistance.current = dist;
      } else {
        const ratio = dist / initialDistance.current;
        setTransform((prev) => ({
          ...prev,
          scale: Math.max(0.5, Math.min(3, prev.scale * ratio)),
        }));
        initialDistance.current = dist;
      }
    } else if (isDragging.current && (!touches || touches.length === 1)) {
      // Panning logic
      const touch = touches?.[0] || e.nativeEvent;
      const newX = touch.pageX - dragStart.current.x;
      const newY = touch.pageY - dragStart.current.y;
      setTransform((prev) => ({
        ...prev,
        x: newX,
        y: newY,
      }));
    }
  };

  const onResponderRelease = () => {
    isDragging.current = false;
    initialDistance.current = null;
  };

  const handleWheel = (e: any) => {
    // Zoom in/out via mouse scroll wheel on Web
    const zoomFactor = 1.05;
    const direction = e.deltaY < 0 ? 1 : -1;
    
    setTransform((prev) => {
      const newScale = direction > 0 ? prev.scale * zoomFactor : prev.scale / zoomFactor;
      const clampedScale = Math.max(0.5, Math.min(3, newScale));
      return {
        ...prev,
        scale: clampedScale,
      };
    });
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) {
      setContainerWidth(width);
    }
  };

  // Render wrapper component
  return (
    <View 
      onLayout={handleLayout}
      className="flex-1 relative overflow-hidden"
    >
      {/* Header section matching style patterns */}
      <View className="flex-row items-center mb-1">

        <View className="w-3.5 h-[2px] bg-gold mr-1.5" />
        <Text className="font-sans text-[10px] uppercase tracking-widest text-gold">Knowledge Map</Text>
      </View>
      <Text className="font-serifBold text-lg text-forest mb-1">How your ideas connect</Text>
      <Text className="font-sans text-xs text-slate mb-4">
        Hover nodes to reveal quotes. Drag canvas to pan. Scroll or pinch to zoom.
      </Text>

      {isLoading ? (
        <View style={{ height }} className="items-center justify-center p-4">
          <Animated.View style={{ width: '100%', height: '100%', opacity: pulseAnim }} className="flex-1 justify-between">
            <View className="flex-1 items-center justify-center">
              <View className="w-12 h-12 rounded-full bg-mist/60 absolute top-10 left-10" />
              <View className="w-16 h-16 rounded-full bg-mist/60 absolute top-20 right-14" />
              <View className="w-10 h-10 rounded-full bg-mist/60 absolute bottom-12 left-24" />
            </View>
          </Animated.View>
        </View>
      ) : error ? (
        <View style={{ height }} className="items-center justify-center p-6">
          <Text className="font-serifBold text-md text-danger mb-1">Failed to load Knowledge Map</Text>
          <Text className="font-sans text-[11px] text-slate text-center">Please make sure you are signed in.</Text>
        </View>
      ) : !graphRawData || !graphRawData.nodes || graphRawData.nodes.length < 5 ? (
        <View style={{ height }} className="items-center justify-center p-6 bg-surface border border-mist rounded-xl shadow-sm">
          <Image
            source={require("../../../assets/crane/crane-icon.png")}
            style={{ width: 64, height: 64, marginBottom: 12 }}
            resizeMode="contain"
          />
          <Text className="font-sans text-xs text-slate text-center max-w-[220px]">
            Add more highlights to see connections emerge
          </Text>
        </View>
      ) : (
        <View 
          style={{ height }}
          className="relative overflow-hidden rounded-xl bg-transparent"
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={onResponderGrant}
          onResponderMove={onResponderMove}
          onResponderRelease={onResponderRelease}
          {...({ onWheel: handleWheel } as any)}
        >
          {/* SVG Map representing node points */}
          <Svg width={containerWidth} height={height}>
            <G transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
              {/* Render edges */}
              {links.map((link, idx) => (
                <Line
                  key={`link-${idx}`}
                  x1={link.sourceX}
                  y1={link.sourceY}
                  x2={link.targetX}
                  y2={link.targetY}
                  stroke="#1E3A2F"
                  strokeWidth={1.5 / transform.scale} // Keep line width thin when zooming
                  opacity={getEdgeOpacity(link.similarity)}
                />
              ))}

              {/* Render nodes */}
              {nodes.map((node) => (
                <Circle
                  key={node.id}
                  cx={node.x}
                  cy={node.y}
                  r={node.radius}
                  fill={bookColors[node.book_title] || '#1E3A2F'}
                  stroke="#FFFFFF"
                  strokeWidth={1.5 / transform.scale}
                  {...({
                    onMouseEnter: () => setHoveredNode(node),
                    onMouseLeave: () => setHoveredNode(null),
                    style: { cursor: 'pointer' },
                  } as any)}
                  onPress={() => onHighlightSelect(node.id)}
                />
              ))}
            </G>
          </Svg>

          {/* Interactive Zoom Overlay Controls */}
          <View className="absolute top-2 right-2 flex-row gap-1.5 z-40">
            <Pressable
              onPress={() => setTransform(prev => ({ ...prev, scale: Math.min(3, prev.scale + 0.25) }))}
              className="w-7 h-7 rounded-full bg-white/90 border border-border/80 items-center justify-center shadow-sm active:bg-white"
            >
              <Ionicons name="add" size={14} color="#1E3A2F" />
            </Pressable>
            <Pressable
              onPress={() => setTransform(prev => ({ ...prev, scale: Math.max(0.5, prev.scale - 0.25) }))}
              className="w-7 h-7 rounded-full bg-white/90 border border-border/80 items-center justify-center shadow-sm active:bg-white"
            >
              <Ionicons name="remove" size={14} color="#1E3A2F" />
            </Pressable>
            <Pressable
              onPress={() => setTransform({ x: 0, y: 0, scale: 1 })}
              className="w-7 h-7 rounded-full bg-white/90 border border-border/80 items-center justify-center shadow-sm active:bg-white"
            >
              <Ionicons name="refresh" size={13} color="#1E3A2F" />
            </Pressable>
          </View>

          {/* Tooltip Overlay */}
          {hoveredNode && tooltipPosition && (
            <View
              style={{
                position: 'absolute',
                left: tooltipPosition.x,
                top: tooltipPosition.y,
                width: 220,
              }}
              className="bg-white rounded-xl p-3 border border-border shadow-md pointer-events-none z-50"
            >
              <Text 
                numberOfLines={3} 
                ellipsizeMode="tail" 
                style={{ fontFamily: Fonts.serif }}
                className="text-xs text-forest italic mb-2 leading-relaxed"
              >
                "{hoveredNode.quote}"
              </Text>
              <Text 
                numberOfLines={1} 
                ellipsizeMode="tail" 
                style={{ fontFamily: Fonts.sansBold }}
                className="text-[10px] text-slate uppercase tracking-wider"
              >
                {hoveredNode.book_title}
              </Text>
              <Text 
                numberOfLines={1} 
                ellipsizeMode="tail" 
                style={{ fontFamily: Fonts.sans }}
                className="text-[9px] text-slate mt-0.5"
              >
                {hoveredNode.author}
              </Text>
            </View>
          )}

          {/* Book Color Legend */}
          <View 
            className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm p-1.5 rounded-lg border border-border max-w-[150px] shadow-sm pointer-events-none"
          >
            {uniqueBooks.slice(0, 4).map((book) => {
              const displayTitle = book.length > 20 ? `${book.substring(0, 17)}...` : book;
              return (
                <View key={book} className="flex-row items-center mb-0.5 last:mb-0">
                  <View
                    style={{ backgroundColor: bookColors[book] }}
                    className="w-2 h-2 rounded-full mr-1"
                  />
                  <Text 
                    style={{ fontFamily: Fonts.sans }} 
                    className="text-[9px] text-slate flex-1"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {displayTitle}
                  </Text>
                </View>
              );
            })}
            {uniqueBooks.length > 4 && (
              <Text 
                style={{ fontFamily: Fonts.sans }}
                className="text-[8px] text-slate italic mt-0.5"
              >
                + {uniqueBooks.length - 4} more books
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
