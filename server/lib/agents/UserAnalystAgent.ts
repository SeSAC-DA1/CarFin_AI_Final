import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AgentTask, AgentResult } from "./ManagerAgent";

/**
 * User Analyst Agent - MACRec Protocol
 *
 * 역할:
 * 1. 사용자 메시지에서 니즈 추출
 * 2. 선호도 분석
 * 3. 프로필 업데이트
 */
export class UserAnalystAgent {
  private genAI: GoogleGenerativeAI;
  private agentId = 'user_analyst';

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Execute Agent Task
   */
  async execute(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();

    console.log(`🔍 User Analyst Agent: ${task.action} 시작`);

    try {
      let output: any;

      switch (task.action) {
        case 'analyze_user_needs':
          output = await this.analyzeUserNeeds(task.input.userMessage);
          break;

        case 'quick_profile_analysis':
          output = await this.quickProfileAnalysis(task.input.userMessage, task.input.profile);
          break;

        case 'extract_user_needs':
          output = await this.extractUserNeeds(task.input.userMessage);
          break;

        case 'analyze_preferences':
          output = await this.analyzePreferences(task.input.userMessage, task.input.previousNeeds);
          break;

        default:
          throw new Error(`Unknown action: ${task.action}`);
      }

      const executionTime = Date.now() - startTime;

      console.log(`✅ User Analyst Agent: ${task.action} 완료 (${executionTime}ms)`);

      return {
        taskId: task.taskId,
        agent: this.agentId,
        success: true,
        output,
        executionTime,
        timestamp: new Date()
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ User Analyst Agent: ${task.action} 실패`, error);

      return {
        taskId: task.taskId,
        agent: this.agentId,
        success: false,
        output: { error: error instanceof Error ? error.message : 'Unknown error' },
        executionTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * Analyze User Needs (니즈 분석)
   */
  private async analyzeUserNeeds(userMessage: string): Promise<any> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `사용자 메시지를 분석하여 차량 구매 니즈를 파악하세요.

사용자 메시지: "${userMessage}"

다음 JSON 형식으로 응답하세요:
{
  "budget": [최소가격만원, 최대가격만원] | null,
  "carType": "SUV|세단|해치백|쿠페|승합" | null,
  "usage": ["commute", "family", "leisure", "business"] | [],
  "priorities": {
    "price": 1-10,
    "fuelEfficiency": 1-10,
    "safety": 1-10,
    "performance": 1-10,
    "design": 1-10
  },
  "needs_summary": "니즈 요약 1-2문장"
}

**중요**: JSON만 반환하세요.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.warn('⚠️ User Analyst: JSON 파싱 실패, fallback 사용');
      return {
        budget: null,
        carType: null,
        usage: [],
        priorities: {
          price: 5,
          fuelEfficiency: 5,
          safety: 5,
          performance: 5,
          design: 5
        },
        needs_summary: userMessage
      };
    }
  }

  /**
   * Quick Profile Analysis (빠른 프로필 분석)
   */
  private async quickProfileAnalysis(userMessage: string, profile: any): Promise<any> {
    console.log(`⚡ Quick profile analysis: 즉시 검색 가능`);

    return {
      budget: profile.budget || null,
      carType: profile.carType || null,
      usage: profile.usage || [],
      priorities: {
        price: 7,
        fuelEfficiency: 6,
        safety: 8,
        performance: 5,
        design: 5
      },
      needs_summary: `구체적 요청: ${JSON.stringify(profile)}`,
      confidence: 0.9
    };
  }

  /**
   * Extract User Needs (니즈 추출)
   */
  private async extractUserNeeds(userMessage: string): Promise<any> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `다음 사용자 메시지에서 차량 구매 니즈를 간단히 추출하세요:
"${userMessage}"

예산, 용도, 승차인원, 선호 차종 등을 파악하여 1-2문장으로 요약하세요.`;

    const result = await model.generateContent(prompt);
    return {
      needs_text: result.response.text(),
      source: 'llm_extraction'
    };
  }

  /**
   * Analyze Preferences (선호도 분석)
   */
  private async analyzePreferences(userMessage: string, previousNeeds?: any): Promise<any> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `사용자의 라이프스타일과 선호도를 분석하세요:
메시지: "${userMessage}"
${previousNeeds ? `이전 니즈: "${JSON.stringify(previousNeeds)}"` : ''}

가족 구성, 주 사용 목적, 중요 요소(연비/안전/공간 등)를 파악하여 간단히 요약하세요.`;

    const result = await model.generateContent(prompt);
    return {
      preferences_text: result.response.text(),
      source: 'llm_analysis'
    };
  }
}
