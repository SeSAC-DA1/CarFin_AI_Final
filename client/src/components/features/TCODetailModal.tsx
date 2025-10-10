import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  Calculator,
  Building,
  Wrench,
  TrendingDown,
  Fuel,
  Info,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  LineChart as LineChartIcon
} from "lucide-react";
import { Vehicle } from "./VehicleRecommendations";
import { cn } from "@/lib/utils";

interface TCODetailModalProps {
  open: boolean;
  onClose: () => void;
  vehicle: Vehicle;
}

export default function TCODetailModal({ open, onClose, vehicle }: TCODetailModalProps) {
  const [activeTab, setActiveTab] = useState<string>("details");

  if (!vehicle.tco) return null;

  const { total, breakdown, confidence, ownershipYears, timeline } = vehicle.tco;

  // 각 항목의 비율 계산
  const getPercentage = (value: number) => ((value / total) * 100).toFixed(1);

  // ✅ Phase 6-2: 비용 추이 차트 데이터 (누적 Area Chart)
  const costTrendData = timeline?.map((yearData) => ({
    year: `${yearData.year}년차`,
    취득세: Math.round(yearData.acquisitionTax / 10000),
    자동차세: Math.round(yearData.vehicleTax / 10000),
    정비비: Math.round(yearData.maintenance / 10000),
    감가상각: Math.round(yearData.depreciation / 10000),
    연료비: Math.round(yearData.fuelCost / 10000),
    누적총액: Math.round(yearData.cumulative / 10000)
  })) || [];

  // ✅ Phase 6-2: 감가 분석 데이터 (Line Chart)
  const depreciationRate = 0.20; // 정률법 20%
  const currentValue = vehicle.price * 10000;

  const depreciationData = timeline?.map((yearData) => {
    const vehicleValue = currentValue * Math.pow(1 - depreciationRate, yearData.year);
    // 업계 평균은 25% 감가율 가정
    const industryAverage = currentValue * Math.pow(1 - 0.25, yearData.year);

    return {
      year: `${yearData.year}년차`,
      차량가치: Math.round(vehicleValue / 10000),
      업계평균: Math.round(industryAverage / 10000),
      차이: Math.round((vehicleValue - industryAverage) / 10000)
    };
  }) || [];

  // 색상 정의
  const colors = {
    취득세: "#8B5CF6", // purple
    자동차세: "#3B82F6", // blue
    정비비: "#F59E0B", // amber
    감가상각: "#EF4444", // red
    연료비: "#10B981"  // green
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            총 소유비용(TCO) 상세 분석
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {vehicle.manufacturer || vehicle.name.split(' ')[0]} {vehicle.model || vehicle.name.split(' ')[1]} ({vehicle.year})
          </p>
        </DialogHeader>

        {/* 요약 카드 - 항상 표시 */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">총 소유비용</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {(total / 10000).toFixed(0)}
                  <span className="text-sm ml-1">만원</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">보유 기간</p>
                <p className="text-2xl font-bold text-primary">
                  {ownershipYears}
                  <span className="text-sm ml-1">년</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">신뢰도</p>
                <div className="flex items-center justify-center gap-2">
                  {confidence >= 0.8 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  )}
                  <p className="text-2xl font-bold text-primary">
                    {(confidence * 100).toFixed(0)}
                    <span className="text-sm ml-1">%</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ✅ Phase 6-2: 탭 네비게이션 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="gap-2">
              <Info className="w-4 h-4" />
              항목별 상세
            </TabsTrigger>
            <TabsTrigger value="trend" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              비용 추이
            </TabsTrigger>
            <TabsTrigger value="depreciation" className="gap-2">
              <LineChartIcon className="w-4 h-4" />
              감가 분석
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: 항목별 상세 (기존) */}
          <TabsContent value="details" className="space-y-4 mt-4">
            {/* 1. 취득세 */}
            <CostItemCard
              icon={<Building className="w-5 h-5 text-purple-600" />}
              title="취득세"
              amount={breakdown.acquisitionTax}
              percentage={getPercentage(breakdown.acquisitionTax)}
              legalBasis="지방세법 제11조"
              description="차량 가격의 7%"
              color="purple"
            />

            {/* 2. 자동차세 */}
            <CostItemCard
              icon={<Building className="w-5 h-5 text-blue-600" />}
              title="자동차세"
              amount={breakdown.vehicleTax}
              percentage={getPercentage(breakdown.vehicleTax)}
              legalBasis="지방세법 제127조"
              description={`${ownershipYears}년간 총 자동차세 (차령 감액 적용)`}
              color="blue"
            />

            {/* 3. 정비/소모품 */}
            <CostItemCard
              icon={<Wrench className="w-5 h-5 text-orange-600" />}
              title="정비/소모품비"
              amount={breakdown.maintenance}
              percentage={getPercentage(breakdown.maintenance)}
              legalBasis="DOE/ANL 연구 데이터"
              description="88원/km × 주행거리"
              color="orange"
            />

            {/* 4. 감가상각 */}
            <CostItemCard
              icon={<TrendingDown className="w-5 h-5 text-red-600" />}
              title="감가상각"
              amount={breakdown.depreciation}
              percentage={getPercentage(breakdown.depreciation)}
              legalBasis="정률법 20%"
              description={`${ownershipYears}년 후 예상 가치 하락분`}
              color="red"
            />

            {/* 5. 연료비 */}
            <CostItemCard
              icon={<Fuel className="w-5 h-5 text-green-600" />}
              title="연료비"
              amount={breakdown.fuelCost}
              percentage={getPercentage(breakdown.fuelCost)}
              legalBasis={`${vehicle.fuel} 평균 연비`}
              description={`${ownershipYears}년간 예상 연료 비용`}
              color="green"
            />

            {/* 안내 메시지 */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground">
                <strong>📌 유의사항:</strong> TCO는 평균 주행거리와 일반적인 시장 데이터를 기반으로 계산된 예상값입니다.
                실제 비용은 개인의 주행 습관, 차량 관리 방법, 유가 변동 등에 따라 달라질 수 있습니다.
              </p>
            </div>
          </TabsContent>

          {/* Tab 2: 비용 추이 (신규) */}
          <TabsContent value="trend" className="space-y-4 mt-4">
            <div className="bg-background/50 p-4 rounded-lg border border-border">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                {ownershipYears}년간 비용 항목별 누적 추이
              </h3>

              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={costTrendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}만원`} />
                  <Tooltip
                    formatter={(value: number) => `${value.toLocaleString()}만원`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="취득세" stackId="1" stroke={colors.취득세} fill={colors.취득세} fillOpacity={0.8} />
                  <Area type="monotone" dataKey="자동차세" stackId="1" stroke={colors.자동차세} fill={colors.자동차세} fillOpacity={0.8} />
                  <Area type="monotone" dataKey="정비비" stackId="1" stroke={colors.정비비} fill={colors.정비비} fillOpacity={0.8} />
                  <Area type="monotone" dataKey="감가상각" stackId="1" stroke={colors.감가상각} fill={colors.감가상각} fillOpacity={0.8} />
                  <Area type="monotone" dataKey="연료비" stackId="1" stroke={colors.연료비} fill={colors.연료비} fillOpacity={0.8} />
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2 text-xs">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-blue-700 dark:text-blue-300 space-y-1">
                    <p><strong>차트 해석:</strong> 각 색상 영역은 연도별 해당 비용 항목의 누적 금액입니다.</p>
                    <p>• <strong>취득세</strong>는 0년차 1회만 발생</p>
                    <p>• <strong>감가상각</strong>과 <strong>연료비</strong>가 총 비용의 대부분을 차지</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 인사이트 카드 3개 */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">초기 비용 (0년차)</p>
                  <p className="text-xl font-bold text-purple-600">
                    {costTrendData.length > 0 ? costTrendData[0].누적총액.toLocaleString() : 0}만원
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">구매가 + 취득세</p>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">연간 평균 비용</p>
                  <p className="text-xl font-bold text-blue-600">
                    {ownershipYears > 0 ? Math.round((total / 10000) / ownershipYears).toLocaleString() : 0}만원
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">유지 + 감가</p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">최대 비중 항목</p>
                  <p className="text-xl font-bold text-green-600">
                    {breakdown.fuelCost > breakdown.depreciation ? '연료비' : '감가상각'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getPercentage(breakdown.fuelCost > breakdown.depreciation ? breakdown.fuelCost : breakdown.depreciation)}%
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 3: 감가 분석 (신규) */}
          <TabsContent value="depreciation" className="space-y-4 mt-4">
            <div className="bg-background/50 p-4 rounded-lg border border-border">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <LineChartIcon className="w-4 h-4" />
                {ownershipYears}년간 차량 가치 변화
              </h3>

              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={depreciationData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}만원`} />
                  <Tooltip
                    formatter={(value: number) => `${value.toLocaleString()}만원`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line
                    type="monotone"
                    dataKey="차량가치"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="업계평균"
                    stroke="#94A3B8"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#94A3B8', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2 text-xs">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-blue-700 dark:text-blue-300">
                    <p><strong>감가율 비교:</strong> 이 차량은 정률법 20% 감가, 업계 평균은 25% 감가 가정</p>
                    <p className="mt-1">
                      {depreciationData.length > 0 && depreciationData[depreciationData.length - 1].차이 > 0 ? (
                        <span className="text-green-600 font-semibold">
                          ✅ {ownershipYears}년 후 업계 평균보다 {Math.abs(depreciationData[depreciationData.length - 1].차이).toLocaleString()}만원 높은 잔존가치
                        </span>
                      ) : (
                        <span className="text-orange-600 font-semibold">
                          ⚠️ {ownershipYears}년 후 업계 평균보다 {Math.abs(depreciationData[depreciationData.length - 1]?.차이 || 0).toLocaleString()}만원 낮은 잔존가치
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 가치 예측 테이블 */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 text-sm">연도별 예상 잔존가치</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-2">연도</th>
                        <th className="text-right py-2 px-2">예상 가치</th>
                        <th className="text-right py-2 px-2">업계 평균</th>
                        <th className="text-right py-2 px-2">차이</th>
                      </tr>
                    </thead>
                    <tbody>
                      {depreciationData.map((row, index) => (
                        <tr key={index} className="border-b border-border last:border-0">
                          <td className="py-2 px-2 font-medium">{row.year}</td>
                          <td className="text-right py-2 px-2 font-semibold text-blue-600">
                            {row.차량가치.toLocaleString()}만원
                          </td>
                          <td className="text-right py-2 px-2 text-muted-foreground">
                            {row.업계평균.toLocaleString()}만원
                          </td>
                          <td className={cn(
                            "text-right py-2 px-2 font-semibold",
                            row.차이 > 0 ? "text-green-600" : "text-orange-600"
                          )}>
                            {row.차이 > 0 ? '+' : ''}{row.차이.toLocaleString()}만원
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* 💡 인사이트 */}
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>💡 인사이트:</strong> {depreciationData.length > 0 && depreciationData[depreciationData.length - 1].차이 > 0
                  ? `이 차량은 브랜드 신뢰도가 높아 업계 평균보다 잔존가치가 우수합니다. ${ownershipYears}년 후 약 ${Math.abs(depreciationData[depreciationData.length - 1].차이).toLocaleString()}만원 더 비싸게 판매 가능합니다.`
                  : `이 차량은 업계 평균 대비 감가율이 높습니다. 장기 보유보다는 ${Math.floor(ownershipYears / 2)}년 이내 단기 보유 후 매도를 고려하세요.`
                }
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// 비용 항목 카드 서브 컴포넌트
interface CostItemCardProps {
  icon: React.ReactNode;
  title: string;
  amount: number;
  percentage: string;
  legalBasis: string;
  description: string;
  color: "purple" | "blue" | "orange" | "red" | "green";
}

function CostItemCard({
  icon,
  title,
  amount,
  percentage,
  legalBasis,
  description,
  color
}: CostItemCardProps) {
  const colorClasses = {
    purple: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
    blue: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
    orange: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
    red: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
    green: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
  };

  return (
    <Card className={`${colorClasses[color]} border`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <h4 className="font-semibold">{title}</h4>
          </div>
          <Badge variant="secondary">{percentage}%</Badge>
        </div>

        <p className="text-2xl font-bold mb-2">
          {amount.toLocaleString()}원
        </p>

        <Progress value={parseFloat(percentage)} className="mb-2 h-2" />

        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="flex items-center gap-1">
            <span className="font-medium">📖 근거:</span> {legalBasis}
          </p>
          <p className="flex items-center gap-1">
            <span className="font-medium">📝 설명:</span> {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
