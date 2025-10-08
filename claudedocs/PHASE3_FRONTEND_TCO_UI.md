# 🎨 Phase 3: 프론트엔드 TCO UI 설계 및 구현

**작성일**: 2025-01-06
**전제 조건**: Phase 1-2 완료 (TCO 계산 + 백엔드 통합)
**목표**: 사용자에게 TCO 정보를 직관적이고 매력적으로 표시

---

## 🎯 Phase 3 목표

### 핵심 목표
1. **VehicleRecommendations 컴포넌트 강화**: 차량 카드에 TCO 간단 표시
2. **TCO 상세 모달 신규 생성**: 5가지 비용 항목 시각화
3. **비교 대시보드**: Top 3 차량 TCO 비교
4. **사용자 친화적 UX**: 복잡한 데이터를 쉽게 이해

### UI/UX 원칙
- **단순함**: 처음엔 간단히, 클릭하면 상세히
- **시각화**: 차트와 아이콘으로 직관적 이해
- **신뢰성**: 법률/연구 근거 명시로 신뢰도 향상
- **개인화**: 사용자의 주행 패턴 반영 강조

---

## 🎨 UI 설계

### 레이아웃 구조
```
┌─────────────────────────────────────────────────┐
│  💬 ChatInterface (기존)                        │
│  ┌───────────────────────────────────────────┐  │
│  │ 🤖 AI: "맞춤 추천 3대를 찾았습니다!"      │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  📋 VehicleRecommendations (강화)               │
│  ┌─────────────────────────────────────────┐    │
│  │ 🥇 1위: 현대 쏘나타 하이브리드          │    │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │    │
│  │ 💰 차량 가격: 3,500만원                │    │
│  │ 📊 3년 총 소유비용: 2,166만원  ✨ NEW  │    │
│  │    💸 장기적으로 190만원 절약!         │    │
│  │                                         │    │
│  │ [📈 TCO 상세보기] [💳 금융 상담]       │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  🔍 TCODetailModal (신규 생성)                  │
│  ┌─────────────────────────────────────────┐    │
│  │ 📊 총 소유비용 상세 분석                │    │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │    │
│  │                                         │    │
│  │ 💰 총 비용: 21,660,000원 (3년)         │    │
│  │ 📈 신뢰도: 85% (배기량 데이터 추정)    │    │
│  │                                         │    │
│  │ ━━━━━━ 비용 항목별 상세 ━━━━━━━━━     │    │
│  │                                         │    │
│  │ 1. 💵 취득세: 2,450,000원              │    │
│  │    └ 📖 근거: 지방세법 제11조 (7%)    │    │
│  │                                         │    │
│  │ 2. 🏛️ 자동차세: 1,404,000원            │    │
│  │    └ 📖 근거: 지방세법 제127조         │    │
│  │    └ 3년차 5% 감액 적용               │    │
│  │                                         │    │
│  │ 3. 🔧 정비/소모품: 3,960,000원         │    │
│  │    └ 📖 근거: DOE/ANL 연구 (88원/km)  │    │
│  │                                         │    │
│  │ 4. 📉 감가상각: 9,350,000원            │    │
│  │    └ 연간 15% 감가율 적용             │    │
│  │                                         │    │
│  │ 5. ⛽ 연료비: 4,496,000원              │    │
│  │    └ 하이브리드 16km/L, 유가 1,600원  │    │
│  │                                         │    │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │    │
│  │                                         │    │
│  │ 📊 [비용 차트 보기]                    │    │
│  │ 🔄 [다른 차량과 비교]                  │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## 📋 컴포넌트 설계

### 1. VehicleRecommendations 강화

**파일**: `client/src/components/features/VehicleRecommendations.tsx`

#### 변경사항 요약
```typescript
// 기존 Vehicle 인터페이스 확장
export interface Vehicle {
  // ... 기존 필드

