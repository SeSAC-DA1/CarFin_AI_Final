# 🚀 다음 작업 세션 시작 프롬프트

## 📋 현재 상황 요약

### ✅ 완료된 작업
1. **추천 결과 표시 버그 수정** (`dc432df`)
   - 문제: 추천 후 자동 질문이 결과를 가림
   - 해결: 자동 질문 비활성화

2. **시연용 프로필 자동 입력 기능** (`5edf9ed`)
   - 랜딩 페이지에 "시나리오 A", "시나리오 B" 버튼 추가
   - URL 파라미터로 자동 프로필 로드

3. **차량 필터링 로직 수정** (`a8f20df`)
   - 프로필 정규화 (vehicleTypes → carType)
   - SUV 필터링 강화 (승합차 제외)
   - 브랜드 필터링 추가

### 🚨 발견된 치명적 문제

**데이터베이스 데이터 손상/오류**
- 모든 차량이 "중형차"로만 분류됨
- SUV, 승합차, 경차 등이 전혀 없음
- 모델명도 잘못됨 (투싼 검색 → K5 반환)
- **시연 완전 불가능 상태**

---

## 🎯 다음 세션에서 해야 할 일

### 프롬프트: 데이터베이스 문제 진단 및 복구

```
CARFIN AI 프로젝트의 Railway 프로덕션 환경에서 데이터베이스 문제가 발견되었습니다.

**문제 상황**:
- 시나리오 A (SUV 추천) 테스트 중 추천 결과가 나오지 않음
- API 조회 결과 모든 차량의 carType이 "중형차"로만 분류됨
- SUV, 승합차, 경차 등이 데이터베이스에 전혀 없음
- 모델명 검색도 잘못된 결과 반환 (투싼 → K5)

**환경 정보**:
- Railway 프로젝트: carfinaifinal-production-15a8
- Database: AWS RDS PostgreSQL
- DATABASE_URL: postgresql://carfin_admin:***@carfin-db.cbkayiqs4div.ap-northeast-2.rds.amazonaws.com:5432/carfin
- 총 차량 수: 159,529대 (기대: 159,543대)

**즉시 필요한 작업**:
1. DATABASE_URL이 올바른 데이터베이스를 가리키는지 확인
2. AWS RDS의 다른 데이터베이스 목록 확인 (carfin_test, carfin_backup 등)
3. 로컬 환경에 정상 데이터베이스가 있는지 확인
4. 데이터베이스 복구 또는 재적재 방안 수립

**관련 문서**:
- claudedocs/DATABASE_ISSUE_CRITICAL.md
- claudedocs/DEPLOYMENT_SUMMARY.md

시작해주세요.
```

---

## 🔍 진단 단계별 가이드

### 1단계: 환경 확인 (5분)

**확인 사항**:
- [ ] Railway Dashboard에서 환경 변수 `DATABASE_URL` 확인
- [ ] 로컬 `.env` 파일과 Railway 환경 변수 비교
- [ ] 다른 브랜치 (`clean-deploy`)의 DATABASE_URL 확인

**명령어**:
```bash
# 로컬 환경 확인
cd "c:\Users\MJ\Desktop\CarFin AI final\CarFin_AI_clean"
cat .env | grep DATABASE_URL

# Railway 환경 변수 확인 (Railway Dashboard에서 수동)
```

---

### 2단계: 데이터베이스 직접 조회 (10분)

**AWS RDS 접속**:
```bash
# PostgreSQL 클라이언트로 직접 접속
psql "postgresql://carfin_admin:carfin_secure_password_2025@carfin-db.cbkayiqs4div.ap-northeast-2.rds.amazonaws.com:5432/carfin"

# 데이터베이스 목록 확인
\l

# carType 분포 확인
SELECT carType, COUNT(*) as count
FROM vehicles
GROUP BY carType
ORDER BY count DESC;

# SUV 모델 확인
SELECT manufacturer, model, carType
FROM vehicles
WHERE model LIKE '%투싼%' OR model LIKE '%스포티지%' OR model LIKE '%싼타페%'
LIMIT 10;
```

**기대 결과**:
- carType: SUV, 세단, 승합차 등 다양해야 함
- 투싼/스포티지/싼타페가 실제로 존재해야 함

**실제 결과**:
- carType: "중형차"만 존재 ← 문제!

---

### 3단계: 원인 파악 (10분)

**시나리오 A: 잘못된 데이터베이스 연결**
```bash
# 다른 데이터베이스 목록 확인
psql "postgresql://carfin_admin:***@carfin-db...com:5432/postgres"
\l

# carfin, carfin_test, carfin_backup 등 확인
# 각 데이터베이스의 vehicles 테이블 확인
```

**시나리오 B: 데이터 마이그레이션 실패**
```sql
-- 테이블 스키마 확인
\d vehicles

-- 최근 수정 시간 확인
SELECT MAX(created_at) FROM vehicles;
SELECT MAX(updated_at) FROM vehicles;

-- 데이터 샘플 확인
SELECT * FROM vehicles LIMIT 5;
```

**시나리오 C: 로컬 vs 프로덕션 차이**
```bash
# 로컬에서 정상 작동하는지 확인
npm run dev

# 로컬 API 호출
curl "http://localhost:5000/api/vehicles/search?model=투싼&limit=5"
```

