"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "@/components/MainLayout";
import { useBoletos } from "@/hooks/useBoletos";
import { Boleto } from "@/types/boleto";
import {
  Building2,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Download,
  Search,
  Eye,
  X,
  RefreshCw,
  MapPin,
  ChevronDown,
  Filter,
  TrendingUp,
  TrendingDown,
  Banknote,
  Receipt,
  Users,
  ArrowUpDown,
  BarChart3,
} from "lucide-react";

interface FaturaDetalhada {
  id: number;
  boletoId: number;
  clienteNome: string;
  clienteDocumento: string;
  numeroContrato: string;
  valor: number;
  dataVencimento: string;
  status: "PENDENTE" | "VENCIDO" | "LIQUIDADO" | "REGISTRADO" | "CANCELADO";
  diasAtraso: number;
  boleto: Boleto;
}

interface EmpresaAgrupada {
  id: string;
  nome: string;
  documento: string;
  faturas: FaturaDetalhada[];
  valorTotal: number;
  valorPendente: number;
  valorLiquidado: number;
  valorVencido: number;
  totalBoletos: number;
  boletosLiquidados: number;
  boletosVencidos: number;
  boletosPendentes: number;
}

type OrdenacaoTipo = "nome" | "valor" | "boletos" | "vencidos";
type FiltroStatus = "todos" | "pendente" | "vencido" | "liquidado";

