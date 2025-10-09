# 🚂 Railway 환경 변수 설정 가이드

**작성일**: 2025-01-09
**목적**: Railway에서 AWS RDS로 전환하는 환경 변수 설정

---

## ✅ **로컬 테스트 완료**

```
✅ AWS RDS 연결 성공!
차량 개수: 127,378개
```

AWS RDS가 정상 작동합니다. 이제 Railway 프로덕션 환경에 적용합니다.

---

## 🎯 **Railway 환경 변수 변경 단계**

### **Step 1: Railway 대시보드 접속**

1. 브라우저에서 https://railway.app 접속
2. 로그인
3. **프로젝트 선택**: `carfinaifinal-production` (또는 해당 프로젝트)

### **Step 2: 환경 변수 페이지 이동**

1. 좌측 사이드바에서 프로젝트 클릭
2. 상단 탭에서 **"Variables"** 클릭
3. 또는 **"Settings"** → **"Environment"** 섹션

### **Step 3: DATABASE_URL 수정**

**현재 값 (Railway PostgreSQL)**:
```
DATABASE_URL=postgresql://postgres:...@postgres.railway.internal:5432/railway
```

**변경할 값 (AWS RDS)**:
```
DATABASE_URL=postgresql://carfin_admin:carfin_secure_password_2025@carfin-db.cbkayiqs4div.ap-northeast-2.rds.amazonaws.com:5432/carfin
```

**수정 방법**:
1. `DATABASE_URL` 변수 찾기
2. 오른쪽 **"Edit"** 버튼 클릭
3. 값을 AWS RDS URL로 변경
4. **"Save"** 또는 **"Update"** 버튼 클릭

### **Step 4: 재배포 확인**

Railway는 환경 변수 변경 시 **자동으로 재배포**됩니다:

1. **"Deployments"** 탭에서 진행 상황 확인
2. 빌드 로그에서 다음 메시지 확인:
   ```
   ✅ AWS RDS PostgreSQL 연결 완료 (TLS 검증: OFF)
   ```
3. 배포 완료 시간: 약 2-3분

---

## 🔍 **배포 후 확인 사항**

### **1. Railway 로그 확인**

**"Logs"** 탭에서 확인:
```bash
✅ AWS RDS PostgreSQL 연결 완료
Server running on port 5000
```

### **2. API 테스트**

브라우저에서 확인:
```
https://carfinaifinal-production.up.railway.app/api/vehicles/search?limit=5
```

**예상 응답**:
```json
[
  {
    "vehicleId": 1,
    "manufacturer": "현대",
    "model": "아반떼",
    "price": 2500,
    ...
  }
]
```

### **3. Frontend 테스트**

1. https://carfinaifinal-production.up.railway.app 접속
2. 온보딩 → 프로필 설정 → AI 상담
3. "3000만원대 가족용 SUV 찾아요" 입력
4. 차량 추천 정상 작동 확인

---

## ⚠️ **주의사항**

### **1. 다운타임**
- 환경 변수 변경 시 재배포 중 약 1-2분 서비스 중단
- 사용자가 적은 시간대 (새벽 2-4시) 권장

### **2. 데이터 차이**
- Railway DB: 127,378개 (구버전)
- AWS RDS: 127,378개 (팀원 크롤링 데이터)
- 차량 ID가 다를 수 있음 → Frontend 북마크 무효화 가능

### **3. 캐시 무효화**
- Railway Redis가 있다면 캐시 클리어 필요:
  ```bash
  # Railway CLI 사용
  railway run redis-cli FLUSHALL
  ```

---

## 🔄 **롤백 방법** (문제 발생 시)

### **즉시 롤백**:
1. Railway 대시보드 → Variables
2. `DATABASE_URL`을 원래 Railway PostgreSQL URL로 복원
3. Save → 자동 재배포 (2-3분)

### **이전 배포로 롤백**:
1. **"Deployments"** 탭
2. 이전 성공한 배포 찾기
3. 오른쪽 **"..."** 메뉴 → **"Redeploy"**

---

## 📊 **변경 전후 비교**

| 항목 | Before (Railway DB) | After (AWS RDS) |
|------|---------------------|-----------------|
| **연결 주소** | postgres.railway.internal | carfin-db.cbkayiqs4div.ap-northeast-2.rds.amazonaws.com |
| **데이터** | 127,378개 (정적) | 127,378개 (크롤링 업데이트) |
| **옵션** | TEXT[] 배열 | option_masters 테이블 |
| **보험 이력** | 단순 금액 | 상세 이력 (20+ 컬럼) |
| **점검 이력** | 없음 | inspections 테이블 |

---

## ✅ **완료 체크리스트**

- [x] 로컬에서 AWS RDS 연결 테스트 성공
- [ ] Railway 대시보드 접속
- [ ] DATABASE_URL 변경 완료
- [ ] 재배포 완료 (2-3분 대기)
- [ ] 로그에서 "AWS RDS 연결 완료" 확인
- [ ] API 엔드포인트 테스트 성공
- [ ] Frontend 차량 검색 테스트 성공

---

## 🎯 **다음 단계** (선택 사항)

1. **옵션 데이터 JOIN**: option_masters 테이블 활용
2. **보험 이력 API**: insurance_history 엔드포인트 추가
3. **점검 이력 시각화**: inspections 데이터 Frontend 표시
4. **Airflow 크롤링 연동**: 자동 데이터 업데이트 확인

---

**예상 소요 시간**: 5분
**다운타임**: 1-2분
**위험도**: 낮음 (롤백 즉시 가능)

**지금 바로 Railway에서 환경 변수를 변경하세요!** 🚀
