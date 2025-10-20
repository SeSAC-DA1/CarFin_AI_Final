# 배포 가이드

## 🚀 프로덕션 배포 현황

### 배포 환경
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Railway PostgreSQL 15
- **Cache**: Railway Redis 7

### 배포 상태
✅ **현재 배포 완료** - railway-production 브랜치

## 📋 환경별 배포 설정

### Railway Backend

#### 필수 환경 변수
```bash
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
GOOGLE_API_KEY=AIza...
RAILWAY_REDIS_URL=redis://default:password@host:port
NODE_ENV=production
PORT=5000
```

#### 배포 명령어
```bash
# Railway CLI 로그인
railway login

# 현재 프로젝트 상태 확인
railway status

# 배포
railway up

# 로그 확인
railway logs
```

### Vercel Frontend

#### 빌드 설정
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

#### 환경 변수
```bash
VITE_API_URL=https://your-backend.railway.app
NODE_ENV=production
```

## 🔧 데이터베이스 설정

### PostgreSQL 초기화
```bash
# 로컬 개발
npm run db:push

# 프로덕션 (Railway)
# Railway 대시보드에서 자동 프로비저닝
```

### 데이터베이스 마이그레이션
```sql
-- 스키마 생성은 Drizzle ORM이 자동 처리
-- 필요시 수동 마이그레이션:
-- (see .archive/deploy-scripts/railway_seed.sql)
```

## 📊 모니터링

### Railway 대시보드
- **메트릭**: CPU, 메모리, 네트워크 사용량
- **로그**: 실시간 애플리케이션 로그
- **배포 히스토리**: 이전 배포 버전 관리

### Vercel 대시보드
- **빌드 상태**: 빌드 성공/실패 로그
- **분석**: 방문자 통계 및 성능 지표
- **배포 미리보기**: PR별 프리뷰 배포

## 🔐 보안 설정

### SSL/TLS
- Railway: 자동 SSL 인증서
- Vercel: 자동 HTTPS 적용

### 환경 변수 관리
```bash
# ⚠️ 절대 커밋하지 말 것
.env
.env.local
.env.production.local

# ✅ 예시 파일만 커밋
.env.railway.example
.env.aws.example
```

## 🎯 성능 최적화

### 프론트엔드
- **코드 스플리팅**: React.lazy() 사용
- **이미지 최적화**: WebP 포맷
- **CDN**: Vercel Edge Network

### 백엔드
- **Redis 캐싱**: 85% 히트율
- **연결 풀링**: PostgreSQL 최적화
- **Gzip 압축**: Express compression

## 🧪 배포 전 체크리스트

### 코드 품질
- [ ] `npm run build` 성공
- [ ] `npm run test` 모든 테스트 통과
- [ ] TypeScript 에러 없음
- [ ] ESLint 경고 해결

### 환경 설정
- [ ] 환경 변수 설정 완료
- [ ] DATABASE_URL 연결 확인
- [ ] GOOGLE_API_KEY 유효성 검증
- [ ] Redis 연결 테스트

### 보안
- [ ] .env 파일 .gitignore 확인
- [ ] API 키 노출 여부 점검
- [ ] CORS 설정 확인
- [ ] SQL Injection 방어 확인

## 🔄 CI/CD 자동화

### GitHub Actions (선택사항)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway

on:
  push:
    branches: [railway-production]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Railway
        run: npm i -g @railway/cli
      - name: Deploy
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 📈 배포 후 모니터링

### 헬스체크
```bash
# 백엔드 상태 확인
curl https://your-backend.railway.app/api/system/health

# 프론트엔드 확인
curl https://your-frontend.vercel.app
```

### 로그 모니터링
```bash
# Railway 로그
railway logs --tail

# 로컬 테스트
npm run dev
```

## 🆘 트러블슈팅

### 일반적인 문제

#### 1. 데이터베이스 연결 실패
```bash
# 원인: SSL 모드 미설정
# 해결: DATABASE_URL에 ?sslmode=require 추가
```

#### 2. Redis 연결 오류
```bash
# 원인: RAILWAY_REDIS_URL 누락
# 해결: Railway 대시보드에서 Redis 플러그인 추가
```

#### 3. 빌드 실패
```bash
# 원인: 의존성 버전 충돌
# 해결: package-lock.json 삭제 후 npm install
```

#### 4. CORS 에러
```bash
# 원인: 프론트엔드 도메인 미등록
# 해결: server/index.ts에서 CORS origin 추가
```

## 📞 지원

### Railway 지원
- 공식 문서: https://docs.railway.app
- Discord: https://discord.gg/railway

### Vercel 지원
- 공식 문서: https://vercel.com/docs
- 커뮤니티: https://github.com/vercel/vercel/discussions

---

**Last Updated**: 2025-01-20
