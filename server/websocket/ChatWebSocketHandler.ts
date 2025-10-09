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
  console.log(`🔌 WebSocket 연결: ${sessionId}`);

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

  ws.on('message', async (data: string) => {
    try {
      const message = JSON.parse(data);
      console.log(`📨 [${sessionId.substring(0, 8)}] 메시지 수신:`, message.type);

      if (message.type === 'user_message') {
        console.log(`💬 [${sessionId.substring(0, 8)}] 사용자 메시지:`, message.content.substring(0, 50));
        await handleUserMessage(sessionId, message.content, message.userProfile);
      } else if (message.type === 'get_insights') {
        console.log(`🔍 [${sessionId.substring(0, 8)}] Insights 요청:`, message.vehicleId);
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

    // ✅ 핵심 개선: 최소 정보가 있으면 즉시 추천
    const hasMinimalInfo = session.rawProfile && (
      session.rawProfile.budget?.length > 0 ||
      session.rawProfile.usage?.length > 0 ||
      session.rawProfile.carType ||
      userMessage.length > 10  // 사용자가 의미있는 메시지를 보냈다면
    );

    if (hasMinimalInfo) {
      console.log('✅ 최소 정보 확보 → 추천 시스템 실행');
      await handleMultiAgentRecommendation(session, userMessage);

      // 추천 완료 후 추가 정보가 필요하면 자연스럽게 질문 (선택사항)
      if (completenessReport.completenessScore < 60 && completenessReport.nextQuestionPriority) {
        const nextField = completenessReport.nextQuestionPriority;

        // Essential 필드는 건너뛰고, Important/Optional만 질문
        if (nextField.category !== 'essential' && session.lastQuestionAsked !== nextField.name) {
          try {
            const questionEngine = new SmartQuestionEngine(process.env.GOOGLE_API_KEY!);
            const smartQuestion = await questionEngine.generateSmartQuestion(nextField, {
              missingField: nextField,
              conversationHistory: session.conversationHistory,
              userLastMessage: userMessage,
              currentProfile: session.rawProfile,
            });

            console.log(`💬 추가 정보 질문 (선택): ${smartQuestion.question}`);
            session.lastQuestionAsked = nextField.name;

            sendMessage(session.ws, {
              type: 'agent_message',
              agent: 'concierge',
              content: `\n\n더 정확한 추천을 위해 추가 정보를 알려주시면 좋을 것 같아요!\n${smartQuestion.question}`,
              timestamp: new Date(),
            });
          } catch (questionError) {
            console.warn('⚠️ 추가 질문 생성 실패 (무시):', questionError);
          }
        }
      }
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
    sendMessage(session.ws, {
      type: 'agent_message',
      agent: 'system',
      content: '죄송합니다. 잠시 문제가 발생했습니다. 어떤 차량을 찾고 계신지 다시 말씀해주시겠어요?',
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

  sendMessage(session.ws, { type: 'progress', step: 'analyzing_needs', message: '🤖 멀티에이전트 시스템 가동... ' });

  console.time('[STEP 1/5] Database Query');
  const allVehicles = await storage.searchVehicles({ limit: 1000, offset: 0 }) as Vehicle[];
  console.timeEnd('[STEP 1/5] Database Query');
  console.log(`📊 데이터 로딩 완료: ${allVehicles.length}개 차량, ${Date.now() - startTime}ms`);

  console.time('[STEP 2/5] MultiAgent System Init');
  const multiAgentSystem = new MultiAgentSystem(process.env.GOOGLE_API_KEY!);
  console.timeEnd('[STEP 2/5] MultiAgent System Init');

  console.time('[STEP 3/5] MultiAgent Collaboration');
  const collaborationStream = multiAgentSystem.collaborate(userMessage, allVehicles, [], session.userProfile);

  for await (const step of collaborationStream) {
    console.log(`🤖 [${session.sessionId.substring(0, 8)}] ${step.agent}: ${step.type}`);

    if (step.type === 'agent_working') {
      sendMessage(session.ws, { type: 'progress', step: step.agent, message: step.content });
    } else if (step.type === 'agent_response') {
      sendMessage(session.ws, { type: 'agent_message', agent: step.agent, content: step.content, timestamp: new Date() });
    } else if (step.type === 'recommendations' && step.data) {
      console.timeEnd('[STEP 3/5] MultiAgent Collaboration');
      console.time('[STEP 4/5] Vehicle Data Mapping');

      const vehicles = step.data.vehicles.map((rec: VehicleRecommendation) => ({
        ...rec.vehicle,
        rank: rec.rank, // ✅ 랭킹 추가!
        image: getVehicleImage(rec.vehicle.manufacturer, rec.vehicle.photo),
        topsisScore: rec.topsisScore,
        matchingScore: rec.matchingScore,
        matchScore: rec.matchingScore, // ✅ matchScore도 추가 (프론트 호환성)
        reason: rec.reason,
        pros: rec.pros,
        cons: rec.cons
      }));

      console.timeEnd('[STEP 4/5] Vehicle Data Mapping');
      console.time('[STEP 5/5] Send Results');
      sendMessage(session.ws, { type: 'vehicles', vehicles: vehicles, timestamp: new Date() });
      console.timeEnd('[STEP 5/5] Send Results');

      const totalTime = Date.now() - startTime;
      console.timeEnd('[TOTAL] Recommendation');
      console.log(`✅ [${session.sessionId.substring(0, 8)}] 추천 완료: ${totalTime}ms (${vehicles.length}대)`);
      sendMessage(session.ws, { type: 'progress', step: 'completed', message: `🎉 AI 추천 완료! (${totalTime}ms)` });
      return;
    }
  }

  console.warn(`⚠️ [${session.sessionId.substring(0, 8)}] MultiAgent 협업 완료되었지만 추천 결과 없음`);
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
