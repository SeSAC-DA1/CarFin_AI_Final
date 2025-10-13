# Railway 배포 디버깅 가이드

## 1. Railway 대시보드에서 확인

### Deployments 탭
1. Railway 프로젝트 → **Deployments** 탭 클릭
2. 최신 배포 상태 확인:
   - 🟢 **Success**: 배포 성공
   - 🔴 **Failed**: 배포 실패
   - 🟡 **Building**: 빌드 중
   - ⚪ **Queued**: 대기 중

### 배포 로그 확인
1. 실패한 배포 클릭
2. **Build Logs** 탭 확인
   - `npm ci` 단계
   - `npm run build:production` 단계
   - `npm start` 단계
3. 에러 메시지 찾기 (ERROR, FAILED, ✖)

## 2. 브라우저에서 로그 확인

### Railway CLI 없이 확인
1. Railway 프로젝트 → **Settings** → **Deploy Logs**
2. **View Deployment** 클릭
3. 전체 로그 스크롤

### 확인할 항목
```
✓ npm ci (의존성 설치 성공)
✓ npm run build:production (빌드 성공)
✓ npm start (서버 시작 성공)
```

## 3. 배포 실패 원인 Top 5

### 원인 1: 빌드 타임아웃
**증상**: 로그가 중간에 멈춤
**해결**: Railway 플랜 업그레이드 또는 빌드 최적화

### 원인 2: 메모리 부족
**증상**: "JavaScript heap out of memory"
**해결**:
```bash
# package.json scripts 수정
"build": "NODE_OPTIONS='--max-old-space-size=4096' vite build && ..."
```

### 원인 3: 환경 변수 누락
**증상**: 서버 시작 후 즉시 종료
**해결**: Railway → Variables 탭에서 확인
- DATABASE_URL
- GOOGLE_API_KEY
- RAILWAY_REDIS_URL (선택)

### 원인 4: 포트 바인딩 실패
**증상**: "EADDRINUSE" 또는 "port already in use"
**해결**: Railway가 자동으로 PORT 환경 변수 제공

### 원인 5: 종속성 충돌
**증상**: "npm ERR! peer dependency"
**해결**: package-lock.json 삭제 후 재커밋

## 4. 로컬에서 프로덕션 빌드 테스트

```bash
# 1. 클린 빌드
rm -rf node_modules dist
npm ci
npm run build:production

# 2. 프로덕션 시작
npm start

# 3. 테스트
curl http://localhost:5000
```

## 5. Railway CLI로 실시간 로그 확인

```bash
# Railway CLI 설치 (없다면)
npm install -g @railway/cli

# 프로젝트 연결
railway link

# 실시간 로그
railway logs

# 특정 서비스 로그
railway logs --service=backend
```

## 6. 강제 재배포

### 방법 1: Redeploy 버튼
Railway 대시보드 → Deployments → **Redeploy** 클릭

### 방법 2: 더미 커밋
```bash
git commit --allow-empty -m "chore: trigger Railway redeploy"
git push origin railway-production
```

## 7. 현재 상황 체크리스트

### 즉시 확인
- [ ] Railway Deployments 탭에서 최신 배포 상태 확인
- [ ] 실패 시 Build Logs에서 에러 메시지 복사
- [ ] Variables 탭에서 필수 환경 변수 확인
- [ ] 로컬 `npm run build:production` 성공 확인

### 배포 성공 시 확인
- [ ] Railway 제공 URL 접속 (https://xxx.railway.app)
- [ ] /api/system/health 엔드포인트 테스트
- [ ] WebSocket 연결 테스트

## 8. 비상 롤백

### 이전 성공 버전으로 롤백
1. Railway → Deployments
2. 이전 성공 배포 찾기
3. **⋯** (점 3개) → **Redeploy** 클릭

### Git 롤백
```bash
git log --oneline -5
git revert HEAD  # 최신 커밋 되돌리기
git push origin railway-production
```
