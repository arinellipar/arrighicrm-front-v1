// src/hooks/useDashboard.ts
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { PessoaFisica, PessoaJuridica } from "@/types/api";

interface DashboardStats {
  totalPessoasFisicas: number;
  totalPessoasJuridicas: number;
}

interface UseDashboardState {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
}

export function useDashboard() {
  const [state, setState] = useState<UseDashboardState>({
    stats: {
      totalPessoasFisicas: 0,
      totalPessoasJuridicas: 0,
    },
    loading: false,
    error: null,
  });

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  const setStats = (stats: DashboardStats) => {
    setState((prev) => ({ ...prev, stats }));
  };

  // Calcular estatísticas com base nos dados das APIs
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fazer requisições paralelas para pessoas físicas e jurídicas
      const [pessoasFisicasResponse, pessoasJuridicasResponse] =
        await Promise.all([
          apiClient.get<PessoaFisica[]>("/PessoaFisica"),
          apiClient.get<PessoaJuridica[]>("/PessoaJuridica"),
        ]);

      // Verificar se há erros
      if (pessoasFisicasResponse.error) {
        throw new Error(
          `Erro ao carregar pessoas físicas: ${pessoasFisicasResponse.error}`
        );
      }
      if (pessoasJuridicasResponse.error) {
        throw new Error(
          `Erro ao carregar pessoas jurídicas: ${pessoasJuridicasResponse.error}`
        );
      }

      const pessoasFisicas = pessoasFisicasResponse.data || [];
      const pessoasJuridicas = pessoasJuridicasResponse.data || [];

      // Calcular estatísticas
      const totalPessoasFisicas = pessoasFisicas.length;
      const totalPessoasJuridicas = pessoasJuridicas.length;

      const stats: DashboardStats = {
        totalPessoasFisicas,
        totalPessoasJuridicas,
      };

      setStats(stats);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao carregar estatísticas";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar estatísticas iniciais
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...state,
    fetchStats,
    clearError: () => setError(null),
  };
}
