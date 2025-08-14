// src/hooks/useClientes.ts
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { Cliente, CreateClienteDTO, UpdateClienteDTO } from "@/types/api";

interface UseClientesState {
  clientes: Cliente[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
}

export function useClientes() {
  const [state, setState] = useState<UseClientesState>({
    clientes: [],
    loading: false,
    error: null,
    creating: false,
    updating: false,
    deleting: false,
  });

  const fetchClientes = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.get("/api/Cliente");
      // Transformar os dados para o formato esperado pelo frontend
      const clientesTransformados = (response.data as any[]).map(
        (cliente: any) => ({
          ...cliente,
          tipo: cliente.tipoPessoa === "Fisica" ? "fisica" : "juridica",
          nome: cliente.pessoaFisica?.nome,
          razaoSocial: cliente.pessoaJuridica?.razaoSocial,
          email: cliente.pessoaFisica?.email || cliente.pessoaJuridica?.email,
          cpf: cliente.pessoaFisica?.cpf,
          cnpj: cliente.pessoaJuridica?.cnpj,
          telefone1:
            cliente.pessoaFisica?.telefone1 ||
            cliente.pessoaJuridica?.telefone1,
          telefone2:
            cliente.pessoaFisica?.telefone2 ||
            cliente.pessoaJuridica?.telefone2,
          segmento: cliente.status, // Usando status como segmento temporariamente
          valorContrato: 0, // Valor padrão
        })
      );
      setState((prev) => ({
        ...prev,
        clientes: clientesTransformados as Cliente[],
        loading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.response?.data?.message || "Erro ao carregar clientes",
        loading: false,
      }));
    }
  }, []);

  const createCliente = useCallback(async (data: CreateClienteDTO) => {
    setState((prev) => ({ ...prev, creating: true, error: null }));
    try {
      const response = await apiClient.post("/api/Cliente", data);
      setState((prev) => ({
        ...prev,
        clientes: [...prev.clientes, response.data as Cliente],
        creating: false,
      }));
      return true;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.response?.data?.message || "Erro ao criar cliente",
        creating: false,
      }));
      return false;
    }
  }, []);

  const updateCliente = useCallback(
    async (id: number, data: UpdateClienteDTO) => {
      setState((prev) => ({ ...prev, updating: true, error: null }));
      try {
        const response = await apiClient.put(`/api/Cliente/${id}`, data);
        setState((prev) => ({
          ...prev,
          clientes: prev.clientes.map((c) =>
            c.id === id ? (response.data as Cliente) : c
          ),
          updating: false,
        }));
        return true;
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.response?.data?.message || "Erro ao atualizar cliente",
          updating: false,
        }));
        return false;
      }
    },
    []
  );

  const deleteCliente = useCallback(async (id: number) => {
    setState((prev) => ({ ...prev, deleting: true, error: null }));
    try {
      await apiClient.delete(`/api/Cliente/${id}`);
      setState((prev) => ({
        ...prev,
        clientes: prev.clientes.filter((c) => c.id !== id),
        deleting: false,
      }));
      return true;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.response?.data?.message || "Erro ao excluir cliente",
        deleting: false,
      }));
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  return {
    ...state,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    clearError,
  };
}
