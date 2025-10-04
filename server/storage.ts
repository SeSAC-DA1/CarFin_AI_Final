import { 
  type User, 
  type InsertUser, 
  type Vehicle, 
  type InsertVehicle,
  type VehicleInspect,
  type VehicleInsurance,
  type HyundaiReview,
  type Conversation,
  type InsertConversation
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface VehicleSearchFilters {
  minPrice?: number;
  maxPrice?: number;
  manufacturer?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  fuelType?: string;
  carType?: string;
  location?: string;
  limit?: number;
  offset?: number;
}

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
  
  getReviewsByModel(model: string): Promise<HyundaiReview[]>;
  
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversationsBySession(sessionId: string): Promise<Conversation[]>;
}

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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async searchVehicles(filters: VehicleSearchFilters): Promise<Vehicle[]> {
    let results = Array.from(this.vehicles.values());
    
    if (filters.minPrice) {
      results = results.filter(v => v.price && v.price >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      results = results.filter(v => v.price && v.price <= filters.maxPrice!);
    }
    if (filters.minYear) {
      results = results.filter(v => v.modelYear && v.modelYear >= filters.minYear!);
    }
    if (filters.maxYear) {
      results = results.filter(v => v.modelYear && v.modelYear <= filters.maxYear!);
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
    return { vehicle };
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const vehicleId = this.vehicles.size + 1;
    const vehicle: Vehicle = { 
      ...insertVehicle,
      vehicleId
    };
    this.vehicles.set(vehicleId, vehicle);
    return vehicle;
  }

  async getVehicleCount(): Promise<number> {
    return this.vehicles.size;
  }

  async getReviewsByModel(model: string): Promise<HyundaiReview[]> {
    return [];
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      createdAt: new Date()
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

import { db } from "./db";
import { 
  users as usersTable, 
  vehicles as vehiclesTable,
  vehiclesInspect,
  vehiclesInsurance,
  hyundaiReviews,
  conversations as conversationsTable
} from "@shared/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

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
    
    if (filters.minPrice) {
      conditions.push(gte(vehiclesTable.price, filters.minPrice));
    }
    if (filters.maxPrice) {
      conditions.push(lte(vehiclesTable.price, filters.maxPrice));
    }
    if (filters.minYear) {
      conditions.push(gte(vehiclesTable.modelYear, filters.minYear));
    }
    if (filters.maxYear) {
      conditions.push(lte(vehiclesTable.modelYear, filters.maxYear));
    }
    if (filters.fuelType) {
      conditions.push(eq(vehiclesTable.fuelType, filters.fuelType));
    }
    if (filters.carType) {
      conditions.push(eq(vehiclesTable.carType, filters.carType));
    }
    if (filters.manufacturer) {
      conditions.push(eq(vehiclesTable.manufacturer, filters.manufacturer));
    }
    if (filters.model) {
      conditions.push(eq(vehiclesTable.model, filters.model));
    }
    if (filters.location) {
      conditions.push(eq(vehiclesTable.location, filters.location));
    }

    const limit = filters.limit || 10;
    const offset = filters.offset || 0;

    const query = db.select().from(vehiclesTable);
    
    if (conditions.length > 0) {
      return query.where(and(...conditions)).limit(limit).offset(offset);
    }
    
    return query.limit(limit).offset(offset);
  }

  async getVehicleById(id: number): Promise<Vehicle | undefined> {
    const result = await db.select().from(vehiclesTable).where(eq(vehiclesTable.vehicleId, id)).limit(1);
    return result[0];
  }

  async getVehicleWithDetails(id: number): Promise<{ vehicle: Vehicle; inspect?: VehicleInspect; insurance?: VehicleInsurance; } | undefined> {
    const vehicle = await this.getVehicleById(id);
    if (!vehicle) return undefined;

    const inspect = await db.select().from(vehiclesInspect).where(eq(vehiclesInspect.vehicleId, id)).limit(1);
    const insurance = await db.select().from(vehiclesInsurance).where(eq(vehiclesInsurance.vehicleId, id)).limit(1);

    return {
      vehicle,
      inspect: inspect[0],
      insurance: insurance[0]
    };
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const result = await db.insert(vehiclesTable).values(insertVehicle).returning();
    return result[0];
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
}

export const storage = new DBStorage();
