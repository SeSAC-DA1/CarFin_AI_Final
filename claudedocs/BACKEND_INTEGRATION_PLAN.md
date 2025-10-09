# 🔗 backend-main 통합 계획서

**작성일**: 2025-01-09
**목적**: 팀원이 작업한 FastAPI 백엔드(backend-main)를 현재 Railway Express.js API와 통합하여 CarFin AI 플랫폼 완성

---

## 📊 backend-main 프로젝트 분석

### 🏗️ **프로젝트 구조**
```
backend-main/
├── backend/                    # FastAPI 서버 (미완성)
│   ├── Dockerfile
│   ├── requirements.txt       # FastAPI, SQLAlchemy, Alembic
│   └── tests/                 # 단위 테스트
│
├── data-pipeline/              # ✅ 핵심 가치
│   ├── crawler/               # 엔카/KB차차차 크롤러 (4,654 lines)
│   │   ├── encar_crawler.py
│   │   ├── chacha_crawler.py
│   │   ├── getcha_crawler.py
│   │   ├── finanace_crawler.py (국민은행 대출 상품)
│   │   ├── option_mapping.py  # 차량 옵션 정규화
│   │   └── inspection_mapping.py # 차량 점검 데이터 매핑
│   │
│   ├── model/                 # 추천 시스템 (기초 구현)
│   │   ├── car_recommender.py # 가중치 기반 추천
│   │   ├── recommender_faiss.py # FAISS 벡터 검색
│   │   └── recommender_nlist.py # IVF 인덱싱
│   │
│   └── db/
│       ├── connection.py      # SQLAlchemy 세션 관리
│       └── model.py           # 데이터베이스 스키마 (AWS RDS PostgreSQL)
│
├── finanace_crawler.py         # 독립 실행 금융 크롤러
├── finance.ipynb              # 금융 데이터 분석 노트북
├── docker-compose.yml         # FastAPI + AWS RDS 배포 설정
└── README.md                  # 프로젝트 문서
```

---

## 🎯 **핵심 자산 평가**

### ✅ **1. 크롤링 시스템 (최고 가치)**
- **파일**: `data-pipeline/crawler/*.py` (4,654 lines)
- **기능**:
  - **엔카 크롤러** (encar_crawler.py): 차량 기본정보 + 옵션 + 점검 + 보험 이력 수집
  - **KB차차차 크롤러** (chacha_crawler.py): 엔카와 동일한 구조로 통합
  - **국민은행 대출 크롤러** (finanace_crawler.py): 자동차 대출 상품 금리 정보
  - **데이터 정규화**: option_mapping.py, inspection_mapping.py로 플랫폼 간 데이터 통일
- **현재 상태**: ✅ **완성도 높음** (실전 사용 가능)
- **통합 가치**: ⭐⭐⭐⭐⭐ (5/5)

### ✅ **2. 데이터베이스 스키마 (고급 설계)**
- **파일**: `data-pipeline/db/model.py`
- **테이블 구조**:
  ```python
  - vehicles: 차량 기본정보 (27개 컬럼)
  - option_masters: 옵션 마스터 테이블 (정규화)
  - vehicle_options: 차량-옵션 매핑 (M:N)
  - insurance_history: 보험/사고 이력 (20개 컬럼)
  - inspections: 차량 점검 요약
  - inspection_details: 세부 점검 항목 (내부/외판)
  ```
- **특징**:
  - 정규화된 옵션 관리 (Railway DB는 TEXT[] 배열)
  - 보험/사고 이력 상세 추적 (Railway DB는 단순 금액만)
  - 차량 점검 이력 (Railway DB는 없음)
- **현재 상태**: ✅ **프로덕션 레벨 설계**
- **통합 가치**: ⭐⭐⭐⭐ (4/5)

### ⚠️ **3. FastAPI 서버 (미완성)**
- **파일**: `backend/` (거의 비어있음)
- **현재 상태**: ❌ **구현 안 됨** (Dockerfile, requirements.txt만 존재)
- **통합 가치**: ⭐ (1/5) - Railway Express API가 이미 완성

### ⚠️ **4. 추천 시스템 (기초 구현)**
- **파일**: `data-pipeline/model/car_recommender.py`
- **알고리즘**: 가중치 기반 점수 계산 (if문 나열)
- **현재 상태**: ⚠️ **기초 수준** (MACRec, TOPSIS보다 낮음)
- **통합 가치**: ⭐⭐ (2/5) - Railway의 MACRec + TOPSIS가 더 우수

---

