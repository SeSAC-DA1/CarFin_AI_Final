import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Wallet, Info, Award, Zap } from "lucide-react";
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

  // ✅ Phase 6-2: Radar Chart 데이터 준비 (5개 비용 항목)
  const radarData = [
    { category: '취득세', key: 'acquisitionTax', fullMark: 500 },
    { category: '자동차세', key: 'vehicleTax', fullMark: 300 },
    { category: '정비비', key: 'maintenance', fullMark: 1000 },
    { category: '감가상각', key: 'depreciation', fullMark: 1500 },
    { category: '연료비', key: 'fuelCost', fullMark: 1000 }
  ].map(item => {
    const dataPoint: any = { category: item.category };

    vehiclesWithTCO.forEach((vehicle, index) => {
      const value = vehicle.tco!.breakdown[item.key as keyof typeof vehicle.tco.breakdown];
      dataPoint[`${vehicle.rank}위`] = Math.round(value / 10000); // 만원 단위
    });

    return dataPoint;
  });

  // 자동 인사이트 생성
  const generateInsights = () => {
    const insights: string[] = [];
    const categories = ['acquisitionTax', 'vehicleTax', 'maintenance', 'depreciation', 'fuelCost'];
    const categoryNames = ['취득세', '자동차세', '정비비', '감가상각', '연료비'];

    categories.forEach((key, idx) => {
      const values = vehiclesWithTCO.map(v => ({
        rank: v.rank,
        value: v.tco!.breakdown[key as keyof typeof v.tco.breakdown]
      }));
      const lowest = values.reduce((min, curr) => curr.value < min.value ? curr : min);
      insights.push(`${lowest.rank}위는 ${categoryNames[idx]}이 가장 낮습니다 (${Math.round(lowest.value / 10000)}만원)`);
    });

    return insights;
  };

  const insights = generateInsights();

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
        {/* ✅ Phase 6-2: Radar Chart - 5개 비용 항목 비교 */}
        <div className="bg-background/50 p-4 rounded-lg border border-border">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            비용 항목별 비교 분석
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#888" strokeOpacity={0.3} />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fontSize: 12, fill: '#888' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 'auto']}
                tick={{ fontSize: 10, fill: '#888' }}
                tickFormatter={(value) => `${value}만원`}
              />
              <Tooltip
                content={({ payload }) => {
                  if (payload && payload.length) {
                    return (
                      <Card className="border-2 shadow-lg">
                        <CardContent className="p-3 space-y-1">
                          <p className="font-bold text-sm mb-2">{payload[0].payload.category}</p>
                          {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center justify-between gap-4 text-xs">
                              <span className="flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: entry.stroke }}
                                />
                                {entry.name}
                              </span>
                              <span className="font-semibold">{entry.value.toLocaleString()}만원</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '10px' }}
                iconType="circle"
              />
              {vehiclesWithTCO.map((vehicle, index) => (
                <Radar
                  key={vehicle.id}
                  name={`${vehicle.rank}위`}
                  dataKey={`${vehicle.rank}위`}
                  stroke={vehicleColors[index]}
                  fill={vehicleColors[index]}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>

          {/* 자동 인사이트 */}
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2 text-xs">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-blue-700 dark:text-blue-300 space-y-1">
                <strong>💡 자동 분석 결과:</strong>
                <ul className="list-disc list-inside space-y-0.5 mt-1">
                  {insights.slice(0, 3).map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
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
