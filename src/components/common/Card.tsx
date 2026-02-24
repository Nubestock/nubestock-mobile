import React, { ReactNode, useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors } from '../../constants/colors';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({ children, style }) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <View style={[styles.card, style]}>{children}</View>;
};

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
  card: {
    backgroundColor: colors.SURFACE,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default Card;
