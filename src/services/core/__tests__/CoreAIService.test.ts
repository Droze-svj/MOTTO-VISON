import {CoreAIService} from '../CoreAIService';

describe('CoreAIService', () => {
  let service: CoreAIService;

  beforeEach(() => {
    service = CoreAIService.getInstance();
  });

  it('should be a singleton', () => {
    const instance1 = CoreAIService.getInstance();
    const instance2 = CoreAIService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should initialize without API key', async () => {
    await service.initialize();
    const health = await service.getHealth();
    expect(health.status).toBe('degraded');
    expect(health.apiConfigured).toBe(false);
  });

  it('should handle chat without API key (fallback)', async () => {
    const response = await service.chat('Hello');
    expect(response).toBeTruthy();
    expect(typeof response).toBe('string');
  });

  it('should analyze text correctly', async () => {
    const result = await service.analyzeText('How do I code in Python?');
    expect(result.intent).toBe('coding');
    expect(result.sentiment).toBeTruthy();
  });

  it('should generate embeddings', async () => {
    const embedding = await service.generateEmbedding('test text');
    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding.length).toBeGreaterThan(0);
  });
});

