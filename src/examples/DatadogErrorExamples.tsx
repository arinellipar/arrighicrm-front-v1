/**
 * Exemplos de uso do Datadog Error Tracking
 *
 * Este arquivo contém exemplos de como capturar diferentes tipos de erros
 * e enviá-los para o Datadog RUM.
 */

"use client";

import { datadogError } from "@/core/services/datadog-error.service";
import { errorTracking } from "@/core/services/error-tracking.service";

/**
 * Exemplo 1: Capturar erro simples
 */
export function capturarErroSimples() {
  try {
    // Código que pode falhar
    throw new Error("Erro de exemplo");
  } catch (error) {
    datadogError.captureError(error);
  }
}

/**
 * Exemplo 2: Capturar erro com contexto
 */
export function capturarErroComContexto() {
  try {
    // Código que pode falhar
    throw new Error("Erro com contexto");
  } catch (error) {
    datadogError.captureError(error, {
      userId: 123,
      userName: "João Silva",
      userEmail: "joao@example.com",
      route: "/dashboard",
      action: "load_data",
      metadata: {
        customField: "valor personalizado",
        attemptNumber: 3,
      },
    });
  }
}

/**
 * Exemplo 3: Capturar erro de API
 */
export async function capturarErroDeAPI() {
  try {
    const response = await fetch("/api/data");
    if (!response.ok) {
      throw new Error("Falha na requisição");
    }
    return await response.json();
  } catch (error) {
    datadogError.captureApiError(
      "/api/data",
      "GET",
      500,
      error,
      { message: "Falha ao carregar dados" }
    );
    throw error;
  }
}

/**
 * Exemplo 4: Capturar erro de validação
 */
export function capturarErroDeValidacao(formData: any) {
  if (!formData.email) {
    datadogError.captureValidationError(
      "email",
      "Email é obrigatório",
      formData
    );
  }

  if (formData.email && !formData.email.includes("@")) {
    datadogError.captureValidationError(
      "email",
      "Email inválido",
      { email: formData.email }
    );
  }
}

/**
 * Exemplo 5: Capturar erro de autenticação
 */
export function capturarErroDeAutenticacao(userId?: number) {
  datadogError.captureAuthError(
    "Sessão expirada",
    userId
  );
}

/**
 * Exemplo 6: Definir informações do usuário
 */
export function definirUsuario(userId: number, userName: string, userEmail: string) {
  datadogError.setUser(userId, userName, userEmail);
}

/**
 * Exemplo 7: Limpar informações do usuário (logout)
 */
export function limparUsuario() {
  datadogError.clearUser();
}

/**
 * Exemplo 8: Adicionar contexto global
 */
export function adicionarContextoGlobal() {
  datadogError.addGlobalContext("tenantId", "12345");
  datadogError.addGlobalContext("environment", "production");
}

/**
 * Exemplo 9: Usar ErrorBoundary com nome de componente
 */
export function ExemploComErrorBoundary() {
  return (
    <div>
      {/* O ErrorBoundary agora captura erros e envia para o Datadog automaticamente */}
      <p>Componente protegido por ErrorBoundary</p>
    </div>
  );
}

/**
 * Exemplo 10: Capturar erro em async/await
 */
export async function capturarErroAsync() {
  try {
    const data = await fetchData();
    return data;
  } catch (error) {
    datadogError.captureError(error, {
      action: "fetch_data",
      metadata: {
        errorType: "ASYNC_ERROR",
      },
    });
    throw error;
  }
}

async function fetchData() {
  throw new Error("Erro ao buscar dados");
}

/**
 * Exemplo 11: Usar com error tracking service
 */
export function usarErrorTrackingService() {
  try {
    throw new Error("Erro capturado pelo service");
  } catch (error) {
    // O ErrorTrackingService já envia para o Datadog automaticamente
    errorTracking.captureError(error, {
      route: "/exemplo",
      action: "teste",
    });
  }
}

/**
 * Exemplo 12: Capturar erro em event handler
 */
export function ExemploEventHandler() {
  const handleClick = () => {
    try {
      // Código que pode falhar
      throw new Error("Erro no click");
    } catch (error) {
      datadogError.captureError(error, {
        action: "button_click",
        metadata: {
          buttonId: "submit-button",
        },
      });
    }
  };

  return <button onClick={handleClick}>Clique aqui</button>;
}

/**
 * Exemplo 13: Capturar erro em useEffect
 */
import { useEffect } from "react";

export function ExemploUseEffect() {
  useEffect(() => {
    try {
      // Código que pode falhar
      throw new Error("Erro no useEffect");
    } catch (error) {
      datadogError.captureError(error, {
        component: "ExemploUseEffect",
        action: "mount",
      });
    }
  }, []);

  return <div>Componente com useEffect</div>;
}



