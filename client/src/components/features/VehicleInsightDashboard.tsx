import { useState, useEffect } from 'react';
import {
  X,
  Car,
  Settings,
  Shield,
  FileText,
  BarChart3,
  Trophy,
  DollarSign,
  Gauge,
  Calendar,
  Fuel,
  Palette,
  MapPin,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Vehicle {
  id: string | number;
  vehicleId?: number;
  manufacturer: string;
  model: string;
  modelYear: number;
  year?: number;
  price: number;
  mileage?: number;
  distance?: number;
  fuelType?: string;
  displacement?: number;
  location?: string;
  // 추가 RDS 필드
  vehicleNo?: string;
  platform?: string;
  origin?: string;
  carType?: string;
  modelGroup?: string;
  grade?: string;
  trim?: string;
  transmission?: string;
  colorName?: string;
  firstRegistrationDate?: number;
  originPrice?: number;
  sellType?: string;
  detailUrl?: string;
  photo?: string;
  hasOptions?: string;
}

interface VehicleInsurance {
  vehicleId: number;
  vehicleNo: string;
  ownerChangeCnt: number | null;
  myAccidentCnt: number | null;
  myAccidentCost: number | null;
  otherAccidentCnt: number | null;
  otherAccidentCost: number | null;
  isDisclosed: number | null;
}

interface VehicleInspection {
  vehicleId: number;
  warrantyType: string | null;
  tuning: string | null;
  changeUsage: string | null;
  recall: string | null;
  recallStatus: string | null;
  accidentHistory: string | null;
  simpleRepair: string | null;
}

interface VehicleInsightDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  className?: string;
}

