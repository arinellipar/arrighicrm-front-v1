// src/app/boletos/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBoletos } from "@/hooks/useBoletos";
import { BoletoCard } from "@/components/boletos/BoletoCard";
import { Boleto, BoletoStatus, BoletoFilters } from "@/types/boleto";
import { StatusBadge } from "@/components/boletos/StatusBadge";
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
    if (boleto.status === "LIQUIDADO") return;

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
    if (boleto.status !== "REGISTRADO") {
      alert("Apenas boletos registrados podem ter o PDF gerado");
      return;
    }

    try {
      // Usar a URL base da API do ambiente
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5101/api";
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/Boleto/${boleto.id}/pdf`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro ao baixar PDF:", errorText);
        throw new Error(`Erro ao baixar PDF: ${response.status}`);
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
      alert(
        "Erro ao baixar PDF do boleto. Verifique se o boleto está registrado no Santander."
      );
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

  // Estatísticas rápidas
  const stats = {
    total: boletos.length,
    totalValue: boletos.reduce((sum, b) => sum + b.nominalValue, 0),
    pendentes: boletos.filter((b) => b.status === "PENDENTE").length,
    registrados: boletos.filter((b) => b.status === "REGISTRADO").length,
    liquidados: boletos.filter((b) => b.status === "LIQUIDADO").length,
    vencidos: boletos.filter((b) => b.status === "VENCIDO").length,
  };

  const StatusIcon = ({ status }: { status: BoletoStatus }) => {
    switch (status) {
      case "PENDENTE":
        return <Clock className="w-4 h-4" />;
      case "REGISTRADO":
        return <FileText className="w-4 h-4" />;
      case "LIQUIDADO":
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
              <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
              <div className="absolute inset-0 blur-xl bg-blue-400/30 animate-pulse" />
            </div>
            <p className="mt-4 text-gray-600 font-medium">
              Carregando boletos...
            </p>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg">
                  <Receipt className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 bg-clip-text text-transparent">
                  Boletos
                </h1>
                <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
              </div>
              <p className="text-gray-600 ml-14">
                Gerencie todos os boletos bancários do sistema
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchBoletos()}
                className="group flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <RefreshCw
                  className={`w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors ${
                    loading ? "animate-spin" : ""
                  }`}
                />
                <span className="font-medium text-gray-700 group-hover:text-gray-900">
                  Atualizar
                </span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                Novo Boleto
              </motion.button>
            </div>
          </motion.div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              {
                label: "Total",
                value: stats.total,
                icon: FileText,
                color: "from-blue-500 to-blue-600",
              },
              {
                label: "Valor Total",
                value: formatCurrency(stats.totalValue),
                icon: DollarSign,
                color: "from-green-500 to-emerald-600",
              },
              {
                label: "Pendentes",
                value: stats.pendentes,
                icon: Clock,
                color: "from-orange-500 to-amber-600",
              },
              {
                label: "Registrados",
                value: stats.registrados,
                icon: CreditCard,
                color: "from-purple-500 to-pink-600",
              },
              {
                label: "Liquidados",
                value: stats.liquidados,
                icon: CheckCircle,
                color: "from-emerald-500 to-green-600",
              },
              {
                label: "Vencidos",
                value: stats.vencidos,
                icon: AlertTriangle,
                color: "from-red-500 to-pink-600",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 rounded-xl`}
                />
                <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 p-4 hover:shadow-lg transition-all duration-300">
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Barra de Busca e Filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-xl p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por ID, NSU, cliente ou contrato..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowUpDown className="w-5 h-5 text-gray-600" />
                  </button>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="date">Data</option>
                    <option value="value">Valor</option>
                    <option value="status">Status</option>
                  </select>
                </div>

                {/* View Mode */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${
                      viewMode === "grid" ? "bg-white shadow-sm" : ""
                    } transition-all duration-200`}
                  >
                    <svg
                      className="w-5 h-5 text-gray-600"
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
                      viewMode === "list" ? "bg-white shadow-sm" : ""
                    } transition-all duration-200`}
                  >
                    <svg
                      className="w-5 h-5 text-gray-600"
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
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Filter className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Filtros</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-600 transition-transform ${
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
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6 pt-6 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={filters.status || ""}
                        onChange={(e) =>
                          handleFilterChange("status", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Todos</option>
                        <option value="PENDENTE">Pendente</option>
                        <option value="REGISTRADO">Registrado</option>
                        <option value="LIQUIDADO">Liquidado</option>
                        <option value="VENCIDO">Vencido</option>
                        <option value="CANCELADO">Cancelado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Inicial
                      </label>
                      <input
                        type="date"
                        value={filters.dataInicio || ""}
                        onChange={(e) =>
                          handleFilterChange("dataInicio", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Final
                      </label>
                      <input
                        type="date"
                        value={filters.dataFim || ""}
                        onChange={(e) =>
                          handleFilterChange("dataFim", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
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
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500 rounded-2xl" />
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                      {/* Header do Card */}
                      <div className="p-5 border-b border-gray-100">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">
                              Boleto #{boleto.id}
                            </p>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {boleto.payerName}
                            </h3>
                          </div>
                          <StatusBadge status={boleto.status} />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building className="w-4 h-4" />
                          <span>
                            {boleto.contrato?.clienteNome || "Sem contrato"}
                          </span>
                        </div>
                      </div>

                      {/* Corpo do Card */}
                      <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Valor</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              {formatCurrency(boleto.nominalValue)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Vencimento</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatDate(boleto.dueDate)}
                            </p>
                          </div>
                        </div>

                        {boleto.nsuCode && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">NSU</p>
                            <p className="font-mono text-sm text-gray-700">
                              {boleto.nsuCode}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="p-4 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleViewDetails(boleto)}
                            className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-blue-50 text-blue-600 rounded-lg transition-colors font-medium text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            Detalhes
                          </button>
                          {boleto.status === "REGISTRADO" && (
                            <>
                              <button
                                onClick={() => handleDownloadPdf(boleto)}
                                className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-red-50 text-red-600 rounded-lg transition-colors font-medium text-sm"
                                title="Baixar PDF oficial do Santander"
                              >
                                <Download className="w-4 h-4" />
                                PDF
                              </button>
                              <button
                                onClick={() => handleSync(boleto)}
                                disabled={syncingId === boleto.id}
                                className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-green-50 text-green-600 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
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
                          {boleto.status !== "LIQUIDADO" && (
                            <button
                              onClick={() => handleDelete(boleto)}
                              disabled={deletingId === boleto.id}
                              className="p-2 bg-white hover:bg-red-50 text-red-600 rounded-lg transition-colors disabled:opacity-50"
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
              className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        ID / NSU
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Cliente / Contrato
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Vencimento
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedBoletos.map((boleto) => (
                      <tr
                        key={boleto.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              #{boleto.id}
                            </p>
                            {boleto.nsuCode && (
                              <p className="text-xs text-gray-500 font-mono">
                                {boleto.nsuCode}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {boleto.payerName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {boleto.contrato?.clienteNome || "Sem contrato"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={boleto.status} />
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(boleto.nominalValue)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-700">
                            {formatDate(boleto.dueDate)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleViewDetails(boleto)}
                              className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                              title="Ver detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {boleto.status === "REGISTRADO" && (
                              <>
                                <button
                                  onClick={() => handleDownloadPdf(boleto)}
                                  className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                                  title="Baixar PDF oficial do Santander"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleSync(boleto)}
                                  disabled={syncingId === boleto.id}
                                  className="p-1.5 hover:bg-green-50 text-green-600 rounded transition-colors disabled:opacity-50"
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
                            {boleto.status !== "LIQUIDADO" && (
                              <button
                                onClick={() => handleDelete(boleto)}
                                disabled={deletingId === boleto.id}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors disabled:opacity-50"
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
                <Receipt className="w-24 h-24 text-gray-200 mx-auto mb-6" />
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
              <p className="text-2xl font-bold text-gray-700 mb-2">
                {searchTerm || Object.keys(filters).length > 0
                  ? "Nenhum boleto encontrado"
                  : "Nenhum boleto cadastrado"}
              </p>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {searchTerm || Object.keys(filters).length > 0
                  ? "Tente ajustar os filtros ou termos de busca"
                  : "Comece criando seu primeiro boleto bancário"}
              </p>
              {(searchTerm || Object.keys(filters).length > 0) && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Limpar Filtros
                </button>
              )}
            </motion.div>
          )}

          {/* Modal de Detalhes */}
          <AnimatePresence>
            {showDetailsModal && selectedBoleto && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={closeDetailsModal}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                >
                  {/* Header */}
                  <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">
                          Detalhes do Boleto #{selectedBoleto.id}
                        </h2>
                        <p className="text-green-100">
                          {selectedBoleto.payerName}
                        </p>
                      </div>
                      <button
                        onClick={closeDetailsModal}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-6 space-y-6">
                    {/* Status e Valor */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-2">Status</p>
                        <StatusBadge status={selectedBoleto.status} />
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-2">Valor</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(selectedBoleto.nominalValue)}
                        </p>
                      </div>
                    </div>

                    {/* Informações do Santander */}
                    {selectedBoleto.status === "REGISTRADO" && (
                      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-red-600" />
                          Informações Santander
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedBoleto.barCode && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                Código de Barras
                              </p>
                              <p className="font-mono text-sm bg-white p-2 rounded border border-red-200">
                                {selectedBoleto.barCode}
                              </p>
                            </div>
                          )}
                          {selectedBoleto.digitableLine && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                Linha Digitável
                              </p>
                              <p className="font-mono text-sm bg-white p-2 rounded border border-red-200">
                                {selectedBoleto.digitableLine}
                              </p>
                            </div>
                          )}
                          {selectedBoleto.qrCodePix && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-gray-600 mb-1">
                                QR Code PIX
                              </p>
                              <div className="bg-white p-4 rounded border border-red-200">
                                <p className="font-mono text-xs break-all">
                                  {selectedBoleto.qrCodePix}
                                </p>
                              </div>
                            </div>
                          )}
                          {selectedBoleto.qrCodeUrl && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-gray-600 mb-2">
                                QR Code
                              </p>
                              <img
                                src={selectedBoleto.qrCodeUrl}
                                alt="QR Code"
                                className="w-48 h-48 mx-auto border-2 border-red-200 rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Dados do Boleto */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Dados do Boleto
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">NSU Code</p>
                          <p className="font-mono text-gray-900">
                            {selectedBoleto.nsuCode || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Nosso Número</p>
                          <p className="font-mono text-gray-900">
                            {selectedBoleto.bankNumber || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Código do Convênio
                          </p>
                          <p className="font-mono text-gray-900">
                            {selectedBoleto.covenantCode || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Data de Vencimento
                          </p>
                          <p className="text-gray-900">
                            {formatDate(selectedBoleto.dueDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Data de Emissão
                          </p>
                          <p className="text-gray-900">
                            {formatDate(selectedBoleto.issueDate)}
                          </p>
                        </div>
                        {selectedBoleto.entryDate && (
                          <div>
                            <p className="text-sm text-gray-600">
                              Data de Entrada
                            </p>
                            <p className="text-gray-900">
                              {formatDate(selectedBoleto.entryDate)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dados do Pagador */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Dados do Pagador
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Nome</p>
                          <p className="text-gray-900">
                            {selectedBoleto.payerName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Documento</p>
                          <p className="font-mono text-gray-900">
                            {selectedBoleto.payerDocumentNumber}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600">Endereço</p>
                          <p className="text-gray-900">
                            {selectedBoleto.payerAddress},{" "}
                            {selectedBoleto.payerNeighborhood}
                          </p>
                          <p className="text-gray-900">
                            {selectedBoleto.payerCity} -{" "}
                            {selectedBoleto.payerState} - CEP:{" "}
                            {selectedBoleto.payerZipCode}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Contrato */}
                    {selectedBoleto.contrato && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Contrato
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Cliente</p>
                            <p className="text-gray-900">
                              {selectedBoleto.contrato.clienteNome}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              Número do Contrato
                            </p>
                            <p className="font-mono text-gray-900">
                              {selectedBoleto.contrato.numeroContrato}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer com Ações */}
                  <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200">
                    <div className="flex items-center gap-3 flex-wrap">
                      {selectedBoleto.status === "REGISTRADO" && (
                        <>
                          <button
                            onClick={() => {
                              handleDownloadPdf(selectedBoleto);
                            }}
                            className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                          >
                            <Download className="w-5 h-5" />
                            Baixar PDF
                          </button>
                          <button
                            onClick={() => {
                              handleSync(selectedBoleto);
                              closeDetailsModal();
                            }}
                            className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                          >
                            <RefreshCw className="w-5 h-5" />
                            Sincronizar
                          </button>
                        </>
                      )}
                      {selectedBoleto.digitableLine && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              selectedBoleto.digitableLine!
                            );
                            alert("Linha digitável copiada!");
                          }}
                          className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                        >
                          <FileText className="w-5 h-5" />
                          Copiar Linha
                        </button>
                      )}
                      <button
                        onClick={closeDetailsModal}
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Erro */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg max-w-md"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium">
                    Erro ao carregar boletos
                  </p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
