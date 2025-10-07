# 🚀 CARFIN AI - Railway 배포 가이드

## ✅ 배포 준비 완료!

모든 코드 수정과 프로덕션 빌드 검증이 완료되었습니다.
이제 Railway에 배포하기 위한 단계만 남았습니다!

---

## 📋 배포 전 체크리스트

✅ **코드 수정 완료**
- Hero.tsx 통계 박스 개선 (사용자 가치 중심)
- "15만대 중에서" → "15만대 중" (4개 파일)
- 톤앤매너 일관성 확보

✅ **빌드 검증 완료**
- `npm run build` 성공
- 클라이언트: 677 kB (gzip: 192 kB)
- 서버: 140.8 kB

✅ **환경 준비 완료**
- terser 설치 완료
- TypeScript 빌드 최적화

---

## 🔑 Step 1: Railway 로그인

```bash
# Railway CLI 로그인 (브라우저 열림)
railway login
```

**주의**: 브라우저가 자동으로 열립니다. Railway 계정으로 로그인하세요.

---

## 🔗 Step 2: Railway 프로젝트 연결

### 기존 프로젝트가 있는 경우
```bash
cd c:\Users\MJ\Desktop\SeSAC-DA1\ChatbotLanding

# 기존 프로젝트 연결
railway link

# 프로젝트 목록에서 선택
# ↓ carfin-ai (또는 기존 프로젝트명)
```

### 새 프로젝트 생성 (최초)
```bash
# 새 프로젝트 초기화
railway init

# 프로젝트 이름 입력
Project name: carfin-ai
```

---

## ⚙️ Step 3: 환경 변수 설정

### Railway 대시보드에서 설정 (추천)
1. https://railway.app/dashboard 접속
2. 프로젝트 선택: **carfin-ai**
3. **Variables** 탭 클릭
4. 다음 변수 추가:

```bash
# 필수 환경 변수
DATABASE_URL=postgresql://postgres:...<Railway PostgreSQL URL>
GOOGLE_API_KEY=AIza...<Your Gemini API Key>
RAILWAY_REDIS_URL=redis://default:...<Railway Redis URL>
NODE_ENV=production
PORT=5000
```

### 또는 CLI로 설정
```bash
# 환경 변수 설정
railway variables set DATABASE_URL="postgresql://..."
railway variables set GOOGLE_API_KEY="AIza..."
railway variables set RAILWAY_REDIS_URL="redis://..."
railway variables set NODE_ENV="production"
railway variables set PORT="5000"

# 설정 확인
railway variables
```

---

## 🗃️ Step 4: Railway 서비스 추가

### PostgreSQL 추가
```bash
# Railway 대시보드에서:
1. New Service → Database → PostgreSQL
2. 연결 URL 복사 → DATABASE_URL 환경 변수에 추가
```

### Redis 추가
```bash
# Railway 대시보드에서:
1. New Service → Database → Redis
2. 연결 URL 복사 → RAILWAY_REDIS_URL 환경 변수에 추가
```

---

## 🚀 Step 5: 배포 실행

```bash
cd c:\Users\MJ\Desktop\SeSAC-DA1\ChatbotLanding

# 배포 명령어 (방법 1)
npm run deploy:railway

# 또는 직접 Railway 명령어 (방법 2)
railway up

# 배포 진행 상황 확인
railway logs --tail
```

**예상 배포 시간**: 약 3-5분

---

## 🔍 Step 6: 배포 확인

### 1. 배포 상태 확인
```bash
# 서비스 상태
railway status

# 배포 로그
railway logs

# 서비스 URL 확인
railway open
```

### 2. 헬스체크
```bash
# 헬스체크 API (배포 후 URL 사용)
curl https://your-app.railway.app/api/system/health

# 예상 응답:
{
  "status": "healthy",
  "timestamp": "2025-01-06T...",
  "services": {
    "railway_redis": "connected",
    "database": "connected"
  }
}
```

### 3. 브라우저 테스트
```bash
# Railway 앱 URL 열기
railway open

# 또는 수동으로 접속
https://your-app.railway.app
```

---

## ✅ 배포 후 검증 체크리스트

### 필수 기능 테스트
- [ ] **랜딩 페이지** 로딩 확인 (/)
  - "10만대 이상" 표시 확인
  - "다양한 선택지", "협업 분석", "맞춤 추천" 표시 확인

