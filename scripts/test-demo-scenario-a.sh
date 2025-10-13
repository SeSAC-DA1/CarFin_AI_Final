#!/bin/bash

# 🧪 시나리오 A 테스트 스크립트
# Railway 프로덕션 환경에서 시나리오 A 실행 후 로그 분석

echo "🧪 시연 시나리오 A 테스트 시작"
echo "================================"
echo ""

# Railway 프로덕션 URL
RAILWAY_URL="https://carfinaifinal-production-15a8.up.railway.app"

echo "📍 테스트 대상: $RAILWAY_URL"
echo ""

# 시나리오 A 스크립트
SCENARIO_A="3000만원 이하 가솔린 국내차 SUV 찾습니다. 5인 가족이고 안전성이 가장 중요해요. 연식은 5년 이내로 주행거리 10만km 이내 무사고 차량으로 추천해 주세요."

echo "📝 시나리오 A:"
echo "$SCENARIO_A"
echo ""

echo "⏳ Railway 로그를 확인하세요:"
echo "1. Railway Dashboard → carfinaifinal-production-15a8 → Logs"
echo "2. 검색 키워드: [DemoPool]"
echo ""

echo "🔍 확인 사항:"
echo "✓ [DemoPool] 시나리오 A 감지"
echo "✓ [DemoPool] 1차 필터링 완료: X대 → Y대"
echo "✓ [DemoPool] 상위 5개 모델 확인"
echo ""

echo "🚨 예외 사항 체크:"
echo "□ 승합차/경차/소형차 나왔는지?"
echo "□ 더미 가격 (999, 7777) 나왔는지?"
echo "□ 외제차 (BMW, 벤츠) 나왔는지?"
echo "□ 생소한 브랜드 (쌍용, 르노) 나왔는지?"
echo "□ 인기 모델 (싼타페, 쏘렌토, 팰리세이드, 카니발) 나왔는지?"
echo ""

echo "📊 예상 결과:"
echo "✅ 싼타페, 쏘렌토, 팰리세이드, 카니발 Top 3"
echo "✅ 모두 3000만원 이하, 2020년 이후, 10만km 이하"
echo "✅ 현대 또는 기아 브랜드만"
echo ""

echo "🎯 다음 단계:"
echo "1. 프론트엔드에서 시나리오 A 실행"
echo "2. Railway 로그 실시간 확인"
echo "3. 추천된 차량 3대 확인"
echo "4. 각 차량 링크 클릭 테스트"
echo ""
