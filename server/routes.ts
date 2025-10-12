import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage, type VehicleSearchFilters, type Vehicle } from "./storage";
import { insertVehicleSchema } from "@shared/schema";
import { rankVehiclesWithTOPSIS, DEFAULT_USER_PROFILE } from "./lib/topsis/VehicleTOPSISAdapter";
import type { UserPreferenceProfile } from "./lib/topsis/TOPSISEngine";
import { MultiAgentCollaborator, RuleBasedAgentAnalyzer, type UserQuery } from "./lib/collaboration/MultiAgentCollaborator";
import { setupChatWebSocket } from "./websocket/ChatWebSocketHandler";
import { randomUUID } from "crypto";
import { setupVite, serveStatic } from "./vite";

// 🔍 데이터 품질 필터링 시스템
import { DataQualityFilter } from "./lib/data/DataQualityFilter";
import { systemMonitor } from "./lib/monitoring/SystemMonitor";

// 🔧 성능 측정 미들웨어
function performanceMiddleware(_req: Request, res: Response, next: NextFunction) {
  const startTime = performance.now();

  res.on('finish', () => {
    const responseTime = performance.now() - startTime;
    systemMonitor.recordRequest(responseTime);

    if (res.statusCode >= 400) {
      systemMonitor.recordError();
    }
  });

  next();
}