## 🔄 **현재 시스템 vs backend-main 비교**

| 항목 | Railway Express API (현재) | backend-main (팀원) | 통합 방향 |
|------|---------------------------|---------------------|----------|
| **백엔드 서버** | Express.js + TypeScript ✅ | FastAPI (미구현) ❌ | Railway 유지 |
| **데이터베이스** | PostgreSQL (127,378개) ✅ | AWS RDS PostgreSQL ✅ | **통합 필요** |
| **추천 알고리즘** | MACRec + TOPSIS ✅ | 가중치 기반 ⚠️ | Railway 유지 |
| **크롤링** | 없음 ❌ | 엔카/차차차/금융 ✅ | **backend-main 채택** |
| **금융 데이터** | TCO 계산기만 ✅ | 대출 상품 크롤링 ✅ | **backend-main 채택** |
| **차량 옵션** | TEXT[] 배열 ⚠️ | 정규화 테이블 ✅ | **backend-main 채택** |
| **보험 이력** | 단순 금액만 ⚠️ | 상세 추적 ✅ | **backend-main 채택** |
| **점검 이력** | 없음 ❌ | 상세 데이터 ✅ | **backend-main 채택** |

---

## 🎯 **통합 전략**

### ✅ **Phase 1: 데이터베이스 스키마 통합** (최우선)

**문제**: Railway DB와 backend-main DB가 구조 다름

**해결책**: **Railway DB를 backend-main 스키마로 마이그레이션**

#### **1-1. 새로운 테이블 추가**
```sql
-- Railway PostgreSQL에 추가할 테이블
CREATE TABLE option_masters (
  option_master_id SERIAL PRIMARY KEY,
  option_code VARCHAR(50) UNIQUE NOT NULL,
  option_name VARCHAR(100) NOT NULL,
  option_group VARCHAR(50) NOT NULL,
  description TEXT
);

CREATE TABLE vehicle_options (
  vehicle_option_id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(vehicleId),
  option_master_id INTEGER REFERENCES option_masters(option_master_id),
  UNIQUE(vehicle_id, option_master_id)
);

CREATE TABLE insurance_history (
  insurance_id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(vehicleId),
  platform VARCHAR(20) NOT NULL,
  my_accident_cnt INTEGER DEFAULT 0,
  other_accident_cnt INTEGER DEFAULT 0,
  my_accident_cost INTEGER DEFAULT 0,
  other_accident_cost INTEGER DEFAULT 0,
  total_loss_cnt INTEGER DEFAULT 0,
  flood_total_loss_cnt INTEGER DEFAULT 0,
  owner_change_cnt INTEGER DEFAULT 0,
  UNIQUE(vehicle_id, platform)
);

CREATE TABLE inspections (
  inspection_id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(vehicleId),
  platform VARCHAR(16) NOT NULL,
  inspected_at VARCHAR(8),
  accident_history BOOLEAN,
  simple_repair BOOLEAN,
  waterlog BOOLEAN,
  engine_check_ok BOOLEAN,
  trans_check_ok BOOLEAN
);
```

#### **1-2. 기존 데이터 마이그레이션**
```sql
-- vehicles 테이블의 options (TEXT[]) → vehicle_options 테이블로 이동
-- myAccidentCost, otherAccidentCost → insurance_history로 이동
```

**예상 시간**: 2-3시간

---

### ✅ **Phase 2: 크롤링 시스템 통합** (핵심 가치)

**목표**: backend-main의 크롤러를 Airflow DAG에 통합

#### **2-1. 크롤러 코드 이전**
```bash
# 크롤러 파일을 Airflow DAG 디렉토리로 복사
airflow/dags/crawlers/
├── encar_crawler.py      # backend-main에서 복사
├── chacha_crawler.py     # backend-main에서 복사
├── finance_crawler.py    # backend-main에서 복사
└── option_mapping.py     # backend-main에서 복사
```

#### **2-2. Railway DB 연결 수정**
```python
# data-pipeline/db/connection.py 수정
# AWS RDS → Railway PostgreSQL로 변경

DB_CONFIG = {
    'host': os.getenv('RAILWAY_DB_HOST'),  # Railway 제공
    'port': 5432,
    'user': os.getenv('RAILWAY_DB_USER'),
    'password': os.getenv('RAILWAY_DB_PASSWORD'),
    'database': 'railway'
}
```

