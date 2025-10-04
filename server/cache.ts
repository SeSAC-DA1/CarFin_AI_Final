import Redis from 'ioredis';
import fs from 'fs';

const redisEnabled = process.env.REDIS_URL || process.env.ELASTICACHE_ENDPOINT;

let redis: Redis | null = null;

if (redisEnabled) {
  const redisUrl = process.env.REDIS_URL;
  const elasticacheEndpoint = process.env.ELASTICACHE_ENDPOINT;
  
  if (redisUrl) {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });
    console.log('✅ Redis 연결 완료 (URL)');
  } else if (elasticacheEndpoint) {
    const [host, port] = elasticacheEndpoint.split(':');
    
    const tlsConfig = process.env.ELASTICACHE_TLS === 'true' 
      ? {
          rejectUnauthorized: true,
          ca: process.env.ELASTICACHE_CA_CERT ? fs.readFileSync(process.env.ELASTICACHE_CA_CERT, 'utf8') : undefined,
        }
      : undefined;
    
    redis = new Redis({
      host,
      port: parseInt(port || '6379'),
      tls: tlsConfig,
      password: process.env.ELASTICACHE_PASSWORD,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });
    console.log('✅ ElastiCache Valkey 연결 완료 (TLS 검증: ' + (tlsConfig ? 'ON' : 'OFF') + ')');
  }

  redis?.on('error', (err) => {
    console.error('❌ Redis/ElastiCache 연결 오류:', err);
  });

  redis?.on('connect', () => {
    console.log('🔄 Redis/ElastiCache 재연결 성공');
  });
} else {
  console.log('ℹ️  캐시 비활성화 (REDIS_URL 또는 ELASTICACHE_ENDPOINT 없음)');
}

export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    return null;
  } catch (error) {
    console.error('캐시 조회 실패:', error);
    return null;
  }
}

export async function setCache(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
  if (!redis) return;
  
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    console.error('캐시 저장 실패:', error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  if (!redis) return;
  
  try {
    await redis.del(key);
  } catch (error) {
    console.error('캐시 삭제 실패:', error);
  }
}

export async function clearCachePattern(pattern: string): Promise<void> {
  if (!redis) return;
  
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('캐시 패턴 삭제 실패:', error);
  }
}

export { redis };
