# 🔄 Railway → AWS RDS 마이그레이션 가이드

**작성일**: 2025-01-09
**목적**: Railway Express API를 AWS RDS PostgreSQL로 전환

---

## ✅ **현재 상황**

- **코드베이스**: 이미 AWS RDS 스키마 형식 (shared/schema.ts)
- **데이터베이스**: Railway PostgreSQL (구버전 127K 데이터)
- **목표**: AWS RDS로 전환 (팀원 크롤링 데이터 활용)

---

## 🚀 **마이그레이션 단계**

### **Step 1: AWS RDS 연결 테스트** (5분)

```bash
# 로컬에서 AWS RDS 연결 확인
psql "postgresql://carfin_admin:carfin_secure_password_2025@carfin-db.cbkayiqs4div.ap-northeast-2.rds.amazonaws.com:5432/carfin"

# 테이블 확인
\dt

# 예상 출력:
# vehicles, option_masters, vehicle_options, insurance_history, inspections
```

### **Step 2: Railway 환경 변수 변경** (2분)

1. Railway 대시보드 접속: https://railway.app
2. 프로젝트 선택: `carfinaifinal-production`
3. **Variables** 탭 클릭
4. `DATABASE_URL` 수정:

```bash
# 기존 (Railway PostgreSQL)
DATABASE_URL=postgresql://postgres:...@postgres.railway.internal:5432/railway

# 변경 후 (AWS RDS)
DATABASE_URL=postgresql://carfin_admin:carfin_secure_password_2025@carfin-db.cbkayiqs4div.ap-northeast-2.rds.amazonaws.com:5432/carfin
```

5. **Save** 클릭 → 자동 재배포 시작

### **Step 3: 배포 확인** (3분)

```bash
# Railway 로그 확인
railway logs

# 출력 예상:
# ✅ AWS RDS PostgreSQL 연결 완료 (TLS 검증: OFF)
```

---

## 🔍 **데이터 검증**

### **AWS RDS에 데이터가 있는지 확인**

```sql
-- 차량 개수 확인
SELECT COUNT(*) FROM vehicles;

-- 최신 데이터 확인
SELECT vehicle_id, manufacturer, model, price, distance
FROM vehicles
ORDER BY vehicle_id DESC
LIMIT 10;

-- 옵션 데이터 확인
SELECT COUNT(*) FROM option_masters;
SELECT COUNT(*) FROM vehicle_options;

-- 보험 이력 확인
SELECT COUNT(*) FROM insurance_history;
```

**예상 결과**:
- `vehicles`: 크롤링된 데이터 (예: 50,000개 이상)
- `option_masters`: 정규화된 옵션 마스터 테이블
- `vehicle_options`: 차량-옵션 매핑
- `insurance_history`: 보험/사고 이력

---

## ⚠️ **주의사항**

### **1. 데이터 호환성**

Railway의 127K 데이터와 AWS RDS 데이터가 **중복될 수 있음**:
- Railway: 127,378개 구버전 데이터
- AWS RDS: 팀원 크롤링 최신 데이터

**해결책**: AWS RDS 우선 사용 (최신 데이터)

### **2. 컬럼 차이**

Railway DB에는 없지만 AWS RDS에 있는 컬럼:
- `car_seq`: 차량 시퀀스 번호
- `vehicle_no`: 차량번호 (UNIQUE)
- `model_group`: 모델 그룹 (예: EV6, 모하비)
- `grade`: 등급 (예: 롱레인지 2WD)
- `trim`: 트림 (예: 어스, GT-Line)

**영향**: Frontend에서 더 상세한 정보 표시 가능

### **3. 옵션 데이터**

**Railway DB**:
```sql
vehicles (
  options TEXT[]  -- 배열
)
```

**AWS RDS**:
```sql
option_masters (
  option_master_id, option_code, option_name, option_group
)
vehicle_options (
  vehicle_id, option_master_id  -- M:N 관계
)
```

**영향**:
- [server/storage.ts:86-88](server/storage.ts:86-88)의 옵션 변환 로직 수정 필요
- 또는 AWS RDS에서 옵션 JOIN 쿼리로 조회

---

## 🔧 **추가 수정 필요 사항**

### **1. 옵션 데이터 JOIN 쿼리 (선택)**

현재 코드는 `hasOptions` TEXT 필드를 사용:
```typescript
// shared/types/vehicle.ts:86-88
options: raw.hasOptions && typeof raw.hasOptions === 'string'
  ? raw.hasOptions.split(',').map(o => o.trim())
  : []
```

AWS RDS에서는 JOIN 필요:
```typescript
// server/storage.ts - 옵션 조회 함수 추가
async function getVehicleOptions(vehicleId: number): Promise<string[]> {
  const query = `
    SELECT om.option_name
    FROM vehicle_options vo
    JOIN option_masters om ON vo.option_master_id = om.option_master_id
    WHERE vo.vehicle_id = $1
  `;
  const result = await pool.query(query, [vehicleId]);
  return result.rows.map(r => r.option_name);
}
```

### **2. 보험 이력 추가 API (선택)**

AWS RDS에는 `insurance_history` 테이블 존재:

```typescript
// server/routes.ts - 새 엔드포인트 추가
app.get("/api/vehicles/:id/insurance", async (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT * FROM insurance_history WHERE vehicle_id = $1
  `;
  const result = await pool.query(query, [id]);
  res.json(result.rows[0]);
});
```

---

## 📊 **마이그레이션 후 기대 효과**

### **Before (Railway DB)**
- 127,378개 정적 데이터
- 옵션: TEXT 배열
- 보험: 단순 금액만 (myAccidentCost, otherAccidentCost)
- 점검 이력: 없음

### **After (AWS RDS)**
- 크롤링 최신 데이터 (자동 업데이트)
- 옵션: 정규화 테이블 (option_masters)
- 보험: 상세 이력 (사고 횟수, 전손/침수, 특수 용도)
- 점검 이력: 상세 데이터 (사고/침수/화재/튜닝/리콜)

---

## 🎯 **롤백 방법** (문제 발생 시)

Railway 환경 변수를 원래대로 복원:
```bash
DATABASE_URL=<원래 Railway PostgreSQL URL>
```

---

## ✅ **완료 체크리스트**

- [ ] AWS RDS 연결 테스트 성공
- [ ] Railway 환경 변수 변경 완료
- [ ] Railway 재배포 성공
- [ ] 로그에서 "AWS RDS PostgreSQL 연결 완료" 확인
- [ ] Frontend에서 차량 검색 테스트
- [ ] API 응답 정상 확인

---

**예상 소요 시간**: 10-15분
**다운타임**: 재배포 중 약 1-2분

**참고**: 코드 수정은 불필요합니다. 환경 변수만 변경하면 됩니다!
