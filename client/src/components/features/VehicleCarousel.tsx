import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Gauge, Fuel, Award, Heart, BarChart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import VehicleInsightsModal from "./VehicleInsightsModal";
import { useWebSocketChat } from "@/hooks/useWebSocketChat";

export interface Vehicle {
  id: number | string;
  rank: number;
  name: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  image: string;
  topsisScore: number;
  matchScore: number;
}

interface VehicleCarouselProps {
  vehicles: Vehicle[];
}

const rankColors = ["text-yellow-500", "text-gray-400", "text-amber-600"];

export default function VehicleCarousel({ vehicles }: VehicleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInsights, setShowInsights] = useState(false);
  const { insights, requestInsights } = useWebSocketChat();

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % vehicles.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + vehicles.length) % vehicles.length);
  };

  const current = vehicles[currentIndex];

  const handleViewInsights = () => {
    if (!current) return;
    requestInsights(current.id.toString());
    setShowInsights(true);
  };

  if (!current) {
    return <div className="text-center py-4">차량 정보가 없습니다.</div>;
  }

  return (
    <div className="w-full max-w-2xl" data-testid="vehicle-carousel">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">추천 차량</span>
          <Badge variant="secondary" className="font-mono">
            {currentIndex + 1} / {vehicles.length}
          </Badge>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={prev}
            className="px-2"
            data-testid="carousel-prev"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={next}
            className="px-2"
            data-testid="carousel-next"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden hover-elevate border-card-border">
        <div className="relative h-48">
          <img src={current.image} alt={current.name} className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <div className={cn("p-2 bg-background/90 backdrop-blur-sm rounded-full", rankColors[current.rank - 1])}>
              <Award className="w-6 h-6" />
            </div>
            <Badge className="bg-background/90 backdrop-blur-sm">
              #{current.rank}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary text-primary-foreground font-mono">
              매칭 {current.matchScore}%
            </Badge>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-1">{current.name}</h3>
            <div className="font-mono text-2xl font-bold text-primary">
              {current.price.toLocaleString()}만원
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{current.year}년</span>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-muted-foreground" />
              <span>{current.mileage.toLocaleString()}km</span>
            </div>
            <div className="flex items-center gap-2">
              <Fuel className="w-4 h-4 text-muted-foreground" />
              <span>{current.fuel}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">TOPSIS 점수</span>
              <span className="font-mono font-medium">{current.topsisScore}/100</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-chart-1 transition-all"
                style={{ width: `${current.topsisScore}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              className="flex-1 gap-2" 
              variant="default" 
              onClick={handleViewInsights}
              data-testid={`button-view-details-${current.rank}`}
            >
              <BarChart className="w-4 h-4" />
              AI 인사이트
            </Button>
            <Button variant="outline" size="icon" data-testid={`button-favorite-${current.rank}`}>
              <Heart className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex justify-center gap-2 mt-3">
        {vehicles.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "rounded-full transition-all",
              index === currentIndex ? "w-8 min-h-[0.5rem] bg-primary" : "w-2 min-h-[0.5rem] bg-muted"
            )}
            data-testid={`carousel-dot-${index}`}
          />
        ))}
      </div>

      <VehicleInsightsModal
        open={showInsights}
        onOpenChange={setShowInsights}
        vehicle={current ? {
          id: current.id.toString(),
          name: current.name,
          year: current.year,
          price: current.price,
          mileage: current.mileage,
          fuel: current.fuel,
          image: current.image,
          topsisScore: current.topsisScore,
        } : null}
        insights={insights?.vehicleId === current?.id.toString() ? insights.data : null}
        isLoading={showInsights && (!insights || insights.vehicleId !== current?.id.toString())}
      />
    </div>
  );
}
