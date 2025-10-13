import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingDown, Wallet, Info, Award } from "lucide-react";
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

  // 색상 정의
  const colors = {
    취득세: "#8B5CF6", // purple
    자동차세: "#3B82F6", // blue
    정비비: "#F59E0B", // amber
    감가상각: "#EF4444", // red
    연료비: "#10B981"  // green
  };

  const vehicleColors = ["#F59E0B", "#3B82F6", "#EF4444"]; // 1위, 2위, 3위
  const rankColors = ["text-yellow-500", "text-blue-500", "text-red-500"];
  const rankBgColors = ["bg-yellow-500", "bg-blue-500", "bg-red-500"];
  const rankLabels = ["🥇 1위", "🥈 2위", "🥉 3위"];

  // ✅ Phase 6-1: Area Chart 타임라인 데이터 준비
  const timelineData = vehiclesWithTCO[0].tco!.timeline!.map((_, yearIndex) => {
    const dataPoint: any = {
      year: `${yearIndex}년차`
    };

    vehiclesWithTCO.forEach((vehicle, vIndex) => {
      const yearData = vehicle.tco!.timeline![yearIndex];
      const vehicleName = `${vehicle.rank}위`;
      dataPoint[vehicleName] = Math.round(yearData.cumulative / 10000);
    });

    return dataPoint;
  });

  // 최저 TCO 차량 찾기
  const lowestTCOIndex = vehiclesWithTCO.reduce((minIndex, vehicle, index, array) => {
    return vehicle.tco!.total < array[minIndex].tco!.total ? index : minIndex;
  }, 0);

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="border-2 shadow-lg">
          <CardContent className="p-3 space-y-1">
            <p className="font-bold text-sm mb-2">{payload[0].payload.year}</p>
            <div className="space-y-1 text-xs">
              {payload.map((entry: any, index: number) => (
                <div key={entry.dataKey} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.stroke }}
                    />
                    {entry.dataKey}
                  </span>
                  <span className="font-semibold">{entry.value.toLocaleString()}만원</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Wallet className="w-6 h-6 text-primary" />
              총 소유비용(TCO) 비교 분석
            </CardTitle>
            <CardDescription className="mt-2 text-sm">
              {vehiclesWithTCO[0].tco!.ownershipYears}년 보유 시 누적 비용 추이 (취득세, 자동차세, 정비비, 감가상각, 연료비 포함)
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ✅ Phase 6-1: Area Chart - 연도별 누적 비용 추이 */}
        <div className="bg-background/50 p-4 rounded-lg border border-border">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            {vehiclesWithTCO[0].tco!.ownershipYears}년간 누적 비용 추이
          </h3>

          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12 }}
                stroke="#888"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#888"
                tickFormatter={(value) => {
                  // 🔧 단위 표시 개선: 0백만원 → 0원, 30백만원 → 3,000만원
                  if (value === 0) return '0원';
                  return `${(value / 100).toLocaleString()}백만원`;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              {vehiclesWithTCO.map((vehicle, index) => (
                <Area
                  key={vehicle.id}
                  type="monotone"
                  dataKey={`${vehicle.rank}위`}
                  stackId="1"
                  stroke={vehicleColors[index]}
                  fill={vehicleColors[index]}
                  fillOpacity={0.6}
                  strokeWidth={3}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2 text-xs">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-blue-700 dark:text-blue-300">
                <strong>차트 해석:</strong> 영역이 넓을수록 누적 비용이 높습니다.
                시간이 지날수록 감가상각과 연료비가 누적되어 총 소유비용이 증가합니다.
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Phase 6-1: 3개 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vehiclesWithTCO.map((vehicle, index) => {
            const tco = vehicle.tco!;
            const isLowest = index === lowestTCOIndex;
            const manufacturer = vehicle.manufacturer || vehicle.name.split(' ')[0] || '알 수 없음';
            const model = vehicle.model || vehicle.name.split(' ').slice(1).join(' ') || '';

            // vs 1위 차이 계산
            const diffFrom1st = index === 0
              ? 0
              : Math.round((tco.total - vehiclesWithTCO[0].tco!.total) / 10000);
            const percentDiffFrom1st = index === 0
              ? 0
              : ((tco.total - vehiclesWithTCO[0].tco!.total) / vehiclesWithTCO[0].tco!.total * 100);

            return (
              <Card
                key={vehicle.id}
                className={cn(
                  "relative overflow-hidden transition-all duration-300",
                  isLowest && "ring-2 ring-green-500 shadow-lg shadow-green-500/20"
                )}
              >
                <CardContent className="p-4 space-y-3">
                  {/* 순위 배지 */}
                  <div className="flex items-center justify-between">
                    <Badge
                      className={cn(
                        "text-sm font-bold",
                        index === 0 && "bg-yellow-500 text-yellow-900",
                        index === 1 && "bg-blue-500 text-blue-900",
                        index === 2 && "bg-red-500 text-red-900"
                      )}
                    >
                      {rankLabels[index]}
                    </Badge>
                    {isLowest && (
                      <Badge className="bg-green-500 text-white">
                        ✅ 최저 TCO
                      </Badge>
                    )}
                  </div>

                  {/* 차량명 */}
                  <div>
                    <p className="font-bold text-base">
                      {manufacturer} {model}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {vehicle.year}년 • {vehicle.fuel}
                    </p>
                  </div>

                  {/* 총 TCO */}
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">
                      {tco.ownershipYears}년 총 소유비용
                    </p>
                    <p className={cn(
                      "text-2xl font-bold",
                      isLowest ? "text-green-600" : "text-primary"
                    )}>
                      {(tco.total / 10000).toFixed(0)}
                      <span className="text-sm ml-1">만원</span>
                    </p>
                  </div>

                  {/* 5개 항목 미니 바 차트 */}
                  <div className="space-y-1.5">
                    {[
                      { name: '취득세', value: tco.breakdown.acquisitionTax, color: colors.취득세 },
                      { name: '자동차세', value: tco.breakdown.vehicleTax, color: colors.자동차세 },
                      { name: '정비비', value: tco.breakdown.maintenance, color: colors.정비비 },
                      { name: '감가상각', value: tco.breakdown.depreciation, color: colors.감가상각 },
                      { name: '연료비', value: tco.breakdown.fuelCost, color: colors.연료비 }
                    ].map((item) => {
                      const percentage = (item.value / tco.total) * 100;
                      return (
                        <div key={item.name} className="space-y-0.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-muted-foreground">{item.name}</span>
                            </span>
                            <span className="font-semibold">
                              {Math.round(item.value / 10000)}만원
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: item.color
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* vs 1위 비교 */}
                  {index !== 0 && (
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">vs 1위</span>
                        <span className={cn(
                          "font-bold",
                          diffFrom1st > 0 ? "text-red-600" : "text-green-600"
                        )}>
                          {diffFrom1st > 0 ? '+' : ''}{diffFrom1st}만원 ({percentDiffFrom1st > 0 ? '+' : ''}{percentDiffFrom1st.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  )}

                  {index === 0 && (
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-center gap-1 text-xs text-green-600 font-semibold">
                        <Award className="w-3 h-3" />
                        <span>가장 경제적인 선택</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 법적 근거 */}
        <div className="p-3 bg-muted/30 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>📖 계산 근거:</strong> 취득세(지방세법 제11조, 7%), 자동차세(지방세법 제127조, 차령 감액 적용),
            정비비(DOE/ANL 88원/km), 감가상각(정률법 20%), 연료비(평균 연비 × 현재 유가)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
