import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertVehicleSchema } from "@shared/schema";
import { rankVehiclesWithTOPSIS, DEFAULT_USER_PROFILE } from "./lib/topsis/VehicleTOPSISAdapter";
import type { UserPreferenceProfile } from "./lib/topsis/TOPSISEngine";
import { MultiAgentCollaborator, RuleBasedAgentAnalyzer, type UserQuery } from "./lib/collaboration/MultiAgentCollaborator";
import { setupChatWebSocket } from "./websocket/ChatWebSocketHandler";
import { randomUUID } from "crypto";

// 📚 실제 논문 3개 기반 시스템 Import
import { generatePaperBasedRecommendations, type PaperBasedRecommendationRequest } from "./lib/integration/PaperBasedRecommendationEngine";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/vehicles/search", async (req, res) => {
    try {
      const filters = {
        minPrice: req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        minYear: req.query.minYear ? parseInt(req.query.minYear as string) : undefined,
        maxYear: req.query.maxYear ? parseInt(req.query.maxYear as string) : undefined,
        fuel: req.query.fuel as string | undefined,
        category: req.query.category as string | undefined,
        brand: req.query.brand as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const vehicles = await storage.searchVehicles(filters);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to search vehicles" });
    }
  });

  app.get("/api/vehicles/count", async (req, res) => {
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
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to get vehicle" });
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

      const searchFilters = {
        minPrice: filters?.minPrice,
        maxPrice: filters?.maxPrice,
        year: filters?.year,
        minYear: filters?.minYear,
        maxYear: filters?.maxYear,
        fuel: filters?.fuel,
        category: filters?.category,
        brand: filters?.brand,
        limit: 50,
        offset: 0,
      };

      const vehicles = await storage.searchVehicles(searchFilters);

      if (vehicles.length === 0) {
        return res.json({ ranking: [], message: "검색 조건에 맞는 차량이 없습니다." });
      }

      const profile: UserPreferenceProfile = userProfile || DEFAULT_USER_PROFILE;

      const topsisResult = await rankVehiclesWithTOPSIS(vehicles, profile);

      res.json({
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
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  app.post("/api/vehicles/collaborate", async (req, res) => {
    try {
      const userQuery: UserQuery = req.body;

      const searchFilters = {
        minPrice: userQuery.budget?.min,
        maxPrice: userQuery.budget?.max,
        fuel: userQuery.preferences?.fuel,
        category: userQuery.preferences?.category,
        brand: userQuery.preferences?.brand,
        limit: 30,
        offset: 0,
      };

      const vehicles = await storage.searchVehicles(searchFilters);

      if (vehicles.length === 0) {
        return res.json({
          success: false,
          message: "검색 조건에 맞는 차량이 없습니다.",
          agentAnalyses: []
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

      res.json({
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
      res.status(500).json({ error: "Failed to collaborate" });
    }
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📚 실제 논문 3개 기반 통합 추천 시스템
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  app.post("/api/vehicles/paper-based-recommendation", async (req, res) => {
    try {
      console.log('🎓 논문 기반 추천 API 호출');

      const request: PaperBasedRecommendationRequest = {
        user_message: req.body.message || '',
        session_id: req.body.sessionId,
        feedback: req.body.feedback
      };

      if (!request.user_message) {
        return res.status(400).json({
          error: "사용자 메시지가 필요합니다"
        });
      }

      // 기존 에이전트들 초기화
      const analyzer = new RuleBasedAgentAnalyzer();
      const collaborator = new MultiAgentCollaborator();

      // 전체 차량 데이터 가져오기
      const allVehicles = await storage.searchVehicles({
        limit: 1000,
        offset: 0
      });

      console.log(`📊 전체 차량 데이터: ${allVehicles.length}개`);

      // 📚 논문 3개 기반 통합 추천 실행
      const result = await generatePaperBasedRecommendations(
        request,
        analyzer,              // needsAnalyst 역할
        analyzer,              // dataAnalyst 역할
        collaborator,          // concierge 역할
        allVehicles
      );

      console.log('✅ 논문 기반 추천 완료');
      console.log(`⏱️  총 처리 시간: ${result.system_info.total_processing_time}ms`);
      console.log(`🎯 신뢰도: ${result.system_info.recommendation_confidence}%`);

      res.json({
        success: true,
        ...result,
        message: "실제 논문 3개 기반 추천이 완료되었습니다",
        papers_applied: result.system_info.papers_applied
      });

    } catch (error) {
      console.error('📚 논문 기반 추천 에러:', error);
      res.status(500).json({
        error: "논문 기반 추천 중 오류가 발생했습니다",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📈 AHP-TOPSIS 차량 상세 분석 API
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  app.get("/api/vehicles/:id/topsis-analysis", async (req, res) => {
    try {
      console.log('📈 AHP-TOPSIS 분석 API 호출');

      const vehicleId = parseInt(req.params.id);
      const vehicle = await storage.getVehicleById(vehicleId);

      if (!vehicle) {
        return res.status(404).json({ error: "차량을 찾을 수 없습니다" });
      }

      // Peer Group을 위한 전체 차량 데이터
      const allVehicles = await storage.searchVehicles({
        limit: 500,
        offset: 0
      });

      // AHP-TOPSIS 분석 실행
      const { AHP_TOPSIS_Engine } = await import("./lib/evaluation/AHP_TOPSIS_Dashboard");
      const topsisEngine = new AHP_TOPSIS_Engine();

      const dashboard = await topsisEngine.generateVehicleInsightDashboard(
        vehicle,
        allVehicles
      );

      console.log(`✅ TOPSIS 분석 완료: ${vehicle.brand} ${vehicle.model} - 점수 ${dashboard.overview.topsis_result.overall_score}점`);

      res.json({
        success: true,
        vehicle_info: {
          id: vehicle.vehicleId,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          price: vehicle.price
        },
        topsis_dashboard: dashboard,
        analysis_metadata: {
          peer_group_size: dashboard.peer_comparison.peer_group_size,
          analysis_date: new Date().toISOString(),
          papers_applied: [
            "AHP-TOPSIS for Vehicle Selection (Multiple Studies 2018-2024)",
            "Combining the AHP and TOPSIS to evaluate car selection (ACM 2018)",
            "Second-hand Vehicle Evaluation System (Atlantis Press 2024)"
          ]
        }
      });

    } catch (error) {
      console.error('📈 TOPSIS 분석 에러:', error);
      res.status(500).json({
        error: "TOPSIS 분석 중 오류가 발생했습니다",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);

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

  return httpServer;
}
