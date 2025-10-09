import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { TrendingDown, Wallet, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Vehicle } from "./VehicleRecommendations";
import { cn } from "@/lib/utils";

interface TCOComparisonChartProps {
  vehicles: Vehicle[];
}

export default function TCOComparisonChart({ vehicles }: TCOComparisonChartProps) {
  // TCO 데이터가 있는 차량만 필터링
  const vehiclesWithTCO = vehicles.filter(v => v.tco);

  if (vehiclesWithTCO.length === 0) {
    return null;
  }

  // ✅ Phase 4: 차트 데이터 준비 (원 → 만원 변환) + 차량 구분 명확화
  const chartData = vehiclesWithTCO.map((vehicle, index) => {
    const tco = vehicle.tco!;
    const manufacturer = vehicle.manufacturer || vehicle.name.split(' ')[0] || '알 수 없음';
    const model = vehicle.model || vehicle.name.split(' ').slice(1).join(' ') || '';
    const shortLabel = model.length > 8 ? model.substring(0, 8) : model; // 모델명 8자 제한

    return {
      name: `${index + 1}위\n${manufacturer} ${shortLabel}`,
      fullName: `${manufacturer} ${model} (${vehicle.year})`,
      취득세: Math.round(tco.breakdown.acquisitionTax / 10000),
      자동차세: Math.round(tco.breakdown.vehicleTax / 10000),
      정비비: Math.round(tco.breakdown.maintenance / 10000),
      감가상각: Math.round(tco.breakdown.depreciation / 10000),
      연료비: Math.round(tco.breakdown.fuelCost / 10000),
      총비용: Math.round(tco.total / 10000),
      rank: index + 1
    };
  });

  // 색상 정의
  const colors = {
    취득세: "#8B5CF6", // purple
    자동차세: "#3B82F6", // blue
    정비비: "#F59E0B", // amber
    감가상각: "#EF4444", // red
    연료비: "#10B981"  // green
  };

  const rankColors = ["#F59E0B", "#94A3B8", "#D97706"]; // 금, 은, 동

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card className="border-2 shadow-lg">
          <CardContent className="p-4 space-y-2">
            <p className="font-bold text-sm mb-2">{data.fullName}</p>
            <div className="space-y-1 text-xs">
              {payload.map((entry: any) => (
                <div key={entry.dataKey} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: entry.color }}
                    />
                    {entry.dataKey}
                  </span>
                  <span className="font-semibold">{entry.value.toLocaleString()}만원</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-border mt-2">
              <div className="flex items-center justify-between font-bold">
                <span>총 소유비용</span>
                <span className="text-primary">{data.총비용.toLocaleString()}만원</span>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  // ✅ Phase 3-2: TCO 차이 계산 (원 → 만원 변환)
  const tcoGap = vehiclesWithTCO.length >= 2
    ? Math.round((vehiclesWithTCO[0].tco!.total - vehiclesWithTCO[vehiclesWithTCO.length - 1].tco!.total) / 10000)
    : 0;

  const percentGap = vehiclesWithTCO.length >= 2
    ? ((vehiclesWithTCO[0].tco!.total - vehiclesWithTCO[vehiclesWithTCO.length - 1].tco!.total) / vehiclesWithTCO[vehiclesWithTCO.length - 1].tco!.total * 100).toFixed(1)
    : "0";

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Wallet className="w-6 h-6 text-primary" />
              총 소유비용(TCO) 비교 분석
            </CardTitle>
            <CardDescription className="mt-2">
              {vehiclesWithTCO[0]?.tco?.ownershipYears || 3}년 보유 시 실제로 드는 총 비용을 5가지 항목으로 비교합니다
            </CardDescription>
          </div>
          <Badge className="bg-green-500/10 text-green-600 border-green-200">
            핀테크 혁신
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ✅ Phase 3-3: 3개 차량 비교 카드 (1단: 명확한 비교) */}
        <div className="grid md:grid-cols-3 gap-4">
          {vehiclesWithTCO.map((vehicle, index) => {
            const isLowest = index === vehiclesWithTCO.length - 1;
            const diffFromLowest = vehicle.tco!.total - vehiclesWithTCO[vehiclesWithTCO.length - 1].tco!.total;
            const percentDiff = vehiclesWithTCO.length > 1
              ? ((diffFromLowest / vehiclesWithTCO[vehiclesWithTCO.length - 1].tco!.total) * 100).toFixed(1)
              : "0";

            // 가장 저렴한 비용 항목 찾기
            const breakdown = vehicle.tco!.breakdown;
            const costs = [
              { name: "연료비", value: breakdown.fuelCost },
              { name: "감가상각", value: breakdown.depreciation },
              { name: "정비비", value: breakdown.maintenance }
            ];
            const lowestCost = costs.reduce((min, cost) => cost.value < min.value ? cost : min);

            return (
              <Card
                key={vehicle.id}
                className={cn(
                  "transition-all duration-300",
                  isLowest
                    ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-500 shadow-lg shadow-green-500/20"
                    : "bg-card border-border"
                )}
              >
                <CardContent className="p-4 space-y-3">
                  {/* 순위 배지 */}
                  <div className="flex items-center justify-between">
                    <Badge className={cn(
                      "text-xs font-bold",
                      index === 0 && "bg-yellow-500 text-yellow-900",
                      index === 1 && "bg-gray-400 text-gray-900",
                      index === 2 && "bg-amber-600 text-amber-900"
                    )}>
                      {index + 1}위
                    </Badge>
                    {isLowest && (
                      <Badge className="bg-green-500 text-white text-xs">최저 TCO</Badge>
                    )}
                  </div>

                  {/* 차량 정보 */}
                  <div>
                    <p className="font-semibold text-sm truncate">
                      {vehicle.manufacturer || vehicle.name.split(' ')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {vehicle.model || vehicle.name} ({vehicle.year})
                    </p>
                  </div>

                  {/* 총 TCO */}
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">총 소유비용</p>
                    <p className="text-2xl font-bold text-primary">
                      {Math.round(vehicle.tco!.total / 10000).toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground ml-1">만원</span>
                    </p>
                  </div>

                  {/* 최저 대비 차이 */}
                  <div className={cn(
                    "p-2 rounded-lg text-xs",
                    isLowest
                      ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400"
                      : "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                  )}>
                    {isLowest ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="font-semibold">가장 저렴</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span>최저 대비</span>
                          <span className="font-bold">+{Math.round(diffFromLowest / 10000).toLocaleString()}만원</span>
                        </div>
                        <div className="text-[10px] opacity-80">
                          (+{percentDiff}% 차이)
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 강점 */}
                  <div className="pt-2 border-t border-border">
                    <p className="text-[10px] text-muted-foreground mb-1">비용 강점</p>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                        {lowestCost.name} 낮음
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ✅ Phase 4: 개선된 차트 (명확한 X축 레이블) */}
        <div className="w-full h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="name"
                angle={-15}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 13, fontWeight: 600 }}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{ value: '비용 (만원)', angle: -90, position: 'insideLeft', fontSize: 13 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }}
                iconType="square"
              />
              <Bar dataKey="취득세" stackId="a" fill={colors.취득세} radius={[0, 0, 0, 0]} />
              <Bar dataKey="자동차세" stackId="a" fill={colors.자동차세} radius={[0, 0, 0, 0]} />
              <Bar dataKey="정비비" stackId="a" fill={colors.정비비} radius={[0, 0, 0, 0]} />
              <Bar dataKey="감가상각" stackId="a" fill={colors.감가상각} radius={[0, 0, 0, 0]} />
              <Bar dataKey="연료비" stackId="a" fill={colors.연료비} radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} stroke={rankColors[index]} strokeWidth={2} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 범례 설명 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 border-t border-border">
          {Object.entries(colors).map(([key, color]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted-foreground">{key}</span>
            </div>
          ))}
        </div>

        {/* 법적 근거 */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">법적 근거 기반 정확한 계산</p>
                <ul className="space-y-0.5 ml-4">
                  <li>• 취득세/자동차세: 지방세법 제11조, 제127조</li>
                  <li>• 정비비: DOE/ANL 표준 88원/km</li>
                  <li>• 감가상각: 정률법 20% (한국회계기준)</li>
                  <li>• 연료비: 실시간 유가 + 차종별 연비</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ✅ Phase 3-3: 핵심 인사이트 (3단: 왜 저렴한가?) */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-2 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-3 flex-1">
                <p className="text-base font-bold text-foreground">
                  💰 {vehiclesWithTCO[vehiclesWithTCO.length - 1]?.manufacturer} 선택 시 최대 {Math.abs(tcoGap).toLocaleString()}만원 절약
                </p>

                {vehiclesWithTCO.length >= 2 && (() => {
                  const lowest = vehiclesWithTCO[vehiclesWithTCO.length - 1];
                  const highest = vehiclesWithTCO[0];

                  // 비용 항목별 차이 계산
                  const depreciationDiff = Math.round((highest.tco!.breakdown.depreciation - lowest.tco!.breakdown.depreciation) / 10000);
                  const fuelDiff = Math.round((highest.tco!.breakdown.fuelCost - lowest.tco!.breakdown.fuelCost) / 10000);
                  const maintenanceDiff = Math.round((highest.tco!.breakdown.maintenance - lowest.tco!.breakdown.maintenance) / 10000);

                  const differences = [
                    { name: "감가상각", diff: depreciationDiff },
                    { name: "연료비", diff: fuelDiff },
                    { name: "정비비", diff: maintenanceDiff }
                  ].filter(item => item.diff > 0).sort((a, b) => b.diff - a.diff);

                  return (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">절약 이유:</span> {differences.slice(0, 2).map(d => `${d.name} ${d.diff.toLocaleString()}만원`).join(' + ')}
                      </p>

                      <div className="flex items-center gap-2 text-xs bg-white/50 dark:bg-black/20 p-2 rounded">
                        <Info className="w-4 h-4 text-blue-600" />
                        <span className="text-muted-foreground">
                          차량 가격만 비교하면 놓칠 수 있는 {vehiclesWithTCO[0]?.tco?.ownershipYears}년간의 <span className="font-semibold text-foreground">실제 총비용</span>을 보여드립니다.
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
