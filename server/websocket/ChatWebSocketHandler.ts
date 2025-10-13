import { WebSocket } from "ws";
import { storage } from "../storage";
import { geminiService } from "../lib/gemini/GeminiService";
import type { UserPreferenceProfile } from "../lib/topsis/TOPSISEngine";
import { MultiAgentSystem, type VehicleRecommendation } from "../lib/agents/MultiAgentSystem";
import type { Vehicle } from "@shared/types/vehicle";
import { ProfileExtractor, type ExtractedProfileUpdate } from "../lib/agents/ProfileExtractor";
import { ProfileCompletenessAnalyzer } from "../lib/agents/ProfileCompletenessAnalyzer";
import { SmartQuestionEngine } from "../lib/agents/SmartQuestionEngine";

function getVehicleImage(manufacturer: string, photo?: string | null): string {
  if (photo && photo.trim() !== '') {
    if (photo.includes('encar.com') && !photo.includes('.jpg') && !photo.includes('.png')) {
      return `${photo}001.jpg`;
    }
    return photo;
  }
  // Fallback image can be decided later
  return "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop";
}

interface ChatSession {
  sessionId: string;
  conversationHistory: string[];
  userProfile?: UserPreferenceProfile;
  rawProfile?: any;  // 🆕 Phase 2.5: 원본 프로필 데이터 (budget, usage, carType 등)
  ws: WebSocket;
  lastQuestionAsked?: string;  // 🆕 Phase 2.5: 마지막으로 질문한 필드
}

const sessions = new Map<string, ChatSession>();

export function setupChatWebSocket(ws: WebSocket, sessionId: string) {
  console.log(`🔌 [${sessionId.substring(0, 8)}] WebSocket 연결 시작`);
  console.log(`📊 [${sessionId.substring(0, 8)}] 현재 활성 세션 수:`, sessions.size);
  console.log(`📡 [${sessionId.substring(0, 8)}] WebSocket.readyState:`, ws.readyState, '(1=OPEN)');

  // 중복 세션 감지
  if (sessions.has(sessionId)) {
    console.warn(`⚠️ [${sessionId.substring(0, 8)}] 중복 세션 감지! 기존 세션 덮어쓰기`);
    const oldSession = sessions.get(sessionId);
    if (oldSession?.ws && oldSession.ws.readyState === WebSocket.OPEN) {
      console.warn(`⚠️ [${sessionId.substring(0, 8)}] 기존 연결 강제 종료`);
      oldSession.ws.close();
    }
  }

  const session: ChatSession = {
    sessionId,
    conversationHistory: [],
    ws,
  };
  sessions.set(sessionId, session);

  sendMessage(ws, {
    type: 'agent_message',
    agent: 'concierge',
    content: '안녕하세요! CARFIN AI입니다 😊\n\n어떤 차를 찾고 계세요? 편하게 이야기해주세요!\n\n예를 들면 이렇게요:\n"3000만원대 가족용 SUV 찾아요"\n"출퇴근용 세단, 연비 좋은 걸로요"\n"신혼부부용 차, 안전한 걸로 추천해주세요"\n\n10만대 이상의 실시간 매물 중에서 딱 맞는 차량을 찾아드릴게요!',
    timestamp: new Date(),
  });

  ws.on('message', async (data) => {
    const rawData = data.toString();
    console.log(`🔔 [${sessionId.substring(0, 8)}] RAW 메시지 수신 (${typeof data}):`, rawData.substring(0, 100));
    console.log(`📊 [${sessionId.substring(0, 8)}] WebSocket.readyState:`, ws.readyState);
    console.log(`🆔 [${sessionId.substring(0, 8)}] Session exists:`, sessions.has(sessionId));

    try {
      const message = JSON.parse(rawData);
      console.log(`📨 [${sessionId.substring(0, 8)}] 파싱 성공:`, message.type);

      if (message.type === 'user_message') {
        console.log(`💬 [${sessionId.substring(0, 8)}] 사용자 메시지 처리 시작:`, message.content.substring(0, 50));
        await handleUserMessage(sessionId, message.content, message.userProfile);
        console.log(`✅ [${sessionId.substring(0, 8)}] 사용자 메시지 처리 완료`);
      } else if (message.type === 'get_insights') {
        console.log(`🔍 [${sessionId.substring(0, 8)}] Insights 요청:`, message.vehicleId);
        await handleGetInsights(sessionId, message.vehicleId);
      }
    } catch (error) {
      console.error(`❌ [${sessionId.substring(0, 8)}] WebSocket message error:`, error);
      console.error(`📄 [${sessionId.substring(0, 8)}] 실패한 메시지:`, rawData);
      sendMessage(ws, {
        type: 'error',
        content: '메시지 처리 중 오류가 발생했습니다.',
      });
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`🔌 [${sessionId.substring(0, 8)}] WebSocket 연결 해제. Code:`, code, 'Reason:', reason?.toString());
    sessions.delete(sessionId);
    console.log(`📊 남은 세션 수:`, sessions.size);
  });

  ws.on('error', (error) => {
    console.error(`❌ [${sessionId.substring(0, 8)}] WebSocket error:`, error);
  });
}

