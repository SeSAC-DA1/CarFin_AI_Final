import { GoogleGenerativeAI } from "@google/generative-ai";
import type { HyundaiReview } from "@shared/schema";
import { storage } from "../../storage";

/**
 * Review Summary Interface
 */
export interface ReviewSummary {
  model: string;
  totalReviews: number;
  averageSatisfaction: number;
  positive: string[];
  negative: string[];
  summary: string;
  confidence: number;
}

/**
 * Reviewer Agent - Phase 2 Implementation
 *
 * 역할:
 * 1. 6,121개 리뷰 데이터 검색 (SQL)
 * 2. Gemini를 활용한 감성 분석
 * 3. 긍정/부정 키워드 추출
 */
export class ReviewerAgent {
  private genAI: GoogleGenerativeAI;
  private agentId = 'reviewer';

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Analyze Reviews for Model (모델별 리뷰 분석)
   */
  async analyzeReviews(model: string): Promise<ReviewSummary> {
    console.log(`📝 Reviewer Agent: "${model}" 리뷰 분석 시작`);

    try {
      // 1. SQL로 모델별 리뷰 검색
      const reviews = await storage.getReviewsByModel(model);

      console.log(`📚 발견된 리뷰: ${reviews.length}개`);

      if (reviews.length === 0) {
        return {
          model,
          totalReviews: 0,
          averageSatisfaction: 0,
          positive: ['리뷰 데이터 없음'],
          negative: [],
          summary: `"${model}"에 대한 리뷰가 없습니다.`,
          confidence: 0
        };
      }

      // 2. 평균 만족도 계산
      const avgSatisfaction = reviews.reduce((sum, r) => sum + (r.satisfaction || 0), 0) / reviews.length;

      // 3. Gemini 감성 분석
      const sentiment = await this.analyzeSentiment(model, reviews.slice(0, 100)); // 최대 100개

      console.log(`✅ Reviewer Agent: 분석 완료`);
      console.log(`  - 평균 만족도: ${avgSatisfaction.toFixed(2)}/5.0`);
      console.log(`  - 긍정: ${sentiment.positive.length}개`);
      console.log(`  - 부정: ${sentiment.negative.length}개`);

      return {
        model,
        totalReviews: reviews.length,
        averageSatisfaction: avgSatisfaction,
        positive: sentiment.positive,
        negative: sentiment.negative,
        summary: sentiment.summary,
        confidence: this.calculateConfidence(reviews.length)
      };

    } catch (error) {
      console.error(`❌ Reviewer Agent: 리뷰 분석 실패`, error);

      return {
        model,
        totalReviews: 0,
        averageSatisfaction: 0,
        positive: [],
        negative: [],
        summary: `리뷰 분석 실패: ${error instanceof Error ? error.message : 'Unknown error'}`,
        confidence: 0
      };
    }
  }

  /**
   * Analyze Sentiment with Gemini (Gemini 감성 분석)
   */
  private async analyzeSentiment(model: string, reviews: HyundaiReview[]): Promise<{
    positive: string[];
    negative: string[];
    summary: string;
  }> {
    const modelAI = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 리뷰 텍스트 추출
    const reviewTexts = reviews
      .map(r => r.review)
      .filter(r => r && r.length > 0)
      .slice(0, 50); // 최대 50개 리뷰 분석

    if (reviewTexts.length === 0) {
      return {
        positive: ['리뷰 텍스트 없음'],
        negative: [],
        summary: '리뷰 텍스트가 없습니다.'
      };
    }

    const prompt = `차량 모델 "${model}"에 대한 실사용자 리뷰를 분석하세요.

리뷰 (${reviewTexts.length}개):
${reviewTexts.slice(0, 30).map((r, i) => `${i + 1}. ${r}`).join('\n')}

다음 JSON 형식으로 응답하세요:
{
  "positive": ["장점1", "장점2", "장점3"],
  "negative": ["단점1", "단점2"],
  "summary": "한 줄 요약"
}

**중요**:
- positive는 3-5개 핵심 장점만 추출
- negative는 2-3개 주요 단점만 추출
- summary는 1문장으로 요약
- JSON만 반환하세요.`;

    try {
      const result = await modelAI.generateContent(prompt);
      const text = result.response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        positive: parsed.positive || [],
        negative: parsed.negative || [],
        summary: parsed.summary || ''
      };

    } catch (error) {
      console.warn('⚠️ Reviewer Agent: Gemini 분석 실패, fallback 사용');

      // Fallback: 키워드 기반 간단한 분석
      return this.fallbackSentimentAnalysis(reviewTexts);
    }
  }

  /**
   * Fallback Sentiment Analysis (키워드 기반)
   */
  private fallbackSentimentAnalysis(reviewTexts: string[]): {
    positive: string[];
    negative: string[];
    summary: string;
  } {
    const positiveKeywords = ['좋', '만족', '추천', '편한', '넓', '괜찮', '최고', '우수'];
    const negativeKeywords = ['불만', '아쉬', '나쁨', '부족', '문제', '고장', '소음'];

    const combined = reviewTexts.join(' ').toLowerCase();

    const positive: string[] = [];
    const negative: string[] = [];

    if (combined.includes('공간') && positiveKeywords.some(k => combined.includes(k))) {
      positive.push('넓은 공간');
    }
    if (combined.includes('연비') && positiveKeywords.some(k => combined.includes(k))) {
      positive.push('좋은 연비');
    }
    if (combined.includes('안전') && positiveKeywords.some(k => combined.includes(k))) {
      positive.push('우수한 안전성');
    }

    if (combined.includes('소음') && negativeKeywords.some(k => combined.includes(k))) {
      negative.push('소음 문제');
    }
    if (combined.includes('연비') && negativeKeywords.some(k => combined.includes(k))) {
      negative.push('연비 아쉬움');
    }

    if (positive.length === 0) positive.push('전반적으로 양호');
    if (negative.length === 0) negative.push('특별한 단점 없음');

    return {
      positive,
      negative,
      summary: `총 ${reviewTexts.length}개 리뷰 분석 결과`
    };
  }

  /**
   * Calculate Confidence (신뢰도 계산)
   */
  private calculateConfidence(reviewCount: number): number {
    if (reviewCount === 0) return 0;
    if (reviewCount < 10) return 0.5;
    if (reviewCount < 50) return 0.7;
    if (reviewCount < 100) return 0.85;
    return 0.95;
  }
}