---

### 4단계: 해결 방안 선택 (5분)

#### 방안 1: 올바른 데이터베이스로 변경 (가장 빠름)
**조건**: 다른 데이터베이스에 올바른 데이터가 있을 때

**작업**:
1. Railway Dashboard → Settings → Environment Variables
2. `DATABASE_URL` 수정
3. 재배포 (자동)
4. 테스트

**예상 시간**: 10분

---

#### 방안 2: 백업에서 복원 (중간)
**조건**: 백업 데이터가 있을 때

**작업**:
```bash
# 백업 확인
aws rds describe-db-snapshots --db-instance-identifier carfin-db

# 복원 (AWS 콘솔에서)
# 또는 pg_restore 사용
pg_restore -h carfin-db...com -U carfin_admin -d carfin backup.dump
```

**예상 시간**: 30분-1시간

---

#### 방안 3: 원본 데이터 재적재 (느림)
**조건**: 크롤링 원본 데이터가 있을 때

**작업**:
```bash
# 원본 CSV/JSON 파일 확인
ls -la data/

# 데이터 적재 스크립트 실행
node scripts/import-vehicles.js
```

**예상 시간**: 2-4시간

---

#### 방안 4: 로컬 DB로 임시 시연 (긴급 조치)
**조건**: 시연이 급할 때

**작업**:
```bash
# 로컬에서 정상 DB로 서버 실행
DATABASE_URL="postgresql://localhost:5432/carfin_local" npm run dev

# Ngrok으로 외부 접속 가능하게
ngrok http 5000

# 또는 포트 포워딩
```

**예상 시간**: 10분
**주의**: 시연 후 반드시 프로덕션 DB 복구 필요

---

## 📝 체크리스트

### 진단 완료
- [ ] DATABASE_URL 확인
- [ ] AWS RDS 데이터베이스 목록 확인
- [ ] carType 분포 확인
- [ ] SUV 모델 존재 여부 확인
- [ ] 로컬 vs 프로덕션 비교

### 해결 방안 선택
- [ ] 방안 1: 올바른 DB로 변경
- [ ] 방안 2: 백업 복원
- [ ] 방안 3: 원본 재적재
- [ ] 방안 4: 로컬 임시 시연

### 복구 후 검증
- [ ] API 테스트: `/api/vehicles/search?model=투싼`
- [ ] carType 분포 확인: SUV, 세단, 승합차 등
- [ ] 시나리오 A 테스트: SUV 추천 작동
- [ ] 시나리오 B 테스트: 세단 추천 작동

---

## 🎬 시연 재개 조건

### 최소 요구사항
- ✅ carType: SUV, 세단, 승합차 등 다양하게 존재
- ✅ 투싼/스포티지/싼타페 등 실제 SUV 모델 존재
- ✅ 시나리오 A: "SUV 찾아요" → SUV 추천
- ✅ 시나리오 B: "세단 찾아요" → 세단 추천

### 완전 복구 기준
- ✅ 159,543대 차량 전체 복구
- ✅ 모든 carType 정확히 분류
- ✅ 모든 모델명 정확히 매칭
- ✅ E2E 테스트 모두 통과

---

## 💬 커뮤니케이션 가이드

### 사용자에게 물어볼 질문
1. **로컬 환경에 정상 데이터베이스가 있나요?**
   - 있다면: 로컬 DB 정보 확인 → Railway에 연결
   - 없다면: 백업 또는 원본 데이터 위치 확인

2. **다른 컴퓨터(clean-deploy)의 데이터베이스는 정상인가요?**
   - 정상이라면: 해당 DATABASE_URL 복사
   - 아니라면: 공통 문제, 근본 원인 조사 필요

3. **AWS RDS 콘솔에 접근할 수 있나요?**
   - 가능하면: 직접 데이터베이스 확인
   - 불가능하면: DATABASE_URL로 psql 접속

4. **언제까지 시연이 필요한가요?**
   - 급하면: 방안 4 (로컬 임시 시연)
   - 여유 있으면: 방안 1-3 (완전 복구)

---

## 📚 참고 문서

- [DATABASE_ISSUE_CRITICAL.md](./DATABASE_ISSUE_CRITICAL.md) - 문제 상세 분석
- [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) - 전체 배포 현황
- [E2E_TEST_GUIDE.md](./E2E_TEST_GUIDE.md) - 시연 시나리오 테스트 가이드
- [CRITICAL_FILTERING_FIX_PLAN.md](./CRITICAL_FILTERING_FIX_PLAN.md) - 필터링 수정 내역

---

## 🔗 유용한 링크

- Railway Dashboard: https://railway.app
- AWS RDS Console: https://console.aws.amazon.com/rds
- 프로덕션 URL: https://carfinaifinal-production-15a8.up.railway.app
- Health Check: https://carfinaifinal-production-15a8.up.railway.app/api/system/health

---

**마지막 업데이트**: 2025-10-13 11:30 (KST)
**작성자**: Claude Code
**다음 작업자**: 데이터베이스 복구 후 시연 재개

**화이팅! 🚀**