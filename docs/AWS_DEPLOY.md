# AWS 실시간 서비스 배포 가이드

CarFin AI를 AWS RDS PostgreSQL + ElastiCache Valkey로 배포하는 완전한 가이드입니다.

## 📋 목차

1. [AWS 서비스 설정](#1-aws-서비스-설정)
2. [데이터베이스 마이그레이션](#2-데이터베이스-마이그레이션)
3. [애플리케이션 배포](#3-애플리케이션-배포)
4. [환경변수 설정](#4-환경변수-설정)
5. [배포 체크리스트](#5-배포-체크리스트)

---

## 1. AWS 서비스 설정

### 1-1. AWS RDS PostgreSQL 생성

#### AWS 콘솔에서 설정

1. **RDS 대시보드** 이동
2. **데이터베이스 생성** 클릭
3. 설정 값:
   ```
   엔진: PostgreSQL 16
   템플릿: 프로덕션 (또는 개발/테스트)
   DB 인스턴스 식별자: carfin-db
   마스터 사용자 이름: postgres
   마스터 암호: [강력한 비밀번호]
   인스턴스 클래스: db.t3.micro (개발) / db.t3.small (프로덕션)
   스토리지: 20GB (자동 조정 활성화)
   퍼블릭 액세스: 예 (개발) / 아니오 (프로덕션 - VPC 피어링 필요)
   ```

4. **보안 그룹 인바운드 규칙 추가**
   ```
   유형: PostgreSQL
   포트: 5432
   소스: 내 IP (개발) / 애플리케이션 보안 그룹 (프로덕션)
   ```

5. **엔드포인트 복사**
   ```
   예: carfin-db.abc123.us-east-1.rds.amazonaws.com
   ```

### 1-2. ElastiCache Valkey 생성

#### AWS 콘솔에서 설정

1. **ElastiCache 대시보드** 이동
2. **캐시 생성** 클릭
3. 설정 값:
   ```
   엔진: Valkey (또는 Redis OSS)
   클러스터 모드: 비활성화 (단순 설정)
   이름: carfin-cache
   노드 유형: cache.t3.micro (개발) / cache.t3.small (프로덕션)
   복제본 수: 0 (개발) / 1-2 (프로덕션)
   서브넷 그룹: RDS와 동일한 VPC
   ```

4. **보안 그룹 인바운드 규칙 추가**
   ```
   유형: Custom TCP
   포트: 6379
   소스: 애플리케이션 보안 그룹
   ```

5. **기본 엔드포인트 복사**
   ```
   예: carfin-cache.abc123.cache.amazonaws.com:6379
   ```

### 1-3. TLS 인증서 다운로드 (보안 필수)

#### AWS RDS CA 인증서

```bash
# RDS CA 번들 다운로드
wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem -O rds-combined-ca-bundle.pem

# 인증서 확인
openssl x509 -in rds-combined-ca-bundle.pem -text -noout
```

#### ElastiCache Valkey CA 인증서

ElastiCache는 AWS의 자체 서명 인증서를 사용합니다. TLS가 활성화된 경우:

```bash
# ElastiCache는 AWS Trust Store 사용
# 대부분의 경우 시스템 CA 번들로 충분
export ELASTICACHE_CA_CERT=/etc/ssl/certs/ca-certificates.crt  # Ubuntu/Debian
# 또는
export ELASTICACHE_CA_CERT=/etc/pki/tls/certs/ca-bundle.crt  # RedHat/CentOS
```

### 1-4. EC2 인스턴스 생성 (옵션 1: EC2 배포)

1. **EC2 대시보드** → **인스턴스 시작**
2. 설정:
   ```
   AMI: Ubuntu 22.04 LTS
   인스턴스 유형: t3.micro (개발) / t3.small (프로덕션)
   키 페어: 새로 생성 또는 기존 선택
   보안 그룹:
     - SSH (22): 내 IP
     - HTTP (80): 0.0.0.0/0
     - HTTPS (443): 0.0.0.0/0
     - Custom (3000): 0.0.0.0/0 (개발만)
   ```

3. **탄력적 IP 할당** (선택사항)

---

## 2. 데이터베이스 마이그레이션

### 방법 1: 자동 마이그레이션 스크립트 (추천)

```bash
# 환경변수 설정
export DATABASE_URL="postgresql://source_user:password@source_host:5432/source_db"
export AWS_RDS_URL="postgresql://postgres:password@carfin-db.abc123.us-east-1.rds.amazonaws.com:5432/carfin_db"

# 마이그레이션 실행
npx tsx scripts/export-to-rds.ts
```

**출력:**
```
🔄 Neon → AWS RDS 마이그레이션 시작...
🔒 TLS 검증: ON

1️⃣  Neon에서 차량 데이터 추출 중...
   ✓ 500개 차량 추출 완료

2️⃣  AWS RDS에 스키마 확인 중...
   ✓ 스키마 준비 완료

3️⃣  기존 데이터 확인 중...
   ✓ 빈 테이블 확인

4️⃣  마이그레이션 준비 완료

5️⃣  AWS RDS에 데이터 삽입 중 (Parameterized Queries)...
   ✓ 100개 삽입 완료...
   ✓ 200개 삽입 완료...
   ...
   ✓ 500개 차량 삽입 완료

✅ 마이그레이션 완료!
   AWS RDS 차량 개수: 500개
```

### 방법 2: 수동 pg_dump 방법 (선택사항 - 백업용)

백업이 필요한 경우 수동으로 pg_dump를 사용할 수 있습니다:

```bash
# 1. 소스 DB에서 덤프 생성
pg_dump -h source-host \
  -U source-user \
  -Fc \
  -b \
  -v \
  -f carfin_backup.dump \
  source_database

# 2. AWS RDS에 복원
pg_restore -h carfin-db.abc123.us-east-1.rds.amazonaws.com \
  -U postgres \
  -d carfin_db \
  -j 4 \
  --no-owner \
  --no-privileges \
  --verbose \
  carfin_backup.dump
```

**참고**: 자동 마이그레이션 스크립트 (`scripts/export-to-rds.ts`)는 Parameterized Queries만 사용하며, SQL 덤프 파일을 생성하지 않습니다.

---

## 3. 애플리케이션 배포

### 옵션 1: EC2 배포

#### 3-1. EC2 인스턴스 접속

```bash
ssh -i "your-key.pem" ubuntu@ec2-xx-xx-xx-xx.compute.amazonaws.com
```

#### 3-2. 환경 설정

```bash
# Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git 설치
sudo apt-get install -y git

# PM2 설치 (프로세스 관리)
sudo npm install -g pm2
```

#### 3-3. 애플리케이션 배포

```bash
# 저장소 클론
git clone https://github.com/your-repo/carfin-ai.git
cd carfin-ai

# 의존성 설치
npm install

# 환경변수 설정
cp .env.aws.example .env
nano .env  # 실제 값으로 수정

# 프로덕션 빌드
npm run build

# PM2로 실행
pm2 start dist/index.js --name carfin-ai
pm2 save
pm2 startup
```

#### 3-4. Nginx 리버스 프록시 설정 (선택사항)

```bash
sudo apt-get install -y nginx

# Nginx 설정
sudo nano /etc/nginx/sites-available/carfin-ai
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Nginx 활성화
sudo ln -s /etc/nginx/sites-available/carfin-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 옵션 2: AWS Elastic Beanstalk 배포

#### 2-1. EB CLI 설치

```bash
pip install awsebcli --upgrade --user
```

#### 2-2. 애플리케이션 초기화

```bash
eb init -p node.js-20 carfin-ai --region us-east-1
```

#### 2-3. 환경 생성 및 배포

```bash
eb create carfin-prod

# 환경변수 설정
eb setenv \
  DATABASE_URL="postgresql://..." \
  DB_TYPE=aws-rds \
  DB_SSL=true \
  ELASTICACHE_ENDPOINT="..." \
  ELASTICACHE_TLS=true \
  GEMINI_API_KEY="..." \
  SESSION_SECRET="..." \
  NODE_ENV=production

# 배포
eb deploy
```

### 옵션 3: AWS ECS (Docker) 배포

#### 3-1. Dockerfile 생성

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

#### 3-2. ECR에 이미지 푸시

```bash
# ECR 로그인
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# 이미지 빌드 및 푸시
docker build -t carfin-ai .
docker tag carfin-ai:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/carfin-ai:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/carfin-ai:latest
```

#### 3-3. ECS 작업 정의 및 서비스 생성

AWS 콘솔에서 ECS 작업 정의 및 서비스 생성 (환경변수 설정 포함)

---

## 4. 환경변수 설정

### `.env` 파일 설정 (EC2, Docker)

`.env.aws.example`을 참고하여 `.env` 파일 생성:

```bash
# AWS RDS PostgreSQL
DATABASE_URL=postgresql://postgres:password@carfin-db.abc123.us-east-1.rds.amazonaws.com:5432/carfin_db
DB_TYPE=aws-rds
DB_SSL=true
DB_CA_CERT=/path/to/rds-combined-ca-bundle.pem

# ElastiCache Valkey
ELASTICACHE_ENDPOINT=carfin-cache.abc123.cache.amazonaws.com:6379
ELASTICACHE_TLS=true
ELASTICACHE_CA_CERT=/etc/ssl/certs/ca-certificates.crt

# AI 및 보안
GEMINI_API_KEY=AIzaSyArwWj3_TDhSuCVXYoDzVGM2MW26-5UqbU
SESSION_SECRET=your_random_session_secret_here

# 서버 설정
PORT=3000
NODE_ENV=production
```

### Elastic Beanstalk 환경변수

```bash
eb setenv \
  DATABASE_URL="postgresql://postgres:password@carfin-db.abc123.us-east-1.rds.amazonaws.com:5432/carfin_db" \
  DB_TYPE=aws-rds \
  DB_SSL=true \
  DB_CA_CERT="/var/app/current/rds-combined-ca-bundle.pem" \
  ELASTICACHE_ENDPOINT="carfin-cache.abc123.cache.amazonaws.com:6379" \
  ELASTICACHE_TLS=true \
  ELASTICACHE_CA_CERT="/etc/ssl/certs/ca-certificates.crt" \
  GEMINI_API_KEY="AIzaSyArwWj3_TDhSuCVXYoDzVGM2MW26-5UqbU" \
  SESSION_SECRET="your_random_secret" \
  NODE_ENV=production
```

---

## 5. 배포 체크리스트

### AWS 서비스 설정
- [ ] AWS RDS PostgreSQL 인스턴스 생성 완료
- [ ] ElastiCache Valkey 클러스터 생성 완료
- [ ] 보안 그룹 규칙 설정 (포트 5432, 6379)
- [ ] RDS 퍼블릭 액세스 설정 (개발) 또는 VPC 피어링 (프로덕션)

### 데이터베이스 마이그레이션
- [ ] `scripts/export-to-rds.ts` 실행 완료 (Parameterized Queries)
- [ ] 500개 차량 데이터 확인 (`SELECT COUNT(*) FROM vehicles`)
- [ ] TLS 검증 활성화 확인 ("🔒 TLS 검증: ON" 로그)

### 애플리케이션 배포
- [ ] 배포 플랫폼 선택 (EC2 / Elastic Beanstalk / ECS)
- [ ] 프로덕션 빌드 성공 (`npm run build`)
- [ ] 환경변수 설정 완료 (`.env` 또는 EB/ECS 환경변수)
- [ ] 애플리케이션 시작 성공 (`PORT 3000에서 서버 실행 중` 확인)

### 연결 테스트
- [ ] AWS RDS PostgreSQL 연결 확인 ("✅ AWS RDS PostgreSQL 연결 완료" 로그)
- [ ] ElastiCache Valkey 연결 확인 ("✅ ElastiCache Valkey 연결 완료" 로그)
- [ ] WebSocket 연결 테스트 (wss:// 프로토콜)
- [ ] AI 챗봇 기능 테스트 (3개 에이전트 협업)
- [ ] 차량 추천 기능 테스트 (TOPSIS 랭킹)

### 성능 최적화
- [ ] ElastiCache 캐싱 작동 확인 (응답 속도 60-100ms)
- [ ] RDS 연결 풀링 확인 (max: 20 connections)
- [ ] CloudWatch 모니터링 설정

### 보안
- [ ] 환경변수 암호화 (AWS Secrets Manager 권장)
- [ ] RDS 암호화 활성화 (저장 시)
- [ ] ElastiCache TLS 활성화 (전송 중)
- [ ] 보안 그룹 최소 권한 원칙 적용

---

## 📊 비용 예상 (월별)

### 개발 환경
- **RDS db.t3.micro**: ~$15/월
- **ElastiCache cache.t3.micro**: ~$12/월
- **EC2 t3.micro**: ~$8/월 (무료 티어 가능)
- **데이터 전송**: ~$5/월
- **합계**: ~$40/월

### 프로덕션 환경
- **RDS db.t3.small**: ~$30/월
- **ElastiCache cache.t3.small**: ~$25/월
- **EC2 t3.small (2개)**: ~$32/월
- **ALB**: ~$20/월
- **데이터 전송**: ~$20/월
- **합계**: ~$127/월

---

## 🔧 문제 해결

### RDS 연결 실패
```bash
# 보안 그룹 확인
aws ec2 describe-security-groups --group-ids sg-xxxxx

# 연결 테스트
psql -h carfin-db.abc123.us-east-1.rds.amazonaws.com -U postgres -d carfin_db
```

### ElastiCache 연결 실패
```bash
# Redis CLI로 테스트
redis-cli -h carfin-cache.abc123.cache.amazonaws.com -p 6379 --tls
```

### 애플리케이션 로그 확인
```bash
# EC2
pm2 logs carfin-ai

# Elastic Beanstalk
eb logs

# ECS
aws logs tail /ecs/carfin-ai --follow
```

---

## 📚 참고 자료

- [AWS RDS PostgreSQL 문서](https://docs.aws.amazon.com/rds/latest/userguide/)
- [AWS ElastiCache Valkey 문서](https://aws.amazon.com/elasticache/what-is-valkey/)
- [Node.js AWS 모범 사례](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/welcome.html)
- [Drizzle ORM 문서](https://orm.drizzle.team/docs/overview)

---

**배포 완료 후:**
- 실시간 AWS RDS PostgreSQL (500개 차량 데이터)
- ElastiCache Valkey 캐싱 (60-100ms 응답 속도)
- 3개 AI 에이전트 협업 (Gemini 2.5 Flash)
- TOPSIS 기반 차량 추천
- **Zero Mock Data** ✅
