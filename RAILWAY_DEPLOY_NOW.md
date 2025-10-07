# 🚀 Railway 배포 - 지금 바로 실행하기

## ⚡ 빠른 배포 (브라우저 사용)

Railway CLI 로그인이 필요하므로 다음 단계를 따라 배포하세요:

---

## 1️⃣ Railway CLI 로그인 (필수)

**Windows PowerShell 또는 CMD에서 실행:**

```bash
# 프로젝트 디렉토리로 이동
cd C:\Users\MJ\Desktop\SeSAC-DA1\ChatbotLanding

# Railway 로그인 (브라우저 자동 열림)
railway login
```

**브라우저가 열리면:**
- Railway 계정으로 로그인
- "Authorize" 클릭
- CLI 인증 완료 메시지 확인

---

## 2️⃣ Railway 프로젝트 설정

### 옵션 A: 기존 프로젝트 연결
```bash
# 기존 프로젝트 목록 보기
railway list

# 프로젝트 연결
railway link
# → "carfin-ai" 선택 (있다면)
```

### 옵션 B: 새 프로젝트 생성
```bash
# 새 프로젝트 초기화
railway init

# 프로젝트 이름 입력
Project name: carfin-ai
```

---

## 3️⃣ 환경 변수 설정 (Railway 대시보드)

**브라우저에서 https://railway.app/dashboard 접속**

1. **프로젝트 선택**: carfin-ai
2. **Variables 탭** 클릭
3. **다음 환경 변수 추가**:

```bash
# 필수 환경 변수
NODE_ENV=production
PORT=5000

# 데이터베이스 (현재 외부 DB 사용)
DATABASE_URL=postgresql://carfin_admin:carfin_secure_password_2025@43.203.13.220:5432/carfin

# Google Gemini AI
GOOGLE_API_KEY=AIzaSyArwWj3_TDhSuCVXYoDzVGM2MW26-5UqbU
GEMINI_API_KEY=AIzaSyArwWj3_TDhSuCVXYoDzVGM2MW26-5UqbU

# 세션 보안
SESSION_SECRET=carfin_production_secret_2025_railway
```

**선택사항 (Redis 캐싱):**
- Railway 대시보드에서 "New Service" → "Redis" 추가
- 자동 생성된 `RAILWAY_REDIS_URL` 변수 확인

---

## 4️⃣ 배포 실행 (CLI)

**터미널에서 실행:**

```bash
# 현재 디렉토리 확인
pwd
# 출력: C:\Users\MJ\Desktop\SeSAC-DA1\ChatbotLanding

# Railway 배포 시작
railway up

# 또는 npm 스크립트 사용
npm run deploy:railway
```

**예상 배포 시간**: 3-5분

---

## 5️⃣ 배포 진행 상황 확인

### 실시간 로그 보기
```bash
# 배포 로그 실시간 확인
railway logs --tail
```

### 배포 상태 확인
```bash
# 서비스 상태
railway status

# 예상 출력:
# ✓ Deployment successful
# ✓ Service: carfin-ai
# ✓ Status: Running
```

---

## 6️⃣ 배포 완료 확인

### 브라우저에서 앱 열기
```bash
# Railway 앱 URL 자동 열기
railway open
```

**또는 수동으로 접속:**
- https://carfin-ai-production.up.railway.app

### 헬스체크 API 테스트
```bash
# CMD/PowerShell에서 실행
curl https://your-app.railway.app/api/system/health

# 예상 응답:
# {
#   "status": "healthy",
#   "timestamp": "2025-01-06T...",
#   "services": {
#     "database": "connected",
#     "railway_redis": "connected"
#   }
# }
```

---

## ✅ 배포 후 검증 체크리스트

브라우저에서 배포된 앱 URL 접속 후:

- [ ] **랜딩 페이지** (/) 정상 로딩
  - "10만대 이상" 표시 확인
  - "다양한 선택지", "협업 분석", "맞춤 추천" 확인

- [ ] **온보딩** (/onboarding)
  - 3단계 플로우 동작 확인

- [ ] **프로필 설정** (/profile-setup)
  - 4단계 입력 저장 확인

- [ ] **AI 채팅** (/chat)
  - WebSocket 연결 (WSS) 확인
  - "15만대 중 딱 맞는 차량" 메시지 확인

---

## 🐛 트러블슈팅

### 문제 1: 로그인 실패
```bash
# 해결: Railway CLI 재설치
npm uninstall -g @railway/cli
npm install -g @railway/cli

# 다시 로그인
railway login
```

### 문제 2: 빌드 실패
```bash
# 로그 확인
railway logs

# 일반적인 원인:
# 1. 환경 변수 누락 → Variables 탭 확인
# 2. 메모리 부족 → Railway 플랜 업그레이드
# 3. 빌드 스크립트 오류 → package.json 확인
```

### 문제 3: WebSocket 연결 안 됨
```
원인: HTTP → HTTPS 리다이렉트 시 WSS 프로토콜 필요
해결: 코드에 이미 자동 감지 구현됨

const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
```

### 문제 4: 데이터베이스 연결 실패
```bash
# DATABASE_URL 포맷 확인
# postgresql://username:password@host:port/database

# 현재 설정:
# postgresql://carfin_admin:carfin_secure_password_2025@43.203.13.220:5432/carfin
```

---

## 📊 배포 후 모니터링

### Railway 대시보드에서 확인
1. **Deployments**: 배포 이력
2. **Metrics**: CPU, 메모리, 네트워크
3. **Logs**: 실시간 로그
4. **Settings**: 도메인, 환경 변수

### CLI로 모니터링
```bash
# 실시간 로그
railway logs --tail

# 서비스 상태
railway status

# 환경 변수 확인
railway variables
```

---

## 🎯 배포 성공 후

### 1. 도메인 연결 (선택사항)
```
Railway 대시보드:
Settings → Domains → Add Custom Domain
예: carfin.ai
```

### 2. SSL 인증서
```
Railway는 자동으로 Let's Encrypt SSL 인증서 발급
HTTPS 자동 적용 완료
```

### 3. 성능 최적화
- [ ] Redis 캐시 추가 (New Service → Redis)
- [ ] CDN 연결 (CloudFlare)
- [ ] 이미지 최적화

---

## 📞 도움말

### Railway 공식 문서
- https://docs.railway.app/

### CARFIN AI 문서
- `claudedocs/RAILWAY_DEPLOYMENT_REPORT.md`
- `DEPLOY_GUIDE.md`
- `CLAUDE.md`

---

## 🚀 배포 요약 명령어

```bash
# 1단계: 로그인
railway login

# 2단계: 프로젝트 연결
railway link

# 3단계: 환경 변수 설정 (대시보드에서)

# 4단계: 배포
railway up

# 5단계: 확인
railway status
railway logs
railway open
```

---

## 🎉 배포 완료 예상 결과

```
✅ Build Successful
✅ Deployment Live
🌐 URL: https://carfin-ai-production.up.railway.app

서비스가 정상적으로 실행 중입니다!
```

---

**작성일**: 2025-01-06
**프로젝트**: CARFIN AI - 논문 기반 멀티에이전트 차량 추천 시스템
**배포 플랫폼**: Railway
**프로덕션 빌드**: ✅ 완료 (677 kB)

**지금 바로 배포하세요!** 🚀
