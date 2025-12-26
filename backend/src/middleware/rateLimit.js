import { kv } from '@vercel/kv';

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 3; // 3 attempts per hour

export async function rateLimit(ip) {
  const key = `rate_limit:${ip}`;
  const now = Date.now();
  
  try {
    const requests = await kv.get(key);
    const windowStart = now - RATE_LIMIT_WINDOW;
    
    if (!requests) {
      await kv.set(key, JSON.stringify([{ timestamp: now }]), { px: RATE_LIMIT_WINDOW });
      return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
    }
    
    const parsedRequests = JSON.parse(requests);
    const validRequests = parsedRequests.filter(req => req.timestamp > windowStart);
    
    if (validRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
      return { 
        allowed: false, 
        remaining: 0,
        resetTime: validRequests[0].timestamp + RATE_LIMIT_WINDOW
      };
    }
    
    validRequests.push({ timestamp: now });
    await kv.set(key, JSON.stringify(validRequests), { px: RATE_LIMIT_WINDOW });
    
    return { 
      allowed: true, 
      remaining: RATE_LIMIT_MAX_REQUESTS - validRequests.length 
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }
}
