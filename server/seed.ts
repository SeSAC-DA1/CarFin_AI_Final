import { db } from "./db";
import { vehicles } from "@shared/schema";
import { sql } from "drizzle-orm";

const brands = [
  "현대", "기아", "제네시스", "쌍용", "르노삼성", 
  "BMW", "벤츠", "아우디", "폭스바겐", "볼보",
  "도요타", "렉서스", "혼다", "닛산", "마쓰다",
  "포르쉐", "테슬라", "폴스타"
];

const models = {
  "현대": ["아반떼", "쏘나타", "그랜저", "투싼", "산타페", "팰리세이드", "코나", "베뉴"],
  "기아": ["K3", "K5", "K8", "스포티지", "쏘렌토", "카니발", "셀토스", "모하비"],
  "제네시스": ["G70", "G80", "G90", "GV70", "GV80"],
  "BMW": ["320i", "520i", "X3", "X5", "X7"],
  "벤츠": ["C클래스", "E클래스", "S클래스", "GLC", "GLE"],
  "아우디": ["A4", "A6", "Q5", "Q7"],
  "테슬라": ["Model 3", "Model Y", "Model S", "Model X"],
};

const categories = ["세단", "SUV", "해치백", "왜건", "쿠페", "전기차"];
const fuels = ["가솔린", "디젤", "하이브리드", "전기", "LPG"];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

async function seedVehicles() {
  console.log("🌱 Starting vehicle seeding...");

  const vehicleData = [];
  const targetCount = 500;

  for (let i = 0; i < targetCount; i++) {
    const brand = getRandomItem(brands);
    const modelList = models[brand as keyof typeof models] || ["기타"];
    const model = getRandomItem(modelList);
    const year = getRandomInt(2015, 2024);
    const category = getRandomItem(categories);
    const fuel = category === "전기차" ? "전기" : getRandomItem(fuels);
    
    const basePrice = getRandomInt(1000, 8000);
    const ageDiscount = (2024 - year) * 0.1;
    const price = Math.max(Math.floor(basePrice * (1 - ageDiscount)), 500);
    
    const baseMileage = (2024 - year) * getRandomInt(5000, 20000);
    const mileage = baseMileage + getRandomInt(0, 10000);

    const imageUrls = [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800",
    ];

    vehicleData.push({
      name: `${brand} ${model}`,
      brand,
      model,
      year,
      price,
      mileage,
      fuel,
      transmission: "자동",
      category,
      imageUrl: getRandomItem(imageUrls),
      fuelEfficiency: getRandomFloat(8, 20),
      reliability: getRandomFloat(70, 95),
      maintenanceCost: getRandomFloat(50, 200),
      safety: getRandomFloat(75, 98),
      comfort: getRandomFloat(70, 95),
      resaleValue: getRandomFloat(60, 90),
    });

    if ((i + 1) % 100 === 0) {
      console.log(`Generated ${i + 1}/${targetCount} vehicles...`);
    }
  }

  await db.delete(vehicles);
  console.log("🗑️  Cleared existing vehicles");

  const batchSize = 100;
  for (let i = 0; i < vehicleData.length; i += batchSize) {
    const batch = vehicleData.slice(i, i + batchSize);
    await db.insert(vehicles).values(batch);
    console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vehicleData.length / batchSize)}`);
  }

  const count = await db.select({ count: sql<number>`count(*)::int` }).from(vehicles);
  console.log(`✨ Seeding complete! Total vehicles: ${count[0].count}`);
  
  process.exit(0);
}

seedVehicles().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
