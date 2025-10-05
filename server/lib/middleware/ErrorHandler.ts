/**
 * 글로벌 에러 핸들러 및 안정성 강화 미들웨어
 */

import { Request, Response, NextFunction } from 'express';
import { railwayRedisService } from '../cache/RailwayRedisService';

interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

interface ErrorLog {
  timestamp: string;
  error: string;
  stack?: string;
  requestUrl?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
}

class ErrorHandler {
  private errorLogs: ErrorLog[] = [];
  private maxErrorLogs = 100;

  /**
   * Express 에러 처리 미들웨어
   */
  handleError(err: ErrorWithStatus, req: Request, res: Response, next: NextFunction): void {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // 에러 로그 저장
    this.logError(err, req);

    // 개발 환경에서는 상세 에러 정보 반환
    if (process.env.NODE_ENV === 'development') {
      res.status(status).json({
        error: message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
    } else {
      // 프로덕션에서는 안전한 에러 메시지만 반환
      res.status(status).json({
        error: status >= 500 ? 'Internal Server Error' : message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 404 처리 미들웨어
   */
  handleNotFound(req: Request, res: Response): void {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.path} not found`,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 요청 타임아웃 미들웨어
   */
  requestTimeout(timeoutMs: number = 30000) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          res.status(408).json({
            error: 'Request Timeout',
            message: `Request exceeded ${timeoutMs}ms timeout`,
            timestamp: new Date().toISOString()
          });
        }
      }, timeoutMs);

      res.on('finish', () => {
        clearTimeout(timeout);
      });

      next();
    };
  }

  /**
   * 요청 크기 제한 에러 처리
   */
  handlePayloadTooLarge(err: any, req: Request, res: Response, next: NextFunction): void {
    if (err.type === 'entity.too.large') {
      res.status(413).json({
        error: 'Payload Too Large',
        message: 'Request payload exceeds the maximum allowed size',
        timestamp: new Date().toISOString()
      });
      return;
    }
    next(err);
  }

  /**
   * 에러 로깅
   */
  private logError(err: Error, req?: Request): void {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      error: err.message,
      stack: err.stack,
      requestUrl: req?.url,
      method: req?.method,
      userAgent: req?.get('User-Agent'),
      ip: req?.ip || req?.connection?.remoteAddress
    };

    this.errorLogs.unshift(errorLog);

    // 최대 로그 수 제한
    if (this.errorLogs.length > this.maxErrorLogs) {
      this.errorLogs = this.errorLogs.slice(0, this.maxErrorLogs);
    }

    // 콘솔에 에러 출력
    console.error('🚨 Error Handler:', {
      message: err.message,
      url: req?.url,
      method: req?.method,
      timestamp: errorLog.timestamp
    });

    // Redis에 에러 로그 저장 (선택사항)
    this.saveErrorToCache(errorLog);
  }

  /**
   * Redis에 에러 로그 저장
   */
  private async saveErrorToCache(errorLog: ErrorLog): Promise<void> {
    try {
      if (railwayRedisService.isHealthy()) {
        const key = `error_log:${Date.now()}`;
        // 에러 로그는 24시간 보관
        await railwayRedisService['set'](key, errorLog, 86400, 'error_log');
      }
    } catch (error) {
      // 에러 로그 저장 실패는 무시 (무한 루프 방지)
      console.warn('⚠️ Failed to save error log to cache:', error);
    }
  }

  /**
   * 최근 에러 로그 조회
   */
  getRecentErrors(limit: number = 10): ErrorLog[] {
    return this.errorLogs.slice(0, limit);
  }

  /**
   * 에러 통계 조회
   */
  getErrorStats(): { totalErrors: number; recentErrors: number; topErrors: Array<{ error: string; count: number }> } {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    const recentErrors = this.errorLogs.filter(log =>
      new Date(log.timestamp).getTime() > oneHourAgo
    ).length;

    // 에러 메시지별 카운트
    const errorCounts = new Map<string, number>();
    this.errorLogs.forEach(log => {
      const error = log.error;
      errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
    });

    const topErrors = Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalErrors: this.errorLogs.length,
      recentErrors,
      topErrors
    };
  }
}

// 프로세스 레벨 에러 처리
export function setupProcessErrorHandlers(): void {
  // 처리되지 않은 Promise 거부
  process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);

    // Railway Redis 연결 종료
    railwayRedisService.close().finally(() => {
      process.exit(1);
    });
  });

  // 처리되지 않은 예외
  process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);

    // Railway Redis 연결 종료
    railwayRedisService.close().finally(() => {
      process.exit(1);
    });
  });

  // 프로세스 종료 시그널 처리
  process.on('SIGINT', () => {
    console.log('🔄 Received SIGINT, gracefully shutting down...');
    gracefulShutdown();
  });

  process.on('SIGTERM', () => {
    console.log('🔄 Received SIGTERM, gracefully shutting down...');
    gracefulShutdown();
  });
}

/**
 * 안전한 서버 종료
 */
async function gracefulShutdown(): Promise<void> {
  try {
    console.log('🔄 Starting graceful shutdown...');

    // Redis 연결 종료
    await railwayRedisService.close();
    console.log('✅ Redis connections closed');

    // 추가 정리 작업이 있다면 여기에 추가

    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
}

export const errorHandler = new ErrorHandler();