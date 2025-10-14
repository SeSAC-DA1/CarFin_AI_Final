import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Wallet, Award, AlertCircle, TrendingDown } from "lucide-react";
import { Vehicle } from "./VehicleRecommendations";
import { cn } from "@/lib/utils";

interface TCOComparisonChartProps {
  vehicles: Vehicle[];
}

export default function TCOComparisonChart({ vehicles }: TCOComparisonChartProps) {
  const vehiclesWithTCO = vehicles.filter(v => v.tco && v.tco.timeline);

  if (vehiclesWithTCO.length === 0) {
    return null;
  }

  const sortedByTCO = [...vehiclesWithTCO].sort((a, b) => a.tco!.total - b.tco!.total);
  const lowestTCO = sortedByTCO[0];
  const highestTCO = sortedByTCO[sortedByTCO.length - 1];

  // 바 차트 데이터
  const barChartData = vehiclesWithTCO.map((vehicle) => {
    const tco = vehicle.tco!;
    return {
      name: `${vehicle.rank}위 ${vehicle.manufacturer} ${vehicle.model?.substring(0, 8) || ''}`,
      취득세: Math.round(tco.breakdown.acquisitionTax / 10000),
      자동차세: Math.round(tco.breakdown.vehicleTax / 10000),
      정비비: Math.round(tco.breakdown.maintenance / 10000),
      감가상각: Math.round(tco.breakdown.depreciation / 10000),
      연료비: Math.round(tco.breakdown.fuelCost / 10000),
      total: Math.round(tco.total / 10000)
    };
  });

  // Agent 인사이트
  const generateAgentInsights = () => {
    if (vehiclesWithTCO.length < 2) return [];
    const insights: string[] = [];

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
      `🥇 **${lowestTCO.manufacturer} ${lowestTCO.model}**이 가장 경제적입니다 (총 ${Math.round(lowestTCO.tco!.total / 10000)}만원). ${highestTCO.manufacturer} ${highestTCO.model}보다 **${cheapestDiff}만원 저렴**하며, 주요 차이는 **${maxCategory}**입니다 (${Math.round(maxDiff / 10000)}만원 차이).`
    );

    const fuelCosts = vehiclesWithTCO.map(v => ({
      vehicle: v,
      cost: v.tco!.breakdown.fuelCost
    })).sort((a, b) => a.cost - b.cost);

    if (fuelCosts.length >= 2) {
      const bestFuel = fuelCosts[0];
      const worstFuel = fuelCosts[fuelCosts.length - 1];
      const fuelDiff = Math.round((worstFuel.cost - bestFuel.cost) / 10000);

      insights.push(
        `⛽ **연료비 분석**: ${bestFuel.vehicle.manufacturer} ${bestFuel.vehicle.model}이 가장 경제적입니다 (${Math.round(bestFuel.cost / 10000)}만원). ${worstFuel.vehicle.manufacturer} ${worstFuel.vehicle.model}보다 ${vehiclesWithTCO[0].tco!.ownershipYears}년간 ${fuelDiff}만원 절감됩니다. 연비가 좋을수록 장기적으로 유리합니다.`
      );
    }

    const depreciations = vehiclesWithTCO.map(v => ({
      vehicle: v,
      cost: v.tco!.breakdown.depreciation
    })).sort((a, b) => a.cost - b.cost);

    if (depreciations.length >= 2) {
      const bestDep = depreciations[0];
      const worstDep = depreciations[depreciations.length - 1];
      const depDiff = Math.round((worstDep.cost - bestDep.cost) / 10000);

      insights.push(
        `📉 **감가상각 분석**: ${bestDep.vehicle.manufacturer} ${bestDep.vehicle.model}이 가장 가치 보존력이 높습니다 (${Math.round(bestDep.cost / 10000)}만원 손실). ${worstDep.vehicle.manufacturer} ${worstDep.vehicle.model}보다 ${depDiff}만원 덜 손실되어, 중고차로 재판매 시 유리합니다.`
      );
    }

    return insights;
  };

  const agentInsights = generateAgentInsights();

  // 차량 카드
  const renderVehicleCard = (vehicle: Vehicle, index: number) => {
    const tco = vehicle.tco!;
    const isLowest = vehicle === lowestTCO;
    const total = Math.round(tco.total / 10000);

    const rankColors = [
      "border-yellow-400/50 bg-gradient-to-br from-slate-800 to-slate-900",
      "border-gray-400/50 bg-gradient-to-br from-slate-800 to-slate-900",
      "border-orange-500/50 bg-gradient-to-br from-slate-800 to-slate-900"
    ];

    const rankIcons = ["🥇", "🥈", "🥉"];

    return (
      <div
        key={vehicle.vehicleId}
        className={cn(
          "p-5 rounded-xl border-2 shadow-xl transition-all hover:scale-105",
          rankColors[index] || "border-slate-700 bg-slate-800"
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{rankIcons[index]}</span>
            <div>
              <h3 className="font-bold text-base text-white">
                {vehicle.manufacturer} {vehicle.model}
              </h3>
              <p className="text-xs text-slate-400">
                {vehicle.modelYear}년 • {vehicle.fuelType}
              </p>
            </div>
          </div>
          {isLowest && (
            <Badge className="bg-emerald-600 text-white text-xs">최저 TCO</Badge>
          )}
        </div>

        <div className="mb-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
          <p className="text-xs text-slate-300 mb-1">총 소유비용 ({tco.ownershipYears}년)</p>
          <p className="text-2xl font-bold text-white">{total.toLocaleString()}만원</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center p-2 bg-purple-900/30 rounded border border-purple-700/50">
            <span className="text-xs font-medium text-purple-200">취득세 (7%)</span>
            <span className="text-sm font-semibold text-purple-100">
              {Math.round(tco.breakdown.acquisitionTax / 10000).toLocaleString()}만원
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-blue-900/30 rounded border border-blue-700/50">
            <span className="text-xs font-medium text-blue-200">자동차세</span>
            <span className="text-sm font-semibold text-blue-100">
              {Math.round(tco.breakdown.vehicleTax / 10000).toLocaleString()}만원
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-amber-900/30 rounded border border-amber-700/50">
            <span className="text-xs font-medium text-amber-200">정비비</span>
            <span className="text-sm font-semibold text-amber-100">
              {Math.round(tco.breakdown.maintenance / 10000).toLocaleString()}만원
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-red-900/30 rounded border border-red-700/50">
            <span className="text-xs font-medium text-red-200">감가상각</span>
            <span className="text-sm font-semibold text-red-100">
              {Math.round(tco.breakdown.depreciation / 10000).toLocaleString()}만원
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-green-900/30 rounded border border-green-700/50">
            <span className="text-xs font-medium text-green-200">연료비</span>
            <span className="text-sm font-semibold text-green-100">
              {Math.round(tco.breakdown.fuelCost / 10000).toLocaleString()}만원
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-2 border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl text-white">
              <Wallet className="w-6 h-6 text-blue-400" />
              총 소유비용(TCO) 비교 분석 대시보드
            </CardTitle>
            <CardDescription className="mt-2 text-sm text-slate-400">
              {vehiclesWithTCO[0].tco!.ownershipYears}년 보유 시 누적 비용 비교 (취득세, 자동차세, 정비비, 감가상각, 연료비)
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Agent 인사이트 */}
        <div className="p-5 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 rounded-xl border-2 border-blue-700/50">
          <div className="flex items-start gap-3 mb-3">
            <Award className="w-6 h-6 text-blue-300 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-blue-100 mb-3 text-base">💡 Financial Advisor Agent 인사이트 분석</h4>
              <div className="space-y-3">
                {agentInsights.map((insight, idx) => (
                  <div key={idx} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 바 차트 */}
        <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700">
          <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            5개 비용 항목 비교 차트
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barChartData}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} label={{ value: '(만원)', position: 'insideLeft', fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Bar dataKey="취득세" stackId="a" fill="#8B5CF6" />
              <Bar dataKey="자동차세" stackId="a" fill="#3B82F6" />
              <Bar dataKey="정비비" stackId="a" fill="#F59E0B" />
              <Bar dataKey="감가상각" stackId="a" fill="#EF4444" />
              <Bar dataKey="연료비" stackId="a" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 3대 비교 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vehiclesWithTCO.map((vehicle, index) => renderVehicleCard(vehicle, index))}
        </div>

        {/* 법적 근거 */}
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-slate-300">
              <p className="font-semibold mb-2 text-slate-200">📜 법적 근거</p>
              <div className="space-y-1">
                <p>• <span className="text-purple-300">취득세 7%</span>: 지방세법 제11조 제1항 제1호</p>
                <p>• <span className="text-blue-300">자동차세</span>: 지방세법 제127조 (차령별 경감)</p>
                <p>• <span className="text-amber-300">정비비 88원/km</span>: DOE/ANL Vehicle Ownership Cost Study</p>
                <p>• <span className="text-red-300">감가상각 정률법 20%</span>: 법인세법 시행령 제26조</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
