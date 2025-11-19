"use client";

import { useState } from "react";
import { datadogError } from "@/core/services/datadog-error.service";
import { errorTracking } from "@/core/services/error-tracking.service";

export default function DatadogTestPage() {
  const [result, setResult] = useState<string>("");

  const handleSimpleError = () => {
    try {
      throw new Error("Teste: Erro simples do Datadog");
    } catch (error) {
      datadogError.captureError(error);
      setResult("✅ Erro simples enviado para o Datadog!");
    }
  };

  const handleErrorWithContext = () => {
    try {
      throw new Error("Teste: Erro com contexto");
    } catch (error) {
      datadogError.captureError(error, {
        route: "/datadog-test",
        action: "test_error_with_context",
        metadata: {
          testType: "manual",
          timestamp: new Date().toISOString(),
        },
      });
      setResult("✅ Erro com contexto enviado para o Datadog!");
    }
  };

  const handleApiError = () => {
    datadogError.captureApiError(
      "/api/test",
      "POST",
      500,
      new Error("Teste: Erro de API"),
      { message: "Server error during test" }
    );
    setResult("✅ Erro de API enviado para o Datadog!");
  };

  const handleValidationError = () => {
    datadogError.captureValidationError(
      "email",
      "Teste: Email inválido",
      { email: "invalid-email", testMode: true }
    );
    setResult("✅ Erro de validação enviado para o Datadog!");
  };

  const handleComponentError = () => {
    datadogError.captureComponentError(
      new Error("Teste: Erro em componente React"),
      "DatadogTestPage",
      "  at DatadogTestPage\n  at App"
    );
    setResult("✅ Erro de componente enviado para o Datadog!");
  };

  const handleUnhandledError = () => {
    // Este erro será capturado pelos handlers globais
    setTimeout(() => {
      throw new Error("Teste: Erro não tratado (será capturado automaticamente)");
    }, 100);
    setResult("⚠️ Erro não tratado lançado - verifique o console!");
  };

  const handlePromiseRejection = () => {
    // Esta promise rejeitada será capturada automaticamente
    Promise.reject(new Error("Teste: Promise rejeitada (será capturada automaticamente)"));
    setResult("⚠️ Promise rejeitada - verifique o console!");
  };

  const testUserContext = () => {
    datadogError.setUser(999, "Usuário Teste", "teste@example.com");
    datadogError.addGlobalContext("testMode", true);
    setResult("✅ Contexto do usuário definido!");
  };

  const clearUserContext = () => {
    datadogError.clearUser();
    datadogError.removeGlobalContext("testMode");
    setResult("✅ Contexto do usuário limpo!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🐕 Teste do Datadog Error Monitoring
          </h1>
          <p className="text-gray-600 mb-8">
            Use os botões abaixo para testar diferentes tipos de captura de erros.
            Verifique o Datadog em:{" "}
            <a
              href="https://us5.datadoghq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              https://us5.datadoghq.com
            </a>
          </p>

          {result && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">{result}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Erros Básicos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={handleSimpleError}
                  className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  1. Erro Simples
                </button>
                <button
                  onClick={handleErrorWithContext}
                  className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  2. Erro com Contexto
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Erros Específicos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={handleApiError}
                  className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  3. Erro de API
                </button>
                <button
                  onClick={handleValidationError}
                  className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  4. Erro de Validação
                </button>
                <button
                  onClick={handleComponentError}
                  className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  5. Erro de Componente
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Erros Automáticos (Não Tratados)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={handleUnhandledError}
                  className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  6. Erro Não Tratado
                </button>
                <button
                  onClick={handlePromiseRejection}
                  className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  7. Promise Rejeitada
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Gerenciar Contexto do Usuário
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={testUserContext}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  8. Definir Usuário
                </button>
                <button
                  onClick={clearUserContext}
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  9. Limpar Usuário
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">
              ⚠️ Instruções
            </h3>
            <ul className="text-yellow-800 space-y-1 text-sm">
              <li>1. Clique em qualquer botão para gerar um erro de teste</li>
              <li>
                2. Abra o Datadog e navegue para RUM → Error Tracking
              </li>
              <li>3. Filtre por Service: "crm" e Environment: "prod"</li>
              <li>4. Você deverá ver o erro aparecer em alguns segundos</li>
              <li>
                5. Clique no erro para ver detalhes, stack trace e contexto
              </li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              📊 Informações da Configuração
            </h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>
                <strong>Service:</strong> crm
              </li>
              <li>
                <strong>Environment:</strong> prod
              </li>
              <li>
                <strong>Site:</strong> us5.datadoghq.com
              </li>
              <li>
                <strong>Session Sample Rate:</strong> 100%
              </li>
              <li>
                <strong>Session Replay:</strong> 20%
              </li>
            </ul>
          </div>

          <div className="mt-8 text-center">
            <a
              href="/"
              className="text-blue-600 hover:underline"
            >
              ← Voltar para Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}



