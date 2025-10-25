import {DataService} from '../DataService';

describe('DataService', () => {
  let service: DataService;

  beforeEach(async () => {
    service = DataService.getInstance();
    await service.clear();
  });

  it('should store and retrieve data', async () => {
    await service.set('test-key', {value: 'test'});
    const result = await service.get('test-key');
    expect(result).toEqual({value: 'test'});
  });

  it('should handle non-existent keys', async () => {
    const result = await service.get('non-existent');
    expect(result).toBeNull();
  });

  it('should remove data', async () => {
    await service.set('test-key', 'value');
    await service.remove('test-key');
    const result = await service.get('test-key');
    expect(result).toBeNull();
  });

  it('should handle batch operations', async () => {
    const items = [
      {key: 'key1', value: 'value1'},
      {key: 'key2', value: 'value2'},
    ];
    await service.setMultiple(items);
    const results = await service.getMultiple(['key1', 'key2']);
    expect(results.key1).toBe('value1');
    expect(results.key2).toBe('value2');
  });

  it('should return metrics', () => {
    const metrics = service.getMetrics();
    expect(metrics).toHaveProperty('totalSize');
    expect(metrics).toHaveProperty('itemCount');
  });
});

