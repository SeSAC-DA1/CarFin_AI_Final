import { useState, useEffect } from 'react';

export interface ConversationSession {
  id: string;
  title: string;
  timestamp: Date;
  vehicleCount: number;
  userProfile?: {
    budget?: number[];
    usage?: string[];
    preferences?: string[];
  };
  lastMessage?: string;
}

const STORAGE_KEY = 'carfin_conversation_history';

export function useConversationHistory() {
  const [conversations, setConversations] = useState<ConversationSession[]>([]);

  // 로컬 스토리지에서 대화 히스토리 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Date 객체 복원
        const restored = parsed.map((conv: any) => ({
          ...conv,
          timestamp: new Date(conv.timestamp)
        }));
        setConversations(restored);
      }
    } catch (error) {
      console.error('대화 히스토리 로드 실패:', error);
    }
  }, []);

  // 대화 히스토리를 로컬 스토리지에 저장
  const saveToStorage = (newConversations: ConversationSession[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConversations));
    } catch (error) {
      console.error('대화 히스토리 저장 실패:', error);
    }
  };

  // 새 대화 세션 시작
  const startNewConversation = (title: string, userProfile?: any): string => {
    const newSession: ConversationSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.length > 30 ? title.substring(0, 30) + '...' : title,
      timestamp: new Date(),
      vehicleCount: 0,
      userProfile,
      lastMessage: title
    };

    const updated = [newSession, ...conversations].slice(0, 50); // 최대 50개 세션 유지
    setConversations(updated);
    saveToStorage(updated);
    return newSession.id;
  };

  // 대화 세션 업데이트 (차량 개수, 마지막 메시지 등)
  const updateConversation = (sessionId: string, updates: Partial<ConversationSession>) => {
    const updated = conversations.map(conv =>
      conv.id === sessionId
        ? { ...conv, ...updates, timestamp: new Date() }
        : conv
    );
    setConversations(updated);
    saveToStorage(updated);
  };

  // 대화 세션 삭제
  const deleteConversation = (sessionId: string) => {
    const updated = conversations.filter(conv => conv.id !== sessionId);
    setConversations(updated);
    saveToStorage(updated);
  };

  // 모든 히스토리 삭제
  const clearAllHistory = () => {
    setConversations([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // 대화 세션 선택
  const selectConversation = (sessionId: string) => {
    const session = conversations.find(conv => conv.id === sessionId);
    return session;
  };

  return {
    conversations,
    startNewConversation,
    updateConversation,
    deleteConversation,
    clearAllHistory,
    selectConversation
  };
}