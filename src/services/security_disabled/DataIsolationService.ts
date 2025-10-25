/**
 * Data Isolation Service
 * Ensures complete separation between users
 * Prevents data leakage and unauthorized access
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptionService from './EncryptionService';

interface UserDataScope {
  userId: string;
  namespace: string;
  isolated: boolean;
  encrypted: boolean;
}

interface AccessLog {
  userId: string;
  action: 'read' | 'write' | 'delete';
  resource: string;
  timestamp: number;
  authorized: boolean;
  ip?: string;
}

export class DataIsolationService {
  private static instance: DataIsolationService;
  private currentUserId: string | null = null;
  private accessLogs: AccessLog[] = [];
  private readonly MAX_LOGS = 1000;

  private constructor() {}

  static getInstance(): DataIsolationService {
    if (!DataIsolationService.instance) {
      DataIsolationService.instance = new DataIsolationService();
    }
    return DataIsolationService.instance;
  }

  /**
   * Set current active user
   */
  setCurrentUser(userId: string): void {
    this.currentUserId = userId;
    console.log(`[DataIsolation] Active user: ${userId}`);
  }

  /**
   * Get current user
   */
  getCurrentUser(): string | null {
    return this.currentUserId;
  }

  /**
   * Generate isolated storage key
   */
  generateKey(userId: string, namespace: string, key: string): string {
    // Format: motto_{userId}_{namespace}_{key}
    return `motto_${userId}_${namespace}_${key}`;
  }

  /**
   * Verify user has access to resource
   */
  private verifyAccess(resourceKey: string): boolean {
    if (!this.currentUserId) {
      console.warn('[DataIsolation] No active user');
      return false;
    }

    // Check if resource belongs to current user
    if (!resourceKey.includes(this.currentUserId)) {
      console.error(
        `[DataIsolation] Access denied: User ${this.currentUserId} tried to access ${resourceKey}`
      );
      this.logAccess('read', resourceKey, false);
      return false;
    }

    return true;
  }

  /**
   * Isolated write operation
   */
  async write(
    userId: string,
    namespace: string,
    key: string,
    data: any,
    encrypt: boolean = true
  ): Promise<boolean> {
    try {
      // Verify user matches current session
      if (this.currentUserId && userId !== this.currentUserId) {
        throw new Error('User mismatch: Cannot write data for different user');
      }

      const storageKey = this.generateKey(userId, namespace, key);

      // Convert to string
      let toStore = typeof data === 'string' ? data : JSON.stringify(data);

      // Encrypt if requested
      if (encrypt && EncryptionService.isInitialized()) {
        toStore = await EncryptionService.encrypt(toStore);
      }

      await AsyncStorage.setItem(storageKey, toStore);
      this.logAccess('write', storageKey, true);

      return true;
    } catch (error) {
      console.error('[DataIsolation] Write error:', error);
      this.logAccess('write', `${namespace}/${key}`, false);
      return false;
    }
  }

  /**
   * Isolated read operation
   */
  async read(
    userId: string,
    namespace: string,
    key: string,
    decrypt: boolean = true
  ): Promise<any | null> {
    try {
      // Verify user matches current session
      if (this.currentUserId && userId !== this.currentUserId) {
        throw new Error('User mismatch: Cannot read data for different user');
      }

      const storageKey = this.generateKey(userId, namespace, key);

      // Verify access
      if (!this.verifyAccess(storageKey)) {
        return null;
      }

      const data = await AsyncStorage.getItem(storageKey);
      if (!data) {
        return null;
      }

      this.logAccess('read', storageKey, true);

      // Decrypt if needed
      let result = data;
      if (decrypt && EncryptionService.isInitialized()) {
        try {
          result = await EncryptionService.decrypt(data);
        } catch (e) {
          // Data might not be encrypted
          console.warn('[DataIsolation] Decryption failed, using raw data');
        }
      }

      // Try to parse as JSON
      try {
        return JSON.parse(result);
      } catch (e) {
        return result;
      }
    } catch (error) {
      console.error('[DataIsolation] Read error:', error);
      this.logAccess('read', `${namespace}/${key}`, false);
      return null;
    }
  }

  /**
   * Isolated delete operation
   */
  async delete(
    userId: string,
    namespace: string,
    key: string
  ): Promise<boolean> {
    try {
      // Verify user matches current session
      if (this.currentUserId && userId !== this.currentUserId) {
        throw new Error('User mismatch: Cannot delete data for different user');
      }

      const storageKey = this.generateKey(userId, namespace, key);

      // Verify access
      if (!this.verifyAccess(storageKey)) {
        return false;
      }

      await AsyncStorage.removeItem(storageKey);
      this.logAccess('delete', storageKey, true);

      return true;
    } catch (error) {
      console.error('[DataIsolation] Delete error:', error);
      this.logAccess('delete', `${namespace}/${key}`, false);
      return false;
    }
  }

  /**
   * Get all keys for a user
   */
  async getUserKeys(userId: string): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      return allKeys.filter(key => key.includes(`motto_${userId}_`));
    } catch (error) {
      console.error('[DataIsolation] Get user keys error:', error);
      return [];
    }
  }

  /**
   * Get all keys for a user's namespace
   */
  async getNamespaceKeys(userId: string, namespace: string): Promise<string[]> {
    try {
      const userKeys = await this.getUserKeys(userId);
      return userKeys.filter(key => key.includes(`motto_${userId}_${namespace}_`));
    } catch (error) {
      console.error('[DataIsolation] Get namespace keys error:', error);
      return [];
    }
  }

  /**
   * Delete all data for a user
   */
  async deleteUserData(userId: string): Promise<boolean> {
    try {
      const userKeys = await this.getUserKeys(userId);
      
      console.log(`[DataIsolation] Deleting ${userKeys.length} items for user ${userId}`);

      for (const key of userKeys) {
        await AsyncStorage.removeItem(key);
      }

      this.logAccess('delete', 'all_user_data', true);
      return true;
    } catch (error) {
      console.error('[DataIsolation] Delete user data error:', error);
      return false;
    }
  }

  /**
   * Delete all data in a namespace
   */
  async deleteNamespace(userId: string, namespace: string): Promise<boolean> {
    try {
      const namespaceKeys = await this.getNamespaceKeys(userId, namespace);
      
      console.log(
        `[DataIsolation] Deleting ${namespaceKeys.length} items in namespace ${namespace}`
      );

      for (const key of namespaceKeys) {
        await AsyncStorage.removeItem(key);
      }

      this.logAccess('delete', `namespace_${namespace}`, true);
      return true;
    } catch (error) {
      console.error('[DataIsolation] Delete namespace error:', error);
      return false;
    }
  }

  /**
   * Log access attempt
   */
  private logAccess(
    action: 'read' | 'write' | 'delete',
    resource: string,
    authorized: boolean
  ): void {
    const log: AccessLog = {
      userId: this.currentUserId || 'unknown',
      action,
      resource,
      timestamp: Date.now(),
      authorized,
    };

    this.accessLogs.push(log);

    // Keep only last N logs
    if (this.accessLogs.length > this.MAX_LOGS) {
      this.accessLogs = this.accessLogs.slice(-this.MAX_LOGS);
    }

    // Log unauthorized access
    if (!authorized) {
      console.warn('[DataIsolation] UNAUTHORIZED ACCESS:', log);
    }
  }

  /**
   * Get access logs
   */
  getAccessLogs(userId?: string): AccessLog[] {
    if (userId) {
      return this.accessLogs.filter(log => log.userId === userId);
    }
    return this.accessLogs;
  }

  /**
   * Get unauthorized access attempts
   */
  getUnauthorizedAccess(userId?: string): AccessLog[] {
    return this.getAccessLogs(userId).filter(log => !log.authorized);
  }

  /**
   * Clear access logs
   */
  clearLogs(): void {
    this.accessLogs = [];
  }

  /**
   * Get data isolation report
   */
  async getIsolationReport(userId: string): Promise<{
    totalKeys: number;
    namespaces: Array<{ name: string; keyCount: number }>;
    unauthorizedAttempts: number;
    lastAccess: number;
  }> {
    const userKeys = await this.getUserKeys(userId);
    
    // Extract namespaces
    const namespaceMap = new Map<string, number>();
    userKeys.forEach(key => {
      const parts = key.split('_');
      if (parts.length >= 3) {
        const namespace = parts[2];
        namespaceMap.set(namespace, (namespaceMap.get(namespace) || 0) + 1);
      }
    });

    const namespaces = Array.from(namespaceMap.entries()).map(([name, keyCount]) => ({
      name,
      keyCount,
    }));

    const userLogs = this.getAccessLogs(userId);
    const unauthorizedAttempts = userLogs.filter(log => !log.authorized).length;
    const lastAccess = userLogs.length > 0 ? userLogs[userLogs.length - 1].timestamp : 0;

    return {
      totalKeys: userKeys.length,
      namespaces,
      unauthorizedAttempts,
      lastAccess,
    };
  }

  /**
   * Verify data integrity
   */
  async verifyIntegrity(userId: string): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      const userKeys = await this.getUserKeys(userId);

      for (const key of userKeys) {
        // Check if key format is correct
        if (!key.startsWith(`motto_${userId}_`)) {
          issues.push(`Invalid key format: ${key}`);
        }

        // Check if data is accessible
        try {
          const data = await AsyncStorage.getItem(key);
          if (data === null) {
            issues.push(`Null data for key: ${key}`);
          }
        } catch (e) {
          issues.push(`Cannot read key: ${key}`);
        }
      }

      return {
        valid: issues.length === 0,
        issues,
      };
    } catch (error) {
      return {
        valid: false,
        issues: ['Failed to verify integrity: ' + error],
      };
    }
  }

  /**
   * Clear current user session
   */
  clearSession(): void {
    this.currentUserId = null;
    console.log('[DataIsolation] Session cleared');
  }
}

export default DataIsolationService.getInstance();

