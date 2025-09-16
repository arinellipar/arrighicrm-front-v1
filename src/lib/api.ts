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
      // Verificar se há token de autenticação ou usuário logado
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const isAuthenticated =
        typeof window !== "undefined"
          ? localStorage.getItem("isAuthenticated") === "true"
          : false;
      const user =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;

      // Tentar obter ID do usuário
      let usuarioId = null;
      if (user) {
        try {
          const userData = JSON.parse(user);
          // Tentar diferentes propriedades possíveis para o ID do usuário
          usuarioId =
            userData.UsuarioId ||
            userData.usuarioId ||
            userData.id ||
            userData.Id ||
            userData.userId;
        } catch (e) {
          console.warn("Erro ao fazer parse do usuário:", e);
        }
      }

      // Log para debug em desenvolvimento
      if (isDevelopment()) {
        console.log("🔧 ApiClient: Dados do usuário:", {
          user,
          usuarioId,
          isAuthenticated,
        });
      }

      const config: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          // Só enviar X-Usuario-Id se tivermos um ID válido
          ...(usuarioId && { "X-Usuario-Id": usuarioId.toString() }),
          ...options.headers,
        },
        ...options,
      };

      // Log apenas em desenvolvimento
      if (isDevelopment()) {
        console.log(`🌐 Making request to: ${url}`);
        console.log(`🌐 Request method: ${options.method || "GET"}`);
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

      // Debug logging apenas em desenvolvimento
      if (isDevelopment()) {
        console.log("🔧 ApiClient: Response status:", response.status);
        console.log("🔧 ApiClient: Response ok:", response.ok);
      }

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

        // Se for erro de autenticação em endpoints de dados, tentar novamente sem autenticação
        if (response.status === 401 && this.isDataEndpoint(endpoint)) {
          console.log(
            "🔄 Tentando requisição sem autenticação para endpoint de dados"
          );
          return this.requestWithoutAuth(endpoint, options);
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

      // Log apenas em desenvolvimento
      if (isDevelopment()) {
        console.log(`✅ API Success: ${response.status} - ${endpoint}`);
        console.log(
          `✅ Data type: ${
            Array.isArray(data) ? `Array[${data.length}]` : typeof data
          }`
        );
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

  async delete<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE", ...options });
  }

  // Verificar se é um endpoint de dados que pode funcionar sem autenticação
  private isDataEndpoint(endpoint: string): boolean {
    const dataEndpoints = [
      "/PessoaFisica",
      "/PessoaJuridica",
      "/Usuario",
      "/Cliente",
      "/Consultor",
      "/Filial",
      "/Contrato",
    ];
    return dataEndpoints.some((dataEndpoint) =>
      endpoint.startsWith(dataEndpoint)
    );
  }

  // Fazer requisição sem headers de autenticação
  private async requestWithoutAuth<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const config: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Skip-Auth": "true", // Header para indicar ao backend que pule autenticação
          ...options.headers,
        },
        ...options,
      };

      console.log("🔄 Fazendo requisição sem autenticação:", url);
      const response = await fetch(url, config);

      if (!response.ok) {
        return {
          error: `HTTP error! status: ${response.status}`,
          status: response.status,
        };
      }

      const responseText = await response.text();
      let data = null;

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (error) {
          console.error("Erro ao fazer parse JSON:", error);
        }
      }

      return { data, status: response.status };
    } catch (error) {
      console.error("Erro na requisição sem auth:", error);
      return { error: "Network error", status: 0 };
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
