/**
 * Serviço de monitoramento de erros com Datadog
 * Centraliza o envio de erros para o Datadog RUM
 */

import { datadogRum } from "@datadog/browser-rum";

export interface DatadogErrorContext {
  userId?: number;
  userName?: string;
  userEmail?: string;
  route?: string;
  action?: string;
  component?: string;
  metadata?: Record<string, any>;
}

export class DatadogErrorService {
  private static instance: DatadogErrorService;

  private constructor() {
    // Inicialização do serviço
  }

  static getInstance(): DatadogErrorService {
    if (!DatadogErrorService.instance) {
      DatadogErrorService.instance = new DatadogErrorService();
    }
    return DatadogErrorService.instance;
  }

  /**
   * Capturar erro e enviar para o Datadog
   */
  captureError(error: Error | unknown, context?: DatadogErrorContext) {
    try {
      const errorObj = this.normalizeError(error);

      // Adicionar contexto ao Datadog
      if (context) {
        if (context.userId || context.userName || context.userEmail) {
          datadogRum.setUser({
            id: context.userId?.toString(),
            name: context.userName,
            email: context.userEmail,
          });
        }

        // Adicionar contexto adicional
        if (context.metadata) {
          datadogRum.addError(errorObj, {
            ...context.metadata,
            route: context.route,
            action: context.action,
            component: context.component,
          });
        } else {
          datadogRum.addError(errorObj, {
            route: context.route,
            action: context.action,
            component: context.component,
          });
        }
      } else {
        datadogRum.addError(errorObj);
      }

      // Log no console em desenvolvimento
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 Datadog Error captured:", errorObj, context);
      }
    } catch (err) {
      console.error("Failed to capture error in Datadog:", err);
    }
  }

  /**
   * Capturar erro de API
   */
  captureApiError(
    endpoint: string,
    method: string,
    statusCode: number,
    error: any,
    responseData?: any
  ) {
    const errorMessage = error?.message || `API Error: ${statusCode}`;
    const errorObj = new Error(errorMessage);

    this.captureError(errorObj, {
      action: "api_error",
      metadata: {
        endpoint,
        method,
        statusCode,
        responseData: responseData ? JSON.stringify(responseData).substring(0, 500) : undefined,
        errorType: "API_ERROR",
      },
    });
  }

  /**
   * Capturar erro de validação
   */
  captureValidationError(field: string, message: string, data?: any) {
    const error = new Error(`Validation Error: ${message}`);

    this.captureError(error, {
      action: "validation_error",
      metadata: {
        field,
        data,
        errorType: "VALIDATION_ERROR",
      },
    });
  }

  /**
   * Capturar erro de autenticação
   */
  captureAuthError(message: string, userId?: number) {
    const error = new Error(`Auth Error: ${message}`);

    this.captureError(error, {
      userId,
      action: "auth_error",
      metadata: {
        errorType: "AUTH_ERROR",
      },
    });
  }

  /**
   * Capturar erro de componente React
   */
  captureComponentError(
    error: Error,
    componentName: string,
    componentStack?: string
  ) {
    this.captureError(error, {
      component: componentName,
      action: "component_error",
      metadata: {
        componentStack,
        errorType: "REACT_ERROR",
      },
    });
  }

  /**
   * Adicionar contexto do usuário
   */
  setUser(userId: number, userName?: string, userEmail?: string) {
    try {
      datadogRum.setUser({
        id: userId.toString(),
        name: userName,
        email: userEmail,
      });
    } catch (err) {
      console.error("Failed to set user in Datadog:", err);
    }
  }

  /**
   * Limpar contexto do usuário
   */
  clearUser() {
    try {
      datadogRum.clearUser();
    } catch (err) {
      console.error("Failed to clear user in Datadog:", err);
    }
  }

  /**
   * Adicionar contexto global
   */
  addGlobalContext(key: string, value: any) {
    try {
      datadogRum.setGlobalContextProperty(key, value);
    } catch (err) {
      console.error("Failed to add global context in Datadog:", err);
    }
  }

  /**
   * Remover contexto global
   */
  removeGlobalContext(key: string) {
    try {
      datadogRum.removeGlobalContextProperty(key);
    } catch (err) {
      console.error("Failed to remove global context in Datadog:", err);
    }
  }

  /**
   * Normalizar erro para objeto Error
   */
  private normalizeError(error: Error | unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    if (typeof error === "string") {
      return new Error(error);
    }

    if (error && typeof error === "object") {
      return new Error(JSON.stringify(error));
    }

    return new Error("Unknown error");
  }
}

// Export singleton
export const datadogError = DatadogErrorService.getInstance();



