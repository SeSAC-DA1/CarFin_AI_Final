import VehicleCard from '../VehicleCard'

export default function VehicleCardExample() {
  return (
    <div className="max-w-sm">
      <VehicleCard
        id={1}
        rank={1}
        name="현대 싼타페"
        year={2021}
        price={2380}
        mileage={45000}
        fuel="디젤"
        image="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400"
        topsisScore={92}
        matchScore={95}
      />
    </div>
  )
}
