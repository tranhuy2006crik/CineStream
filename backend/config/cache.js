/**
 * Simple cache layer — uses Redis when REDIS_URL is set, otherwise in-memory Map.
 */
const memoryCache = new Map();
let redisClient = null;

export async function initCache() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.log('ℹ️  Redis not configured — using in-memory cache');
    return;
  }
  try {
    const { createClient } = await import('redis');
    redisClient = createClient({ url: redisUrl });
    redisClient.on('error', (err) => console.error('Redis error:', err.message));
    await redisClient.connect();
    console.log('✅ Connected to Redis');
  } catch (err) {
    console.warn('⚠️  Redis unavailable, falling back to in-memory cache:', err.message);
    redisClient = null;
  }
}

export async function cacheGet(key) {
  if (redisClient) {
    const val = await redisClient.get(key);
    return val ? JSON.parse(val) : null;
  }
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt < Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

export async function cacheSet(key, value, ttlSeconds = 300) {
  if (redisClient) {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    return;
  }
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000
  });
}

export async function cacheDel(pattern) {
  if (redisClient) {
    const keys = await redisClient.keys(pattern);
    if (keys.length) await redisClient.del(keys);
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern.replace('*', ''))) memoryCache.delete(key);
  }
}

export function cacheMiddleware(keyPrefix, ttlSeconds = 300) {
  return async (req, res, next) => {
    const cacheKey = `${keyPrefix}:${req.originalUrl}`;
    try {
      const cached = await cacheGet(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached);
      }
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        cacheSet(cacheKey, body, ttlSeconds).catch(() => {});
        res.setHeader('X-Cache', 'MISS');
        return originalJson(body);
      };
    } catch {
      // continue without cache
    }
    next();
  };
}
