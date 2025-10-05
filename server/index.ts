import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { railwayRedisService } from "./lib/cache/RailwayRedisService";
import { errorHandler, setupProcessErrorHandlers } from "./lib/middleware/ErrorHandler";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// 프로세스 레벨 에러 핸들러 설정
setupProcessErrorHandlers();

const app = express();

// 🌐 CORS 설정 (프론트엔드/백엔드 분리 배포용)
const allowedOrigins = [
  'http://localhost:3000',           // 로컬 개발
  'http://localhost:5173',           // Vite 개발 서버
  'https://vercel.app',              // Vercel 도메인
  'https://*.vercel.app',            // Vercel 서브도메인
  process.env.CORS_ORIGIN            // 배포 시 환경변수로 설정
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.some(allowed =>
    allowed === origin ||
    (allowed?.includes('*') && origin?.includes('vercel.app'))
  )) {
    res.setHeader('Access-Control-Allow-Origin', origin!);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // 🎯 Railway Redis 서비스 초기화 (성능 최적화)
  log("🔥 Initializing Railway Redis service...");
  try {
    await railwayRedisService.initialize();
    log("✅ Railway Redis service initialized successfully");
  } catch (error) {
    log("⚠️ Railway Redis initialization failed, running without cache:", String(error));
  }

  const server = await registerRoutes(app);

  // 향상된 에러 처리 미들웨어
  app.use(errorHandler.requestTimeout(30000)); // 30초 타임아웃
  app.use(errorHandler.handlePayloadTooLarge.bind(errorHandler));
  app.use(errorHandler.handleError.bind(errorHandler));
  app.use(errorHandler.handleNotFound.bind(errorHandler));

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

  server.listen(port, host, () => {
    log(`🚀 Server running on ${host}:${port}`);
  });
})();
