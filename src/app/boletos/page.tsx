// src/app/boletos/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBoletos } from "@/hooks/useBoletos";
import { BoletoCard } from "@/components/boletos/BoletoCard";
import { Boleto, BoletoStatus, BoletoFilters } from "@/types/boleto";
import { StatusBadge } from "@/components/boletos/StatusBadge";
import { NovoBoletoModal } from "@/components/boletos/NovoBoletoModal";
import { SincronizarTodosButton } from "@/components/boletos/SincronizarTodosButton";
import { BoletoDetailsModal } from "@/components/boletos/BoletoDetailsModal";
import MainLayout from "@/components/MainLayout";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Calendar,
  DollarSign,
  User,
  Building,
  CreditCard,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Receipt,
  ArrowUpDown,
} from "lucide-react";
import error from "next/error";
import { formatDate } from "date-fns";

export default function BoletosPage() {
  const {
    boletos,
    loading,
    error,
    fetchBoletos,
    syncBoleto,
    deleteBoleto,
    clearError,
  } = useBoletos();

  const [filters, setFilters] = useState<BoletoFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"date" | "value" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedBoleto, setSelectedBoleto] = useState<Boleto | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNewBoletoModal, setShowNewBoletoModal] = useState(false);
  const [downloadingPdfId, setDownloadingPdfId] = useState<number | null>(null);
  const [downloadingPdfName, setDownloadingPdfName] = useState<string>("");

  useEffect(() => {
    fetchBoletos();
  }, []);

  const handleSync = async (boleto: Boleto) => {
    if (boleto.status !== "REGISTRADO") return;

    setSyncingId(boleto.id);
    try {
      await syncBoleto(boleto.id);
      await fetchBoletos();
    } catch (error) {
      console.error("Erro ao sincronizar boleto:", error);
    } finally {
      setSyncingId(null);
    }
  };

  const handleDelete = async (boleto: Boleto) => {
    // Não permitir deletar boletos pagos (LIQUIDADO ou BAIXADO)
    if (boleto.status === "LIQUIDADO" || boleto.status === "BAIXADO") return;

    if (!confirm(`Deseja realmente cancelar o boleto #${boleto.id}?`)) {
      return;
    }

    setDeletingId(boleto.id);
    try {
      await deleteBoleto(boleto.id);
      await fetchBoletos();
    } catch (error) {
      console.error("Erro ao cancelar boleto:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDetails = (boleto: Boleto) => {
    setSelectedBoleto(boleto);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedBoleto(null);
  };

  const handleDownloadPdf = async (boleto: Boleto) => {
    // Permitir download para boletos REGISTRADOS, ATIVO e VENCIDO (não pagos)
    if (
      boleto.status === "LIQUIDADO" ||
      boleto.status === "BAIXADO" ||
      boleto.status === "CANCELADO"
    ) {
      alert(
        "⚠️ Apenas boletos não pagos podem ter o PDF baixado.\n\nBoletos pagos ou cancelados não estão mais disponíveis na API do Santander."
      );
      return;
    }

    setDownloadingPdfId(boleto.id);
    setDownloadingPdfName(boleto.payerName);

    try {
      // Importar dinamicamente para evitar problemas de SSR
      const { getApiUrl } = await import("@/../env.config");
      const apiUrl = getApiUrl();
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/Boleto/${boleto.id}/pdf`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro ao baixar PDF:", response.status, errorText);

        // Mensagem de erro genérica (boleto já foi validado como REGISTRADO)
        let errorMessage = "⚠️ Erro ao baixar PDF do boleto.\n\n";
        errorMessage += "Possíveis causas:\n";
        errorMessage += "• Pode haver um problema temporário com o banco\n";
        errorMessage += "• O boleto pode estar em processamento\n";
        errorMessage += "• Tente novamente em alguns instantes";

        alert(errorMessage);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Boleto_${boleto.id}_${boleto.payerName.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);

      let errorMessage = "Erro ao baixar PDF do boleto.\n\n";
      errorMessage += "Verifique sua conexão e tente novamente.\n";
      errorMessage +=
        "Se o problema persistir, entre em contato com o suporte.";

      alert(errorMessage);
    } finally {
      setDownloadingPdfId(null);
      setDownloadingPdfName("");
    }
  };

  const handleFilterChange = (key: keyof BoletoFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const applyFilters = () => {
    fetchBoletos(filters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
    fetchBoletos();
  };

  const filteredBoletos = boletos.filter((boleto) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      boleto.id.toString().includes(searchLower) ||
      (boleto.nsuCode?.toLowerCase() || "").includes(searchLower) ||
      (boleto.payerName?.toLowerCase() || "").includes(searchLower) ||
      (boleto.contrato?.clienteNome?.toLowerCase() || "").includes(
        searchLower
      ) ||
      (boleto.contrato?.numeroContrato?.toLowerCase() || "").includes(
        searchLower
      )
    );
  });

  // Ordenação
  const sortedBoletos = [...filteredBoletos].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "date":
        comparison =
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case "value":
        comparison = a.nominalValue - b.nominalValue;
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  // Calcular dias de atraso para boletos vencidos
  const calcularDiasAtraso = (dueDate: string): number | null => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(dueDate);
    vencimento.setHours(0, 0, 0, 0);

    if (vencimento < hoje) {
      const diffTime = hoje.getTime() - vencimento.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return null;
  };

  // Verificar se boleto está vencido
  // Não considerar vencidos os boletos que já foram pagos ou cancelados
  const isVencido = (boleto: Boleto): boolean => {
    // Se o boleto já foi pago (LIQUIDADO ou BAIXADO) ou cancelado, não está vencido
    // LIQUIDADO = Pago, BAIXADO = Pago (PIX), CANCELADO = Cancelado
    if (
      boleto.status === "LIQUIDADO" ||
      boleto.status === "BAIXADO" ||
      boleto.status === "CANCELADO"
    ) {
      return false;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(boleto.dueDate);
    vencimento.setHours(0, 0, 0, 0);
    return vencimento < hoje;
  };

  // Estatísticas rápidas
  const stats = {
    total: boletos.length,
    totalValue: boletos.reduce((sum, b) => sum + b.nominalValue, 0),
    pendentes: boletos.filter((b) => b.status === "PENDENTE").length,
    registrados: boletos.filter((b) => b.status === "REGISTRADO").length,
    // Liquidados: inclui boletos pagos (LIQUIDADO) e pagos com PIX (BAIXADO)
    liquidados: boletos.filter(
      (b) => b.status === "LIQUIDADO" || b.status === "BAIXADO"
    ).length,
    // Vencidos: apenas boletos não pagos e não cancelados que estão vencidos
    // Não contar boletos LIQUIDADO (Pago), BAIXADO (Pago com PIX) ou CANCELADO como vencidos
    vencidos: boletos.filter((b) => isVencido(b)).length,
  };

  const StatusIcon = ({ status }: { status: BoletoStatus }) => {
    switch (status) {
      case "PENDENTE":
        return <Clock className="w-4 h-4" />;
      case "REGISTRADO":
        return <FileText className="w-4 h-4" />;
      case "LIQUIDADO":
        return <CheckCircle className="w-4 h-4" />;
      case "BAIXADO":
        return <CheckCircle className="w-4 h-4" />;
      case "VENCIDO":
        return <AlertTriangle className="w-4 h-4" />;
      case "CANCELADO":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (loading && boletos.length === 0) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="relative">
              <RefreshCw className="w-12 h-12 animate-spin text-gold-400 mx-auto" />
              <div className="absolute inset-0 blur-xl bg-gold-500/30 animate-pulse" />
            </div>
            <p className="mt-4 text-neutral-400 font-medium">
              Carregando boletos...
            </p>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl shadow-lg shadow-gold-500/30">
                  <Receipt className="w-8 h-8 text-neutral-950" />
                </div>
                <h1 className="text-4xl font-bold text-gradient-gold">
                  Boletos
                </h1>
                <Sparkles className="w-6 h-6 text-gold-400 animate-pulse" />
              </div>
              <p className="text-neutral-400 ml-14">
                Gerencie todos os boletos bancários do sistema
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchBoletos()}
                className="group flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <RefreshCw
                  className={`w-5 h-5 text-neutral-300 group-hover:text-gold-400 transition-colors ${
                    loading ? "animate-spin" : ""
                  }`}
                />
                <span className="font-medium text-neutral-200 group-hover:text-neutral-50">
                  Atualizar
                </span>
              </motion.button>

              <SincronizarTodosButton
                onSincronizacaoConcluida={() => fetchBoletos()}
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewBoletoModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-neutral-950 rounded-xl font-medium shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                Novo Boleto
              </motion.button>
            </div>
          </motion.div>

          {/* Estatísticas Rápidas - Estilo Premium Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              {
                label: "Total",
                value: stats.total,
                icon: FileText,
              },
              {
                label: "Valor Total",
                value: formatCurrency(stats.totalValue),
                icon: DollarSign,
              },
              {
                label: "Cancelados",
                value: stats.pendentes,
                icon: Clock,
              },
              {
                label: "Registrados",
                value: stats.registrados,
                icon: CreditCard,
              },
              {
                label: "Pagos",
                value: stats.liquidados,
                icon: CheckCircle,
              },
              {
                label: "Vencidos",
                value: stats.vencidos,
                icon: AlertTriangle,
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-neutral-900/95 backdrop-blur-xl p-6 rounded-xl border border-neutral-800 hover:border-gold-500/30 hover:shadow-lg hover:shadow-gold-500/10 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-gold-500/20 to-gold-600/20 border border-gold-500/30">
                    <stat.icon className="w-6 h-6 text-gold-400" />
                  </div>
                </div>
                <p className="text-neutral-400 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-neutral-50">
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Barra de Busca e Filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-neutral-900/95 backdrop-blur-xl rounded-2xl border border-neutral-800 shadow-xl p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por ID, NSU, cliente ou contrato..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200 text-neutral-100 placeholder-neutral-500"
                />
              </div>

              {/* Controles */}
              <div className="flex items-center gap-3">
                {/* Ordenação */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <ArrowUpDown className="w-5 h-5 text-neutral-400" />
                  </button>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 bg-neutral-800/50 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-neutral-200"
                  >
                    <option value="date">Data</option>
                    <option value="value">Valor</option>
                    <option value="status">Status</option>
                  </select>
                </div>

                {/* View Mode */}
                <div className="flex items-center bg-neutral-800 rounded-lg p-1 border border-neutral-700">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${
                      viewMode === "grid"
                        ? "bg-gold-500 shadow-lg shadow-gold-500/20"
                        : ""
                    } transition-all duration-200`}
                  >
                    <svg
                      className={`w-5 h-5 ${
                        viewMode === "grid"
                          ? "text-neutral-950"
                          : "text-neutral-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${
                      viewMode === "list"
                        ? "bg-gold-500 shadow-lg shadow-gold-500/20"
                        : ""
                    } transition-all duration-200`}
                  >
                    <svg
                      className={`w-5 h-5 ${
                        viewMode === "list"
                          ? "text-neutral-950"
                          : "text-neutral-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Filtros */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors"
                >
                  <Filter className="w-5 h-5 text-neutral-400" />
                  <span className="font-medium text-neutral-200">Filtros</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Painel de Filtros */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6 pt-6 border-t border-neutral-700">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Status
                      </label>
                      <select
                        value={filters.status || ""}
                        onChange={(e) =>
                          handleFilterChange("status", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-neutral-800/50 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Todos</option>
                        <option value="PENDENTE">Cancelado</option>
                        <option value="REGISTRADO">Registrado</option>
                        <option value="LIQUIDADO">Pago</option>
                        <option value="VENCIDO">Vencido</option>
                        <option value="CANCELADO">Cancelado (Banco)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Data Inicial
                      </label>
                      <input
                        type="date"
                        value={filters.dataInicio || ""}
                        onChange={(e) =>
                          handleFilterChange("dataInicio", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-neutral-800/50 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Data Final
                      </label>
                      <input
                        type="date"
                        value={filters.dataFim || ""}
                        onChange={(e) =>
                          handleFilterChange("dataFim", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-neutral-800/50 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div className="flex items-end gap-2 lg:col-span-2">
                      <button
                        onClick={applyFilters}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                      >
                        Aplicar Filtros
                      </button>
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium transition-colors"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Lista de Boletos */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {sortedBoletos.map((boleto, index) => (
                  <motion.div
                    key={boleto.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.02 }}
                    className="relative group h-full"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500 rounded-2xl" />
                    <div className="bg-neutral-900/95 backdrop-blur-sm rounded-2xl border border-neutral-800 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
                      {/* Header do Card */}
                      <div className="p-5 border-b border-neutral-800">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm text-neutral-500 mb-1">
                              Boleto #{boleto.id}
                            </p>
                            <h3 className="font-semibold text-neutral-50 text-lg">
                              {boleto.payerName}
                            </h3>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <StatusBadge status={boleto.status} />
                            {isVencido(boleto) && (
                              <span className="text-xs font-bold text-red-400">
                                {calcularDiasAtraso(boleto.dueDate)} dia
                                {calcularDiasAtraso(boleto.dueDate)! > 1
                                  ? "s"
                                  : ""}{" "}
                                de atraso
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                          <Building className="w-4 h-4" />
                          <span>
                            {boleto.contrato?.clienteNome || "Sem contrato"}
                          </span>
                        </div>
                      </div>

                      {/* Corpo do Card */}
                      <div className="p-5 space-y-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-neutral-500">Valor</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              {formatCurrency(boleto.nominalValue)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-neutral-500">
                              Vencimento
                            </p>
                            <p className="text-lg font-semibold text-neutral-50">
                              {formatDate(boleto.dueDate)}
                            </p>
                            {isVencido(boleto) && (
                              <p className="text-xs font-bold text-red-400 mt-1">
                                Vencido há {calcularDiasAtraso(boleto.dueDate)}{" "}
                                dia
                                {calcularDiasAtraso(boleto.dueDate)! > 1
                                  ? "s"
                                  : ""}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Alerta de Vencimento */}
                        {isVencido(boleto) && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                              <p className="text-sm font-semibold text-red-800">
                                Boleto vencido há{" "}
                                {calcularDiasAtraso(boleto.dueDate)} dia
                                {calcularDiasAtraso(boleto.dueDate)! > 1
                                  ? "s"
                                  : ""}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* NSU - sempre mostra com altura fixa */}
                        <div className="p-3 bg-neutral-800/50 rounded-lg min-h-[60px]">
                          <p className="text-xs text-neutral-500 mb-1">NSU</p>
                          <p className="font-mono text-sm text-neutral-300">
                            {boleto.nsuCode || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="p-4 bg-neutral-800/50 border-t border-neutral-800 mt-auto">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleViewDetails(boleto)}
                            className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-800/50 hover:bg-amber-500/20 border border-neutral-700 hover:border-amber-500/30 text-amber-400 rounded-lg transition-colors font-medium text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            Detalhes
                          </button>
                          {(boleto.status === "REGISTRADO" ||
                            boleto.status === "ATIVO" ||
                            boleto.status === "VENCIDO") && (
                            <>
                              <button
                                onClick={() => handleDownloadPdf(boleto)}
                                disabled={downloadingPdfId === boleto.id}
                                className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-800/50 hover:bg-red-500/20 border border-neutral-700 hover:border-red-500/30 text-red-400 rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Baixar PDF oficial do Santander"
                              >
                                {downloadingPdfId === boleto.id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                                {downloadingPdfId === boleto.id
                                  ? "Baixando..."
                                  : "PDF"}
                              </button>
                              <button
                                onClick={() => handleSync(boleto)}
                                disabled={syncingId === boleto.id}
                                className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-800/50 hover:bg-green-500/20 border border-neutral-700 hover:border-green-500/30 text-green-400 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
                              >
                                <RefreshCw
                                  className={`w-4 h-4 ${
                                    syncingId === boleto.id
                                      ? "animate-spin"
                                      : ""
                                  }`}
                                />
                                Sync
                              </button>
                            </>
                          )}
                          {boleto.status !== "LIQUIDADO" &&
                            boleto.status !== "BAIXADO" && (
                              <button
                                onClick={() => handleDelete(boleto)}
                                disabled={deletingId === boleto.id}
                                className="p-2 bg-neutral-800/50 hover:bg-red-500/20 border border-neutral-700 hover:border-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                                title="Cancelar boleto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* View de Lista */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-neutral-900/95 backdrop-blur-xl rounded-2xl border border-neutral-800 shadow-xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-800/50 border-b border-neutral-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        ID / NSU
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Cliente / Contrato
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Vencimento
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {sortedBoletos.map((boleto) => (
                      <tr
                        key={boleto.id}
                        className="hover:bg-neutral-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-neutral-50">
                              #{boleto.id}
                            </p>
                            {boleto.nsuCode && (
                              <p className="text-xs text-neutral-500 font-mono">
                                {boleto.nsuCode}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-neutral-50">
                              {boleto.payerName}
                            </p>
                            <p className="text-sm text-neutral-500">
                              {boleto.contrato?.clienteNome || "Sem contrato"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <StatusBadge status={boleto.status} />
                            {isVencido(boleto) && (
                              <span className="text-xs font-bold text-red-400">
                                {calcularDiasAtraso(boleto.dueDate)} dia
                                {calcularDiasAtraso(boleto.dueDate)! > 1
                                  ? "s"
                                  : ""}{" "}
                                de atraso
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-neutral-50">
                            {formatCurrency(boleto.nominalValue)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-neutral-300">
                              {formatDate(boleto.dueDate)}
                            </p>
                            {isVencido(boleto) && (
                              <p className="text-xs font-bold text-red-400 mt-1">
                                ⚠️ Vencido há{" "}
                                {calcularDiasAtraso(boleto.dueDate)} dia
                                {calcularDiasAtraso(boleto.dueDate)! > 1
                                  ? "s"
                                  : ""}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleViewDetails(boleto)}
                              className="p-1.5 hover:bg-gold-500/20 text-gold-400 rounded transition-colors"
                              title="Ver detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {(boleto.status === "REGISTRADO" ||
                              boleto.status === "ATIVO" ||
                              boleto.status === "VENCIDO") && (
                              <>
                                <button
                                  onClick={() => handleDownloadPdf(boleto)}
                                  disabled={downloadingPdfId === boleto.id}
                                  className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={
                                    downloadingPdfId === boleto.id
                                      ? "Baixando PDF..."
                                      : "Baixar PDF oficial do Santander"
                                  }
                                >
                                  {downloadingPdfId === boleto.id ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Download className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleSync(boleto)}
                                  disabled={syncingId === boleto.id}
                                  className="p-1.5 hover:bg-green-500/20 text-green-400 rounded transition-colors disabled:opacity-50"
                                  title="Sincronizar"
                                >
                                  <RefreshCw
                                    className={`w-4 h-4 ${
                                      syncingId === boleto.id
                                        ? "animate-spin"
                                        : ""
                                    }`}
                                  />
                                </button>
                              </>
                            )}
                            {boleto.status !== "LIQUIDADO" &&
                              boleto.status !== "BAIXADO" && (
                                <button
                                  onClick={() => handleDelete(boleto)}
                                  disabled={deletingId === boleto.id}
                                  className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors disabled:opacity-50"
                                  title="Cancelar boleto"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {sortedBoletos.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="relative inline-block">
                <Receipt className="w-24 h-24 text-neutral-300 mx-auto mb-6" />
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-green-400/20 blur-3xl rounded-full"
                />
              </div>
              <p className="text-2xl font-bold text-neutral-300 mb-2">
                {searchTerm || Object.keys(filters).length > 0
                  ? "Nenhum boleto encontrado"
                  : "Nenhum boleto cadastrado"}
              </p>
              <p className="text-neutral-500 max-w-md mx-auto mb-6">
                {searchTerm || Object.keys(filters).length > 0
                  ? "Tente ajustar os filtros ou termos de busca"
                  : "Comece criando seu primeiro boleto bancário"}
              </p>
              {(searchTerm || Object.keys(filters).length > 0) && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-medium transition-colors"
                >
                  Limpar Filtros
                </button>
              )}
            </motion.div>
          )}

          {/* Modal de Detalhes legacy - REMOVIDO (usar apenas BoletoDetailsModal) */}

          {/* Erro */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg max-w-md z-40"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium">
                    Erro ao carregar boletos
                  </p>
                  <p className="text-red-400 text-sm mt-1">{error}</p>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-400 hover:text-red-800 hover:bg-red-100 p-1 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Toast de Download em Progresso */}
          <AnimatePresence>
            {downloadingPdfId && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.3 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                className="fixed bottom-8 right-8 z-50"
              >
                <div className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 text-neutral-100 rounded-2xl shadow-2xl p-6 min-w-[320px]">
                  <div className="flex items-center gap-4">
                    {/* Ícone Animado */}
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-12 h-12 rounded-full border-4 border-amber-500/30 border-t-amber-500 flex items-center justify-center"
                      >
                        <Download className="w-6 h-6 text-amber-400" />
                      </motion.div>
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-0 bg-amber-500/20 rounded-full blur-md"
                      />
                    </div>

                    {/* Texto */}
                    <div className="flex-1">
                      <p className="font-bold text-lg mb-1 text-neutral-100">Baixando PDF...</p>
                      <p className="text-neutral-300 text-sm">
                        Boleto #{downloadingPdfId}
                      </p>
                      <p className="text-neutral-400 text-xs mt-1 truncate max-w-[200px]">
                        {downloadingPdfName}
                      </p>
                    </div>

                    {/* Animação de Progresso */}
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-amber-500/40 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "easeInOut" }}
                    />
                  </div>

                  {/* Barra de progresso indeterminada */}
                  <div className="mt-3 w-full bg-neutral-800/50 rounded-full h-1 overflow-hidden">
                    <motion.div
                      className="h-full bg-neutral-900/95 backdrop-blur-xl rounded-full"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{ width: "50%" }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal de Detalhes com Status da API */}
          <BoletoDetailsModal
            boletoId={selectedBoleto?.id || 0}
            isOpen={showDetailsModal}
            onClose={closeDetailsModal}
          />

          {/* Modal Novo Boleto */}
          <NovoBoletoModal
            isOpen={showNewBoletoModal}
            onClose={() => setShowNewBoletoModal(false)}
            onSuccess={() => {
              fetchBoletos();
              setShowNewBoletoModal(false);
            }}
          />
        </div>
      </div>
    </MainLayout>
  );
}
