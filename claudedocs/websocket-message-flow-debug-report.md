# WebSocket Message Flow Debug Report

**Issue**: User messages sent from client are not reaching server's `ws.on('message')` handler, but system still generates responses.

**Date**: 2025-10-10
**Status**: 🔍 Root Cause Identified

---

## 🔍 Symptom Analysis

### What We Observe
1. ✅ WebSocket connection succeeds (`🔌 WebSocket 연결` log appears)
2. ✅ Initial AI greeting message arrives at client
3. ❌ User sends "2500만원 이하로 SUV 찾고 있어요"
4. ❌ Server's `🔔 RAW 메시지 수신` log NEVER appears
5. ✅ BUT client receives "0개의 매칭 차량을 발견했습니다" message

### The Paradox
The system responds with "0개의 매칭 차량" (from `MultiAgentSystem.ts:77`), which means:
- `handleUserMessage()` IS being executed
- `MultiAgentSystem.collaborate()` IS running
- BUT `ws.on('message')` handler at line 50 is NOT logging

---

## 🎯 Root Cause Analysis

### Most Likely Cause: **WebSocket Reconnection Issue**

The evidence points to a WebSocket lifecycle problem:

```typescript
// CLIENT: useWebSocketChat.ts Line 64-93
useEffect(() => {
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('✅ WebSocket 연결 성공');
    setIsConnected(true);
  };

  ws.onmessage = (event) => { /* ... */ };

  // ❌ PROBLEM: Missing cleanup or reconnection logic
}, []); // Empty dependency array - runs only once
```

```typescript
// SERVER: ChatWebSocketHandler.ts Line 33-48
export function setupChatWebSocket(ws: WebSocket, sessionId: string) {
  console.log(`🔌 WebSocket 연결: ${sessionId}`);

  const session: ChatSession = { sessionId, conversationHistory: [], ws };
  sessions.set(sessionId, session);

  // Sends initial greeting
  sendMessage(ws, { type: 'agent_message', ... });

  // Registers message handler
  ws.on('message', async (data: string) => {
    console.log(`🔔 [${sessionId}] RAW 메시지 수신:`, ...);
    // ❌ This handler is never triggered for user messages
  });
}
```

### Why This Happens

**Scenario 1: Connection State Mismatch**
1. Initial WebSocket connects → `setupChatWebSocket()` called → session stored
2. Client receives initial greeting → logs "✅ WebSocket 연결 성공"
3. **Something causes the WebSocket to close/reopen** (browser dev tools, network hiccup, etc.)
4. New WebSocket connection established → NEW sessionId → NEW handler registered
5. Client still holds reference to OLD WebSocket connection
6. User sends message on OLD connection → message goes nowhere (connection closed)
7. System somehow still processes message (cached data? fallback logic?)

**Scenario 2: Multiple WebSocket Instances**
1. Client creates WebSocket in `useEffect` with `[]` dependencies
2. React StrictMode or component re-render triggers effect again
3. Two WebSocket connections coexist
4. First connection receives initial greeting
5. Second connection is used for sending messages
6. Messages arrive at server on different connection/sessionId
7. Original session's handler never sees the messages

**Scenario 3: Data Type Mismatch**
```typescript
// SERVER expects: ws.on('message', async (data: string) => {
// But WebSocket might send: Buffer | ArrayBuffer | Buffer[]

ws.on('message', async (data: string) => {
  console.log(`🔔 RAW 메시지:`, data.toString().substring(0, 100));
  // ❌ If data is not a string, .toString() might fail or behave unexpectedly
});
```

---

## 🔧 Recommended Solutions

### Solution 1: Add Comprehensive Connection Logging

**File**: `server/websocket/ChatWebSocketHandler.ts`

