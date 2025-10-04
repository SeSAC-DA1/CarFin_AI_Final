# 🚀 프론트엔드/백엔드 분리 배포 가이드

## 📋 배포 전략 개요

**추천 조합**: 프론트엔드(Vercel) + 백엔드(Railway)

```
🎨 프론트엔드: Vercel      🔧 백엔드: Railway
├─ React SPA 빌드          ├─ Express API 서버
├─ 글로벌 CDN              ├─ PostgreSQL + Redis
├─ 자동 HTTPS              ├─ WebSocket 지원
├─ 무료 Custom Domain      ├─ 환경변수 관리
└─ Edge 성능 최적화        └─ 자동 스케일링
```

### 💰 비용 예상
- **Vercel**: 무료 (Pro $20/월 부터)
- **Railway**: $5-20/월 (PostgreSQL + Redis 포함)
- **총 비용**: $5-40/월

---

## 🔧 Phase 1: 백엔드 Railway 배포 (먼저 진행)

### 1-1. Railway 프로젝트 생성

```bash
# Railway CLI 설치 (처음 한 번만)
npm install -g @railway/cli

# Railway 로그인
railway login

# 새 프로젝트 생성
railway new carfin-backend
```

### 1-2. 데이터베이스 서비스 추가

```bash
# PostgreSQL 추가
railway add postgresql

# Redis 추가 (캐싱용)
railway add redis

# 서비스 확인
railway status
```

### 1-3. 환경변수 설정

```bash
# 필수 환경변수 설정
railway variables set GEMINI_API_KEY=your_gemini_api_key_here
railway variables set SESSION_SECRET=random_secret_string_here_32chars
railway variables set NODE_ENV=production

# CORS 설정 (나중에 Vercel 도메인으로 업데이트)
railway variables set CORS_ORIGIN=https://your-frontend.vercel.app

# 환경변수 확인
railway variables
```

### 1-4. 백엔드 배포

```bash
# 현재 프로젝트와 연결
railway link

# 데이터베이스 스키마 생성
railway run npm run db:push

# 500개 차량 데이터 시드
railway run npx tsx scripts/seed-database.ts

# 백엔드 자동 배포 (git push 트리거)
git add .
git commit -m "🚀 Backend deployment with Redis caching"
git push origin main
```

### 1-5. 백엔드 도메인 확인

```bash
# Railway 대시보드에서 도메인 생성
railway domain

# 예시 결과
# https://carfin-backend-production.up.railway.app
```

**📝 백엔드 URL을 기록해두세요!** (다음 단계에서 필요)

---

## 🎨 Phase 2: 프론트엔드 Vercel 배포

### 2-1. Vercel CLI 설치 및 로그인

```bash
# Vercel CLI 설치
npm install -g vercel

# Vercel 로그인
vercel login
```

### 2-2. 프론트엔드 환경변수 파일 생성

루트 디렉토리에 `.env.production` 파일 생성:

```bash
# .env.production
VITE_BACKEND_URL=https://carfin-backend-production.up.railway.app
```

### 2-3. Vercel 프로젝트 설정

```bash
# Vercel 프로젝트 초기화
vercel

# 설정 옵션:
# ? Set up and deploy "~/ChatbotLanding"? [Y/n] y
# ? Which scope do you want to deploy to? [본인 계정 선택]
# ? Link to existing project? [N/y] n
# ? What's your project's name? carfin-frontend
# ? In which directory is your code located? ./
```

### 2-4. Vercel 환경변수 설정

Vercel 대시보드에서 또는 CLI로 환경변수 설정:

```bash
# 방법 1: CLI로 설정
vercel env add VITE_BACKEND_URL
# 값 입력: https://carfin-backend-production.up.railway.app

# 방법 2: Vercel 대시보드
# https://vercel.com/dashboard → 프로젝트 → Settings → Environment Variables
```

### 2-5. 빌드 설정 확인

`package.json`에서 빌드 스크립트 확인:

```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 2-6. 프론트엔드 배포

```bash
# 프로덕션 배포
vercel --prod

# 예시 결과
# https://carfin-frontend.vercel.app
```

---

## 🔄 Phase 3: CORS 설정 업데이트

### 3-1. Railway에서 CORS 업데이트

```bash
# 실제 Vercel 도메인으로 CORS 설정 업데이트
railway variables set CORS_ORIGIN=https://carfin-frontend.vercel.app
```

### 3-2. 배포 확인

Railway 백엔드가 자동으로 재배포됩니다.

---

## ✅ 배포 완료 테스트

### 4-1. 백엔드 API 테스트

```bash
# 백엔드 헬스체크
curl https://carfin-backend-production.up.railway.app/api/health

# 데이터베이스 연결 확인
curl https://carfin-backend-production.up.railway.app/api/database/status
```

### 4-2. 프론트엔드 기능 테스트

1. **홈페이지 접속**: `https://carfin-frontend.vercel.app`
2. **WebSocket 연결**: 개발자 도구에서 연결 로그 확인
3. **AI 챗봇 테스트**: "3000만원 이하 SUV 추천해주세요"
4. **차량 추천**: 3대 차량 결과 확인
5. **TOPSIS 인사이트**: "AI 인사이트" 버튼 클릭

### 4-3. 성능 확인

