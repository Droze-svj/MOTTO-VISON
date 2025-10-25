import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

const useNetwork = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState(null);
  const [connectionDetails, setConnectionDetails] = useState(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      setConnectionDetails(state.details);
    });

    // Initial check
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
      setConnectionType(state.type);
      setConnectionDetails(state.details);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkConnection = async () => {
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected);
    setConnectionType(state.type);
    setConnectionDetails(state.details);
    return state;
  };

  return {
    isConnected,
    connectionType,
    connectionDetails,
    checkConnection,
  };
};

export default useNetwork; 