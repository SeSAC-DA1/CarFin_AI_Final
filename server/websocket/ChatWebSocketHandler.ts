import { WebSocket } from "ws";
import { storage } from "../storage";
import { geminiService } from "../lib/gemini/GeminiService";
import {
  rankVehiclesWithTOPSIS,
  DEFAULT_USER_PROFILE,
  adjustWeightsFromFeedback,
  extractUserFeedbackFromMessage
} from "../lib/topsis/VehicleTOPSISAdapter";
import type { UserPreferenceProfile } from "../lib/topsis/TOPSISEngine";
import { extractOptionsFromMessage, matchOptions } from "../lib/utils/OptionMatcher";
import { analyzeDamage } from "../lib/utils/DamageCalculator";
import { railwayRedisService } from "../lib/cache/RailwayRedisService";

// 🎓 논문 3개 기반 통합 시스템 import
import {
  generatePaperBasedRecommendations,
  type PaperBasedRecommendationRequest,
  type PaperBasedRecommendationResult
} from "../lib/integration/PaperBasedRecommendationEngine";
import { MultiAgentSystem } from "../lib/agents/MultiAgentSystem";

// 브랜드별 대표 이미지 매핑
const BRAND_IMAGES = {
  "현대": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop",
  "기아": "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop",
  "BMW": "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop",
  "벤츠": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop",
  "아우디": "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop",
  "토요타": "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop",
  "혼다": "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=300&fit=crop",
  "기본": "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop"
};

function getVehicleImage(manufacturer: string, photo?: string | null): string {
  // 1순위: 실제 매물 사진 (엔카/차차차에서 가져온 실제 차량 이미지)
  if (photo && photo.trim() !== '') {
    // 엔카 이미지 URL에 확장자가 없는 경우 추가
    if (photo.includes('encar.com') && !photo.includes('.jpg') && !photo.includes('.png')) {
      return `${photo}001.jpg`; // 엔카 이미지 URL 형식: xxxxx_001.jpg
    }
    return photo;
  }

  // 2순위: 브랜드별 대표 이미지 (고품질 Unsplash 이미지)
  return BRAND_IMAGES[manufacturer] || BRAND_IMAGES["기본"];
}

interface ChatSession {
  sessionId: string;
  conversationHistory: string[];
  userProfile?: UserPreferenceProfile;
  desiredOptions: string[];        // 사용자가 원하는 옵션들
  userFeedback: Record<string, number>; // 사용자 피드백 (안전성 중요 등)
  ws: WebSocket;
}

const sessions = new Map<string, ChatSession>();

