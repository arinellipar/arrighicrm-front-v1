// src/lib/api.ts
import { getApiUrl, isDevelopment } from "../../env.config";

const API_BASE_URL = getApiUrl();

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  public baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    console.log("🔧 ApiClient: Base URL configurada como:", this.baseUrl);
    console.log("🔧 ApiClient: NODE_ENV =", process.env.NODE_ENV);

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
      const config: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...options.headers,
        },
        ...options,
      };

      // Log da URL sempre (para debug de produção)
      console.log(`🌐 Making request to: ${url}`);
      console.log(`🌐 Request method: ${options.method || "GET"}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 Base URL: ${this.baseUrl}`);
      console.log(`🌐 Full URL constructed: ${url}`);
      console.log(`🌐 API_BASE_URL from config:`, getApiUrl());

      if (isDevelopment()) {
        console.log(`🌐 Request headers:`, config.headers);
      }

      // Timeout desabilitado por solicitação
      let response: Response;
      try {
        response = await fetch(url, config);
      } catch (networkError) {
        console.error("🔧 ApiClient: Network error on fetch:", networkError);
        return { error: "Failed to fetch", status: 0 };
      }

      // Debug logging
      console.log("🔧 ApiClient: Response status:", response.status);
      console.log("🔧 ApiClient: Response ok:", response.ok);
      console.log(
        "🔧 ApiClient: Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      // Read response body once and store it
      let responseText = "";
      let data = null;

      try {
        responseText = await response.text();
      } catch (error) {
        console.error("🔧 ApiClient: Erro ao ler resposta:", error);
        return {
          error: "Erro ao ler resposta do servidor",
          status: response.status,
        };
      }

      if (!response.ok) {
        console.error("🔧 ApiClient: Erro na resposta:", responseText);
        console.error("🔧 ApiClient: Status:", response.status);
        console.error("🔧 ApiClient: URL:", url);
        console.error(
          "🔧 ApiClient: Headers:",
          Object.fromEntries(response.headers.entries())
        );

        // Log de erro em desenvolvimento
        if (isDevelopment()) {
          console.error(`API Error: ${response.status} - ${responseText}`);
        }

        // Se a resposta estiver vazia, fornecer uma mensagem mais específica
        if (!responseText || responseText.trim() === "") {
          return {
            error: `Resposta vazia do servidor (Status: ${response.status}). Verifique se o backend está rodando.`,
            status: response.status,
          };
        }

        return {
          error: responseText || `HTTP error! status: ${response.status}`,
          status: response.status,
        };
      }

      // Verificar se a resposta é JSON
      const contentType = response.headers.get("content-type");

      // Para status 204 (No Content), não esperamos JSON
      if (response.status === 204) {
        return {
          data: undefined,
          status: response.status,
        };
      }

      if (!contentType || !contentType.includes("application/json")) {
        console.error(
          `Non-JSON response received: ${contentType}`,
          responseText
        );
        return {
          error: `Expected JSON response but got ${contentType}`,
          status: response.status,
        };
      }

      // Parse JSON from the stored response text
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        // Se não conseguir fazer parse do JSON, pode ser uma resposta vazia
        console.error("🔧 ApiClient: Erro ao fazer parse do JSON:", jsonError);
        console.error("🔧 ApiClient: Response text:", responseText);
        if (isDevelopment()) {
          console.warn(`JSON parse error for ${endpoint}:`, jsonError);
        }
        data = null;
      }

      // Log de sucesso sempre (para debug de produção)
      console.log(`✅ API Success: ${response.status} - ${endpoint}`);
      console.log(
        `✅ Data type: ${
          Array.isArray(data) ? `Array[${data.length}]` : typeof data
        }`
      );
      if (Array.isArray(data)) {
        console.log(`✅ Array length: ${data.length}`);
        if (data.length > 0) {
          console.log(`✅ First item keys:`, Object.keys(data[0] || {}));
        }
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

  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
