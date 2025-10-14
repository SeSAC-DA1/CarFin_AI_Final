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

  // 🐛 Fix: API가 options를 별도 배열로 반환하므로 문자열로 변환
  const optionsString = fullDetails?.options
    ? fullDetails.options.join(', ')
    : vehicleData.hasOptions;
  const optionsByCategory = parseOptions(optionsString);

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
                차량 상세분석
              </h2>
              <p className="text-sm text-muted-foreground">
                {vehicleData.manufacturer} {vehicleData.model} ({vehicleData.modelYear || vehicleData.year}년) • 6가지 평가 기준 + 실구매 데이터 분석
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 가격 비교 카드 */}
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      가격 경쟁력
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white/80 rounded-lg">
                        <span className="text-sm text-slate-700 font-medium">판매가</span>
                        <span className="text-xl font-bold text-slate-900">{vehicleData.price.toLocaleString()}만원</span>
                      </div>
                      {vehicleData.originPrice && (
                        <>
                          <div className="flex justify-between items-center p-3 bg-white/80 rounded-lg">
                            <span className="text-sm text-slate-700 font-medium">신차가</span>
                            <span className="text-lg font-semibold text-slate-800">{vehicleData.originPrice.toLocaleString()}만원</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border border-green-300">
                            <span className="text-sm text-green-800 font-semibold">할인율</span>
                            <span className="text-2xl font-bold text-green-700">
                              {(((vehicleData.originPrice - vehicleData.price) / vehicleData.originPrice) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* TCO 요약 카드 */}
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      주행거리 대비 가격
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white/80 rounded-lg">
                        <span className="text-sm text-slate-700 font-medium">주행거리</span>
                        <span className="text-lg font-semibold text-slate-800">
                          {((vehicleData.mileage || vehicleData.distance || 0) / 10000).toFixed(1)}만km
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/80 rounded-lg">
                        <span className="text-sm text-slate-700 font-medium">1만km당 가격</span>
                        <span className="text-lg font-semibold text-slate-800">
                          {(vehicleData.price / ((vehicleData.mileage || vehicleData.distance || 1) / 10000)).toFixed(0).toLocaleString()}만원
                        </span>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-lg border border-purple-300">
                        <p className="text-sm text-purple-800 font-medium text-center">
                          {((vehicleData.mileage || vehicleData.distance || 0) / 10000) < 5 ? '✅ 저주행' :
                           ((vehicleData.mileage || vehicleData.distance || 0) / 10000) < 10 ? '⚠️ 보통' : '❌ 고주행'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TCO 정보 (있을 경우) */}
                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-amber-600" />
                    가격 분석 안내
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    • <strong className="text-slate-900">할인율</strong>: 신차가 대비 현재 판매가의 할인 비율입니다.
                    <br />
                    • <strong className="text-slate-900">1만km당 가격</strong>: 주행거리 대비 가격 효율성을 나타냅니다.
                    <br />
                    • 총 소유비용(TCO) 상세 분석은 추천 결과의 <strong className="text-amber-700">TCO 비교 차트</strong>에서 확인하실 수 있습니다.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Tab 6: 종합 평가 (일반인 친화적) */}
            <TabsContent value="overall" className="mt-0">
              <div className="space-y-6">
                {/* 종합 점수 */}
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-300">
                  <div className="text-center">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">종합 평가</h3>
                    <p className="text-sm text-slate-700">6가지 기준 다기준 분석 (TOPSIS)</p>
                  </div>
                </div>

                {/* 6가지 평가 기준 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      가격 경쟁력
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${vehicleData.originPrice
                              ? Math.min(((vehicleData.originPrice - vehicleData.price) / vehicleData.originPrice) * 100, 100)
                              : 75
                            }%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-blue-600">
                        {vehicleData.originPrice
                          ? `${(((vehicleData.originPrice - vehicleData.price) / vehicleData.originPrice) * 100).toFixed(0)}점`
                          : '75점'
                        }
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border-2 border-green-200">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Fuel className="w-5 h-5 text-green-600" />
                      연비 효율성
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${
                              vehicleData.fuelType === '하이브리드' || vehicleData.fuelType === '전기' ? 95 :
                              vehicleData.fuelType === '디젤' ? 80 :
                              vehicleData.fuelType === 'LPG' ? 75 : 60
                            }%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        {vehicleData.fuelType === '하이브리드' || vehicleData.fuelType === '전기' ? '95점' :
                         vehicleData.fuelType === '디젤' ? '80점' :
                         vehicleData.fuelType === 'LPG' ? '75점' : '60점'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border-2 border-red-200">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-600" />
                      안전성
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{
                            width: `${insurance && insurance.myAccidentCnt === 0 ? 100 : insurance && insurance.myAccidentCnt && insurance.myAccidentCnt < 2 ? 70 : 50}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-red-600">
                        {insurance && insurance.myAccidentCnt === 0 ? '100점' : insurance && insurance.myAccidentCnt && insurance.myAccidentCnt < 2 ? '70점' : '50점'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border-2 border-purple-200">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Car className="w-5 h-5 text-purple-600" />
                      브랜드 신뢰도
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{
                            width: `${
                              ['현대', '기아', '제네시스', 'BMW', '벤츠', '아우디'].includes(vehicleData.manufacturer) ? 90 :
                              ['쌍용', '르노', '쉐보레'].includes(vehicleData.manufacturer) ? 65 : 75
                            }%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-purple-600">
                        {['현대', '기아', '제네시스', 'BMW', '벤츠', '아우디'].includes(vehicleData.manufacturer) ? '90점' :
                         ['쌍용', '르노', '쉐보레'].includes(vehicleData.manufacturer) ? '65점' : '75점'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border-2 border-amber-200">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-amber-600" />
                      차량 상태
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-amber-600 h-2 rounded-full"
                          style={{
                            width: `${
                              ((vehicleData.mileage || vehicleData.distance || 0) / 10000) < 5 ? 90 :
                              ((vehicleData.mileage || vehicleData.distance || 0) / 10000) < 10 ? 70 : 50
                            }%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-amber-600">
                        {((vehicleData.mileage || vehicleData.distance || 0) / 10000) < 5 ? '90점' :
                         ((vehicleData.mileage || vehicleData.distance || 0) / 10000) < 10 ? '70점' : '50점'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border-2 border-cyan-200">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-cyan-600" />
                      옵션 매칭률
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-cyan-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min((Object.values(optionsByCategory).flat().length / 20) * 100, 100)}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-cyan-600">
                        {Math.min(Math.round((Object.values(optionsByCategory).flat().length / 20) * 100), 100)}점
                      </span>
                    </div>
                  </div>
                </div>

                {/* 강점과 약점 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-green-50 rounded-lg border-2 border-green-200">
                    <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      주요 강점
                    </h4>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>{insurance && insurance.myAccidentCnt === 0 ? '무사고 차량으로 안전성 우수' : '검증된 차량 이력'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>{vehicleData.fuelType === '하이브리드' || vehicleData.fuelType === '전기' ? '친환경 연료로 연비 효율 우수' : `${vehicleData.fuelType || '가솔린'} 연료 사용`}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>{Object.values(optionsByCategory).flat().length}개 옵션 장착으로 편의성 우수</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-6 bg-orange-50 rounded-lg border-2 border-orange-200">
                    <h4 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      확인 필요
                    </h4>
                    <ul className="space-y-2 text-sm text-orange-800">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">!</span>
                        <span>{((vehicleData.mileage || vehicleData.distance || 0) / 10000) < 5 ? '저주행 차량 (관리 이력 확인 필요)' : `${((vehicleData.mileage || vehicleData.distance || 0) / 10000).toFixed(1)}만km 주행 (정비 이력 확인)`}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">!</span>
                        <span>실차 확인 시 외관 및 내부 상태 점검 필수</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">!</span>
                        <span>구매 전 전문가 동행 진단 권장</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* TOPSIS 설명 */}
                <div className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg border-2 border-slate-200">
                  <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-slate-600" />
                    TOPSIS 다기준 평가란?
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    TOPSIS(Technique for Order Preference by Similarity to Ideal Solution)는 1980년대 개발된 검증된 의사결정 방법론입니다.
                    <br /><br />
                    • <strong className="text-slate-900">6가지 기준</strong>을 0-1로 정규화하여 공정하게 비교합니다.
                    <br />
                    • <strong className="text-slate-900">이상적인 차량</strong>과 <strong className="text-slate-900">최악의 차량</strong> 간 거리를 계산하여 객관적 점수를 산출합니다.
                    <br />
                    • 사용자의 <strong className="text-indigo-700">중요도 가중치</strong>(연비 10점, 안전성 9점 등)를 반영하여 개인화된 평가를 제공합니다.
                  </p>
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
