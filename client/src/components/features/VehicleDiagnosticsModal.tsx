import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  AlertCircle,
  Info,
  Shield,
  FileText,
  Database,
  Car,
  Wrench,
  DollarSign,
  Calendar,
  Award,
  XCircle
} from "lucide-react";
import { useState, useEffect } from "react";

interface VehicleDiagnosticsData {
  vehicle: {
    vehicleId: number;
    manufacturer: string;
    model: string;
    modelYear: number;
    price: number;
    distance: number;
    fuelType: string;
    location: string;
  };
  insurance: {
    my_accident_cnt: number;
    other_accident_cnt: number;
    my_accident_cost: number;
    other_accident_cost: number;
    total_accident_cnt: number;
    owner_change_cnt: number;
    car_no_change_cnt: number;
    government: boolean;
    business: boolean;
    rental: boolean;
    loan: boolean;
  } | null;
  inspection: {
    inspected_at: string;
    mileage_at_inspect: number;
    accident_history: boolean;
    simple_repair: boolean;
    waterlog: boolean;
    fire_history: boolean;
    tuning_exist: boolean;
    engine_check_ok: boolean;
    trans_check_ok: boolean;
    guaranty_type: string;
  } | null;
  options: string[];
}

interface VehicleDiagnosticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId: string | number | null;
  vehicleName: string;
}

