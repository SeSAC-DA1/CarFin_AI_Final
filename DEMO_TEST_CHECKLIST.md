# 🎯 시연 시나리오 A 실전 테스트 체크리스트

**목적**: 실제 시연 전 모든 기능이 정상 작동하는지 검증
**소요 시간**: 10분
**테스트 환경**: 로컬 개발 환경 (npm run dev)

---

## ✅ 사전 준비 (2분)

### 1. 백엔드 서버 시작
```bash
cd "c:\Users\MJ\Desktop\CarFin AI final\CarFin_AI_clean"
npm run dev
```

**확인 사항**:
- [ ] PostgreSQL 연결 성공 (AWS RDS)
- [ ] Redis 연결 성공 (로컬 또는 Railway)
- [ ] Google Gemini API 키 유효
- [ ] 서버 포트 5000 리스닝
- [ ] WebSocket 서버 활성화

**콘솔 로그 예시**:
```
✅ PostgreSQL Connected: carfin-db.cbkayiqs4div.ap-northeast-2.rds.amazonaws.com
✅ Redis Connected: localhost:6379
✅ Google Gemini API Ready
✅ Server listening on port 5000
✅ WebSocket server running
```

### 2. 브라우저 준비
- [ ] Chrome/Edge 최신 버전
- [ ] 개발자 도구 열기 (F12)
- [ ] Network 탭 → WS(WebSocket) 필터 활성화
- [ ] Console 탭 → 에러 확인용
- [ ] LocalStorage 초기화:
  ```javascript
  localStorage.removeItem('carfin_user_profile');
  localStorage.clear();
  ```

### 3. URL 접속
```
http://localhost:5000
```

---

## 🎬 Act 1: 랜딩 페이지 (1분)

### 테스트 항목
- [ ] Hero 섹션 정상 렌더링
- [ ] Stats 섹션: "실시간 매물 수" 표시 (정적 값 OK)
- [ ] Features 섹션: 비교표 표시
- [ ] PaperBasedWorkflow 섹션: 4단계 아코디언
  - [ ] Phase 1 클릭 → Task Decomposition 설명 펼침
  - [ ] Phase 2 클릭 → Parallel Execution 설명 펼침
  - [ ] Phase 3 클릭 → TOPSIS 평가 설명 펼침
  - [ ] Phase 4 클릭 → Alibaba 재정렬 설명 펼침
- [ ] Papers 섹션: 3개 논문 카드 표시
  - [ ] MACRec (SIGIR 2024)
  - [ ] Alibaba (RecSys 2019)
  - [ ] TOPSIS

**체크 포인트**:
- Papers 섹션에서 "구현 파일" 링크 클릭 → GitHub 또는 로컬 경로 확인

---

## 🎬 Act 2: 온보딩 (30초)

### 테스트 항목
- [ ] "시작하기" 버튼 클릭
- [ ] 온보딩 Step 1: AI 에이전트 소개 표시
- [ ] "다음" 버튼 → Step 2: 논문 배경 표시
- [ ] "다음" 버튼 → Step 3: Before/After 비교 표시
- [ ] "시작하기" 버튼 → 프로필 설정 페이지 이동

**체크 포인트**:
- URL이 `/profile-setup`으로 변경되었는지 확인

---

## 🎬 Act 3: 프로필 설정 - 시나리오 A (30초)

### 테스트 항목
- [ ] **"시나리오 A (가족용 SUV)" 버튼 클릭** ← 핵심!
- [ ] 자동 완성 확인:
  - [ ] 이름: 김민준
  - [ ] 나이: 30대
  - [ ] 지역: 서울
  - [ ] 용도: 가족용, 출퇴근
  - [ ] 예산: 0 ~ 3000만원
  - [ ] 안전성 중요도: 10점
  - [ ] 브랜드 선호: 현대, 기아
  - [ ] 연간 주행거리: 15000km
  - [ ] 소유 기간: 5년
- [ ] "AI 상담 시작" 버튼 활성화
- [ ] 버튼 클릭 → `/chat` 페이지 이동

**체크 포인트**:
- LocalStorage에 `carfin_user_profile` 저장되었는지 확인:
  ```javascript
  console.log(localStorage.getItem('carfin_user_profile'));
  ```

---

## 🎬 Act 4: 초기 추천 - MACRec 협업 (2분)