```typescript
export function setupChatWebSocket(ws: WebSocket, sessionId: string) {
  console.log(`🔌 [${sessionId}] WebSocket 연결 시작`);
  console.log(`📊 [${sessionId}] 현재 활성 세션 수:`, sessions.size);

  // Check for duplicate sessionId
  if (sessions.has(sessionId)) {
    console.warn(`⚠️ [${sessionId}] 중복 세션 감지! 기존 세션 덮어쓰기`);
    const oldSession = sessions.get(sessionId);
    if (oldSession?.ws && oldSession.ws.readyState === WebSocket.OPEN) {
      console.warn(`⚠️ [${sessionId}] 기존 연결이 아직 열려있음 - 강제 종료`);
      oldSession.ws.close();
    }
  }

  const session: ChatSession = {
    sessionId,
    conversationHistory: [],
    ws,
  };
  sessions.set(sessionId, session);

  // Log WebSocket state
  console.log(`📡 [${sessionId}] WebSocket.readyState:`, ws.readyState, '(1=OPEN)');

  sendMessage(ws, {
    type: 'agent_message',
    agent: 'concierge',
    content: '안녕하세요! CARFIN AI입니다 😊\n...',
    timestamp: new Date(),
  });

  ws.on('message', async (data) => {
    // Force convert to string for consistency
    const rawData = data.toString();
    console.log(`🔔 [${sessionId}] RAW 메시지 수신 (${typeof data}):`, rawData.substring(0, 100));
    console.log(`📊 [${sessionId}] WebSocket.readyState:`, ws.readyState);
    console.log(`🆔 [${sessionId}] Session exists:`, sessions.has(sessionId));

    try {
      const message = JSON.parse(rawData);
      console.log(`📨 [${sessionId}] 파싱 성공:`, message.type);

      if (message.type === 'user_message') {
        console.log(`💬 [${sessionId}] 사용자 메시지 처리 시작:`, message.content.substring(0, 50));
        await handleUserMessage(sessionId, message.content, message.userProfile);
        console.log(`✅ [${sessionId}] 사용자 메시지 처리 완료`);
      } else if (message.type === 'get_insights') {
        console.log(`🔍 [${sessionId}] Insights 요청:`, message.vehicleId);
        await handleGetInsights(sessionId, message.vehicleId);
      }
    } catch (error) {
      console.error(`❌ [${sessionId}] WebSocket message error:`, error);
      console.error(`📄 [${sessionId}] 실패한 메시지:`, rawData);
      sendMessage(ws, {
        type: 'error',
        content: '메시지 처리 중 오류가 발생했습니다.',
      });
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`🔌 [${sessionId}] WebSocket 연결 해제. Code:`, code, 'Reason:', reason?.toString());
    sessions.delete(sessionId);
    console.log(`📊 남은 세션 수:`, sessions.size);
  });

  ws.on('error', (error) => {
    console.error(`❌ [${sessionId}] WebSocket error:`, error);
  });

  // Add ping/pong for connection health monitoring
  ws.on('ping', () => {
    console.log(`💓 [${sessionId}] Ping received`);
  });

  ws.on('pong', () => {
    console.log(`💓 [${sessionId}] Pong received`);
  });
}
```

### Solution 2: Fix Client WebSocket Lifecycle

**File**: `client/src/hooks/useWebSocketChat.ts`

```typescript
useEffect(() => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  let wsUrl: string;
  if (backendUrl) {
    wsUrl = backendUrl.replace(/^http/, 'ws') + '/ws/chat';
  } else {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;

    if (host === 'localhost' || host === '127.0.0.1') {
      const port = window.location.port || '5000';
      wsUrl = `${protocol}//${host}:${port}/ws/chat`;
    } else {
      wsUrl = `${protocol}//${host}/ws/chat`;
    }
  }

  console.log('🔌 [CLIENT] WebSocket 연결 시도:', wsUrl);
  const ws = new WebSocket(wsUrl);

  // Store in ref IMMEDIATELY
  wsRef.current = ws;

  ws.onopen = () => {
    console.log('✅ [CLIENT] WebSocket 연결 성공');
    console.log('📡 [CLIENT] WebSocket.readyState:', ws.readyState, '(1=OPEN)');
    console.log('🔗 [CLIENT] wsRef.current === ws:', wsRef.current === ws);
    setIsConnected(true);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 [CLIENT] WebSocket 메시지 수신:', data.type);
      // ... rest of handler
    } catch (error) {
      console.error('❌ [CLIENT] 메시지 파싱 오류:', error);
      console.error('📄 [CLIENT] 실패한 메시지:', event.data);
    }
  };

  ws.onerror = (error) => {
    console.error('❌ [CLIENT] WebSocket error:', error);
  };

  ws.onclose = (event) => {
    console.log('🔌 [CLIENT] WebSocket 연결 종료. Code:', event.code, 'Reason:', event.reason);
    setIsConnected(false);
    wsRef.current = null;
  };

  // CRITICAL: Cleanup function
  return () => {
    console.log('🧹 [CLIENT] WebSocket cleanup - 연결 종료');
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  };
}, []); // Keep empty deps but add proper cleanup