- [ ] **온보딩 플로우** (/onboarding)
  - 3단계 AI 에이전트 소개
  - "10만대+" 실시간 매물 표시

- [ ] **프로필 설정** (/profile-setup)
  - 4단계 입력 플로우
  - "여쭤볼게요" 자연스러운 톤

- [ ] **AI 채팅** (/chat)
  - WebSocket 연결 (WSS 프로토콜)
  - "15만대 중 딱 맞는 차량" 메시지
  - 실시간 추천 동작

### API 엔드포인트 테스트
```bash
# 시스템 상태
curl https://your-app.railway.app/api/system/status

# 차량 검색
curl "https://your-app.railway.app/api/vehicles/search?brand=현대&minPrice=2000&maxPrice=3000"

# TOPSIS 분석 (샘플 차량 ID)
curl https://your-app.railway.app/api/vehicles/1/topsis-analysis
```

---

## 🐛 트러블슈팅

### 문제 1: 빌드 실패
```bash
# 에러 메시지 확인
railway logs

# 일반적인 원인:
# 1. 환경 변수 누락 → railway variables 확인
# 2. 패키지 설치 실패 → package.json 확인
# 3. 메모리 부족 → Railway 플랜 확인
```

### 문제 2: WebSocket 연결 실패
```bash
# 원인: HTTP를 WSS로 변경 필요
# 해결: 프론트엔드 코드에서 자동 감지 구현됨

const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${wsProtocol}//${window.location.host}/ws/chat`;
```

### 문제 3: 데이터베이스 연결 실패
```bash
# DATABASE_URL 포맷 확인
postgresql://username:password@host:port/database?sslmode=require

# Railway PostgreSQL은 SSL 필수
# ?sslmode=require 파라미터 확인
```

### 문제 4: Redis 연결 실패
```bash
# RAILWAY_REDIS_URL 포맷 확인
redis://default:password@host:port

# RailwayRedisService.ts에서 TLS 설정 확인
socket: {
  tls: true,
  rejectUnauthorized: false
}
```

---

## 📊 배포 후 모니터링

### Railway 대시보드 모니터링
```
https://railway.app/dashboard
├── Deployments: 배포 이력
├── Metrics: CPU, 메모리, 네트워크
├── Logs: 실시간 로그
└── Variables: 환경 변수
```

### 주요 모니터링 지표
| 지표 | 목표 | 모니터링 방법 |
|------|------|---------------|
| **응답 시간** | < 3초 | Railway Metrics |
| **메모리 사용** | < 512MB | Railway Dashboard |
| **에러율** | < 1% | `railway logs` |
| **WebSocket 연결** | 안정적 | `/api/system/status` |

---

## 🎯 배포 완료 후 다음 단계

### 1. 도메인 연결 (선택사항)
```bash
# Railway 대시보드에서:
Settings → Domains → Add Custom Domain
예: carfin.ai
```

### 2. 성능 최적화
- [ ] CloudFlare CDN 연결
- [ ] 이미지 최적화 (WebP 변환)
- [ ] Redis 캐시 TTL 튜닝

### 3. 모니터링 설정
- [ ] Sentry 에러 트래킹
- [ ] Google Analytics
- [ ] Lighthouse CI

---

## 📞 도움이 필요한 경우

### Railway 공식 문서
- https://docs.railway.app/

### CARFIN AI 프로젝트 문서
- `claudedocs/RAILWAY_DEPLOYMENT_REPORT.md` - 상세 배포 보고서
- `claudedocs/FINAL_UX_TEXT_CHANGES.md` - 최종 UX 변경사항
- `CLAUDE.md` - 전체 프로젝트 개요

### 배포 명령어 요약
```bash
# 1. 로그인
railway login

# 2. 프로젝트 연결
railway link

# 3. 환경 변수 설정 (대시보드에서)

# 4. 배포
railway up

# 5. 확인
railway status
railway logs
railway open
```

---

## 🎉 배포 완료!

배포가 성공하면 다음과 같은 메시지가 표시됩니다:

```
✅ Build Successful
✅ Deployment Live
🌐 https://carfin-ai-production.up.railway.app
```

이제 공모전과 포트폴리오에 사용할 수 있는 완전한 프로덕션 서비스가 준비되었습니다! 🚀

---

**작성일**: 2025-01-06
**프로젝트**: CARFIN AI - 논문 기반 멀티에이전트 차량 추천 시스템
