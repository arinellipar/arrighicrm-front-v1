// src/hooks/useContratos.ts
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import {
  Contrato,
  Cliente,
  CreateContratoDTO,
  UpdateContratoDTO,
  MudancaSituacaoDTO,
  HistoricoSituacaoContrato,
} from "@/types/api";
import { useAtividadeContext } from "@/contexts/AtividadeContext";
import { mockContratos } from "@/lib/mockContratos";

interface UseContratosState {
  contratos: Contrato[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  changingSituacao: boolean;
}

export function useContratos() {
  const [state, setState] = useState<UseContratosState>({
    contratos: [],
    loading: false,
    error: null,
    creating: false,
    updating: false,
    deleting: false,
    changingSituacao: false,
  });

  const { adicionarAtividade } = useAtividadeContext();

  const fetchContratos = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.get("/Contrato");

      // Se a resposta estiver vazia ou não for um array, usar dados mock
      let contratos = response.data;
      if (!Array.isArray(contratos) || contratos.length === 0) {
        console.info(
          "🔧 useContratos: Backend retornou dados inválidos ou vazios, usando dados mock"
        );
        contratos = mockContratos;
      }

      setState((prev) => ({
        ...prev,
        contratos: contratos as Contrato[],
        loading: false,
      }));
    } catch (error: any) {
      console.info(
        "🔧 useContratos: Backend não disponível, usando dados mock para desenvolvimento"
      );
      setState((prev) => ({
        ...prev,
        contratos: mockContratos,
        error: null, // Não mostrar erro para o usuário
        loading: false,
      }));
    }
  }, []);

  const getContrato = useCallback(async (id: number) => {
    try {
      const response = await apiClient.get(`/Contrato/${id}`);
      return response.data as Contrato;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Erro ao buscar contrato"
      );
    }
  }, []);

  const createContrato = useCallback(
    async (data: CreateContratoDTO) => {
      setState((prev) => ({ ...prev, creating: true, error: null }));
      try {
        const response = await apiClient.post("/Contrato", data);
        const novoContrato = response.data as Contrato;

        setState((prev) => ({
          ...prev,
          contratos: [...prev.contratos, novoContrato],
          creating: false,
        }));

        adicionarAtividade(
          "Admin User",
          `Criou novo contrato para cliente ID ${data.clienteId}`,
          "success",
          `Situação: ${data.situacao}`,
          "Contratos"
        );

        await fetchContratos();
        return novoContrato;
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.response?.data?.message || "Erro ao criar contrato",
          creating: false,
        }));
        throw error;
      }
    },
    [fetchContratos, adicionarAtividade]
  );

  const updateContrato = useCallback(
    async (id: number, data: Partial<UpdateContratoDTO>) => {
      setState((prev) => ({ ...prev, updating: true, error: null }));
      try {
        const response = await apiClient.put(`/Contrato/${id}`, data);
        const contratoAtualizado = response.data as Contrato;

        setState((prev) => ({
          ...prev,
          contratos: prev.contratos.map((contrato) =>
            contrato.id === id ? contratoAtualizado : contrato
          ),
          updating: false,
        }));

        adicionarAtividade(
          "Admin User",
          `Atualizou contrato #${id}`,
          "info",
          "",
          "Contratos"
        );

        await fetchContratos();
        return contratoAtualizado;
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.response?.data?.message || "Erro ao atualizar contrato",
          updating: false,
        }));
        throw error;
      }
    },
    [fetchContratos, adicionarAtividade]
  );

  const mudarSituacao = useCallback(
    async (id: number, data: MudancaSituacaoDTO) => {
      setState((prev) => ({ ...prev, changingSituacao: true, error: null }));
      try {
        const response = await apiClient.put(`/Contrato/${id}/situacao`, data);
        const contratoAtualizado = response.data as Contrato;

        setState((prev) => ({
          ...prev,
          contratos: prev.contratos.map((contrato) =>
            contrato.id === id ? contratoAtualizado : contrato
          ),
          changingSituacao: false,
        }));

        adicionarAtividade(
          "Admin User",
          `Mudou situação do contrato #${id}`,
          "info",
          `Nova situação: ${data.novaSituacao}`,
          "Contratos"
        );

        await fetchContratos();
        return contratoAtualizado;
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error:
            error.response?.data?.message ||
            "Erro ao mudar situação do contrato",
          changingSituacao: false,
        }));
        throw error;
      }
    },
    [fetchContratos, adicionarAtividade]
  );

  const deleteContrato = useCallback(
    async (id: number) => {
      setState((prev) => ({ ...prev, deleting: true, error: null }));
      try {
        await apiClient.delete(`/Contrato/${id}`);

        setState((prev) => ({
          ...prev,
          contratos: prev.contratos.filter((contrato) => contrato.id !== id),
          deleting: false,
        }));

        adicionarAtividade(
          "Admin User",
          `Excluiu contrato #${id}`,
          "warning",
          "",
          "Contratos"
        );

        await fetchContratos();
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.response?.data?.message || "Erro ao excluir contrato",
          deleting: false,
        }));
        throw error;
      }
    },
    [fetchContratos, adicionarAtividade]
  );

  // Função para buscar dados completos do cliente
  const fetchClienteCompleto = useCallback(
    async (clienteId: number): Promise<Cliente | null> => {
      try {
        console.info(
          "🔧 fetchClienteCompleto: Buscando dados completos do cliente",
          clienteId
        );
        // Primeiro tentar buscar o cliente específico
        let response;
        let clienteData;

        try {
          response = await apiClient.get(`/Cliente/${clienteId}`);
          clienteData = response.data as any;
          console.info(
            "🔧 fetchClienteCompleto: Dados específicos encontrados via /Cliente/{id}"
          );
        } catch (specificError) {
          console.info(
            "🔧 fetchClienteCompleto: Endpoint /Cliente/{id} não disponível, tentando lista completa"
          );

          // Se falhar, tentar buscar da lista completa de clientes
          const allClientsResponse = await apiClient.get("/Cliente");
          const allClients = (allClientsResponse.data as any[]) || [];

          // Encontrar o cliente específico na lista
          const clienteEncontrado = allClients.find(
            (c: any) => c.id === clienteId
          );

          if (!clienteEncontrado) {
            console.info(
              "🔧 fetchClienteCompleto: Cliente não encontrado na lista completa"
            );
            return null;
          }

          clienteData = clienteEncontrado;
          console.info(
            "🔧 fetchClienteCompleto: Cliente encontrado na lista completa"
          );
        }

        // Transformar os dados retornados seguindo o padrão do useClientes
        const clienteTransformado = {
          ...clienteData,
          tipo: clienteData.tipoPessoa === "Fisica" ? "fisica" : "juridica",
          nome: clienteData.pessoaFisica?.nome,
          razaoSocial: clienteData.pessoaJuridica?.razaoSocial,
          email:
            clienteData.pessoaFisica?.email ||
            clienteData.pessoaJuridica?.email,
          cpf: clienteData.pessoaFisica?.cpf,
          cnpj: clienteData.pessoaJuridica?.cnpj,
          telefone1:
            clienteData.pessoaFisica?.telefone1 ||
            clienteData.pessoaJuridica?.telefone1,
          telefone2:
            clienteData.pessoaFisica?.telefone2 ||
            clienteData.pessoaJuridica?.telefone2,
          telefone3: clienteData.pessoaJuridica?.telefone3,
          telefone4: clienteData.pessoaJuridica?.telefone4,
          segmento: clienteData.status,
          status: clienteData.status?.toLowerCase() || "ativo",
          valorContrato: clienteData.valorContrato || 0,
          filial:
            clienteData.filialNavigation?.nome ||
            clienteData.filial ||
            "Não informada",
          // Manter os dados originais para compatibilidade
          pessoaFisica: clienteData.pessoaFisica,
          pessoaJuridica: clienteData.pessoaJuridica,
        };

        console.info(
          "🔧 fetchClienteCompleto: Dados do cliente transformados com sucesso:",
          clienteTransformado
        );
        return clienteTransformado as Cliente;
      } catch (error: any) {
        console.info(
          "🔧 fetchClienteCompleto: Erro geral ao buscar dados do cliente, usando dados que vieram com o contrato",
          error
        );
        return null;
      }
    },
    []
  );

  const getHistoricoSituacao = useCallback(
    async (contratoId: number): Promise<HistoricoSituacaoContrato[]> => {
      console.info(
        "🔧 getHistoricoSituacao: Buscando histórico para contrato",
        contratoId
      );

      try {
        const response = await apiClient.get(
          `/Contrato/${contratoId}/historico`
        );
        console.info(
          "🔧 getHistoricoSituacao: Resposta do backend:",
          response.data
        );
        return response.data as HistoricoSituacaoContrato[];
      } catch (error: any) {
        console.info(
          "🔧 getHistoricoSituacao: Endpoint de histórico não implementado, retornando dados mock para contrato",
          contratoId
        );

        // Retornar dados mock para desenvolvimento
        // TODO: Remover quando o backend estiver implementado
        const mockHistorico: HistoricoSituacaoContrato[] = [
          {
            id: 1,
            contratoId: contratoId,
            situacaoAnterior: "Leed",
            novaSituacao: "Prospecto",
            motivoMudanca:
              "Cliente demonstrou interesse inicial após primeiro contato",
            dataMudanca: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            dataCadastro: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            id: 2,
            contratoId: contratoId,
            situacaoAnterior: "Prospecto",
            novaSituacao: "Negociacao",
            motivoMudanca:
              "Cliente avançou para fase de negociação após apresentação da proposta",
            dataMudanca: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toISOString(),
            dataCadastro: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        ];

        console.info(
          "🔧 getHistoricoSituacao: Retornando dados mock:",
          mockHistorico
        );
        return mockHistorico;
      }
    },
    []
  );

  useEffect(() => {
    fetchContratos();
  }, [fetchContratos]);

  return {
    contratos: state.contratos,
    loading: state.loading,
    error: state.error,
    creating: state.creating,
    updating: state.updating,
    deleting: state.deleting,
    changingSituacao: state.changingSituacao,
    fetchContratos,
    getContrato,
    createContrato,
    updateContrato,
    mudarSituacao,
    deleteContrato,
    getHistoricoSituacao,
    fetchClienteCompleto,
  };
}
