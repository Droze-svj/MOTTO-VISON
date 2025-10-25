/**
 * Data Service
 * Consolidates: DataManager, CacheService, StorageService, SyncService,
 * and 15+ data-related services
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  priority?: 'low' | 'medium' | 'high';
}

interface StorageMetrics {
  totalSize: number;
  itemCount: number;
  cacheHitRate: number;
}

export class DataService {
  private static instance: DataService;
  private cache: Map<string, {value: any; expiry: number; priority: string}>;
  private metrics: StorageMetrics;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.cache = new Map();
    this.metrics = {
      totalSize: 0,
      itemCount: 0,
      cacheHitRate: 0
    };
    this.startCleanupJob();
  }

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // ============================================
  // Storage Operations
  // ============================================

  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await AsyncStorage.setItem(key, serialized);
      
      // Add to in-memory cache
      const ttl = options?.ttl || this.DEFAULT_TTL;
      this.cache.set(key, {
        value,
        expiry: Date.now() + ttl,
        priority: options?.priority || 'medium'
      });
      
      this.metrics.itemCount++;
    } catch (error) {
      console.error(`Storage error for key ${key}:`, error);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      this.metrics.cacheHitRate = (this.metrics.cacheHitRate * 0.9) + (1 * 0.1);
      return cached.value as T;
    }

    // Check persistent storage
    try {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        const parsed = JSON.parse(value) as T;
        // Refresh cache
        this.cache.set(key, {
          value: parsed,
          expiry: Date.now() + this.DEFAULT_TTL,
          priority: 'medium'
        });
        return parsed;
      }
    } catch (error) {
      console.error(`Retrieval error for key ${key}:`, error);
    }

    this.metrics.cacheHitRate = (this.metrics.cacheHitRate * 0.9);
    return null;
  }

  async remove(key: string): Promise<void> {
    this.cache.delete(key);
    await AsyncStorage.removeItem(key);
    this.metrics.itemCount = Math.max(0, this.metrics.itemCount - 1);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    await AsyncStorage.clear();
    this.metrics.itemCount = 0;
  }

  // ============================================
  // Batch Operations
  // ============================================

  async setMultiple(items: Array<{key: string; value: any}>): Promise<void> {
    const pairs: Array<[string, string]> = items.map(({key, value}) => [
      key,
      JSON.stringify(value)
    ]);
    await AsyncStorage.multiSet(pairs);
    
    items.forEach(({key, value}) => {
      this.cache.set(key, {
        value,
        expiry: Date.now() + this.DEFAULT_TTL,
        priority: 'medium'
      });
    });
  }

  async getMultiple<T>(keys: string[]): Promise<Record<string, T | null>> {
    const result: Record<string, T | null> = {};
    const pairs = await AsyncStorage.multiGet(keys);
    
    pairs.forEach(([key, value]) => {
      if (value) {
        try {
          result[key] = JSON.parse(value) as T;
        } catch {
          result[key] = null;
        }
      } else {
        result[key] = null;
      }
    });
    
    return result;
  }

  // ============================================
  // Query Operations
  // ============================================

  async getAllKeys(): Promise<string[]> {
    return await AsyncStorage.getAllKeys();
  }

  async searchByPrefix(prefix: string): Promise<Array<{key: string; value: any}>> {
    const allKeys = await this.getAllKeys();
    const matchingKeys = allKeys.filter(key => key.startsWith(prefix));
    
    const results: Array<{key: string; value: any}> = [];
    for (const key of matchingKeys) {
      const value = await this.get(key);
      if (value !== null) {
        results.push({key, value});
      }
    }
    
    return results;
  }

  // ============================================
  // Cache Management
  // ============================================

  invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    // Remove matching keys
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private startCleanupJob(): void {
    // Clean up expired cache entries every minute
    setInterval(() => {
      const now = Date.now();
      this.cache.forEach((value, key) => {
        if (value.expiry < now) {
          this.cache.delete(key);
        }
      });
    }, 60 * 1000);
  }

  // ============================================
  // Metrics & Monitoring
  // ============================================

  getMetrics(): StorageMetrics {
    return {
      ...this.metrics,
      totalSize: this.cache.size
    };
  }

  async getStorageSize(): Promise<number> {
    const keys = await this.getAllKeys();
    let totalSize = 0;
    
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        totalSize += value.length;
      }
    }
    
    return totalSize;
  }

  // ============================================
  // Data Validation
  // ============================================

  validateData<T>(data: any, schema: any): data is T {
    // Simple validation - can be enhanced with JSON Schema
    if (!data || typeof data !== 'object') return false;
    
    for (const [key, type] of Object.entries(schema)) {
      if (!(key in data) || typeof data[key] !== type) {
        return false;
      }
    }
    
    return true;
  }

  // ============================================
  // Backup & Restore
  // ============================================

  async exportData(): Promise<string> {
    const keys = await this.getAllKeys();
    const data: Record<string, any> = {};
    
    for (const key of keys) {
      const value = await this.get(key);
      if (value !== null) {
        data[key] = value;
      }
    }
    
    return JSON.stringify(data);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    const items = Object.entries(data).map(([key, value]) => ({key, value}));
    await this.setMultiple(items);
  }
}

export default DataService.getInstance();

