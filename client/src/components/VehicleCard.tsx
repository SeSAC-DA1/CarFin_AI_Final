import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gauge, Fuel, Settings, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleCardProps {
  id: number;
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

const rankColors = ["text-yellow-500", "text-gray-400", "text-amber-600"];

export default function VehicleCard({
  rank,
  name,
  year,
  price,
  mileage,
  fuel,
  image,
  topsisScore,
  matchScore
}: VehicleCardProps) {
  return (
    <Card className="overflow-hidden hover-elevate border-card-border" data-testid={`card-vehicle-${rank}`}>
      <div className="relative h-48">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className={cn("p-2 bg-background/90 backdrop-blur-sm rounded-full", rankColors[rank - 1])}>
            <Award className="w-6 h-6" />
          </div>
          <Badge className="bg-background/90 backdrop-blur-sm">
            #{rank}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-1">{name}</h3>
          <div className="font-mono text-2xl font-bold text-primary">
            {price.toLocaleString()}만원
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{year}년</span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-muted-foreground" />
            <span>{mileage.toLocaleString()}km</span>
          </div>
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-muted-foreground" />
            <span>{fuel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span>자동</span>
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-border">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">TOPSIS 점수</span>
              <span className="font-mono font-medium">{topsisScore}/100</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-chart-1 transition-all"
                style={{ width: `${topsisScore}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">매칭도</span>
              <span className="font-mono font-medium">{matchScore}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${matchScore}%` }}
              />
            </div>
          </div>
        </div>

        <Button className="w-full" variant="outline" data-testid={`button-view-details-${rank}`}>
          상세 분석 보기
        </Button>
      </div>
    </Card>
  );
}
