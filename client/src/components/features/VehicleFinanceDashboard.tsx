// 🏦 차량별 종합 금융 대시보드 모달

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Calculator,
  CreditCard,
  Shield,
  PiggyBank,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Car
} from 'lucide-react';

interface VehicleInfo {
  manufacturer: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
}

interface FinancialOption {
  loan: {
    provider: string;
    interestRate: number;
    monthlyPayment: number;
    downPayment: number;
    totalCost: number;
  };
  lease: {
    provider: string;
    monthlyPayment: number;
    deposit: number;
    residualValue: number;
  };
  insurance: {
    monthlyPremium: number;
    provider: string;
  };
  recommendation: {
    type: 'loan' | 'lease';
    reason: string;
    savingsAmount: number;
  };
}

interface VehicleFinanceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleInfo;
  financialData?: FinancialOption;
}

export default function VehicleFinanceDashboard({
  isOpen,
  onClose,
  vehicle,
  financialData
}: VehicleFinanceDashboardProps) {
  const [selectedOption, setSelectedOption] = useState<'loan' | 'lease'>('loan');

  // 🧮 실시간 계산 로직 (실제 한국 시장 기준)
  const calculateFinancialInfo = (): FinancialOption => {
    if (financialData) return financialData;

    const vehiclePrice = vehicle.price * 10000; // 만원 -> 원
    const age = 2024 - vehicle.year;

    // 연식별 금리 조정
    const baseRate = 4.2;
    const ageAdjustment = age <= 3 ? 0 : age <= 5 ? 0.5 : age <= 7 ? 1.0 : 1.5;
    const loanRate = baseRate + ageAdjustment;

    // 대출 계산 (60개월)
    const downPayment = vehiclePrice * 0.2; // 20% 계약금
    const loanAmount = vehiclePrice - downPayment;
    const monthlyRate = loanRate / 100 / 12;
    const periods = 60;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, periods)) / (Math.pow(1 + monthlyRate, periods) - 1);

    // 리스 계산 (36개월)
    const residualRate = 0.4; // 40% 잔가
    const residualValue = vehiclePrice * residualRate;
    const leaseAmount = vehiclePrice - residualValue;
    const leaseMonthly = (leaseAmount / 36) + (vehiclePrice * 0.035 / 12); // 감가상각 + 이자

    // 보험료 (차량가격 기준)
    const insurancePremium = Math.max(70000, vehiclePrice * 0.0003); // 최소 7만원

    return {
      loan: {
        provider: '현대캐피탈',
        interestRate: loanRate,
        monthlyPayment: Math.round(monthlyPayment),
        downPayment: Math.round(downPayment),
        totalCost: Math.round(monthlyPayment * periods + downPayment)
      },
      lease: {
        provider: '현대캐피탈 리스',
        monthlyPayment: Math.round(leaseMonthly),
        deposit: Math.round(vehiclePrice * 0.1),
        residualValue: Math.round(residualValue)
      },
      insurance: {
        monthlyPremium: Math.round(insurancePremium),
        provider: '삼성화재'
      },
      recommendation: {
        type: monthlyPayment < leaseMonthly ? 'loan' : 'lease',
        reason: monthlyPayment < leaseMonthly
          ? '장기적으로 경제적이며 소유권 확보 가능'
          : '초기 부담이 적고 유연성이 높음',
        savingsAmount: Math.abs(Math.round((monthlyPayment - leaseMonthly) * 36))
      }
    };
  };

  const financeInfo = calculateFinancialInfo();
  const isLoanBetter = financeInfo.recommendation.type === 'loan';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Car className="w-5 h-5 text-primary" />
            {vehicle.manufacturer} {vehicle.model} 금융 상담
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 🚗 차량 정보 요약 */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">차량가격</span>
                  <span className="font-bold text-lg">{vehicle.price.toLocaleString()}만원</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">연식</span>
                  <span className="font-medium">{vehicle.year}년</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">주행거리</span>
                  <span className="font-medium">{(vehicle.mileage / 10000).toFixed(1)}만km</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">연료</span>
                  <span className="font-medium">{vehicle.fuelType}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🎯 AI 추천 결과 */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                AI 금융 상담 결과
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={`px-3 py-1 ${
                    isLoanBetter
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-purple-500 hover:bg-purple-600'
                  }`}>
                    {isLoanBetter ? '할부 추천' : '리스 추천'}
                  </Badge>
                  <span className="font-medium">{financeInfo.recommendation.reason}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-green-600 dark:text-green-400">
                    약 {financeInfo.recommendation.savingsAmount.toLocaleString()}원 절약
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 📊 금융 옵션 비교 탭 */}
          <Tabs value={selectedOption} onValueChange={(value) => setSelectedOption(value as 'loan' | 'lease')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="loan" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                할부 대출
              </TabsTrigger>
              <TabsTrigger value="lease" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                리스
              </TabsTrigger>
            </TabsList>

            {/* 할부 대출 탭 */}
            <TabsContent value="loan" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 대출 정보 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-blue-500" />
                      할부 대출 조건
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">금융사</span>
                      <span className="font-medium">{financeInfo.loan.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">연이율</span>
                      <span className="font-bold text-blue-600">{financeInfo.loan.interestRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">계약금 (20%)</span>
                      <span className="font-medium">{(financeInfo.loan.downPayment / 10000).toLocaleString()}만원</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-muted-foreground">월 납입금</span>
                      <span className="font-bold text-lg text-blue-600">
                        {(financeInfo.loan.monthlyPayment / 10000).toFixed(0)}만원
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">총 납입액</span>
                      <span className="font-medium">{(financeInfo.loan.totalCost / 10000).toLocaleString()}만원</span>
                    </div>
                  </CardContent>
                </Card>

                {/* 대출 장단점 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      할부의 장단점
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium text-green-600 mb-2 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        장점
                      </h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• 완납 후 완전한 소유권 확보</li>
                        <li>• 장기적으로 경제적</li>
                        <li>• 주행거리 제한 없음</li>
                        <li>• 차량 개조/튜닝 자유</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-600 mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        단점
                      </h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• 높은 초기 부담금</li>
                        <li>• 감가상각 위험 부담</li>
                        <li>• 차량 관리 책임</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 리스 탭 */}
            <TabsContent value="lease" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 리스 정보 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-500" />
                      리스 조건
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">리스사</span>
                      <span className="font-medium">{financeInfo.lease.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">계약 기간</span>
                      <span className="font-medium">36개월</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">보증금 (10%)</span>
                      <span className="font-medium">{(financeInfo.lease.deposit / 10000).toLocaleString()}만원</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-muted-foreground">월 리스료</span>
                      <span className="font-bold text-lg text-purple-600">
                        {(financeInfo.lease.monthlyPayment / 10000).toFixed(0)}만원
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">잔가 (40%)</span>
                      <span className="font-medium">{(financeInfo.lease.residualValue / 10000).toLocaleString()}만원</span>
                    </div>
                  </CardContent>
                </Card>

                {/* 리스 장단점 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-purple-500" />
                      리스의 장단점
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium text-green-600 mb-2 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        장점
                      </h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• 낮은 초기 부담금</li>
                        <li>• 월 납입금 절약</li>
                        <li>• 정비 서비스 포함</li>
                        <li>• 신차 교체 용이</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-600 mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        단점
                      </h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• 소유권 없음</li>
                        <li>• 주행거리 제한 (연 2만km)</li>
                        <li>• 중도 해지 위약금</li>
                        <li>• 차량 개조 제한</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* 🛡️ 보험료 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                자동차 보험 (종합보험)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">보험사</div>
                  <div className="font-medium">{financeInfo.insurance.provider}</div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">월 보험료</div>
                  <div className="font-bold text-blue-600">
                    {(financeInfo.insurance.monthlyPremium / 10000).toFixed(1)}만원
                  </div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">대인배상</div>
                  <div className="font-medium">3억원</div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">대물배상</div>
                  <div className="font-medium">2억원</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 💰 총 소유비용 (TCO) 시뮬레이션 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-green-500" />
                5년 총 소유비용 (TCO) 시뮬레이션
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-muted-foreground">차량비</div>
                    <div className="font-bold text-green-600">{vehicle.price.toLocaleString()}만원</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-muted-foreground">금융비용</div>
                    <div className="font-bold text-green-600">
                      {((financeInfo.loan.totalCost - vehicle.price * 10000) / 10000).toLocaleString()}만원
                    </div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-muted-foreground">보험료 (5년)</div>
                    <div className="font-bold text-green-600">
                      {(financeInfo.insurance.monthlyPremium * 60 / 10000).toFixed(0)}만원
                    </div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-muted-foreground">연료+정비비</div>
                    <div className="font-bold text-green-600">
                      {Math.round(vehicle.price * 0.8)}만원
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">총 소유비용 (5년)</span>
                    <span className="text-2xl font-bold text-primary">
                      {(
                        (financeInfo.loan.totalCost / 10000) +
                        (financeInfo.insurance.monthlyPremium * 60 / 10000) +
                        (vehicle.price * 0.8)
                      ).toFixed(0)}만원
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    월평균 {(
                      ((financeInfo.loan.totalCost / 10000) +
                       (financeInfo.insurance.monthlyPremium * 60 / 10000) +
                       (vehicle.price * 0.8)) / 60
                    ).toFixed(0)}만원
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 📋 다음 단계 */}
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                구매 진행 단계
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">1</Badge>
                  <span>차량 현장 확인</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">2</Badge>
                  <span>금융 신청 및 승인</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">3</Badge>
                  <span>계약 및 인도</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 액션 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button className="flex-1" size="lg">
              <DollarSign className="w-4 h-4 mr-2" />
              금융 신청하기
            </Button>
            <Button variant="outline" size="lg" onClick={onClose}>
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}