// Configuração de ambiente para o frontend
export const config = {
  // URL da API - pode ser configurada via variável de ambiente
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5101/api",

  // Ambiente atual
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || "development",

  // Configurações específicas por ambiente
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",

  // Configurações de debug
  enableDebug: process.env.NODE_ENV === "development",

  // Timeout das requisições (em ms)
  requestTimeout: 10000,

  // Configurações de CORS
  corsOrigins:
    process.env.NODE_ENV === "development"
      ? ["http://localhost:3000", "http://localhost:3001"]
      : [
          "https://arrighicrm-front-v1.vercel.app",
          "https://arrighicrm.com",
          "https://www.arrighicrm.com",
        ],
};

// Função para obter a URL da API baseada no ambiente
export const getApiUrl = (): string => {
  console.log("🔧 getApiUrl: NODE_ENV =", process.env.NODE_ENV);
  console.log(
    "🔧 getApiUrl: NEXT_PUBLIC_API_URL =",
    process.env.NEXT_PUBLIC_API_URL
  );

  // Em desenvolvimento, usar variável de ambiente ou API local
  if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
    // Se NEXT_PUBLIC_API_URL estiver definida, usa ela (permite apontar para produção)
    if (process.env.NEXT_PUBLIC_API_URL) {
      console.log(
        "🔧 getApiUrl: Usando URL de env var:",
        process.env.NEXT_PUBLIC_API_URL
      );
      return process.env.NEXT_PUBLIC_API_URL;
    }
    // Senão, usa API local
    const devUrl = "http://localhost:5101/api";
    console.log("🔧 getApiUrl: Usando URL de desenvolvimento padrão:", devUrl);
    return devUrl;
  }

  // In production, always use the production URL
  if (process.env.NODE_ENV === "production") {
    const productionUrl =
      "https://arrighi-bk-bzfmgxavaxbyh5ej.brazilsouth-01.azurewebsites.net/api";
    console.log("🔧 getApiUrl: Usando URL de produção:", productionUrl);
    return productionUrl;
  }

  // Development fallback
  const devUrl = "http://localhost:5101/api";
  console.log("🔧 getApiUrl: Usando URL de desenvolvimento:", devUrl);
  return devUrl;
};

// Função para verificar se está em desenvolvimento
export const isDevelopment = (): boolean => {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_ENVIRONMENT === "development"
  );
};
