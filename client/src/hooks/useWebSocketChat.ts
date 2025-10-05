import { useState, useEffect, useCallback, useRef } from 'react';

export interface ChatMessage {
  type: 'user_message' | 'agent_message' | 'error';
  agent?: string;
  content: string;
  timestamp: Date;
}

export interface Vehicle {
  id: string;
  rank: number;
  name: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  image: string;
  topsisScore: number;
  matchScore: number;
}

export interface ProgressUpdate {
  step: string;
  message: string;
}

export interface VehicleInsights {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  costAnalysis: string;
  recommendation: string;
}

export function useWebSocketChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [insights, setInsights] = useState<{ vehicleId: string; data: VehicleInsights } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 🌐 백엔드 URL 환경변수 지원 (Vercel 배포용)
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    let wsUrl: string;
    if (backendUrl) {
      // 환경변수가 있으면 사용 (Vercel 배포 시)
      wsUrl = backendUrl.replace(/^http/, 'ws') + '/ws/chat';
    } else {
      // 환경변수가 없으면 현재 브라우저 기준
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname;

      // Railway/Vercel 등 배포 환경에서는 포트 제외, 로컬 개발에서만 포트 사용
      if (host === 'localhost' || host === '127.0.0.1') {
        const port = window.location.port || '8000';
        wsUrl = `${protocol}//${host}:${port}/ws/chat`;
      } else {
        // 배포 환경에서는 포트 없이 연결
        wsUrl = `${protocol}//${host}/ws/chat`;
      }
    }

    console.log('🔌 WebSocket 연결 시도:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('✅ WebSocket 연결 성공');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'user_message' || data.type === 'agent_message') {
        setMessages(prev => [...prev, {
          type: data.type,
          agent: data.agent,
          content: data.content,
          timestamp: new Date(data.timestamp),
        }]);
      } else if (data.type === 'vehicles_recommended') {
        setVehicles(data.vehicles);
        setProgress(null);
      } else if (data.type === 'progress') {
        setProgress({
          step: data.step,
          message: data.message,
        });
      } else if (data.type === 'vehicle_insights') {
        setInsights({
          vehicleId: data.vehicleId,
          data: data.insights,
        });
      } else if (data.type === 'error') {
        setMessages(prev => [...prev, {
          type: 'error',
          content: data.content,
          timestamp: new Date(),
        }]);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket 에러:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket 연결 종료');
      setIsConnected(false);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'user_message',
        content,
      }));
    }
  }, []);

  const requestInsights = useCallback((vehicleId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'get_insights',
        vehicleId,
      }));
    }
  }, []);

  return {
    messages,
    vehicles,
    progress,
    insights,
    isConnected,
    sendMessage,
    requestInsights,
  };
}