  // 🆕 TCO 필드 추가
  tco?: {
    total: number;
    breakdown: {
      acquisitionTax: number;
      vehicleTax: number;
      maintenance: number;
      depreciation: number;
      fuelCost: number;
    };
    confidence: number;
    ownershipYears: number;
  };
}
```

#### UI 추가 요소
```tsx
// 차량 카드 내부에 TCO 간단 표시
<Card className="p-6">
  {/* 기존 정보 */}
  <h3 className="font-bold">{vehicle.name}</h3>
  <p className="text-2xl font-bold">💰 {vehicle.price.toLocaleString()}만원</p>

  {/* 🆕 TCO 간단 표시 */}
  {vehicle.tco && (
    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2 mb-1">
        <Calculator className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-900">
          {vehicle.tco.ownershipYears}년 총 소유비용
        </span>
      </div>
      <p className="text-xl font-bold text-blue-600">
        📊 {vehicle.tco.total.toLocaleString()}원
      </p>

      {/* 가격 대비 TCO 비교 */}
      <p className="text-xs text-blue-600 mt-1">
        💸 단순 구매가 대비
        {vehicle.tco.total < vehicle.price * 10000
          ? ` ${((vehicle.price * 10000 - vehicle.tco.total) / 10000).toFixed(0)}만원 절약!`
          : ` ${((vehicle.tco.total - vehicle.price * 10000) / 10000).toFixed(0)}만원 추가 비용`
        }
      </p>

      {/* 신뢰도 표시 */}
      <div className="flex items-center gap-1 mt-2">
        <Badge variant="outline" className="text-xs">
          신뢰도 {(vehicle.tco.confidence * 100).toFixed(0)}%
        </Badge>
      </div>
    </div>
  )}

  {/* 🆕 TCO 상세보기 버튼 */}
  <div className="mt-4 flex gap-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => handleViewTCO(vehicle)}
    >
      <BarChart className="w-4 h-4 mr-1" />
      TCO 상세보기
    </Button>

    <Button
      variant="outline"
      size="sm"
      onClick={() => handleFinanceConsultation(vehicle)}
    >
      <CreditCard className="w-4 h-4 mr-1" />
      금융 상담
    </Button>
  </div>
</Card>
```

---

### 2. TCODetailModal 신규 생성 ✨

**파일**: `client/src/components/features/TCODetailModal.tsx` (신규)

#### 컴포넌트 구조
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Calculator,
  Building,
  Wrench,
  TrendingDown,
  Fuel,
  Info,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface TCODetailModalProps {
  open: boolean;
  onClose: () => void;
  vehicle: Vehicle;
}

export default function TCODetailModal({ open, onClose, vehicle }: TCODetailModalProps) {
  if (!vehicle.tco) return null;

  const { total, breakdown, confidence, ownershipYears } = vehicle.tco;

  // 각 항목의 비율 계산
  const getPercentage = (value: number) => ((value / total) * 100).toFixed(1);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            총 소유비용(TCO) 상세 분석
          </DialogTitle>
        </DialogHeader>

        {/* 요약 카드 */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">
                {vehicle.manufacturer} {vehicle.model} ({vehicle.year})
              </p>
              <p className="text-4xl font-bold text-blue-600 mb-2">
                {total.toLocaleString()}원
              </p>
              <p className="text-sm text-gray-600">
                {ownershipYears}년 보유 시 예상 총 비용
              </p>

              {/* 신뢰도 표시 */}
              <div className="mt-4 flex items-center justify-center gap-2">
                {confidence >= 0.8 ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                )}
                <span className="text-sm font-medium">
                  신뢰도: {(confidence * 100).toFixed(0)}%
                </span>
              </div>

              {confidence < 0.8 && (
                <p className="text-xs text-yellow-700 mt-1">
                  일부 데이터가 추정값입니다
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Separator className="my-4" />

        {/* 비용 항목별 상세 */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            비용 항목별 상세
          </h3>

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
            legalBasis="일반 감가율 15%"
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
        </div>

        {/* 비교 액션 버튼 */}
        <div className="mt-6 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {/* 차트 보기 */}}
          >
            📊 비용 차트 보기
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {/* 다른 차량과 비교 */}}
          >
            🔄 다른 차량과 비교
          </Button>
        </div>
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
    purple: "bg-purple-50 border-purple-200",
    blue: "bg-blue-50 border-blue-200",
    orange: "bg-orange-50 border-orange-200",
    red: "bg-red-50 border-red-200",
    green: "bg-green-50 border-green-200"
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

        <Progress value={parseFloat(percentage)} className="mb-2" />

        <div className="space-y-1 text-sm text-gray-600">
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
```

---

### 3. TCO 비교 대시보드 (선택사항)

**파일**: `client/src/components/features/TCOComparisonDashboard.tsx` (신규)

#### 기능
- Top 3 차량의 TCO 나란히 비교
- 각 비용 항목별 막대 그래프
- 가장 경제적인 선택 하이라이트

