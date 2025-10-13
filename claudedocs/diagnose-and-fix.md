# 🚨 데이터베이스 문제 진단 및 해결 방안

## 현재 상황 분석

### ✅ 확인된 사항
1. **Railway 서버**: 정상 작동 중
2. **데이터베이스 연결**: AWS RDS 연결 성공
3. **현재 DATABASE_URL**: `postgresql://carfin_admin:***@carfin-db.cbkayiqs4div.ap-northeast-2.rds.amazonaws.com:5432/carfin`
4. **총 차량 수**: 159,578대 (정상)

### ❌ 심각한 문제
1. **SUV 차량**: 159,578대 중 단 1대만 존재
2. **carType 분포**: 대부분 "대형차"로 잘못 분류됨
3. **모델 검색 오류**: "투싼" 검색 시 "K8" 반환
4. **데이터 품질**: 사용 불가능 수준

## 🔍 근본 원인 분석

### 가능한 시나리오

#### 시나리오 1: 잘못된 데이터베이스 연결 ⭐⭐⭐⭐⭐
**가능성**: 매우 높음

AWS RDS `carfin-db` 인스턴스에 여러 데이터베이스가 있을 수 있음:
- `carfin` ← 현재 연결 중 (❌ 손상된 데이터)
- `carfin_prod` ← 정상 데이터?
- `carfin_main` ← 정상 데이터?
- `carfin_backup` ← 백업 데이터?

#### 시나리오 2: 데이터 손상/덮어쓰기 ⭐⭐⭐
**가능성**: 높음

- 최근 테스트 데이터로 프로덕션 덮어씀
- migration 실패
- 잘못된 seed 스크립트 실행

#### 시나리오 3: 크롤러 실행 필요 ⭐⭐
**가능성**: 중간

- backend-main/data-pipeline/crawler에 크롤러 존재
- 아직 실행 안 됨?
- 데이터 수집 필요?

## 🛠️ 해결 방안 (우선순위 순)

### 방안 1: AWS RDS 데이터베이스 목록 확인 ⭐⭐⭐⭐⭐
**소요 시간**: 10분
**성공률**: 90%

```bash
# AWS RDS Console 접속
https://console.aws.amazon.com/rds

# 1. carfin-db 인스턴스 클릭
# 2. Configuration → Database 섹션 확인
# 3. Connect 버튼 → Endpoint 정보 확인
# 4. 다른 데이터베이스가 있는지 확인
```

**확인 사항**:
- [ ] carfin_prod 데이터베이스가 있는가?
- [ ] carfin_main 데이터베이스가 있는가?
- [ ] 각 데이터베이스의 크기는?

**만약 정상 DB 발견 시**:
```bash
# Railway Dashboard → Variables
DATABASE_URL=postgresql://carfin_admin:***@carfin-db.../carfin_prod

# 재배포
git commit --allow-empty -m "Fix: Update DATABASE_URL to correct DB"
git push railway railway-production:main
```

---

### 방안 2: 데이터베이스 백업에서 복원 ⭐⭐⭐⭐
**소요 시간**: 30-60분
**성공률**: 80%

**전제조건**: AWS RDS 자동 백업 활성화 상태

```bash
# AWS RDS Console
# 1. carfin-db 인스턴스 선택
# 2. Actions → Restore to point in time
# 3. 데이터가 정상이었던 시점 선택 (예: 10월 12일)
# 4. 새 DB 인스턴스 생성: carfin-db-restored
# 5. 새 DATABASE_URL로 연결

# Railway 환경 변수
DATABASE_URL=postgresql://carfin_admin:***@carfin-db-restored.../carfin
```

---

### 방안 3: 크롤러 재실행하여 데이터 재수집 ⭐⭐⭐
**소요 시간**: 2-4시간 (크롤링 시간)
**성공률**: 70%

```bash
# backend-main/data-pipeline/crawler 사용
cd backend-main/data-pipeline

# 크롤러 실행 (각 사이트별)
python crawler/chacha_crawler.py
python crawler/encar_crawler.py

# 데이터베이스에 적재
# (connection.py 확인 필요)
```

**장점**: 최신 매물 데이터
**단점**: 시간이 오래 걸림

---

### 방안 4: 로컬 서버 + 정상 데이터베이스 (임시) ⭐⭐
**소요 시간**: 20분
**성공률**: 99%

로컬에서 정상 데이터베이스로 연결하고 ngrok으로 외부 접속

```bash
# 로컬 .env 수정
DATABASE_URL=postgresql://...정상DB주소...

# 로컬 서버 실행
npm run dev

# ngrok으로 외부 접속 가능하게
ngrok http 5000
```

**시연용으로는 충분하지만 배포 아님**

---

## 📋 즉시 실행 체크리스트

### Phase 1: 긴급 진단 (지금 즉시 - 10분)

1. **AWS RDS Console 확인**
   - [ ] https://console.aws.amazon.com/rds 로그인
   - [ ] carfin-db 인스턴스 클릭
   - [ ] Databases 목록에서 `carfin` 외에 다른 DB 있는지 확인
   - [ ] 각 DB의 크기(Size) 확인

2. **정상 DB 후보 찾기**
   - [ ] `carfin_prod`, `carfin_main`, `carfin_backup` 존재 여부
   - [ ] 크기가 큰 DB (수 GB 이상) 확인

### Phase 2: 연결 테스트 (20분)

**정상 DB를 찾았다면**:

1. **로컬에서 먼저 테스트**
   ```bash
   # .env 파일 수정
   DATABASE_URL=postgresql://carfin_admin:***@carfin-db.../[발견한_DB_이름]

   # 로컬 서버 실행
   npm run dev

   # 브라우저에서 테스트
   http://localhost:5000/api/vehicles/search?limit=100

   # carType 분포 확인
   # SUV, 세단, SUV 등이 골고루 있는지 확인
   ```

2. **투싼 검색 테스트**
   ```bash
   curl "http://localhost:5000/api/vehicles/search?model=투싼&limit=5"
   # 실제 투싼 모델이 나와야 함
   ```

3. **확인되면 Railway에 적용**
   ```bash
   # Railway Dashboard → Settings → Variables
   # DATABASE_URL 값 변경
   # 자동 재배포됨
   ```

### Phase 3: 검증 (10분)

Railway 재배포 후:

```bash
# Health Check
curl https://carfinaifinal-production-15a8.up.railway.app/api/system/health

# carType 분포 확인
curl "https://carfinaifinal-production-15a8.up.railway.app/api/vehicles/search?limit=500" | grep -o '"carType":"[^"]*"' | sort | uniq -c

# 투싼 검색
curl "https://carfinaifinal-production-15a8.up.railway.app/api/vehicles/search?model=투싼"

# 시나리오 A, B 완전 테스트
```

---

## 🚀 최종 목표

- ✅ Railway 프로덕션 URL에서 정상 작동
- ✅ SUV 차량 수: 30,000대 이상
- ✅ "투싼" 검색 시 실제 투싼 모델 반환
- ✅ 시나리오 A, B 모두 3분 내 추천 완료

---

## 💡 다음 단계

**지금 선택하세요**:

1. ✅ **AWS RDS Console 확인** (추천)
   - 가장 빠르고 확실한 방법
   - 정상 DB가 이미 존재할 가능성 높음

2. ⚠️ **크롤러 재실행**
   - 시간이 오래 걸림 (2-4시간)
   - 최신 데이터 확보 가능

3. 🔧 **백업 복원**
   - 정상 DB가 없을 경우
   - AWS 백업 정책 확인 필요

**결정 후 즉시 실행하면 오늘 밤 안에 해결 가능!** ⏰
