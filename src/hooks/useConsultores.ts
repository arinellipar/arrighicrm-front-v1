// src/hooks/useConsultores.ts
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { Consultor, CreateConsultorDTO, UpdateConsultorDTO } from "@/types/api";

interface UseConsultoresState {
  consultores: Consultor[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
}

export function useConsultores() {
  const [state, setState] = useState<UseConsultoresState>({
    consultores: [],
    loading: false,
    error: null,
    creating: false,
    updating: false,
    deleting: false,
  });

  const fetchConsultores = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.get("/api/Consultor");
      // Transformar os dados para o formato esperado pelo frontend
      const consultoresTransformados = (response.data as any[]).map(
        (consultor: any) => ({
          ...consultor,
          nome: consultor.pessoaFisica?.nome,
          email: consultor.pessoaFisica?.email,
          telefone1: consultor.pessoaFisica?.telefone1,
          telefone2: consultor.pessoaFisica?.telefone2,
          oab: consultor.pessoaFisica?.cpf, // Usando CPF como OAB temporariamente
          especialidades: [], // Array vazio por padrão
          status: "ativo" as const, // Status padrão
          casosAtivos: 0, // Valor padrão
          taxaSucesso: 0, // Valor padrão
        })
      );
      setState((prev) => ({
        ...prev,
        consultores: consultoresTransformados as Consultor[],
        loading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.response?.data?.message || "Erro ao carregar consultores",
        loading: false,
      }));
    }
  }, []);

  const createConsultor = useCallback(async (data: CreateConsultorDTO) => {
    setState((prev) => ({ ...prev, creating: true, error: null }));
    try {
      const response = await apiClient.post("/api/Consultor", data);
      setState((prev) => ({
        ...prev,
        consultores: [...prev.consultores, response.data as Consultor],
        creating: false,
      }));
      return true;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.response?.data?.message || "Erro ao criar consultor",
        creating: false,
      }));
      return false;
    }
  }, []);

  const updateConsultor = useCallback(
    async (id: number, data: UpdateConsultorDTO) => {
      setState((prev) => ({ ...prev, updating: true, error: null }));
      try {
        const response = await apiClient.put(`/api/Consultor/${id}`, data);
        setState((prev) => ({
          ...prev,
          consultores: prev.consultores.map((c) =>
            c.id === id ? (response.data as Consultor) : c
          ),
          updating: false,
        }));
        return true;
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.response?.data?.message || "Erro ao atualizar consultor",
          updating: false,
        }));
        return false;
      }
    },
    []
  );

  const deleteConsultor = useCallback(async (id: number) => {
    setState((prev) => ({ ...prev, deleting: true, error: null }));
    try {
      await apiClient.delete(`/api/Consultor/${id}`);
      setState((prev) => ({
        ...prev,
        consultores: prev.consultores.filter((c) => c.id !== id),
        deleting: false,
      }));
      return true;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.response?.data?.message || "Erro ao excluir consultor",
        deleting: false,
      }));
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    fetchConsultores();
  }, [fetchConsultores]);

  return {
    ...state,
    fetchConsultores,
    createConsultor,
    updateConsultor,
    deleteConsultor,
    clearError,
  };
}
