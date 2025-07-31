// src/hooks/usePessoaJuridica.ts
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import {
  PessoaJuridica,
  CreatePessoaJuridicaDTO,
  UpdatePessoaJuridicaDTO,
} from "@/types/api";

interface UsePessoaJuridicaState {
  pessoas: PessoaJuridica[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
}

export function usePessoaJuridica() {
  const [state, setState] = useState<UsePessoaJuridicaState>({
    pessoas: [],
    loading: false,
    error: null,
    creating: false,
    updating: false,
    deleting: false,
  });

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  const setPessoas = (pessoas: PessoaJuridica[]) => {
    setState((prev) => ({ ...prev, pessoas }));
  };

  // Listar todas as pessoas jurídicas
  const fetchPessoas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<PessoaJuridica[]>("/PessoaJuridica");

      if (response.error) {
        setError(response.error);
      } else {
        setPessoas(response.data || []);
      }
    } catch (error) {
      setError("Erro ao carregar pessoas jurídicas");
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar pessoa jurídica por ID
  const fetchPessoaById = useCallback(
    async (id: number): Promise<PessoaJuridica | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get<PessoaJuridica>(
          `/PessoaJuridica/${id}`
        );

        if (response.error) {
          setError(response.error);
          return null;
        }

        return response.data || null;
      } catch (error) {
        setError("Erro ao carregar pessoa jurídica");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Criar nova pessoa jurídica
  const createPessoa = useCallback(
    async (data: CreatePessoaJuridicaDTO): Promise<boolean> => {
      setState((prev) => ({ ...prev, creating: true, error: null }));

      try {
        const response = await apiClient.post<PessoaJuridica>(
          "/PessoaJuridica",
          data
        );

        if (response.error) {
          setError(response.error);
          return false;
        }

        // Recarregar a lista após criar
        await fetchPessoas();
        return true;
      } catch (error) {
        setError("Erro ao criar pessoa jurídica");
        return false;
      } finally {
        setState((prev) => ({ ...prev, creating: false }));
      }
    },
    [fetchPessoas]
  );

  // Atualizar pessoa jurídica
  const updatePessoa = useCallback(
    async (id: number, data: UpdatePessoaJuridicaDTO): Promise<boolean> => {
      setState((prev) => ({ ...prev, updating: true, error: null }));

      try {
        const response = await apiClient.put(`/PessoaJuridica/${id}`, data);

        if (response.error) {
          setError(response.error);
          return false;
        }

        // Recarregar a lista após atualizar
        await fetchPessoas();
        return true;
      } catch (error) {
        setError("Erro ao atualizar pessoa jurídica");
        return false;
      } finally {
        setState((prev) => ({ ...prev, updating: false }));
      }
    },
    [fetchPessoas]
  );

  // Deletar pessoa jurídica
  const deletePessoa = useCallback(
    async (id: number): Promise<boolean> => {
      setState((prev) => ({ ...prev, deleting: true, error: null }));

      try {
        const response = await apiClient.delete(`/PessoaJuridica/${id}`);

        if (response.error) {
          setError(response.error);
          return false;
        }

        // Recarregar a lista após deletar
        await fetchPessoas();
        return true;
      } catch (error) {
        setError("Erro ao deletar pessoa jurídica");
        return false;
      } finally {
        setState((prev) => ({ ...prev, deleting: false }));
      }
    },
    [fetchPessoas]
  );

  // Carregar dados iniciais
  useEffect(() => {
    fetchPessoas();
  }, []); // Remover fetchPessoas da dependência para evitar loops

  return {
    ...state,
    fetchPessoas,
    fetchPessoaById,
    createPessoa,
    updatePessoa,
    deletePessoa,
    clearError: () => setError(null),
  };
}
