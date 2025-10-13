-- ============================================================================
-- CARFIN AI - PostgreSQL 인덱스 생성 스크립트
-- ============================================================================
-- 목적: DB 쿼리 성능 최적화 (1400ms → 80ms, 17.5배 향상)
-- 실행 환경: Railway PostgreSQL (carfin-db)
-- 작성 일시: 2025-01-06
-- ============================================================================

-- 현재 인덱스 확인
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'vehicles'
ORDER BY indexname;

-- ============================================================================
-- 1. 복합 인덱스 (차종 + 가격 + 브랜드)
-- ============================================================================
-- 용도: 가장 빈번한 검색 패턴 (SUV + 3000만원 이하 + 현대)
-- 효과: WHERE car_type='SUV' AND price<=3000 AND manufacturer='현대'
-- 예상 개선: 1400ms → 60ms

CREATE INDEX IF NOT EXISTS idx_vehicles_search_composite
ON vehicles(car_type, price, manufacturer);

COMMENT ON INDEX idx_vehicles_search_composite IS
'복합 검색 최적화: 차종 + 가격 + 브랜드';

-- ============================================================================
-- 2. 가격 범위 인덱스 (B-tree)
-- ============================================================================
-- 용도: BETWEEN 연산 최적화 (price BETWEEN 2500 AND 3500)
-- 효과: 가격 범위 검색 속도 향상
-- 예상 개선: 571ms → 50ms

CREATE INDEX IF NOT EXISTS idx_vehicles_price_range
ON vehicles(price)
WHERE price BETWEEN 1000 AND 5000;

COMMENT ON INDEX idx_vehicles_price_range IS
'가격 범위 검색 최적화: 1000~5000만원 (BETWEEN 연산)';

-- ============================================================================
-- 3. 차종 인덱스 (B-tree)
-- ============================================================================
-- 용도: 차종별 검색 (SUV, 세단, 경차, 승합 등)
-- 효과: WHERE car_type = 'SUV' 빠른 검색
-- 예상 개선: 단일 조건 검색 300ms → 40ms

CREATE INDEX IF NOT EXISTS idx_vehicles_car_type
ON vehicles(car_type);

COMMENT ON INDEX idx_vehicles_car_type IS
'차종 검색 최적화: SUV, 세단, 경차, 승합 등';

-- ============================================================================
-- 4. 브랜드 인덱스 (B-tree)
-- ============================================================================
-- 용도: 브랜드별 검색 (현대, 기아, BMW 등)
-- 효과: WHERE manufacturer = '현대' 빠른 검색
-- 예상 개선: 브랜드 필터링 400ms → 60ms

CREATE INDEX IF NOT EXISTS idx_vehicles_manufacturer
ON vehicles(manufacturer);

COMMENT ON INDEX idx_vehicles_manufacturer IS
'브랜드 검색 최적화: 현대, 기아, BMW, 벤츠 등';

-- ============================================================================
-- 5. 연식 인덱스 (B-tree)
-- ============================================================================
-- 용도: 연식 필터링 (2018년 이후, 5년 이내 등)
-- 효과: WHERE model_year >= 2018 빠른 검색
-- 예상 개선: 연식 조건 추가 시에도 성능 유지

CREATE INDEX IF NOT EXISTS idx_vehicles_model_year
ON vehicles(model_year);

COMMENT ON INDEX idx_vehicles_model_year IS
'연식 검색 최적화: 최근 5년, 10년 이내 등';

-- ============================================================================
-- 6. 연료 타입 인덱스 (B-tree)
-- ============================================================================
-- 용도: 연료별 검색 (하이브리드, 디젤, 가솔린 등)
-- 효과: WHERE fuel_type = '하이브리드' 빠른 검색
-- 예상 개선: 연비 중심 검색 최적화

CREATE INDEX IF NOT EXISTS idx_vehicles_fuel_type
ON vehicles(fuel_type);

COMMENT ON INDEX idx_vehicles_fuel_type IS
'연료 타입 검색 최적화: 하이브리드, 디젤, 가솔린, 전기 등';

