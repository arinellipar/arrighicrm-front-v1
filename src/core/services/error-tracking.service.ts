/**
 * Serviço de rastreamento de erros
 * Integrado com Datadog RUM
 */

import { datadogError } from "./datadog-error.service";

export interface ErrorContext {
  userId?: number;
  userName?: string;
  route?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export class ErrorTrackingService {
  private static instance: ErrorTrackingService;
  private isProduction = process.env.NODE_ENV === "production";

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorTrackingService {
    if (!ErrorTrackingService.instance) {
      ErrorTrackingService.instance = new ErrorTrackingService();
    }
    return ErrorTrackingService.instance;
  }

  /**
   * Configurar handlers globais de erro
   */
  private setupGlobalErrorHandlers() {
    if (typeof window === "undefined") return;

    // Capturar erros não tratados
    window.addEventListener("error", (event) => {
      this.captureError(event.error, {
        action: "unhandled_error",
        metadata: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Capturar promises rejeitadas
    window.addEventListener("unhandledrejection", (event) => {
      this.captureError(event.reason, {
        action: "unhandled_promise_rejection",
      });
    });
  }

  /**
   * Capturar erro
   */
  captureError(error: Error | unknown, context?: ErrorContext) {
    const errorInfo = this.formatError(error);

    // Log no console em desenvolvimento
    if (!this.isProduction) {
      console.error("🔴 Error captured:", errorInfo, context);
    }

    // Enviar para Datadog
    datadogError.captureError(
      error instanceof Error ? error : new Error(errorInfo.message),
      context
    );

    // Salvar no localStorage para debug
    this.saveToLocalStorage(errorInfo, context);
  }

  /**
   * Formatar erro
   */
  private formatError(error: Error | unknown) {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      name: "UnknownError",
      message: String(error),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Salvar no localStorage para debug
   */
  private saveToLocalStorage(errorInfo: any, context?: ErrorContext) {
    try {
      const errors = this.getStoredErrors();
      errors.push({ ...errorInfo, context });

      // Manter apenas últimos 10 erros
      const recentErrors = errors.slice(-10);

      localStorage.setItem("app_errors", JSON.stringify(recentErrors));
    } catch (e) {
      // Ignorar erros ao salvar
    }
  }

  /**
   * Obter erros armazenados
   */
  getStoredErrors(): any[] {
    try {
      const stored = localStorage.getItem("app_errors");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Limpar erros armazenados
   */
  clearStoredErrors() {
    localStorage.removeItem("app_errors");
  }

  /**
   * Capturar erro de API
   */
  captureApiError(
    endpoint: string,
    method: string,
    statusCode: number,
    error: any
  ) {
    this.captureError(error, {
      action: "api_error",
      metadata: {
        endpoint,
        method,
        statusCode,
      },
    });
  }

  /**
   * Capturar erro de validação
   */
  captureValidationError(field: string, message: string, data?: any) {
    this.captureError(new Error(message), {
      action: "validation_error",
      metadata: {
        field,
        data,
      },
    });
  }
}

// Export singleton
export const errorTracking = ErrorTrackingService.getInstance();
