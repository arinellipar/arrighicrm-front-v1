"use client";
// BUILD: 2025-11-19T00:00:00 - Corrigido: Status ATIVO e CANCELADO agora são tratados corretamente

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "@/components/MainLayout";
import { useBoletos } from "@/hooks/useBoletos";
import { Boleto } from "@/types/boleto";
import { StatusBadge } from "@/components/boletos/StatusBadge";
import {
  Building,
  User,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  Download,
  Search,
  Eye,
  X,
  CreditCard,
  RefreshCw,
  Map,
} from "lucide-react";

interface Fatura {
  id: number;
  boletoId: number;
  clienteNome: string;
  filialNome: string;
  numeroContrato: string;
  valor: number;
  dataVencimento: string;
  status:
    | "PENDENTE"
    | "VENCIDO"
    | "PAGO"
    | "LIQUIDADO"
    | "REGISTRADO"
    | "CANCELADO";
  diasAtraso?: number;
  boleto?: Boleto;
}

export default function MapasFaturamentoPage() {
  const { boletos, loading, fetchBoletos } = useBoletos();
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBoleto, setSelectedBoleto] = useState<Boleto | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [downloadingPdfId, setDownloadingPdfId] = useState<number | null>(null);
  const [downloadingPdfName, setDownloadingPdfName] = useState<string>("");

  useEffect(() => {
    fetchBoletos();
  }, []);

  useEffect(() => {
    convertBoletosToFaturas();
  }, [boletos]);

  const convertBoletosToFaturas = () => {
    try {
      const faturasConvertidas: Fatura[] = boletos.map((boleto) => {
        // Calcular dias de atraso
        const hoje = new Date();
        const vencimento = new Date(boleto.dueDate);
        const diffTime = hoje.getTime() - vencimento.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Determinar status baseado no status do boleto e data de vencimento
        let status: Fatura["status"] = "PENDENTE";

        if (boleto.status === "LIQUIDADO" || boleto.status === "BAIXADO") {
          status = "LIQUIDADO";
        } else if (boleto.status === "CANCELADO") {
          status = "CANCELADO";
        } else if (boleto.status === "ATIVO") {
          // Boleto ativo: verificar se está vencido
          status = diffDays > 0 ? "VENCIDO" : "REGISTRADO";
        } else if (boleto.status === "REGISTRADO") {
          // Boleto registrado: verificar se está vencido
          status = diffDays > 0 ? "VENCIDO" : "REGISTRADO";
        } else if (boleto.status === "VENCIDO") {
          status = "VENCIDO";
        } else if (boleto.status === "PENDENTE") {
          status = "PENDENTE";
        }

        return {
          id: boleto.id,
          boletoId: boleto.id,
          clienteNome: boleto.payerName,
          filialNome: boleto.contrato?.filialNome ?? "Sem filial",
          numeroContrato: boleto.contrato?.numeroContrato ?? "",
          valor: boleto.nominalValue,
          dataVencimento: boleto.dueDate,
          status: status,
          diasAtraso: diffDays > 0 ? diffDays : undefined,
          boleto: boleto,
        };
      });

      setFaturas(faturasConvertidas);
    } catch (error) {
      console.error("Erro ao converter boletos:", error);
      setFaturas([]);
    }
  };

  const handleViewDetails = (fatura: Fatura) => {
    if (fatura.boleto) {
      setSelectedBoleto(fatura.boleto);
      setShowDetailsModal(true);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedBoleto(null);
  };

  const handleDownloadPdf = async (boleto: Boleto) => {
    console.log("🔍 handleDownloadPdf chamado para boleto:", {
      id: boleto.id,
      status: boleto.status,
      payerName: boleto.payerName,
    });

    if (boleto.status !== "REGISTRADO" && boleto.status !== "VENCIDO") {
      alert(
        "⚠️ Apenas boletos REGISTRADOS ou VENCIDOS (não pagos) podem ter o PDF baixado.\n\nBoletos pagos não estão mais disponíveis na API do Santander."
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

        // Mensagem específica baseada no status do boleto
        let errorMessage = "⚠️ Erro ao baixar PDF do boleto.\n\n";
        errorMessage += "Possíveis causas:\n";
        errorMessage += "• O boleto pode não estar registrado no Santander\n";
        errorMessage += "• Pode haver um problema temporário com o banco\n";
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  // Status badges - PENDENTE exibido como "Cancelado" (v2.0)
  const getStatusBadge = (status: string, diasAtraso?: number) => {
    const badges = {
      PENDENTE: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-200",
        label: "Cancelado",
      },
      REGISTRADO: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-200",
        label: "Registrado",
      },
      VENCIDO: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
        label: diasAtraso ? `Vencido (${diasAtraso}d)` : "Vencido",
      },
      PAGO: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
        label: "Pago",
      },
      LIQUIDADO: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
        label: "Liquidado",
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.PENDENTE;

    // FORÇAR REBUILD: v2.0.1 - Status PENDENTE = Cancelado em Cinza
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}
      >
        {badge.label}
      </span>
    );
  };

  const faturasFiltradas = faturas.filter((fatura) => {
    const matchStatus =
      filtroStatus === "TODOS" || fatura.status === filtroStatus;
    const matchSearch =
      !searchTerm ||
      fatura.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fatura.numeroContrato.toLowerCase().includes(searchTerm.toLowerCase());

    return matchStatus && matchSearch;
  });

  // Debug: verificar boletos com botão de PDF
  useEffect(() => {
    const boletosComPdf = faturasFiltradas.filter(
      (f) => f.boleto?.status === "REGISTRADO"
    );
    console.log(
      "🔍 Mapas-Faturamento: Boletos com botão PDF:",
      boletosComPdf.length,
      "de",
      faturasFiltradas.length
    );
  }, [faturasFiltradas]);

  const stats = {
    total: faturas.length,
    pendentes: faturas.filter(
      (f) => f.status === "PENDENTE" || f.status === "REGISTRADO"
    ).length,
    vencidas: faturas.filter((f) => f.status === "VENCIDO").length,
    liquidadas: faturas.filter((f) => f.status === "LIQUIDADO").length,
    valorTotal: faturas.reduce((sum, f) => sum + f.valor, 0),
    valorVencido: faturas
      .filter((f) => f.status === "VENCIDO")
      .reduce((sum, f) => sum + f.valor, 0),
    valorLiquidado: faturas
      .filter((f) => f.status === "LIQUIDADO")
      .reduce((sum, f) => sum + f.valor, 0),
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
            <p className="text-neutral-400">Carregando mapas de faturamento...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl shadow-lg shadow-gold-500/30">
                  <Map className="w-8 h-8 text-neutral-950" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gradient-gold">
                    Mapas de Faturamento
                  </h1>
                  <p className="text-neutral-400">
                    Visualize faturas canceladas e vencidas por cliente
                  </p>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-xl hover:bg-neutral-700 hover:border-gold-500/50 transition-all">
              <Download className="w-5 h-5 text-neutral-300" />
              <span className="font-medium text-neutral-200">Exportar</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            {
              label: "Total Faturas",
              value: stats.total,
              icon: FileText,
              color: "from-blue-500 to-blue-600",
            },
            {
              label: "Cancelados",
              value: stats.pendentes,
              icon: Clock,
              color: "from-gray-500 to-gray-600",
            },
            {
              label: "Vencidas",
              value: stats.vencidas,
              icon: AlertTriangle,
              color: "from-red-500 to-pink-600",
            },
            {
              label: "Liquidadas",
              value: stats.liquidadas,
              icon: CheckCircle,
              color: "from-green-500 to-emerald-600",
            },
            {
              label: "Valor Total",
              value: formatCurrency(stats.valorTotal),
              icon: DollarSign,
              color: "from-purple-500 to-indigo-600",
            },
            {
              label: "Valor Liquidado",
              value: formatCurrency(stats.valorLiquidado),
              icon: TrendingUp,
              color: "from-emerald-500 to-green-600",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-neutral-900/95 rounded-xl border border-neutral-800 p-4 hover:shadow-lg hover:shadow-gold-500/10 hover:border-gold-500/30 transition-all"
            >
              <div
                className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-2`}
              >
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-neutral-50">{stat.value}</p>
              <p className="text-xs text-neutral-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-neutral-900/95 rounded-xl border border-neutral-800 shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por cliente ou contrato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 text-neutral-100 placeholder-neutral-500"
              />
            </div>

            {/* Filtro Status */}
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 text-neutral-100"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="PENDENTE">Cancelados</option>
              <option value="REGISTRADO">Registrados</option>
              <option value="VENCIDO">Vencidas</option>
              <option value="LIQUIDADO">Liquidadas</option>
            </select>
          </div>
        </motion.div>

        {/* Tabela */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-neutral-900/95 rounded-xl border border-neutral-800 shadow-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gold-500/20 to-gold-600/20 border-b border-neutral-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gold-400 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gold-400 uppercase tracking-wider">
                    Contrato
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gold-400 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gold-400 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gold-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gold-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {faturasFiltradas.map((fatura, index) => (
                  <motion.tr
                    key={fatura.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gold-500/20 to-gold-600/20 rounded-lg flex items-center justify-center border border-gold-500/30">
                          <User className="w-5 h-5 text-gold-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-50">
                            {fatura.clienteNome}
                          </p>
                          <p className="text-xs text-neutral-400">
                            Boleto #{fatura.boletoId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-neutral-200">
                        {fatura.numeroContrato}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-neutral-500" />
                        <span className="text-sm text-neutral-300">
                          {formatDate(fatura.dataVencimento)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-neutral-50">
                        {formatCurrency(fatura.valor)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(fatura.status, fatura.diasAtraso)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(fatura)}
                          className="p-2 hover:bg-gold-500/20 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4 text-gold-400" />
                        </button>
                        {fatura.boleto &&
                          (fatura.boleto.status === "REGISTRADO" ||
                            fatura.boleto.status === "ATIVO" ||
                            fatura.boleto.status === "VENCIDO") && (
                            <button
                              onClick={() => handleDownloadPdf(fatura.boleto!)}
                              disabled={downloadingPdfId === fatura.boleto.id}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={
                                downloadingPdfId === fatura.boleto.id
                                  ? "Baixando PDF..."
                                  : "Baixar PDF"
                              }
                            >
                              {downloadingPdfId === fatura.boleto.id ? (
                                <RefreshCw className="w-4 h-4 text-red-400 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4 text-red-400" />
                              )}
                            </button>
                          )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {faturasFiltradas.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-400 font-medium">
                Nenhuma fatura encontrada
              </p>
              <p className="text-neutral-500 text-sm mt-1">
                Tente ajustar os filtros de busca
              </p>
            </div>
          )}
        </motion.div>

        {/* Modal de Detalhes do Boleto */}
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
                className="bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-neutral-800"
              >
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-gold-500 to-gold-600 text-neutral-950 p-6 rounded-t-2xl z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">
                        Detalhes do Boleto #{selectedBoleto.id}
                      </h2>
                      <p className="text-neutral-800">
                        {selectedBoleto.payerName}
                      </p>
                    </div>
                    <button
                      onClick={closeDetailsModal}
                      className="p-2 hover:bg-black/20 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-6 space-y-6">
                  {/* Status e Valor */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700">
                      <p className="text-sm text-neutral-400 mb-2">Status</p>
                      <StatusBadge status={selectedBoleto.status} />
                    </div>
                    <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700">
                      <p className="text-sm text-neutral-400 mb-2">Valor</p>
                      <p className="text-2xl font-bold text-gold-400">
                        {formatCurrency(selectedBoleto.nominalValue)}
                      </p>
                    </div>
                  </div>

                  {/* Informações do Santander - Apenas para boletos registrados */}
                  {(selectedBoleto.status === "REGISTRADO" ||
                    selectedBoleto.status === "LIQUIDADO") && (
                    <div className="bg-gradient-to-br from-red-500/10 via-orange-500/10 to-red-500/10 rounded-2xl p-6 border-2 border-red-500/30 shadow-lg">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-md">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-neutral-50">
                            Informações Santander
                          </h3>
                          <p className="text-sm text-neutral-400">
                            Dados para pagamento
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Coluna 1: Códigos */}
                        <div className="lg:col-span-2 space-y-4">
                          {selectedBoleto.barCode && (
                            <div className="bg-neutral-800/50 rounded-xl p-4 border border-red-500/30 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <p className="text-sm font-semibold text-neutral-200">
                                  Código de Barras
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-sm text-neutral-100 flex-1 bg-neutral-900 p-3 rounded-lg border border-neutral-700">
                                  {selectedBoleto.barCode}
                                </p>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      selectedBoleto.barCode!
                                    );
                                    alert("Código copiado!");
                                  }}
                                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Copiar código"
                                >
                                  <FileText className="w-5 h-5 text-red-600" />
                                </button>
                              </div>
                            </div>
                          )}

                          {selectedBoleto.digitableLine && (
                            <div className="bg-neutral-800/50 rounded-xl p-4 border border-red-500/30 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <p className="text-sm font-semibold text-neutral-200">
                                  Linha Digitável
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-sm text-neutral-100 flex-1 bg-neutral-900 p-3 rounded-lg border border-neutral-700">
                                  {selectedBoleto.digitableLine}
                                </p>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      selectedBoleto.digitableLine!
                                    );
                                    alert("Linha digitável copiada!");
                                  }}
                                  className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
                                  title="Copiar linha"
                                >
                                  <FileText className="w-5 h-5 text-orange-600" />
                                </button>
                              </div>
                            </div>
                          )}

                          {selectedBoleto.qrCodePix && (
                            <div className="bg-neutral-800/50 rounded-xl p-4 border border-red-500/30 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <p className="text-sm font-semibold text-neutral-200">
                                  Código PIX Copia e Cola
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-xs text-neutral-100 flex-1 bg-neutral-900 p-3 rounded-lg border border-neutral-700 break-all max-h-24 overflow-y-auto">
                                  {selectedBoleto.qrCodePix}
                                </p>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      selectedBoleto.qrCodePix!
                                    );
                                    alert("Código PIX copiado!");
                                  }}
                                  className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                                  title="Copiar código PIX"
                                >
                                  <FileText className="w-5 h-5 text-green-600" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Coluna 2: QR Code */}
                        {selectedBoleto.qrCodePix && (
                          <div className="flex flex-col items-center justify-center">
                            <div className="bg-neutral-800/50 rounded-2xl p-6 border-2 border-red-500/30 shadow-xl">
                              <div className="relative">
                                <img
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                                    selectedBoleto.qrCodePix
                                  )}`}
                                  alt="QR Code PIX"
                                  className="w-56 h-56 rounded-xl"
                                />
                              </div>
                              <div className="mt-4 text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-medium shadow-md">
                                  <CreditCard className="w-4 h-4" />
                                  Pague com PIX
                                </div>
                                <p className="text-xs text-neutral-400 mt-2">
                                  Escaneie com seu app
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dados do Boleto */}
                  <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700">
                    <h3 className="text-lg font-bold text-neutral-50 mb-4">
                      Dados do Boleto
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedBoleto.nsuCode && (
                        <div>
                          <p className="text-sm text-neutral-400">NSU Code</p>
                          <p className="font-mono text-neutral-100">
                            {selectedBoleto.nsuCode}
                          </p>
                        </div>
                      )}
                      {selectedBoleto.bankNumber && (
                        <div>
                          <p className="text-sm text-neutral-400">Nosso Número</p>
                          <p className="font-mono text-neutral-100">
                            {selectedBoleto.bankNumber}
                          </p>
                        </div>
                      )}
                      {selectedBoleto.covenantCode && (
                        <div>
                          <p className="text-sm text-neutral-400">
                            Código do Convênio
                          </p>
                          <p className="font-mono text-neutral-100">
                            {selectedBoleto.covenantCode}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">
                          Data de Vencimento
                        </p>
                        <p className="text-gray-900">
                          {formatDate(selectedBoleto.dueDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Data de Emissão</p>
                        <p className="text-gray-900">
                          {formatDate(selectedBoleto.issueDate)}
                        </p>
                      </div>
                      {selectedBoleto.entryDate && (
                        <div>
                          <p className="text-sm text-neutral-400">
                            Data de Entrada
                          </p>
                          <p className="text-neutral-100">
                            {formatDate(selectedBoleto.entryDate)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dados do Pagador */}
                  <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700">
                    <h3 className="text-lg font-bold text-neutral-50 mb-4 flex items-center gap-2">
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
                          <p className="text-sm text-neutral-400">Cliente</p>
                          <p className="text-neutral-100">
                            {selectedBoleto.contrato.clienteNome}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-400">
                            Número do Contrato
                          </p>
                          <p className="font-mono text-neutral-100">
                            {selectedBoleto.contrato.numeroContrato}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer com Ações */}
                <div className="sticky bottom-0 bg-neutral-800/50 p-6 rounded-b-2xl border-t border-neutral-700">
                  <div className="flex items-center gap-3 flex-wrap">
                    {(selectedBoleto.status === "REGISTRADO" ||
                      selectedBoleto.status === "VENCIDO") && (
                      <button
                        onClick={() => {
                          handleDownloadPdf(selectedBoleto);
                        }}
                        disabled={downloadingPdfId === selectedBoleto.id}
                        className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {downloadingPdfId === selectedBoleto.id ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Download className="w-5 h-5" />
                        )}
                        {downloadingPdfId === selectedBoleto.id
                          ? "Baixando..."
                          : "Baixar PDF"}
                      </button>
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
                      className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-xl font-medium transition-colors border border-neutral-600"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast de Download em Progresso */}
        <AnimatePresence>
          {downloadingPdfId && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className="fixed bottom-8 right-8 z-50"
            >
              <div className="bg-gradient-to-r from-gold-500 to-gold-600 text-neutral-950 rounded-2xl shadow-2xl shadow-gold-500/30 p-6 min-w-[320px]">
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
                      className="w-12 h-12 rounded-full border-4 border-neutral-950/30 border-t-neutral-950 flex items-center justify-center"
                    >
                      <Download className="w-6 h-6" />
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 bg-neutral-950/20 rounded-full blur-md"
                    />
                  </div>

                  {/* Texto */}
                  <div className="flex-1">
                    <p className="font-bold text-lg mb-1">Baixando PDF...</p>
                    <p className="text-neutral-900 text-sm font-medium">
                      Boleto #{downloadingPdfId}
                    </p>
                    <p className="text-neutral-800 text-xs mt-1 truncate max-w-[200px]">
                      {downloadingPdfName}
                    </p>
                  </div>

                  {/* Animação de Progresso */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-neutral-950/40 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                  />
                </div>

                {/* Barra de progresso indeterminada */}
                <div className="mt-3 w-full bg-neutral-950/20 rounded-full h-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-neutral-950 rounded-full"
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
      </div>
    </MainLayout>
  );
}
