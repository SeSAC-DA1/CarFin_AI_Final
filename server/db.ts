import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import { Pool as PgPool } from 'pg';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import fs from 'fs';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isAwsRds = process.env.DB_TYPE === 'aws-rds' || process.env.DATABASE_URL.includes('rds.amazonaws.com');

let pool: PgPool;
let db: any;

if (isAwsRds) {
  const sslConfig = process.env.DB_SSL === 'true' 
    ? {
        rejectUnauthorized: true,
        ca: process.env.DB_CA_CERT ? fs.readFileSync(process.env.DB_CA_CERT, 'utf8') : undefined,
      }
    : undefined;

  pool = new PgPool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig || { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  db = drizzlePg(pool, { schema });
  console.log('✅ AWS RDS PostgreSQL 연결 완료 (TLS 검증: ' + (sslConfig ? 'ON' : 'OFF') + ')');
} else {
  // 일반 PostgreSQL 연결 (Neon이 아닌 경우 pg 사용)
  pool = new PgPool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  db = drizzlePg(pool, { schema });
  console.log('✅ PostgreSQL 연결 완료 (SSL 활성화)');
}

export { pool, db };