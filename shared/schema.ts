import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const vehicles = pgTable("vehicles", {
  vehicleId: integer("vehicle_id").primaryKey().generatedAlwaysAsIdentity(),
  carSeq: integer("car_seq").notNull(),
  vehicleNo: varchar("vehicle_no", { length: 20 }).notNull().unique(),
  platform: varchar("platform", { length: 16 }),
  origin: varchar("origin", { length: 16 }),
  carType: varchar("car_type", { length: 16 }),
  manufacturer: varchar("manufacturer", { length: 20 }),
  modelGroup: varchar("model_group", { length: 50 }),
  model: varchar("model", { length: 50 }),
  grade: varchar("grade", { length: 50 }),
  trim: varchar("trim", { length: 50 }),
  fuelType: varchar("fuel_type", { length: 16 }),
  transmission: varchar("transmission", { length: 16 }),
  displacement: integer("displacement"),
  colorName: varchar("color_name", { length: 50 }),
  modelYear: integer("model_year"),
  firstRegistrationDate: integer("first_registration_date"),
  distance: integer("distance"),
  price: integer("price"),
  originPrice: integer("origin_price"),
  sellType: varchar("sell_type", { length: 50 }),
  location: varchar("location", { length: 20 }),
  detailUrl: varchar("detail_url", { length: 1024 }),
  photo: varchar("photo", { length: 1024 }),
  hasOptions: text("has_options"),
});

export const vehiclesInspect = pgTable("vehicles_inspect", {
  vehicleId: integer("vehicle_id").primaryKey().references(() => vehicles.vehicleId),
  warrantyType: varchar("warranty_type", { length: 50 }),
  tuning: varchar("tuning", { length: 50 }),
  changeUsage: varchar("change_usage", { length: 16 }),
  recall: varchar("recall", { length: 16 }),
  recallStatus: varchar("recall_status", { length: 16 }),
  accidentHistory: varchar("accident_history", { length: 16 }),
  simpleRepair: varchar("simple_repair", { length: 16 }),
});

export const vehiclesInsurance = pgTable("vehicles_insurance", {
  vehicleId: integer("vehicle_id").primaryKey().references(() => vehicles.vehicleId),
  vehicleNo: varchar("vehicle_no", { length: 20 }),
  ownerChangeCnt: integer("owner_change_cnt"),
  myAccidentCnt: integer("my_accident_cnt"),
  myAccidentCost: integer("my_accident_cost"),
  otherAccidentCnt: integer("other_accident_cnt"),
  otherAccidentCost: integer("other_accident_cost"),
  isDisclosed: integer("is_disclosed"),
});

export const hyundaiReviews = pgTable("hyundai_segment_purchases", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  carType: varchar("car_type", { length: 16 }),
  manufacturer: varchar("manufacturer", { length: 20 }),
  model: varchar("model", { length: 50 }),
  age: integer("age"),
  gender: varchar("gender", { length: 16 }),
  satisfaction: real("satisfaction"),
  review: varchar("review", { length: 2048 }),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id").notNull(),
  userMessage: text("user_message").notNull(),
  aiResponse: text("ai_response"),
  vehicleRecommendations: text("vehicle_recommendations"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  vehicleId: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type VehicleInspect = typeof vehiclesInspect.$inferSelect;
export type VehicleInsurance = typeof vehiclesInsurance.$inferSelect;
export type HyundaiReview = typeof hyundaiReviews.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