### 테스트 항목
- [ ] WebSocket 연결 성공 (우측 상단 초록 "연결됨" 표시)
- [ ] 채팅 입력창에 메시지 입력:
  ```
  3000만원 이하 가족용 SUV 찾아요
  ```
- [ ] "전송" 버튼 클릭

### 진행 단계 확인 (MACRecProgressPanel)
- [ ] Step 1: ✅ 대화 시작
- [ ] Step 2: 🔄 분석 중 (User Analyst)
- [ ] Step 3: 🔄 검색 중 (Searcher Agent)
- [ ] Step 4: 🔄 추천 준비 (Manager Agent)
- [ ] Step 5: ✅ 추천 완료

### Agent 협업 로그 확인 (AgentCollaborationViewer)
- [ ] "Manager → User Analyst: 사용자 니즈 분석 시작 요청"
- [ ] "User Analyst → Manager: 프로필 데이터 추출 완료"
- [ ] "Manager → Searcher: 실시간 DB 검색 시작 요청"
- [ ] "Searcher → Manager: X대 후보 차량 발견"

### 추천 결과 확인 (VehicleRecommendations)
- [ ] Top 3 차량 카드 표시
- [ ] 각 차량마다:
  - [ ] 차량 이미지 (placeholder 또는 실제 이미지)
  - [ ] 차량명 (제조사 + 모델 + 연식)
  - [ ] 가격 (만원)
  - [ ] 주행거리 (km)
  - [ ] TOPSIS 점수 (0-100점)
  - [ ] 추천 이유 3가지
  - [ ] **검증 뱃지** 2개:
    - [ ] 🛡️ 보험이력 검증
    - [ ] ✅ 점검이력 확인

**체크 포인트**:
- 콘솔에서 WebSocket 메시지 확인:
  ```javascript
  // Network 탭 → WS 필터 → carfin-ai-production 클릭 → Messages 탭
  ```

---

## 🎬 Act 5: TCO 혁신 (1분)

### 테스트 항목
- [ ] 1위 차량 카드에서 **"TCO 비교 차트"** 섹션 찾기
- [ ] TCO 차트 자동 펼쳐짐 또는 클릭으로 펼치기
- [ ] **Stacked Bar Chart** 표시 확인:
  - [ ] 1위 차량 바 (가장 짧음)
  - [ ] 2위 차량 바
  - [ ] 3위 차량 바
  - [ ] 5가지 색상 구분:
    - [ ] 취득세 (빨강)
    - [ ] 자동차세 (주황)
    - [ ] 정비비 (노랑)
    - [ ] 감가상각 (초록)
    - [ ] 연료비 (파랑)
- [ ] **핵심 인사이트 박스** 표시:
  - [ ] "1위가 2위보다 X만원 더 저렴합니다"
  - [ ] "주요 이유: 감가상각이 Y만원 낮기 때문"
- [ ] 법적 근거 툴팁 호버 (지방세법 제11조, 제127조 등)

**체크 포인트**:
- TCO 값이 0원이거나 NaN이 아닌지 확인
- 프로필의 `annualKm`, `ownershipYears` 반영 확인

---

## 🎬 Act 5.5: 🔥 AWS RDS 실구매 데이터 검증 (1분) ← **최대 임팩트**

### 테스트 항목
- [ ] 1위 차량 카드에서 **"진단 보고서"** 버튼 찾기 (그라데이션 스타일)
- [ ] 버튼 클릭 → VehicleDiagnosticsModal 열림
- [ ] **"💡 실구매 데이터 검증 완료"** Alert 표시 확인
  - [ ] "아래 모든 정보는 겟차 실구매 데이터(AWS RDS)에서 실시간으로 조회한 실제 데이터입니다"

### 📊 종합 탭 확인
- [ ] 차량 기본 정보:
  - [ ] 제조사, 모델, 연식
  - [ ] 가격, 주행거리, 연료타입, 지역
- [ ] 보험 이력 요약:
  - [ ] 사고 횟수, 금액
  - [ ] 소유권 변경 횟수
- [ ] 점검 이력 요약:
  - [ ] 엔진/변속기 상태
  - [ ] 최근 점검일