// Update sendMessage to be more defensive
const sendMessage = useCallback((content: string) => {
  console.log('[SEND] 메시지 전송 시도:', content.substring(0, 50));
  console.log('[SEND] wsRef.current exists:', !!wsRef.current);
  console.log('[SEND] WebSocket 상태:', wsRef.current?.readyState, '(1=OPEN)');

  if (!wsRef.current) {
    console.error('[SEND] ❌ wsRef.current is null!');
    return;
  }

  if (wsRef.current.readyState !== WebSocket.OPEN) {
    console.error('[SEND] ❌ WebSocket not OPEN. State:', wsRef.current.readyState);
    return;
  }

  // ... rest of function

  const payload = { type: 'user_message', content, userProfile };
  const payloadStr = JSON.stringify(payload);

  console.log('[SEND] 전송 payload 크기:', payloadStr.length, 'bytes');
  console.log('[SEND] 전송 payload preview:', payloadStr.substring(0, 200));

  try {
    wsRef.current.send(payloadStr);
    console.log('[SEND] ✅ 메시지 전송 완료');
  } catch (error) {
    console.error('[SEND] ❌ 전송 실패:', error);
  }
}, []);
```

### Solution 3: Add WebSocket Health Check

**File**: `server/websocket/ChatWebSocketHandler.ts`

Add periodic health checks to detect stale connections:

```typescript
export function setupChatWebSocket(ws: WebSocket, sessionId: string) {
  // ... existing setup code

  // Health check interval (every 30 seconds)
  const healthCheckInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
      console.log(`💓 [${sessionId}] Health check ping sent`);
    } else {
      console.warn(`⚠️ [${sessionId}] WebSocket not OPEN. State:`, ws.readyState);
      clearInterval(healthCheckInterval);
    }
  }, 30000);

  ws.on('close', () => {
    clearInterval(healthCheckInterval);
    console.log(`🔌 [${sessionId}] WebSocket 연결 해제 + health check 정리`);
    sessions.delete(sessionId);
  });

  // ... rest of handlers
}
```

---

## 🔬 Debugging Action Plan

### Step 1: Add Comprehensive Logging (DO THIS FIRST)
Implement Solution 1 and Solution 2 to capture full WebSocket lifecycle.

### Step 2: Test Message Flow
```bash
# 1. Start backend with logging
npm start

# 2. Open browser with DevTools Console
# 3. Navigate to chat page
# 4. Check logs for:
#    - [CLIENT] WebSocket 연결 시도
#    - [CLIENT] WebSocket 연결 성공
#    - [SERVER] 🔌 WebSocket 연결
#    - [CLIENT] 📨 WebSocket 메시지 수신 (initial greeting)