export default function MapasFaturamentoPage() {
  const { boletos, loading, fetchBoletos } = useBoletos();
  const [empresasExpandidas, setEmpresasExpandidas] = useState<Set<string>>(new Set());
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("todos");
  const [ordenacao, setOrdenacao] = useState<OrdenacaoTipo>("nome");
  const [ordemAscendente, setOrdemAscendente] = useState(true);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [boletoSelecionado, setBoletoSelecionado] = useState<Boleto | null>(null);

  useEffect(() => {
    fetchBoletos();
    const interval = setInterval(fetchBoletos, 30000);
    return () => clearInterval(interval);
  }, []);

  // Processar e agrupar faturas por empresa
  const empresasAgrupadas = useMemo(() => {
    const faturas: FaturaDetalhada[] = boletos.map((boleto) => {
      const hoje = new Date();
      const vencimento = new Date(boleto.dueDate);
      const diasAtraso = Math.max(0, Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24)));

      let status: FaturaDetalhada["status"] = "PENDENTE";
      if (boleto.status === "LIQUIDADO" || boleto.status === "BAIXADO") {
        status = "LIQUIDADO";
      } else if (boleto.status === "CANCELADO") {
        status = "CANCELADO";
      } else if (diasAtraso > 0) {
        status = "VENCIDO";
      } else if (boleto.status === "REGISTRADO" || boleto.status === "ATIVO") {
        status = "REGISTRADO";
      }

      return {
        id: boleto.id,
        boletoId: boleto.id,
        clienteNome: boleto.contrato?.clienteNome || boleto.payerName || "Sem nome",
        clienteDocumento: boleto.contrato?.clienteDocumento || boleto.payerDocumentNumber || "",
        numeroContrato: boleto.contrato?.numeroContrato || "",
        valor: boleto.nominalValue,
        dataVencimento: boleto.dueDate,
        status,
        diasAtraso,
        boleto,
      };
    });

    // Agrupar por empresa usando documento como chave principal
    const grupos: Record<string, EmpresaAgrupada> = {};

    faturas.forEach((fatura) => {
      const chave = fatura.clienteDocumento || fatura.clienteNome;

      if (!grupos[chave]) {
        grupos[chave] = {
          id: chave,
          nome: fatura.clienteNome,
          documento: fatura.clienteDocumento,
          faturas: [],
          valorTotal: 0,
          valorPendente: 0,
          valorLiquidado: 0,
          valorVencido: 0,
          totalBoletos: 0,
          boletosLiquidados: 0,
          boletosVencidos: 0,
          boletosPendentes: 0,
        };
      }

      const empresa = grupos[chave];
      empresa.faturas.push(fatura);
      empresa.valorTotal += fatura.valor;
      empresa.totalBoletos++;

      switch (fatura.status) {
        case "LIQUIDADO":
          empresa.valorLiquidado += fatura.valor;
          empresa.boletosLiquidados++;
          break;
        case "VENCIDO":
          empresa.valorVencido += fatura.valor;
          empresa.boletosVencidos++;
          break;
        case "PENDENTE":
        case "REGISTRADO":
          empresa.valorPendente += fatura.valor;
          empresa.boletosPendentes++;
          break;
      }
    });

    return Object.values(grupos);
  }, [boletos]);

  // Filtrar empresas
  const empresasFiltradas = useMemo(() => {
    let resultado = [...empresasAgrupadas];

    // Aplicar busca
    if (busca) {
      const termoBusca = busca.toLowerCase();
      resultado = resultado.filter(
        (empresa) =>
          empresa.nome.toLowerCase().includes(termoBusca) ||
          empresa.documento.includes(termoBusca) ||
          empresa.faturas.some((f) => f.numeroContrato.toLowerCase().includes(termoBusca))
      );
    }

    // Aplicar filtro de status
    if (filtroStatus !== "todos") {
      resultado = resultado.filter((empresa) => {
        switch (filtroStatus) {
          case "pendente":
            return empresa.boletosPendentes > 0;
          case "vencido":
            return empresa.boletosVencidos > 0;
          case "liquidado":
            return empresa.boletosLiquidados > 0;
          default:
            return true;
        }
      });
    }

    // Aplicar ordenação
    resultado.sort((a, b) => {
      let comparacao = 0;

      switch (ordenacao) {
        case "nome":
          comparacao = a.nome.localeCompare(b.nome);
          break;
        case "valor":
          comparacao = a.valorTotal - b.valorTotal;
          break;
        case "boletos":
          comparacao = a.totalBoletos - b.totalBoletos;
          break;
        case "vencidos":
          comparacao = a.boletosVencidos - b.boletosVencidos;
          break;
      }

      return ordemAscendente ? comparacao : -comparacao;
    });

    return resultado;
  }, [empresasAgrupadas, busca, filtroStatus, ordenacao, ordemAscendente]);

  // Estatísticas gerais
  const estatisticas = useMemo(() => {
    const stats = {
      totalEmpresas: empresasFiltradas.length,
      totalBoletos: 0,
      valorTotal: 0,
      valorLiquidado: 0,
      valorVencido: 0,
      valorPendente: 0,
      boletosLiquidados: 0,
      boletosVencidos: 0,
      boletosPendentes: 0,
    };

    empresasFiltradas.forEach((empresa) => {
      stats.totalBoletos += empresa.totalBoletos;
      stats.valorTotal += empresa.valorTotal;
      stats.valorLiquidado += empresa.valorLiquidado;
      stats.valorVencido += empresa.valorVencido;
      stats.valorPendente += empresa.valorPendente;
      stats.boletosLiquidados += empresa.boletosLiquidados;
      stats.boletosVencidos += empresa.boletosVencidos;
      stats.boletosPendentes += empresa.boletosPendentes;
    });

    return stats;
  }, [empresasFiltradas]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatDocument = (doc: string) => {
    if (!doc) return "";
    const cleaned = doc.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    if (cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
    return doc;
  };

  const toggleEmpresa = (empresaId: string) => {
    setEmpresasExpandidas((prev) => {
      const nova = new Set(prev);
      if (nova.has(empresaId)) {
        nova.delete(empresaId);
      } else {
        nova.add(empresaId);
      }
      return nova;
    });
  };

  const expandirTodas = () => {
    setEmpresasExpandidas(new Set(empresasFiltradas.map((e) => e.id)));
  };

  const recolherTodas = () => {
    setEmpresasExpandidas(new Set());
  };

  const handleVerDetalhes = (boleto: Boleto) => {
    setBoletoSelecionado(boleto);
    setMostrarDetalhes(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "LIQUIDADO":
        return "bg-green-100 text-green-800 border-green-200";
      case "VENCIDO":
        return "bg-red-100 text-red-800 border-red-200";
      case "REGISTRADO":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CANCELADO":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "LIQUIDADO":
        return "Liquidado";
      case "VENCIDO":
        return "Vencido";
      case "REGISTRADO":
        return "Registrado";
      case "CANCELADO":
        return "Cancelado";
      case "PENDENTE":
        return "Pendente";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin text-gold-500 mx-auto mb-4" />
            <p className="text-neutral-400">Carregando mapas de faturamento...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        {/* Header */}
        <div className="bg-neutral-900/50 backdrop-blur-xl border-b border-neutral-800">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl shadow-lg">
                  <MapPin className="w-8 h-8 text-neutral-950" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gradient-gold">
                    Mapas de Faturamento
                  </h1>
                  <p className="text-neutral-400 mt-1">
                    Análise detalhada de boletos por empresa
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchBoletos}
                  className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors"
                  title="Atualizar dados"
                >
                  <RefreshCw className="w-5 h-5 text-neutral-300" />
                </button>
                <button className="flex items-center gap-2 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl transition-colors">
                  <Download className="w-5 h-5 text-neutral-300" />
                  <span className="text-neutral-200">Exportar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-900/95 backdrop-blur-xl rounded-xl border border-neutral-800 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-sm text-neutral-400">Total</span>
              </div>
              <p className="text-3xl font-bold text-neutral-50">
                {estatisticas.totalEmpresas}
              </p>
              <p className="text-sm text-neutral-400 mt-1">Empresas</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-neutral-900/95 backdrop-blur-xl rounded-xl border border-neutral-800 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gold-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-gold-400" />
                </div>
                <span className="text-sm text-neutral-400">Valor</span>
              </div>
              <p className="text-2xl font-bold text-neutral-50">
                {formatCurrency(estatisticas.valorTotal)}
              </p>
              <p className="text-sm text-neutral-400 mt-1">Total em boletos</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-neutral-900/95 backdrop-blur-xl rounded-xl border border-neutral-800 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <span className="text-sm text-red-400">
                  {estatisticas.boletosVencidos} boletos
                </span>
              </div>
              <p className="text-2xl font-bold text-neutral-50">
                {formatCurrency(estatisticas.valorVencido)}
              </p>
              <p className="text-sm text-neutral-400 mt-1">Valor vencido</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-neutral-900/95 backdrop-blur-xl rounded-xl border border-neutral-800 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-sm text-green-400">
                  {estatisticas.boletosLiquidados} boletos
                </span>
              </div>
              <p className="text-2xl font-bold text-neutral-50">
                {formatCurrency(estatisticas.valorLiquidado)}
              </p>
              <p className="text-sm text-neutral-400 mt-1">Valor liquidado</p>
            </motion.div>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-neutral-900/95 backdrop-blur-xl rounded-xl border border-neutral-800 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Buscar por empresa, documento ou contrato..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value as FiltroStatus)}
                  className="px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="pendente">Pendentes</option>
                  <option value="vencido">Vencidos</option>
                  <option value="liquidado">Liquidados</option>
                </select>

                <select
                  value={ordenacao}
                  onChange={(e) => setOrdenacao(e.target.value as OrdenacaoTipo)}
                  className="px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="nome">Ordenar por Nome</option>
                  <option value="valor">Ordenar por Valor</option>
                  <option value="boletos">Ordenar por Qtd Boletos</option>
                  <option value="vencidos">Ordenar por Vencidos</option>
                </select>

                <button
                  onClick={() => setOrdemAscendente(!ordemAscendente)}
                  className="p-3 bg-neutral-800/50 hover:bg-neutral-700 border border-neutral-700 rounded-xl transition-colors"
                  title={ordemAscendente ? "Ordem crescente" : "Ordem decrescente"}
                >
                  <ArrowUpDown className="w-5 h-5 text-neutral-300" />
                </button>

                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={expandirTodas}
                    className="px-4 py-3 bg-neutral-800/50 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-neutral-300 transition-colors text-sm"
                  >
                    Expandir Todas
                  </button>
                  <button
                    onClick={recolherTodas}
                    className="px-4 py-3 bg-neutral-800/50 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-neutral-300 transition-colors text-sm"
                  >
                    Recolher Todas
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Empresas */}
          <div className="space-y-4">
            {empresasFiltradas.length === 0 ? (
              <div className="bg-neutral-900/95 backdrop-blur-xl rounded-xl border border-neutral-800 p-12 text-center">
                <Users className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                <p className="text-xl text-neutral-400 mb-2">Nenhuma empresa encontrada</p>
                <p className="text-sm text-neutral-500">
                  Tente ajustar os filtros ou realizar uma nova busca
                </p>
              </div>
            ) : (
              empresasFiltradas.map((empresa, index) => {
                const isExpanded = empresasExpandidas.has(empresa.id);
                const taxaLiquidacao = empresa.totalBoletos > 0
                  ? (empresa.boletosLiquidados / empresa.totalBoletos) * 100
                  : 0;

                return (
                  <motion.div
                    key={empresa.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-neutral-900/95 backdrop-blur-xl rounded-xl border border-neutral-800 overflow-hidden"
                  >
                    {/* Cabeçalho da Empresa */}
                    <div
                      className="p-6 cursor-pointer hover:bg-neutral-800/30 transition-colors"
                      onClick={() => toggleEmpresa(empresa.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-6 h-6 text-gold-400" />
                          </motion.div>

                          <div className="p-3 bg-gradient-to-br from-gold-500/20 to-gold-600/20 rounded-lg border border-gold-500/30">
                            <Building2 className="w-6 h-6 text-gold-400" />
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold text-neutral-50">
                              {empresa.nome}
                            </h3>
                            <p className="text-sm text-neutral-400">
                              {formatDocument(empresa.documento)} • {empresa.totalBoletos} boleto{empresa.totalBoletos !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          {/* Indicadores de Status */}
                          <div className="flex gap-3">
                            {empresa.boletosVencidos > 0 && (
                              <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium">
                                {empresa.boletosVencidos} vencido{empresa.boletosVencidos !== 1 ? "s" : ""}
                              </span>
                            )}
                            {empresa.boletosPendentes > 0 && (
                              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-medium">
                                {empresa.boletosPendentes} pendente{empresa.boletosPendentes !== 1 ? "s" : ""}
                              </span>
                            )}
                            {empresa.boletosLiquidados > 0 && (
                              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
                                {empresa.boletosLiquidados} liquidado{empresa.boletosLiquidados !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>

                          {/* Valor Total */}
                          <div className="text-right">
                            <p className="text-sm text-neutral-400">Valor Total</p>
                            <p className="text-xl font-bold text-neutral-50">
                              {formatCurrency(empresa.valorTotal)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Barra de Progresso */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-neutral-400">Taxa de Liquidação</span>
                          <span className="text-xs font-medium text-green-400">
                            {taxaLiquidacao.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${taxaLiquidacao}%` }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Detalhes Expandidos */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-neutral-800"
                        >
                          {/* Resumo Financeiro */}
                          <div className="p-6 bg-neutral-800/30">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                              <div className="bg-neutral-900/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Receipt className="w-4 h-4 text-neutral-400" />
                                  <span className="text-sm text-neutral-400">Pendente</span>
                                </div>
                                <p className="text-lg font-semibold text-yellow-400">
                                  {formatCurrency(empresa.valorPendente)}
                                </p>
                              </div>
                              <div className="bg-neutral-900/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertTriangle className="w-4 h-4 text-neutral-400" />
                                  <span className="text-sm text-neutral-400">Vencido</span>
                                </div>
                                <p className="text-lg font-semibold text-red-400">
                                  {formatCurrency(empresa.valorVencido)}
                                </p>
                              </div>
                              <div className="bg-neutral-900/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle className="w-4 h-4 text-neutral-400" />
                                  <span className="text-sm text-neutral-400">Liquidado</span>
                                </div>
                                <p className="text-lg font-semibold text-green-400">
                                  {formatCurrency(empresa.valorLiquidado)}
                                </p>
                              </div>
                              <div className="bg-neutral-900/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <BarChart3 className="w-4 h-4 text-neutral-400" />
                                  <span className="text-sm text-neutral-400">Total</span>
                                </div>
                                <p className="text-lg font-semibold text-gold-400">
                                  {formatCurrency(empresa.valorTotal)}
                                </p>
                              </div>
                            </div>

                            {/* Lista de Boletos */}
                            <div className="space-y-3">
                              {empresa.faturas
                                .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())
                                .map((fatura) => (
                                <motion.div
                                  key={fatura.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="bg-neutral-900/70 rounded-lg p-4 flex items-center justify-between hover:bg-neutral-900 transition-colors"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="p-2 bg-neutral-800 rounded-lg">
                                      <FileText className="w-4 h-4 text-neutral-400" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-neutral-200">
                                        {fatura.numeroContrato || "Sem contrato"}
                                      </p>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-neutral-400">
                                          Boleto #{fatura.boletoId}
                                        </span>
                                        <span className="text-xs text-neutral-500">•</span>
                                        <span className="text-xs text-neutral-400 flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {formatDate(fatura.dataVencimento)}
                                        </span>
                                        {fatura.diasAtraso > 0 && (
                                          <>
                                            <span className="text-xs text-neutral-500">•</span>
                                            <span className="text-xs text-red-400">
                                              {fatura.diasAtraso} dia{fatura.diasAtraso !== 1 ? "s" : ""} atraso
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(fatura.status)}`}>
                                      {getStatusLabel(fatura.status)}
                                    </span>
                                    <div className="text-right">
                                      <p className="text-lg font-semibold text-neutral-50">
                                        {formatCurrency(fatura.valor)}
                                      </p>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleVerDetalhes(fatura.boleto);
                                      }}
                                      className="p-2 hover:bg-gold-500/20 rounded-lg transition-colors"
                                    >
                                      <Eye className="w-4 h-4 text-gold-400" />
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal de Detalhes do Boleto */}
        <AnimatePresence>
          {mostrarDetalhes && boletoSelecionado && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setMostrarDetalhes(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-neutral-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-neutral-800"
              >
                <div className="sticky top-0 bg-gradient-to-r from-gold-500 to-gold-600 p-6 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-neutral-950">
                      Detalhes do Boleto
                    </h2>
                    <button
                      onClick={() => setMostrarDetalhes(false)}
                      className="p-2 hover:bg-black/20 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6 text-neutral-950" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Informações principais */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-400 mb-1">NSU</p>
                      <p className="text-lg font-medium text-neutral-100">
                        {boletoSelecionado.nsuCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400 mb-1">Valor</p>
                      <p className="text-lg font-bold text-gold-400">
                        {formatCurrency(boletoSelecionado.nominalValue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400 mb-1">Vencimento</p>
                      <p className="text-lg font-medium text-neutral-100">
                        {formatDate(boletoSelecionado.dueDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400 mb-1">Status</p>
                      <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(boletoSelecionado.status)}`}>
                        {getStatusLabel(boletoSelecionado.status)}
                      </span>
                    </div>
                  </div>

                  {/* Dados do pagador */}
                  <div className="bg-neutral-800/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-neutral-100 mb-3">
                      Dados do Pagador
                    </h3>
                    <div className="space-y-2">
                      <p className="text-neutral-300">
                        <span className="text-neutral-400">Nome:</span> {boletoSelecionado.payerName}
                      </p>
                      <p className="text-neutral-300">
                        <span className="text-neutral-400">Documento:</span> {formatDocument(boletoSelecionado.payerDocumentNumber)}
                      </p>
                      <p className="text-neutral-300">
                        <span className="text-neutral-400">Endereço:</span> {boletoSelecionado.payerAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}