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