// src/app/contratos/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  Loader2,
  TrendingUp,
  Clock,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  Filter,
  RefreshCcw,
  Users,
  Building2,
  CheckCircle,
  XCircle,
  History,
  ChevronDown,
  CreditCard,
  Settings,
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import ContratoForm from "@/components/forms/ContratoForm";
import ContratoDetalhes from "@/components/ContratoDetalhes";
import MudancaSituacaoModal from "@/components/MudancaSituacaoModal";
import { Tooltip } from "@/components";
import { useContratos } from "@/hooks/useContratos";
import { useClientes } from "@/hooks/useClientes";
import { useConsultores } from "@/hooks/useConsultores";
import { useBoletos } from "@/hooks/useBoletos";
import { useFiliais } from "@/hooks/useFiliais";
import {
  Contrato,
  CreateContratoDTO,
  UpdateContratoDTO,
  MudancaSituacaoDTO,
  SituacaoContratoOptions,
  SituacaoContrato,
} from "@/types/api";
import { BoletoCard } from "@/components/boletos/BoletoCard";
import { BoletoDetailsModal } from "@/components/boletos/BoletoDetailsModal";
import { BoletoForm } from "@/components/boletos/BoletoForm";
import { Boleto } from "@/types/boleto";
import { cn } from "@/lib/utils";
import { useForm } from "@/contexts/FormContext";
import { PermissionWrapper } from "@/components/permissions";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

function SituacaoBadge({
  situacao,
}: {
  situacao: SituacaoContrato | undefined | null;
}) {
  // Validar se situação é válida
  if (!situacao || typeof situacao !== "string") {
    return <span className="text-xs text-neutral-500">Sem situação</span>;
  }

  const config = SituacaoContratoOptions.find((opt) => opt.value === situacao);

  if (!config) {
    return (
      <span className="text-xs text-neutral-500">
        {situacao || "Desconhecido"}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.color
      )}
    >
      {config.label}
    </span>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
    </div>
  );
}

function ErrorMessage({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
    >
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-900 mb-2">
        Erro ao carregar dados
      </h3>
      <p className="text-red-700 mb-4">{message}</p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
      >
        Tentar novamente
      </motion.button>
    </motion.div>
  );
}

