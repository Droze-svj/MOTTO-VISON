import { useState, useCallback } from 'react';
import {
  Platform,
  PermissionsAndroid,
  Permission,
  PermissionStatus,
} from 'react-native';

const usePermissions = () => {
  const [permissions, setPermissions] = useState({});

  const requestPermission = useCallback(async (permission) => {
    if (Platform.OS !== 'android') {
      return { granted: true };
    }

    try {
      const granted = await PermissionsAndroid.request(permission);
      setPermissions(prev => ({
        ...prev,
        [permission]: granted,
      }));
      return { granted: granted === PermissionsAndroid.RESULTS.GRANTED };
    } catch (err) {
      console.error('Permission request error:', err);
      return { granted: false, error: err };
    }
  }, []);

  const requestMultiplePermissions = useCallback(async (permissionsList) => {
    if (Platform.OS !== 'android') {
      return permissionsList.reduce((acc, permission) => {
        acc[permission] = { granted: true };
        return acc;
      }, {});
    }

    try {
      const results = await PermissionsAndroid.requestMultiple(permissionsList);
      setPermissions(prev => ({
        ...prev,
        ...results,
      }));
      return results;
    } catch (err) {
      console.error('Multiple permissions request error:', err);
      return permissionsList.reduce((acc, permission) => {
        acc[permission] = { granted: false, error: err };
        return acc;
      }, {});
    }
  }, []);

  const checkPermission = useCallback(async (permission) => {
    if (Platform.OS !== 'android') {
      return { granted: true };
    }

    try {
      const result = await PermissionsAndroid.check(permission);
      setPermissions(prev => ({
        ...prev,
        [permission]: result ? PermissionsAndroid.RESULTS.GRANTED : PermissionsAndroid.RESULTS.DENIED,
      }));
      return { granted: result };
    } catch (err) {
      console.error('Permission check error:', err);
      return { granted: false, error: err };
    }
  }, []);

  const checkMultiplePermissions = useCallback(async (permissionsList) => {
    if (Platform.OS !== 'android') {
      return permissionsList.reduce((acc, permission) => {
        acc[permission] = { granted: true };
        return acc;
      }, {});
    }

    try {
      const results = await Promise.all(
        permissionsList.map(permission => PermissionsAndroid.check(permission))
      );
      
      const permissionsMap = permissionsList.reduce((acc, permission, index) => {
        acc[permission] = results[index];
        return acc;
      }, {});

      setPermissions(prev => ({
        ...prev,
        ...permissionsMap,
      }));

      return permissionsMap;
    } catch (err) {
      console.error('Multiple permissions check error:', err);
      return permissionsList.reduce((acc, permission) => {
        acc[permission] = { granted: false, error: err };
        return acc;
      }, {});
    }
  }, []);

  return {
    permissions,
    requestPermission,
    requestMultiplePermissions,
    checkPermission,
    checkMultiplePermissions,
  };
};

export default usePermissions; 