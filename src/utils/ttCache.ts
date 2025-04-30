// src/utils/ttCache.ts

const ttCache: Map<string, { tt: number; timestamp: number }> = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * 🧠 Cache TT value for a user
 */
export function cacheTimeTravels(userId: string, tt: number): void {
  ttCache.set(userId, {
    tt,
    timestamp: Date.now()
  });
}

/**
 * 🕰️ Retrieve cached TT value, or null if expired
 */
export function getCachedTimeTravels(userId: string): number | null {
  const data = ttCache.get(userId);
  if (!data) return null;

  const age = Date.now() - data.timestamp;
  if (age > CACHE_TTL_MS) {
    ttCache.delete(userId); // 🔥 Expired
    return null;
  }

  return data.tt;
}

/**
 * 🧹 Clear the entire TT cache
 */
export function clearTTCache(): void {
  ttCache.clear();
}