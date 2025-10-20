#!/bin/bash

# Railway 환경 변수 설정 스크립트
# 사용법: Railway Dashboard → Variables → Raw Editor에 붙여넣기

cat << 'EOF'
# 🚀 Railway Production Environment Variables

# Node Configuration
NODE_ENV=production
PORT=5000

# Database (AWS RDS)
DATABASE_URL=postgresql://carfin_admin:carfin_secure_password_2025@carfin-db.cbkayiqs4div.ap-northeast-2.rds.amazonaws.com:5432/carfin

# AI Configuration
GOOGLE_API_KEY=AIzaSyArwWj3_TDhSuCVXYoDzVGM2MW26-5UqbU
GEMINI_API_KEY=AIzaSyArwWj3_TDhSuCVXYoDzVGM2MW26-5UqbU

# Session
SESSION_SECRET=railway_production_secret_2025_carfin_ai

# Redis (Optional - Railway Redis 추가 시)
# RAILWAY_REDIS_URL=redis://default:password@host:6379

# CORS
CORS_ORIGIN=https://carfin-ai.vercel.app
EOF
