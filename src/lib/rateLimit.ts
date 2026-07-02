// Basit in-memory rate limiter (Tek instance icin gecerli - Vercel Edge'de ideal degildir ama dev/test icin yeterli)
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(userId: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = requestCounts.get(userId);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(userId, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
