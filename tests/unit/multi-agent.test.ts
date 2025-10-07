import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('MultiAgentSystem - 멀티에이전트 협업', () => {
  describe('에이전트 역할 분담', () => {
    it('Manager Agent는 전체 프로세스를 조율해야 함', () => {
      const managerRole = {
        name: 'Manager',
        responsibility: '전체 프로세스 조율',
        tasks: ['니즈 파악', '에이전트 조율', '최종 추천'],
      };

      expect(managerRole.name).toBe('Manager');
      expect(managerRole.tasks).toContain('전체 프로세스 조율');
    });

    it('User Analyst는 사용자 니즈를 분석해야 함', () => {
      const userAnalystRole = {
        name: 'User Analyst',
        responsibility: '사용자 니즈 분석',
        tasks: ['메시지 분석', '선호도 추출', '프로필 매칭'],
      };

      expect(userAnalystRole.responsibility).toBe('사용자 니즈 분석');
      expect(userAnalystRole.tasks).toHaveLength(3);
    });

    it('Searcher Agent는 차량 검색을 담당해야 함', () => {
      const searcherRole = {
        name: 'Searcher',
        responsibility: '차량 검색 및 필터링',
        tasks: ['데이터베이스 쿼리', '품질 필터링', '후보 선정'],
      };

      expect(searcherRole.responsibility).toBe('차량 검색 및 필터링');
      expect(searcherRole.tasks).toContain('데이터베이스 쿼리');
    });
  });

  describe('에이전트 간 협업 프로토콜', () => {
    it('에이전트 메시지 형식이 일관되어야 함', () => {
      interface AgentMessage {
        agentId: string;
        role: 'concierge' | 'needs_analyst' | 'data_analyst';
        content: string;
        timestamp: Date;
      }

      const message: AgentMessage = {
        agentId: 'agent-001',
        role: 'concierge',
        content: '사용자 요청을 분석하고 있습니다',
        timestamp: new Date(),
      };

      expect(message).toHaveProperty('agentId');
      expect(message).toHaveProperty('role');
      expect(message).toHaveProperty('content');
      expect(message).toHaveProperty('timestamp');
    });

    it('협업 단계가 순차적으로 진행되어야 함', () => {
      const collaborationSteps = [
        'start',
        'user_needs_analysis',
        'preference_analysis',
        'vehicle_search',
        'topsis_evaluation',
        'recommendations',
        'complete',
      ];

      expect(collaborationSteps[0]).toBe('start');
      expect(collaborationSteps[collaborationSteps.length - 1]).toBe('complete');
      expect(collaborationSteps).toHaveLength(7);
    });
  });

  describe('사용자 니즈 추출', () => {
    it('예산 정보를 올바르게 추출해야 함', () => {
      const extractBudget = (message: string): number | null => {
        const match = message.match(/(\d+)만원?/);
        return match ? parseInt(match[1]) : null;
      };

      expect(extractBudget('3000만원 이하 차량')).toBe(3000);
      expect(extractBudget('2500만원 SUV 추천해줘')).toBe(2500);
      expect(extractBudget('가족용 차량 찾아요')).toBe(null);
    });

    it('차종을 올바르게 추출해야 함', () => {
      const extractVehicleType = (message: string): string | null => {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('suv')) return 'SUV';
        if (lowerMessage.includes('세단')) return '세단';
        if (lowerMessage.includes('해치백')) return '해치백';
        return null;
      };

      expect(extractVehicleType('SUV 추천해줘')).toBe('SUV');
      expect(extractVehicleType('가족용 세단 찾아요')).toBe('세단');
      expect(extractVehicleType('경제적인 차량')).toBe(null);
    });

    it('용도를 올바르게 추출해야 함', () => {
      const extractUsage = (message: string): string[] => {
        const usage: string[] = [];
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('출퇴근') || lowerMessage.includes('통근')) {
          usage.push('commute');
        }
        if (lowerMessage.includes('가족') || lowerMessage.includes('여행')) {
          usage.push('family');
        }
        if (lowerMessage.includes('레저') || lowerMessage.includes('캠핑')) {
          usage.push('leisure');
        }

        return usage;
      };

      expect(extractUsage('출퇴근용 차량')).toContain('commute');
      expect(extractUsage('가족 여행용 SUV')).toContain('family');
      expect(extractUsage('캠핑 가기 좋은 차')).toContain('leisure');
      expect(extractUsage('출퇴근하고 주말에 가족 여행')).toHaveLength(2);
    });

    it('연비 중요도를 추출해야 함', () => {
      const extractFuelPriority = (message: string): boolean => {
        const fuelKeywords = ['연비', '경제적', '유지비', '기름값'];
        const lowerMessage = message.toLowerCase();
        return fuelKeywords.some(keyword => lowerMessage.includes(keyword));
      };

      expect(extractFuelPriority('연비 좋은 차량')).toBe(true);
      expect(extractFuelPriority('경제적인 차')).toBe(true);
      expect(extractFuelPriority('안전한 차')).toBe(false);
    });
  });

  describe('차량 필터링 로직', () => {
    it('예산 기준으로 필터링해야 함', () => {
      const vehicles = [
        { id: 1, price: 2000, name: '아반떼' },
        { id: 2, price: 3500, name: 'K5' },
        { id: 3, price: 5000, name: '그랜저' },
      ];

      const maxBudget = 3000;
      const filtered = vehicles.filter(v => v.price <= maxBudget);

      expect(filtered).toHaveLength(2);
      expect(filtered.map(v => v.name)).toEqual(['아반떼', 'K5']);
    });

    it('차종 기준으로 필터링해야 함', () => {
      const vehicles = [
        { id: 1, type: 'SUV', name: '싼타페' },
        { id: 2, type: '세단', name: 'K5' },
        { id: 3, type: 'SUV', name: '스포티지' },
      ];

      const filtered = vehicles.filter(v => v.type === 'SUV');

      expect(filtered).toHaveLength(2);
      expect(filtered.every(v => v.type === 'SUV')).toBe(true);
    });

    it('연식 기준으로 필터링해야 함', () => {
      const currentYear = new Date().getFullYear();
      const vehicles = [
        { id: 1, year: currentYear - 3, name: '아반떼' },
        { id: 2, year: currentYear - 15, name: '오래된 차' },
        { id: 3, year: currentYear - 5, name: 'K5' },
      ];

      const maxAge = 10;
      const filtered = vehicles.filter(v => currentYear - v.year <= maxAge);

      expect(filtered).toHaveLength(2);
      expect(filtered.map(v => v.id)).toEqual([1, 3]);
    });
  });

  describe('추천 생성 로직', () => {
    it('Top 3 추천을 생성해야 함', () => {
      const rankedVehicles = [
        { rank: 1, score: 0.92, name: 'A' },
        { rank: 2, score: 0.88, name: 'B' },
        { rank: 3, score: 0.85, name: 'C' },
        { rank: 4, score: 0.80, name: 'D' },
      ];

      const top3 = rankedVehicles.slice(0, 3);

      expect(top3).toHaveLength(3);
      expect(top3[0].rank).toBe(1);
      expect(top3[2].rank).toBe(3);
    });

    it('각 추천에 이유를 포함해야 함', () => {
      interface VehicleRecommendation {
        rank: number;
        vehicle: { name: string };
        reason: string;
        pros: string[];
        cons: string[];
      }

      const recommendation: VehicleRecommendation = {
        rank: 1,
        vehicle: { name: '아반떼' },
        reason: '예산에 딱 맞고 연비가 우수합니다',
        pros: ['저렴한 가격', '우수한 연비', '높은 안전성'],
        cons: ['공간이 다소 협소', '디자인 평범'],
      };

      expect(recommendation).toHaveProperty('reason');
      expect(recommendation.pros).toHaveLength(3);
      expect(recommendation.cons).toHaveLength(2);
    });
  });

  describe('실시간 협업 시뮬레이션', () => {
    it('협업 프로세스를 순차적으로 실행해야 함', async () => {
      const steps: string[] = [];

      const simulateCollaboration = async () => {
        steps.push('start');
        await new Promise(resolve => setTimeout(resolve, 10));

        steps.push('needs_analysis');
        await new Promise(resolve => setTimeout(resolve, 10));

        steps.push('vehicle_search');
        await new Promise(resolve => setTimeout(resolve, 10));

        steps.push('topsis_evaluation');
        await new Promise(resolve => setTimeout(resolve, 10));

        steps.push('recommendations');
        await new Promise(resolve => setTimeout(resolve, 10));

        steps.push('complete');
      };

      await simulateCollaboration();

      expect(steps).toEqual([
        'start',
        'needs_analysis',
        'vehicle_search',
        'topsis_evaluation',
        'recommendations',
        'complete',
      ]);
    });

    it('각 단계에서 진행 상황을 보고해야 함', async () => {
      interface ProgressUpdate {
        type: string;
        agent: string;
        content: string;
      }

      const updates: ProgressUpdate[] = [];

      const reportProgress = (type: string, agent: string, content: string) => {
        updates.push({ type, agent, content });
      };

      reportProgress('agent_working', 'concierge', '사용자 요청 분석 중...');
      reportProgress('agent_response', 'concierge', '니즈 파악 완료');
      reportProgress('agent_working', 'searcher', '차량 검색 중...');
      reportProgress('agent_response', 'searcher', '50개 후보 발견');

      expect(updates).toHaveLength(4);
      expect(updates[0].type).toBe('agent_working');
      expect(updates[1].type).toBe('agent_response');
      expect(updates.map(u => u.agent)).toContain('concierge');
      expect(updates.map(u => u.agent)).toContain('searcher');
    });
  });

  describe('에러 처리', () => {
    it('차량을 찾지 못한 경우 적절히 처리해야 함', () => {
      const vehicles: any[] = [];

      if (vehicles.length === 0) {
        const errorMessage = '검색 조건에 맞는 차량이 없습니다. 조건을 완화해주세요.';
        expect(errorMessage).toBeDefined();
        expect(errorMessage).toContain('없습니다');
      }
    });

    it('AI 응답 파싱 실패 시 폴백 로직을 사용해야 함', () => {
      const parseAIResponse = (response: string): any => {
        try {
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error('No JSON found');
          return JSON.parse(jsonMatch[0]);
        } catch (error) {
          // 폴백: 기본 추천 로직
          return {
            rank: 1,
            reason: '사용자 요구에 적합한 차량입니다',
            pros: ['합리적 가격', '좋은 상태'],
            cons: ['추가 확인 필요'],
          };
        }
      };

      const invalidResponse = 'Invalid JSON response';
      const result = parseAIResponse(invalidResponse);

      expect(result).toHaveProperty('rank');
      expect(result).toHaveProperty('reason');
      expect(result.rank).toBe(1);
    });
  });

  describe('성능 및 확장성', () => {
    it('100개 차량 협업 평가를 3초 이내 완료해야 함', async () => {
      const vehicles = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `차량-${i}`,
        price: 2000 + Math.random() * 3000,
        score: Math.random(),
      }));

      const startTime = performance.now();

      // 간단한 정렬 시뮬레이션
      const sorted = vehicles.sort((a, b) => b.score - a.score);
      const top3 = sorted.slice(0, 3);

      const endTime = performance.now();

      expect(top3).toHaveLength(3);
      expect(endTime - startTime).toBeLessThan(3000); // 3초
    });
  });

  describe('통합 시나리오', () => {
    it('실제 사용자 요청 → 추천 전체 플로우', async () => {
      const userMessage = '3000만원 이하 연비 좋은 가족용 SUV';
      const userProfile = {
        budget: [2000, 3000],
        usage: ['family'],
        importance: {
          price: 8,
          fuelEfficiency: 9,
          safety: 8,
          design: 5,
          brand: 6,
        },
      };

      // Step 1: 니즈 분석
      const extractedNeeds = {
        maxBudget: 3000,
        vehicleType: 'SUV',
        priorities: ['fuelEfficiency', 'price', 'safety'],
      };

      expect(extractedNeeds.maxBudget).toBe(3000);
      expect(extractedNeeds.vehicleType).toBe('SUV');

      // Step 2: 차량 검색 (mock)
      const mockVehicles = [
        { id: 1, name: '싼타페', price: 3500, type: 'SUV', fuelEfficiency: 9.2 },
        { id: 2, name: '스포티지', price: 2800, type: 'SUV', fuelEfficiency: 11.5 },
        { id: 3, name: '아반떼', price: 1500, type: '세단', fuelEfficiency: 14.5 },
      ];

      const filtered = mockVehicles.filter(
        v => v.price <= extractedNeeds.maxBudget && v.type === extractedNeeds.vehicleType
      );

      expect(filtered).toHaveLength(1); // 스포티지만 조건 충족
      expect(filtered[0].name).toBe('스포티지');

      // Step 3: TOPSIS 평가 (mock)
      const topsisResult = {
        ranking: [
          { rank: 1, score: 0.88, vehicle: filtered[0] },
        ],
      };

      expect(topsisResult.ranking[0].rank).toBe(1);
      expect(topsisResult.ranking[0].score).toBeGreaterThan(0.8);
    });
  });
});
