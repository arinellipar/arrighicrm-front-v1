// src/hooks/useEstatisticas.ts
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";

export interface ReceitaData {
  ReceitaTotal: number;
  ReceitaEntrada: number;
  ReceitaParcelas: number;
  ComissaoTotal: number;
  ReceitaMesAtual: number;
  ReceitaAnoAtual: number;
  CrescimentoMes: number;
  ValorTotalBoletos: number;
  ValorBoletosLiquidados: number;
  ValorBoletosPendentes: number;
  ValorBoletosVencidos: number;
  TotalContratos: number;
  ContratosFechados: number;
  ContratosMesAtual: number;
  ContratosAnoAtual: number;
  BoletosMesAtual: number;
  BoletosAnoAtual: number;
  ValorBoletosMesAtual: number;
  ValorBoletosAnoAtual: number;
  TaxaConversao: number;
  ReceitaMediaPorContrato: number;
  ContratosPorSituacao: {
    Leed: number;
    Prospecto: number;
    Enviado: number;
    Assinado: number;
  };
}

export interface DashboardData {
  Contratos: {
    TotalContratos: number;
    ContratosMesAtual: number;
    ReceitaTotal: number;
    ReceitaMesAtual: number;
    ContratosFechados: number;
    ContratosPendentes: number;
  };
  Boletos: {
    TotalBoletos: number;
    BoletosLiquidados: number;
    ValorLiquidado: number;
    ValorPendente: number;
  };
  DataAtualizacao: string;
}

interface UseEstatisticasState {
  receita: ReceitaData | null;
  dashboard: DashboardData | null;
  loading: boolean;
  error: string | null;
}

export function useEstatisticas() {
  const [state, setState] = useState<UseEstatisticasState>({
    receita: null,
    dashboard: null,
    loading: false,
    error: null,
  });

  const fetchReceita = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      console.log("🔧 fetchReceita: Buscando dados de receita...");

      // Debug: verificar dados do usuário
      const user = localStorage.getItem("user");
      const isAuthenticated = localStorage.getItem("isAuthenticated");
      console.log("🔧 fetchReceita: Dados do localStorage:", {
        user,
        isAuthenticated,
      });

      // Teste de autenticação primeiro
      try {
        const testResponse = await apiClient.get("/Estatisticas/test");
        console.log(
          "🔧 fetchReceita: Teste de autenticação:",
          testResponse.data
        );
      } catch (testError) {
        console.error(
          "🔧 fetchReceita: Erro no teste de autenticação:",
          testError
        );
      }

      const response = await apiClient.get("/Estatisticas/receita");

      if (response.error) {
        throw new Error(response.error);
      }

      setState((prev) => ({
        ...prev,
        receita: response.data as ReceitaData,
        loading: false,
      }));

      console.log("✅ fetchReceita: Dados de receita carregados com sucesso");
    } catch (error: any) {
      console.error("❌ fetchReceita: Erro ao buscar receita:", error);
      setState((prev) => ({
        ...prev,
        error: error.message || "Erro ao carregar dados de receita",
        loading: false,
      }));
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      console.log("🔧 fetchDashboard: Buscando dados do dashboard...");
      const response = await apiClient.get("/Estatisticas/dashboard");

      if (response.error) {
        throw new Error(response.error);
      }

      setState((prev) => ({
        ...prev,
        dashboard: response.data as DashboardData,
        loading: false,
      }));

      console.log(
        "✅ fetchDashboard: Dados do dashboard carregados com sucesso"
      );
    } catch (error: any) {
      console.error("❌ fetchDashboard: Erro ao buscar dashboard:", error);
      setState((prev) => ({
        ...prev,
        error: error.message || "Erro ao carregar dados do dashboard",
        loading: false,
      }));
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([fetchReceita(), fetchDashboard()]);
  }, [fetchReceita, fetchDashboard]);

  // Carregar dados automaticamente
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    receita: state.receita,
    dashboard: state.dashboard,
    loading: state.loading,
    error: state.error,
    fetchReceita,
    fetchDashboard,
    refreshData,
  };
}
