// Debug das variáveis de ambiente
export const debugEnvironment = () => {
  console.log("🔍 Debug das Variáveis de Ambiente:");
  console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
  console.log("NEXT_PUBLIC_ENVIRONMENT:", process.env.NEXT_PUBLIC_ENVIRONMENT);
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("process.env:", process.env);

  // Testar a função getApiUrl
  const { getApiUrl } = require("../../env.config");
  console.log("getApiUrl():", getApiUrl());
};

// Função para testar a URL da API
export const testApiUrl = async () => {
  const { getApiUrl } = require("../../env.config");
  const apiUrl = getApiUrl();

  console.log("🧪 Testando URL da API:", apiUrl);

  try {
    const response = await fetch(`${apiUrl}/PessoaFisica`);
    console.log("✅ API respondendo:", response.status);
  } catch (error) {
    console.error("❌ Erro ao conectar com API:", error);
  }
};
