import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gauge, Fuel, Award, ExternalLink, BarChart, MapPin, Brain, Sparkles, CreditCard, Wallet, TrendingDown, Info, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import TOPSISAnalysisModal from "./TOPSISAnalysisModal";
import PersonalizationTransparencyDashboard from "./PersonalizationTransparencyDashboard";
import VehicleFinanceDashboard from "./VehicleFinanceDashboard";
import TCODetailModal from "./TCODetailModal";
import TCOComparisonChart from "./TCOComparisonChart";
import RecommendationReasonModal from "./RecommendationReasonModal";
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
  };
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
          {/* 🎨 현대적 캐러셀 스타일 컨테이너 */}
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
               style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {vehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className={cn(
                "flex-none w-80 overflow-hidden transition-all duration-500 snap-start",
                "hover:scale-105 hover:shadow-xl hover:shadow-primary/20",
                "border-card-border bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm",
                // 순위별 특별 효과
                vehicle.rank === 1 && "ring-2 ring-yellow-500/50 shadow-yellow-500/20",
                vehicle.rank === 2 && "ring-2 ring-gray-400/50 shadow-gray-400/20",
                vehicle.rank === 3 && "ring-2 ring-amber-600/50 shadow-amber-600/20"
              )}
              data-testid={`vehicle-card-${vehicle.rank}`}
            >
              <div className="relative h-40">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <div className={cn(
                    "p-1.5 backdrop-blur-sm rounded-full transition-all duration-300",
                    vehicle.rank === 1 && "bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 animate-pulse shadow-lg shadow-yellow-500/50",
                    vehicle.rank === 2 && "bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900 shadow-lg shadow-gray-400/50",
                    vehicle.rank === 3 && "bg-gradient-to-br from-amber-400 to-amber-600 text-amber-900 shadow-lg shadow-amber-500/50"
                  )}>
                    <Award className="w-4 h-4" />
                  </div>
                  <Badge className={cn(
                    "backdrop-blur-sm text-xs font-bold transition-all duration-300",
                    vehicle.rank === 1 && "bg-gradient-to-r from-yellow-400/90 to-yellow-500/90 text-yellow-900 animate-pulse",
                    vehicle.rank === 2 && "bg-gradient-to-r from-gray-300/90 to-gray-400/90 text-gray-900",
                    vehicle.rank === 3 && "bg-gradient-to-r from-amber-400/90 to-amber-500/90 text-amber-900"
                  )}>
                    {rankLabels[vehicle.rank - 1]}
                  </Badge>
                </div>

                <div className="absolute top-2 right-2">
                  <Badge className={cn(
                    "font-mono text-xs font-bold transition-all duration-300 animate-bounce-in",
                    "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
                    "shadow-lg shadow-primary/30 hover:scale-110"
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

              <div className="p-3 space-y-3">
                <div className="font-mono text-xl font-bold text-primary">
                  {vehicle.price.toLocaleString()}만원
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
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

                <div className="space-y-1.5 pt-2 border-t border-border">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">TOPSIS 점수</span>
                    <span className="font-mono font-medium">{Math.round(vehicle.topsisScore)}점</span>
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
                      <Badge variant="outline" className="text-xs ml-auto">
                        신뢰도 {(vehicle.tco.confidence * 100).toFixed(0)}%
                      </Badge>
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

                <div className="flex gap-1.5 pt-1">
                  {/* 🆕 Phase 5: 왜 추천? 버튼 */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1.5 text-xs h-8 border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => handleViewReason(vehicle)}
                    data-testid={`button-reason-${vehicle.rank}`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    왜 추천?
                  </Button>

                  {/* 🆕 Phase 3: TCO 상세보기 버튼 (TCO 데이터가 있을 때만) */}
                  {vehicle.tco && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 text-xs h-8 border-blue-200 text-blue-600 hover:bg-blue-50"
                      onClick={() => handleViewTCO(vehicle)}
                      data-testid={`button-tco-${vehicle.rank}`}
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      TCO 상세
                    </Button>
                  )}

                  <Button
                    size="sm"
                    className="flex-1 gap-1.5 text-xs h-8"
                    onClick={() => handleViewInsights(vehicle)}
                    disabled={isLoadingAnalysis}
                    data-testid={`button-view-insights-${vehicle.rank}`}
                  >
                    <BarChart className="w-3.5 h-3.5" />
                    {isLoadingAnalysis ? '분석 중...' : '차량 진단'}
                  </Button>

                  {!vehicle.tco && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 text-xs h-8 border-blue-200 text-blue-600 hover:bg-blue-50"
                      onClick={() => handleFinanceConsultation(vehicle)}
                      data-testid={`button-finance-${vehicle.rank}`}
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      금융 상담
                    </Button>
                  )}

                  {vehicle.detailUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs h-8"
                      asChild
                      data-testid={`button-detail-url-${vehicle.rank}`}
                    >
                      <a href={vehicle.detailUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5" />
                        보기
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          </div>

          {/* 🎯 캐러셀 스크롤 인디케이터 */}
          <div className="flex justify-center mt-4 gap-2">
            {vehicles.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === 0 ? "bg-primary w-6" : "bg-primary/30"
                )}
              />
            ))}
          </div>
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


      {/* TOPSIS 상세 분석 모달 (Fallback) */}
      {selectedVehicleForTOPSIS && (
        <TOPSISAnalysisModal
          isOpen={showTOPSISModal}
          onClose={() => {
            setShowTOPSISModal(false);
            setSelectedVehicleForTOPSIS(null);
          }}
          vehicle={{
            id: selectedVehicleForTOPSIS.id.toString(),
            manufacturer: selectedVehicleForTOPSIS.manufacturer || selectedVehicleForTOPSIS.name.split(' ')[0] || '알 수 없음',
            model: selectedVehicleForTOPSIS.model || selectedVehicleForTOPSIS.name.split(' ')[1] || selectedVehicleForTOPSIS.name,
            year: selectedVehicleForTOPSIS.year,
            price: selectedVehicleForTOPSIS.price,
            mileage: selectedVehicleForTOPSIS.mileage,
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
    </>
  );
}
