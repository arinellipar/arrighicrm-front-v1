// src/hooks/useGrupoFilialValidation.ts
import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api";
import {
  ValidationResult,
  FilialSuggestion,
  PessoaFisicaInfo,
  ValidateGrupoFilialDTO,
  Filial,
  GrupoAcesso,
} from "@/types/api";

interface UseGrupoFilialValidationState {
  validation: ValidationResult | null;
  loading: boolean;
  error: string | null;
  filialSuggestions: FilialSuggestion[];
  pessoaInfo: PessoaFisicaInfo | null;
}

export function useGrupoFilialValidation() {
  const [state, setState] = useState<UseGrupoFilialValidationState>({
    validation: null,
    loading: false,
    error: null,
    filialSuggestions: [],
    pessoaInfo: null,
  });

  // Obter informações de pessoa física
  const fetchPessoaFisicaInfo = useCallback(
    async (
      pessoaFisicaId: number,
      usuarioId?: number
    ): Promise<PessoaFisicaInfo | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const url = usuarioId
          ? `/Usuario/pessoa-fisica/${pessoaFisicaId}/info?usuarioId=${usuarioId}`
          : `/Usuario/pessoa-fisica/${pessoaFisicaId}/info`;
        const response = await apiClient.get<PessoaFisicaInfo>(url);

        if (response.error) {
          setState((prev) => ({
            ...prev,
            error: response.error || "Erro desconhecido",
            loading: false,
          }));
          return null;
        }

        setState((prev) => ({
          ...prev,
          pessoaInfo: response.data || null,
          loading: false,
        }));

        return response.data || null;
      } catch (error) {
        const errorMessage = "Erro ao obter informações da pessoa física";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        return null;
      }
    },
    []
  );

  // Obter filiais disponíveis para um grupo
  const fetchFiliaisPorGrupo = useCallback(
    async (grupoId: number): Promise<FilialSuggestion[]> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiClient.get<FilialSuggestion[]>(
          `/Usuario/grupo/${grupoId}/filiais`
        );

        if (response.error) {
          setState((prev) => ({
            ...prev,
            error: response.error || "Erro desconhecido",
            loading: false,
          }));
          return [];
        }

        const filiais = response.data || [];

        setState((prev) => ({
          ...prev,
          filialSuggestions: filiais,
          loading: false,
        }));

        return filiais;
      } catch (error) {
        const errorMessage = "Erro ao obter filiais disponíveis";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        return [];
      }
    },
    []
  );

  // Validar combinação grupo-filial
  const validateGrupoFilial = useCallback(
    async (
      grupoAcessoId: number,
      filialId: number | null,
      pessoaFisicaId: number | null,
      pessoaJuridicaId: number | null = null
    ): Promise<ValidationResult | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const payload: ValidateGrupoFilialDTO = {
        grupoAcessoId,
        filialId,
        pessoaFisicaId,
        pessoaJuridicaId,
      };

      try {
        const response = await apiClient.post<ValidationResult>(
          "/Usuario/validate-grupo-filial",
          payload
        );

        if (response.error) {
          setState((prev) => ({
            ...prev,
            error: response.error || "Erro desconhecido",
            loading: false,
          }));
          return null;
        }

        const result = response.data || null;

        setState((prev) => ({
          ...prev,
          validation: result,
          loading: false,
        }));

        return result;
      } catch (error) {
        const errorMessage = "Erro ao validar combinação grupo-filial";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        return null;
      }
    },
    []
  );

  // Limpar validação
  const clearValidation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      validation: null,
      error: null,
    }));
  }, []);

  // Limpar todo o estado
  const clearState = useCallback(() => {
    setState({
      validation: null,
      loading: false,
      error: null,
      filialSuggestions: [],
      pessoaInfo: null,
    });
  }, []);

  // Obter lista de grupos de acesso
  const fetchGruposAcesso = useCallback(async (): Promise<GrupoAcesso[]> => {
    try {
      const response = await apiClient.get<GrupoAcesso[]>(
        "/Info/grupos-acesso"
      );

      if (response.error) {
        console.error("Erro ao carregar grupos de acesso:", response.error);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Erro ao carregar grupos de acesso:", error);
      return [];
    }
  }, []);

  // Obter lista de filiais
  const fetchFiliais = useCallback(async (): Promise<Filial[]> => {
    try {
      const response = await apiClient.get<Filial[]>("/Info/filiais");

      if (response.error) {
        console.error("Erro ao carregar filiais:", response.error);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Erro ao carregar filiais:", error);
      return [];
    }
  }, []);

  return {
    ...state,
    fetchPessoaFisicaInfo,
    fetchFiliaisPorGrupo,
    validateGrupoFilial,
    clearValidation,
    clearState,
    fetchGruposAcesso,
    fetchFiliais,
  };
}
