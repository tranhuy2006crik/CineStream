/**
 * In-memory cache with TTL. Falls back gracefully when Redis is unavailable.
 * Set REDIS_URL in env to use Redis in future — for now uses Map-based cache.
 */
const store = new Map();

export const cacheGet = (key) => {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
};

export const cacheSet = (key, value, ttlSeconds = 300) => {
  store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
};

export const cacheDel = (key) => store.delete(key);

export const cacheMiddleware = (keyFn, ttlSeconds = 300) => (req, res, next) => {
  const key = keyFn(req);
  const cached = cacheGet(key);
  if (cached) return res.json(cached);
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    cacheSet(key, body, ttlSeconds);
    return originalJson(body);
  };
  next();
};
