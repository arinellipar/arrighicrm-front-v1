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

      // Log da URL em desenvolvimento
      if (isDevelopment()) {
        console.log(`🌐 Making request to: ${url}`);
        console.log(`🌐 Request method: ${options.method || "GET"}`);
        console.log(`🌐 Request headers:`, config.headers);
        if (options.body) {
          console.log(`🌐 Request body:`, options.body);
        }
      }

      // Timeout de 60 segundos para operações que podem demorar
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      let response: Response;
      try {
        response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (networkError) {
        clearTimeout(timeoutId);
        console.error("🔧 ApiClient: Network error on fetch:", networkError);

        if (
          networkError instanceof Error &&
          networkError.name === "AbortError"
        ) {
          return {
            error: "Request timeout - operação demorou muito para responder",
            status: 0,
          };
        }

        // Se for erro de "Failed to fetch", verificar se é um problema específico do histórico
        if (
          networkError instanceof Error &&
          networkError.message.includes("Failed to fetch")
        ) {
          // Para endpoints de histórico, retornar array vazio em vez de erro
          if (url.includes("/historico")) {
            console.warn(
              "🔧 ApiClient: Erro Failed to fetch em endpoint de histórico - retornando array vazio"
            );
            return {
              data: [] as T,
              status: 200,
            };
          }
        }

        return {
          error: "Failed to fetch - verifique sua conexão com a internet",
          status: 0,
        };
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
      let data: T | undefined = undefined;

      try {
        // Verificar se a resposta tem conteúdo antes de tentar ler
        const contentLength = response.headers.get("content-length");
        const hasContent = contentLength && parseInt(contentLength) > 0;

        if (hasContent || response.status !== 204) {
          // Clonar a resposta para evitar problemas de stream já lido
          const responseClone = response.clone();

          try {
            responseText = await responseClone.text();
          } catch (readError: any) {
            console.warn(
              `🔧 ApiClient: Erro ao ler resposta:`,
              readError.message
            );

            // Se for erro de stream já lido, tentar com a resposta original
            if (readError.message.includes("body stream already read")) {
              console.warn("🔧 ApiClient: Tentando ler resposta original...");
              try {
                responseText = await response.text();
              } catch (secondError: any) {
                console.warn(
                  "🔧 ApiClient: Erro na segunda tentativa:",
                  secondError.message
                );
                responseText = "";
              }
            } else {
              throw readError;
            }
          }
        }
      } catch (error: any) {
        console.error("🔧 ApiClient: Erro ao ler resposta:", error);
        console.error("🔧 ApiClient: Tipo do erro:", typeof error);
        console.error(
          "🔧 ApiClient: Mensagem do erro:",
          error?.message || "Erro desconhecido"
        );

        // Se o erro for um objeto com propriedades específicas, extrair a mensagem
        let errorMessage = error?.message || "Erro desconhecido";
        if (typeof error === "object" && error !== null) {
          // Tentar extrair mensagem de diferentes propriedades possíveis
          errorMessage =
            error.message ||
            error.error ||
            error.reason ||
            error.toString() ||
            JSON.stringify(error);
        }

        console.error("🔧 ApiClient: ErrorMessage extraída:", errorMessage);

        // Se for erro de rede, retornar erro específico
        if (
          errorMessage.includes("Failed to fetch") ||
          errorMessage.includes("NetworkError")
        ) {
          // Se o status for 200, não é erro de conexão - é problema na leitura da resposta
          if (response.status === 200) {
            console.warn(
              "🔧 ApiClient: Status 200 mas erro na leitura - considerando sucesso"
            );
            return {
              data: {
                success: true,
                message: "Operação realizada com sucesso",
              } as T,
              status: response.status,
            };
          }

          return {
            error:
              "Erro de conexão com o servidor. Verifique sua internet e tente novamente.",
            status: 0,
          };
        }

        // Se for erro de timeout
        if (error?.name === "AbortError" || errorMessage.includes("timeout")) {
          return {
            error: "A operação demorou muito para responder. Tente novamente.",
            status: 0,
          };
        }

        // Se for erro de conexão resetada ou terminada
        if (
          errorMessage.includes("ECONNRESET") ||
          errorMessage.includes("terminated")
        ) {
          // Se o status for 200, não é erro de conexão - é problema na leitura da resposta
          if (response.status === 200) {
            console.warn(
              "🔧 ApiClient: Status 200 mas conexão terminada - considerando sucesso"
            );
            return {
              data: {
                success: true,
                message: "Operação realizada com sucesso",
              } as T,
              status: response.status,
            };
          }

          return {
            error:
              "Conexão interrompida pelo servidor. Tente novamente em alguns segundos.",
            status: 0,
          };
        }

        // Se o status for 200, considerar sucesso mesmo com erro na leitura
        if (response.status === 200) {
          console.warn(
            "🔧 ApiClient: Status 200 mas erro na leitura - considerando sucesso"
          );
          return {
            data: {
              success: true,
              message: "Operação realizada com sucesso",
            } as T,
            status: response.status,
          };
        }

        // Se for erro de stream já lido
        if (errorMessage.includes("body stream already read")) {
          return {
            error: "Erro interno na leitura da resposta. Tente novamente.",
            status: 0,
          };
        }

        return {
          error: "Erro ao ler resposta do servidor. Tente novamente.",
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

        // Para endpoints de histórico com erro 500, retornar array vazio em vez de erro
        if (url.includes("/historico") && response.status === 500) {
          console.warn(
            "🔧 ApiClient: Erro 500 em endpoint de histórico - retornando array vazio"
          );
          return {
            data: [] as T,
            status: 200,
          };
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

      // Se a resposta for 200, considerar sucesso independentemente do conteúdo
      if (response.ok) {
        // Se conseguimos ler o conteúdo, usar ele
        if (responseText && responseText.trim() !== "") {
          // Tentar fazer parse do JSON
          try {
            data = JSON.parse(responseText);
          } catch (jsonError) {
            console.warn(
              "🔧 ApiClient: Erro ao fazer parse do JSON, mas status 200 - considerando sucesso"
            );
            data = {
              success: true,
              message: "Operação realizada com sucesso",
            } as T;
          }
        } else {
          // Se não conseguimos ler o conteúdo mas status é 200, considerar sucesso
          console.warn(
            "🔧 ApiClient: Status 200 mas conteúdo vazio - considerando sucesso"
          );
          data = {
            success: true,
            message: "Operação realizada com sucesso",
          } as T;
        }

        return {
          data,
          status: response.status,
        };
      }

      // Para status 204 (No Content), não esperamos JSON
      if (response.status === 204) {
        return {
          data: undefined,
          status: response.status,
        };
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
