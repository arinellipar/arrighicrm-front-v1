// src/app/dashboard/financeiro/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useBoletos } from "@/hooks/useBoletos";
import { DashboardFinanceiro } from "@/types/boleto";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export default function DashboardFinanceiroPage() {
  const { dashboard, loading, error, fetchDashboard, clearError } =
    useBoletos();
  const [stats, setStats] = useState<DashboardFinanceiro | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    setStats(dashboard);
  }, [dashboard]);

  const loadDashboard = async () => {
    try {
      await fetchDashboard();
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    subtitle,
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-red-800">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Financeiro
          </h1>
          <p className="text-gray-600 mt-1">
            Visão geral dos boletos e movimentações financeiras
          </p>
        </div>
        <button
          onClick={loadDashboard}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de Boletos"
          value={stats?.totalBoletos || 0}
          icon={FileText}
          color="bg-blue-500"
          subtitle="Todos os boletos do sistema"
        />

        <StatCard
          title="Valor Registrado"
          value={formatCurrency(stats?.valorTotalRegistrado || 0)}
          icon={DollarSign}
          color="bg-green-500"
          subtitle="Boletos registrados no Santander"
        />

        <StatCard
          title="Valor Liquidado"
          value={formatCurrency(stats?.valorTotalLiquidado || 0)}
          icon={CheckCircle}
          color="bg-emerald-500"
          subtitle="Boletos pagos pelos clientes"
        />

        <StatCard
          title="Boletos Hoje"
          value={stats?.boletosHoje || 0}
          icon={Clock}
          color="bg-purple-500"
          subtitle="Criados hoje"
        />
      </div>

      {/* Status dos Boletos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Status dos Boletos
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.boletosPendentes || 0}
            </p>
            <p className="text-sm text-gray-600">Pendentes</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.boletosRegistrados || 0}
            </p>
            <p className="text-sm text-gray-600">Registrados</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.boletosLiquidados || 0}
            </p>
            <p className="text-sm text-gray-600">Liquidados</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.boletosVencidos || 0}
            </p>
            <p className="text-sm text-gray-600">Vencidos</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <XCircle className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.boletosCancelados || 0}
            </p>
            <p className="text-sm text-gray-600">Cancelados</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6 text-pink-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {(stats?.totalBoletos || 0) -
                ((stats?.boletosPendentes || 0) +
                  (stats?.boletosRegistrados || 0) +
                  (stats?.boletosLiquidados || 0) +
                  (stats?.boletosVencidos || 0) +
                  (stats?.boletosCancelados || 0))}
            </p>
            <p className="text-sm text-gray-600">Com Erro</p>
          </div>
        </div>
      </div>

      {/* Métricas Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Boletos do Mês */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Boletos do Mês
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Criados este mês</span>
              <span className="font-semibold text-gray-900">
                {stats?.boletosEsteMes || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Média diária</span>
              <span className="font-semibold text-gray-900">
                {stats?.boletosEsteMes
                  ? Math.round((stats.boletosEsteMes / 30) * 10) / 10
                  : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Performance de Cobrança */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance de Cobrança
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Taxa de liquidação</span>
              <span className="font-semibold text-green-600">
                {stats?.totalBoletos
                  ? Math.round(
                      ((stats.boletosLiquidados || 0) / stats.totalBoletos) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Taxa de vencimento</span>
              <span className="font-semibold text-red-600">
                {stats?.totalBoletos
                  ? Math.round(
                      ((stats.boletosVencidos || 0) / stats.totalBoletos) * 100
                    )
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sem dados */}
      {(!stats || stats.totalBoletos === 0) && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nenhum boleto encontrado</p>
          <p className="text-gray-400 mt-2">
            Comece criando boletos para ver as estatísticas financeiras
          </p>
        </div>
      )}
    </div>
  );
}
