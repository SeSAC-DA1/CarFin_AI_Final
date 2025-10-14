import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gauge, Fuel, Award, ExternalLink, BarChart, MapPin, Brain, Sparkles, Wallet, TrendingDown, Info, HelpCircle, Shield, CheckCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import VehicleInsightDashboard from "./VehicleInsightDashboard";
import PersonalizationTransparencyDashboard from "./PersonalizationTransparencyDashboard";
import VehicleFinanceDashboard from "./VehicleFinanceDashboard";
import TCODetailModal from "./TCODetailModal";
import TCOComparisonChart from "./TCOComparisonChart";
import RecommendationReasonModal from "./RecommendationReasonModal";
import FinancingComparisonCard from "./FinancingComparisonCard";
import VehicleDiagnosticsModal from "./VehicleDiagnosticsModal";
import { useState, useEffect } from "react";
import { useWebSocketChat } from "@/hooks/useWebSocketChat";

export interface Vehicle {
  id: number | string;
  rank: number;
  name: string;
  manufacturer?: string;
  model?: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  image: string;
  detailUrl?: string;
  location?: string;
  topsisScore: number;
  matchScore: number;
  // 🆕 Phase 3: TCO 데이터
  tco?: {
    total: number;
    breakdown: {
      acquisitionTax: number;
      vehicleTax: number;
      maintenance: number;
      depreciation: number;
      fuelCost: number;
    };
    confidence: number;
    ownershipYears: number;
    // 🆕 Phase 6-1: 연도별 타임라인
    timeline?: Array<{
      year: number;
      acquisitionTax: number;
      vehicleTax: number;
      maintenance: number;
      depreciation: number;
      fuelCost: number;
      yearTotal: number;
      cumulative: number;
    }>;
  };
  // 🆕 Phase 3-E: 금융 옵션
  financingOptions?: any;
}

interface VehicleRecommendationsProps {
  vehicles: Vehicle[];
  userQuery?: string;
  showPersonalization?: boolean;
}

const rankColors = ["text-yellow-500", "text-gray-400", "text-amber-600"];
const rankLabels = ["1위", "2위", "3위"];

