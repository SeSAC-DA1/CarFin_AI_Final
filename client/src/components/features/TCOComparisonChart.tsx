import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Award, TrendingDown, TrendingUp, Car, DollarSign, AlertCircle } from "lucide-react";
import { Vehicle } from "./VehicleRecommendations";
import { cn } from "@/lib/utils";

interface TCOComparisonChartProps {
  vehicles: Vehicle[];
}

export default function TCOComparisonChart({ vehicles }: TCOComparisonChartProps) {
  // TCO 데이터가 있는 차량만 필터링
  const vehiclesWithTCO = vehicles.filter(v => v.tco && v.tco.timeline);

  if (vehiclesWithTCO.length === 0) {
    return null;
  }

  // TCO 순위 (낮은 순)
  const sortedByTCO = [...vehiclesWithTCO].sort((a, b) => a.tco!.total - b.tco!.total);
  const lowestTCO = sortedByTCO[0];
  const highestTCO = sortedByTCO[sortedByTCO.length - 1];

  // 🎯 Agent 인사이트 생성
  const generateAgentInsights = () => {
    if (vehiclesWithTCO.length < 2) return [];

    const insights: string[] = [];

    // 1. 가장 저렴한 차량과 이유
    const cheapestDiff = Math.round((highestTCO.tco!.total - lowestTCO.tco!.total) / 10000);
    const categories = [
      { key: 'acquisitionTax', name: '취득세' },
      { key: 'depreciation', name: '감가상각' },
      { key: 'fuelCost', name: '연료비' },
      { key: 'maintenance', name: '정비비' },
      { key: 'vehicleTax', name: '자동차세' }
    ];

    let maxDiff = 0;
    let maxCategory = '';
    categories.forEach(({ key, name }) => {
      const diff = Math.abs(
        lowestTCO.tco!.breakdown[key as keyof typeof lowestTCO.tco.breakdown] -
        highestTCO.tco!.breakdown[key as keyof typeof highestTCO.tco.breakdown]
      );
      if (diff > maxDiff) {
        maxDiff = diff;
        maxCategory = name;
      }
    });

    insights.push(
      `🥇 **${lowestTCO.manufacturer} ${lowestTCO.model}**이 가장 경제적입니다. ${highestTCO.manufacturer} ${highestTCO.model}보다 **${cheapestDiff}만원 저렴**하며, 주요 차이는 **${maxCategory}** (${Math.round(maxDiff / 10000)}만원 차이)입니다.`
    );

    // 2. 연료비 분석
    const fuelCosts = vehiclesWithTCO.map(v => ({
      vehicle: v,
      cost: v.tco!.breakdown.fuelCost
    })).sort((a, b) => a.cost - b.cost);

    if (fuelCosts.length >= 2) {
      const bestFuel = fuelCosts[0];
      const worstFuel = fuelCosts[fuelCosts.length - 1];
      const fuelDiff = Math.round((worstFuel.cost - bestFuel.cost) / 10000);

      insights.push(
        `⛽ 연료비는 **${bestFuel.vehicle.manufacturer} ${bestFuel.vehicle.model}**이 가장 저렴합니다 (${Math.round(bestFuel.cost / 10000)}만원). ${worstFuel.vehicle.manufacturer} ${worstFuel.vehicle.model}보다 ${fuelDiff}만원 절감 가능합니다.`
      );
    }

    // 3. 감가상각 분석
    const depreciations = vehiclesWithTCO.map(v => ({
      vehicle: v,
      cost: v.tco!.breakdown.depreciation
    })).sort((a, b) => a.cost - b.cost);

    if (depreciations.length >= 2) {
      const bestDep = depreciations[0];
      const worstDep = depreciations[depreciations.length - 1];
      const depDiff = Math.round((worstDep.cost - bestDep.cost) / 10000);

      insights.push(
        `📉 감가상각은 **${bestDep.vehicle.manufacturer} ${bestDep.vehicle.model}**이 가장 적습니다 (${Math.round(bestDep.cost / 10000)}만원). 중고차 가격이 상대적으로 안정적이어서 ${depDiff}만원 덜 손실됩니다.`
      );
    }

    return insights;
  };

  const agentInsights = generateAgentInsights();

  // 차량 카드 렌더링
  const renderVehicleCard = (vehicle: Vehicle, index: number) => {
    const tco = vehicle.tco!;
    const isLowest = vehicle === lowestTCO;
    const total = Math.round(tco.total / 10000);

    const rankColors = [
      "border-yellow-500 bg-gradient-to-br from-yellow-50 to-amber-50",
      "border-gray-400 bg-gradient-to-br from-gray-50 to-slate-50",
      "border-orange-600 bg-gradient-to-br from-orange-50 to-red-50"
    ];

    const rankIcons = ["🥇", "🥈", "🥉"];

    return (
      <div
        key={vehicle.vehicleId}
        className={cn(
          "p-6 rounded-xl border-2 shadow-lg transition-all hover:scale-105",
          rankColors[index] || "border-gray-300 bg-white"
        )}
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{rankIcons[index]}</span>
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                {vehicle.manufacturer} {vehicle.model}
              </h3>
              <p className="text-sm text-slate-600">
                {vehicle.modelYear}년 • {vehicle.fuelType}
              </p>
            </div>
          </div>
          {isLowest && (
            <Badge className="bg-green-600 text-white">최저 TCO</Badge>
          )}
        </div>

        {/* 총 비용 */}
        <div className="mb-4 p-4 bg-white/80 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-600 mb-1">총 소유비용 ({tco.ownershipYears}년)</p>
          <p className="text-3xl font-bold text-slate-900">{total.toLocaleString()}만원</p>
        </div>

        {/* 5개 비용 항목 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
            <span className="text-xs font-medium text-purple-900">취득세 (7%)</span>
            <span className="text-sm font-semibold text-purple-800">
              {Math.round(tco.breakdown.acquisitionTax / 10000).toLocaleString()}만원
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
            <span className="text-xs font-medium text-blue-900">자동차세</span>
            <span className="text-sm font-semibold text-blue-800">
              {Math.round(tco.breakdown.vehicleTax / 10000).toLocaleString()}만원
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-amber-50 rounded">
            <span className="text-xs font-medium text-amber-900">정비비 (88원/km)</span>
            <span className="text-sm font-semibold text-amber-800">
              {Math.round(tco.breakdown.maintenance / 10000).toLocaleString()}만원
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-red-50 rounded">
            <span className="text-xs font-medium text-red-900">감가상각 (20%)</span>
            <span className="text-sm font-semibold text-red-800">
              {Math.round(tco.breakdown.depreciation / 10000).toLocaleString()}만원
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-green-50 rounded">
            <span className="text-xs font-medium text-green-900">연료비</span>
            <span className="text-sm font-semibold text-green-800">
              {Math.round(tco.breakdown.fuelCost / 10000).toLocaleString()}만원
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Wallet className="w-6 h-6 text-primary" />
              총 소유비용(TCO) 3대 비교
            </CardTitle>
            <CardDescription className="mt-2 text-sm">
              {vehiclesWithTCO[0].tco!.ownershipYears}년 보유 시 누적 비용 비교 (취득세, 자동차세, 정비비, 감가상각, 연료비)
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 🎯 Agent 인사이트 */}
        <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
          <div className="flex items-start gap-3 mb-3">
            <Award className="w-6 h-6 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-indigo-900 mb-2">💡 Financial Advisor Agent 분석</h4>
              <div className="space-y-2">
                {agentInsights.map((insight, idx) => (
                  <p key={idx} className="text-sm text-indigo-800 leading-relaxed">
                    {insight}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3대 비교 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vehiclesWithTCO.map((vehicle, index) => renderVehicleCard(vehicle, index))}
        </div>

        {/* 법적 근거 */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-slate-700">
              <p className="font-semibold mb-1">📜 법적 근거</p>
              <p>• 취득세 7%: 지방세법 제11조 제1항 제1호</p>
              <p>• 자동차세: 지방세법 제127조 (차령별 경감)</p>
              <p>• 정비비 88원/km: DOE/ANL Vehicle Ownership Cost Study</p>
              <p>• 감가상각 정률법 20%: 법인세법 시행령 제26조</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
