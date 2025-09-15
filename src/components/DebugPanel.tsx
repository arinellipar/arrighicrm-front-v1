// src/components/DebugPanel.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bug,
  X,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { getApiUrl } from "../../env.config";

interface DebugInfo {
  environment: string;
  apiUrl: string;
  connectivity: "checking" | "connected" | "error";
  lastCheck: Date;
  endpoints: {
    [key: string]: {
      status: "checking" | "success" | "error";
      response?: any;
      error?: string;
    };
  };
}

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    environment: process.env.NODE_ENV || "unknown",
    apiUrl: getApiUrl(),
    connectivity: "checking",
    lastCheck: new Date(),
    endpoints: {},
  });

  const checkEndpoint = async (name: string, endpoint: string) => {
    setDebugInfo((prev) => ({
      ...prev,
      endpoints: {
        ...prev.endpoints,
        [name]: { status: "checking" },
      },
    }));

    try {
      const response = await apiClient.get(endpoint);
      setDebugInfo((prev) => ({
        ...prev,
        endpoints: {
          ...prev.endpoints,
          [name]: {
            status: response.error ? "error" : "success",
            response: response.data,
            error: response.error,
          },
        },
      }));
    } catch (error) {
      setDebugInfo((prev) => ({
        ...prev,
        endpoints: {
          ...prev.endpoints,
          [name]: {
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      }));
    }
  };

  const runFullCheck = async () => {
    setDebugInfo((prev) => ({
      ...prev,
      connectivity: "checking",
      lastCheck: new Date(),
    }));

    const endpoints = [
      { name: "PessoaFisica", endpoint: "/PessoaFisica" },
      { name: "PessoaJuridica", endpoint: "/PessoaJuridica" },
      { name: "Usuario", endpoint: "/Usuario" },
      { name: "Cliente", endpoint: "/Cliente" },
      { name: "Consultor", endpoint: "/Consultor" },
    ];

    let hasError = false;
    for (const { name, endpoint } of endpoints) {
      await checkEndpoint(name, endpoint);
      const result = debugInfo.endpoints[name];
      if (result?.status === "error") {
        hasError = true;
      }
    }

    setDebugInfo((prev) => ({
      ...prev,
      connectivity: hasError ? "error" : "connected",
    }));
  };

  useEffect(() => {
    if (isOpen) {
      runFullCheck();
    }
  }, [isOpen]);

  // Mostrar apenas em produção quando há problemas
  const shouldShow = process.env.NODE_ENV === "production";

  if (!shouldShow) return null;

  return (
    <>
      {/* Botão de Debug */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[9999] p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg"
        title="Debug Panel (Produção)"
      >
        <Bug className="w-5 h-5" />
      </motion.button>

      {/* Panel de Debug */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[9998]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-[9999] overflow-y-auto"
            >
              <div className="p-4 border-b bg-red-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-red-800">
                    Debug Panel
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Informações do Ambiente */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="font-semibold mb-2">Ambiente</h3>
                  <div className="text-sm space-y-1">
                    <div>
                      NODE_ENV: <code>{debugInfo.environment}</code>
                    </div>
                    <div>
                      API URL:{" "}
                      <code className="break-all">{debugInfo.apiUrl}</code>
                    </div>
                    <div>
                      Última verificação:{" "}
                      {debugInfo.lastCheck.toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* Status de Conectividade */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Conectividade</h3>
                    <button
                      onClick={runFullCheck}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {debugInfo.connectivity === "checking" && (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                        <span className="text-sm">Verificando...</span>
                      </>
                    )}
                    {debugInfo.connectivity === "connected" && (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-700">
                          Conectado
                        </span>
                      </>
                    )}
                    {debugInfo.connectivity === "error" && (
                      <>
                        <WifiOff className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-700">
                          Erro de conexão
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status dos Endpoints */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="font-semibold mb-2">Endpoints</h3>
                  <div className="space-y-2">
                    {Object.entries(debugInfo.endpoints).map(([name, info]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{name}</span>
                        <div className="flex items-center gap-2">
                          {info.status === "checking" && (
                            <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
                          )}
                          {info.status === "success" && (
                            <>
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span className="text-green-700">
                                {Array.isArray(info.response)
                                  ? `${info.response.length} itens`
                                  : "OK"}
                              </span>
                            </>
                          )}
                          {info.status === "error" && (
                            <>
                              <AlertTriangle className="w-3 h-3 text-red-500" />
                              <span
                                className="text-red-700 text-xs truncate max-w-32"
                                title={info.error}
                              >
                                {info.error}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Variáveis de Ambiente */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="font-semibold mb-2">Variáveis de Ambiente</h3>
                  <div className="text-xs space-y-1">
                    <div>
                      NEXT_PUBLIC_API_URL:{" "}
                      <code>
                        {process.env.NEXT_PUBLIC_API_URL || "undefined"}
                      </code>
                    </div>
                    <div>
                      NEXT_PUBLIC_ENVIRONMENT:{" "}
                      <code>
                        {process.env.NEXT_PUBLIC_ENVIRONMENT || "undefined"}
                      </code>
                    </div>
                    <div>
                      VERCEL_URL:{" "}
                      <code>{process.env.VERCEL_URL || "undefined"}</code>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
