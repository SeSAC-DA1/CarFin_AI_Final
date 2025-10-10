import { db } from "../server/db";
import { hyundaiReviews } from "../shared/schema";
import { sql, desc, count } from "drizzle-orm";

async function checkReviewData() {
  console.log("🔍 리뷰 데이터 분석 시작...\n");

  // 1. 총 리뷰 개수
  const totalCount = await db
    .select({ count: count() })
    .from(hyundaiReviews);
  console.log(`📊 총 리뷰 개수: ${totalCount[0].count}개\n`);

  // 2. 모델별 리뷰 분포 (Top 10)
  const modelDistribution = await db.execute(sql`
    SELECT "Model" as model, COUNT(*) as count
    FROM hyundai_segment_purchases
    GROUP BY "Model"
    ORDER BY count DESC
    LIMIT 10
  `);

  console.log("📈 모델별 리뷰 분포 (Top 10):");
  modelDistribution.rows.forEach((row: any, idx) => {
    console.log(`  ${idx + 1}. ${row.model}: ${row.count}개`);
  });
  console.log();

  // 3. 만족도 통계
  const satisfactionStats = await db.execute(sql`
    SELECT
      AVG("Satisfaction") as avg_satisfaction,
      MIN("Satisfaction") as min_satisfaction,
      MAX("Satisfaction") as max_satisfaction,
      STDDEV("Satisfaction") as stddev_satisfaction
    FROM hyundai_segment_purchases
  `);
  const stats = satisfactionStats.rows[0] as any;
  console.log("⭐ 만족도 통계:");
  console.log(`  평균: ${Number(stats.avg_satisfaction).toFixed(2)}`);
  console.log(`  최소: ${Number(stats.min_satisfaction).toFixed(2)}`);
  console.log(`  최대: ${Number(stats.max_satisfaction).toFixed(2)}`);
  console.log(`  표준편차: ${Number(stats.stddev_satisfaction).toFixed(2)}`);
  console.log();

  // 4. 리뷰 샘플 (그랜저 3개)
  const samples = await db.execute(sql`
    SELECT * FROM hyundai_segment_purchases
    WHERE "Model" LIKE '%그랜저%'
    LIMIT 3
  `);

  console.log("📝 리뷰 샘플 (그랜저):");
  samples.rows.forEach((review: any, idx) => {
    console.log(`\n  ${idx + 1}. 만족도: ${review.Satisfaction}/5.0`);
    console.log(`     연령: ${review.age}세, 성별: ${review.Gender}`);
    console.log(`     차종: ${review.car_type}`);
    console.log(`     리뷰: ${review.Review?.substring(0, 150)}...`);
    console.log(`     리뷰 길이: ${review.Review?.length || 0}자`);
  });
  console.log();

  // 5. 리뷰 길이 분포
  const lengthStats = await db.execute(sql`
    SELECT
      AVG(LENGTH("Review")) as avg_length,
      MIN(LENGTH("Review")) as min_length,
      MAX(LENGTH("Review")) as max_length
    FROM hyundai_segment_purchases
    WHERE "Review" IS NOT NULL
  `);
  const lengthData = lengthStats.rows[0] as any;
  console.log("📏 리뷰 길이 통계:");
  console.log(`  평균: ${Number(lengthData.avg_length).toFixed(0)}자`);
  console.log(`  최소: ${Number(lengthData.min_length)}자`);
  console.log(`  최대: ${Number(lengthData.max_length)}자`);
  console.log();

  console.log("✅ 분석 완료!");
  process.exit(0);
}

checkReviewData().catch((error) => {
  console.error("❌ 에러 발생:", error);
  process.exit(1);
});
