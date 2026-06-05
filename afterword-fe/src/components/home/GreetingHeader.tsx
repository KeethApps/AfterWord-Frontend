import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FolioFox } from '../../components/shared/FolioFox';

interface GreetingHeaderProps {
  userName: string;
  hour: number; // 0-23
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({ userName, hour }) => {
  const getVariant = () => {
    if (hour < 12) return 'happy';
    if (hour < 18) return 'reading';
    return 'sleepy';
  };

  const getGreeting = () => {
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <FolioFox variant={getVariant()} size={150} />
      <Text style={styles.greeting}>{`${getGreeting()}, ${userName}`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 24,
  },
  greeting: {
    marginTop: 12,
    fontFamily: 'Serif', // assume Lora is loaded globally
    fontSize: 24,
    color: '#2F4F4F',
  },
});
