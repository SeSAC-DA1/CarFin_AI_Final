import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Navigation from '@/components/layout/Navigation';
import {
  ArrowRight,
  ArrowLeft,
  User,
  Car,
  Heart,
  DollarSign,
  Users,
  MapPin,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface ProfileData {
  // 기본 정보
  name: string;
  age: string;
  location: string;

  // 차량 용도
  usage: string[];

  // 예산 범위
  budget: number[];

  // 선호 브랜드
  preferredBrands: string[];

  // 차량 타입
  vehicleTypes: string[];

  // 기타 선호사항
  fuelType: string;
  transmission: string;
  importance: {
    price: number;
    fuelEfficiency: number;
    safety: number;
    design: number;
    brand: number;
  };
}

interface ProfileStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function ProfileSetup() {
  const [currentStep, setCurrentStep] = useState(0);
  const [, setLocation] = useLocation();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    age: '',
    location: '',
    usage: [],
    budget: [1000, 3000],
    preferredBrands: [],
    vehicleTypes: [],
    fuelType: '',
    transmission: '',
    importance: {
      price: 5,
      fuelEfficiency: 5,
      safety: 5,
      design: 5,
      brand: 5
    }
  });

  const updateProfile = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleArrayItem = (field: keyof ProfileData, item: string) => {
    const currentArray = profileData[field] as string[];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateProfile(field, newArray);
  };

  const steps: ProfileStep[] = [
    {
      id: 1,
      title: "기본 정보를 알려주세요",
      description: "더 정확한 추천을 위해 기본적인 정보가 필요해요",
      icon: <User className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-6 max-w-md mx-auto">
          <div className="space-y-2">
            <Label htmlFor="name">이름 또는 닉네임</Label>
            <Input
              id="name"
              placeholder="어떻게 불러드릴까요?"
              value={profileData.name}
              onChange={(e) => updateProfile('name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">연령대</Label>
            <RadioGroup
              value={profileData.age}
              onValueChange={(value) => updateProfile('age', value)}
            >
              <div className="grid grid-cols-2 gap-3">
                {['20대', '30대', '40대', '50대', '60대 이상'].map((age) => (
                  <div key={age} className="flex items-center space-x-2">
                    <RadioGroupItem value={age} id={age} />
                    <Label htmlFor={age} className="text-sm">{age}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">지역</Label>
            <Input
              id="location"
              placeholder="예: 서울, 부산, 대구..."
              value={profileData.location}
              onChange={(e) => updateProfile('location', e.target.value)}
            />
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "어떤 용도로 차량을 사용하시나요?",
      description: "사용 목적에 따라 적합한 차량이 달라져요",
      icon: <Car className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { id: 'commute', label: '출퇴근용', desc: '매일 사용하는 주력 차량' },
              { id: 'family', label: '가족용', desc: '가족과 함께 타는 차량' },
              { id: 'leisure', label: '레저용', desc: '주말 여행이나 레저 활동' },
              { id: 'business', label: '업무용', desc: '비즈니스나 영업용' },
              { id: 'city', label: '시내 주행', desc: '주로 도심 내 운전' },
              { id: 'long', label: '장거리', desc: '고속도로나 장거리 운전' }
            ].map((usage) => (
              <Card
                key={usage.id}
                className={`cursor-pointer transition-all hover-elevate ${
                  profileData.usage.includes(usage.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
                onClick={() => toggleArrayItem('usage', usage.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{usage.label}</h3>
                    {profileData.usage.includes(usage.id) && (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{usage.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "예산 범위를 설정해주세요",
      description: "현실적인 예산을 설정하면 더 정확한 추천이 가능해요",
      icon: <DollarSign className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {profileData.budget[0]}만원 - {profileData.budget[1]}만원
            </div>
            <p className="text-muted-foreground">희망 차량 가격대</p>
          </div>

          <div className="space-y-4">
            <Label>예산 범위 (만원)</Label>
            <Slider
              value={profileData.budget}
              onValueChange={(value) => updateProfile('budget', value)}
              min={500}
              max={10000}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>500만원</span>
              <span>1억원</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { range: [500, 1500], label: '1,500만원 이하' },
              { range: [1500, 3000], label: '1,500~3,000만원' },
              { range: [3000, 5000], label: '3,000~5,000만원' },
              { range: [5000, 10000], label: '5,000만원 이상' }
            ].map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => updateProfile('budget', preset.range)}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "중요하게 생각하는 요소는 무엇인가요?",
      description: "각 요소의 중요도를 설정해주세요 (1-10점)",
      icon: <Heart className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-6 max-w-2xl mx-auto">
          {[
            { key: 'price', label: '가격', desc: '구매 비용과 가성비' },
            { key: 'fuelEfficiency', label: '연비', desc: '연료 효율성' },
            { key: 'safety', label: '안전성', desc: '안전 기능과 신뢰성' },
            { key: 'design', label: '디자인', desc: '외관과 내부 디자인' },
            { key: 'brand', label: '브랜드', desc: '브랜드 선호도' }
          ].map((factor) => (
            <div key={factor.key} className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <Label className="text-sm font-medium">{factor.label}</Label>
                  <p className="text-xs text-muted-foreground">{factor.desc}</p>
                </div>
                <Badge variant="outline" className="text-primary">
                  {profileData.importance[factor.key as keyof typeof profileData.importance]}점
                </Badge>
              </div>
              <Slider
                value={[profileData.importance[factor.key as keyof typeof profileData.importance]]}
                onValueChange={(value) => updateProfile('importance', {
                  ...profileData.importance,
                  [factor.key]: value[0]
                })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>
          ))}
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 프로필 설정 완료 - 채팅으로 이동
      saveProfile();
      setLocation('/chat');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveProfile = () => {
    // 로컬 스토리지에 프로필 저장 (추후 서버로 이동)
    localStorage.setItem('carfin_user_profile', JSON.stringify(profileData));
    console.log('Profile saved:', profileData);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return profileData.name.trim() && profileData.age && profileData.location.trim();
      case 1:
        return profileData.usage.length > 0;
      case 2:
        return true; // 예산은 기본값이 있음
      case 3:
        return true; // 중요도도 기본값이 있음
      default:
        return true;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="w-full h-full bg-gradient-to-br from-primary/5 via-chart-2/5 to-chart-3/5 opacity-30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">개인화 설정</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
              당신만의 AI 컨설턴트
            </span>
            <br />
            <span className="text-foreground">설정하기</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            몇 가지 질문에 답해주시면 더 정확한 차량 추천을 받을 수 있어요
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-12">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>진행률</span>
            <span>{currentStep + 1} / {steps.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-8 border-border/50 bg-background/80 backdrop-blur-lg">
                <CardHeader className="text-center pb-6">
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center border border-primary/30">
                      {steps[currentStep].icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl md:text-2xl font-bold mb-4">
                    {steps[currentStep].title}
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground max-w-2xl mx-auto">
                    {steps[currentStep].description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                  {steps[currentStep].content}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              이전
            </Button>

            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-primary via-chart-2 to-primary hover:from-primary/90 hover:via-chart-2/90 hover:to-primary/90"
            >
              {currentStep === steps.length - 1 ? 'AI 상담 시작' : '다음'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}