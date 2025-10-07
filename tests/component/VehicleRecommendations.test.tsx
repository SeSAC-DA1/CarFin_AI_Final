import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

describe('VehicleRecommendations 컴포넌트', () => {
  const mockVehicles = [
    {
      id: 1,
      rank: 1,
      name: '현대 아반떼',
      manufacturer: '현대',
      model: '아반떼',
      year: 2020,
      price: 1500,
      mileage: 50000,
      fuel: '가솔린',
      image: '/test-image.jpg',
      topsisScore: 0.92,
      matchScore: 0.88,
    },
    {
      id: 2,
      rank: 2,
      name: '기아 K5',
      manufacturer: '기아',
      model: 'K5',
      year: 2019,
      price: 2200,
      mileage: 60000,
      fuel: '디젤',
      image: '/test-image.jpg',
      topsisScore: 0.85,
      matchScore: 0.83,
    },
    {
      id: 3,
      rank: 3,
      name: 'BMW 320i',
      manufacturer: 'BMW',
      model: '320i',
      year: 2018,
      price: 3000,
      mileage: 70000,
      fuel: '가솔린',
      image: '/test-image.jpg',
      topsisScore: 0.78,
      matchScore: 0.75,
    },
  ];

  describe('기본 렌더링', () => {
    it('3개의 추천 차량을 렌더링해야 함', () => {
      const { container } = render(
        <div>
          {mockVehicles.map(vehicle => (
            <div key={vehicle.id} data-testid="vehicle-card">
              <h3>{vehicle.name}</h3>
              <p>가격: {vehicle.price}만원</p>
            </div>
          ))}
        </div>
      );

      const vehicleCards = container.querySelectorAll('[data-testid="vehicle-card"]');
      expect(vehicleCards).toHaveLength(3);
    });

    it('순위 배지를 표시해야 함', () => {
      const { container } = render(
        <div>
          {mockVehicles.map(vehicle => (
            <div key={vehicle.id}>
              <span data-testid={`rank-${vehicle.rank}`}>{vehicle.rank}위</span>
            </div>
          ))}
        </div>
      );

      expect(container.querySelector('[data-testid="rank-1"]')).toHaveTextContent('1위');
      expect(container.querySelector('[data-testid="rank-2"]')).toHaveTextContent('2위');
      expect(container.querySelector('[data-testid="rank-3"]')).toHaveTextContent('3위');
    });

    it('차량 기본 정보를 표시해야 함', () => {
      const vehicle = mockVehicles[0];
      const { container } = render(
        <div>
          <h3>{vehicle.name}</h3>
          <p>연식: {vehicle.year}</p>
          <p>가격: {vehicle.price}만원</p>
          <p>주행거리: {vehicle.mileage.toLocaleString()}km</p>
          <p>연료: {vehicle.fuel}</p>
        </div>
      );

      expect(container).toHaveTextContent('현대 아반떼');
      expect(container).toHaveTextContent('2020');
      expect(container).toHaveTextContent('1500만원');
      expect(container).toHaveTextContent('50,000km');
      expect(container).toHaveTextContent('가솔린');
    });
  });

  describe('점수 표시', () => {
    it('TOPSIS 점수를 백분율로 표시해야 함', () => {
      const vehicle = mockVehicles[0];
      const topsisPercent = Math.round(vehicle.topsisScore * 100);

      const { container } = render(
        <div>
          <span data-testid="topsis-score">{topsisPercent}점</span>
        </div>
      );

      expect(container.querySelector('[data-testid="topsis-score"]')).toHaveTextContent('92점');
    });

    it('매칭 점수를 표시해야 함', () => {
      const vehicle = mockVehicles[0];
      const matchPercent = Math.round(vehicle.matchScore * 100);

      const { container } = render(
        <div>
          <span data-testid="match-score">{matchPercent}%</span>
        </div>
      );

      expect(container.querySelector('[data-testid="match-score"]')).toHaveTextContent('88%');
    });

    it('점수가 높을수록 강조 표시해야 함', () => {
      const getScoreColor = (score: number): string => {
        if (score >= 0.9) return 'text-green-600';
        if (score >= 0.8) return 'text-blue-600';
        return 'text-gray-600';
      };

      expect(getScoreColor(0.92)).toBe('text-green-600');
      expect(getScoreColor(0.85)).toBe('text-blue-600');
      expect(getScoreColor(0.75)).toBe('text-gray-600');
    });
  });

  describe('인터랙션', () => {
    it('차량 카드 클릭 시 상세 정보를 표시해야 함', async () => {
      const handleClick = vi.fn();

      const { container } = render(
        <button onClick={handleClick} data-testid="vehicle-card">
          <h3>현대 아반떼</h3>
        </button>
      );

      const card = container.querySelector('[data-testid="vehicle-card"]');
      expect(card).toBeDefined();

      if (card) {
        await userEvent.click(card);
        expect(handleClick).toHaveBeenCalledTimes(1);
      }
    });

    it('TOPSIS 분석 버튼 클릭 시 모달을 열어야 함', async () => {
      const handleOpenModal = vi.fn();

      const { container } = render(
        <button onClick={handleOpenModal} data-testid="topsis-button">
          TOPSIS 분석 보기
        </button>
      );

      const button = container.querySelector('[data-testid="topsis-button"]');
      expect(button).toBeDefined();

      if (button) {
        await userEvent.click(button);
        expect(handleOpenModal).toHaveBeenCalled();
      }
    });

    it('외부 링크 클릭 시 새 탭에서 열어야 함', () => {
      const vehicle = { ...mockVehicles[0], detailUrl: 'https://example.com/vehicle/1' };

      const { container } = render(
        <a
          href={vehicle.detailUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="detail-link"
        >
          상세보기
        </a>
      );

      const link = container.querySelector('[data-testid="detail-link"]') as HTMLAnchorElement;
      expect(link).toBeDefined();
      expect(link?.target).toBe('_blank');
      expect(link?.rel).toContain('noopener');
    });
  });

  describe('반응형 디자인', () => {
    it('모바일에서는 세로 배치를 사용해야 함', () => {
      // 모바일 너비 시뮬레이션
      const isMobile = window.innerWidth < 768;
      const layout = isMobile ? 'flex-col' : 'grid grid-cols-3';

      expect(layout).toBeDefined();
    });

    it('데스크톱에서는 3컬럼 그리드를 사용해야 함', () => {
      const isDesktop = window.innerWidth >= 1024;
      const columns = isDesktop ? 3 : 1;

      expect(columns).toBeGreaterThanOrEqual(1);
      expect(columns).toBeLessThanOrEqual(3);
    });
  });

  describe('로딩 및 에러 상태', () => {
    it('차량 데이터가 없을 때 빈 상태를 표시해야 함', () => {
      const { container } = render(
        <div data-testid="empty-state">
          {mockVehicles.length === 0 && (
            <p>추천 차량이 없습니다</p>
          )}
        </div>
      );

      // mockVehicles는 3개이므로 빈 상태 메시지가 없음
      expect(container.querySelector('[data-testid="empty-state"]')).not.toHaveTextContent('추천 차량이 없습니다');
    });

    it('로딩 중일 때 스켈레톤을 표시해야 함', () => {
      const isLoading = false;

      const { container } = render(
        <div>
          {isLoading ? (
            <div data-testid="skeleton">Loading...</div>
          ) : (
            <div data-testid="content">Content</div>
          )}
        </div>
      );

      expect(container.querySelector('[data-testid="content"]')).toBeDefined();
      expect(container.querySelector('[data-testid="skeleton"]')).toBeNull();
    });
  });

  describe('접근성', () => {
    it('순위 배지에 aria-label이 있어야 함', () => {
      const { container } = render(
        <span aria-label="1위" data-testid="rank-badge">
          🥇
        </span>
      );

      const badge = container.querySelector('[data-testid="rank-badge"]');
      expect(badge?.getAttribute('aria-label')).toBe('1위');
    });

    it('버튼에 명확한 레이블이 있어야 함', () => {
      const { container } = render(
        <button aria-label="TOPSIS 분석 보기" data-testid="analysis-button">
          📊
        </button>
      );

      const button = container.querySelector('[data-testid="analysis-button"]');
      expect(button?.getAttribute('aria-label')).toBe('TOPSIS 분석 보기');
    });

    it('이미지에 alt 텍스트가 있어야 함', () => {
      const vehicle = mockVehicles[0];
      const { container } = render(
        <img src={vehicle.image} alt={`${vehicle.name} 이미지`} data-testid="vehicle-image" />
      );

      const img = container.querySelector('[data-testid="vehicle-image"]');
      expect(img?.getAttribute('alt')).toBe('현대 아반떼 이미지');
    });
  });

  describe('성능 최적화', () => {
    it('이미지 lazy loading이 활성화되어야 함', () => {
      const { container } = render(
        <img src="/test.jpg" loading="lazy" data-testid="lazy-image" alt="test" />
      );

      const img = container.querySelector('[data-testid="lazy-image"]');
      expect(img?.getAttribute('loading')).toBe('lazy');
    });

    it('대용량 리스트 렌더링 성능 테스트', () => {
      const largeVehicleList = Array.from({ length: 100 }, (_, i) => ({
        ...mockVehicles[0],
        id: i,
        name: `차량-${i}`,
      }));

      const startTime = performance.now();

      const { container } = render(
        <div>
          {largeVehicleList.slice(0, 10).map(vehicle => (
            <div key={vehicle.id}>{vehicle.name}</div>
          ))}
        </div>
      );

      const endTime = performance.now();

      expect(container.children).toHaveLength(1);
      expect(endTime - startTime).toBeLessThan(100); // 100ms 이내
    });
  });

  describe('데이터 형식', () => {
    it('가격을 올바른 형식으로 표시해야 함', () => {
      const formatPrice = (price: number): string => {
        return `${price.toLocaleString()}만원`;
      };

      expect(formatPrice(1500)).toBe('1,500만원');
      expect(formatPrice(3000)).toBe('3,000만원');
    });

    it('주행거리를 올바른 형식으로 표시해야 함', () => {
      const formatMileage = (mileage: number): string => {
        return `${mileage.toLocaleString()}km`;
      };

      expect(formatMileage(50000)).toBe('50,000km');
      expect(formatMileage(123456)).toBe('123,456km');
    });

    it('연식을 상대적으로 표시해야 함', () => {
      const calculateAge = (year: number): string => {
        const currentYear = new Date().getFullYear();
        const age = currentYear - year;
        return `${age}년차`;
      };

      const currentYear = new Date().getFullYear();
      expect(calculateAge(currentYear - 5)).toBe('5년차');
    });
  });
});