#### **2-3. Airflow DAG 구성**
```python
# airflow/dags/carfin_full_crawling.py
from airflow import DAG
from airflow.operators.python import PythonOperator
from crawlers.encar_crawler import crawl_encar_full
from crawlers.chacha_crawler import crawl_chacha_full
from crawlers.finance_crawler import crawl_kb_loans

dag = DAG(
    'carfin_full_data_pipeline',
    schedule_interval='0 2 * * *',  # 매일 새벽 2시
    catchup=False,
)

task_encar = PythonOperator(
    task_id='crawl_encar',
    python_callable=crawl_encar_full,
    dag=dag,
)

task_chacha = PythonOperator(
    task_id='crawl_chacha',
    python_callable=crawl_chacha_full,
    dag=dag,
)

task_finance = PythonOperator(
    task_id='crawl_finance',
    python_callable=crawl_kb_loans,
    dag=dag,
)

[task_encar, task_chacha] >> task_finance
```

**예상 시간**: 4-6시간

---

### ✅ **Phase 3: 금융 상품 데이터 추가** (신규 기능)

**목표**: 국민은행 대출 상품 정보를 DB에 저장하고 API로 제공

#### **3-1. 금융 상품 테이블 생성**
```sql
CREATE TABLE financial_products (
  product_id SERIAL PRIMARY KEY,
  bank_code VARCHAR(10) NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  ln_code VARCHAR(50),
  term_months INTEGER,
  base_rate FLOAT,
  spread_rate FLOAT,
  pref_rate FLOAT,
  min_rate FLOAT,
  max_rate FLOAT,
  effective_date DATE,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **3-2. Railway API에 금융 상품 엔드포인트 추가**
```typescript
// server/routes.ts
app.get("/api/financial/products", async (req, res) => {
  const { term_months, max_rate } = req.query;

  const query = `
    SELECT * FROM financial_products
    WHERE term_months = $1 AND min_rate <= $2
    ORDER BY min_rate ASC
    LIMIT 5
  `;

  const products = await db.query(query, [term_months, max_rate]);
  res.json(products.rows);
});

// 차량 추천 시 금융 상품도 함께 추천
app.post("/api/vehicles/recommend-with-finance", async (req, res) => {
  const { userProfile, vehicleId } = req.body;

  // 1. 차량 정보 조회
  const vehicle = await getVehicleById(vehicleId);

  // 2. 대출 금액 계산 (차량 가격의 80%)
  const loanAmount = vehicle.price * 0.8;

  // 3. 맞춤 금융 상품 추천
  const products = await recommendFinancialProducts(loanAmount, userProfile);

  res.json({ vehicle, financialProducts: products });
});
```

**예상 시간**: 3-4시간

---

### ✅ **Phase 4: 차량 상세 정보 강화** (UX 개선)

**목표**: 점검 이력, 보험 이력을 Frontend에서 시각화

#### **4-1. Railway API 엔드포인트 추가**
```typescript
// server/routes.ts
app.get("/api/vehicles/:id/inspection", async (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT i.*, id.*
    FROM inspections i
    LEFT JOIN inspection_details id ON i.inspection_id = id.inspection_id
    WHERE i.vehicle_id = $1
  `;

  const result = await db.query(query, [id]);
  res.json(result.rows);
});

app.get("/api/vehicles/:id/insurance-history", async (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT * FROM insurance_history WHERE vehicle_id = $1
  `;

  const result = await db.query(query, [id]);
  res.json(result.rows[0]);
});
```

#### **4-2. Frontend 컴포넌트 추가**
```typescript
// client/src/components/features/VehicleInspectionPanel.tsx
interface InspectionData {
  inspectedAt: string;
  accidentHistory: boolean;
  waterlog: boolean;
  engineCheckOk: boolean;
  transCheckOk: boolean;
}

