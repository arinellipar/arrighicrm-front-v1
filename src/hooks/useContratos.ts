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

interface UseContratosState {
  contratos: Contrato[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  changingSituacao: boolean;
  sessionContratos: Contrato[];
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
    sessionContratos: [],
  });

  const { adicionarAtividade } = useAtividadeContext();

  const fetchContratos = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      console.log("🔧 useContratos: Buscando contratos da API...");
      console.log(
        "🔧 useContratos: sessionContratos atuais:",
        state.sessionContratos.length
      );
      const response = await apiClient.get("/Contrato");

      // Verificar se há erro na resposta
      if (response.error) {
        console.error("🔧 useContratos: Erro na API:", response.error);
        setState((prev) => ({
          ...prev,
          contratos: [],
          error: response.error || "Erro ao carregar contratos",
          loading: false,
        }));
        return;
      }

      // Verificar se a resposta é válida
      if (!response.data) {
        console.warn(
          "🔧 useContratos: API retornou resposta vazia, mas sem erro"
        );
        setState((prev) => ({
          ...prev,
          contratos: [],
          loading: false,
        }));
        return;
      }

      // Se não for array, tratar como erro
      if (!Array.isArray(response.data)) {
        console.error(
          "🔧 useContratos: API retornou dados inválidos (não é array):",
          typeof response.data
        );
        setState((prev) => ({
          ...prev,
          contratos: [],
          error: "Formato de dados inválido recebido da API",
          loading: false,
        }));
        return;
      }

      // Array vazio é válido - significa que não há contratos cadastrados
      // Remover contratos seed/mocks conhecidos do backend legado
      const isSeedContrato = (c: any): boolean => {
        const pfNome = c?.cliente?.pessoaFisica?.nome;
        const pjRazao = c?.cliente?.pessoaJuridica?.razaoSocial;
        const cpf = c?.cliente?.pessoaFisica?.cpf?.replace(/\D/g, "");
        const cnpj = c?.cliente?.pessoaJuridica?.cnpj?.replace(/\D/g, "");
        return (
          pfNome === "João Silva" ||
          pfNome === "Ana Costa" ||
          pjRazao === "Empresa ABC Ltda" ||
          cpf === "12345678901" ||
          cnpj === "12345678000199"
        );
      };

      const contratosApi = (response.data as any[]).filter(
        (c) => !isSeedContrato(c)
      ) as Contrato[];
      console.log(
        `🔧 useContratos: ${contratosApi.length} contratos carregados da API com sucesso`
      );

      // Merge com contratos criados/atualizados na sessão
      setState((prev) => {
        const byId = new Map<number, Contrato>();

        // Primeiro, adicionar contratos da API
        for (const c of contratosApi) {
          byId.set(c.id, c);
        }

        // Depois, adicionar contratos da sessão (podem sobrescrever os da API)
        for (const sc of prev.sessionContratos) {
          byId.set(sc.id, sc);
        }

        const mergedContratos = Array.from(byId.values());

        console.log(
          `🔧 useContratos: Merge realizado - ${contratosApi.length} da API + ${prev.sessionContratos.length} da sessão = ${mergedContratos.length} total`
        );

        return {
          ...prev,
          contratos: mergedContratos,
          loading: false,
        };
      });
    } catch (error: any) {
      console.error("🔧 useContratos: Erro ao buscar contratos:", error);
      setState((prev) => ({
        ...prev,
        contratos: [],
        error: "Erro de conexão ao carregar contratos",
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

      // Log detalhado para debug em produção
      console.log(
        "🔧 createContrato: Iniciando criação de contrato com dados:",
        data
      );
      console.log("🔧 createContrato: NODE_ENV =", process.env.NODE_ENV);
      console.log(
        "🔧 createContrato: API URL =",
        process.env.NEXT_PUBLIC_API_URL
      );

      try {
        console.log(
          "🔧 createContrato: Fazendo requisição POST para /Contrato"
        );
        const response = await apiClient.post("/Contrato", data);

        // Considerar sucesso quando status 200-201, mesmo sem JSON, e criar contrato local
        if (!response.data && response.status >= 200 && response.status < 300) {
          console.warn(
            "🔧 createContrato: Sucesso sem corpo JSON; criando contrato local"
          );

          // Criar contrato local com ID temporário
          const contratoLocal: Contrato = {
            id: Date.now(), // ID temporário baseado no timestamp
            ...data,
            cliente: undefined, // Será preenchido depois
            consultor: undefined, // Será preenchido depois
            dataCadastro: new Date().toISOString(),
            dataAtualizacao: undefined,
            ativo: true,
          };

          // Tentar preencher dados do cliente
          try {
            const clienteCompleto = await fetchClienteCompleto(data.clienteId);
            if (clienteCompleto) {
              contratoLocal.cliente = clienteCompleto as any;
            }
          } catch (e) {
            console.warn(
              "🔧 createContrato: Não foi possível preencher cliente do contrato local",
              e
            );
          }

          setState((prev) => ({
            ...prev,
            contratos: [...prev.contratos, contratoLocal],
            sessionContratos: [...prev.sessionContratos, contratoLocal],
            creating: false,
          }));

          adicionarAtividade(
            "Admin User",
            `Criou novo contrato para cliente ID ${data.clienteId}`,
            "success",
            `Situação: ${data.situacao}`,
            "Contratos"
          );

          return contratoLocal;
        }

        console.log("🔧 createContrato: Resposta recebida:", {
          status: response.status,
          hasData: !!response.data,
          dataType: typeof response.data,
          data: response.data,
        });

        let novoContrato = response.data as Contrato;
        console.log(
          "🔧 createContrato: Contrato criado com sucesso (raw):",
          novoContrato
        );

        // Se o backend não retornou o objeto do cliente/consultor, tentar completar
        try {
          if (!novoContrato.cliente && novoContrato.clienteId) {
            const clienteCompleto = await fetchClienteCompleto(
              novoContrato.clienteId
            );
            if (clienteCompleto) {
              novoContrato = {
                ...novoContrato,
                cliente: clienteCompleto as any,
              };
            }
          }
        } catch (e) {
          console.warn(
            "🔧 createContrato: Não foi possível preencher cliente do contrato recém-criado",
            e
          );
        }

        console.log(
          "🔧 createContrato: Adicionando contrato ao estado local:",
          novoContrato
        );

        setState((prev) => {
          const newContratos = [
            ...prev.contratos.filter((c) => c.id !== novoContrato.id),
            novoContrato,
          ];
          const newSessionContratos = [
            ...prev.sessionContratos.filter((c) => c.id !== novoContrato.id),
            novoContrato,
          ];

          console.log(
            `🔧 createContrato: Estado atualizado - ${newContratos.length} contratos totais, ${newSessionContratos.length} na sessão`
          );

          return {
            ...prev,
            contratos: newContratos,
            sessionContratos: newSessionContratos,
            creating: false,
          };
        });

        adicionarAtividade(
          "Admin User",
          `Criou novo contrato para cliente ID ${data.clienteId}`,
          "success",
          `Situação: ${data.situacao}`,
          "Contratos"
        );

        // Recarregar lista para sincronizar com backend
        await fetchContratos();
        return novoContrato;
      } catch (error: any) {
        console.error("🔧 createContrato: Erro ao criar contrato:", error);
        console.error("🔧 createContrato: Detalhes do erro:", {
          message: error.message,
          status: error.status,
          response: error.response,
          data: error.response?.data,
        });

        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.title ||
          error.message ||
          "Erro desconhecido ao criar contrato";

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          creating: false,
        }));

        // Re-throw para que o componente possa tratar o erro
        throw new Error(errorMessage);
      }
    },
    // Note: fetchClienteCompleto is defined later; avoid referencing it in deps to satisfy TS
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
          sessionContratos: prev.sessionContratos.map((contrato) =>
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
          sessionContratos: prev.sessionContratos.map((contrato) =>
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
          sessionContratos: prev.sessionContratos.filter(
            (contrato) => contrato.id !== id
          ),
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
      console.log(
        "🔧 getHistoricoSituacao: Buscando histórico real para contrato",
        contratoId
      );

      try {
        const response = await apiClient.get(
          `/Contrato/${contratoId}/historico`
        );

        // Verificar se há erro na resposta
        if (response.error) {
          console.warn("🔧 getHistoricoSituacao: Erro na API:", response.error);
          return [];
        }

        // Verificar se os dados existem e são válidos
        if (!response.data) {
          console.warn("🔧 getHistoricoSituacao: API retornou resposta vazia");
          return [];
        }

        if (!Array.isArray(response.data)) {
          console.warn(
            "🔧 getHistoricoSituacao: API retornou dados inválidos (não é array)"
          );
          return [];
        }

        console.log(
          "🔧 getHistoricoSituacao: Histórico carregado da API:",
          response.data.length,
          "registros"
        );
        return response.data as HistoricoSituacaoContrato[];
      } catch (error: any) {
        console.error(
          "🔧 getHistoricoSituacao: Erro ao buscar histórico:",
          error
        );
        // Retornar array vazio em caso de erro - sem dados mock
        return [];
      }
    },
    []
  );

  useEffect(() => {
    console.log(
      "🔧 useContratos: useEffect - Carregando contratos na inicialização"
    );
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
