export interface ErrorLog {
  timestamp: Date;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export class ErrorLogger {
  private static logs: ErrorLog[] = [];
  private static maxLogs = 1000;

  static log(level: ErrorLog['level'], message: string, context?: Record<string, any>, error?: Error) {
    const errorLog: ErrorLog = {
      timestamp: new Date(),
      level,
      message,
      context,
      stack: error?.stack,
    };

    this.logs.push(errorLog);

    // 최대 로그 개수 제한
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // 콘솔 출력
    this.printLog(errorLog, error);

    // 프로덕션 환경에서는 외부 서비스로 전송 가능
    if (process.env.NODE_ENV === 'production' && level === 'error') {
      this.sendToExternalService(errorLog);
    }
  }

  static error(message: string, error?: Error, context?: Record<string, any>) {
    this.log('error', message, context, error);
  }

  static warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  static info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  static getLogs(level?: ErrorLog['level'], limit = 100): ErrorLog[] {
    let filtered = this.logs;

    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }

    return filtered.slice(-limit);
  }

  static clearLogs() {
    this.logs = [];
  }

  static getStats() {
    const totalLogs = this.logs.length;
    const errors = this.logs.filter(log => log.level === 'error').length;
    const warnings = this.logs.filter(log => log.level === 'warn').length;
    const infos = this.logs.filter(log => log.level === 'info').length;

    return {
      totalLogs,
      errors,
      warnings,
      infos,
      errorRate: totalLogs > 0 ? errors / totalLogs : 0,
    };
  }

  private static printLog(log: ErrorLog, error?: Error) {
    const timestamp = log.timestamp.toISOString();
    const prefix = `[${timestamp}] [${log.level.toUpperCase()}]`;

    switch (log.level) {
      case 'error':
        console.error(`${prefix} ${log.message}`, log.context || '');
        if (error) {
          console.error('Stack trace:', error.stack);
        }
        break;
      case 'warn':
        console.warn(`${prefix} ${log.message}`, log.context || '');
        break;
      case 'info':
        console.log(`${prefix} ${log.message}`, log.context || '');
        break;
    }
  }

  private static sendToExternalService(log: ErrorLog) {
    // Sentry, Datadog, CloudWatch 등 외부 서비스 전송
    // 현재는 스텁 구현
    if (process.env.SENTRY_DSN) {
      // TODO: Sentry.captureException()
    }
  }
}

// 전역 에러 핸들러
export function setupGlobalErrorHandlers() {
  // Node.js uncaughtException
  process.on('uncaughtException', (error: Error) => {
    ErrorLogger.error('Uncaught Exception', error, { fatal: true });
    console.error('💥 FATAL ERROR - Uncaught Exception:', error);
    process.exit(1);
  });

  // Node.js unhandledRejection
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    ErrorLogger.error('Unhandled Promise Rejection', reason instanceof Error ? reason : new Error(String(reason)), {
      promise: promise.toString(),
    });
    console.error('⚠️ Unhandled Promise Rejection:', reason);
  });

  // Warning 핸들러
  process.on('warning', (warning) => {
    ErrorLogger.warn(warning.message, {
      name: warning.name,
      stack: warning.stack,
    });
  });

  console.log('✅ Global error handlers initialized');
}
