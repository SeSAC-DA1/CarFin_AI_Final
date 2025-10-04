#!/bin/bash
# Railway 데이터베이스 시드 스크립트

echo "🌱 Railway PostgreSQL 데이터베이스 시드 시작..."

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL 환경변수가 설정되지 않았습니다."
  exit 1
fi

echo "📊 500개 차량 데이터 삽입 중..."
psql "$DATABASE_URL" < railway_seed.sql

if [ $? -eq 0 ]; then
  echo "✅ 데이터베이스 시드 완료!"
  echo "🔍 차량 개수 확인..."
  psql "$DATABASE_URL" -c "SELECT COUNT(*) as total_vehicles FROM vehicles;"
else
  echo "❌ 데이터베이스 시드 실패"
  exit 1
fi