### 🛡️ 보험 이력 탭 확인 ← **아하 모먼트 1**
- [ ] 탭 클릭 → 보험 데이터 표시
- [ ] "insurance_history 테이블에서 실시간 조회" 메시지
- [ ] 사고 이력:
  - [ ] 내차 피해: X회, X만원
  - [ ] 상대차 피해: X회, X만원
  - [ ] 총 사고 횟수
- [ ] 특수 용도 플래그:
  - [ ] 영업용 (business): ❌ 또는 ✅
  - [ ] 렌트 (rental): ❌ 또는 ✅
  - [ ] 대출 (loan): ❌ 또는 ✅
- [ ] 소유권 변경 (owner_change_cnt): X회
- [ ] 차량 번호 변경 (car_no_change_cnt): X회

**예상 결과**:
- 사고 0회 + 특수용도 없음 → "신뢰도 높은 차량" 뱃지
- 사고 있음 → 경고 메시지 + 구체적 금액 표시

### 🔧 점검 이력 탭 확인 ← **아하 모먼트 2**
- [ ] 탭 클릭 → 점검 데이터 표시
- [ ] "inspections 테이블에서 실시간 조회" 메시지
- [ ] 최근 점검 정보:
  - [ ] 점검일 (inspected_at): YYYY-MM-DD
  - [ ] 점검 시 주행거리 (mileage_at_inspect): X만km
- [ ] 핵심 체크 항목:
  - [ ] ✅ 엔진 상태 (engine_check_ok): 양호/불량
  - [ ] ✅ 변속기 상태 (trans_check_ok): 양호/불량
  - [ ] ❌ 침수 이력 (waterlog): 없음/있음
  - [ ] ❌ 화재 이력 (fire_history): 없음/있음
  - [ ] 사고 이력 (accident_history): 자가/상대/없음
- [ ] 보증 타입 (guaranty_type): 보증수리/자가수리/기타

**예상 결과**:
- 엔진/변속기 양호 + 침수/화재 없음 → "기계적 신뢰성 확보" 뱃지

### ⚙️ 옵션 탭 확인 ← **아하 모먼트 3**
- [ ] 탭 클릭 → 옵션 리스트 표시
- [ ] "option_masters 테이블 JOIN으로 실시간 조회" 메시지
- [ ] 옵션 개수 표시: "⚙️ 옵션 (X개)"
- [ ] 실제 장착 옵션 리스트:
  - [ ] 스마트키
  - [ ] 후방 카메라
  - [ ] 블루투스
  - [ ] 열선시트
  - [ ] 내비게이션
  - [ ] 크루즈 컨트롤
  - [ ] ... (20-30개)

**예상 결과**:
- 옵션 많음 → "고급 옵션 다수" 강조
- 광고에 없던 옵션 발견 시 → "숨은 옵션 확인" 메시지

### 에러 체크
- [ ] 차량 ID가 없을 때: "차량을 찾을 수 없습니다" 메시지
- [ ] 보험 데이터 없을 때: "보험 이력 정보가 없습니다"
- [ ] 점검 데이터 없을 때: "점검 이력 정보가 없습니다"
- [ ] 옵션 없을 때: "장착 옵션 정보가 없습니다"

**체크 포인트**:
- Network 탭에서 API 호출 확인:
  ```
  GET /api/vehicles/:id/full-details
  Status: 200 OK
  Response: { vehicle, insurance, inspection, options }
  ```

---

## 🎬 Act 6: 재추천 (1-2분)

### 테스트 항목 1: 모델 재추천
- [ ] 채팅 입력창에 메시지 입력:
  ```
  셀토스로 다시 추천해줘
  ```
- [ ] 콘솔에서 KeywordMatcher 로그 확인:
  ```
  🚗 [키워드] 모델 감지: "셀토스"
  🔄 [재추천] 모드 활성화
  ```
- [ ] 새로운 검색 진행 (MACRec 프로세스 반복)
- [ ] 새로운 Top 3 차량 표시:
  - [ ] 모든 차량이 "셀토스" 모델
  - [ ] 기존 조건 유지 (3000만원 이하, 가족용, SUV)
  - [ ] TCO 재계산 완료

### 테스트 항목 2: 예산 재추천
- [ ] 채팅 입력창에 메시지 입력:
  ```
  2500만원 이하로 낮춰줘
  ```
