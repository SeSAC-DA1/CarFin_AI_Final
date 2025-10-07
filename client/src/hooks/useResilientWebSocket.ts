// 🔄 고급 WebSocket 연결 관리 시스템 (교육/공모전용 고도화)
import { useState, useEffect, useCallback, useRef } from 'react';

interface ConnectionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'failed';
  lastConnectedAt?: Date;
  connectionCount: number;
  reconnectionAttempts: number;
  latency: number;
}

interface ExponentialBackoff {
  baseDelay: number;
  maxDelay: number;
  factor: number;
  jitter: boolean;
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  halfOpenRetryDelay: number;
}

interface ResilientWebSocketConfig {
  url: string;
  backoff: ExponentialBackoff;
  circuitBreaker: CircuitBreakerConfig;
  maxReconnectionAttempts: number;
  heartbeatInterval: number;
  connectionTimeout: number;
}

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp: Date;
}

type CircuitBreakerState = 'closed' | 'open' | 'half_open';

const DEFAULT_CONFIG: Omit<ResilientWebSocketConfig, 'url'> = {
  backoff: {
    baseDelay: 1000,     // 1초 시작
    maxDelay: 30000,     // 최대 30초
    factor: 1.5,         // 1.5배씩 증가
    jitter: true         // 랜덤 지연 추가
  },
  circuitBreaker: {
    failureThreshold: 5,     // 5번 실패 시 차단
    recoveryTimeout: 60000,  // 60초 후 재시도
    halfOpenRetryDelay: 5000 // 반개방 상태에서 5초 대기
  },
  maxReconnectionAttempts: 20,
  heartbeatInterval: 30000,    // 30초마다 핑
  connectionTimeout: 10000     // 10초 연결 타임아웃
};

