import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useThemeColors } from '../../constants/colors';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color,
}) => {
  const colors = useThemeColors();
  const indicatorColor = color || colors.PRIMARY;
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={indicatorColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Loading;