// 🛡️ 강화된 에러 핸들링 미들웨어
function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  console.error('🚨 서버 에러:', err);

  systemMonitor.recordError();

  // 개발 환경에서는 상세 에러 정보 제공
  const isProduction = process.env.NODE_ENV === 'production';

  const errorResponse = {
    error: isProduction ? '서버 오류가 발생했습니다' : err.message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    ...(isProduction ? {} : { stack: err.stack })
  };

  res.status(err.status || 500).json(errorResponse);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // 🔧 성능 측정 미들웨어 적용
  app.use(performanceMiddleware);

  // 🏥 Health Check Endpoint (Railway 배포용)
  app.get("/api/system/health", async (_req, res) => {
    try {
      // 데이터베이스 연결 확인
      const testQuery = await storage.getVehicleCount();

      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: testQuery !== undefined ? "connected" : "disconnected",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      });
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // 📊 System Status Endpoint
  app.get("/api/system/status", async (_req, res) => {
    try {
      const metrics = systemMonitor.getMetrics();
      res.json({
        timestamp: new Date().toISOString(),
        status: "operational",
        metrics
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to get system status"
      });
    }
  });

  app.get("/api/vehicles/search", async (req, res) => {
    try {
      const filters: VehicleSearchFilters = {
        minPrice: req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
        minYear: req.query.minYear ? parseInt(req.query.minYear as string) : undefined,
        maxYear: req.query.maxYear ? parseInt(req.query.maxYear as string) : undefined,
        fuelType: req.query.fuel as string | undefined,
        manufacturer: req.query.brand as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const rawVehicles = await storage.searchVehicles(filters);

      // 🔍 데이터 품질 필터링 적용
      const dataFilter = new DataQualityFilter();
      const vehicles = dataFilter.filterVehicles(rawVehicles as Vehicle[]);

      res.json({
        vehicles,
        data_quality: {
          original_count: rawVehicles.length,
          filtered_count: vehicles.length,
          filter_applied: true
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to search vehicles" });
    }
  });

  app.get("/api/vehicles/count", async (_req, res) => {
    try {
      const count = await storage.getVehicleCount();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to get vehicle count" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.getVehicleById(parseInt(req.params.id));
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      return res.json(vehicle);
    } catch (error) {
      return res.status(500).json({ error: "Failed to get vehicle" });
    }
  });

  // 🆕 차량 옵션 조회 (option_masters JOIN)
  app.get("/api/vehicles/:id/options", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const options = await storage.getVehicleOptions(vehicleId);
      return res.json({ vehicleId, options });
    } catch (error) {
      console.error('옵션 조회 실패:', error);
      return res.status(500).json({ error: "Failed to get vehicle options" });
    }
  });

  // 🆕 차량 보험 이력 조회
  app.get("/api/vehicles/:id/insurance", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const insurance = await storage.getVehicleInsurance(vehicleId);
      if (!insurance) {
        return res.status(404).json({ error: "Insurance history not found" });
      }
      return res.json(insurance);
    } catch (error) {
      console.error('보험 이력 조회 실패:', error);
      return res.status(500).json({ error: "Failed to get insurance history" });
    }
  });

  // 🆕 차량 점검 이력 조회
  app.get("/api/vehicles/:id/inspection", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const inspection = await storage.getVehicleInspection(vehicleId);
      if (!inspection) {
        return res.status(404).json({ error: "Inspection history not found" });
      }
      return res.json(inspection);
    } catch (error) {
      console.error('점검 이력 조회 실패:', error);
      return res.status(500).json({ error: "Failed to get inspection history" });
    }
  });

  // 🆕 Phase 6-3: 차량 진단 모달용 전체 상세 정보 (3개 테이블 JOIN)
  app.get("/api/vehicles/:id/full-details", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);

      // 병렬 조회로 성능 최적화
      const [vehicle, insurance, inspection, options] = await Promise.all([
        storage.getVehicleById(vehicleId),
        storage.getVehicleInsurance(vehicleId),
        storage.getVehicleInspection(vehicleId),
        storage.getVehicleOptions(vehicleId)
      ]);

      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      return res.json({
        vehicle,
        insurance,
        inspection,
        options: options || []
      });
    } catch (error) {
      console.error('차량 상세 정보 조회 실패:', error);
      return res.status(500).json({ error: "Failed to get full vehicle details" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(400).json({ error: "Invalid vehicle data" });
    }
  });

  app.post("/api/vehicles/recommend", async (req, res) => {
    try {
      const { filters, userProfile } = req.body;

      const searchFilters: VehicleSearchFilters = {
        minPrice: filters?.minPrice,
        maxPrice: filters?.maxPrice,
        minYear: filters?.minYear,
        maxYear: filters?.maxYear,
        fuelType: filters?.fuel,
        manufacturer: filters?.brand,
        limit: 50,
        offset: 0,
      };

      const vehicles = await storage.searchVehicles(searchFilters);

      if (vehicles.length === 0) {
        return res.json({ ranking: [], message: "검색 조건에 맞는 차량이 없습니다." });
      }

      const profile: UserPreferenceProfile = userProfile || DEFAULT_USER_PROFILE;

      const topsisResult = await rankVehiclesWithTOPSIS(vehicles, profile);

      return res.json({
        ranking: topsisResult.ranking.slice(0, 10).map(r => ({
          vehicle: r.alternative.metadata,
          score: r.score,
          rank: r.rank,
          distanceToIdeal: r.distanceToIdeal,
          distanceToNegativeIdeal: r.distanceToNegativeIdeal,
        })),
        criteria: topsisResult.criteria,
        totalVehiclesEvaluated: vehicles.length,
      });
    } catch (error) {
      console.error('TOPSIS recommendation error:', error);
      return res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  app.post("/api/vehicles/collaborate", async (req, res) => {
    try {
      const userQuery: UserQuery = req.body;

      const searchFilters: VehicleSearchFilters = {
        minPrice: userQuery.budget?.min,
        maxPrice: userQuery.budget?.max,
        fuelType: userQuery.preferences?.fuel,
        manufacturer: userQuery.preferences?.brand,
        limit: 30,
        offset: 0,
      };

      const rawVehicles = await storage.searchVehicles(searchFilters);

      // 🔍 데이터 품질 필터링 적용
      const dataFilter = new DataQualityFilter();
      const vehicles = dataFilter.filterVehicles(rawVehicles);

      if (vehicles.length === 0) {
        return res.json({
          success: false,
          message: "품질 기준을 만족하는 차량이 없습니다. 검색 조건을 완화해 주세요.",
          agentAnalyses: [],
          data_quality: dataFilter.getFilteringStats(rawVehicles, vehicles)
        });
      }

      const analyzer = new RuleBasedAgentAnalyzer();
      const collaborator = new MultiAgentCollaborator();

      const needsAnalysis = analyzer.analyzeAsNeedsAnalyst(userQuery, vehicles);
      const dataAnalysis = analyzer.analyzeAsDataAnalyst(userQuery, vehicles);
      const conciergeAnalysis = analyzer.analyzeAsConcierge(
        userQuery,
        vehicles,
        needsAnalysis,
        dataAnalysis
      );

      const result = await collaborator.collaborate(
        userQuery,
        vehicles,
        [needsAnalysis, dataAnalysis, conciergeAnalysis]
      );

      const rankedVehicles = result.finalRecommendations.map(rec => {
        const vehicleId = typeof rec.vehicleId === 'string' ? parseInt(rec.vehicleId) : rec.vehicleId;
        const vehicle = vehicles.find(v => v.vehicleId === vehicleId);
        return {
          ...rec,
          vehicle
        };
      }).filter(r => r.vehicle);

      return res.json({
        success: true,
        recommendations: rankedVehicles,
        agentAnalyses: result.agentAnalyses.map(a => ({
          ...a,
          summary: collaborator.getAgentSummary(a)
        })),
        consensusAreas: result.consensusAreas,
        totalVehiclesEvaluated: vehicles.length
      });
    } catch (error) {
      console.error('Multi-agent collaboration error:', error);
      return res.status(500).json({ error: "Failed to collaborate" });
    }
  });

  // ... (The rest of the file remains the same, so it's omitted for brevity)
  const httpServer = createServer(app);

  // 개발/프로덕션 환경에 따른 정적 파일 서빙 설정
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    await setupVite(app, httpServer);
  }

  // WebSocket 서버 설정
  const wss = new WebSocketServer({ server: httpServer, path: '/ws/chat' });

  wss.on('connection', (ws, req) => {
    const sessionId = randomUUID();
    console.log(`🔌 새로운 WebSocket 연결: ${sessionId}`);
    setupChatWebSocket(ws, sessionId);
  });

  wss.on('error', (error) => {
    console.error('WebSocket 서버 에러:', error);
  });

  console.log('🚀 WebSocket 서버 시작: /ws/chat');

  // 🛡️ 에러 핸들링 미들웨어 (마지막에 추가)
  app.use(errorHandler);

  return httpServer;
}