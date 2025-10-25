/**
 * NaN Fix Utility
 * Prevents CoreGraphics NaN errors by ensuring all numeric values are valid
 */

import { Dimensions } from 'react-native';

// Safe number validation
export const safeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return defaultValue;
  }
  return Number(value);
};

// Safe dimensions getter
export const getSafeDimensions = () => {
  try {
    const { width, height } = Dimensions.get('window');
    return {
      width: safeNumber(width, 375),
      height: safeNumber(height, 667),
    };
  } catch (error) {
    return { width: 375, height: 667 };
  }
};

// Safe calculation wrapper
export const safeCalculation = (calculation, defaultValue = 0) => {
  try {
    const result = calculation();
    return safeNumber(result, defaultValue);
  } catch (error) {
    return defaultValue;
  }
};

// Safe toFixed wrapper
export const safeToFixed = (value, decimals = 2, defaultValue = '0') => {
  const num = safeNumber(value, 0);
  try {
    return num.toFixed(decimals);
  } catch (error) {
    return defaultValue;
  }
};

// Safe percentage calculation
export const safePercentage = (value, total, defaultValue = 0) => {
  const numValue = safeNumber(value, 0);
  const numTotal = safeNumber(total, 1);
  
  if (numTotal === 0) return defaultValue;
  
  return safeNumber((numValue / numTotal) * 100, defaultValue);
};

// Safe Math operations
export const safeMath = {
  max: (...values) => {
    const validValues = values.map(v => safeNumber(v, -Infinity)).filter(v => v !== -Infinity);
    return validValues.length > 0 ? Math.max(...validValues) : 0;
  },
  
  min: (...values) => {
    const validValues = values.map(v => safeNumber(v, Infinity)).filter(v => v !== Infinity);
    return validValues.length > 0 ? Math.min(...validValues) : 0;
  },
  
  round: (value) => Math.round(safeNumber(value, 0)),
  
  floor: (value) => Math.floor(safeNumber(value, 0)),
  
  ceil: (value) => Math.ceil(safeNumber(value, 0)),
  
  abs: (value) => Math.abs(safeNumber(value, 0)),
  
  sqrt: (value) => {
    const num = safeNumber(value, 0);
    return num >= 0 ? Math.sqrt(num) : 0;
  },
  
  pow: (base, exponent) => {
    const numBase = safeNumber(base, 0);
    const numExponent = safeNumber(exponent, 0);
    return Math.pow(numBase, numExponent);
  },
};

// Safe style value wrapper
export const safeStyleValue = (value, defaultValue = 0) => {
  const num = safeNumber(value, defaultValue);
  // Ensure the value is within reasonable bounds for React Native styles
  return Math.max(-10000, Math.min(10000, num));
};

// Safe width/height calculation
export const safeDimension = (dimension, multiplier = 1, defaultValue = 100) => {
  const { width, height } = getSafeDimensions();
  const baseDimension = dimension === 'width' ? width : height;
  return safeStyleValue(baseDimension * multiplier, defaultValue);
};

export default {
  safeNumber,
  getSafeDimensions,
  safeCalculation,
  safeToFixed,
  safePercentage,
  safeMath,
  safeStyleValue,
  safeDimension,
};
