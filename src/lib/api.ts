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
    console.log("🔧 ApiClient: Base URL configurada como:", this.baseUrl);

    // Verificação adicional para garantir que a URL está correta
    if (!this.baseUrl || this.baseUrl === "undefined") {
      console.error("🔧 ApiClient: ERRO - Base URL está undefined ou vazia!");
      throw new Error("API Base URL não foi configurada corretamente");
    }
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
          Accept: "application/json",
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
        console.error("🔧 ApiClient: Erro na resposta:", errorText);

        // Log de erro em desenvolvimento
        if (isDevelopment()) {
          console.error(`API Error: ${response.status} - ${errorText}`);
        }

        return {
          error: errorText || `HTTP error! status: ${response.status}`,
          status: response.status,
        };
      }

      // Verificar se a resposta é JSON
      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text();
        console.error(
          `Non-JSON response received: ${contentType}`,
          responseText
        );
        return {
          error: `Expected JSON response but got ${contentType}`,
          status: response.status,
        };
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // Se não conseguir fazer parse do JSON, pode ser uma resposta vazia
        console.error("🔧 ApiClient: Erro ao fazer parse do JSON:", jsonError);
        if (isDevelopment()) {
          console.warn(`JSON parse error for ${endpoint}:`, jsonError);
        }
        data = null;
      }

      // Log de sucesso em desenvolvimento
      if (isDevelopment()) {
        console.log(`API Success: ${response.status} - ${endpoint}`, data);
      }

      // Log adicional para debug em desenvolvimento
      if (isDevelopment()) {
        console.log(`🔧 ApiClient: Resposta para ${endpoint}:`, {
          status: response.status,
          data: data,
          hasData: !!data,
          dataType: typeof data,
          isArray: Array.isArray(data),
        });
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error("🔧 ApiClient: Erro na requisição:", error);

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
