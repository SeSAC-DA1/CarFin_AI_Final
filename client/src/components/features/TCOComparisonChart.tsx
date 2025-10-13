import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { Wallet, Info, Award, TrendingDown, TrendingUp } from "lucide-react";
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
  const rankLabels = ["🥇 1위", "🥈 2위", "🥉 3위"];

  // 수평 스택 바 차트 데이터 (각 차량의 5개 비용 항목)
  const stackedBarData = vehiclesWithTCO.map((vehicle) => {
    const tco = vehicle.tco!;
    return {
      name: `${vehicle.rank}위 ${vehicle.manufacturer} ${vehicle.model?.substring(0, 10) || ''}`,
      취득세: Math.round(tco.breakdown.acquisitionTax / 10000),
      자동차세: Math.round(tco.breakdown.vehicleTax / 10000),
      정비비: Math.round(tco.breakdown.maintenance / 10000),
      감가상각: Math.round(tco.breakdown.depreciation / 10000),
      연료비: Math.round(tco.breakdown.fuelCost / 10000),
      total: Math.round(tco.total / 10000)
    };
  });

  // 최저 TCO 차량 찾기
  const lowestTCOIndex = vehiclesWithTCO.reduce((minIndex, vehicle, index, array) => {
    return vehicle.tco!.total < array[minIndex].tco!.total ? index : minIndex;
  }, 0);

  // 핵심 인사이트 생성 (사용자가 궁금한 것: 어느 차가 더 저렴하고 왜?)
  const generateKeyInsight = () => {
    if (vehiclesWithTCO.length < 2) return null;

    const first = vehiclesWithTCO[0];
    const second = vehiclesWithTCO[1];
    const diff = Math.round((second.tco!.total - first.tco!.total) / 10000);

    // 가장 큰 차이를 보이는 비용 항목 찾기
    const categories = [
      { key: 'acquisitionTax', name: '취득세' },
      { key: 'vehicleTax', name: '자동차세' },
      { key: 'maintenance', name: '정비비' },
      { key: 'depreciation', name: '감가상각' },
      { key: 'fuelCost', name: '연료비' }
    ];

    let maxDiff = 0;
    let maxCategory = '';
    categories.forEach(({ key, name }) => {
      const diff = Math.abs(
        first.tco!.breakdown[key as keyof typeof first.tco.breakdown] -
        second.tco!.breakdown[key as keyof typeof second.tco.breakdown]
      );
      if (diff > maxDiff) {
        maxDiff = diff;
        maxCategory = name;
      }
    });

    return {
      cheaper: first.rank,
      priceDiff: diff,
      reason: maxCategory,
      reasonAmount: Math.round(maxDiff / 10000)
    };
  };

  const keyInsight = generateKeyInsight();

  // 🆕 Line Chart 데이터: 시간별 누적 비용 비교
  const lineChartData = (() => {
    if (vehiclesWithTCO.length === 0 || !vehiclesWithTCO[0].tco?.timeline) return [];

    const years = vehiclesWithTCO[0].tco.timeline.length;
    const data: any[] = [];

    for (let i = 0; i < years; i++) {
      const yearData: any = { year: i };

      vehiclesWithTCO.forEach((vehicle) => {
        const timeline = vehicle.tco!.timeline!;
        if (timeline[i]) {
          const vehicleName = `${vehicle.rank}위 ${vehicle.manufacturer} ${vehicle.model?.substring(0, 8) || ''}`;
          yearData[vehicleName] = Math.round(timeline[i].cumulative / 10000);
        }
      });

      data.push(yearData);
    }

    return data;
  })();

  // Line Chart 색상 (1위: 초록, 2위: 파랑, 3위: 빨강)
  const lineColors = ["#10B981", "#3B82F6", "#EF4444"];

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

      <CardContent className="space-y-5">
        {/* ✅ 핵심 인사이트 박스 (사용자가 가장 궁금한 것: 어느 차가 더 저렴하고 왜?) */}
        {keyInsight && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border-2 border-green-500/30">
            <div className="flex items-start gap-3">
              <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-bold text-green-800 dark:text-green-300 mb-1">
                  💰 {keyInsight.cheaper}위가 {keyInsight.priceDiff.toLocaleString()}만원 더 저렴합니다
                </p>
                <p className="text-green-700 dark:text-green-400 text-xs">
                  주요 이유: <span className="font-semibold">{keyInsight.reason}</span>이 {keyInsight.reasonAmount.toLocaleString()}만원 낮기 때문
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 🆕 Line Chart: 시간별 누적 비용 비교 */}
        {lineChartData.length > 0 && (
          <div className="bg-background/50 p-4 rounded-lg border border-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              시간별 누적 비용 변화 ({vehiclesWithTCO[0].tco!.ownershipYears}년)
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="year"
                  label={{ value: '연차', position: 'insideBottom', offset: -5, fontSize: 12 }}
                  tick={{ fontSize: 11, fill: '#888' }}
                />
                <YAxis
                  label={{ value: 'TCO (만원)', angle: -90, position: 'insideLeft', fontSize: 12 }}
                  tick={{ fontSize: 11, fill: '#888' }}
                  tickFormatter={(value) => `${value}만`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <Card className="border-2 shadow-lg">
                          <CardContent className="p-3 space-y-1">
                            <p className="font-bold text-xs mb-2">{payload[0].payload.year}년차</p>
                            {payload.map((entry: any, index: number) => (
                              <p key={index} className="text-xs flex items-center justify-between gap-3">
                                <span className="flex items-center gap-1.5">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  {entry.name}
                                </span>
                                <span className="font-semibold">{entry.value.toLocaleString()}만원</span>
                              </p>
                            ))}
                          </CardContent>
                        </Card>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px' }}
                  iconType="line"
                />
                {vehiclesWithTCO.map((vehicle, index) => {
                  const vehicleName = `${vehicle.rank}위 ${vehicle.manufacturer} ${vehicle.model?.substring(0, 8) || ''}`;
                  return (
                    <Line
                      key={vehicleName}
                      type="monotone"
                      dataKey={vehicleName}
                      stroke={lineColors[index]}
                      strokeWidth={index === 0 ? 3 : 2}
                      dot={{ r: index === 0 ? 5 : 4 }}
                      activeDot={{ r: 6 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>

            {/* 추가 인사이트 (Line Chart 해석) */}
            <div className="mt-3 text-xs text-muted-foreground space-y-1">
              <p>📊 그래프에서 선이 낮을수록 비용이 저렴합니다</p>
              <p>📈 시간이 지날수록 차이가 벌어지는 모습을 확인하세요</p>
            </div>
          </div>
        )}

        {/* ✅ 수평 스택 바 차트 (5개 비용 항목 한눈에 비교) */}
        <div className="bg-background/50 p-4 rounded-lg border border-border">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            5개 비용 항목 비교 ({vehiclesWithTCO[0].tco!.ownershipYears}년 누적)
          </h3>

          <ResponsiveContainer width="100%" height={120 + vehiclesWithTCO.length * 40}>
            <BarChart
              data={stackedBarData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#888' }}
                tickFormatter={(value) => `${value}만`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#888' }}
                width={120}
              />
              <Tooltip
                content={({ payload }) => {
                  if (payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <Card className="border-2 shadow-lg">
                        <CardContent className="p-3 space-y-2">
                          <p className="font-bold text-xs mb-2">{data.name}</p>
                          <p className="text-xs font-bold text-primary">총 {data.total.toLocaleString()}만원</p>
                          <div className="space-y-1 text-xs pt-1 border-t">
                            {payload.map((entry: any) => (
                              <div key={entry.name} className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-1.5">
                                  <span
                                    className="w-2.5 h-2.5 rounded-sm"
                                    style={{ backgroundColor: entry.fill }}
                                  />
                                  {entry.name}
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
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }}
                iconType="square"
                iconSize={10}
              />
              <Bar dataKey="취득세" stackId="a" fill={colors.취득세} radius={[0, 4, 4, 0]} />
              <Bar dataKey="자동차세" stackId="a" fill={colors.자동차세} />
              <Bar dataKey="정비비" stackId="a" fill={colors.정비비} />
              <Bar dataKey="감가상각" stackId="a" fill={colors.감가상각} />
              <Bar dataKey="연료비" stackId="a" fill={colors.연료비} radius={[4, 0, 0, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ 3개 비교 카드 (강화된 버전) */}
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

            // 핵심 강점 찾기 (가장 저렴한 비용 항목 2개)
            const costItems = [
              { name: '취득세', value: tco.breakdown.acquisitionTax },
              { name: '자동차세', value: tco.breakdown.vehicleTax },
              { name: '정비비', value: tco.breakdown.maintenance },
              { name: '감가상각', value: tco.breakdown.depreciation },
              { name: '연료비', value: tco.breakdown.fuelCost }
            ].sort((a, b) => a.value - b.value);

            return (
              <Card
                key={vehicle.id}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
                  isLowest && "ring-2 ring-green-500 shadow-lg shadow-green-500/20"
                )}
              >
                <CardContent className="p-5 space-y-4">
                  {/* 순위 배지 */}
                  <div className="flex items-center justify-between">
                    <Badge
                      className={cn(
                        "text-base font-bold px-3 py-1",
                        index === 0 && "bg-yellow-500 text-yellow-900",
                        index === 1 && "bg-blue-500 text-blue-900",
                        index === 2 && "bg-red-500 text-red-900"
                      )}
                    >
                      {rankLabels[index]}
                    </Badge>
                    {isLowest && (
                      <Badge className="bg-green-500 text-white px-2 py-1">
                        ✅ 최저
                      </Badge>
                    )}
                  </div>

                  {/* 차량명 */}
                  <div>
                    <p className="font-bold text-lg leading-tight">
                      {manufacturer} {model}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {vehicle.year}년 • {vehicle.fuel}
                    </p>
                  </div>

                  {/* 총 TCO - 더 크고 눈에 띄게 */}
                  <div className="pt-3 pb-2 border-y border-border">
                    <p className="text-xs text-muted-foreground mb-1.5">
                      {tco.ownershipYears}년 총 소유비용
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className={cn(
                        "text-3xl font-extrabold",
                        isLowest ? "text-green-600" : "text-primary"
                      )}>
                        {Math.round(tco.total / 10000).toLocaleString()}
                      </p>
                      <span className="text-sm font-medium text-muted-foreground">만원</span>
                    </div>

                    {/* vs 1위 차이 - 더 눈에 띄게 */}
                    {index !== 0 && (
                      <div className="mt-2 flex items-center gap-1.5">
                        {diffFrom1st > 0 ? (
                          <TrendingUp className="w-4 h-4 text-red-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-green-600" />
                        )}
                        <span className={cn(
                          "text-sm font-bold",
                          diffFrom1st > 0 ? "text-red-600" : "text-green-600"
                        )}>
                          1위 대비 {diffFrom1st > 0 ? '+' : ''}{diffFrom1st.toLocaleString()}만원
                        </span>
                      </div>
                    )}

                    {index === 0 && (
                      <div className="mt-2 flex items-center justify-center gap-1.5 text-sm text-green-600 font-bold">
                        <Award className="w-4 h-4" />
                        <span>가장 경제적</span>
                      </div>
                    )}
                  </div>

                  {/* 핵심 강점 (가장 저렴한 항목 2개) */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground">핵심 강점</p>
                    <div className="space-y-1">
                      {costItems.slice(0, 2).map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">✓ {item.name}</span>
                          <span className="font-semibold text-green-600">
                            {Math.round(item.value / 10000).toLocaleString()}만원
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
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
