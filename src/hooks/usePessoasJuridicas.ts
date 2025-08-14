// src/hooks/usePessoasJuridicas.ts
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { PessoaJuridica, CreatePessoaJuridicaDTO, UpdatePessoaJuridicaDTO } from "@/types/api";

interface UsePessoasJuridicasState {
  pessoas: PessoaJuridica[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
}

export function usePessoasJuridicas() {
  const [state, setState] = useState<UsePessoasJuridicasState>({
    pessoas: [],
    loading: false,
    error: null,
    creating: false,
    updating: false,
    deleting: false,
  });

  const fetchPessoasJuridicas = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.get("/api/PessoaJuridica");
      setState((prev) => ({
        ...prev,
        pessoas: response.data as PessoaJuridica[],
        loading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.response?.data?.message || "Erro ao carregar pessoas jurídicas",
        loading: false,
      }));
    }
  }, []);

  const createPessoaJuridica = useCallback(async (data: CreatePessoaJuridicaDTO) => {
    setState((prev) => ({ ...prev, creating: true, error: null }));
    try {
      const response = await apiClient.post("/api/PessoaJuridica", data);
      setState((prev) => ({
        ...prev,
        pessoas: [...prev.pessoas, response.data as PessoaJuridica],
        creating: false,
      }));
      return true;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.response?.data?.message || "Erro ao criar pessoa jurídica",
        creating: false,
      }));
      return false;
    }
  }, []);

  const updatePessoaJuridica = useCallback(
    async (id: number, data: UpdatePessoaJuridicaDTO) => {
      setState((prev) => ({ ...prev, updating: true, error: null }));
      try {
        const response = await apiClient.put(`/api/PessoaJuridica/${id}`, data);
        setState((prev) => ({
          ...prev,
          pessoas: prev.pessoas.map((p) =>
            p.id === id ? (response.data as PessoaJuridica) : p
          ),
          updating: false,
        }));
        return true;
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.response?.data?.message || "Erro ao atualizar pessoa jurídica",
          updating: false,
        }));
        return false;
      }
    },
    []
  );

  const deletePessoaJuridica = useCallback(async (id: number) => {
    setState((prev) => ({ ...prev, deleting: true, error: null }));
    try {
      await apiClient.delete(`/api/PessoaJuridica/${id}`);
      setState((prev) => ({
        ...prev,
        pessoas: prev.pessoas.filter((p) => p.id !== id),
        deleting: false,
      }));
      return true;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.response?.data?.message || "Erro ao excluir pessoa jurídica",
        deleting: false,
      }));
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    fetchPessoasJuridicas();
  }, [fetchPessoasJuridicas]);

  return {
    ...state,
    fetchPessoasJuridicas,
    createPessoaJuridica,
    updatePessoaJuridica,
    deletePessoaJuridica,
    clearError,
  };
}
