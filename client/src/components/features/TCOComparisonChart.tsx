import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { TrendingDown, Calculator, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Vehicle } from "./VehicleRecommendations";

interface TCOComparisonChartProps {
  vehicles: Vehicle[];
}

export default function TCOComparisonChart({ vehicles }: TCOComparisonChartProps) {
  // TCO 데이터가 있는 차량만 필터링
  const vehiclesWithTCO = vehicles.filter(v => v.tco);

  if (vehiclesWithTCO.length === 0) {
    return null;
  }

  // 차트 데이터 준비
  const chartData = vehiclesWithTCO.map((vehicle, index) => {
    const tco = vehicle.tco!;
    return {
      name: `${index + 1}위\n${vehicle.manufacturer || vehicle.name.split(' ')[0]}`,
      fullName: `${vehicle.manufacturer || ''} ${vehicle.model || ''} (${vehicle.year})`,
      취득세: tco.breakdown.acquisitionTax,
      자동차세: tco.breakdown.vehicleTax,
      정비비: tco.breakdown.maintenance,
      감가상각: tco.breakdown.depreciation,
      연료비: tco.breakdown.fuelCost,
      총비용: tco.total,
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

  // TCO 차이 계산
  const tcoGap = vehiclesWithTCO.length >= 2
    ? vehiclesWithTCO[0].tco!.total - vehiclesWithTCO[vehiclesWithTCO.length - 1].tco!.total
    : 0;

  const percentGap = vehiclesWithTCO.length >= 2
    ? ((tcoGap / vehiclesWithTCO[vehiclesWithTCO.length - 1].tco!.total) * 100).toFixed(1)
    : "0";

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Calculator className="w-6 h-6 text-primary" />
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
        {/* 주요 인사이트 */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">최저 TCO (추천)</p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-300">
                    {vehiclesWithTCO[vehiclesWithTCO.length - 1]?.tco?.total.toLocaleString()}만원
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-500">
                    {vehiclesWithTCO[vehiclesWithTCO.length - 1]?.manufacturer} {vehiclesWithTCO[vehiclesWithTCO.length - 1]?.model}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <TrendingDown className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mb-1">TCO 차이</p>
                  <p className="text-lg font-bold text-amber-900 dark:text-amber-300">
                    {Math.abs(tcoGap).toLocaleString()}만원
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-500">
                    1위 대비 {percentGap}% 저렴
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-green-700 dark:text-green-400 mb-1">주요 비용 항목</p>
                  <p className="text-sm font-bold text-green-900 dark:text-green-300">
                    감가상각 + 연료비
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500">
                    전체의 60-70% 차지
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 차트 */}
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="name"
                angle={0}
                textAnchor="middle"
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{ value: '비용 (만원)', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                iconType="square"
              />
              <Bar dataKey="취득세" stackId="a" fill={colors.취득세} radius={[0, 0, 0, 0]} />
              <Bar dataKey="자동차세" stackId="a" fill={colors.자동차세} radius={[0, 0, 0, 0]} />
              <Bar dataKey="정비비" stackId="a" fill={colors.정비비} radius={[0, 0, 0, 0]} />
              <Bar dataKey="감가상각" stackId="a" fill={colors.감가상각} radius={[0, 0, 0, 0]} />
              <Bar dataKey="연료비" stackId="a" fill={colors.연료비} radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} stroke={rankColors[index]} strokeWidth={3} />
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

        {/* TCO 중요성 강조 */}
        <Card className="bg-gradient-to-r from-primary/5 to-chart-2/5 border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Calculator className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  💡 가격만 보면 놓치는 것들
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  차량 가격이 500만원 싸더라도, 연비가 나쁘거나 정비비가 많이 들면
                  <span className="font-semibold text-foreground"> 3년 후에는 오히려 더 비쌀 수 있습니다</span>.
                  TCO는 구매 시점부터 보유 기간 동안의
                  <span className="font-semibold text-foreground"> 모든 비용을 종합적으로 고려</span>하여
                  진짜 가성비 좋은 차량을 찾아드립니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