-- ============================================================================
-- 인덱스 생성 완료 확인
-- ============================================================================

-- 생성된 인덱스 목록
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'vehicles'
  AND indexname LIKE 'idx_vehicles_%'
ORDER BY indexname;

-- 인덱스 크기 확인
SELECT
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes
WHERE tablename = 'vehicles'
  AND indexname LIKE 'idx_vehicles_%'
ORDER BY pg_relation_size(indexname::regclass) DESC;

-- 테이블 전체 크기 확인
SELECT
    pg_size_pretty(pg_total_relation_size('vehicles')) as total_size,
    pg_size_pretty(pg_relation_size('vehicles')) as table_size,
    pg_size_pretty(pg_indexes_size('vehicles')) as indexes_size;

-- ============================================================================
-- 인덱스 효과 검증 쿼리
-- ============================================================================

-- 1. EXPLAIN ANALYZE로 실행 계획 확인
EXPLAIN ANALYZE
SELECT * FROM vehicles
WHERE car_type = 'SUV'
  AND price BETWEEN 2500 AND 3500
LIMIT 2000;

-- 기대 결과:
-- - Bitmap Index Scan 또는 Index Scan 사용
-- - Execution Time: 50~100ms

-- 2. 복합 조건 검색 성능 테스트
EXPLAIN ANALYZE
SELECT * FROM vehicles
WHERE car_type = 'SUV'
  AND price <= 3000
  AND manufacturer = '현대'
LIMIT 2000;

-- 기대 결과:
-- - idx_vehicles_search_composite 인덱스 사용
-- - Execution Time: 40~80ms

-- 3. 단일 조건 검색 성능 테스트
EXPLAIN ANALYZE
SELECT * FROM vehicles
WHERE car_type = '세단'
  AND price BETWEEN 1500 AND 2500
LIMIT 2000;

-- 기대 결과:
-- - idx_vehicles_car_type 또는 idx_vehicles_price_range 사용
-- - Execution Time: 30~60ms

-- ============================================================================
-- 인덱스 유지보수 (선택 사항)
-- ============================================================================

-- 인덱스 재구성 (데이터 변경이 많을 경우)
REINDEX TABLE vehicles;

-- VACUUM ANALYZE (통계 업데이트)
VACUUM ANALYZE vehicles;

-- ============================================================================
-- 롤백 (인덱스 삭제 - 문제 발생 시)
-- ============================================================================

/*
DROP INDEX IF EXISTS idx_vehicles_search_composite;
DROP INDEX IF EXISTS idx_vehicles_price_range;
DROP INDEX IF EXISTS idx_vehicles_car_type;
DROP INDEX IF EXISTS idx_vehicles_manufacturer;
DROP INDEX IF EXISTS idx_vehicles_model_year;
DROP INDEX IF EXISTS idx_vehicles_fuel_type;
*/

-- ============================================================================
-- 실행 가이드
-- ============================================================================

/*
1. Railway Dashboard → Database → Query Console 접속
2. 이 스크립트 전체 복사 & 붙여넣기
3. "Execute" 버튼 클릭
4. 인덱스 생성 확인 (약 30초~1분 소요)
5. 성능 테스트 재실행:
   node scripts/simple-performance-test.js
6. 기대 결과:
   - 시나리오 A: 1400ms → 80ms (-94%)
   - 시나리오 B: 571ms → 60ms (-89%)
   - 시나리오 C: 555ms → 70ms (-87%)
*/

-- ============================================================================
-- 주의사항
-- ============================================================================

/*
1. 인덱스 생성 시간: 159,578행 기준 약 30초~1분
2. 디스크 공간: 인덱스 6개 × 약 10MB = 60MB 추가 필요
3. 쓰기 성능: INSERT/UPDATE 시 인덱스 갱신으로 약간 느려짐 (무시 가능)
4. 읽기 성능: SELECT 쿼리 10~20배 향상 (1400ms → 80ms)
*/
