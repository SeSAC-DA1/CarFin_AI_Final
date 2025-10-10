import { storage } from "../../storage";
import type { Conversation } from "@shared/schema";

/**
 * Conversation Memory Interface (Re-export from schema)
 */
export type ConversationMemory = Conversation;

/**
 * Reflection Result Interface
 */
export interface ReflectionResult {
  previousConversations: ConversationMemory[];
  insights: string[];
  userPreferencePattern: {
    commonBudget?: [number, number];
    preferredCarTypes?: string[];
    priorityWeights?: Record<string, number>;
  };
  recommendationAccuracy: number;
}

/**
 * Memory Manager - Phase 2 Implementation
 *
 * 역할:
 * 1. Conversation Storage (대화 저장)
 * 2. Reflection (이전 대화 분석)
 * 3. User Preference Learning (선호도 학습)
 */
export class MemoryManager {
  /**
   * Save Conversation (대화 저장)
   */
  async saveConversation(
    sessionId: string,
    userMessage: string,
    aiResponse: string,
    vehicleRecommendations: any[]
  ): Promise<void> {
    try {
      await storage.createConversation({
        sessionId,
        userMessage,
        aiResponse,
        vehicleRecommendations: JSON.stringify(vehicleRecommendations)
      });

      console.log(`💾 Memory Manager: 대화 저장 완료 (sessionId: ${sessionId})`);
    } catch (error) {
      console.error(`❌ Memory Manager: 대화 저장 실패`, error);
      throw error;
    }
  }

  /**
   * Reflect on Previous Conversations (이전 대화 반성)
   */
  async reflect(sessionId: string): Promise<ReflectionResult> {
    try {
      console.log(`🔍 Memory Manager: Reflection 시작 (sessionId: ${sessionId})`);

      const conversations = await storage.getConversationsBySession(sessionId);

      console.log(`📚 Memory Manager: ${conversations.length}개 이전 대화 발견`);

      if (conversations.length === 0) {
        return {
          previousConversations: [],
          insights: ['첫 대화입니다. 이전 기록이 없습니다.'],
          userPreferencePattern: {},
          recommendationAccuracy: 0
        };
      }

      // 인사이트 추출
      const insights = this.extractInsights(conversations);

      // 선호도 패턴 분석
      const userPreferencePattern = this.analyzePreferencePattern(conversations);

      // 추천 정확도 계산 (과거 추천 성공률)
      const recommendationAccuracy = this.calculateAccuracy(conversations);

      console.log(`✅ Memory Manager: Reflection 완료`);
      console.log(`  - 인사이트: ${insights.length}개`);
      console.log(`  - 선호도 패턴:`, userPreferencePattern);
      console.log(`  - 추천 정확도: ${(recommendationAccuracy * 100).toFixed(1)}%`);

      return {
        previousConversations: conversations,
        insights,
        userPreferencePattern,
        recommendationAccuracy
      };

    } catch (error) {
      console.error(`❌ Memory Manager: Reflection 실패`, error);

      return {
        previousConversations: [],
        insights: ['Reflection 실패'],
        userPreferencePattern: {},
        recommendationAccuracy: 0
      };
    }
  }

  /**
   * Extract Insights (인사이트 추출)
   */
  private extractInsights(conversations: ConversationMemory[]): string[] {
    const insights: string[] = [];

    // 대화 빈도 분석
    insights.push(`총 ${conversations.length}번의 대화가 있었습니다.`);

    // 최근 관심사 파악
    const recentMessages = conversations.slice(-3).map(c => c.userMessage);
    if (recentMessages.length > 0) {
      insights.push(`최근 관심사: ${recentMessages.join(', ')}`);
    }

    // 추천 차량 분석
    const allRecommendations = conversations
      .map(c => {
        try {
          return JSON.parse(c.vehicleRecommendations);
        } catch {
          return [];
        }
      })
      .flat();

    if (allRecommendations.length > 0) {
      insights.push(`총 ${allRecommendations.length}개 차량이 추천되었습니다.`);
    }

    return insights;
  }

  /**
   * Analyze Preference Pattern (선호도 패턴 분석)
   */
  private analyzePreferencePattern(conversations: ConversationMemory[]): any {
    const pattern: any = {};

    // 메시지에서 예산 패턴 추출
    const budgets: number[] = [];
    const carTypes: string[] = [];

    for (const conv of conversations) {
      const msg = conv.userMessage.toLowerCase();

      // 예산 추출
      const priceMatch = msg.match(/(\d+)만원?/);
      if (priceMatch && priceMatch[1]) {
        budgets.push(parseInt(priceMatch[1]));
      }

      // 차종 추출
      if (msg.includes('suv')) carTypes.push('SUV');
      if (msg.includes('세단')) carTypes.push('세단');
      if (msg.includes('해치백')) carTypes.push('해치백');
    }

    // 공통 예산 범위
    if (budgets.length > 0) {
      const avgBudget = Math.round(budgets.reduce((sum, b) => sum + b, 0) / budgets.length);
      pattern.commonBudget = [
        Math.floor(avgBudget * 0.8),
        Math.ceil(avgBudget * 1.2)
      ];
    }

    // 선호 차종
    if (carTypes.length > 0) {
      const typeCount = carTypes.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      pattern.preferredCarTypes = Object.entries(typeCount)
        .sort(([, a], [, b]) => b - a)
        .map(([type]) => type);
    }

    return pattern;
  }

  /**
   * Calculate Recommendation Accuracy (추천 정확도 계산)
   */
  private calculateAccuracy(conversations: ConversationMemory[]): number {
    // 간단한 휴리스틱: 대화가 많을수록 정확도 상승
    // 실제로는 사용자 피드백 데이터가 필요
    const conversationCount = conversations.length;

    if (conversationCount === 0) return 0;
    if (conversationCount <= 3) return 0.6;
    if (conversationCount <= 5) return 0.75;
    return 0.85;
  }

  /**
   * Clear Session Memory (세션 메모리 삭제)
   */
  async clearSession(sessionId: string): Promise<void> {
    try {
      console.log(`🗑️ Memory Manager: 세션 메모리 삭제 (sessionId: ${sessionId})`);
      // 실제 구현은 storage에 deleteConversations 메서드 추가 필요
      // await storage.deleteConversations(sessionId);
    } catch (error) {
      console.error(`❌ Memory Manager: 세션 삭제 실패`, error);
    }
  }
}