export function useResilientWebSocket(url: string, config?: Partial<ResilientWebSocketConfig>) {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
    connectionCount: 0,
    reconnectionAttempts: 0,
    latency: 0
  });

  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [lastError, setLastError] = useState<Error | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const circuitBreakerStateRef = useRef<CircuitBreakerState>('closed');
  const lastFailureTimeRef = useRef<number>(0);
  const pingStartTimeRef = useRef<number>(0);

  const finalConfig = { ...DEFAULT_CONFIG, ...config, url };

  // 🎯 지수 백오프 계산 (지터 포함)
  const calculateBackoffDelay = useCallback((attempt: number): number => {
    const { baseDelay, maxDelay, factor, jitter } = finalConfig.backoff;
    let delay = Math.min(baseDelay * Math.pow(factor, attempt), maxDelay);

    if (jitter) {
      // ±25% 랜덤 지터 추가
      const jitterRange = delay * 0.25;
      delay += (Math.random() - 0.5) * 2 * jitterRange;
    }

    return Math.max(delay, baseDelay);
  }, [finalConfig.backoff]);

  // 🔐 서킷 브레이커 상태 확인
  const checkCircuitBreaker = useCallback((): boolean => {
    const now = Date.now();
    const { failureThreshold, recoveryTimeout } = finalConfig.circuitBreaker;

    switch (circuitBreakerStateRef.current) {
      case 'closed':
        return true;

      case 'open':
        if (now - lastFailureTimeRef.current > recoveryTimeout) {
          console.log('🔄 Circuit Breaker: 반개방 상태로 전환');
          circuitBreakerStateRef.current = 'half_open';
          return true;
        }
        return false;

      case 'half_open':
        return true;

      default:
        return false;
    }
  }, [finalConfig.circuitBreaker]);

  // 📊 연결 실패 처리
  const handleConnectionFailure = useCallback(() => {
    const { failureThreshold } = finalConfig.circuitBreaker;
    lastFailureTimeRef.current = Date.now();

    if (circuitBreakerStateRef.current === 'half_open') {
      console.log('🚨 Circuit Breaker: 반개방 상태에서 실패 - 다시 개방');
      circuitBreakerStateRef.current = 'open';
    } else if (connectionState.reconnectionAttempts >= failureThreshold) {
      console.log('🚨 Circuit Breaker: 임계치 도달 - 개방 상태로 전환');
      circuitBreakerStateRef.current = 'open';
    }
  }, [finalConfig.circuitBreaker, connectionState.reconnectionAttempts]);

  // 💗 하트비트 (연결 상태 모니터링)
  const startHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }

    heartbeatTimeoutRef.current = setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        pingStartTimeRef.current = performance.now();
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
      startHeartbeat(); // 재귀적으로 하트비트 유지
    }, finalConfig.heartbeatInterval);
  }, [finalConfig.heartbeatInterval]);

  // 🔗 WebSocket 연결 설정
  const setupWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(finalConfig.url);
    wsRef.current = ws;

    // ⏱️ 연결 타임아웃 설정
    connectionTimeoutRef.current = setTimeout(() => {
      if (ws.readyState === WebSocket.CONNECTING) {
        console.warn('⏱️ WebSocket 연결 타임아웃');
        ws.close();
      }
    }, finalConfig.connectionTimeout);

    ws.onopen = () => {
      console.log('✅ WebSocket 연결 성공');

      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }

      setConnectionState(prev => ({
        ...prev,
        status: 'connected',
        lastConnectedAt: new Date(),
        connectionCount: prev.connectionCount + 1,
        reconnectionAttempts: 0
      }));

      setLastError(null);
      circuitBreakerStateRef.current = 'closed';
      startHeartbeat();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Pong 응답으로 지연시간 측정
        if (data.type === 'pong') {
          const latency = performance.now() - pingStartTimeRef.current;
          setConnectionState(prev => ({ ...prev, latency: Math.round(latency) }));
          return;
        }

        setMessages(prev => [...prev, {
          type: data.type,
          data,
          timestamp: new Date()
        }]);
      } catch (error) {
        console.error('🚨 메시지 파싱 오류:', error);
        setLastError(error as Error);
      }
    };

    ws.onerror = (error) => {
      console.error('🚨 WebSocket 에러:', error);
      setLastError(new Error('WebSocket connection error'));
      handleConnectionFailure();
    };

    ws.onclose = (event) => {
      console.log('🔌 WebSocket 연결 종료:', event.code, event.reason);

      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
      }

      setConnectionState(prev => ({
        ...prev,
        status: event.code === 1000 ? 'disconnected' : 'failed'
      }));

      // 정상 종료가 아닌 경우 재연결 시도
      if (event.code !== 1000) {
        handleConnectionFailure();
        scheduleReconnection();
      }
    };
  }, [finalConfig, handleConnectionFailure, startHeartbeat]);

  // 🔄 재연결 스케줄링
  const scheduleReconnection = useCallback(() => {
    if (connectionState.reconnectionAttempts >= finalConfig.maxReconnectionAttempts) {
      console.error('🚨 최대 재연결 시도 횟수 도달');
      setConnectionState(prev => ({ ...prev, status: 'failed' }));
      return;
    }

    if (!checkCircuitBreaker()) {
      console.log('🚫 Circuit Breaker 개방 상태 - 재연결 대기');
      const delay = finalConfig.circuitBreaker.recoveryTimeout;
      reconnectTimeoutRef.current = setTimeout(scheduleReconnection, delay);
      return;
    }

    const delay = calculateBackoffDelay(connectionState.reconnectionAttempts);
    console.log(`🔄 ${delay}ms 후 재연결 시도 (${connectionState.reconnectionAttempts + 1}회)`);

    setConnectionState(prev => ({
      ...prev,
      status: 'connecting',
      reconnectionAttempts: prev.reconnectionAttempts + 1
    }));

    reconnectTimeoutRef.current = setTimeout(() => {
      setupWebSocket();
    }, delay);
  }, [
    connectionState.reconnectionAttempts,
    finalConfig.maxReconnectionAttempts,
    checkCircuitBreaker,
    calculateBackoffDelay,
    setupWebSocket
  ]);

  // 📤 메시지 전송
  const sendMessage = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    } else {
      console.warn('🚫 WebSocket 연결되지 않음 - 메시지 전송 실패');
      return false;
    }
  }, []);

  // 🔗 수동 연결/재연결
  const connect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setConnectionState(prev => ({
      ...prev,
      status: 'connecting',
      reconnectionAttempts: 0
    }));

    setupWebSocket();
  }, [setupWebSocket]);

  // 🔌 연결 종료
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
    }
  }, []);

  // 🚀 초기 연결
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connectionState,
    messages,
    lastError,
    sendMessage,
    connect,
    disconnect,
    isConnected: connectionState.status === 'connected',
    isConnecting: connectionState.status === 'connecting'
  };
}