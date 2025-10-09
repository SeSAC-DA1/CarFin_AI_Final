import {
  type User,
  type InsertUser,
  type Vehicle as DBVehicle,
  type InsertVehicle,
  type VehicleInspect,
  type VehicleInsurance,
  type HyundaiReview,
  type Conversation,
  type InsertConversation,
  users as usersTable,
  vehicles as vehiclesTable,
  vehiclesInspect,
  vehiclesInsurance,
  hyundaiReviews,
  conversations as conversationsTable
} from "@shared/schema";
import {
  type Vehicle,
  type VehicleSearchFilters,
  rawToVehicle,
  rawArrayToVehicles
} from "@shared/types/vehicle";

// Re-export for other modules
export type { Vehicle, VehicleSearchFilters };
import { randomUUID } from "crypto";
import { db, pool } from "./db";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  searchVehicles(filters: VehicleSearchFilters): Promise<Vehicle[]>;
  getVehicleById(id: number): Promise<Vehicle | undefined>;
  getVehicleWithDetails(id: number): Promise<{
    vehicle: Vehicle;
    inspect?: VehicleInspect;
    insurance?: VehicleInsurance;
  } | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  getVehicleCount(): Promise<number>;

  // 🆕 AWS RDS 추가 기능
  getVehicleOptions(vehicleId: number): Promise<string[]>;
  getVehicleInsurance(vehicleId: number): Promise<any>;
  getVehicleInspection(vehicleId: number): Promise<any>;

  getReviewsByModel(model: string): Promise<HyundaiReview[]>;

  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversationsBySession(sessionId: string): Promise<Conversation[]>;
}