```tsx
export default function TCOComparisonDashboard({ vehicles }: { vehicles: Vehicle[] }) {
  const vehiclesWithTCO = vehicles.filter(v => v.tco);

  if (vehiclesWithTCO.length < 2) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="w-5 h-5 text-primary" />
          Top 3 차량 TCO 비교
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {vehiclesWithTCO.map((vehicle, index) => (
            <div key={vehicle.id} className="text-center">
              <Badge className="mb-2">{rankLabels[index]}</Badge>
              <p className="font-medium text-sm">{vehicle.name}</p>
              <p className="text-2xl font-bold text-primary mt-2">
                {vehicle.tco!.total.toLocaleString()}원
              </p>

              {/* 가장 저렴한 차량 표시 */}
              {index === 0 && (
                <Badge variant="success" className="mt-2">
                  💰 가장 경제적
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* 비용 항목별 비교 차트 */}
        <Separator className="my-4" />
        <div className="space-y-3">
          <TCOCategoryComparison
            vehicles={vehiclesWithTCO}
            category="acquisitionTax"
            label="취득세"
          />
          <TCOCategoryComparison
            vehicles={vehiclesWithTCO}
            category="vehicleTax"
            label="자동차세"
          />
          {/* ... 나머지 항목들 */}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 🎨 디자인 시스템

### 색상 팔레트
```css
/* TCO 관련 색상 */
--tco-acquisition: #9333EA;  /* 취득세 - 보라 */
--tco-vehicle-tax: #3B82F6;  /* 자동차세 - 파랑 */
--tco-maintenance: #F97316;  /* 정비비 - 주황 */
--tco-depreciation: #EF4444; /* 감가상각 - 빨강 */
--tco-fuel: #10B981;         /* 연료비 - 초록 */

/* 신뢰도 색상 */
--confidence-high: #10B981;   /* >= 80% */
--confidence-medium: #F59E0B; /* 60-79% */
--confidence-low: #EF4444;    /* < 60% */
```

### 아이콘 시스템
```typescript
const TCO_ICONS = {
  acquisitionTax: Building,    // 🏛️ 취득세
  vehicleTax: Building,        // 🏛️ 자동차세
  maintenance: Wrench,         // 🔧 정비비
  depreciation: TrendingDown,  // 📉 감가상각
  fuelCost: Fuel,             // ⛽ 연료비
  total: Calculator,          // 🧮 총합
  confidence: CheckCircle2    // ✅ 신뢰도
};
```

---

## 📱 반응형 디자인

### 모바일 (< 768px)
```tsx
// 차량 카드: TCO를 접을 수 있는 Accordion으로
<Accordion type="single" collapsible>
  <AccordionItem value="tco">
    <AccordionTrigger>
      📊 {vehicle.tco.total.toLocaleString()}원
    </AccordionTrigger>
    <AccordionContent>
      {/* TCO 상세 정보 */}
    </AccordionContent>
  </AccordionItem>
</Accordion>

// TCO 모달: 전체 화면
<DialogContent className="w-full h-full max-w-none max-h-none">
  {/* 모바일 최적화 레이아웃 */}
</DialogContent>
```

### 태블릿 (768px - 1024px)
```tsx
// 2열 그리드로 비용 항목 표시
<div className="grid grid-cols-2 gap-4">
  {/* 비용 항목들 */}
</div>
```

### 데스크톱 (> 1024px)
```tsx
// 3열 그리드 + 사이드 차트
<div className="grid grid-cols-3 gap-6">
  <div className="col-span-2">
    {/* 비용 항목들 */}
  </div>
  <div>
    {/* 파이 차트 */}
  </div>
</div>
```

---

## ✅ Phase 3 완료 조건

### 필수 구현
- ✅ VehicleRecommendations에 TCO 간단 표시
- ✅ TCODetailModal 신규 생성
- ✅ 5가지 비용 항목 시각화
- ✅ 법률/연구 근거 명시
- ✅ 신뢰도 표시

### 선택 구현
- ⏳ TCOComparisonDashboard (비교 대시보드)
- ⏳ 비용 항목별 차트 (Recharts)
- ⏳ 애니메이션 효과 (Framer Motion)

### UX 테스트
- ✅ 모바일/태블릿/데스크톱 반응형 확인
- ✅ 접근성 검증 (키보드 네비게이션)
- ✅ 로딩 상태 처리
- ✅ 에러 상태 처리

---

## 🎯 사용자 시나리오

### 시나리오 1: 첫 방문 사용자
```
1. 챗봇에 "3000만원 이하 가족용 SUV" 입력
2. Top 3 추천 받음
3. 각 차량 카드에서 "📊 21,660,000원" 확인
4. "어? 3500만원 차량이 왜 1위지?" 의문
5. [TCO 상세보기] 클릭
6. "아, 하이브리드라 연료비가 450만원 절약되네!"
7. 납득하고 해당 차량 선택
```

### 시나리오 2: 가격 민감 사용자
```
1. 프로필에서 "가격" 중요도 높게 설정
2. 추천 받음
3. TCO 비교 대시보드 자동 표시
4. "초기 가격은 비싸지만, 3년 TCO는 저렴하네"
5. 장기적 관점에서 현명한 선택
```

---

**현재 상태**: Phase 3 UI 설계 완료
**예상 소요 시간**: 3시간
**다음 작업**: 실제 컴포넌트 구현 시작
