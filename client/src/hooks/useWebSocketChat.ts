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
  manufacturer: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  image: string;
  topsisScore: number;
  matchScore: number;
  reason?: string;
  pros?: string[];
  cons?: string[];
  location?: string;
  detailUrl?: string;
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
        const port = window.location.port || '5000';
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
      try {
        const data = JSON.parse(event.data);
        console.log('📨 WebSocket 메시지 수신:', data.type, data);

        if (data.type === 'user_message' || data.type === 'agent_message') {
          setMessages(prev => [...prev, {
            type: data.type,
            agent: data.agent,
            content: data.content,
            timestamp: new Date(data.timestamp),
          }]);
        } else if (data.type === 'vehicles' || data.type === 'vehicles_recommended') {
          try {
            // 백엔드에서 오는 차량 데이터 형식에 맞춰 변환 (안전 처리)
            const formattedVehicles = (data.vehicles || []).map((vehicle: any, index: number) => {
              // TOPSIS 점수 정규화 (0-1 범위를 0-100으로 변환)
              const normalizedTopsisScore = vehicle.topsisScore < 1
                ? Math.round(vehicle.topsisScore * 100)
                : vehicle.topsisScore;

              const normalizedMatchScore = vehicle.matchScore < 1
                ? Math.round(vehicle.matchScore * 100)
                : vehicle.matchScore;

              return {
              id: vehicle.id || vehicle.vehicleId || `vehicle_${index}`,
              rank: index + 1, // 실제 순서대로 순위 부여
              name: vehicle.name || `${vehicle.manufacturer || vehicle.brand || '브랜드 미상'} ${vehicle.model || '모델 미상'}`,
              manufacturer: vehicle.manufacturer || vehicle.brand || '브랜드 미상',
              model: vehicle.model || '모델 미상',
              year: vehicle.year || vehicle.modelYear || new Date().getFullYear(),
              price: vehicle.price || 0,
              mileage: vehicle.mileage || vehicle.distance || 0,
              fuel: vehicle.fuel || vehicle.fuelType || '연료 미상',
              image: vehicle.image || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop',
              topsisScore: normalizedTopsisScore,
              matchScore: normalizedMatchScore,
              reason: vehicle.reason || '추천 이유',
              pros: vehicle.pros || [],
              cons: vehicle.cons || [],
              location: vehicle.location || '위치 미상',
              detailUrl: vehicle.detailUrl || ''
            };
            });

            console.log('🚗 차량 데이터 변환 완료:', formattedVehicles.length);
            setVehicles(formattedVehicles);
            setProgress(null);
          } catch (vehicleError) {
            console.error('🚨 차량 데이터 처리 오류:', vehicleError);
            setMessages(prev => [...prev, {
              type: 'error',
              content: '차량 데이터 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
              timestamp: new Date(),
            }]);
          }
        } else if (data.type === 'progress') {
          setProgress({
            step: data.step || 'unknown',
            message: data.message || '처리 중...',
          });
        } else if (data.type === 'vehicle_insights') {
          setInsights({
            vehicleId: data.vehicleId,
            data: data.insights,
          });
        } else if (data.type === 'error') {
          setMessages(prev => [...prev, {
            type: 'error',
            content: data.content || '알 수 없는 오류가 발생했습니다.',
            timestamp: new Date(),
          }]);
        }
      } catch (parseError) {
        console.error('🚨 WebSocket 메시지 파싱 오류:', parseError, '원본 데이터:', event.data);
        setMessages(prev => [...prev, {
          type: 'error',
          content: '서버와의 통신 오류가 발생했습니다. 연결을 확인해주세요.',
          timestamp: new Date(),
        }]);
      }
    };

    ws.onerror = (error) => {
      console.error('🚨 WebSocket 에러:', error);
      setIsConnected(false);

      // 사용자에게 연결 오류 알림
      setMessages(prev => [...prev, {
        type: 'error',
        content: '서버 연결에 문제가 발생했습니다. 자동으로 재연결을 시도합니다.',
        timestamp: new Date(),
      }]);
    };

    ws.onclose = (event) => {
      console.log('🔌 WebSocket 연결 종료', event.code, event.reason);
      setIsConnected(false);

      // 비정상 종료인 경우에만 재연결 시도
      if (event.code !== 1000) { // 1000 = 정상 종료
        console.log('🔄 WebSocket 재연결 시도...');
        setMessages(prev => [...prev, {
          type: 'agent_message',
          agent: 'system',
          content: '🔄 연결이 끊어졌습니다. 자동으로 재연결 중...',
          timestamp: new Date(),
        }]);

        // 3초 후 재연결 시도
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // ProfileSetup에서 저장된 사용자 프로필 데이터 가져오기
      const savedProfile = localStorage.getItem('carfin_user_profile');
      let userProfile = null;

      if (savedProfile) {
        try {
          const profileData = JSON.parse(savedProfile);
          // ProfileSetup 데이터를 백엔드 UserPreferenceProfile 형식으로 변환
          userProfile = {
            priceWeight: profileData.importance?.price || 5,
            fuelEfficiencyWeight: profileData.importance?.fuelEfficiency || 5,
            safetyWeight: profileData.importance?.safety || 5,
            designWeight: profileData.importance?.design || 5,
            brandWeight: profileData.importance?.brand || 5,
            // 예산 정보 추가
            budget: {
              min: profileData.budget?.[0] * 10000 || 1000000, // 만원 -> 원 단위 변환
              max: profileData.budget?.[1] * 10000 || 30000000
            },
            // 기본 정보 추가
            demographics: {
              age: profileData.age,
              location: profileData.location,
              name: profileData.name
            },
            // 사용 용도 정보
            usage: profileData.usage || [],
            // 선호 정보
            preferences: {
              brands: profileData.preferredBrands || [],
              vehicleTypes: profileData.vehicleTypes || [],
              fuelType: profileData.fuelType,
              transmission: profileData.transmission
            }
          };
        } catch (error) {
          console.warn('프로필 데이터 파싱 오류:', error);
        }
      }

      wsRef.current.send(JSON.stringify({
        type: 'user_message',
        content,
        userProfile, // 프로필 데이터 포함
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
