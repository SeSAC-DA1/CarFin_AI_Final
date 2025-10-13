/**
 * Railway Redis 최적화 캐시 서비스
 * CARFIN AI 전용 고성능 캐싱 시스템
 */

import { createClient, RedisClientType } from 'redis';
import { createHash } from 'crypto';

interface CacheStats {
  hits: number;
  misses: number;
  errors: number;
  totalRequests: number;
  avgResponseTime: number;
}

interface CacheConfig {
  defaultTTL: number;
  maxRetries: number;
  timeout: number;
  enableCompression: boolean;
  enableMetrics: boolean;
}

class RailwayRedisService {
  private client: RedisClientType | null = null;
  private isConnected = false;
  private stats: CacheStats;
  private config: CacheConfig;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalRequests: 0,
      avgResponseTime: 0
    };

    this.config = {
      defaultTTL: 300, // 5분
      maxRetries: 3,
      timeout: 5000,
      enableCompression: false, // Railway Redis는 압축 불필요
      enableMetrics: true
    };
  }

  /**
   * Railway Redis 연결 초기화
   */
  async initialize(): Promise<void> {
    try {
      // Railway Redis URL 확인
      const redisUrl = process.env.REDIS_URL;

      if (!redisUrl) {
        console.log('🟡 REDIS_URL 없음 - 캐시 없이 동작');
        return;
      }

      // Railway Redis 최적화 설정
      this.client = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: this.config.timeout,
          reconnectDelayOnFailover: 100,
          reconnectStrategy: (retries) => {
            if (retries > this.config.maxRetries) {
              console.error(`❌ Redis 재연결 포기 (${retries}회 시도)`);
              return false;
            }
            const delay = Math.min(retries * 100, 2000);
            console.log(`🔄 Redis 재연결 시도 ${retries}회 (${delay}ms 후)`);
            return delay;
          }
        },
        // Railway Redis 최적화
        isolationPoolOptions: {
          min: 2,
          max: 10
        }
      });

      // 이벤트 핸들러 설정
      this.setupEventHandlers();

      // 연결 시도
      await this.client.connect();

      // 연결 테스트
      await this.client.ping();

      this.isConnected = true;
      console.log('✅ Railway Redis 연결 성공!');

      // 헬스체크 시작
      this.startHealthCheck();

      // 시작 시 캐시 정리
      await this.cleanupExpiredKeys();

    } catch (error) {
      console.error('❌ Railway Redis 초기화 실패:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * 이벤트 핸들러 설정
   */
  private setupEventHandlers(): void {
    if (!this.client) return;

    this.client.on('error', (err) => {
      console.error('❌ Railway Redis 에러:', err);
      this.stats.errors++;
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('🔌 Railway Redis 연결 중...');
    });

    this.client.on('ready', () => {
      console.log('✅ Railway Redis 준비 완료');
      this.isConnected = true;
    });

    this.client.on('reconnecting', () => {
      console.log('🔄 Railway Redis 재연결 중...');
      this.isConnected = false;
    });

    this.client.on('end', () => {
      console.log('🔌 Railway Redis 연결 종료');
      this.isConnected = false;
    });
  }

  /**
   * 헬스체크 시작
   */
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        if (this.client && this.isConnected) {
          await this.client.ping();
        }
      } catch (error) {
        console.error('❌ Railway Redis 헬스체크 실패:', error);
        this.isConnected = false;
      }
    }, 30000); // 30초마다 헬스체크
  }

  /**
   * 차량 검색 결과 캐싱
   */
  async getVehicleSearchResults(searchParams: any): Promise<any[] | null> {
    const key = this.generateSearchKey(searchParams);
    return await this.get(key, 'vehicle_search');
  }

  async setVehicleSearchResults(searchParams: any, vehicles: any[], ttl = 600): Promise<void> {
    const key = this.generateSearchKey(searchParams);
    await this.set(key, vehicles, ttl, 'vehicle_search');
  }

  /**
   * TOPSIS 랭킹 캐싱
   */
  async getTopsisRanking(userProfile: any, vehicles: any[]): Promise<any | null> {
    const key = this.generateTopsisKey(userProfile, vehicles);
    return await this.get(key, 'topsis_ranking');
  }

  async setTopsisRanking(userProfile: any, vehicles: any[], ranking: any, ttl = 300): Promise<void> {
    const key = this.generateTopsisKey(userProfile, vehicles);
    await this.set(key, ranking, ttl, 'topsis_ranking');
  }

  /**
   * AI 응답 캐싱
   */
  async getAIResponse(userMessage: string, context: any): Promise<string | null> {
    const key = this.generateAIKey(userMessage, context);
    return await this.get(key, 'ai_response');
  }

  async setAIResponse(userMessage: string, context: any, response: string, ttl = 1800): Promise<void> {
    const key = this.generateAIKey(userMessage, context);
    await this.set(key, response, ttl, 'ai_response');
  }

  /**
   * 세션 데이터 캐싱
   */
  async getSession(sessionId: string): Promise<any | null> {
    const key = `session:${sessionId}`;
    return await this.get(key, 'session');
  }

  async setSession(sessionId: string, sessionData: any, ttl = 3600): Promise<void> {
    const key = `session:${sessionId}`;
    await this.set(key, sessionData, ttl, 'session');
  }

  /**
   * 범용 GET 메서드
   */
  private async get<T>(key: string, category: string): Promise<T | null> {
    if (!this.isConnected || !this.client) return null;

    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      const cached = await this.client.get(key);
      const responseTime = Date.now() - startTime;
      this.updateResponseTime(responseTime);

      if (cached) {
        this.stats.hits++;
        console.log(`🎯 캐시 HIT [${category}]: ${key.substring(0, 50)}... (${responseTime}ms)`);
        return JSON.parse(cached) as T;
      } else {
        this.stats.misses++;
        console.log(`🔍 캐시 MISS [${category}]: ${key.substring(0, 50)}... (${responseTime}ms)`);
        return null;
      }
    } catch (error) {
      this.stats.errors++;
      console.error(`❌ 캐시 조회 실패 [${category}]:`, error);
      return null;
    }
  }

  /**
   * 범용 SET 메서드
   */
  private async set(key: string, value: any, ttl: number, category: string): Promise<void> {
    if (!this.isConnected || !this.client) return;

    try {
      const serialized = JSON.stringify(value);
      await this.client.setEx(key, ttl, serialized);
      console.log(`💾 캐시 저장 [${category}]: ${key.substring(0, 50)}... (TTL: ${ttl}s, Size: ${(serialized.length / 1024).toFixed(1)}KB)`);
    } catch (error) {
      this.stats.errors++;
      console.error(`❌ 캐시 저장 실패 [${category}]:`, error);
    }
  }

  /**
   * 키 생성 메서드들
   */
  private generateSearchKey(searchParams: any): string {
    const normalized = {
      ...searchParams,
      timestamp: Math.floor(Date.now() / (5 * 60 * 1000)) // 5분 단위로 키 생성
    };
    const hash = createHash('md5').update(JSON.stringify(normalized)).digest('hex');
    return `search:${hash}`;
  }

  private generateTopsisKey(userProfile: any, vehicles: any[]): string {
    const key = {
      profile: userProfile,
      vehicleCount: vehicles.length,
      vehicleIds: vehicles.slice(0, 10).map(v => v.vehicleId).sort()
    };
    const hash = createHash('md5').update(JSON.stringify(key)).digest('hex');
    return `topsis:${hash}`;
  }

  private generateAIKey(userMessage: string, context: any): string {
    const key = {
      message: userMessage.toLowerCase().trim(),
      contextHash: createHash('md5').update(JSON.stringify(context)).digest('hex').substring(0, 8)
    };
    const hash = createHash('md5').update(JSON.stringify(key)).digest('hex');
    return `ai:${hash}`;
  }

  /**
   * 성능 모니터링
   */
  private updateResponseTime(responseTime: number): void {
    this.stats.avgResponseTime = (this.stats.avgResponseTime + responseTime) / 2;
  }

  /**
   * 통계 조회
   */
  getStats(): CacheStats & { hitRate: number; connectionStatus: boolean } {
    const hitRate = this.stats.totalRequests > 0
      ? (this.stats.hits / this.stats.totalRequests * 100)
      : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      connectionStatus: this.isConnected
    };
  }

  /**
   * 만료된 키 정리
   */
  private async cleanupExpiredKeys(): Promise<void> {
    if (!this.isConnected || !this.client) return;

    try {
      // 만료 예정 키들을 찾아서 정리
      const patterns = ['search:*', 'topsis:*', 'ai:*', 'session:*'];

      for (const pattern of patterns) {
        const keys = await this.client.keys(pattern);
        if (keys.length > 100) { // 100개 이상 키가 있으면 일부 정리
          const oldKeys = keys.slice(0, 50);
          if (oldKeys.length > 0) {
            await this.client.del(oldKeys);
            console.log(`🧹 캐시 정리: ${oldKeys.length}개 키 삭제`);
          }
        }
      }
    } catch (error) {
      console.error('❌ 캐시 정리 실패:', error);
    }
  }

  /**
   * 연결 종료
   */
  async close(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    if (this.client && this.isConnected) {
      await this.client.quit();
      console.log('🔌 Railway Redis 연결 종료');
    }
  }

  /**
   * 강제 캐시 클리어
   */
  async clearAll(): Promise<void> {
    if (!this.isConnected || !this.client) return;

    try {
      await this.client.flushAll();
      console.log('🧹 전체 캐시 클리어 완료');
    } catch (error) {
      console.error('❌ 캐시 클리어 실패:', error);
    }
  }

  /**
   * 연결 상태 확인
   */
  isHealthy(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * 🆕 Phase 3: 추천 결과 캐싱
   */
  async getRecommendationCache(key: string): Promise<any | null> {
    try {
      const cached = await this.get<any>(key, 'recommendation');
      if (cached) {
        console.log('💾 추천 캐시 히트!', key.substring(0, 60));
        return cached;
      }
      return null;
    } catch (error) {
      console.warn('Redis 추천 캐시 조회 실패 (무시):', error);
      return null;
    }
  }

  async setRecommendationCache(key: string, value: any, ttl: number = 600): Promise<void> {
    try {
      await this.set(key, value, ttl, 'recommendation');
      console.log(`💾 추천 캐시 저장 완료 (TTL: ${ttl}s)`, key.substring(0, 60));
    } catch (error) {
      console.warn('Redis 추천 캐시 저장 실패 (무시):', error);
      // Graceful degradation - 캐시 실패해도 추천은 진행
    }
  }
}

// 싱글톤 인스턴스
export const railwayRedisService = new RailwayRedisService();

// 프로세스 종료 시 정리
process.on('SIGINT', async () => {
  console.log('🔄 Railway Redis 서비스 종료 중...');
  await railwayRedisService.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Railway Redis 서비스 종료 중...');
  await railwayRedisService.close();
  process.exit(0);
});