export default function VehicleInsightDashboard({
  isOpen,
  onClose,
  vehicle,
  className = ''
}: VehicleInsightDashboardProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [fullDetails, setFullDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchFullDetails();
    }
  }, [isOpen, vehicle.id]);

  const fetchFullDetails = async () => {
    setIsLoading(true);
    try {
      const vehicleId = vehicle.vehicleId || vehicle.id;
      const response = await fetch(`/api/vehicles/${vehicleId}/full-details`);
      if (!response.ok) throw new Error('Failed to fetch vehicle details');
      const data = await response.json();
      setFullDetails(data);
    } catch (error) {
      console.error('차량 상세 정보 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // hasOptions 파싱 함수
  const parseOptions = (hasOptions: string | undefined): Record<string, string[]> => {
    if (!hasOptions) return {};

    const categories: Record<string, string[]> = {
      '안전': [],
      '편의': [],
      '외관': [],
      '내장': [],
      '멀티미디어': [],
      '기타': []
    };

    try {
      const optionsList = hasOptions.split(',').map(opt => opt.trim()).filter(Boolean);

      optionsList.forEach(option => {
        // 간단한 카테고리 분류 로직
        if (option.includes('에어백') || option.includes('ABS') || option.includes('안전') || option.includes('경보')) {
          categories['안전'].push(option);
        } else if (option.includes('시트') || option.includes('핸들') || option.includes('편의') || option.includes('스마트키')) {
          categories['편의'].push(option);
        } else if (option.includes('휠') || option.includes('램프') || option.includes('선루프') || option.includes('외관')) {
          categories['외관'].push(option);
        } else if (option.includes('가죽') || option.includes('우드그레인') || option.includes('내장')) {
          categories['내장'].push(option);
        } else if (option.includes('오디오') || option.includes('네비게이션') || option.includes('디스플레이') || option.includes('카메라')) {
          categories['멀티미디어'].push(option);
        } else {
          categories['기타'].push(option);
        }
      });

      // 빈 카테고리 제거
      Object.keys(categories).forEach(key => {
        if (categories[key].length === 0) delete categories[key];
      });

      return categories;
    } catch (e) {
      console.error('옵션 파싱 실패:', e);
      return {};
    }
  };

  // 신호등 인디케이터 컴포넌트
  const StatusIndicator = ({ status }: { status: 'good' | 'warning' | 'danger' }) => {
    const colors = {
      good: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500'
    };
    return <div className={`w-3 h-3 rounded-full ${colors[status]}`} />;
  };

  if (!isOpen) return null;

  const vehicleData = fullDetails?.vehicle || vehicle;
  const insurance = fullDetails?.insurance as VehicleInsurance | null;
  const inspection = fullDetails?.inspection as VehicleInspection | null;
  const optionsByCategory = parseOptions(vehicleData.hasOptions);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-background rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden ${className}`}>

        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                차량 진단 대시보드
              </h2>
              <p className="text-sm text-muted-foreground">
                {vehicleData.manufacturer} {vehicleData.model} ({vehicleData.modelYear || vehicleData.year}년) • 전체 데이터 분석
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-6 p-0 h-auto border-b border-border bg-transparent rounded-none">
            <TabsTrigger
              value="basic"
              className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4"
            >
              <Info className="w-4 h-4" />
              <span className="hidden md:inline">기본정보</span>
            </TabsTrigger>
            <TabsTrigger
              value="options"
              className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">옵션</span>
            </TabsTrigger>
            <TabsTrigger
              value="insurance"
              className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden md:inline">사고이력</span>
            </TabsTrigger>
            <TabsTrigger
              value="inspection"
              className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden md:inline">점검이력</span>
            </TabsTrigger>
            <TabsTrigger
              value="price"
              className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden md:inline">가격분석</span>
            </TabsTrigger>
            <TabsTrigger
              value="overall"
              className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden md:inline">종합평가</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Tab 1: 차량 기본 정보 */}
            <TabsContent value="basic" className="mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 차량 이미지 */}
                  {vehicleData.photo && (
                    <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
                      <img
                        src={vehicleData.photo}
                        alt={`${vehicleData.manufacturer} ${vehicleData.model}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* 기본 스펙 그리드 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoCard icon={<Car />} label="제조사" value={vehicleData.manufacturer} />
                    <InfoCard icon={<Car />} label="모델" value={vehicleData.model} />
                    <InfoCard icon={<Car />} label="모델 그룹" value={vehicleData.modelGroup || '-'} />
                    <InfoCard icon={<Car />} label="등급" value={vehicleData.grade || '-'} />
                    <InfoCard icon={<Car />} label="트림" value={vehicleData.trim || '-'} />
                    <InfoCard icon={<Calendar />} label="연식" value={`${vehicleData.modelYear || vehicleData.year}년`} />
                    <InfoCard icon={<Calendar />} label="최초 등록일" value={vehicleData.firstRegistrationDate ? `${vehicleData.firstRegistrationDate}` : '-'} />
                    <InfoCard icon={<Gauge />} label="주행거리" value={`${((vehicleData.mileage || vehicleData.distance || 0) / 10000).toFixed(1)}만km`} />
                    <InfoCard icon={<DollarSign />} label="가격" value={`${vehicleData.price.toLocaleString()}만원`} />
                    <InfoCard icon={<DollarSign />} label="신차가" value={vehicleData.originPrice ? `${vehicleData.originPrice.toLocaleString()}만원` : '-'} />
                    <InfoCard icon={<Fuel />} label="연료" value={vehicleData.fuelType || '-'} />
                    <InfoCard icon={<Settings />} label="배기량" value={vehicleData.displacement ? `${vehicleData.displacement}cc` : '-'} />
                    <InfoCard icon={<Settings />} label="변속기" value={vehicleData.transmission || '-'} />
                    <InfoCard icon={<Palette />} label="색상" value={vehicleData.colorName || '-'} />
                    <InfoCard icon={<MapPin />} label="지역" value={vehicleData.location || '-'} />
                    <InfoCard icon={<Car />} label="판매 유형" value={vehicleData.sellType || '-'} />
                    <InfoCard icon={<Car />} label="차종" value={vehicleData.carType || '-'} />
                    <InfoCard icon={<Car />} label="플랫폼" value={vehicleData.platform || '-'} />
                    <InfoCard icon={<Car />} label="원산지" value={vehicleData.origin || '-'} />
                    <InfoCard icon={<Car />} label="차량번호" value={vehicleData.vehicleNo || '-'} />
                  </div>

                  {/* 상세 페이지 링크 */}
                  {vehicleData.detailUrl && (
                    <a
                      href={vehicleData.detailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <span>원본 매물 상세 페이지 보기</span>
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Tab 2: 옵션 분석 */}
            <TabsContent value="options" className="mt-0">
              <div className="space-y-6">
                {Object.keys(optionsByCategory).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>등록된 옵션 정보가 없습니다</p>
                  </div>
                ) : (
                  <>
                    {/* 옵션 요약 */}
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        옵션 요약
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {Object.values(optionsByCategory).flat().length}개
                          </div>
                          <div className="text-sm text-muted-foreground">전체 옵션</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {Object.keys(optionsByCategory).length}개
                          </div>
                          <div className="text-sm text-muted-foreground">카테고리</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {optionsByCategory['안전']?.length || 0}개
                          </div>
                          <div className="text-sm text-muted-foreground">안전 옵션</div>
                        </div>
                      </div>
                    </div>

                    {/* 카테고리별 옵션 */}
                    {Object.entries(optionsByCategory).map(([category, options]) => (
                      <div key={category} className="p-4 bg-background border border-border rounded-lg">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <ChevronRight className="w-4 h-4" />
                          {category} ({options.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-foreground">{option}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </TabsContent>

            {/* Tab 3: 사고/보험 이력 */}
            <TabsContent value="insurance" className="mt-0">
              <div className="space-y-6">
                {!insurance ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>보험 이력 정보가 없습니다</p>
                  </div>
                ) : (
                  <>
                    {/* 결론 우선: 종합 평가 */}
                    <div className={`p-4 rounded-lg border ${
                      (insurance.myAccidentCnt || 0) === 0 && (insurance.otherAccidentCnt || 0) === 0
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                        : (insurance.myAccidentCnt || 0) > 2 || (insurance.otherAccidentCnt || 0) > 2
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIndicator
                          status={
                            (insurance.myAccidentCnt || 0) === 0 && (insurance.otherAccidentCnt || 0) === 0
                              ? 'good'
                              : (insurance.myAccidentCnt || 0) > 2 || (insurance.otherAccidentCnt || 0) > 2
                              ? 'danger'
                              : 'warning'
                          }
                        />
                        <h3 className="font-semibold text-foreground">
                          {(insurance.myAccidentCnt || 0) === 0 && (insurance.otherAccidentCnt || 0) === 0
                            ? '✅ 무사고 차량'
                            : (insurance.myAccidentCnt || 0) > 2 || (insurance.otherAccidentCnt || 0) > 2
                            ? '⚠️ 사고 이력 많음 - 신중한 검토 필요'
                            : '⚡ 경미한 사고 이력 있음'
                          }
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(insurance.myAccidentCnt || 0) === 0 && (insurance.otherAccidentCnt || 0) === 0
                          ? '내차/상대차 피해 이력 모두 없는 깨끗한 차량입니다.'
                          : `내차 피해 ${insurance.myAccidentCnt || 0}회, 상대차 피해 ${insurance.otherAccidentCnt || 0}회 기록됨`
                        }
                      </p>
                    </div>

                    {/* 상세 데이터 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-background border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-muted-foreground">소유자 변경 횟수</span>
                          <span className="text-lg font-bold text-foreground">
                            {insurance.ownerChangeCnt !== null ? `${insurance.ownerChangeCnt}회` : '-'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(insurance.ownerChangeCnt || 0) === 0
                            ? '🟢 최초 소유자 (1인 소유)'
                            : (insurance.ownerChangeCnt || 0) === 1
                            ? '🟡 2인 소유 (보통)'
                            : '🔴 다수 소유 (주의)'
                          }
                        </div>
                      </div>

                      <div className="p-4 bg-background border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-muted-foreground">내차 피해 사고</span>
                          <span className="text-lg font-bold text-foreground">
                            {insurance.myAccidentCnt !== null ? `${insurance.myAccidentCnt}회` : '-'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          피해 금액: {insurance.myAccidentCost !== null ? `${(insurance.myAccidentCost / 10000).toFixed(0)}만원` : '-'}
                        </div>
                      </div>

                      <div className="p-4 bg-background border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-muted-foreground">상대차 피해 사고</span>
                          <span className="text-lg font-bold text-foreground">
                            {insurance.otherAccidentCnt !== null ? `${insurance.otherAccidentCnt}회` : '-'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          피해 금액: {insurance.otherAccidentCost !== null ? `${(insurance.otherAccidentCost / 10000).toFixed(0)}만원` : '-'}
                        </div>
                      </div>

                      <div className="p-4 bg-background border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-muted-foreground">정보 공개 여부</span>
                          <span className="text-lg font-bold text-foreground">
                            {insurance.isDisclosed === 1 ? '✅ 공개' : insurance.isDisclosed === 0 ? '⚠️ 비공개' : '-'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {insurance.isDisclosed === 1
                            ? '모든 사고 이력이 공개되었습니다'
                            : '일부 정보가 비공개 상태입니다'
                          }
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Tab 4: 점검/관리 이력 */}
            <TabsContent value="inspection" className="mt-0">
              <div className="space-y-6">
                {!inspection ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>점검 이력 정보가 없습니다</p>
                  </div>
                ) : (
                  <>
                    {/* 결론 우선: 종합 평가 */}
                    <div className={`p-4 rounded-lg border ${
                      inspection.accidentHistory === '없음' && inspection.recall === '없음' && inspection.tuning === '없음'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                        : inspection.accidentHistory === '있음' || inspection.recall === '있음'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIndicator
                          status={
                            inspection.accidentHistory === '없음' && inspection.recall === '없음'
                              ? 'good'
                              : inspection.accidentHistory === '있음'
                              ? 'danger'
                              : 'warning'
                          }
                        />
                        <h3 className="font-semibold text-foreground">
                          {inspection.accidentHistory === '없음' && inspection.recall === '없음'
                            ? '✅ 이상 없음 - 정상 차량'
                            : inspection.accidentHistory === '있음'
                            ? '⚠️ 사고 이력 확인됨'
                            : '⚡ 일부 점검 항목 있음'
                          }
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {inspection.accidentHistory === '없음'
                          ? '사고 이력, 리콜, 튜닝 모두 없는 깨끗한 상태입니다.'
                          : '아래 상세 항목을 확인해주세요.'
                        }
                      </p>
                    </div>

                    {/* 상세 데이터 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InspectionCard
                        label="보증 유형"
                        value={inspection.warrantyType || '-'}
                        icon={<Shield />}
                      />
                      <InspectionCard
                        label="튜닝 여부"
                        value={inspection.tuning || '-'}
                        icon={<Settings />}
                        status={inspection.tuning === '있음' ? 'warning' : 'good'}
                      />
                      <InspectionCard
                        label="용도 변경"
                        value={inspection.changeUsage || '-'}
                        icon={<FileText />}
                        status={inspection.changeUsage === '있음' ? 'warning' : 'good'}
                      />
                      <InspectionCard
                        label="리콜"
                        value={inspection.recall || '-'}
                        icon={<AlertTriangle />}
                        status={inspection.recall === '있음' ? 'warning' : 'good'}
                      />
                      <InspectionCard
                        label="리콜 조치 상태"
                        value={inspection.recallStatus || '-'}
                        icon={<CheckCircle />}
                        status={inspection.recallStatus === '완료' ? 'good' : inspection.recallStatus === '미완료' ? 'danger' : undefined}
                      />
                      <InspectionCard
                        label="사고 이력"
                        value={inspection.accidentHistory || '-'}
                        icon={<AlertCircle />}
                        status={inspection.accidentHistory === '있음' ? 'danger' : 'good'}
                      />
                      <InspectionCard
                        label="단순 수리"
                        value={inspection.simpleRepair || '-'}
                        icon={<Settings />}
                      />
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Tab 5: 가격 분석 */}
            <TabsContent value="price" className="mt-0">
              <div className="space-y-6">
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>가격 분석 기능 준비 중입니다</p>
                  <p className="text-sm mt-2">동급 차량 비교 Box Plot이 추가될 예정입니다</p>
                </div>
              </div>
            </TabsContent>

            {/* Tab 6: 종합 평가 (일반인 친화적) */}
            <TabsContent value="overall" className="mt-0">
              <div className="space-y-6">
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>종합 평가 기능 준비 중입니다</p>
                  <p className="text-sm mt-2">TOPSIS 결과를 일반인 친화적 언어로 변환한 평가가 추가될 예정입니다</p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

// 보조 컴포넌트
function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-1">
        <div className="text-muted-foreground">{icon}</div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="font-medium text-foreground">{value}</div>
    </div>
  );
}

function InspectionCard({
  label,
  value,
  icon,
  status
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  status?: 'good' | 'warning' | 'danger';
}) {
  return (
    <div className="p-4 bg-background border border-border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        {status && (
          <div className={`w-2 h-2 rounded-full ${
            status === 'good' ? 'bg-green-500' :
            status === 'warning' ? 'bg-yellow-500' :
            'bg-red-500'
          }`} />
        )}
      </div>
      <div className="font-semibold text-foreground">{value}</div>
    </div>
  );
}