# 5. Send test message: "2500만원 이하로 SUV 찾고 있어요"
# 6. Check logs for:
#    - [CLIENT] [SEND] 메시지 전송 시도
#    - [CLIENT] [SEND] ✅ 메시지 전송 완료
#    - [SERVER] 🔔 RAW 메시지 수신  <-- THIS IS CRITICAL
```

### Step 3: Analyze Log Patterns

**If you see**:
```
[CLIENT] [SEND] ✅ 메시지 전송 완료
[SERVER] (no 🔔 log)
```
→ **Message not reaching server** → Check network, proxy, or WebSocket endpoint routing

**If you see**:
```
[CLIENT] [SEND] ❌ WebSocket not OPEN
```
→ **Connection closed prematurely** → Check for duplicate connections or React StrictMode

**If you see**:
```
[SERVER] 🔔 RAW 메시지 수신 (object)
[SERVER] ❌ WebSocket message error: JSON.parse failed
```
→ **Data type mismatch** → Force `.toString()` conversion

---

## 🎯 Expected Behavior After Fix

### Correct Log Sequence
```
1. [CLIENT] 🔌 WebSocket 연결 시도: ws://localhost:5000/ws/chat
2. [SERVER] 🔌 [abc12345] WebSocket 연결 시작
3. [SERVER] 📊 [abc12345] 현재 활성 세션 수: 1
4. [SERVER] 📡 [abc12345] WebSocket.readyState: 1 (1=OPEN)
5. [CLIENT] ✅ WebSocket 연결 성공
6. [CLIENT] 📡 WebSocket.readyState: 1 (1=OPEN)
7. [CLIENT] 📨 WebSocket 메시지 수신: agent_message
8. [CLIENT] [SEND] 메시지 전송 시도: 2500만원 이하로 SUV 찾고 있어요
9. [CLIENT] [SEND] WebSocket 상태: 1 (1=OPEN)
10. [CLIENT] [SEND] ✅ 메시지 전송 완료
11. [SERVER] 🔔 [abc12345] RAW 메시지 수신 (string): {"type":"user_message","content":"2500만원 이하로 SUV 찾고 있어요",...}
12. [SERVER] 📨 [abc12345] 파싱 성공: user_message
13. [SERVER] 💬 [abc12345] 사용자 메시지 처리 시작: 2500만원 이하로 SUV 찾고 있어요
14. [SERVER] ✅ [abc12345] 사용자 메시지 처리 완료
```

---

## 📚 Reference Files

### Server-Side
- `c:\Users\MJ\Desktop\SeSAC-DA1\ChatbotLanding\server\websocket\ChatWebSocketHandler.ts`
  - Line 33-80: `setupChatWebSocket()` and message handlers
  - Line 82-179: `handleUserMessage()` processing logic

### Client-Side
- `c:\Users\MJ\Desktop\SeSAC-DA1\ChatbotLanding\client\src\hooks\useWebSocketChat.ts`
  - Line 64-93: WebSocket connection setup
  - Line 268-327: `sendMessage()` function

### Related Components
- `c:\Users\MJ\Desktop\SeSAC-DA1\ChatbotLanding\client\src\components\features\ChatInterface.tsx`
  - Line 119-135: `handleSendMessage()` callback
- `c:\Users\MJ\Desktop\SeSAC-DA1\ChatbotLanding\client\src\components\features\ChatInput.tsx`
  - Line 13-18: User input handling

---

## 🚨 Critical Questions to Answer

1. **Are [SEND] logs appearing in browser console?**
   - YES → Message is being sent from client
   - NO → `sendMessage()` is not being called

2. **Is WebSocket.readyState === 1 when sending?**
   - YES → Connection should be open
   - NO → Connection closed/closing

3. **Are there multiple WebSocket connections in Network tab?**
   - YES → React StrictMode or component re-render issue
   - NO → Single connection as expected

4. **Does 🔔 log EVER appear for any message?**
   - YES → Handler is working, specific message issue
   - NO → Handler not registered or connection mismatch

---

## ✅ Next Steps

1. **Implement Solution 1**: Add comprehensive server logging
2. **Implement Solution 2**: Fix client WebSocket lifecycle
3. **Test**: Send message and capture full log sequence
4. **Analyze**: Compare actual logs with expected logs above
5. **Report**: Share log output for further analysis

---

**Generated**: 2025-10-10
**Status**: 🔍 Investigation in progress - awaiting log output