// This is a temporary, in-memory storage for development and testing.
// It does not persist data across server restarts.
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private vehicles: Map<number, Vehicle>;
  private conversations: Map<string, Conversation>;

  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.conversations = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    // The actual User schema only has id, username, password.
    const user: User = { id, ...insertUser };
    this.users.set(id, user);
    return user;
  }

  async searchVehicles(filters: VehicleSearchFilters): Promise<Vehicle[]> {
    let results = Array.from(this.vehicles.values());

    if (filters.minPrice) {
      results = results.filter(v => v.price !== null && v.price >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      results = results.filter(v => v.price !== null && v.price <= filters.maxPrice!);
    }
    if (filters.minYear) {
        results = results.filter(v => v.modelYear !== null && v.modelYear >= filters.minYear!);
    }
    if (filters.maxYear) {
        results = results.filter(v => v.modelYear !== null && v.modelYear <= filters.maxYear!);
    }
    if (filters.fuelType) {
        results = results.filter(v => v.fuelType === filters.fuelType);
    }
    if (filters.carType) {
        results = results.filter(v => v.carType === filters.carType);
    }
    if (filters.manufacturer) {
        results = results.filter(v => v.manufacturer === filters.manufacturer);
    }
    if (filters.model) {
        results = results.filter(v => v.model === filters.model);
    }

    const offset = filters.offset || 0;
    const limit = filters.limit || 10;

    return results.slice(offset, offset + limit);
  }

  async getVehicleById(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async getVehicleWithDetails(id: number): Promise<{ vehicle: Vehicle; inspect?: VehicleInspect; insurance?: VehicleInsurance; } | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    // MemStorage doesn't have related tables, so it returns only the vehicle.
    return { vehicle };
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const vehicleId = this.vehicles.size + 1;
    // Create a complete Vehicle object with default values for required fields.
    const vehicle: Vehicle = {
      vehicleId: vehicleId,
      manufacturer: '테스트',
      model: 'Test Model',
      modelYear: 2022,
      price: 3000,
      distance: 0,
      fuelType: '가솔린',
      location: '서울',
      photo: undefined,
      detailUrl: undefined,
      options: [],
      carType: undefined,
      grade: undefined,
      transmission: undefined,
      displacement: undefined,
      color: undefined,
      originPrice: undefined,
      myAccidentCost: undefined,
      otherAccidentCost: undefined,
    };
    this.vehicles.set(vehicleId, vehicle);
    return vehicle;
  }

  async getVehicleCount(): Promise<number> {
    return this.vehicles.size;
  }

  async getVehicleOptions(_vehicleId: number): Promise<string[]> {
    // MemStorage doesn't have option_masters table
    return [];
  }

  async getVehicleInsurance(_vehicleId: number): Promise<any> {
    // MemStorage doesn't have insurance_history table
    return null;
  }

  async getVehicleInspection(_vehicleId: number): Promise<any> {
    // MemStorage doesn't have inspections table
    return null;
  }

  async getReviewsByModel(_model: string): Promise<HyundaiReview[]> {
    // MemStorage doesn't store reviews.
    return [];
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = {
      id,
      createdAt: new Date(),
      ...insertConversation,
      userId: insertConversation.userId ?? null,
      aiResponse: insertConversation.aiResponse ?? null,
      vehicleRecommendations: insertConversation.vehicleRecommendations ?? null,
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getConversationsBySession(sessionId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      c => c.sessionId === sessionId
    );
  }
}

export class DBStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(usersTable).values(insertUser).returning();
    return result[0];
  }

  async searchVehicles(filters: VehicleSearchFilters): Promise<Vehicle[]> {
    const conditions = [];
    if (filters.minPrice) conditions.push(gte(vehiclesTable.price, filters.minPrice));
    if (filters.maxPrice) conditions.push(lte(vehiclesTable.price, filters.maxPrice));
    if (filters.minYear) conditions.push(gte(vehiclesTable.modelYear, filters.minYear));
    if (filters.maxYear) conditions.push(lte(vehiclesTable.modelYear, filters.maxYear));
    if (filters.fuelType) conditions.push(eq(vehiclesTable.fuelType, filters.fuelType));
    if (filters.carType) conditions.push(eq(vehiclesTable.carType, filters.carType));
    if (filters.manufacturer) conditions.push(eq(vehiclesTable.manufacturer, filters.manufacturer));
    if (filters.model) conditions.push(eq(vehiclesTable.model, filters.model));
    if (filters.location) conditions.push(eq(vehiclesTable.location, filters.location));

    const limit = filters.limit || 10;
    const offset = filters.offset || 0;

    const query = db.select().from(vehiclesTable);

    let rawResults: DBVehicle[];
    if (conditions.length > 0) {
      rawResults = await query.where(and(...conditions)).limit(limit).offset(offset);
    } else {
      rawResults = await query.limit(limit).offset(offset);
    }

    return rawArrayToVehicles(rawResults);
  }

  async getVehicleById(id: number): Promise<Vehicle | undefined> {
    const result = await db.select().from(vehiclesTable).where(eq(vehiclesTable.vehicleId, id)).limit(1);
    if (!result[0]) return undefined;
    return rawToVehicle(result[0]);
  }

  async getVehicleWithDetails(id: number): Promise<{ vehicle: Vehicle; inspect?: VehicleInspect; insurance?: VehicleInsurance; } | undefined> {
    const vehicle = await this.getVehicleById(id);
    if (!vehicle) return undefined;

    const inspectResult = await db.select().from(vehiclesInspect).where(eq(vehiclesInspect.vehicleId, id)).limit(1);
    const insuranceResult = await db.select().from(vehiclesInsurance).where(eq(vehiclesInsurance.vehicleId, id)).limit(1);

    return {
      vehicle,
      inspect: inspectResult[0],
      insurance: insuranceResult[0]
    };
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const result = await db.insert(vehiclesTable).values(insertVehicle).returning();
    if (!result[0]) {
      throw new Error('Failed to create vehicle');
    }
    return rawToVehicle(result[0]);
  }

  async getVehicleCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(vehiclesTable);
    return result[0]?.count || 0;
  }

  async getReviewsByModel(model: string): Promise<HyundaiReview[]> {
    return db.select().from(hyundaiReviews).where(eq(hyundaiReviews.model, model));
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const result = await db.insert(conversationsTable).values(insertConversation).returning();
    return result[0];
  }

  async getConversationsBySession(sessionId: string): Promise<Conversation[]> {
    return db.select().from(conversationsTable).where(eq(conversationsTable.sessionId, sessionId));
  }

  // 🆕 AWS RDS 추가 기능 구현
  async getVehicleOptions(vehicleId: number): Promise<string[]> {
    try {
      const query = `
        SELECT om.option_name
        FROM vehicle_options vo
        JOIN option_masters om ON vo.option_master_id = om.option_master_id
        WHERE vo.vehicle_id = $1
        ORDER BY om.option_group, om.option_name
      `;
      const result = await pool.query(query, [vehicleId]);
      return result.rows.map((r: any) => r.option_name);
    } catch (error) {
      console.error('옵션 조회 에러:', error);
      return [];
    }
  }

  async getVehicleInsurance(vehicleId: number): Promise<any> {
    try {
      const query = `
        SELECT
          vehicle_id,
          platform,
          my_accident_cnt,
          other_accident_cnt,
          my_accident_cost,
          other_accident_cost,
          total_accident_cnt,
          total_loss_cnt,
          total_loss_date,
          robber_cnt,
          robber_date,
          flood_total_loss_cnt,
          flood_part_loss_cnt,
          flood_date,
          owner_change_cnt,
          car_no_change_cnt,
          government,
          business,
          rental,
          loan,
          not_join_periods
        FROM insurance_history
        WHERE vehicle_id = $1
        LIMIT 1
      `;
      const result = await pool.query(query, [vehicleId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('보험 이력 조회 에러:', error);
      return null;
    }
  }

  async getVehicleInspection(vehicleId: number): Promise<any> {
    try {
      const query = `
        SELECT
          inspection_id,
          vehicle_id,
          platform,
          inspected_at,
          valid_from,
          valid_to,
          mileage_at_inspect,
          accident_history,
          simple_repair,
          waterlog,
          fire_history,
          tuning_exist,
          recall_applicable,
          recall_fulfilled,
          engine_check_ok,
          trans_check_ok,
          guaranty_type,
          image_front,
          image_rear,
          remarks
        FROM inspections
        WHERE vehicle_id = $1
        ORDER BY inspected_at DESC
        LIMIT 1
      `;
      const result = await pool.query(query, [vehicleId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('점검 이력 조회 에러:', error);
      return null;
    }
  }
}

export const storage: IStorage = new DBStorage();
