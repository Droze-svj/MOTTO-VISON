import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

const useOrientation = () => {
  const [orientation, setOrientation] = useState('PORTRAIT');
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const { width, height } = window;
      const newOrientation = width < height ? 'PORTRAIT' : 'LANDSCAPE';
      
      setOrientation(newOrientation);
      setDimensions(window);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const isPortrait = orientation === 'PORTRAIT';
  const isLandscape = orientation === 'LANDSCAPE';
  const { width, height } = dimensions;

  return {
    orientation,
    isPortrait,
    isLandscape,
    width,
    height,
  };
};

export default useOrientation; 