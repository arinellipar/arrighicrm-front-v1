// src/hooks/usePessoasFisicas.ts
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { PessoaFisica, CreatePessoaFisicaDTO, UpdatePessoaFisicaDTO } from "@/types/api";

interface UsePessoasFisicasState {
  pessoas: PessoaFisica[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
}

export function usePessoasFisicas() {
  const [state, setState] = useState<UsePessoasFisicasState>({
    pessoas: [],
    loading: false,
    error: null,
    creating: false,
    updating: false,
    deleting: false,
  });

  const fetchPessoasFisicas = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.get("/api/PessoaFisica");
      setState((prev) => ({
        ...prev,
        pessoas: response.data as PessoaFisica[],
        loading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.response?.data?.message || "Erro ao carregar pessoas físicas",
        loading: false,
      }));
    }
  }, []);

  const createPessoaFisica = useCallback(async (data: CreatePessoaFisicaDTO) => {
    setState((prev) => ({ ...prev, creating: true, error: null }));
    try {
      const response = await apiClient.post("/api/PessoaFisica", data);
      setState((prev) => ({
        ...prev,
        pessoas: [...prev.pessoas, response.data as PessoaFisica],
        creating: false,
      }));
      return true;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.response?.data?.message || "Erro ao criar pessoa física",
        creating: false,
      }));
      return false;
    }
  }, []);

  const updatePessoaFisica = useCallback(
    async (id: number, data: UpdatePessoaFisicaDTO) => {
      setState((prev) => ({ ...prev, updating: true, error: null }));
      try {
        const response = await apiClient.put(`/api/PessoaFisica/${id}`, data);
        setState((prev) => ({
          ...prev,
          pessoas: prev.pessoas.map((p) =>
            p.id === id ? (response.data as PessoaFisica) : p
          ),
          updating: false,
        }));
        return true;
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.response?.data?.message || "Erro ao atualizar pessoa física",
          updating: false,
        }));
        return false;
      }
    },
    []
  );

  const deletePessoaFisica = useCallback(async (id: number) => {
    setState((prev) => ({ ...prev, deleting: true, error: null }));
    try {
      await apiClient.delete(`/api/PessoaFisica/${id}`);
      setState((prev) => ({
        ...prev,
        pessoas: prev.pessoas.filter((p) => p.id !== id),
        deleting: false,
      }));
      return true;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.response?.data?.message || "Erro ao excluir pessoa física",
        deleting: false,
      }));
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    fetchPessoasFisicas();
  }, [fetchPessoasFisicas]);

  return {
    ...state,
    fetchPessoasFisicas,
    createPessoaFisica,
    updatePessoaFisica,
    deletePessoaFisica,
    clearError,
  };
}
