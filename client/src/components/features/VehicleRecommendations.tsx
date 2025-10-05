import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gauge, Fuel, Award, ExternalLink, BarChart, MapPin, Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import TOPSISAnalysisModal from "./TOPSISAnalysisModal";
import PersonalizationTransparencyDashboard from "./PersonalizationTransparencyDashboard";
import VehicleAnalysisDashboard from "./VehicleAnalysisDashboard";
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
  const [showAnalysisDashboard, setShowAnalysisDashboard] = useState(false);
  const [selectedVehicleForAnalysis, setSelectedVehicleForAnalysis] = useState<Vehicle | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const { insights, requestInsights } = useWebSocketChat();

  const handleViewInsights = async (vehicle: Vehicle) => {
    // 신뢰성 검증 대시보드 열기
    setSelectedVehicleForAnalysis(vehicle);
    setIsLoadingAnalysis(true);

    try {
      // 신뢰성 검증 분석 API 호출
      const response = await fetch(`/api/vehicles/${vehicle.id}/verification`);
      const data = await response.json();

      if (data.success) {
        setAnalysisData(data.verification_result);
        setShowAnalysisDashboard(true);
      } else {
        console.error('분석 실패:', data.error);
        // 실패 시 기존 TOPSIS 모달로 fallback
        setSelectedVehicleForTOPSIS(vehicle);
        setShowTOPSISModal(true);
      }
    } catch (error) {
      console.error('분석 요청 실패:', error);
      // 에러 시 기존 TOPSIS 모달로 fallback
      setSelectedVehicleForTOPSIS(vehicle);
      setShowTOPSISModal(true);
    } finally {
      setIsLoadingAnalysis(false);
    }
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className="overflow-hidden hover-elevate border-card-border transition-all"
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
                  <div className={cn("p-1.5 bg-background/90 backdrop-blur-sm rounded-full", rankColors[vehicle.rank - 1])}>
                    <Award className="w-4 h-4" />
                  </div>
                  <Badge className="bg-background/90 backdrop-blur-sm text-xs">
                    {rankLabels[vehicle.rank - 1]}
                  </Badge>
                </div>

                <div className="absolute top-2 right-2">
                  <Badge className="bg-primary text-primary-foreground font-mono text-xs">
                    {vehicle.matchScore}%
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
                    <span className="font-mono font-medium">{vehicle.topsisScore}/100</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-chart-1 transition-all"
                      style={{ width: `${vehicle.topsisScore}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    className="flex-1 gap-1.5 text-xs h-8"
                    onClick={() => handleViewInsights(vehicle)}
                    disabled={isLoadingAnalysis}
                    data-testid={`button-view-insights-${vehicle.rank}`}
                  >
                    <BarChart className="w-3.5 h-3.5" />
                    {isLoadingAnalysis ? '분석 중...' : '신뢰성 검증'}
                  </Button>
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
                        보러가기
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

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

      {/* 신뢰성 검증 분석 대시보드 */}
      {showAnalysisDashboard && selectedVehicleForAnalysis && analysisData && (
        <VehicleAnalysisDashboard
          vehicle={{
            id: selectedVehicleForAnalysis.id.toString(),
            manufacturer: selectedVehicleForAnalysis.manufacturer || selectedVehicleForAnalysis.name.split(' ')[0],
            model: selectedVehicleForAnalysis.model || selectedVehicleForAnalysis.name.split(' ')[1] || selectedVehicleForAnalysis.name,
            modelYear: selectedVehicleForAnalysis.year,
            price: selectedVehicleForAnalysis.price,
            distance: selectedVehicleForAnalysis.mileage
          }}
          analysisData={analysisData}
          onClose={() => {
            setShowAnalysisDashboard(false);
            setSelectedVehicleForAnalysis(null);
            setAnalysisData(null);
          }}
        />
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
            manufacturer: selectedVehicleForTOPSIS.manufacturer || selectedVehicleForTOPSIS.name.split(' ')[0],
            model: selectedVehicleForTOPSIS.model || selectedVehicleForTOPSIS.name.split(' ')[1] || selectedVehicleForTOPSIS.name,
            year: selectedVehicleForTOPSIS.year,
            price: selectedVehicleForTOPSIS.price,
            mileage: selectedVehicleForTOPSIS.mileage,
            fuelType: selectedVehicleForTOPSIS.fuel,
            location: selectedVehicleForTOPSIS.location
          }}
        />
      )}
    </>
  );
}
