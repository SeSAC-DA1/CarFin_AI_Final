# Railway 배포 가이드 - CarFin AI

## 🚀 빠른 배포

### 1단계: Railway 프로젝트 생성

1. [Railway](https://railway.app) 접속 및 로그인
2. **New Project** 클릭
3. **Deploy from GitHub repo** 선택
4. 이 저장소 선택

### 2단계: PostgreSQL 데이터베이스 추가

1. 프로젝트 대시보드에서 **New** → **Database** → **PostgreSQL** 클릭
2. Railway가 자동으로 데이터베이스 생성 및 연결

### 3단계: 환경변수 설정

Railway 대시보드의 **Variables** 탭에서 다음 변수 추가:

```bash
# 필수 환경변수
GEMINI_API_KEY=your_gemini_api_key_here
SESSION_SECRET=random_secret_string_here

# 자동 제공되는 변수 (Railway가 자동 설정)
DATABASE_URL=${{Postgres.DATABASE_URL}}
PORT=${{PORT}}
NODE_ENV=production
```

### 4단계: 데이터베이스 초기화

#### 방법 1: Railway CLI 사용 (추천)

```bash
# Railway CLI 설치 (처음 한 번만)
npm i -g @railway/cli

# Railway 로그인
railway login

# 프로젝트 연결
railway link

# 데이터베이스 스키마 생성
railway run npm run db:push

# 500개 차량 데이터 시드 (Node.js 스크립트)
railway run npx tsx scripts/seed-database.ts
```

#### 방법 2: Railway 대시보드 사용

1. **PostgreSQL** 서비스 클릭 → **Data** 탭
2. **Query** 탭에서 다음 SQL 실행:
   ```sql
   -- 먼저 스키마 확인 (vehicles 테이블이 있어야 함)
   \dt
   ```
3. 터미널에서 SQL 덤프 복사:
   ```bash
   cat railway_seed.sql
   ```
4. Railway Data 탭에 SQL 붙여넣기 및 실행

#### 방법 3: 로컬에서 Railway DB에 직접 연결

```bash
# Railway에서 DATABASE_URL 복사
# Settings → Variables → DATABASE_URL 값 복사

# 로컬에서 직접 시드 (Node.js 스크립트)
DATABASE_URL="your_railway_database_url" npx tsx scripts/seed-database.ts
```

### 5단계: 도메인 생성

1. 서비스 클릭 → **Settings** → **Networking**
2. **Generate Domain** 클릭
3. `https://your-app.up.railway.app` 주소 확인

---

## ✅ 배포 확인 체크리스트

- [ ] Railway 프로젝트 생성 완료
- [ ] PostgreSQL 데이터베이스 추가
- [ ] `GEMINI_API_KEY` 환경변수 설정
- [ ] `SESSION_SECRET` 환경변수 설정
- [ ] 데이터베이스 스키마 생성 (`railway run npm run db:push`)
- [ ] 500개 차량 데이터 시드 (`railway run npx tsx scripts/seed-database.ts`)
- [ ] 차량 개수 확인 (500개 확인)
- [ ] 도메인 생성 및 접속 테스트
- [ ] WebSocket 연결 테스트 (wss:// 프로토콜)
- [ ] AI 챗봇 기능 테스트 (3개 에이전트 협업)
- [ ] 차량 추천 테스트 (TOPSIS 랭킹)
- [ ] 인사이트 모달 테스트 (종합/비용/TOPSIS 탭)

---

## 🔧 기술 세부사항

### WebSocket 설정
- Railway는 자동으로 WebSocket을 지원합니다
- 클라이언트는 `wss://` (secure WebSocket) 프로토콜 사용
- WebSocket은 Express 서버와 같은 포트에서 실행됨 (`/ws/chat`)

### 환경변수 구성

| 변수 | 설명 | 예시 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 (자동) | `postgresql://...` |
| `GEMINI_API_KEY` | Google Gemini API 키 | `AIzaSy...` |
| `SESSION_SECRET` | Express 세션 시크릿 | `random_string` |
| `PORT` | 서버 포트 (Railway 자동 할당) | `5000` |
| `NODE_ENV` | Node 환경 | `production` |

### 빌드 프로세스
```bash
# 1. Vite로 클라이언트 빌드
vite build

# 2. esbuild로 서버 번들링
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# 3. 프로덕션 실행
NODE_ENV=production node dist/index.js
```

---

## 🐛 문제 해결

### WebSocket 연결 실패
- Railway 도메인을 `wss://` 프로토콜로 사용하는지 확인
- `PORT` 환경변수가 Railway에서 자동 할당되는지 확인

### 데이터베이스 연결 에러
- `DATABASE_URL`이 `${{Postgres.DATABASE_URL}}`로 설정되었는지 확인
- PostgreSQL 서비스가 동일 프로젝트에 있는지 확인

### Gemini API 에러
- `GEMINI_API_KEY`가 올바르게 설정되었는지 확인
- API 키의 할당량이 남아있는지 확인

---

## 📊 성능 및 비용

### Railway 요금제
- **Free Tier**: 월 $5 크레딧 (카드 등록 불필요)
- **Pro Plan**: $20/월 + 사용량 기반 요금

### 예상 리소스
- **메모리**: ~256MB (Express + WebSocket)
- **CPU**: 낮음 (Gemini API 호출이 주요 작업)
- **스토리지**: ~100MB (프로덕션 빌드)
- **데이터베이스**: ~50MB (500개 차량)

---

## 🔐 보안 권장사항

1. **환경변수 관리**
   - Railway Variables에서만 시크릿 관리
   - `.env` 파일을 Git에 커밋하지 말 것

2. **API 키 보호**
   - `GEMINI_API_KEY`는 서버 사이드에서만 사용
   - 클라이언트 코드에 노출 금지

3. **데이터베이스 보안**
   - Railway가 자동으로 SSL 연결 제공
   - 프로덕션 DATABASE_URL 공개 금지

---

## 📱 배포 후 테스트

배포 완료 후 다음 기능을 테스트하세요:

1. **홈페이지 접속**: `https://your-app.up.railway.app`
2. **채팅 페이지**: "무료로 시작하기" 클릭
3. **AI 챗봇**: "3000만원 이하 SUV 추천해주세요" 메시지 전송
4. **에이전트 응답**: Needs Analyst, Data Analyst, Concierge 순서 확인
5. **차량 추천**: 3대 차량 표시 확인
6. **인사이트 모달**: "AI 인사이트" 버튼 클릭 및 탭 전환
7. **TOPSIS 점수**: 가격, 안전성, 연비, 주행거리 점수 확인

---

## 🔄 CI/CD 자동 배포

Railway는 GitHub 연동 시 자동으로 배포됩니다:

1. `main` 브랜치에 push
2. Railway가 자동으로 빌드 시작
3. 빌드 성공 시 자동 배포
4. 로그는 Railway 대시보드에서 확인

---

## 🆘 지원

문제가 발생하면 다음을 확인하세요:

- Railway 대시보드의 **Deployments** 탭 → 로그 확인
- **Metrics** 탭 → CPU/메모리 사용량 확인
- [Railway Docs](https://docs.railway.app)
- [Railway Community](https://help.railway.app)
