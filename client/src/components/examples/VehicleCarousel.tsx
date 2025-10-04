import { useQuery } from '@tanstack/react-query';
import VehicleCarousel from '../VehicleCarousel';

export default function VehicleCarouselExample() {
  const { data: vehiclesData, isLoading } = useQuery({
    queryKey: ['/api/vehicles/search', { limit: 3 }],
    enabled: true
  });

  const vehicles = vehiclesData?.map((v: any, index: number) => ({
    id: v.id,
    rank: index + 1,
    name: `${v.brand} ${v.model}`,
    year: v.year,
    price: v.price,
    mileage: v.mileage,
    fuel: v.fuel,
    image: v.imageUrl || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400",
    topsisScore: Math.round(v.safety || 85),
    matchScore: Math.round(v.reliability || 90)
  })) || [];

  if (isLoading) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <p className="text-center text-muted-foreground">차량 데이터 로딩중...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <VehicleCarousel vehicles={vehicles} />
    </div>
  );
}