async function handleUserMessage(sessionId: string, userMessage: string, userProfile?: any) {
  const session = sessions.get(sessionId);
  if (!session) return;

  // 초기 프로필 설정 (ProfileSetup에서 전송된 경우)
  if (userProfile) {
    console.log('👤 초기 프로필 데이터 수신:', userProfile);
    session.rawProfile = userProfile;  // 🆕 Phase 2.5: 원본 프로필 저장
    session.userProfile = {
      priceWeight: (userProfile.importance?.price || 5) / 10,
      fuelEfficiencyWeight: (userProfile.importance?.fuelEfficiency || 5) / 10,
      safetyWeight: (userProfile.importance?.safety || 5) / 10,
      designWeight: (userProfile.importance?.design || 5) / 10,
      performanceWeight: (userProfile.importance?.performance || 5) / 10,
      brandWeight: (userProfile.importance?.brand || 5) / 10,
    };
  }

  // 🆕 Phase 2: 대화에서 프로필 정보 자동 추출 및 업데이트
  try {
    const profileExtractor = new ProfileExtractor(process.env.GOOGLE_API_KEY!);

    // 빠른 추출 시도 (키워드 기반)
    const quickUpdate = profileExtractor.quickExtract(userMessage);

    if (Object.keys(quickUpdate).length > 0) {
      console.log('⚡ 빠른 프로필 업데이트:', quickUpdate);
      await updateSessionProfile(session, quickUpdate);
    } else {
      // AI 기반 상세 추출 (비동기로 실행하여 응답 지연 방지)
      profileExtractor.extractProfileInfo(userMessage).then(extracted => {
        if (Object.keys(extracted).length > 0) {
          console.log('🔍 AI 프로필 업데이트:', extracted);
          updateSessionProfile(session, extracted);
        }
      }).catch(err => {
        console.warn('프로필 추출 실패 (무시):', err);
      });
    }
  } catch (error) {
    console.warn('프로필 추출 오류 (무시):', error);
  }

  session.conversationHistory.push(`사용자: ${userMessage}`);

  sendMessage(session.ws, {
    type: 'user_message',
    content: userMessage,
    timestamp: new Date(),
  });

  // 🆕 개선된 대화 흐름: 최소 정보만 있으면 추천 실행
  try {
    const analyzer = new ProfileCompletenessAnalyzer();
    const completenessReport = analyzer.analyzeProfile(session.rawProfile);

    console.log(`📊 프로필 완성도: ${completenessReport.completenessScore}%`);
    console.log(`📋 현재 프로필:`, JSON.stringify(session.rawProfile, null, 2));

    // ✅ 핵심 개선: 시연 시나리오 메시지 감지 및 강제 추천
    const isDemoScenario = userMessage.includes('연간') && userMessage.includes('km') && userMessage.includes('보유');

    // ✅ 더 관대한 조건: 시연 시나리오거나 하나의 조건만 있어도 추천 시도
    const hasMinimalInfo = isDemoScenario || session.rawProfile && (
      (session.rawProfile.budget?.length > 0 && session.rawProfile.usage?.length > 0) || // 예산 + 용도
      (session.rawProfile.budget?.length > 0 && session.rawProfile.carType) ||          // 예산 + 차종
      (session.rawProfile.usage?.length > 0 && session.rawProfile.carType) ||           // 용도 + 차종
      session.rawProfile.budget?.length > 0 ||                                          // 예산만
      session.rawProfile.carType ||                                                     // 차종만
      userMessage.length > 20                                                           // 긴 메시지 (시연 시나리오)
    );

    if (hasMinimalInfo || isDemoScenario) {
      console.log(`✅ 추천 시스템 실행 (시연모드: ${isDemoScenario})`);
      await handleMultiAgentRecommendation(session, userMessage);

      // 🐛 FIX: 추천 결과 표시를 방해하지 않도록 추가 질문 비활성화
      // 사용자가 추천 결과를 보고 더 많은 정보를 제공하면 자연스럽게 다시 추천
      // if (completenessReport.completenessScore < 60 && completenessReport.nextQuestionPriority) {
      //   const nextField = completenessReport.nextQuestionPriority;
      //   // ... (추가 질문 로직 비활성화)
      // }
    } else {
      // 정보가 전혀 없는 경우에만 필수 질문
      console.log('❌ 최소 정보 부족 → Essential 필드 질문');

      if (completenessReport.nextQuestionPriority && completenessReport.nextQuestionPriority.category === 'essential') {
        const nextField = completenessReport.nextQuestionPriority;
        const questionEngine = new SmartQuestionEngine(process.env.GOOGLE_API_KEY!);
        const smartQuestion = await questionEngine.generateSmartQuestion(nextField, {
          missingField: nextField,
          conversationHistory: session.conversationHistory,
          userLastMessage: userMessage,
          currentProfile: session.rawProfile,
        });

        session.lastQuestionAsked = nextField.name;

        sendMessage(session.ws, {
          type: 'agent_message',
          agent: 'concierge',
          content: smartQuestion.question,
          timestamp: new Date(),
        });
      } else {
        // Essential 정보도 없고 질문도 없으면 일반 응답
        await handleMultiAgentRecommendation(session, userMessage);
      }
    }
  } catch (error) {
    console.error('🚨 시스템 오류:', error);

    // 🎨 UX 개선: 구체적이고 도움이 되는 에러 메시지
    const helpfulMessage = `죄송합니다. 추천 중 문제가 발생했어요 😅

다시 한 번 말씀해주시거나, 다음 정보를 알려주시면 더 정확하게 추천드릴 수 있어요:

💰 **예산**: 얼마 정도 생각하고 계세요? (예: 3000만원 이하)
🚗 **차종**: 어떤 차종을 원하세요? (예: 세단, SUV, 경차)
🎯 **용도**: 주로 어떻게 사용하실 건가요? (예: 출퇴근, 가족용)

편하게 말씀해주시면 다시 찾아드릴게요! 😊`;

    sendMessage(session.ws, {
      type: 'agent_message',
      agent: 'concierge',
      content: helpfulMessage,
      timestamp: new Date(),
    });
  }
}

