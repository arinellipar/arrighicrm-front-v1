"use client";

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
} from "lucide-react";

interface Fatura {
  id: number;
  boletoId: number;
  clienteNome: string;
  filialNome: string;
  numeroContrato: string;
  valor: number;
  dataVencimento: string;
  status: "PENDENTE" | "VENCIDO" | "PAGO" | "LIQUIDADO" | "REGISTRADO";
  diasAtraso?: number;
  boleto?: Boleto;
}

export default function MapasFaturamentoPage() {
  const { boletos, loading, fetchBoletos } = useBoletos();
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroFilial, setFiltroFilial] = useState<string>("TODAS");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBoleto, setSelectedBoleto] = useState<Boleto | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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

        // Determinar status
        let status: Fatura["status"] = "PENDENTE";
        if (boleto.status === "LIQUIDADO") {
          status = "LIQUIDADO";
        } else if (boleto.status === "REGISTRADO") {
          status = diffDays > 0 ? "VENCIDO" : "REGISTRADO";
        } else if (boleto.status === "VENCIDO") {
          status = "VENCIDO";
        }

        return {
          id: boleto.id,
          boletoId: boleto.id,
          clienteNome: boleto.payerName,
          filialNome: boleto.contrato?.clienteNome ?? "",
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
    if (boleto.status !== "REGISTRADO" && boleto.status !== "LIQUIDADO") {
      alert("Apenas boletos registrados ou liquidados podem ter o PDF gerado");
      return;
    }

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

        // Tentar parsear a resposta de erro do backend
        let backendError = null;
        try {
          backendError = JSON.parse(errorText);
        } catch (e) {
          // Não é JSON, usar texto direto
        }

        // Mensagem específica baseada no erro do backend
        let errorMessage = "❌ Erro ao baixar PDF do boleto.\n\n";

        // Verificar se é boleto liquidado (verificado no Santander)
        if (
          backendError?.tipo === "BoletoLiquidado" ||
          backendError?.status === "LIQUIDADO"
        ) {
          errorMessage = "✅ Boleto já foi PAGO!\n\n";
          errorMessage +=
            "💰 Este boleto foi liquidado (pago) no Santander.\n\n";
          errorMessage += "📄 O PDF não está mais disponível porque:\n";
          errorMessage +=
            "• Boletos pagos têm prazo de disponibilidade limitado\n";
          errorMessage += "• O Santander remove PDFs após a liquidação\n\n";
          if (backendError?.dataLiquidacao) {
            errorMessage += `📅 Data de liquidação: ${new Date(
              backendError.dataLiquidacao
            ).toLocaleDateString("pt-BR")}\n\n`;
          }
          errorMessage +=
            "💡 Se precisar do comprovante de pagamento, entre em contato com o suporte.";
        }
        // Verificar se é endpoint não autorizado
        else if (
          backendError?.tipo === "EndpointNaoAutorizado" ||
          response.status === 403
        ) {
          errorMessage = "🔒 Funcionalidade não disponível\n\n";
          errorMessage +=
            "📄 O download de PDF não está habilitado na sua conta Santander.\n\n";
          errorMessage += "O que você pode fazer:\n";
          errorMessage +=
            "• Use o QR Code PIX para pagamento (disponível nos detalhes)\n";
          errorMessage += "• Use a linha digitável para pagamento\n";
          errorMessage +=
            "• Entre em contato com o Santander para habilitar o endpoint de PDF\n\n";
          errorMessage +=
            "💡 Nota: O registro de boletos está funcionando normalmente.";
        }
        // Verificar se é erro de autenticação com Santander
        else if (
          backendError?.detalhes?.includes("access token") ||
          backendError?.detalhes?.includes("Forbidden") ||
          response.status === 500
        ) {
          errorMessage += "🔐 Erro de autenticação com o Santander.\n\n";
          errorMessage += "Detalhes técnicos:\n";
          errorMessage += `• ${
            backendError?.detalhes || "Erro interno do servidor"
          }\n\n`;
          errorMessage += "⚠️ Este é um problema de configuração do backend.\n";
          errorMessage += "Entre em contato com o administrador do sistema.";
        } else if (boleto.status === "LIQUIDADO") {
          errorMessage += "⚠️ Este boleto foi LIQUIDADO (pago).\n\n";
          errorMessage += "Possíveis causas:\n";
          errorMessage +=
            "• O PDF pode não estar mais disponível no Santander\n";
          errorMessage +=
            "• Boletos liquidados podem ter prazo de disponibilidade limitado\n";
          errorMessage +=
            "• Entre em contato com o suporte se precisar do comprovante";
        } else {
          errorMessage += "Possíveis causas:\n";
          errorMessage += "• O boleto pode não estar registrado no Santander\n";
          errorMessage += "• Pode haver um problema temporário com o banco\n";
          errorMessage += "• Tente novamente em alguns instantes";
        }

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

      if (boleto.status === "LIQUIDADO") {
        errorMessage += "⚠️ Este boleto foi LIQUIDADO (pago).\n\n";
        errorMessage +=
          "O PDF pode não estar mais disponível pois o boleto já foi pago.\n";
        errorMessage +=
          "Boletos liquidados podem ter prazo de disponibilidade limitado no banco.";
      } else {
        errorMessage += "Verifique sua conexão e tente novamente.\n";
        errorMessage +=
          "Se o problema persistir, entre em contato com o suporte.";
      }

      alert(errorMessage);
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

  const getStatusBadge = (status: string, diasAtraso?: number) => {
    const badges = {
      PENDENTE: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-200",
        label: "Pendente",
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
    const matchFilial =
      filtroFilial === "TODAS" || fatura.filialNome === filtroFilial;
    const matchSearch =
      !searchTerm ||
      fatura.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fatura.numeroContrato.toLowerCase().includes(searchTerm.toLowerCase());

    return matchStatus && matchFilial && matchSearch;
  });

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

  const filiais = Array.from(new Set(faturas.map((f) => f.filialNome)));

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando mapas de faturamento...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                    Mapas de Faturamento
                  </h1>
                  <p className="text-gray-600">
                    Visualize faturas pendentes e vencidas por cliente e filial
                  </p>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all">
              <Download className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Exportar</span>
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
              label: "Pendentes",
              value: stats.pendentes,
              icon: Clock,
              color: "from-yellow-500 to-amber-600",
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
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg transition-all"
            >
              <div
                className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-2`}
              >
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-100 shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por cliente ou contrato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filtro Status */}
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="PENDENTE">Pendentes</option>
              <option value="REGISTRADO">Registrados</option>
              <option value="VENCIDO">Vencidas</option>
              <option value="LIQUIDADO">Liquidadas</option>
            </select>

            {/* Filtro Filial */}
            <select
              value={filtroFilial}
              onChange={(e) => setFiltroFilial(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="TODAS">Todas as Filiais</option>
              {filiais.map((filial) => (
                <option key={filial} value={filial}>
                  {filial}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Tabela */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Filial
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contrato
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {faturasFiltradas.map((fatura, index) => (
                  <motion.tr
                    key={fatura.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-purple-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {fatura.clienteNome}
                          </p>
                          <p className="text-xs text-gray-500">
                            Boleto #{fatura.boletoId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {fatura.filialNome}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-900">
                        {fatura.numeroContrato}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {formatDate(fatura.dataVencimento)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-gray-900">
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
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        {fatura.boleto?.status === "REGISTRADO" && (
                          <button
                            onClick={() =>
                              fatura.boleto && handleDownloadPdf(fatura.boleto)
                            }
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Baixar PDF"
                          >
                            <Download className="w-4 h-4 text-red-600" />
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
              <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">
                Nenhuma fatura encontrada
              </p>
              <p className="text-gray-400 text-sm mt-1">
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
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">
                        Detalhes do Boleto #{selectedBoleto.id}
                      </h2>
                      <p className="text-purple-100">
                        {selectedBoleto.payerName}
                      </p>
                    </div>
                    <button
                      onClick={closeDetailsModal}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6" />
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
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(selectedBoleto.nominalValue)}
                      </p>
                    </div>
                  </div>

                  {/* Informações do Santander - Apenas para boletos registrados */}
                  {(selectedBoleto.status === "REGISTRADO" ||
                    selectedBoleto.status === "LIQUIDADO") && (
                    <div className="bg-gradient-to-br from-red-50 via-orange-50 to-red-50 rounded-2xl p-6 border-2 border-red-200 shadow-lg">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-md">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            Informações Santander
                          </h3>
                          <p className="text-sm text-gray-600">
                            Dados para pagamento
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Coluna 1: Códigos */}
                        <div className="lg:col-span-2 space-y-4">
                          {selectedBoleto.barCode && (
                            <div className="bg-white rounded-xl p-4 border border-red-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <p className="text-sm font-semibold text-gray-700">
                                  Código de Barras
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-sm text-gray-900 flex-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
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
                            <div className="bg-white rounded-xl p-4 border border-red-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <p className="text-sm font-semibold text-gray-700">
                                  Linha Digitável
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-sm text-gray-900 flex-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
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
                            <div className="bg-white rounded-xl p-4 border border-red-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <p className="text-sm font-semibold text-gray-700">
                                  Código PIX Copia e Cola
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-xs text-gray-900 flex-1 bg-gray-50 p-3 rounded-lg border border-gray-200 break-all max-h-24 overflow-y-auto">
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
                            <div className="bg-white rounded-2xl p-6 border-2 border-red-300 shadow-xl">
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
                                <p className="text-xs text-gray-500 mt-2">
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
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Dados do Boleto
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedBoleto.nsuCode && (
                        <div>
                          <p className="text-sm text-gray-600">NSU Code</p>
                          <p className="font-mono text-gray-900">
                            {selectedBoleto.nsuCode}
                          </p>
                        </div>
                      )}
                      {selectedBoleto.bankNumber && (
                        <div>
                          <p className="text-sm text-gray-600">Nosso Número</p>
                          <p className="font-mono text-gray-900">
                            {selectedBoleto.bankNumber}
                          </p>
                        </div>
                      )}
                      {selectedBoleto.covenantCode && (
                        <div>
                          <p className="text-sm text-gray-600">
                            Código do Convênio
                          </p>
                          <p className="font-mono text-gray-900">
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
                    {(selectedBoleto.status === "REGISTRADO" ||
                      selectedBoleto.status === "LIQUIDADO") && (
                      <button
                        onClick={() => {
                          handleDownloadPdf(selectedBoleto);
                        }}
                        className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                      >
                        <Download className="w-5 h-5" />
                        Baixar PDF
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
      </div>
    </MainLayout>
  );
}