export function VehicleInspectionPanel({ vehicleId }: { vehicleId: string }) {
  const { data: inspection } = useQuery(['inspection', vehicleId], () =>
    fetch(`/api/vehicles/${vehicleId}/inspection`).then(r => r.json())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔍 차량 점검 이력</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Badge variant={inspection.accidentHistory ? "destructive" : "success"}>
              사고 이력: {inspection.accidentHistory ? "있음" : "없음"}
            </Badge>
          </div>
          <div>
            <Badge variant={inspection.waterlog ? "destructive" : "success"}>
              침수 이력: {inspection.waterlog ? "있음" : "없음"}
            </Badge>
          </div>
          <div>
            <Badge variant={inspection.engineCheckOk ? "success" : "warning"}>
              엔진 상태: {inspection.engineCheckOk ? "양호" : "주의"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**예상 시간**: 5-6시간

---

## 📋 **통합 로드맵**

### **우선순위 1: 즉시 통합 가능** (1-2일)
1. ✅ **크롤러 코드 복사** → Airflow DAG 디렉토리
2. ✅ **DB 연결 수정** → Railway PostgreSQL로 변경
3. ✅ **테스트 크롤링** → 소규모 데이터 수집 (100개)

### **우선순위 2: 데이터베이스 확장** (2-3일)
4. ✅ **새 테이블 생성** → option_masters, insurance_history, inspections
5. ✅ **마이그레이션 스크립트** → 기존 127K 데이터 이전
6. ✅ **Railway API 수정** → 새로운 스키마 반영

### **우선순위 3: 신규 기능 추가** (3-5일)
7. ✅ **금융 상품 크롤링** → Airflow DAG 추가
8. ✅ **금융 상품 API** → Railway에 엔드포인트 추가
9. ✅ **Frontend 통합** → 차량 + 금융 상품 동시 추천

### **우선순위 4: UX 고도화** (5-7일)
10. ✅ **점검 이력 시각화** → Frontend 컴포넌트
11. ✅ **보험 이력 대시보드** → 사고 이력 타임라인
12. ✅ **옵션 비교 기능** → 차량 간 옵션 차이 분석

---

## ⚠️ **통합 시 주의사항**

### **1. 데이터베이스 충돌 방지**
- Railway DB와 AWS RDS를 동시에 사용하지 말 것
- **권장**: Railway DB로 완전히 통합 (AWS RDS 비용 절감)

### **2. FastAPI 서버 폐기**
- backend-main의 FastAPI는 미완성 → **사용하지 않음**
- **이유**: Railway Express API가 이미 프로덕션 레벨

### **3. 추천 알고리즘 유지**
- backend-main의 가중치 기반 추천은 기초 수준
- **유지**: Railway의 MACRec + TOPSIS (논문 기반, 90%+ 정확도)

### **4. 크롤링 중복 방지**
- Airflow에서 `vehicle_no` (차량번호) 기준으로 UPSERT
- 중복 데이터 자동 업데이트

---

## 💡 **통합 후 기대 효과**

### **1. 데이터 규모 확대**
- **현재**: 127,378개 차량 (정적 데이터)
- **통합 후**: 일일 업데이트 + 실시간 신규 매물 반영

### **2. 신규 기능 추가**
- ✅ **금융 상품 추천**: 차량 + 대출 상품 동시 매칭
- ✅ **점검 이력 제공**: 사고/침수 이력 투명 공개
- ✅ **옵션 정규화**: 플랫폼 간 옵션 통일 표기

### **3. 포트폴리오 완성도**
- **Before**: AI 추천 시스템 (알고리즘 중심)
- **After**: 실시간 데이터 파이프라인 + AI 추천 (End-to-End 플랫폼)

---

## 🚀 **즉시 시작 가능한 작업**

### **Step 1: 크롤러 테스트 (30분)**
```bash
# backend-main 디렉토리에서
cd backend-main/data-pipeline

# Railway DB 정보를 .env에 추가
echo "DB_HOST=<Railway DB Host>" >> .env
echo "DB_USER=<Railway DB User>" >> .env
echo "DB_PASSWORD=<Railway DB Password>" >> .env

# 소규모 테스트 크롤링 (10개만)
python -c "
from crawler.encar_crawler import crawl_encar_full
crawl_encar_full(max_count=10)
"
```

### **Step 2: 데이터베이스 스키마 추가 (1시간)**
```sql
-- Railway PostgreSQL에 접속하여 실행
-- (위의 Phase 1-1 SQL 실행)
```

### **Step 3: Airflow DAG 작성 (2시간)**
```python
# airflow/dags/carfin_integration.py
# (위의 Phase 2-3 코드 작성)
```

---

## 📞 **다음 단계**

1. **팀원과 협의**: backend-main의 AWS RDS → Railway로 이전 동의 필요
2. **우선순위 결정**: Phase 1~4 중 먼저 진행할 항목 선택
3. **즉시 시작**: 크롤러 테스트부터 바로 시작 가능

**추천 순서**: Phase 2 (크롤링) → Phase 1 (DB) → Phase 3 (금융) → Phase 4 (UX)

---

**결론**: backend-main의 **크롤링 시스템**과 **데이터베이스 스키마**는 매우 우수하며, Railway Express API와 완벽하게 통합 가능합니다. FastAPI 서버는 버리고, 크롤러만 가져와서 Airflow에 통합하는 것이 최선입니다.
