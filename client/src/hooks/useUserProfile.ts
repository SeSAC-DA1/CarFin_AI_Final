import { useState, useEffect } from 'react';

export interface UserProfile {
  name?: string;
  age?: string;
  location?: string;
  budget?: number[];
  usage?: string[];
  importance?: {
    price?: number;
    fuelEfficiency?: number;
    safety?: number;
    design?: number;
    brand?: number;
  };
  preferences?: string[];
  // 🆕 Phase 2: TCO 계산용 주행 프로필
  annualKm?: number;        // 연간 주행거리 (기본: 15000km)
  ownershipYears?: number;  // 보유 기간 (기본: 3년)
}

const PROFILE_STORAGE_KEY = 'carfin_user_profile';

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 로컬 스토리지에서 사용자 프로필 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserProfile(parsed);
      }
    } catch (error) {
      console.error('사용자 프로필 로드 실패:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 사용자 프로필 업데이트
  const updateProfile = (updates: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...updates };
    setUserProfile(updated);

    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('사용자 프로필 저장 실패:', error);
    }
  };

  // 프로필 리셋
  const clearProfile = () => {
    setUserProfile(null);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  };

  // 프로필 완성도 계산
  const getProfileCompleteness = (): number => {
    if (!userProfile) return 0;

    let completedFields = 0;
    let totalFields = 7; // name, age, location, budget, usage, importance, preferences

    if (userProfile.name) completedFields++;
    if (userProfile.age) completedFields++;
    if (userProfile.location) completedFields++;
    if (userProfile.budget && userProfile.budget.length === 2) completedFields++;
    if (userProfile.usage && userProfile.usage.length > 0) completedFields++;
    if (userProfile.importance && Object.keys(userProfile.importance).length > 0) completedFields++;
    if (userProfile.preferences && userProfile.preferences.length > 0) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  };

  // 예산 범위 문자열 생성
  const getBudgetString = (): string => {
    if (!userProfile?.budget || userProfile.budget.length !== 2) {
      return '예산 미설정';
    }
    return `${userProfile.budget[0]}만원 - ${userProfile.budget[1]}만원`;
  };

  // 사용 용도 문자열 생성
  const getUsageString = (): string => {
    if (!userProfile?.usage || userProfile.usage.length === 0) {
      return '용도 미설정';
    }

    const usageMap: { [key: string]: string } = {
      'commute': '출퇴근',
      'family': '가족용',
      'leisure': '레저',
      'business': '업무용',
      'student': '학생용'
    };

    return userProfile.usage.map(u => usageMap[u] || u).join(', ');
  };

  // 중요도 우선순위 계산
  const getTopPriorities = (): string[] => {
    if (!userProfile?.importance) return [];

    const importanceMap: { [key: string]: string } = {
      'price': '가격',
      'fuelEfficiency': '연비',
      'safety': '안전성',
      'design': '디자인',
      'brand': '브랜드'
    };

    return Object.entries(userProfile.importance)
      .filter(([_, value]) => value && value >= 7) // 7점 이상만
      .sort(([_, a], [__, b]) => (b || 0) - (a || 0))
      .slice(0, 3) // 상위 3개
      .map(([key, _]) => importanceMap[key] || key);
  };

  return {
    userProfile,
    isLoaded,
    updateProfile,
    clearProfile,
    getProfileCompleteness,
    getBudgetString,
    getUsageString,
    getTopPriorities
  };
}