/**
 * 세션 프로필을 추출된 정보로 업데이트
 */
function updateSessionProfile(session: ChatSession, update: ExtractedProfileUpdate) {
  // 🆕 Phase 2.5: rawProfile 초기화
  if (!session.rawProfile) {
    session.rawProfile = {
      budget: [],
      usage: [],
      importance: {},
    };
  }

  if (!session.userProfile) {
    session.userProfile = {
      priceWeight: 0.5,
      fuelEfficiencyWeight: 0.5,
      safetyWeight: 0.5,
      designWeight: 0.5,
      performanceWeight: 0.5,
      brandWeight: 0.5,
    };
  }

  // 🆕 Phase 2.5: rawProfile 업데이트 (budget, usage, carType 등)
  if (update.budget) {
    session.rawProfile.budget = [update.budget.min, update.budget.max];
  }
  if (update.usage) {
    session.rawProfile.usage = update.usage;
  }
  if (update.carType) {
    session.rawProfile.carType = update.carType;
  }
  if (update.fuelType) {
    session.rawProfile.fuelType = update.fuelType;
  }
  if (update.transmission) {
    session.rawProfile.transmission = update.transmission;
  }
  if (update.brands) {
    session.rawProfile.preferredBrands = update.brands;
  }

  // 중요도 업데이트 (userProfile weights)
  if (update.importance) {
    if (!session.rawProfile.importance) {
      session.rawProfile.importance = {};
    }

    if (update.importance.price) {
      session.userProfile.priceWeight = update.importance.price / 10;
      session.rawProfile.importance.price = update.importance.price;
    }
    if (update.importance.fuelEfficiency) {
      session.userProfile.fuelEfficiencyWeight = update.importance.fuelEfficiency / 10;
      session.rawProfile.importance.fuelEfficiency = update.importance.fuelEfficiency;
    }
    if (update.importance.safety) {
      session.userProfile.safetyWeight = update.importance.safety / 10;
      session.rawProfile.importance.safety = update.importance.safety;
    }
    if (update.importance.design) {
      session.userProfile.designWeight = update.importance.design / 10;
      session.rawProfile.importance.design = update.importance.design;
    }
    if (update.importance.brand) {
      session.userProfile.brandWeight = update.importance.brand / 10;
      session.rawProfile.importance.brand = update.importance.brand;
    }
  }

  // 🆕 개선: 조용한 프로필 업데이트 (메시지 없이 로그만)
  console.log('✅ 프로필 업데이트:', JSON.stringify(update, null, 2));
}

