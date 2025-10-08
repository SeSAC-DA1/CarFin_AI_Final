import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
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
import { Vehicle } from "./VehicleRecommendations";

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
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {vehicle.manufacturer || vehicle.name.split(' ')[0]} {vehicle.model || vehicle.name.split(' ')[1]} ({vehicle.year})
              </p>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {total.toLocaleString()}원
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
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
                <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
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

        {/* 안내 메시지 */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong>📌 유의사항:</strong> TCO는 평균 주행거리와 일반적인 시장 데이터를 기반으로 계산된 예상값입니다.
            실제 비용은 개인의 주행 습관, 차량 관리 방법, 유가 변동 등에 따라 달라질 수 있습니다.
          </p>
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

        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
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
