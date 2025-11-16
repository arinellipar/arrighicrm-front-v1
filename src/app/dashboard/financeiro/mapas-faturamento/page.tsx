"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MainLayout from "@/components/MainLayout";
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
  Filter,
  Search,
} from "lucide-react";

interface Fatura {
  id: number;
  boletoId: number;
  clienteNome: string;
  filialNome: string;
  numeroContrato: string;
  valor: number;
  dataVencimento: string;
  status: "PENDENTE" | "VENCIDO" | "PAGO";
  diasAtraso?: number;
}

export default function MapasFaturamentoPage() {
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroFilial, setFiltroFilial] = useState<string>("TODAS");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFaturas();
  }, []);

  const fetchFaturas = async () => {
    try {
      setLoading(true);
      // TODO: Implementar chamada real à API
      // const response = await fetch('/api/Boleto/mapas-faturamento');
      // const data = await response.json();

      // Dados mockados para demonstração
      const mockData: Fatura[] = [
        {
          id: 1,
          boletoId: 50,
          clienteNome: "EMPRESA ABC LTDA",
          filialNome: "Rio de Janeiro - RJ",
          numeroContrato: "CTR-2024-001",
          valor: 5500.0,
          dataVencimento: "2024-11-10",
          status: "VENCIDO",
          diasAtraso: 6,
        },
        {
          id: 2,
          boletoId: 51,
          clienteNome: "CONSULTORIA XYZ",
          filialNome: "São Paulo - SP",
          numeroContrato: "CTR-2024-002",
          valor: 3200.0,
          dataVencimento: "2024-11-20",
          status: "PENDENTE",
        },
        {
          id: 3,
          boletoId: 52,
          clienteNome: "TECH SOLUTIONS",
          filialNome: "Rio de Janeiro - RJ",
          numeroContrato: "CTR-2024-003",
          valor: 8900.0,
          dataVencimento: "2024-11-05",
          status: "VENCIDO",
          diasAtraso: 11,
        },
      ];

      setFaturas(mockData);
    } catch (error) {
      console.error("Erro ao carregar faturas:", error);
    } finally {
      setLoading(false);
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
    };

    const badge = badges[status as keyof typeof badges];
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
    pendentes: faturas.filter((f) => f.status === "PENDENTE").length,
    vencidas: faturas.filter((f) => f.status === "VENCIDO").length,
    valorTotal: faturas.reduce((sum, f) => sum + f.valor, 0),
    valorVencido: faturas
      .filter((f) => f.status === "VENCIDO")
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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
              label: "Valor Total",
              value: formatCurrency(stats.valorTotal),
              icon: DollarSign,
              color: "from-green-500 to-emerald-600",
            },
            {
              label: "Valor Vencido",
              value: formatCurrency(stats.valorVencido),
              icon: TrendingUp,
              color: "from-purple-500 to-pink-600",
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
              <option value="VENCIDO">Vencidas</option>
              <option value="PAGO">Pagas</option>
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
                          className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <FileText className="w-4 h-4 text-purple-600" />
                        </button>
                        <button
                          className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                          title="Marcar como pago"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </button>
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
      </div>
    </MainLayout>
  );
}
