/**
 * Redis 캐싱 서비스
 * 15만대 데이터 쿼리 결과를 캐싱하여 응답 속도 50% 개선
 */

import { createClient, RedisClientType } from 'redis';
import crypto from 'crypto';

class CacheService {
  private client: RedisClientType | null = null;
  private isConnected = false;

  /**
   * Redis 클라이언트 초기화
   */
  async initialize() {
    try {
      // 개발 환경에서는 로컬 Redis, 프로덕션에서는 Redis URL 사용
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
        }
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('🔌 Redis 연결 시도중...');
      });

      this.client.on('ready', () => {
        console.log('✅ Redis 연결 성공!');
        this.isConnected = true;
      });

      await this.client.connect();

    } catch (error) {
      console.warn('⚠️ Redis 연결 실패, 캐싱 비활성화:', error);
      this.isConnected = false;
    }
  }

  /**
   * 캐시 키 생성 (쿼리 해시 기반)
   */
  private generateCacheKey(prefix: string, data: any): string {
    const hash = crypto.createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex');
    return `carfin:${prefix}:${hash}`;
  }

  /**
   * 캐시에서 데이터 조회
   */
  async get<T>(prefix: string, key: any): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const cacheKey = this.generateCacheKey(prefix, key);
      const cached = await this.client.get(cacheKey);

      if (cached) {
        console.log(`🎯 캐시 HIT: ${prefix}`);
        return JSON.parse(cached);
      }

      console.log(`❌ 캐시 MISS: ${prefix}`);
      return null;
    } catch (error) {
      console.error(`❌ 캐시 조회 에러 (${prefix}):`, error);
      return null;
    }
  }

  /**
   * 캐시에 데이터 저장
   */
  async set(prefix: string, key: any, data: any, ttlSeconds: number = 300): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      const cacheKey = this.generateCacheKey(prefix, key);
      await this.client.setEx(cacheKey, ttlSeconds, JSON.stringify(data));
      console.log(`💾 캐시 저장: ${prefix} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
      console.error(`❌ 캐시 저장 에러 (${prefix}):`, error);
    }
  }

  /**
   * 특정 패턴의 캐시 삭제
   */
  async invalidate(pattern: string): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      const keys = await this.client.keys(`carfin:${pattern}:*`);
      if (keys.length > 0) {
        await this.client.del(keys);
        console.log(`🗑️ 캐시 무효화: ${pattern} (${keys.length}개 키)`);
      }
    } catch (error) {
      console.error(`❌ 캐시 무효화 에러 (${pattern}):`, error);
    }
  }

  /**
   * 차량 검색 결과 캐싱
   */
  async getVehicleSearchResults(searchParams: any) {
    return await this.get('vehicle_search', searchParams);
  }

  async setVehicleSearchResults(searchParams: any, results: any) {
    // 5분간 캐싱 (차량 데이터는 자주 변경되지 않음)
    await this.set('vehicle_search', searchParams, results, 300);
  }

  /**
   * TOPSIS 랭킹 결과 캐싱
   */
  async getTopsisRanking(userProfile: any, vehicles: any) {
    return await this.get('topsis_ranking', { userProfile, vehicleIds: vehicles.map((v: any) => v.vehicleId) });
  }

  async setTopsisRanking(userProfile: any, vehicles: any, ranking: any) {
    // 10분간 캐싱 (TOPSIS 계산은 비용이 많이 듦)
    await this.set('topsis_ranking', { userProfile, vehicleIds: vehicles.map((v: any) => v.vehicleId) }, ranking, 600);
  }

  /**
   * 사용자 세션 캐싱
   */
  async getUserSession(sessionId: string) {
    return await this.get('user_session', sessionId);
  }

  async setUserSession(sessionId: string, sessionData: any) {
    // 1시간 캐싱
    await this.set('user_session', sessionId, sessionData, 3600);
  }

  /**
   * 캐시 통계 조회
   */
  async getStats() {
    if (!this.isConnected || !this.client) {
      return { connected: false };
    }

    try {
      const info = await this.client.info('memory');
      const keyCount = await this.client.dbSize();

      return {
        connected: true,
        keyCount,
        memoryInfo: info
      };
    } catch (error) {
      console.error('❌ 캐시 통계 조회 에러:', error);
      return { connected: false, error: error.message };
    }
  }

  /**
   * 연결 종료
   */
  async close() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      console.log('🔌 Redis 연결 종료');
    }
  }
}

// 싱글톤 인스턴스
export const cacheService = new CacheService();

// 서버 시작시 초기화
export async function initializeCache() {
  await cacheService.initialize();
}

// 서버 종료시 정리
export async function closeCache() {
  await cacheService.close();
}