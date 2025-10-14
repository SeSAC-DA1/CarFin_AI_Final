-- 1. 시나리오 A: 3000만원 이하 인기 SUV 현황
SELECT 
  brand,
  model,
  modelYear,
  price,
  distance,
  myAccidentCost,
  COUNT(*) OVER (PARTITION BY model) as model_count
FROM vehicles 
WHERE brand IN ('현대', '기아', '제네시스', '쉐보레')
AND price <= 3000
AND price >= 1500
AND modelYear >= 2020
AND distance <= 100000
AND (
  model LIKE '%싼타페%' OR model LIKE '%쏘렌토%' OR 
  model LIKE '%팰리세이드%' OR model LIKE '%카니발%' OR
  model LIKE '%스포티지%' OR model LIKE '%투싼%' OR
  model LIKE '%셀토스%' OR model LIKE '%코나%'
)
ORDER BY price ASC, distance ASC
LIMIT 20;

-- 2. 재추천용: 셀토스 전체 (사고 이력 포함)
SELECT 
  model,
  modelYear,
  price,
  distance,
  myAccidentCost,
  CASE 
    WHEN myAccidentCost = 0 OR myAccidentCost IS NULL THEN '무사고'
    WHEN myAccidentCost < 50 THEN '경미한 사고'
    ELSE '사고 이력'
  END as accident_status
FROM vehicles 
WHERE model LIKE '%셀토스%'
AND price <= 3000
AND modelYear >= 2020
ORDER BY 
  CASE WHEN myAccidentCost = 0 OR myAccidentCost IS NULL THEN 0 ELSE 1 END,
  modelYear DESC,
  distance ASC
LIMIT 10;
