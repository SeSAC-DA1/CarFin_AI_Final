import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface CarfinApiConfig {
  baseURL: string;
  timeout: number;
}

interface VehicleSearchParams {
  query: string;
  limit?: number;
  budget_min?: number;
  budget_max?: number;
}

interface VehicleRankingResponse {
  success: boolean;
  vehicles: any[];
  totalCount: number;
  processingTime: number;
}

interface DatabaseStatusResponse {
  success: boolean;
  isConnected: boolean;
  totalVehicles: number;
  availableVehicles: number;
  currentTime: string;
  mode: string;
  sellTypes: Array<{
    sell_type: string;
    count: string;
  }>;
}

class CarfinApiService {
  private api: AxiosInstance;

  constructor(config: CarfinApiConfig) {
    this.api = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`🔗 CarFin API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('🚨 CarFin API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ CarFin API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('🚨 CarFin API Response Error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check database status and connection
   */
  async getDatabaseStatus(): Promise<DatabaseStatusResponse> {
    try {
      const response = await this.api.get<DatabaseStatusResponse>('/api/database/status');
      return response.data;
    } catch (error) {
      console.error('Failed to get database status:', error);
      throw new Error('CarFin database connection failed');
    }
  }

  /**
   * Search and rank vehicles
   */
  async searchVehicles(params: VehicleSearchParams): Promise<VehicleRankingResponse> {
    try {
      const response = await this.api.get<VehicleRankingResponse>('/api/dashboard/ranking', {
        params: {
          query: params.query,
          limit: params.limit || 10,
          budget_min: params.budget_min || 1000,
          budget_max: params.budget_max || 10000,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search vehicles:', error);
      throw new Error('Vehicle search failed');
    }
  }

  /**
   * Start A2A chat session
   */
  async startChatSession(question: string, context: string = 'simple_analysis'): Promise<any> {
    try {
      const response = await this.api.get('/api/chat/ws', {
        params: {
          question: encodeURIComponent(question),
          context,
          memory: '',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to start chat session:', error);
      throw new Error('Chat session creation failed');
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const status = await this.getDatabaseStatus();
      return status.success && status.isConnected;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
const carfinConfig: CarfinApiConfig = {
  baseURL: process.env.CARFIN_API_URL || 'http://localhost:3007',
  timeout: parseInt(process.env.CARFIN_API_TIMEOUT || '30000'),
};

export const carfinApi = new CarfinApiService(carfinConfig);
export type { VehicleSearchParams, VehicleRankingResponse, DatabaseStatusResponse };