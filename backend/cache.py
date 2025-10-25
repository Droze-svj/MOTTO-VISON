import aioredis
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis = aioredis.from_url(REDIS_URL, decode_responses=True)

async def cache_get(key):
    return await redis.get(key)

async def cache_set(key, value, expire=60):
    await redis.set(key, value, ex=expire) 