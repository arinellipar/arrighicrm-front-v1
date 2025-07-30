// src/hooks/useDashboard.ts
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { PessoaFisica, PessoaJuridica, Usuario } from "@/types/api";

interface DashboardStats {
  totalClientes: number;
  totalPessoasFisicas: number;
  totalPessoasJuridicas: number;
  totalUsuarios: number;
  usuariosAtivos: number;
  clientesRecentes: number;
}

interface UseDashboardState {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
}

export function useDashboard() {
  const [state, setState] = useState<UseDashboardState>({
    stats: {
      totalClientes: 0,
      totalPessoasFisicas: 0,
      totalPessoasJuridicas: 0,
      totalUsuarios: 0,
      usuariosAtivos: 0,
      clientesRecentes: 0,
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
      // Fazer requisições paralelas para todas as entidades
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
        throw new Error(
          `Erro ao carregar pessoas físicas: ${pessoasFisicasResponse.error}`
        );
      }
      if (pessoasJuridicasResponse.error) {
        throw new Error(
          `Erro ao carregar pessoas jurídicas: ${pessoasJuridicasResponse.error}`
        );
      }
      if (usuariosResponse.error) {
        throw new Error(`Erro ao carregar usuários: ${usuariosResponse.error}`);
      }

      const pessoasFisicas = pessoasFisicasResponse.data || [];
      const pessoasJuridicas = pessoasJuridicasResponse.data || [];
      const usuarios = usuariosResponse.data || [];

      // Calcular estatísticas
      const totalPessoasFisicas = pessoasFisicas.length;
      const totalPessoasJuridicas = pessoasJuridicas.length;
      const totalClientes = totalPessoasFisicas + totalPessoasJuridicas;
      const totalUsuarios = usuarios.length;
      const usuariosAtivos = usuarios.filter((u) => u.ativo).length;

      // Calcular clientes recentes (cadastrados nos últimos 30 dias)
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 30);

      const pessoasFisicasRecentes = pessoasFisicas.filter(
        (p) => new Date(p.dataCadastro) >= dataLimite
      ).length;

      const pessoasJuridicasRecentes = pessoasJuridicas.filter(
        (p) => new Date(p.dataCadastro) >= dataLimite
      ).length;

      const clientesRecentes =
        pessoasFisicasRecentes + pessoasJuridicasRecentes;

      const stats: DashboardStats = {
        totalClientes,
        totalPessoasFisicas,
        totalPessoasJuridicas,
        totalUsuarios,
        usuariosAtivos,
        clientesRecentes,
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