export default function ContratosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroSituacao, setFiltroSituacao] = useState<
    SituacaoContrato | "todas"
  >("todas");
  const [filtroConsultor, setFiltroConsultor] = useState<number | "todos">(
    "todos"
  );
  const [filtroFilial, setFiltroFilial] = useState<number | "todos">("todos");
  const [filtroProximoContato, setFiltroProximoContato] = useState<
    "hoje" | "semana" | "mes" | "todos"
  >("todos");
  const [filtroDataContrato, setFiltroDataContrato] = useState<
    "hoje" | "semana" | "mes" | "ano" | "todos"
  >("todos");
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [showMudancaSituacao, setShowMudancaSituacao] = useState(false);
  const [showBoletos, setShowBoletos] = useState(false);
  const [showNovoBoleto, setShowNovoBoleto] = useState(false);
  const [selectedBoleto, setSelectedBoleto] = useState<Boleto | null>(null);
  const [showBoletoDetails, setShowBoletoDetails] = useState(false);
  const { openForm, closeForm } = useForm();
  const [activeTab, setActiveTab] = useState<"contratos" | "clientes">(
    "contratos"
  );

  // Debug para produção
  useEffect(() => {
    console.log("🔧 ContratosPage: Página carregada");
    console.log("🔧 ContratosPage: Environment:", process.env.NODE_ENV);
    console.log("🔧 ContratosPage: API URL:", process.env.NEXT_PUBLIC_API_URL);
  }, []);

  const {
    contratos,
    loading,
    error,
    creating,
    updating,
    deleting,
    changingSituacao,
    fetchContratos,
    createContrato,
    updateContrato,
    mudarSituacao,
    deleteContrato,
  } = useContratos();

  const { clientes } = useClientes();
  const { consultores } = useConsultores();
  const { filiais } = useFiliais();
  const {
    boletos,
    loading: loadingBoletos,
    fetchBoletosPorContrato,
    createBoleto,
    syncBoleto,
    deleteBoleto,
  } = useBoletos();
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<
    number | null
  >(null);

  // Debug para verificar se os hooks estão funcionando
  useEffect(() => {
    console.log("🔧 ContratosPage: Contratos carregados:", contratos.length);
    console.log("🔧 ContratosPage: Loading:", loading);
    console.log("🔧 ContratosPage: Error:", error);
    console.log("🔧 ContratosPage: Clientes:", clientes.length);
    console.log("🔧 ContratosPage: Consultores:", consultores.length);
  }, [contratos, loading, error, clientes, consultores]);

  // Filtrar contratos
  const contratosFiltrados = useMemo(() => {
    // Verificar se contratos é válido
    if (!contratos || !Array.isArray(contratos)) {
      return [];
    }

    return contratos.filter((contrato) => {
      // Validar se contrato tem ID válido
      if (!contrato || !contrato.id || isNaN(contrato.id)) {
        return false;
      }

      // Filtro de busca
      if (searchTerm) {
        const termo = searchTerm.toLowerCase();

        // Buscar em múltiplos campos para maior flexibilidade
        // Validar que cliente existe antes de acessar propriedades
        const clienteNome =
          (contrato.cliente && (
            contrato.cliente.pessoaFisica?.nome ||
            contrato.cliente.pessoaJuridica?.razaoSocial
          )) || "";
        const consultorNome = (contrato.consultor && contrato.consultor.pessoaFisica?.nome) || "";
        const clienteEmail =
          (contrato.cliente && (
            contrato.cliente.pessoaFisica?.emailEmpresarial ||
            contrato.cliente.pessoaJuridica?.email
          )) || "";
        const clienteCpfCnpj =
          (contrato.cliente && (
            contrato.cliente.pessoaFisica?.cpf ||
            contrato.cliente.pessoaJuridica?.cnpj
          )) || "";
        const numeroPasta = contrato.numeroPasta || "";
        const tipoServico = contrato.tipoServico || "";
        const situacao = contrato.situacao || "";

        // Debug: log dos dados para verificar estrutura
        if (searchTerm && contratos.length > 0 && contrato === contratos[0]) {
          console.log("🔍 Debug busca - Primeiro contrato:", {
            searchTerm: termo,
            clienteNome,
            consultorNome,
            clienteEmail,
            clienteCpfCnpj,
            numeroPasta,
            tipoServico,
            situacao,
            cliente: contrato.cliente,
            consultor: contrato.consultor,
          });
        }

        // Buscar em todos os campos relevantes
        const campos = [
          clienteNome,
          consultorNome,
          clienteEmail,
          clienteCpfCnpj,
          numeroPasta,
          tipoServico,
          situacao,
        ];

        const encontrado = campos.some(
          (campo) =>
            campo &&
            typeof campo === "string" &&
            campo.toLowerCase().includes(termo)
        );

        if (!encontrado) {
          return false;
        }
      }

      // Filtro de situação
      if (filtroSituacao !== "todas" && contrato.situacao !== filtroSituacao) {
        return false;
      }

      // Filtro de consultor
      if (
        filtroConsultor !== "todos" &&
        contrato.consultorId !== undefined &&
        contrato.consultorId !== null &&
        contrato.consultorId !== filtroConsultor
      ) {
        return false;
      }

      // Filtro de filial
      if (filtroFilial !== "todos") {
        const clienteFilialId =
          contrato.cliente?.filialId ||
          contrato.cliente?.filial?.id;

        if (!clienteFilialId || clienteFilialId !== filtroFilial) {
          return false;
        }
      }

      // Filtro de próximo contato
      if (filtroProximoContato !== "todos") {
        // Verificar se a data existe antes de fazer o parse
        if (!contrato.dataProximoContato) {
          return false;
        }

        try {
          const dataProximoContato = parseISO(contrato.dataProximoContato);
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);

          switch (filtroProximoContato) {
            case "hoje":
              const amanha = new Date(hoje);
              amanha.setDate(amanha.getDate() + 1);
              if (
                !isAfter(dataProximoContato, hoje) ||
                !isBefore(dataProximoContato, amanha)
              ) {
                return false;
              }
              break;
            case "semana":
              const proximaSemana = new Date(hoje);
              proximaSemana.setDate(proximaSemana.getDate() + 7);
              if (
                !isAfter(dataProximoContato, hoje) ||
                !isBefore(dataProximoContato, proximaSemana)
              ) {
                return false;
              }
              break;
            case "mes":
              const proximoMes = new Date(hoje);
              proximoMes.setMonth(proximoMes.getMonth() + 1);
              if (
                !isAfter(dataProximoContato, hoje) ||
                !isBefore(dataProximoContato, proximoMes)
              ) {
                return false;
              }
              break;
          }
        } catch {
          return false;
        }
      }

      // Filtro por data de cadastro do contrato
      if (filtroDataContrato !== "todos") {
        if (!contrato.dataCadastro) {
          return false;
        }

        try {
          const dataCadastro = parseISO(contrato.dataCadastro);
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);

          switch (filtroDataContrato) {
            case "hoje":
              const amanha = new Date(hoje);
              amanha.setDate(amanha.getDate() + 1);
              if (
                !isAfter(dataCadastro, hoje) ||
                !isBefore(dataCadastro, amanha)
              ) {
                return false;
              }
              break;
            case "semana":
              const semanaAtras = new Date(hoje);
              semanaAtras.setDate(semanaAtras.getDate() - 7);
              if (!isAfter(dataCadastro, semanaAtras)) {
                return false;
              }
              break;
            case "mes":
              const mesAtras = new Date(hoje);
              mesAtras.setMonth(mesAtras.getMonth() - 1);
              if (!isAfter(dataCadastro, mesAtras)) {
                return false;
              }
              break;
            case "ano":
              const anoAtras = new Date(hoje);
              anoAtras.setFullYear(anoAtras.getFullYear() - 1);
              if (!isAfter(dataCadastro, anoAtras)) {
                return false;
              }
              break;
          }
        } catch {
          return false;
        }
      }

      return true;
    });
  }, [
    contratos,
    searchTerm,
    filtroSituacao,
    filtroConsultor,
    filtroFilial,
    filtroProximoContato,
    filtroDataContrato,
  ]);

  // Filtrar clientes na aba de clientes
  const clientesFiltrados = useMemo(() => {
    // Validar se clientes é válido
    if (!clientes || !Array.isArray(clientes)) {
      return [];
    }

    if (!searchTerm) return clientes;

    const termo = searchTerm.toLowerCase();
    console.log("🔍 Filtro clientes - Termo de busca:", termo);
    console.log("🔍 Filtro clientes - Total de clientes:", clientes.length);

    const filtrados = clientes.filter((cliente) => {
      // Validar se cliente é válido
      if (!cliente || !cliente.id) {
        return false;
      }

      const nome = cliente.nome || cliente.razaoSocial || "";
      const email = cliente.email || "";
      const cpfCnpj = cliente.cpf || cliente.cnpj || "";
      const telefone = cliente.telefone1 || "";
      const filial =
        typeof cliente.filial === "string"
          ? cliente.filial
          : cliente.filial?.nome || "";

      // Debug do primeiro cliente
      if (cliente === clientes[0]) {
        console.log("🔍 Debug primeiro cliente:", {
          nome,
          email,
          cpfCnpj,
          telefone,
          filial,
          clienteCompleto: cliente,
        });
      }

      const match =
        (typeof nome === "string" && nome.toLowerCase().includes(termo)) ||
        (typeof email === "string" && email.toLowerCase().includes(termo)) ||
        (typeof cpfCnpj === "string" &&
          cpfCnpj.toLowerCase().includes(termo)) ||
        (typeof telefone === "string" &&
          telefone.toLowerCase().includes(termo)) ||
        (typeof filial === "string" && filial.toLowerCase().includes(termo));

      return match;
    });

    console.log("🔍 Filtro clientes - Clientes filtrados:", filtrados.length);
    return filtrados;
  }, [clientes, searchTerm]);

  // Estatísticas
  const estatisticas = useMemo(() => {
    // Validar se contratos é válido
    if (!contratos || !Array.isArray(contratos)) {
      return {
        total: 0,
        emNegociacao: 0,
        fechados: 0,
        valorTotal: 0,
        valorNegociado: 0,
        taxaConversao: "0",
      };
    }

    const total = contratos.length;
    // Atualizar para as novas situações
    const emNegociacao = contratos.filter(
      (c) =>
        c &&
        c.situacao &&
        (c.situacao === "Contrato Enviado" || c.situacao === "Prospecto")
    ).length;
    const fechados = contratos.filter(
      (c) =>
        c &&
        c.situacao &&
        (c.situacao === "Contrato Assinado" || c.situacao === "CLIENTE")
    ).length;
    const valorTotal = contratos.reduce(
      (acc, c) => acc + (c && c.valorDevido ? Number(c.valorDevido) : 0),
      0
    );
    const valorNegociado = contratos
      .filter((c) => c && c.valorNegociado)
      .reduce(
        (acc, c) => acc + (c.valorNegociado ? Number(c.valorNegociado) : 0),
        0
      );

    return {
      total,
      emNegociacao,
      fechados,
      valorTotal,
      valorNegociado,
      taxaConversao: total > 0 ? ((fechados / total) * 100).toFixed(1) : "0",
    };
  }, [contratos]);

  const handleCreateContrato = async (
    data: CreateContratoDTO | Partial<UpdateContratoDTO>
  ) => {
    try {
      // Validar dados antes de enviar
      if (!data.clienteId || data.clienteId === 0) {
        alert("Erro: Cliente é obrigatório");
        return;
      }
      if (!data.consultorId || data.consultorId === 0) {
        alert("Erro: Consultor é obrigatório");
        return;
      }
      if (!data.situacao) {
        alert("Erro: Situação é obrigatória");
        return;
      }

      await createContrato(data as CreateContratoDTO);
      closeForm();
    } catch (error: any) {
      console.error("Erro ao criar contrato:", error);
      // Mostrar erro ao usuário
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        "Erro desconhecido ao criar contrato. Verifique os dados e tente novamente.";
      alert(`Erro ao criar contrato: ${errorMessage}`);
      // Não fechar o formulário em caso de erro para o usuário poder corrigir
    }
  };

  const handleUpdateContrato = async (
    id: number,
    data: Partial<UpdateContratoDTO>
  ) => {
    try {
      await updateContrato(id, data);
      closeForm();
      setSelectedContrato(null);
    } catch (error) {
      console.error("Erro ao atualizar contrato:", error);
    }
  };

  const handleMudarSituacao = async (data: MudancaSituacaoDTO) => {
    if (!selectedContrato) return;

    try {
      await mudarSituacao(selectedContrato.id, data);
      setShowMudancaSituacao(false);
      setSelectedContrato(null);
    } catch (error) {
      console.error("Erro ao mudar situação:", error);
    }
  };

  const handleDeleteContrato = async (id: number) => {
    console.log(
      "🔧 handleDeleteContrato: ID recebido:",
      id,
      "Tipo:",
      typeof id
    );

    // Validação do ID
    if (id === undefined || id === null || isNaN(id)) {
      console.error("🔧 handleDeleteContrato: ID inválido recebido:", id);
      alert("Erro: ID do contrato inválido");
      return;
    }

    if (window.confirm("Tem certeza que deseja excluir este contrato?")) {
      try {
        console.log(
          "🔧 handleDeleteContrato: Confirmado, chamando deleteContrato com ID:",
          id
        );
        await deleteContrato(id);
      } catch (error) {
        console.error("Erro ao excluir contrato:", error);
      }
    }
  };

  const formatCurrency = (value: number | undefined | null) => {
    const numValue = value && typeof value === "number" ? value : 0;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numValue);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "Não informado";
    try {
      return format(parseISO(date), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return date;
    }
  };

  const isProximoContatoVencido = (data: string | null | undefined) => {
    if (!data) return false;
    try {
      return isBefore(parseISO(data), new Date());
    } catch {
      return false;
    }
  };

  // Funções para gerenciamento de boletos
  const handleViewBoletos = async (contrato: Contrato) => {
    if (!contrato || !contrato.id || isNaN(contrato.id)) {
      console.error(
        "Erro: Contrato inválido para visualizar boletos",
        contrato
      );
      alert("Erro: Contrato inválido");
      return;
    }
    setSelectedContrato(contrato);
    setShowBoletos(true);
    await fetchBoletosPorContrato(contrato.id);
  };

  const handleCreateBoleto = async (data: any) => {
    try {
      await createBoleto(data);
      if (
        selectedContrato &&
        selectedContrato.id &&
        !isNaN(selectedContrato.id)
      ) {
        await fetchBoletosPorContrato(selectedContrato.id);
      }
    } catch (error) {
      console.error("Erro ao criar boleto:", error);
    }
  };

  const handleSyncBoleto = async (boleto: Boleto) => {
    if (!boleto || !boleto.id || isNaN(boleto.id)) {
      console.error("Erro: Boleto inválido para sincronizar", boleto);
      return;
    }
    try {
      await syncBoleto(boleto.id);
      if (
        selectedContrato &&
        selectedContrato.id &&
        !isNaN(selectedContrato.id)
      ) {
        await fetchBoletosPorContrato(selectedContrato.id);
      }
    } catch (error) {
      console.error("Erro ao sincronizar boleto:", error);
    }
  };

  const handleDeleteBoleto = async (boleto: Boleto) => {
    if (!boleto || !boleto.id || isNaN(boleto.id)) {
      console.error("Erro: Boleto inválido para excluir", boleto);
      alert("Erro: Boleto inválido");
      return;
    }

    if (!confirm(`Deseja realmente cancelar o boleto #${boleto.id}?`)) {
      return;
    }

    try {
      await deleteBoleto(boleto.id);
      if (
        selectedContrato &&
        selectedContrato.id &&
        !isNaN(selectedContrato.id)
      ) {
        await fetchBoletosPorContrato(selectedContrato.id);
      }
    } catch (error) {
      console.error("Erro ao cancelar boleto:", error);
    }
  };

  const handleViewBoletoDetails = (boleto: Boleto) => {
    if (!boleto || !boleto.id || isNaN(boleto.id)) {
      console.error("Erro: Boleto inválido para visualizar detalhes", boleto);
      alert("Erro: Boleto inválido");
      return;
    }
    setSelectedBoleto(boleto);
    setShowBoletoDetails(true);
  };

  if (loading && contratos.length === 0) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  if (error && contratos.length === 0) {
    return (
      <MainLayout>
        <ErrorMessage message={error} onRetry={fetchContratos} />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header com Estatísticas */}
        <div className="bg-neutral-900/95 backdrop-blur-xl rounded-xl shadow-lg border border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gradient-gold">
                Gestão de Contratos
              </h1>
              <p className="text-sm text-neutral-400 mt-1">
                Gerencie contratos e acompanhe negociações
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setClienteSelecionadoId(null);
                openForm();
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-neutral-950 rounded-lg font-medium transition-all shadow-lg shadow-gold-500/20"
            >
              <Plus className="w-4 h-4" />
              Novo Contrato
            </motion.button>
          </div>

          {/* Cards de Estatísticas - Estilo Premium Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-neutral-900/95 backdrop-blur-xl p-6 rounded-xl border border-neutral-800 hover:border-gold-500/30 hover:shadow-lg hover:shadow-gold-500/10 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-gold-500/20 to-gold-600/20 border border-gold-500/30">
                  <FileText className="w-6 h-6 text-gold-400" />
                </div>
              </div>
              <p className="text-neutral-400 text-sm mb-1">Total de Contratos</p>
              <p className="text-3xl font-bold text-neutral-50">
                {estatisticas.total}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-neutral-900/95 backdrop-blur-xl p-6 rounded-xl border border-neutral-800 hover:border-gold-500/30 hover:shadow-lg hover:shadow-gold-500/10 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-gold-500/20 to-gold-600/20 border border-gold-500/30">
                  <Clock className="w-6 h-6 text-gold-400" />
                </div>
              </div>
              <p className="text-neutral-400 text-sm mb-1">Em Andamento</p>
              <p className="text-3xl font-bold text-neutral-50">
                {estatisticas.emNegociacao}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-neutral-900/95 backdrop-blur-xl p-6 rounded-xl border border-neutral-800 hover:border-gold-500/30 hover:shadow-lg hover:shadow-gold-500/10 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-gold-500/20 to-gold-600/20 border border-gold-500/30">
                  <CheckCircle className="w-6 h-6 text-gold-400" />
                </div>
              </div>
              <p className="text-neutral-400 text-sm mb-1">Concluídos</p>
              <p className="text-3xl font-bold text-neutral-50">
                {estatisticas.fechados}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-neutral-900/95 backdrop-blur-xl p-6 rounded-xl border border-neutral-800 hover:border-gold-500/30 hover:shadow-lg hover:shadow-gold-500/10 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-gold-500/20 to-gold-600/20 border border-gold-500/30">
                  <DollarSign className="w-6 h-6 text-gold-400" />
                </div>
              </div>
              <p className="text-neutral-400 text-sm mb-1">Valor Total</p>
              <p className="text-2xl font-bold text-neutral-50">
                {formatCurrency(estatisticas.valorTotal)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-neutral-900/95 backdrop-blur-xl p-6 rounded-xl border border-neutral-800 hover:border-gold-500/30 hover:shadow-lg hover:shadow-gold-500/10 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-gold-500/20 to-gold-600/20 border border-gold-500/30">
                  <TrendingUp className="w-6 h-6 text-gold-400" />
                </div>
              </div>
              <p className="text-neutral-400 text-sm mb-1">Taxa de Conversão</p>
              <p className="text-3xl font-bold text-neutral-50">
                {estatisticas.taxaConversao}%
              </p>
            </motion.div>
          </div>
        </div>

        {/* Tabs Contratos / Clientes - Estilo Premium */}
        <div className="bg-neutral-900/95 backdrop-blur-xl rounded-xl shadow-lg border border-neutral-800 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("contratos")}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg text-sm font-medium transition-all",
                activeTab === "contratos"
                  ? "bg-gradient-to-r from-gold-500 to-gold-600 text-neutral-950 shadow-lg shadow-gold-500/20"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
              )}
            >
              Contratos
            </button>
            <button
              onClick={() => setActiveTab("clientes")}
              className={cn(
                "flex-1 px-6 py-3 rounded-lg text-sm font-medium transition-all",
                activeTab === "clientes"
                  ? "bg-gradient-to-r from-gold-500 to-gold-600 text-neutral-950 shadow-lg shadow-gold-500/20"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
              )}
            >
              Clientes
            </button>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-neutral-900/95 backdrop-blur-xl rounded-xl shadow-lg border border-neutral-800 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, consultor, email, CPF/CNPJ, pasta, tipo de serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-neutral-800/50 border border-neutral-700 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Filtro de Situação */}
            <div className="relative">
              <select
                value={filtroSituacao}
                onChange={(e) =>
                  setFiltroSituacao(
                    e.target.value as SituacaoContrato | "todas"
                  )
                }
                className="appearance-none pl-10 pr-10 py-2 bg-neutral-800/50 border border-neutral-700 rounded-lg text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all cursor-pointer"
              >
                <option value="todas">Todas as Situações</option>
                {SituacaoContratoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500 pointer-events-none" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500 pointer-events-none" />
            </div>

            {/* Filtro de Consultor */}
            <div className="relative w-auto">
              <select
                value={filtroConsultor}
                onChange={(e) =>
                  setFiltroConsultor(
                    e.target.value === "todos"
                      ? "todos"
                      : Number(e.target.value)
                  )
                }
                className="appearance-none pl-10 pr-10 py-2 bg-neutral-800/50 border border-neutral-700 rounded-lg text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all cursor-pointer w-[160px]"
              >
                <option value="todos">Consultores</option>
                {consultores.map((consultor) => (
                  <option key={consultor.id} value={consultor.id}>
                    {consultor.pessoaFisica?.nome || consultor.nome}
                  </option>
                ))}
              </select>
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500 pointer-events-none" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500 pointer-events-none" />
            </div>

            {/* Filtro de Filial */}
            <div className="relative w-auto">
              <select
                value={filtroFilial}
                onChange={(e) =>
                  setFiltroFilial(
                    e.target.value === "todos"
                      ? "todos"
                      : Number(e.target.value)
                  )
                }
                className="appearance-none pl-10 pr-10 py-2 bg-neutral-800/50 border border-neutral-700 rounded-lg text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all cursor-pointer w-[140px]"
              >
                <option value="todos">Filiais</option>
                {filiais.map((filial) => (
                  <option key={filial.id} value={filial.id}>
                    {filial.nome}
                  </option>
                ))}
              </select>
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500 pointer-events-none" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500 pointer-events-none" />
            </div>

            {/* Filtro de Próximo Contato */}
            <div className="relative">
              <select
                value={filtroProximoContato}
                onChange={(e) =>
                  setFiltroProximoContato(
                    e.target.value as "hoje" | "semana" | "mes" | "todos"
                  )
                }
                className="appearance-none pl-10 pr-10 py-2 bg-neutral-800/50 border border-neutral-700 rounded-lg text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all cursor-pointer"
              >
                <option value="todos">Todos os Prazos</option>
                <option value="hoje">Vence Hoje</option>
                <option value="semana">Vence esta Semana</option>
                <option value="mes">Vence este Mês</option>
              </select>
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500 pointer-events-none" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500 pointer-events-none" />
            </div>

            {/* Filtro por Data de Contrato */}
            <div className="relative">
              <select
                value={filtroDataContrato}
                onChange={(e) =>
                  setFiltroDataContrato(
                    e.target.value as "hoje" | "semana" | "mes" | "ano" | "todos"
                  )
                }
                className="appearance-none pl-10 pr-10 py-2 bg-neutral-800/50 border border-neutral-700 rounded-lg text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all cursor-pointer"
              >
                <option value="todos">Todas as Datas</option>
                <option value="hoje">Criados Hoje</option>
                <option value="semana">Últimos 7 dias</option>
                <option value="mes">Último Mês</option>
                <option value="ano">Último Ano</option>
              </select>
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500 pointer-events-none" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500 pointer-events-none" />
            </div>

            {/* Toggle View Mode */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("cards")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "cards"
                    ? "bg-gradient-to-r from-gold-500 to-gold-600 text-neutral-950 shadow-lg shadow-gold-500/20"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200"
                )}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "table"
                    ? "bg-gradient-to-r from-gold-500 to-gold-600 text-neutral-950 shadow-lg shadow-gold-500/20"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200"
                )}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="3" width="18" height="18" rx="1" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Contratos */}
        {activeTab === "contratos" &&
          (viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {contratosFiltrados.map((contrato, index) => (
                  <motion.div
                    key={contrato.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="bg-neutral-900/95 backdrop-blur-xl rounded-xl shadow-lg border border-neutral-800 hover:border-gold-500/30 hover:shadow-xl hover:shadow-gold-500/10 transition-all duration-300 overflow-hidden group cursor-pointer"
                  >
                    {/* Header do Card */}
                    <div className="p-4 border-b border-neutral-800">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-neutral-50 truncate group-hover:text-gradient-gold transition-all">
                            {(() => {
                              const nome =
                                contrato.cliente?.pessoaFisica?.nome ||
                                contrato.cliente?.pessoaJuridica?.razaoSocial;
                              if (nome) return nome;
                              // fallback: se não veio o objeto cliente, tentar exibir pelo id
                              return contrato.clienteId
                                ? `Cliente #${contrato.clienteId}`
                                : "Cliente não identificado";
                            })()}
                          </h3>
                          <p className="text-xs text-neutral-400 mt-1">
                            #{index + 1} • {formatDate(contrato.dataCadastro)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <SituacaoBadge situacao={contrato.situacao} />
                        </div>
                      </div>
                    </div>

                    {/* Corpo do Card */}
                    <div className="p-4 space-y-3 bg-gradient-to-br from-neutral-900 to-neutral-950">
                      {/* Consultor */}
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gold-500" />
                        <span className="text-sm text-neutral-300">
                          {contrato.consultor?.pessoaFisica?.nome ||
                            "Sem consultor"}
                        </span>
                      </div>

                      {/* Valores */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-neutral-400">
                            Valor Devido
                          </p>
                          <p className="text-sm font-semibold text-neutral-50">
                            {formatCurrency(contrato.valorDevido || 0)}
                          </p>
                        </div>
                        {contrato.valorNegociado && (
                          <div>
                            <p className="text-xs text-neutral-400">
                              Negociado
                            </p>
                            <p className="text-sm font-semibold text-green-400">
                              {formatCurrency(contrato.valorNegociado)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Datas de Contato */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gold-500" />
                          <span className="text-xs text-neutral-300">
                            Último: {formatDate(contrato.dataUltimoContato)}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "flex items-center gap-2",
                            isProximoContatoVencido(
                              contrato.dataProximoContato
                            ) && "text-red-400"
                          )}
                        >
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs font-medium text-neutral-200">
                            Próximo: {formatDate(contrato.dataProximoContato)}
                          </span>
                        </div>
                      </div>

                      {/* Observações */}
                      {contrato.observacoes && (
                        <p className="text-xs text-neutral-400 line-clamp-2">
                          {contrato.observacoes}
                        </p>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="p-4 bg-neutral-950/50 border-t border-neutral-800">
                      <div className="flex items-center gap-2">
                        <Tooltip content="Ver Detalhes">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedContrato(contrato);
                              setShowDetalhes(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 p-2 bg-neutral-800 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-all border border-neutral-700 hover:border-blue-500/30"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              Detalhes
                            </span>
                          </motion.button>
                        </Tooltip>

                        <Tooltip content="Alterar Situação">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedContrato(contrato);
                              setShowMudancaSituacao(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 p-2 bg-neutral-800 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-all border border-neutral-700 hover:border-orange-500/30"
                          >
                            <Settings className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              Situação
                            </span>
                          </motion.button>
                        </Tooltip>

                        <Tooltip content="Ver Boletos">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewBoletos(contrato)}
                            className="flex-1 flex items-center justify-center gap-1 p-2 bg-neutral-800 hover:bg-green-500/20 text-green-400 rounded-lg transition-all border border-neutral-700 hover:border-green-500/30"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span className="text-xs font-medium">Boletos</span>
                          </motion.button>
                        </Tooltip>

                        <Tooltip content="Editar">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedContrato(contrato);
                              openForm();
                            }}
                            className="p-2 bg-neutral-800 hover:bg-gold-500/20 text-gold-400 rounded-lg transition-all border border-neutral-700 hover:border-gold-500/30"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                        </Tooltip>

                        <Tooltip content="Excluir">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteContrato(contrato.id)}
                            className="p-2 bg-neutral-800 hover:bg-red-500/20 text-red-400 rounded-lg transition-all border border-neutral-700 hover:border-red-500/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </Tooltip>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* View de Tabela */
            <div className="bg-neutral-900/95 backdrop-blur-xl rounded-xl shadow-lg border border-neutral-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-950/50 border-b border-neutral-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Consultor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Situação
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Valores
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Próximo Contato
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {contratosFiltrados.map((contrato, index) => (
                      <tr
                        key={contrato.id}
                        className="hover:bg-neutral-800/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-neutral-50">
                              {contrato.cliente?.pessoaFisica?.nome ||
                                contrato.cliente?.pessoaJuridica?.razaoSocial}
                            </p>
                            <p className="text-xs text-neutral-500">
                              #{index + 1}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-neutral-300">
                            {contrato.consultor?.pessoaFisica?.nome}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <SituacaoBadge situacao={contrato.situacao} />
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-neutral-50">
                              {formatCurrency(contrato.valorDevido || 0)}
                            </p>
                            {contrato.valorNegociado && (
                              <p className="text-xs text-green-600">
                                Neg: {formatCurrency(contrato.valorNegociado)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p
                            className={cn(
                              "text-sm",
                              isProximoContatoVencido(
                                contrato.dataProximoContato
                              )
                                ? "text-red-600 font-medium"
                                : "text-neutral-300"
                            )}
                          >
                            {formatDate(contrato.dataProximoContato)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Tooltip content="Ver">
                              <button
                                onClick={() => {
                                  setSelectedContrato(contrato);
                                  setShowDetalhes(true);
                                }}
                                className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Alterar Situação">
                              <button
                                onClick={() => {
                                  setSelectedContrato(contrato);
                                  setShowMudancaSituacao(true);
                                }}
                                className="p-1.5 hover:bg-orange-50 text-orange-600 rounded transition-colors"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Ver Boletos">
                              <button
                                onClick={() => handleViewBoletos(contrato)}
                                className="p-1.5 hover:bg-green-50 text-green-600 rounded transition-colors"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Editar">
                              <button
                                onClick={() => {
                                  setSelectedContrato(contrato);
                                  openForm();
                                }}
                                className="p-1.5 hover:bg-primary-50 text-primary-600 rounded transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Excluir">
                              <button
                                onClick={() =>
                                  handleDeleteContrato(contrato.id)
                                }
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

        {/* Tabela de Clientes (igual a /clientes, simplificada) */}
        {activeTab === "clientes" && (
          <>
            {clientesFiltrados.length > 0 ? (
              <div className="bg-neutral-900/95 backdrop-blur-xl rounded-xl shadow-sm border border-neutral-700/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-800/50 border-b border-neutral-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                          Documento
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                          Contato
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                          Filial
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-neutral-400 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {clientesFiltrados.map((cliente, index) => (
                        <motion.tr
                          key={cliente.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.02 * index }}
                          className="hover:bg-neutral-800/50"
                        >
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-neutral-50">
                              {cliente.nome || cliente.razaoSocial}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {cliente.email || "N/A"}
                            </div>
                            <div className="text-xs text-primary-600 font-medium mt-1">
                              {(() => {
                                if (!contratos || !Array.isArray(contratos)) {
                                  return "Sem contratos";
                                }
                                const qtdContratos = contratos.filter(
                                  (c) => c && c.clienteId === cliente.id
                                ).length;
                                return qtdContratos > 0
                                  ? `${qtdContratos} contrato${
                                      qtdContratos > 1 ? "s" : ""
                                    }`
                                  : "Sem contratos";
                              })()}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-300">
                            {cliente.tipo === "fisica" ? "Física" : "Jurídica"}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-300">
                            {cliente.cpf || cliente.cnpj || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-300">
                            {cliente.telefone1 || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-300">
                            {cliente.filial?.nome || "Não informada"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <Tooltip content="Novo Contrato">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    setClienteSelecionadoId(cliente.id);
                                    openForm();
                                  }}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs rounded-lg font-medium transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                  Contrato
                                </motion.button>
                              </Tooltip>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-neutral-900/95 backdrop-blur-xl rounded-xl shadow-sm border border-neutral-700/60 p-12 text-center"
              >
                <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-50 mb-2">
                  Nenhum cliente encontrado
                </h3>
                <p className="text-neutral-400 mb-6">
                  {searchTerm
                    ? "Tente ajustar o termo de busca para ver mais resultados"
                    : "Não há clientes cadastrados no sistema"}
                </p>
                {!searchTerm && (
                  <p className="text-sm text-neutral-500">
                    Cada cliente pode ter múltiplos contratos. Use o botão
                    "Contrato" ao lado de cada cliente para criar novos
                    contratos.
                  </p>
                )}
              </motion.div>
            )}
          </>
        )}

        {/* Mensagem quando não há contratos */}
        {activeTab === "contratos" && contratosFiltrados.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-neutral-900/95 backdrop-blur-xl rounded-xl shadow-sm border border-neutral-700/60 p-12 text-center"
          >
            <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-50 mb-2">
              Nenhum contrato encontrado
            </h3>
            <p className="text-neutral-400 mb-6">
              {searchTerm ||
              filtroSituacao !== "todas" ||
              filtroConsultor !== "todos" ||
              filtroFilial !== "todos" ||
              filtroProximoContato !== "todos"
                ? "Tente ajustar os filtros para ver mais resultados"
                : "Comece criando um novo contrato"}
            </p>
            {!(
              searchTerm ||
              filtroSituacao !== "todas" ||
              filtroConsultor !== "todos" ||
              filtroFilial !== "todos" ||
              filtroProximoContato !== "todos"
            ) && (
              <div className="text-sm text-neutral-500 space-y-2">
                <p>
                  💡 <strong>Dica:</strong> Você pode criar quantos contratos
                  forem necessários para cada cliente.
                </p>
                <p>
                  • Use o botão "Novo Contrato" acima para criar um contrato do
                  zero
                </p>
                <p>
                  • Na aba "Clientes", clique em "Contrato" ao lado de um
                  cliente específico
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Formulário de Contrato */}
      <ContratoForm
        contrato={selectedContrato}
        clientes={clientes}
        consultores={consultores}
        contratos={contratos}
        onSubmit={
          selectedContrato
            ? (data) => handleUpdateContrato(selectedContrato.id, data)
            : handleCreateContrato
        }
        onCancel={() => {
          setSelectedContrato(null);
          closeForm();
        }}
        initialClienteId={clienteSelecionadoId ?? undefined}
      />

      {/* Overlay antigo removido */}

      {/* Modal de Detalhes */}
      {showDetalhes && selectedContrato && (
        <ContratoDetalhes
          contrato={selectedContrato}
          onClose={() => {
            setShowDetalhes(false);
            setSelectedContrato(null);
          }}
          onEdit={() => {
            setShowDetalhes(false);
            openForm();
          }}
          onMudarSituacao={() => {
            setShowDetalhes(false);
            setShowMudancaSituacao(true);
          }}
        />
      )}

      {/* Modal de Mudança de Situação */}
      {showMudancaSituacao && selectedContrato && (
        <MudancaSituacaoModal
          contrato={selectedContrato}
          onSubmit={handleMudarSituacao}
          onClose={() => {
            setShowMudancaSituacao(false);
            setSelectedContrato(null);
          }}
        />
      )}

      {/* Modal de Boletos do Contrato */}
      {showBoletos && selectedContrato && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900/95 backdrop-blur-xl rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Boletos do Contrato #{selectedContrato.id}
                </h2>
                <p className="text-gray-600 mt-1">
                  {selectedContrato.cliente?.pessoaFisica?.nome ||
                    selectedContrato.cliente?.pessoaJuridica?.razaoSocial ||
                    "Cliente não identificado"}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBoletos(false);
                  setSelectedContrato(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Botão Novo Boleto */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Boletos</h3>
                <button
                  onClick={() => setShowNovoBoleto(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Novo Boleto
                </button>
              </div>

              {/* Loading */}
              {loadingBoletos && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">
                    Carregando boletos...
                  </span>
                </div>
              )}

              {/* Lista de Boletos */}
              {!loadingBoletos &&
                boletos &&
                Array.isArray(boletos) &&
                boletos.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {boletos
                      .filter(
                        (boleto) => boleto && boleto.id && !isNaN(boleto.id)
                      )
                      .map((boleto) => (
                        <BoletoCard
                          key={boleto.id}
                          boleto={boleto}
                          onViewDetails={handleViewBoletoDetails}
                          onSync={handleSyncBoleto}
                          onDelete={handleDeleteBoleto}
                        />
                      ))}
                  </div>
                )}

              {/* Sem boletos */}
              {!loadingBoletos &&
                (!boletos ||
                  !Array.isArray(boletos) ||
                  boletos.length === 0) && (
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      Nenhum boleto encontrado
                    </p>
                    <p className="text-gray-400 mt-2">
                      Este contrato ainda não possui boletos registrados
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Novo Boleto */}
      <BoletoForm
        isOpen={showNovoBoleto}
        onClose={() => setShowNovoBoleto(false)}
        onSubmit={handleCreateBoleto}
        contratos={
          selectedContrato
            ? [
                {
                  id: selectedContrato.id,
                  numeroContrato: `CONT-${selectedContrato.id}`,
                  clienteNome:
                    selectedContrato.cliente?.pessoaFisica?.nome ||
                    selectedContrato.cliente?.pessoaJuridica?.razaoSocial ||
                    "Cliente não identificado",
                  valorNegociado: selectedContrato.valorNegociado,
                },
              ]
            : []
        }
      />

      {/* Modal de Detalhes do Boleto */}
      {selectedBoleto && (
        <BoletoDetailsModal
          boletoId={selectedBoleto.id}
          isOpen={showBoletoDetails}
          onClose={() => {
            setShowBoletoDetails(false);
            setSelectedBoleto(null);
          }}
        />
      )}
    </MainLayout>
  );
}