export default function VehicleDiagnosticsModal({
  open,
  onOpenChange,
  vehicleId,
  vehicleName
}: VehicleDiagnosticsModalProps) {
  const [data, setData] = useState<VehicleDiagnosticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && vehicleId) {
      fetchDiagnostics();
    }
  }, [open, vehicleId]);

  const fetchDiagnostics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/full-details`);

      if (!response.ok) {
        throw new Error('Failed to fetch diagnostics');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('진단 데이터 조회 실패:', err);
      setError('차량 진단 데이터를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl">🔍 차량 진단 보고서</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{vehicleName}</p>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">실구매 데이터 조회 중...</p>
              <p className="text-sm text-muted-foreground">
                AWS RDS에서 보험 이력, 점검 이력, 옵션 정보를 가져오고 있습니다
              </p>
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : data ? (
          <div className="space-y-6">
            {/* 🎯 핵심 메시지 - 실구매 데이터 강조 */}
            <Alert className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-primary">
              <Database className="w-5 h-5 text-primary" />
              <AlertDescription className="text-base">
                <strong className="text-primary">💡 실구매 데이터 검증 완료</strong>
                <br />
                아래 모든 정보는 <strong>겟차 실구매 데이터(AWS RDS)</strong>에서 실시간으로 조회한
                실제 보험 이력, 점검 이력, 장착 옵션입니다. 일반 중고차 사이트에서는 제공하지 않는 투명한 정보입니다.
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">📊 종합</TabsTrigger>
                <TabsTrigger value="insurance">
                  🛡️ 보험 이력 {data.insurance && `(${data.insurance.total_accident_cnt}건)`}
                </TabsTrigger>
                <TabsTrigger value="inspection">
                  🔧 점검 이력
                </TabsTrigger>
                <TabsTrigger value="options">
                  ⚙️ 옵션 ({data.options.length}개)
                </TabsTrigger>
              </TabsList>

              {/* 종합 탭 */}
              <TabsContent value="summary" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 보험 이력 요약 */}
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">보험 이력</h3>
                        <p className="text-xs text-muted-foreground">실구매 데이터</p>
                      </div>
                    </div>
                    {data.insurance ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">총 사고:</span>
                          <Badge variant={data.insurance.total_accident_cnt === 0 ? "outline" : "destructive"}>
                            {data.insurance.total_accident_cnt}건
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">소유권 변경:</span>
                          <Badge variant="outline">{data.insurance.owner_change_cnt}회</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">사업용:</span>
                          {data.insurance.business ?
                            <XCircle className="w-5 h-5 text-red-500" /> :
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          }
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">보험 이력 없음</p>
                    )}
                  </Card>

                  {/* 점검 이력 요약 */}
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Wrench className="w-8 h-8 text-green-600" />
                      <div>
                        <h3 className="font-semibold">점검 이력</h3>
                        <p className="text-xs text-muted-foreground">최근 점검</p>
                      </div>
                    </div>
                    {data.inspection ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">엔진 상태:</span>
                          {data.inspection.engine_check_ok ?
                            <CheckCircle className="w-5 h-5 text-green-500" /> :
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          }
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">변속기 상태:</span>
                          {data.inspection.trans_check_ok ?
                            <CheckCircle className="w-5 h-5 text-green-500" /> :
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          }
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">침수 이력:</span>
                          {!data.inspection.waterlog ?
                            <CheckCircle className="w-5 h-5 text-green-500" /> :
                            <XCircle className="w-5 h-5 text-red-500" />
                          }
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">점검 이력 없음</p>
                    )}
                  </Card>

                  {/* 옵션 요약 */}
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Car className="w-8 h-8 text-purple-600" />
                      <div>
                        <h3 className="font-semibold">장착 옵션</h3>
                        <p className="text-xs text-muted-foreground">실제 장착</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">총 옵션:</span>
                        <Badge className="bg-purple-600">{data.options.length}개</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        네비게이션, 후방카메라, 썬루프 등 실제 장착된 옵션을 확인하세요
                      </p>
                    </div>
                  </Card>
                </div>

                {/* 신뢰도 점수 */}
                <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-lg">신뢰도 평가</h3>
                      <p className="text-sm text-muted-foreground">실구매 데이터 기반</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {data.insurance && data.insurance.total_accident_cnt === 0 ? '✅' : '⚠️'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">무사고</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {data.inspection && data.inspection.engine_check_ok ? '✅' : '⚠️'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">엔진 정상</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {data.inspection && !data.inspection.waterlog ? '✅' : '⚠️'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">침수 없음</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {data.options.length >= 10 ? '✅' : '⚠️'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">풀옵션</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* 보험 이력 상세 탭 */}
              <TabsContent value="insurance" className="space-y-4 mt-4">
                {data.insurance ? (
                  <>
                    <Card className="p-6">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        사고 이력 상세
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <span className="text-sm font-medium">내차 피해 횟수:</span>
                            <Badge variant={data.insurance.my_accident_cnt === 0 ? "outline" : "destructive"}>
                              {data.insurance.my_accident_cnt}회
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <span className="text-sm font-medium">내차 피해 금액:</span>
                            <span className="font-mono text-lg font-bold">
                              {data.insurance.my_accident_cost?.toLocaleString() || 0}원
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <span className="text-sm font-medium">상대차 피해 횟수:</span>
                            <Badge variant={data.insurance.other_accident_cnt === 0 ? "outline" : "destructive"}>
                              {data.insurance.other_accident_cnt}회
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <span className="text-sm font-medium">상대차 피해 금액:</span>
                            <span className="font-mono text-lg font-bold">
                              {data.insurance.other_accident_cost?.toLocaleString() || 0}원
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h3 className="font-semibold text-lg mb-4">소유 이력</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <span className="text-sm font-medium">소유권 변경:</span>
                          <Badge>{data.insurance.owner_change_cnt}회</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <span className="text-sm font-medium">차량번호 변경:</span>
                          <Badge>{data.insurance.car_no_change_cnt}회</Badge>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h3 className="font-semibold text-lg mb-4">특수 이력</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                          {data.insurance.government ?
                            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" /> :
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          }
                          <p className="text-sm font-medium">관용차</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          {data.insurance.business ?
                            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" /> :
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          }
                          <p className="text-sm font-medium">영업용</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          {data.insurance.rental ?
                            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" /> :
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          }
                          <p className="text-sm font-medium">렌터카</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          {data.insurance.loan ?
                            <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" /> :
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          }
                          <p className="text-sm font-medium">담보</p>
                        </div>
                      </div>
                    </Card>
                  </>
                ) : (
                  <Alert>
                    <Info className="w-4 h-4" />
                    <AlertDescription>보험 이력 데이터가 없습니다.</AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {/* 점검 이력 상세 탭 */}
              <TabsContent value="inspection" className="space-y-4 mt-4">
                {data.inspection ? (
                  <>
                    <Card className="p-6">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        최근 점검 정보
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <span className="text-sm font-medium">점검일:</span>
                          <span className="font-mono">
                            {new Date(data.inspection.inspected_at).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <span className="text-sm font-medium">점검 시 주행거리:</span>
                          <span className="font-mono">
                            {(data.inspection.mileage_at_inspect / 10000).toFixed(1)}만km
                          </span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h3 className="font-semibold text-lg mb-4">주요 부품 상태</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <span className="text-sm font-medium">엔진 상태:</span>
                          <div className="flex items-center gap-2">
                            {data.inspection.engine_check_ok ? (
                              <>
                                <CheckCircle className="w-6 h-6 text-green-500" />
                                <Badge className="bg-green-600">정상</Badge>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-6 h-6 text-red-500" />
                                <Badge variant="destructive">점검 필요</Badge>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <span className="text-sm font-medium">변속기 상태:</span>
                          <div className="flex items-center gap-2">
                            {data.inspection.trans_check_ok ? (
                              <>
                                <CheckCircle className="w-6 h-6 text-green-500" />
                                <Badge className="bg-green-600">정상</Badge>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-6 h-6 text-red-500" />
                                <Badge variant="destructive">점검 필요</Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h3 className="font-semibold text-lg mb-4">사고/특이사항</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                          {!data.inspection.accident_history ?
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" /> :
                            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                          }
                          <p className="text-sm font-medium">사고 이력</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          {!data.inspection.waterlog ?
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" /> :
                            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                          }
                          <p className="text-sm font-medium">침수</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          {!data.inspection.fire_history ?
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" /> :
                            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                          }
                          <p className="text-sm font-medium">화재</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          {!data.inspection.tuning_exist ?
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" /> :
                            <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                          }
                          <p className="text-sm font-medium">튜닝</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h3 className="font-semibold text-lg mb-4">보증 정보</h3>
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">보증 유형:</span>
                          <Badge className="bg-blue-600">{data.inspection.guaranty_type || '정보 없음'}</Badge>
                        </div>
                      </div>
                    </Card>
                  </>
                ) : (
                  <Alert>
                    <Info className="w-4 h-4" />
                    <AlertDescription>점검 이력 데이터가 없습니다.</AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {/* 옵션 탭 */}
              <TabsContent value="options" className="space-y-4 mt-4">
                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4">
                    실제 장착 옵션 ({data.options.length}개)
                  </h3>
                  {data.options.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {data.options.map((option, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="p-3 justify-center text-center hover:bg-primary hover:text-white transition-colors"
                        >
                          {option}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <Info className="w-4 h-4" />
                      <AlertDescription>장착 옵션 정보가 없습니다.</AlertDescription>
                    </Alert>
                  )}
                </Card>

                {data.options.length > 0 && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-blue-900">
                      💡 <strong>실구매 데이터 검증</strong>: 위 옵션들은 실제 차량에 장착된 옵션입니다.
                      겟차 데이터베이스에 등록된 정확한 정보로, 판매자의 주관적인 설명이 아닙니다.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