- [ ] 콘솔에서 KeywordMatcher 로그 확인:
  ```
  💰 [키워드] 예산 감지: 최대 2500만원
  🔄 [재추천] 모드 활성화
  ```
- [ ] 새로운 검색 진행
- [ ] 새로운 Top 3 차량 표시:
  - [ ] 모든 차량 가격 ≤ 2500만원
  - [ ] 기존 조건 유지

### 테스트 항목 3: 지역 재추천
- [ ] 채팅 입력창에 메시지 입력:
  ```
  경기 지역으로 바꿔줘
  ```
- [ ] 콘솔에서 KeywordMatcher 로그 확인:
  ```
  📍 [키워드] 지역 감지: "경기"
  🔄 [재추천] 모드 활성화
  ```
- [ ] 새로운 검색 진행
- [ ] 새로운 Top 3 차량 표시:
  - [ ] 모든 차량 지역: 경기

**체크 포인트**:
- 재추천 시 이전 프로필 데이터 유지 확인
- TCO 재계산 정상 확인

---

## 🚨 예상 이슈 및 대응

### Issue 1: WebSocket 연결 실패
**증상**: "연결 끊김" 표시, 메시지 전송 안 됨
**대응**:
1. F5로 페이지 새로고침
2. 백엔드 서버 재시작:
   ```bash
   npm run dev
   ```
3. 콘솔에서 에러 확인:
   ```
   Error: WebSocket connection failed
   ```

### Issue 2: 추천 결과 0대
**증상**: "검색 완료" 메시지 후 차량 0대
**대응**:
1. 콘솔 로그 확인:
   ```
   🔍 [DemoPool] 필터 후 차량 수: 0대
   ```
2. 다른 메시지로 재시도:
   ```
   2500만원 이하 SUV 찾아요
   ```
3. 프로필 재설정 (LocalStorage 초기화)

### Issue 3: AWS RDS 데이터 없음
**증상**: 진단 보고서 모달에서 "정보가 없습니다" 메시지
**대응**:
1. 백엔드 콘솔 확인:
   ```
   Error: No insurance data found for vehicle_id: X
   ```
2. 다른 차량으로 테스트:
   - 2위 또는 3위 차량의 진단 보고서 클릭
3. PostgreSQL 연결 확인:
   ```bash
   # 백엔드 서버 로그에서 확인
   ✅ PostgreSQL Connected
   ```

### Issue 4: TCO 차트 표시 안 됨
**증상**: 차량 카드는 보이는데 TCO 섹션 없음
**대응**:
1. 프로필에 `annualKm`, `ownershipYears` 있는지 확인:
   ```javascript
   const profile = JSON.parse(localStorage.getItem('carfin_user_profile'));
   console.log(profile.annualKm, profile.ownershipYears);
   ```
2. 없으면 프로필 재설정 (시나리오 A 다시 로드)

---

## 📊 성공 기준

### 필수 항목 (Must Pass)
- [ ] WebSocket 정상 연결
- [ ] 초기 추천 3대 이상
- [ ] TCO 차트 정상 렌더링
- [ ] **AWS RDS 진단 보고서 모달 정상 작동** ← 핵심!
- [ ] 재추천 1회 성공

### 보너스 항목 (Nice to Have)
- [ ] 재추천 3회 연속 성공
- [ ] AgentCollaborationViewer 실시간 로그
- [ ] 응답 시간 30초 이내
- [ ] PaperBasedWorkflow 전체 펼치기

---

## ✅ 최종 체크

### 테스트 완료 후
- [ ] 모든 필수 항목 통과
- [ ] 스크린샷 5장 저장:
  1. 랜딩 페이지 (Papers 섹션)
  2. 프로필 설정 (시나리오 A)
  3. 추천 결과 (Top 3 차량 카드)
  4. TCO 비교 차트
  5. **AWS RDS 진단 보고서 모달** (보험 이력 탭)
- [ ] 시연 영상 녹화 (선택)

### 시연 준비 완료
- [ ] DEMO_SCRIPT.md 숙지
- [ ] 예상 질문 답변 준비
- [ ] 백업 플랜 준비 (로컬 환경)

---

**테스트 완료 시간**: ______
**테스트 결과**: ✅ Pass / ❌ Fail
**비고**: _____________________________________________

---

**최종 수정일**: 2025-10-14
**작성자**: CARFIN AI Development Team