export function setupChatWebSocket(ws: WebSocket, sessionId: string) {
  console.log(`🔌 WebSocket 연결: ${sessionId}`);

  const session: ChatSession = {
    sessionId,
    conversationHistory: [],
    desiredOptions: [],
    userFeedback: {},
    ws,
  };
  sessions.set(sessionId, session);

  // 웰컴 메시지
  sendMessage(ws, {
    type: 'agent_message',
    agent: 'concierge',
    content: '안녕하세요! CarFin AI입니다 😊\n\n어떤 차 찾으세요? 그냥 평소에 말하듯이 편하게 얘기해주세요!\n\n예를 들면:\n"3000만원 이하로 가족용 SUV 찾아요"\n"출퇴근용 세단, 연비 좋은 걸로요"\n"신혼부부용 차, 안전하고 예쁜 걸로"\n\n이런 식으로 말씀해주시면 15만대 중에서 딱 맞는 차량 찾아드릴게요!',
    timestamp: new Date(),
  });

  ws.on('message', async (data: string) => {
    try {
      const message = JSON.parse(data);

      if (message.type === 'user_message') {
        await handleUserMessage(sessionId, message.content, message.userProfile);
      } else if (message.type === 'get_insights') {
        await handleGetInsights(sessionId, message.vehicleId);
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      sendMessage(ws, {
        type: 'error',
        content: '메시지 처리 중 오류가 발생했습니다.',
      });
    }
  });

  ws.on('close', () => {
    console.log(`🔌 WebSocket 연결 해제: ${sessionId}`);
    sessions.delete(sessionId);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${sessionId}:`, error);
  });
}

async function handleUserMessage(sessionId: string, userMessage: string, userProfile?: any) {
  const session = sessions.get(sessionId);
  if (!session) return;

  // 📊 프로필 데이터가 제공된 경우 세션에 저장
  if (userProfile) {
    console.log('👤 사용자 프로필 데이터 수신:', {
      name: userProfile.demographics?.name,
      age: userProfile.demographics?.age,
      budget: userProfile.budget,
      importance: {
        price: userProfile.priceWeight,
        fuelEfficiency: userProfile.fuelEfficiencyWeight,
        safety: userProfile.safetyWeight,
        design: userProfile.designWeight,
        brand: userProfile.brandWeight
      }
    });

    // ProfileSetup 형식을 TOPSIS UserPreferenceProfile 형식으로 변환
    session.userProfile = {
      priceWeight: (userProfile.priceWeight || 5) / 10, // 1-10 스케일을 0-1로 정규화
      fuelEfficiencyWeight: (userProfile.fuelEfficiencyWeight || 5) / 10,
      safetyWeight: (userProfile.safetyWeight || 5) / 10,
      designWeight: (userProfile.designWeight || 5) / 10,
      brandWeight: (userProfile.brandWeight || 5) / 10
    };
  }

  session.conversationHistory.push(`사용자: ${userMessage}`);

  // 사용자 메시지 에코
  sendMessage(session.ws, {
    type: 'user_message',
    content: userMessage,
    timestamp: new Date(),
  });

  try {
    console.log('🎓 논문 3개 기반 통합 추천 시스템 시작');

    // 📊 논문 기반 추천 시스템 사용 (MACRec + Alibaba + AHP-TOPSIS)
    await handlePaperBasedRecommendation(session, userMessage);

  } catch (error) {
    console.error('🚨 논문 기반 시스템 오류:', error);

    // 🔄 Intelligent Fallback: 레거시 시스템으로 복구
    console.log('🔄 레거시 시스템으로 자동 복구 시작');

    sendMessage(session.ws, {
      type: 'progress',
      step: 'fallback_recovery',
      message: '🔄 시스템 복구 중... 레거시 TOPSIS 엔진으로 전환',
    });

    try {
      await handleLegacyRecommendation(session, userMessage);
    } catch (fallbackError) {
      console.error('🚨 레거시 시스템도 실패:', fallbackError);

      sendMessage(session.ws, {
        type: 'agent_message',
        agent: 'system',
        content: '현재 시스템 점검 중입니다. 잠시 후 다시 시도해주세요. 문제가 지속되면 새로고침해주세요.',
        timestamp: new Date(),
      });
    }
  }
}

/**
 * 🎓 논문 3개 기반 통합 추천 시스템 (Production Optimized)
 */
async function handlePaperBasedRecommendation(session: ChatSession, userMessage: string) {
  try {
    // 🎯 1. 초기 상태 및 성능 추적
    const startTime = Date.now();

    sendMessage(session.ws, {
      type: 'progress',
      step: 'analyzing_needs',
      message: '🎓 논문 3개 기반 AI 시스템 시작...',
    });

    // 🎯 2. 병렬 데이터 로딩 (성능 최적화)
    const [allVehicles, multiAgentSystem] = await Promise.all([
      storage.searchVehicles({ limit: 1000, offset: 0 }),
      Promise.resolve(new MultiAgentSystem(process.env.GOOGLE_API_KEY!))
    ]);

    console.log(`📊 데이터 로딩 완료: ${allVehicles.length}개 차량, ${Date.now() - startTime}ms`);

    // 🎯 3. 타임아웃 설정 (30초)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('추천 시스템 타임아웃 (30초)')), 30000);
    });

    // 🎯 4. 실시간 스트리밍 협업 (타임아웃 포함)
    const collaborationPromise = (async () => {
      const collaborationStream = multiAgentSystem.collaborate(userMessage, allVehicles);

      for await (const step of collaborationStream) {
        console.log(`🤖 ${step.agent}: ${step.type}`);

        if (step.type === 'agent_working') {
          sendMessage(session.ws, {
            type: 'progress',
            step: step.agent,
            message: step.content,
          });
        } else if (step.type === 'agent_response') {
          sendMessage(session.ws, {
            type: 'agent_message',
            agent: step.agent,
            content: step.content,
            timestamp: new Date(),
          });
        } else if (step.type === 'recommendations' && step.data) {
          // 🎯 최종 추천 결과 전송 (이미지 최적화)
          const vehicles = step.data.map((rec: any) => ({
            ...rec.vehicle,
            image: getVehicleImage(rec.vehicle.manufacturer, rec.vehicle.photo),
            topsisScore: rec.topsisScore,
            matchingScore: rec.matchingScore,
            reason: rec.reason,
            pros: rec.pros,
            cons: rec.cons
          }));

          sendMessage(session.ws, {
            type: 'vehicles',
            vehicles: vehicles,
            timestamp: new Date(),
          });

          const totalTime = Date.now() - startTime;
          console.log(`✅ 논문 기반 추천 완료: ${totalTime}ms`);

          sendMessage(session.ws, {
            type: 'progress',
            step: 'completed',
            message: `🎉 논문 기반 추천 완료! (${totalTime}ms)`,
          });

          return;
        }
      }
    })();

    // 타임아웃 경쟁
    await Promise.race([collaborationPromise, timeoutPromise]);

  } catch (error) {
    console.error('🚨 논문 기반 시스템 오류:', error);

    // 에러 상황에서 사용자에게 명확한 피드백
    sendMessage(session.ws, {
      type: 'agent_message',
      agent: 'system',
      content: '죄송합니다. 시스템이 일시적으로 과부하 상태입니다. 잠시 후 다시 시도해주세요.',
      timestamp: new Date(),
    });

    // Fallback으로 레거시 시스템 실행
    throw error;
  }
}

/**
 * 🔄 기존 시스템 (Fallback용)
 */
async function handleLegacyRecommendation(session: ChatSession, userMessage: string) {
  // 🎯 1. 사용자 피드백 추출 (Alibaba Personalized Re-ranking)
  const newFeedback = extractUserFeedbackFromMessage(userMessage);
  Object.assign(session.userFeedback, newFeedback);

  // 🎯 2. 원하는 옵션 추출
  const newOptions = extractOptionsFromMessage(userMessage);
  session.desiredOptions.push(...newOptions);

  // 진행 상태 표시
  sendMessage(session.ws, {
    type: 'progress',
    step: 'analyzing_needs',
    message: 'AI가 요구사항을 분석중입니다...',
  });

  // 1. Needs Analyst 분석
  const needsAnalysis = await geminiService.analyzeUserNeeds(
    userMessage,
    session.conversationHistory
  );

  sendMessage(session.ws, {
    type: 'agent_message',
    agent: needsAnalysis.agentId,
    content: needsAnalysis.content,
    timestamp: needsAnalysis.timestamp,
  });

  session.conversationHistory.push(`Needs Analyst: ${needsAnalysis.content}`);

  // UserProfile 처리 (ProfileSetup 데이터가 있으면 사용, 없으면 동적 추출)
  if (!session.userProfile) {
    sendMessage(session.ws, {
      type: 'progress',
      step: 'extracting_profile',
      message: '사용자 프로필을 추출중입니다...',
    });

    const userProfile = await geminiService.extractUserProfile(session.conversationHistory);
    session.userProfile = userProfile;
  } else {
    sendMessage(session.ws, {
      type: 'progress',
      step: 'using_saved_profile',
      message: '저장된 프로필을 사용합니다...',
    });
    console.log('📋 저장된 사용자 프로필 사용:', session.userProfile);
  }

  // 2. 차량 검색 및 TOPSIS 랭킹
  sendMessage(session.ws, {
    type: 'progress',
    step: 'searching_vehicles',
    message: '15만대 매물에서 조건에 맞는 차량을 검색중입니다...',
  });

  // 🔍 고급 필터 추출 (예산, 차종, 브랜드, 연료 등) + ProfileSetup 데이터 활용
  const budgetMatch = userMessage.match(/(\d+)(?:만원|만|백만)/);
  let maxPrice = budgetMatch ? parseInt(budgetMatch[1]) : 5000;
  let minPrice = 0;

  // ProfileSetup 예산 데이터가 있으면 우선 사용
  if (session.userProfile && userProfile?.budget) {
    maxPrice = Math.floor(userProfile.budget.max / 10000); // 원 -> 만원 변환
    minPrice = Math.floor(userProfile.budget.min / 10000);
    console.log(`💰 ProfileSetup 예산 범위 사용: ${minPrice}-${maxPrice}만원`);
  } else {
    console.log(`💰 메시지 기반 예산 추출: ~${maxPrice}만원`);
  }

  // 차종 키워드 매핑
  let carType = undefined;
  if (userMessage.includes('SUV') || userMessage.includes('에스유브이') || userMessage.includes('스포츠유틸리티')) {
    carType = 'SUV';
  } else if (userMessage.includes('세단') || userMessage.includes('승용차')) {
    carType = '세단';
  } else if (userMessage.includes('소형') || userMessage.includes('경차')) {
    carType = '소형';
  } else if (userMessage.includes('중형') || userMessage.includes('패밀리')) {
    carType = '중형';
  } else if (userMessage.includes('대형') || userMessage.includes('고급')) {
    carType = '대형';
  }

  // 브랜드 추출
  let manufacturer = undefined;
  if (userMessage.includes('현대') || userMessage.includes('hyundai')) {
    manufacturer = '현대';
  } else if (userMessage.includes('기아') || userMessage.includes('kia')) {
    manufacturer = '기아';
  } else if (userMessage.includes('BMW') || userMessage.includes('비엠더블유')) {
    manufacturer = 'BMW';
  } else if (userMessage.includes('벤츠') || userMessage.includes('메르세데스')) {
    manufacturer = '벤츠';
  } else if (userMessage.includes('아우디')) {
    manufacturer = '아우디';
  } else if (userMessage.includes('토요타')) {
    manufacturer = '토요타';
  }

  // 연료 타입 추출
  let fuelType = undefined;
  if (userMessage.includes('디젤')) {
    fuelType = '디젤';
  } else if (userMessage.includes('가솔린') || userMessage.includes('휘발유')) {
    fuelType = '가솔린';
  } else if (userMessage.includes('하이브리드')) {
    fuelType = '하이브리드';
  } else if (userMessage.includes('전기차') || userMessage.includes('EV')) {
    fuelType = '전기';
  }

  // 다양성을 위한 오프셋 랜덤화 (동일한 차량만 나오는 문제 해결)
  const randomOffset = Math.floor(Math.random() * 1000);

  const searchParams = {
    minPrice,
    maxPrice,
    carType,
    manufacturer,
    fuelType,
    limit: 50,
    offset: randomOffset,
  };

  console.log(`🔍 검색 파라미터:`, searchParams);

  // 🎯 캐시에서 차량 검색 결과 조회
  let vehicles = await railwayRedisService.getVehicleSearchResults(searchParams);
  if (!vehicles) {
    vehicles = await storage.searchVehicles(searchParams);
    // 검색 결과를 캐시에 저장 (5분)
    await railwayRedisService.setVehicleSearchResults(searchParams, vehicles);
    console.log(`💾 차량 검색 결과 캐시 저장: ${vehicles.length}개`);
  } else {
    console.log(`🎯 차량 검색 캐시 HIT: ${vehicles.length}개`);
  }

  if (vehicles.length === 0) {
    sendMessage(session.ws, {
      type: 'agent_message',
      agent: 'concierge',
      content: '죄송합니다. 검색 조건에 맞는 차량을 찾지 못했습니다. 다른 조건으로 다시 시도해주세요.',
      timestamp: new Date(),
    });
    return;
  }

  sendMessage(session.ws, {
    type: 'progress',
    step: 'ranking_topsis',
    message: `${vehicles.length}개 차량을 정밀 분석중입니다...`,
  });

  // 🎯 3. 개인화된 가중치 적용 (ProfileSetup + Alibaba Personalized Re-ranking)
  let personalizedProfile = session.userProfile || DEFAULT_USER_PROFILE;

  // 추가 피드백이 있으면 ProfileSetup 기반 프로필을 더 세밀하게 조정
  if (Object.keys(session.userFeedback).length > 0) {
    personalizedProfile = adjustWeightsFromFeedback(personalizedProfile, session.userFeedback);
    console.log(`📊 ProfileSetup + 피드백 기반 가중치 적용:`, session.userFeedback);
  } else if (session.userProfile) {
    console.log(`📊 ProfileSetup 기반 가중치 사용:`, personalizedProfile);
  }

  // 🎯 캐시에서 TOPSIS 랭킹 결과 조회
  let topsisResult = await railwayRedisService.getTopsisRanking(personalizedProfile, vehicles);
  if (!topsisResult) {
    topsisResult = await rankVehiclesWithTOPSIS(vehicles, personalizedProfile);
    // TOPSIS 결과를 캐시에 저장 (10분)
    await railwayRedisService.setTopsisRanking(personalizedProfile, vehicles, topsisResult);
    console.log(`💾 TOPSIS 랭킹 결과 캐시 저장`);
  } else {
    console.log(`🎯 TOPSIS 랭킹 캐시 HIT`);
  }

  let topVehicles = topsisResult.ranking.slice(0, 3).map(r => r.alternative.metadata);

  // 🎯 4. 옵션 매칭 점수 추가
  if (session.desiredOptions.length > 0) {
    topVehicles = topVehicles.map(vehicle => {
      const optionMatch = matchOptions(session.desiredOptions, vehicle.options || []);
      return {
        ...vehicle,
        optionMatchRatio: optionMatch.matchRatio,
        matchedOptions: optionMatch.matchedOptions
      };
    });
    console.log(`🔧 옵션 매칭 적용:`, session.desiredOptions);
  }

  // 3. Data Analyst 분석
  const dataAnalysis = await geminiService.analyzeVehicleData(
    userMessage,
    topVehicles,
    vehicles.length
  );

  sendMessage(session.ws, {
    type: 'agent_message',
    agent: dataAnalysis.agentId,
    content: dataAnalysis.content,
    timestamp: dataAnalysis.timestamp,
  });

  session.conversationHistory.push(`Data Analyst: ${dataAnalysis.content}`);

  // 4. Concierge 최종 추천
  sendMessage(session.ws, {
    type: 'progress',
    step: 'final_recommendation',
    message: 'Concierge가 최종 추천을 준비중입니다...',
  });

  const finalRecommendation = await geminiService.generateFinalRecommendation(
    needsAnalysis.content,
    dataAnalysis.content,
    topVehicles
  );

  sendMessage(session.ws, {
    type: 'agent_message',
    agent: finalRecommendation.agentId,
    content: finalRecommendation.content,
    timestamp: finalRecommendation.timestamp,
  });

  session.conversationHistory.push(`Concierge: ${finalRecommendation.content}`);

  // 5. 상위 3개 차량 전송 (팀원 코드 기반 개선)
  const rankedVehicles = topsisResult.ranking.slice(0, 3).map((r, index) => {
    const vehicle = r.alternative.metadata;

    // 🎯 5. 손상비율 분석 (팀원 코드 포팅)
    const damageAnalysis = analyzeDamage(
      vehicle.myAccidentCost || 0,
      vehicle.otherAccidentCost || 0,
      vehicle.originPrice || vehicle.price
    );

    // 옵션 매칭 정보 추가
    const optionMatch = session.desiredOptions.length > 0
      ? matchOptions(session.desiredOptions, vehicle.options || [])
      : null;

    return {
      id: vehicle.vehicleId,
      rank: index + 1,
      name: `${vehicle.manufacturer} ${vehicle.model}`,
      manufacturer: vehicle.manufacturer,
      model: vehicle.model,
      year: vehicle.modelYear,
      price: vehicle.price,
      mileage: vehicle.distance,
      fuel: vehicle.fuelType,
      image: getVehicleImage(vehicle.manufacturer, vehicle.photo),
      detailUrl: vehicle.detailUrl,
      location: vehicle.location,
      topsisScore: Math.round(r.score * 100),
      matchScore: Math.round(r.score * 100),
      distanceToIdeal: r.distanceToIdeal,

      // 🔥 새로운 팀원 코드 기반 기능들
      damageGrade: damageAnalysis.grade,        // S, A, B, C, D 등급
      damageRatio: damageAnalysis.damageRatio,  // 손상 비율
      optionMatchRatio: optionMatch?.matchRatio || 0,  // 옵션 매칭률
      matchedOptions: optionMatch?.matchedOptions || [], // 매칭된 옵션들
    };
  });

  sendMessage(session.ws, {
    type: 'vehicles_recommended',
    vehicles: rankedVehicles,
    totalEvaluated: vehicles.length,
  });

  sendMessage(session.ws, {
    type: 'progress',
    step: 'completed',
    message: '✅ 추천이 완료되었습니다!',
  });
}

async function handleGetInsights(sessionId: string, vehicleId: string) {
  const session = sessions.get(sessionId);
  if (!session) return;

  try {
    sendMessage(session.ws, {
      type: 'progress',
      step: 'generating_insights',
      message: 'AI가 차량 인사이트를 생성중입니다...',
    });

    const vehicle = await storage.getVehicleById(parseInt(vehicleId));
    if (!vehicle) {
      sendMessage(session.ws, {
        type: 'error',
        content: '차량 정보를 찾을 수 없습니다.',
      });
      return;
    }

    const insights = await geminiService.generateVehicleInsights(vehicle);

    sendMessage(session.ws, {
      type: 'vehicle_insights',
      vehicleId,
      insights,
    });
  } catch (error) {
    console.error('❌ 인사이트 생성 에러:', error);
    sendMessage(session.ws, {
      type: 'error',
      content: '인사이트 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
    });
  }
}

function sendMessage(ws: WebSocket, message: any) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}