- **응답 속도**: ~1.5초 (Redis 캐싱 효과)
- **WebSocket 연결**: 실시간 메시지 교환
- **글로벌 CDN**: Vercel Edge 네트워크 활용

---

## 🐛 문제 해결

### CORS 에러

```bash
# 증상: 프론트엔드에서 "CORS policy" 에러
# 해결: Railway에서 CORS_ORIGIN 확인
railway variables get CORS_ORIGIN

# 올바른 값으로 업데이트
railway variables set CORS_ORIGIN=https://your-actual-vercel-domain.vercel.app
```

### WebSocket 연결 실패

```bash
# 증상: WebSocket 연결이 안 됨
# 해결 1: 프론트엔드 환경변수 확인
echo $VITE_BACKEND_URL

# 해결 2: Railway WebSocket 지원 확인 (자동 지원됨)
# 해결 3: 브라우저 개발자 도구에서 WebSocket 연결 로그 확인
```

### 환경변수 문제

```bash
# Railway 환경변수 전체 확인
railway variables

# Vercel 환경변수 확인
vercel env ls

# 로컬에서 .env.production 확인
cat .env.production
```

### 데이터베이스 연결 실패

```bash
# Railway 서비스 상태 확인
railway status

# 데이터베이스 연결 테스트
railway run npx tsx -e "console.log('DB Test:', process.env.DATABASE_URL?.substring(0,20))"

# 시드 데이터 다시 실행
railway run npx tsx scripts/seed-database.ts
```

---

## 🔧 고급 설정

### Custom Domain 설정

#### Vercel Custom Domain
1. Vercel 대시보드 → Settings → Domains
2. 도메인 추가 (예: carfin.yourdomain.com)
3. DNS 설정 업데이트

#### Railway Custom Domain
1. Railway 대시보드 → Settings → Networking
2. Custom Domain 추가 (예: api.yourdomain.com)
3. CORS_ORIGIN 업데이트

### SSL 인증서

- **Vercel**: 자동 Let's Encrypt SSL
- **Railway**: 자동 SSL 지원

### 환경별 설정

```bash
# 개발 환경
VITE_BACKEND_URL=http://localhost:8000

# 스테이징 환경
VITE_BACKEND_URL=https://staging-backend.up.railway.app

# 프로덕션 환경
VITE_BACKEND_URL=https://carfin-backend-production.up.railway.app
```

---

## 📊 성능 모니터링

### Vercel Analytics
```bash
# Vercel 대시보드에서 Analytics 활성화
# 실시간 사용자 수, 페이지 로드 시간 등 확인
```

### Railway Metrics
```bash
# Railway 대시보드 → Metrics
# CPU, 메모리, 네트워크 사용량 확인
```

### Custom 모니터링

```typescript
// 프론트엔드에서 성능 추적
console.time('WebSocket Connection');
// ... WebSocket 연결 후
console.timeEnd('WebSocket Connection');

// 백엔드에서 Redis 캐시 Hit Rate 로깅
console.log(`🎯 캐시 HIT: ${cacheHits}/${totalRequests} (${hitRate}%)`);
```

---

## 🎯 최종 아키텍처

```
Internet
    ↓
┌─────────────────┐    HTTPS     ┌─────────────────┐
│   Vercel CDN    │ ────────────▶ │  Railway App    │
│   (Frontend)    │              │   (Backend)     │
│                 │   WebSocket   │                 │
│ • React SPA     │ ◀───────────▶ │ • Express API   │
│ • Global Edge   │              │ • WebSocket     │
│ • Auto HTTPS    │              │ • Redis Cache   │
└─────────────────┘              │ • PostgreSQL    │
                                 └─────────────────┘
```

**결과**:
- ⚡ **성능**: CDN + Redis 캐싱으로 최적화
- 🌍 **글로벌**: Vercel Edge 네트워크 활용
- 💰 **비용**: $5-40/월 (매우 경제적)
- 🔒 **보안**: 자동 HTTPS + 환경변수 암호화
- 📈 **확장성**: 자동 스케일링 지원

---

## 📋 배포 체크리스트

### 백엔드 (Railway)
- [ ] Railway 프로젝트 생성 완료
- [ ] PostgreSQL 서비스 추가 완료
- [ ] Redis 서비스 추가 완료
- [ ] 환경변수 설정 완료 (GEMINI_API_KEY, SESSION_SECRET, CORS_ORIGIN)
- [ ] 데이터베이스 스키마 생성 완료
- [ ] 500개 차량 데이터 시드 완료
- [ ] 백엔드 배포 완료
- [ ] 도메인 생성 완료

### 프론트엔드 (Vercel)
- [ ] Vercel CLI 설치 완료
- [ ] 프로젝트 생성 완료
- [ ] 환경변수 설정 완료 (VITE_BACKEND_URL)
- [ ] 프론트엔드 배포 완료
- [ ] 도메인 확인 완료

### 통합 테스트
- [ ] WebSocket 연결 테스트 완료
- [ ] AI 챗봇 기능 테스트 완료
- [ ] 차량 추천 테스트 완료
- [ ] TOPSIS 인사이트 테스트 완료
- [ ] 성능 확인 완료 (응답 속도 ~1.5초)

**🎉 배포 완료!** 프론트엔드와 백엔드가 분리된 프로덕션 급 아키텍처 완성!