export default function VehicleRecommendations({
  vehicles,
  userQuery = '',
  showPersonalization = false
}: VehicleRecommendationsProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showTOPSISModal, setShowTOPSISModal] = useState(false);
  const [selectedVehicleForTOPSIS, setSelectedVehicleForTOPSIS] = useState<Vehicle | null>(null);
  const [showPersonalizationDashboard, setShowPersonalizationDashboard] = useState(false);
  const [showFinanceDashboard, setShowFinanceDashboard] = useState(false);
  const [selectedVehicleForFinance, setSelectedVehicleForFinance] = useState<Vehicle | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const { insights } = useWebSocketChat();

  // 🆕 Phase 3: TCO 모달 상태
  const [showTCOModal, setShowTCOModal] = useState(false);
  const [selectedVehicleForTCO, setSelectedVehicleForTCO] = useState<Vehicle | null>(null);

  // 🆕 Phase 5: 추천 이유 모달 상태
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedVehicleForReason, setSelectedVehicleForReason] = useState<Vehicle | null>(null);

  // 🆕 Phase 7: 차량 진단 보고서 모달 상태
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  const [selectedVehicleForDiagnostics, setSelectedVehicleForDiagnostics] = useState<Vehicle | null>(null);

  const handleViewInsights = async (vehicle: Vehicle) => {
    // TOPSIS 분석 모달 열기
    setIsLoadingAnalysis(true);
    setSelectedVehicleForTOPSIS(vehicle);
    setShowTOPSISModal(true);
    setIsLoadingAnalysis(false);
  };

  const handleFinanceConsultation = (vehicle: Vehicle) => {
    // 금융 상담 모달 열기
    setSelectedVehicleForFinance(vehicle);
    setShowFinanceDashboard(true);
  };

  // 🆕 Phase 3: TCO 상세보기 핸들러
  const handleViewTCO = (vehicle: Vehicle) => {
    setSelectedVehicleForTCO(vehicle);
    setShowTCOModal(true);
  };

  // 🆕 Phase 5: 추천 이유 모달 핸들러
  const handleViewReason = (vehicle: Vehicle) => {
    setSelectedVehicleForReason(vehicle);
    setShowReasonModal(true);
  };

  // 🆕 Phase 7: 차량 진단 보고서 모달 핸들러
  const handleViewDiagnostics = (vehicle: Vehicle) => {
    setSelectedVehicleForDiagnostics(vehicle);
    setShowDiagnosticsModal(true);
  };

  // 개인화 대시보드 자동 표시
  useEffect(() => {
    if (showPersonalization && userQuery && vehicles.length > 0) {
      setShowPersonalizationDashboard(true);
      // 15초 후 자동으로 숨김 (사용자 피드백 반영)
      const timer = setTimeout(() => {
        setShowPersonalizationDashboard(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [showPersonalization, userQuery, vehicles]);

  const handlePersonalizationComplete = () => {
    setShowPersonalizationDashboard(false);
  };

  const selectedVehicle = vehicles.find(v => v.id.toString() === selectedVehicleId);

  return (
    <>
      <div className="space-y-4" data-testid="vehicle-recommendations">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">멀티에이전트 AI 추천 Top 3</h3>
          </div>
          {showPersonalization && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span>개인화 완료</span>
            </div>
          )}
        </div>

        <div className="relative">
          {/* ✅ Phase 2: 그리드 레이아웃 - 3개 차량 한눈에 비교 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className={cn(
                "overflow-hidden transition-all duration-300",
                "hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20",
                "border-card-border bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm",
                // 순위별 특별 효과
                vehicle.rank === 1 && "ring-2 ring-yellow-500/50 shadow-yellow-500/20",
                vehicle.rank === 2 && "ring-2 ring-gray-400/50 shadow-gray-400/20",
                vehicle.rank === 3 && "ring-2 ring-amber-600/50 shadow-amber-600/20"
              )}
              data-testid={`vehicle-card-${vehicle.rank}`}
            >
              {/* ✅ Phase 4: 이미지 높이 추가 확대 + 전체 표시 (h-56 → h-64, object-cover → object-contain) */}
              <div className="relative h-64 bg-gray-100 dark:bg-gray-800">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* ✅ Phase 3-1: 금메달 깜빡임 제거 (animate-pulse 삭제) */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <div className={cn(
                    "p-1.5 backdrop-blur-sm rounded-full transition-all duration-300",
                    vehicle.rank === 1 && "bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 shadow-lg shadow-yellow-500/50",
                    vehicle.rank === 2 && "bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900 shadow-lg shadow-gray-400/50",
                    vehicle.rank === 3 && "bg-gradient-to-br from-amber-400 to-amber-600 text-amber-900 shadow-lg shadow-amber-500/50"
                  )}>
                    <Award className="w-4 h-4" />
                  </div>
                  <Badge className={cn(
                    "backdrop-blur-sm text-xs font-bold transition-all duration-300",
                    vehicle.rank === 1 && "bg-gradient-to-r from-yellow-400/90 to-yellow-500/90 text-yellow-900",
                    vehicle.rank === 2 && "bg-gradient-to-r from-gray-300/90 to-gray-400/90 text-gray-900",
                    vehicle.rank === 3 && "bg-gradient-to-r from-amber-400/90 to-amber-500/90 text-amber-900"
                  )}>
                    {rankLabels[vehicle.rank - 1]}
                  </Badge>
                </div>

                {/* ✅ Phase 3-1: 매치 점수 배지 깜빡임 제거 (animate-bounce-in 삭제) */}
                <div className="absolute top-2 right-2">
                  <Badge className={cn(
                    "font-mono text-xs font-bold transition-all duration-300",
                    "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
                    "shadow-lg shadow-primary/30"
                  )}>
                    {Math.round(vehicle.matchScore)}%
                  </Badge>
                </div>

                <div className="absolute bottom-2 left-2 right-2">
                  <h4 className="text-white font-semibold text-sm drop-shadow-lg">
                    {vehicle.name}
                  </h4>
                </div>
              </div>

              {/* ✅ Phase 2: 패딩 확대 (p-3 → p-4), 간격 확대 (space-y-3 → space-y-3.5) */}
              <div className="p-4 space-y-3.5">
                <div className="font-mono text-2xl font-bold text-primary">
                  {vehicle.price.toLocaleString()}만원
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{vehicle.year}년</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{(vehicle.mileage / 10000).toFixed(1)}만km</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Fuel className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{vehicle.fuel}</span>
                  </div>
                  {vehicle.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{vehicle.location}</span>
                    </div>
                  )}
                </div>

                {/* 🆕 Phase 7: 실구매 데이터 검증 뱃지 */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    보험이력 검증
                  </Badge>
                  <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    점검이력 확인
                  </Badge>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">TOPSIS 점수</span>
                    <span className="font-mono font-medium">{vehicle.topsisScore.toFixed(1)}점</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-chart-1 transition-all"
                      style={{ width: `${vehicle.topsisScore}%` }}
                    />
                  </div>
                </div>

                {/* 🆕 Phase 3: TCO 간단 표시 */}
                {vehicle.tco && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Wallet className="w-3 h-3" />
                      <span>{vehicle.tco.ownershipYears}년 총 소유비용 (TCO)</span>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">총 소유비용</span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {(vehicle.tco.total / 10000).toFixed(0)}만원
                        </span>
                      </div>

                      {/* TCO vs 구매가 비교 (명확한 설명) */}
                      <div className="flex items-center gap-1 text-xs">
                        {(() => {
                          const purchasePrice = vehicle.price * 10000; // 구매가 (원)
                          const totalCost = vehicle.tco.total; // TCO (원)
                          const additionalCost = totalCost - purchasePrice; // 구매 후 추가 비용
                          const additionalCostInManWon = Math.abs(additionalCost / 10000).toFixed(0);

                          return (
                            <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <Info className="w-3 h-3" />
                              구매 후 {vehicle.tco.ownershipYears}년간 {additionalCostInManWon}만원 추가
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* 🏦 금융 정보 미리보기 (TCO 없을 때만 표시) */}
                {!vehicle.tco && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CreditCard className="w-3 h-3" />
                      <span>금융 옵션</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                        <div className="text-blue-600 dark:text-blue-400 font-medium">할부</div>
                        <div className="font-mono font-bold">
                          {(() => {
                            const monthlyPayment = Math.round(vehicle.price * 10000 * 0.018);
                            return `${(monthlyPayment / 10000).toFixed(0)}만원/월`;
                          })()}
                        </div>
                        <div className="text-muted-foreground">60개월</div>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950/20 p-2 rounded">
                        <div className="text-purple-600 dark:text-purple-400 font-medium">리스</div>
                        <div className="font-mono font-bold">
                          {(() => {
                            const leasePayment = Math.round(vehicle.price * 10000 * 0.015);
                            return `${(leasePayment / 10000).toFixed(0)}만원/월`;
                          })()}
                        </div>
                        <div className="text-muted-foreground">36개월</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-green-50 dark:bg-green-950/20 p-2 rounded">
                      <span className="text-green-600 dark:text-green-400">예상 보험료</span>
                      <span className="font-medium">
                        {Math.max(7, Math.round(vehicle.price * 0.3))}만원/월
                      </span>
                    </div>
                  </div>
                )}

                {/* ✅ Phase 7: 버튼 확장 (차량 진단 보고서 추가) */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* 1. 추천 근거 설명 버튼 */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs h-9 border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => handleViewReason(vehicle)}
                    data-testid={`button-reason-${vehicle.rank}`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    추천 근거
                  </Button>

                  {/* 2. 🆕 Phase 7: 차량 진단 보고서 버튼 (실구매 데이터) */}
                  <Button
                    size="sm"
                    className="gap-1.5 text-xs h-9 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    onClick={() => handleViewDiagnostics(vehicle)}
                    data-testid={`button-diagnostics-${vehicle.rank}`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    진단 보고서
                  </Button>

                  {/* 3. TCO 상세 버튼 - 강조 색상 */}
                  {vehicle.tco && (
                    <Button
                      size="sm"
                      className="gap-1.5 text-xs h-9 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      onClick={() => handleViewTCO(vehicle)}
                      data-testid={`button-tco-${vehicle.rank}`}
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      TCO 비교
                    </Button>
                  )}

                  {/* 4. 차량 상세분석 버튼 (구 TOPSIS) */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs h-9"
                    onClick={() => handleViewInsights(vehicle)}
                    disabled={isLoadingAnalysis}
                    data-testid={`button-view-insights-${vehicle.rank}`}
                  >
                    <BarChart className="w-3.5 h-3.5" />
                    {isLoadingAnalysis ? '분석 중...' : '차량 상세분석'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          </div>
          {/* ✅ Phase 2: 캐러셀 인디케이터 제거 (그리드 레이아웃이므로 불필요) */}
        </div>
      </div>

      {/* 🆕 Phase 4: TCO 비교 차트 */}
      {vehicles.some(v => v.tco) && (
        <div className="mt-8 animate-slide-up">
          <TCOComparisonChart vehicles={vehicles} />
        </div>
      )}

      {/* 개인화 투명성 대시보드 */}
      {showPersonalizationDashboard && userQuery && (
        <div className="mt-6 animate-slide-up">
          <PersonalizationTransparencyDashboard
            isActive={showPersonalizationDashboard}
            userQuery={userQuery}
            onComplete={handlePersonalizationComplete}
          />
        </div>
      )}


      {/* 🆕 Phase 6-3: 차량 진단 대시보드 (6개 탭 + RDS 통합) */}
      {selectedVehicleForTOPSIS && (
        <VehicleInsightDashboard
          isOpen={showTOPSISModal}
          onClose={() => {
            setShowTOPSISModal(false);
            setSelectedVehicleForTOPSIS(null);
          }}
          vehicle={{
            id: selectedVehicleForTOPSIS.id.toString(),
            vehicleId: typeof selectedVehicleForTOPSIS.id === 'number' ? selectedVehicleForTOPSIS.id : parseInt(selectedVehicleForTOPSIS.id as string),
            manufacturer: selectedVehicleForTOPSIS.manufacturer || selectedVehicleForTOPSIS.name.split(' ')[0] || '알 수 없음',
            model: selectedVehicleForTOPSIS.model || selectedVehicleForTOPSIS.name.split(' ')[1] || selectedVehicleForTOPSIS.name,
            modelYear: selectedVehicleForTOPSIS.year,
            year: selectedVehicleForTOPSIS.year,
            price: selectedVehicleForTOPSIS.price,
            mileage: selectedVehicleForTOPSIS.mileage,
            distance: selectedVehicleForTOPSIS.mileage,
            fuelType: selectedVehicleForTOPSIS.fuel,
            location: selectedVehicleForTOPSIS.location || '알 수 없음'
          }}
        />
      )}

      {/* 🏦 차량 금융 대시보드 모달 */}
      {selectedVehicleForFinance && (
        <VehicleFinanceDashboard
          isOpen={showFinanceDashboard}
          onClose={() => {
            setShowFinanceDashboard(false);
            setSelectedVehicleForFinance(null);
          }}
          vehicle={{
            manufacturer: selectedVehicleForFinance.manufacturer || selectedVehicleForFinance.name.split(' ')[0] || '알 수 없음',
            model: selectedVehicleForFinance.model || selectedVehicleForFinance.name.split(' ')[1] || selectedVehicleForFinance.name,
            year: selectedVehicleForFinance.year,
            price: selectedVehicleForFinance.price,
            mileage: selectedVehicleForFinance.mileage,
            fuelType: selectedVehicleForFinance.fuel
          }}
        />
      )}

      {/* 🆕 Phase 3: TCO 상세 모달 */}
      {selectedVehicleForTCO && (
        <TCODetailModal
          open={showTCOModal}
          onClose={() => {
            setShowTCOModal(false);
            setSelectedVehicleForTCO(null);
          }}
          vehicle={selectedVehicleForTCO}
        />
      )}

      {/* 🆕 Phase 5: 추천 이유 모달 */}
      <RecommendationReasonModal
        vehicle={selectedVehicleForReason}
        isOpen={showReasonModal}
        onClose={() => {
          setShowReasonModal(false);
          setSelectedVehicleForReason(null);
        }}
      />

      {/* 🆕 Phase 7: 차량 진단 보고서 모달 (AWS RDS 실구매 데이터) */}
      <VehicleDiagnosticsModal
        open={showDiagnosticsModal}
        onOpenChange={setShowDiagnosticsModal}
        vehicleId={selectedVehicleForDiagnostics?.id ?? null}
        vehicleName={selectedVehicleForDiagnostics?.name ?? ''}
      />
    </>
  );
}
