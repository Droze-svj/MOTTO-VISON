import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { colors } from '../../constants/colors';

const PreviewVariants = ({ variants = [], onVariantPress }) => {
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1400, useNativeDriver: false }),
        Animated.timing(glow, { toValue: 0, duration: 1400, useNativeDriver: false })
      ])
    ).start();
  }, [glow]);

  const shadowRadius = glow.interpolate({ inputRange: [0, 1], outputRange: [4, 10] });
  const shadowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.5] });

  if (!variants || variants.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {variants.map((v, idx) => (
          <Animated.View
            key={`${idx}-${v.slice(0, 8)}`}
            style={[
              styles.card,
              {
                shadowRadius,
                shadowOpacity,
              }
            ]}
          >
            <TouchableOpacity onPress={() => onVariantPress && onVariantPress(v)} activeOpacity={0.85}>
              <Text style={styles.text} numberOfLines={3}>{v}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  row: {
    paddingVertical: 4,
  },
  card: {
    backgroundColor: colors.DARKER_BLUE,
    borderWidth: 1,
    borderColor: colors.OCEAN_BLUE,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 10,
    borderRadius: 12,
    minWidth: 180,
    maxWidth: 260,
    shadowColor: colors.OCEAN_BLUE,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  text: {
    color: colors.LIGHT_TEXT,
    fontSize: 14,
    lineHeight: 18,
  }
});

export default PreviewVariants;


