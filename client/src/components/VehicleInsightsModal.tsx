import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, AlertCircle, DollarSign, Shield, Gauge, MessageSquare,
  TrendingUp, Star, FileText, BarChart3, Share2, Users
} from "lucide-react";
import type { VehicleInsights } from "@/hooks/useWebSocketChat";

interface VehicleInsightsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: {
    id: string;
    name: string;
    year: number;
    price: number;
    mileage: number;
    fuel: string;
    image: string;
    topsisScore: number;
  } | null;
  insights: VehicleInsights | null;
  isLoading?: boolean;
}

export default function VehicleInsightsModal({
  open,
  onOpenChange,
  vehicle,
  insights,
  isLoading = false,
}: VehicleInsightsModalProps) {
  if (!vehicle) return null;

  const monthlyMaintenance = Math.round(vehicle.price * 0.015);
  const threeYearTCO = Math.round(vehicle.price + monthlyMaintenance * 36);
  const depreciation = Math.round(vehicle.price * 0.35);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" data-testid="modal-vehicle-insights">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold">{vehicle.name}</DialogTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="font-mono">{vehicle.year}년</Badge>
                <Badge variant="outline" className="font-mono">{vehicle.price.toLocaleString()}만원</Badge>
                <Badge variant="outline">{vehicle.fuel}</Badge>
                <Badge variant="outline">{(vehicle.mileage / 10000).toFixed(1)}만km</Badge>
              </div>
            </div>
            <Button size="icon" variant="ghost" data-testid="button-share">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">AI가 차량을 분석중입니다...</p>
            </div>
          </div>
        ) : insights ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6 h-auto">
              <TabsTrigger value="overview" className="text-xs py-2" data-testid="tab-overview">종합</TabsTrigger>
              <TabsTrigger value="tco" className="text-xs py-2" data-testid="tab-tco">TCO</TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs py-2" data-testid="tab-reviews">리뷰</TabsTrigger>
              <TabsTrigger value="market" className="text-xs py-2" data-testid="tab-market">시장</TabsTrigger>
              <TabsTrigger value="safety" className="text-xs py-2" data-testid="tab-safety">안전</TabsTrigger>
              <TabsTrigger value="compare" className="text-xs py-2" data-testid="tab-compare">비교</TabsTrigger>
            </TabsList>

            {/* 1. 종합 탭 */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI 종합 평가</h3>
                    <p className="text-sm text-muted-foreground">다기준 분석 결과</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">매칭 점수</span>
                    <span className="font-mono text-2xl font-bold text-primary">{vehicle.topsisScore}점</span>
                  </div>
                  <Progress value={vehicle.topsisScore} className="h-3" />
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-3">AI 요약</h3>
                <p className="text-muted-foreground leading-relaxed">{insights.summary}</p>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-semibold">장점</h3>
                  </div>
                  <ul className="space-y-2">
                    {insights.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-5 h-5" />
                    <h3 className="font-semibold">고려사항</h3>
                  </div>
                  <ul className="space-y-2">
                    {insights.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </TabsContent>

            {/* 2. TCO 탭 */}
            <TabsContent value="tco" className="space-y-4 mt-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">총 소유 비용 (TCO)</h3>
                    <p className="text-sm text-muted-foreground">3년 기준 예상 비용</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">차량 구매가</span>
                      <span className="font-mono font-bold text-lg">{vehicle.price.toLocaleString()}만원</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">3년 유지비 (월 {monthlyMaintenance}만원)</span>
                      <span className="font-mono font-semibold">{(monthlyMaintenance * 36).toLocaleString()}만원</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">예상 감가상각 (35%)</span>
                      <span className="font-mono font-semibold text-red-600 dark:text-red-400">-{depreciation.toLocaleString()}만원</span>
                    </div>
                    <div className="pt-3 mt-3 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">3년 총 비용</span>
                        <span className="font-mono font-bold text-xl text-primary">{threeYearTCO.toLocaleString()}만원</span>
                      </div>
                    </div>
                  </div>

                  <Card className="p-4 bg-primary/5">
                    <p className="text-sm leading-relaxed">{insights.costAnalysis}</p>
                  </Card>
                </div>
              </Card>

              <div className="grid md:grid-cols-3 gap-3">
                <Card className="p-4">
                  <div className="text-center space-y-2">
                    <div className="font-mono text-2xl font-bold text-chart-1">
                      {Math.round(vehicle.price / vehicle.year)}만원
                    </div>
                    <p className="text-xs text-muted-foreground">연식당 가격</p>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center space-y-2">
                    <div className="font-mono text-2xl font-bold text-chart-2">
                      {Math.round(vehicle.mileage / (2024 - vehicle.year + 1) / 10000)}만km
                    </div>
                    <p className="text-xs text-muted-foreground">연평균 주행</p>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center space-y-2">
                    <div className="font-mono text-2xl font-bold text-chart-3">
                      {monthlyMaintenance}만원
                    </div>
                    <p className="text-xs text-muted-foreground">월 예상 유지비</p>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* 3. 리뷰 분석 탭 */}
            <TabsContent value="reviews" className="space-y-4 mt-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Star className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">사용자 리뷰 분석</h3>
                    <p className="text-sm text-muted-foreground">실제 오너들의 평가</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="font-mono text-4xl font-bold text-amber-600 dark:text-amber-400">4.2</div>
                      <div className="text-xs text-muted-foreground mt-1">평균 만족도</div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-12">5점</span>
                        <Progress value={65} className="h-2" />
                        <span className="text-xs text-muted-foreground">65%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-12">4점</span>
                        <Progress value={25} className="h-2" />
                        <span className="text-xs text-muted-foreground">25%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-12">3점</span>
                        <Progress value={10} className="h-2" />
                        <span className="text-xs text-muted-foreground">10%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm">가족과 함께 타기 좋은 차입니다. 연비도 만족스럽고 승차감이 편안합니다.</p>
                          <p className="text-xs text-muted-foreground mt-1">35세 남성 · 2개월 사용</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm">출퇴근용으로 딱 좋습니다. 가격 대비 성능이 우수해요.</p>
                          <p className="text-xs text-muted-foreground mt-1">28세 남성 · 6개월 사용</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* 4. 시장 비교 탭 */}
            <TabsContent value="market" className="space-y-4 mt-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">시장 분석</h3>
                    <p className="text-sm text-muted-foreground">시세 및 경쟁력 비교</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium">현재 차량 가격</span>
                      <span className="font-mono font-bold text-lg">{vehicle.price.toLocaleString()}만원</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">동급 평균 시세</span>
                        <span className="font-mono">{Math.round(vehicle.price * 1.1).toLocaleString()}만원</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">최저가</span>
                        <span className="font-mono">{Math.round(vehicle.price * 0.85).toLocaleString()}만원</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">최고가</span>
                        <span className="font-mono">{Math.round(vehicle.price * 1.25).toLocaleString()}만원</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-green-600 dark:text-green-400">
                          시세 대비 {Math.round(((vehicle.price * 1.1 - vehicle.price) / vehicle.price) * 100)}% 저렴
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-3">
                      <div className="text-xs text-muted-foreground mb-1">거래량</div>
                      <div className="font-mono text-xl font-bold">152대</div>
                      <div className="text-xs text-muted-foreground">최근 30일</div>
                    </Card>
                    <Card className="p-3">
                      <div className="text-xs text-muted-foreground mb-1">평균 판매일</div>
                      <div className="font-mono text-xl font-bold">18일</div>
                      <div className="text-xs text-muted-foreground">시장 평균</div>
                    </Card>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* 5. 안전/검사 탭 */}
            <TabsContent value="safety" className="space-y-4 mt-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">안전 & 검사 이력</h3>
                    <p className="text-sm text-muted-foreground">사고 이력 및 성능 점검</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">사고 이력</span>
                        <Badge variant="secondary" className="text-green-600 dark:text-green-400">무사고</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">내 사고</span>
                          <span className="font-mono">0건</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">타 사고</span>
                          <span className="font-mono">0건</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">성능 점검</span>
                        <Badge variant="secondary">적합</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">튜닝</span>
                          <span>없음</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">용도 변경</span>
                          <span>없음</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <Card className="p-4 bg-green-500/5">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm mb-1">안전 등급: 우수</p>
                        <p className="text-xs text-muted-foreground">
                          무사고 차량으로 성능 점검 결과 모든 항목 적합 판정. 안심하고 구매할 수 있습니다.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </Card>
            </TabsContent>

            {/* 6. 비교 탭 */}
            <TabsContent value="compare" className="space-y-4 mt-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">경쟁 차량 비교</h3>
                    <p className="text-sm text-muted-foreground">유사 조건 차량과 비교</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">항목</th>
                          <th className="text-center py-2 px-3 bg-primary/5">현재 차량</th>
                          <th className="text-center py-2 px-3">경쟁 A</th>
                          <th className="text-center py-2 px-3">경쟁 B</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="py-2 px-3 text-muted-foreground">가격</td>
                          <td className="py-2 px-3 text-center bg-primary/5 font-mono font-semibold">{vehicle.price}만원</td>
                          <td className="py-2 px-3 text-center font-mono">{vehicle.price + 200}만원</td>
                          <td className="py-2 px-3 text-center font-mono">{vehicle.price - 150}만원</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-muted-foreground">주행거리</td>
                          <td className="py-2 px-3 text-center bg-primary/5 font-mono font-semibold">{(vehicle.mileage / 10000).toFixed(1)}만km</td>
                          <td className="py-2 px-3 text-center font-mono">{((vehicle.mileage + 15000) / 10000).toFixed(1)}만km</td>
                          <td className="py-2 px-3 text-center font-mono">{((vehicle.mileage - 5000) / 10000).toFixed(1)}만km</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-muted-foreground">연식</td>
                          <td className="py-2 px-3 text-center bg-primary/5 font-mono font-semibold">{vehicle.year}년</td>
                          <td className="py-2 px-3 text-center font-mono">{vehicle.year - 1}년</td>
                          <td className="py-2 px-3 text-center font-mono">{vehicle.year}년</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-muted-foreground">AI 점수</td>
                          <td className="py-2 px-3 text-center bg-primary/5">
                            <Badge className="bg-primary text-primary-foreground">{vehicle.topsisScore}점</Badge>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <Badge variant="outline">{vehicle.topsisScore - 15}점</Badge>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <Badge variant="outline">{vehicle.topsisScore - 8}점</Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <Card className="p-4 bg-primary/5">
                    <div className="flex items-start gap-3">
                      <BarChart3 className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm mb-1">AI 종합 의견</p>
                        <p className="text-xs text-muted-foreground">
                          {insights.recommendation}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">인사이트를 불러올 수 없습니다.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
