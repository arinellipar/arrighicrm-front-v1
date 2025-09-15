// src/hooks/useDashboard.ts
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { PessoaFisica, PessoaJuridica, Usuario } from "@/types/api";
import { getApiUrl } from "../../env.config";

interface DashboardStats {
  totalPessoasFisicas: number;
  totalPessoasJuridicas: number;
  totalUsuarios: number;
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
      totalUsuarios: 0,
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
      // Fazer requisições paralelas para pessoas físicas, jurídicas e usuários
      const [
        pessoasFisicasResponse,
        pessoasJuridicasResponse,
        usuariosResponse,
      ] = await Promise.all([
        apiClient.get<PessoaFisica[]>("/PessoaFisica"),
        apiClient.get<PessoaJuridica[]>("/PessoaJuridica"),
        apiClient.get<Usuario[]>("/Usuario"),
      ]);

      // Verificar se há erros
      if (pessoasFisicasResponse.error) {
        console.error(
          "❌ Erro em PessoasFisicas:",
          pessoasFisicasResponse.error
        );
        throw new Error(
          `Erro ao carregar pessoas físicas: ${pessoasFisicasResponse.error}`
        );
      }
      if (pessoasJuridicasResponse.error) {
        console.error(
          "❌ Erro em PessoasJuridicas:",
          pessoasJuridicasResponse.error
        );
        throw new Error(
          `Erro ao carregar pessoas jurídicas: ${pessoasJuridicasResponse.error}`
        );
      }
      if (usuariosResponse.error) {
        console.error("❌ Erro em Usuarios:", usuariosResponse.error);
        throw new Error(`Erro ao carregar usuários: ${usuariosResponse.error}`);
      }

      const pessoasFisicas = pessoasFisicasResponse.data || [];
      const pessoasJuridicas = pessoasJuridicasResponse.data || [];
      const usuarios = usuariosResponse.data || [];

      // Log detalhado para debug de produção
      console.log("📊 useDashboard - Dados recebidos:", {
        pessoasFisicas: {
          length: pessoasFisicas.length,
          isArray: Array.isArray(pessoasFisicas),
          hasData: !!pessoasFisicasResponse.data,
          rawData: pessoasFisicasResponse.data,
        },
        pessoasJuridicas: {
          length: pessoasJuridicas.length,
          isArray: Array.isArray(pessoasJuridicas),
          hasData: !!pessoasJuridicasResponse.data,
          rawData: pessoasJuridicasResponse.data,
        },
        usuarios: {
          length: usuarios.length,
          isArray: Array.isArray(usuarios),
          hasData: !!usuariosResponse.data,
          rawData: usuariosResponse.data,
        },
      });

      // Calcular estatísticas
      const totalPessoasFisicas = pessoasFisicas.length;
      const totalPessoasJuridicas = pessoasJuridicas.length;
      const totalUsuarios = usuarios.length;

      const stats: DashboardStats = {
        totalPessoasFisicas,
        totalPessoasJuridicas,
        totalUsuarios,
      };

      setStats(stats);
    } catch (error) {
      console.error("❌ useDashboard: Erro capturado:", error);
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