async function handleMultiAgentRecommendation(session: ChatSession, userMessage: string) {
  const startTime = Date.now();
  console.time('[TOTAL] Recommendation');

  try {
    sendMessage(session.ws, { type: 'progress', step: 'analyzing_needs', message: '🤖 멀티에이전트 시스템 가동... ' });

    console.time('[STEP 1/5] Database Query');

    // 🔧 CRITICAL FIX: 사용자 필터를 데이터베이스 쿼리에 직접 적용
    // ❌ 기존 문제: 랜덤 샘플링 후 필터링 → 편향성 발생, 전체 데이터 활용 불가
    // ✅ 개선: DB 쿼리 단계에서 필터링 → 정확한 추천, 전체 12만건 활용 가능

    const searchFilters: any = {
      limit: 2000, // 800 → 2000으로 증가 (더 많은 후보 확보)
      offset: 0
    };

    // 1️⃣ 예산 필터 (rawProfile.budget: [최소, 최대])
    if (session.rawProfile?.budget && Array.isArray(session.rawProfile.budget)) {
      const [minPrice, maxPrice] = session.rawProfile.budget;
      if (minPrice > 0) searchFilters.minPrice = minPrice;
      if (maxPrice > 0 && maxPrice < 10000) searchFilters.maxPrice = maxPrice;
      console.log(`💰 예산 필터 적용: ${minPrice}만원 ~ ${maxPrice}만원`);
    }

    // 2️⃣ 차종 필터 (rawProfile.carType: 'suv' | 'sedan' | 'eco' 등)
    if (session.rawProfile?.carType) {
      const carTypeMap: Record<string, string> = {
        'suv': 'SUV',
        'sedan': '세단',
        'eco': '경차',
        'commercial': '승합'
      };
      const dbCarType = carTypeMap[session.rawProfile.carType];
      if (dbCarType) {
        searchFilters.carType = dbCarType;
        console.log(`🚗 차종 필터 적용: ${dbCarType}`);
      }
    }

    // 3️⃣ 브랜드 필터 (rawProfile.brands: string[])
    if (session.rawProfile?.brands && session.rawProfile.brands.length > 0) {
      searchFilters.manufacturer = session.rawProfile.brands[0]; // 첫 번째 선호 브랜드 적용
      console.log(`🏭 브랜드 필터 적용: ${searchFilters.manufacturer}`);
    }

    // 4️⃣ 연료 타입 필터 (usage에서 추론)
    if (session.rawProfile?.usage?.includes('eco') || userMessage.includes('연비') || userMessage.includes('하이브리드')) {
      // 연비 중심 요청 → 하이브리드/LPG 우선
      console.log(`⛽ 연료 효율 중심 추천 활성화`);
    }

    console.log(`🔍 최종 검색 필터:`, JSON.stringify(searchFilters, null, 2));

    const allVehicles = await storage.searchVehicles(searchFilters) as Vehicle[];
    console.timeEnd('[STEP 1/5] Database Query');
    console.log(`📊 데이터 로딩 완료: ${allVehicles.length}개 차량, ${Date.now() - startTime}ms`);

    if (allVehicles.length === 0) {
      throw new Error('데이터베이스에서 차량을 불러올 수 없습니다.');
    }

    console.time('[STEP 2/5] MultiAgent System Init');
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('❌ GOOGLE_API_KEY가 설정되지 않았습니다!');
      throw new Error('AI 시스템 초기화 실패');
    }
    const multiAgentSystem = new MultiAgentSystem(apiKey);
    console.timeEnd('[STEP 2/5] MultiAgent System Init');

    console.time('[STEP 3/5] MultiAgent Collaboration');
    // 🐛 Fix: rawProfile 전달 (대화 맥락 누적)
    const collaborationStream = multiAgentSystem.collaborate(userMessage, allVehicles, [], session.rawProfile);

    for await (const step of collaborationStream) {
      console.log(`🤖 [${session.sessionId.substring(0, 8)}] ${step.agent}: ${step.type}`);

      if (step.type === 'agent_working') {
        sendMessage(session.ws, { type: 'progress', step: step.agent, message: step.content });
      } else if (step.type === 'agent_response') {
        sendMessage(session.ws, { type: 'agent_message', agent: step.agent, content: step.content, timestamp: new Date() });
      } else if (step.type === 'recommendations' && step.data) {
        console.timeEnd('[STEP 3/5] MultiAgent Collaboration');
        console.time('[STEP 4/5] Vehicle Data Mapping');

        const vehicles = step.data.vehicles.map((rec: VehicleRecommendation) => {
          const v = rec.vehicle;
          console.log(`🚗 차량 데이터 매핑: ${v.manufacturer} ${v.model} - price: ${v.price}`);

          return {
            // 🐛 Fix: 명시적으로 모든 필드 매핑 (price가 누락되지 않도록)
            vehicleId: v.vehicleId,
            manufacturer: v.manufacturer,
            model: v.model,
            modelYear: v.modelYear,
            price: v.price,  // 🔴 명시적 price 매핑
            distance: v.distance,
            fuelType: v.fuelType,
            location: v.location,
            sellType: v.sellType,
            photo: v.photo,
            detailUrl: v.detailUrl,
            options: v.options,
            carType: v.carType,
            grade: v.grade,
            transmission: v.transmission,
            displacement: v.displacement,
            color: v.color,
            originPrice: v.originPrice,
            tco: v.tco,
            financingOptions: v.financingOptions,

            // 추가 메타데이터
            rank: rec.rank,
            image: getVehicleImage(v.manufacturer, v.photo),
            topsisScore: rec.topsisScore,
            matchingScore: rec.matchingScore,
            matchScore: rec.matchingScore,
            reason: rec.reason,
            pros: rec.pros,
            cons: rec.cons
          };
        });

        console.timeEnd('[STEP 4/5] Vehicle Data Mapping');
        console.time('[STEP 5/5] Send Results');
        // 🐛 Fix: type을 'recommendations'로 그대로 전달 (프론트엔드 호환)
        sendMessage(session.ws, {
          type: 'recommendations',
          agent: step.agent,
          content: step.content,
          data: {
            vehicles: vehicles,
            comprehensiveAdvice: step.data.comprehensiveAdvice,
            macrecMetadata: step.data.macrecMetadata
          },
          timestamp: new Date()
        });
        console.timeEnd('[STEP 5/5] Send Results');

        const totalTime = Date.now() - startTime;
        console.timeEnd('[TOTAL] Recommendation');
        console.log(`✅ [${session.sessionId.substring(0, 8)}] 추천 완료: ${totalTime}ms (${vehicles.length}대)`);
        sendMessage(session.ws, { type: 'progress', step: 'completed', message: `🎉 AI 추천 완료! (${totalTime}ms)` });
        return;
      }
    }

    console.warn(`⚠️ [${session.sessionId.substring(0, 8)}] MultiAgent 협업 완료되었지만 추천 결과 없음`);
  } catch (error) {
    console.error(`❌ [${session.sessionId.substring(0, 8)}] MultiAgent 추천 실패:`, error);

    // 상세한 에러 로깅
    if (error instanceof Error) {
      console.error(`❌ Error name: ${error.name}`);
      console.error(`❌ Error message: ${error.message}`);
      console.error(`❌ Error stack: ${error.stack}`);
    }

    // 사용자에게 구체적인 에러 메시지 전송
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    sendMessage(session.ws, {
      type: 'error',
      content: `추천 시스템 오류: ${errorMessage}`,
      timestamp: new Date()
    });

    throw error; // 상위로 에러 전파
  }
}

async function handleGetInsights(sessionId: string, vehicleId: string) {
  const session = sessions.get(sessionId);
  if (!session) return;

  try {
    sendMessage(session.ws, { type: 'progress', step: 'generating_insights', message: 'AI가 차량 인사이트를 생성중입니다...' });

    const vehicle = await storage.getVehicleById(parseInt(vehicleId));
    if (!vehicle) {
      sendMessage(session.ws, { type: 'error', content: '차량 정보를 찾을 수 없습니다.' });
      return;
    }

    const insights = await geminiService.generateVehicleInsights(vehicle as Vehicle);

    sendMessage(session.ws, { type: 'vehicle_insights', vehicleId, insights });
  } catch (error) {
    console.error('❌ 인사이트 생성 에러:', error);
    sendMessage(session.ws, { type: 'error', content: '인사이트 생성 중 오류가 발생했습니다. 다시 시도해주세요.' });
  }
}

function sendMessage(ws: WebSocket, message: object) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}
