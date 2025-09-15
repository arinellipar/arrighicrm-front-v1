// src/hooks/useConsultores.ts
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { Consultor, CreateConsultorDTO, UpdateConsultorDTO } from "@/types/api";
import { useAtividadeContext } from "@/contexts/AtividadeContext";
import { useAuth } from "@/contexts/AuthContext";

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

  const { adicionarAtividade } = useAtividadeContext();
  const { user } = useAuth();

  const fetchConsultores = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      console.log("🔧 fetchConsultores: Iniciando requisição...");
      const response = await apiClient.get("/Consultor");
      console.log("🔧 fetchConsultores: Resposta recebida:", response);
      console.log("🔧 fetchConsultores: Response status:", response.status);
      console.log("🔧 fetchConsultores: Response error:", response.error);
      console.log("🔧 fetchConsultores: Response data:", response.data);

      // Verificar se há erro na resposta
      if (response.error) {
        console.error("🔧 fetchConsultores: Erro na resposta:", response.error);
        setState((prev) => ({
          ...prev,
          error: response.error || "Erro desconhecido",
          loading: false,
        }));
        return;
      }

      // Verificar se os dados existem
      if (!response.data) {
        console.warn("🔧 fetchConsultores: Dados não encontrados na resposta");
        setState((prev) => ({
          ...prev,
          consultores: [],
          loading: false,
        }));
        return;
      }

      console.log("🔧 fetchConsultores: Dados recebidos:", response.data);

      // Verificar se é um array
      if (!Array.isArray(response.data)) {
        console.error(
          "🔧 fetchConsultores: Dados não são um array:",
          typeof response.data
        );
        setState((prev) => ({
          ...prev,
          error: "Formato de dados inválido",
          loading: false,
        }));
        return;
      }

      // Transformar os dados para o formato esperado pelo frontend
      const consultoresTransformados = response.data.map(
        (consultor: unknown) => {
          const c = consultor as {
            id: number;
            pessoaFisicaId: number;
            pessoaFisica?: {
              nome?: string;
              emailEmpresarial?: string;
              emailPessoal?: string;
              telefone1?: string;
              telefone2?: string;
            };
            filial: string;
            oab?: string;
            dataCadastro: string;
            dataAtualizacao?: string;
            ativo: boolean;
          };

          return {
            ...c,
            nome: c.pessoaFisica?.nome,
            email: c.pessoaFisica?.emailEmpresarial,
            telefone1: c.pessoaFisica?.telefone1,
            telefone2: c.pessoaFisica?.telefone2,
            oab: c.oab, // Usando o campo OAB real
            especialidades: [], // Array vazio por padrão
            status: "ativo" as const, // Status padrão
            casosAtivos: 0, // Valor padrão
            taxaSucesso: 0, // Valor padrão
          };
        }
      );

      console.log(
        "🔧 fetchConsultores: Consultores transformados:",
        consultoresTransformados
      );

      setState((prev) => ({
        ...prev,
        consultores: consultoresTransformados as unknown as Consultor[],
        loading: false,
      }));
    } catch (error: unknown) {
      console.error("🔧 fetchConsultores: Erro capturado:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao carregar consultores";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
    }
  }, []);

  const createConsultor = useCallback(
    async (data: CreateConsultorDTO) => {
      setState((prev) => ({ ...prev, creating: true, error: null }));
      try {
        // Enviar apenas os campos necessários para o backend
        const backendData = {
          pessoaFisicaId: data.pessoaFisicaId,
          filialId: data.filialId,
          oab: data.oab || null,
        };

        console.log(
          "🔧 createConsultor: Enviando dados para backend:",
          backendData
        );
        const response = await apiClient.post("/Consultor", backendData);

        const novoConsultor = response.data as Consultor;
        setState((prev) => ({
          ...prev,
          consultores: [...prev.consultores, novoConsultor],
          creating: false,
        }));

        // Registrar atividade
        adicionarAtividade(
          user?.nome || "Usuário",
          `Cadastrou novo consultor: ${data.nome}`,
          "success",
          `OAB: ${data.oab || "Não informado"}`,
          "Consultores"
        );

        return true;
      } catch (error: unknown) {
        console.error("🔧 createConsultor: Erro:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao criar consultor";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          creating: false,
        }));
        return false;
      }
    },
    [adicionarAtividade]
  );

  const updateConsultor = useCallback(
    async (id: number, data: UpdateConsultorDTO) => {
      setState((prev) => ({ ...prev, updating: true, error: null }));
      try {
        // Enviar apenas os campos que o backend permite atualizar
        const backendData = {
          id: id,
          filialId: data.filialId,
          oab: data.oab || null,
        };

        console.log(
          "🔧 updateConsultor: Enviando dados para backend:",
          backendData
        );
        const response = await apiClient.put(`/Consultor/${id}`, backendData);

        // Atualizar a lista local com os dados atualizados
        setState((prev) => ({
          ...prev,
          consultores: prev.consultores.map((c) =>
            c.id === id ? { ...c, filialId: data.filialId, oab: data.oab } : c
          ),
          updating: false,
        }));

        // Registrar atividade
        adicionarAtividade(
          user?.nome || "Usuário",
          `Atualizou consultor: ${data.nome}`,
          "info",
          `Filial ID: ${data.filialId}`,
          "Consultores"
        );

        return true;
      } catch (error: unknown) {
        console.error("🔧 updateConsultor: Erro:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erro ao atualizar consultor";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          updating: false,
        }));
        return false;
      }
    },
    [adicionarAtividade]
  );

  const deleteConsultor = useCallback(
    async (id: number) => {
      setState((prev) => ({ ...prev, deleting: true, error: null }));
      try {
        // Encontrar o consultor antes de deletar para registrar a atividade
        const consultorParaDeletar = state.consultores.find((c) => c.id === id);

        await apiClient.delete(`/Consultor/${id}`);
        setState((prev) => ({
          ...prev,
          consultores: prev.consultores.filter((c) => c.id !== id),
          deleting: false,
        }));

        // Registrar atividade
        if (consultorParaDeletar) {
          adicionarAtividade(
            user?.nome || "Usuário",
            `Excluiu consultor: ${consultorParaDeletar.nome}`,
            "warning",
            `OAB: ${consultorParaDeletar.oab || "Não informado"}`,
            "Consultores"
          );
        }

        return true;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao excluir consultor";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          deleting: false,
        }));
        return false;
      }
    },
    [state.consultores, adicionarAtividade]
  );

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
