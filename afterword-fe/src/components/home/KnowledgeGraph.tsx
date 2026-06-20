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
      style={{
        backgroundColor: '#F2F0EA',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 2,
        padding: 20,
        paddingLeft: 25,
      }}
    >
      {/* Left accent bar — absolutely positioned so it doesn't affect layout */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          backgroundColor: Colors.forest,
        }}
      />

      {/* Header — matches DailyHighlightCard */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <Ionicons name="git-network-outline" size={14} color={Colors.forest} />
        <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.forest, fontWeight: '600', letterSpacing: 1.2, flex: 1 }}>
          KNOWLEDGE MAP
        </Text>
      </View>
      {/* <Text style={{ fontFamily: Fonts.serifBold, fontSize: 18, color: Colors.forest, lineHeight: 24, marginBottom: 4 }}>
        How your ideas connect
      </Text> */}
      <Text style={{ fontFamily: Fonts.sans, fontSize: 12, color: Colors.slate, lineHeight: 18, marginBottom: 16 }}>
        Tap a node to open its highlight. Drag to pan, pinch to zoom.
      </Text>

      {isLoading ? (
        <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={{ width: '100%', height: '100%', opacity: pulseAnim }}>
            <View style={{ flex: 1, position: 'relative' }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(180,180,170,0.4)', position: 'absolute', top: 40, left: 40 }} />
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(180,180,170,0.4)', position: 'absolute', top: 80, right: 56 }} />
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(180,180,170,0.4)', position: 'absolute', bottom: 48, left: 96 }} />
            </View>
          </Animated.View>
        </View>
      ) : error ? (
        <View style={{ height, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Text style={{ fontFamily: Fonts.serifBold, fontSize: 15, color: Colors.danger, marginBottom: 4, textAlign: 'center' }}>Failed to load Knowledge Map</Text>
          <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: Colors.slate, textAlign: 'center' }}>Please make sure you are signed in.</Text>
        </View>
      ) : !graphRawData || !graphRawData.nodes || graphRawData.nodes.length < 5 ? (
        <View style={{ height, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Image
            source={require("../../../assets/crane/crane-icon.png")}
            style={{ width: 56, height: 56, marginBottom: 12, opacity: 0.5 }}
            resizeMode="contain"
          />
          <Text style={{ fontFamily: Fonts.sans, fontSize: 12, color: Colors.slate, textAlign: 'center', maxWidth: 200 }}>
            Add more highlights to see connections emerge
          </Text>
        </View>
      ) : (
        <View
          style={{ height, overflow: 'hidden', borderRadius: 10 }}
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
          <View style={{ position: 'absolute', top: 8, right: 8, flexDirection: 'row', gap: 6, zIndex: 40 }}>
            {([
              { icon: 'add' as const, onPress: () => setTransform(prev => ({ ...prev, scale: Math.min(3, prev.scale + 0.25) })) },
              { icon: 'remove' as const, onPress: () => setTransform(prev => ({ ...prev, scale: Math.max(0.5, prev.scale - 0.25) })) },
              { icon: 'refresh' as const, onPress: () => setTransform({ x: 0, y: 0, scale: 1 }) },
            ] as const).map(({ icon, onPress }) => (
              <Pressable
                key={icon}
                onPress={onPress}
                style={({ pressed }) => ({
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: pressed ? '#fff' : 'rgba(255,255,255,0.92)',
                  borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
                  alignItems: 'center', justifyContent: 'center',
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06, shadowRadius: 2, elevation: 1,
                })}
              >
                <Ionicons name={icon} size={14} color={Colors.forest} />
              </Pressable>
            ))}
          </View>

          {/* Tooltip Overlay */}
          {hoveredNode && tooltipPosition && (
            <View
              style={{
                position: 'absolute',
                left: tooltipPosition.x,
                top: tooltipPosition.y,
                width: 220,
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.07)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 4,
                zIndex: 50,
              }}
            >
              <Text numberOfLines={3} ellipsizeMode="tail"
                style={{ fontFamily: Fonts.serif, fontSize: 12, color: Colors.forest, fontStyle: 'italic', lineHeight: 18, marginBottom: 8 }}>
                "{hoveredNode.quote}"
              </Text>
              <Text numberOfLines={1} ellipsizeMode="tail"
                style={{ fontFamily: Fonts.sansBold, fontSize: 10, color: Colors.slate, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {hoveredNode.book_title}
              </Text>
              <Text numberOfLines={1} ellipsizeMode="tail"
                style={{ fontFamily: Fonts.sans, fontSize: 9, color: Colors.slate, marginTop: 2 }}>
                {hoveredNode.author}
              </Text>
            </View>
          )}

          {/* Book Color Legend */}
          <View style={{
            position: 'absolute', bottom: 8, left: 8,
            backgroundColor: 'rgba(255,255,255,0.95)',
            padding: 6, borderRadius: 8,
            borderWidth: 1, borderColor: 'rgba(0,0,0,0.07)',
            maxWidth: 150,
            shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
          }}>
            {uniqueBooks.slice(0, 4).map((book, i) => {
              const displayTitle = book.length > 20 ? `${book.substring(0, 17)}...` : book;
              return (
                <View key={book} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: i < Math.min(uniqueBooks.length, 4) - 1 ? 2 : 0 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: bookColors[book], marginRight: 4 }} />
                  <Text style={{ fontFamily: Fonts.sans, fontSize: 9, color: Colors.slate, flex: 1 }}
                    numberOfLines={1} ellipsizeMode="tail">
                    {displayTitle}
                  </Text>
                </View>
              );
            })}
            {uniqueBooks.length > 4 && (
              <Text style={{ fontFamily: Fonts.sans, fontSize: 8, color: Colors.slate, fontStyle: 'italic', marginTop: 2 }}>
                + {uniqueBooks.length - 4} more books
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}