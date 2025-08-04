// src/lib/api.ts
import { getApiUrl, isDevelopment } from "../../env.config";

const API_BASE_URL = getApiUrl();

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      // Log da URL em desenvolvimento
      if (isDevelopment()) {
        console.log(`🌐 Making request to: ${url}`);
      }
      const config: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      };

      // Adiciona timeout para requisições
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        if (isDevelopment()) {
          console.error(`Request timeout after 15 seconds: ${url}`);
        }
      }, 15000);

      config.signal = controller.signal;

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();

        // Log de erro em desenvolvimento
        if (isDevelopment()) {
          console.error(`API Error: ${response.status} - ${errorText}`);
        }

        return {
          error: errorText || `HTTP error! status: ${response.status}`,
          status: response.status,
        };
      }

      const data = await response.json();

      // Log de sucesso em desenvolvimento
      if (isDevelopment()) {
        console.log(`API Success: ${response.status} - ${endpoint}`);
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      // Log de erro em desenvolvimento
      if (isDevelopment()) {
        console.error(
          `Network Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );

        // Log específico para abort signals
        if (error instanceof Error && error.name === "AbortError") {
          console.error(`Request was aborted: ${url}`);
        }
      }

      return {
        error: error instanceof Error ? error.message : "Network error",
        status: 0,
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
