"use client";

import { motion } from "framer-motion";
import {
  Users,
  Building2,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Calendar,
  DollarSign,
  Activity,
  Target,
  Award,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Componente de Card de Métrica Principal
function MetricCard({
  title,
  value,
  change,
  changeType,
  icon,
  loading,
  subtitle,
  accentColor = "primary",
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ElementType;
  loading?: boolean;
  subtitle?: string;
  accentColor?: "primary" | "gold" | "green" | "red" | "orange";
}) {
  const accentColors = {
    primary: "from-primary-500 to-primary-600",
    gold: "from-gold-500 to-gold-600",
    green: "from-green-500 to-green-600",
    red: "from-red-500 to-red-600",
    orange: "from-orange-500 to-orange-600",
  };

  const changeColors = {
    positive: "text-green-600 bg-green-50",
    negative: "text-red-600 bg-red-50",
    neutral: "text-neutral-600 bg-neutral-50",
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="executive-card p-6 relative overflow-hidden group"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 to-gold-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />

      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "p-3 rounded-xl bg-gradient-to-br shadow-lg",
              accentColors[accentColor]
            )}
          >
            {icon &&
              (() => {
                const Icon = icon;
                return <Icon className="w-6 h-6 text-white" />;
              })()}
          </div>
          <button className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          {loading ? (
            <div className="h-10 w-24 bg-neutral-200 rounded-lg animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-neutral-900">{value}</p>
          )}
          {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
        </div>

        {change && (
          <div className="mt-4 flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold",
                changeColors[changeType || "neutral"]
              )}
            >
              {changeType === "positive" ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : changeType === "negative" ? (
                <ArrowDownRight className="w-3 h-3" />
              ) : null}
              {change}
            </span>
            <span className="text-xs text-neutral-500">vs. mês anterior</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Componente de Gráfico de Performance
function PerformanceChart() {
  const data = [
    { month: "Jan", value: 65 },
    { month: "Fev", value: 72 },
    { month: "Mar", value: 78 },
    { month: "Abr", value: 85 },
    { month: "Mai", value: 92 },
    { month: "Jun", value: 88 },
  ];

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="executive-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">
            Performance Mensal
          </h3>
          <p className="text-sm text-neutral-600">Crescimento de cadastros</p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
          Ver Detalhes
        </button>
      </div>

      <div className="relative h-64">
        <div className="absolute inset-0 flex items-end justify-between gap-4">
          {data.map((item, index) => (
            <motion.div
              key={item.month}
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / maxValue) * 100}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex-1 relative group"
            >
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg hover:from-primary-600 hover:to-primary-500 transition-colors cursor-pointer">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.value}%
                </div>
              </div>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-neutral-600 font-medium">
                {item.month}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Componente de Atividades Recentes
function RecentActivities() {
  const activities = [
    {
      id: 1,
      type: "new_client",
      title: "Nova Pessoa Física",
      description: "João Silva foi adicionado ao sistema",
      time: "há 5 minutos",
      icon: <Users className="w-4 h-4" />,
      color: "bg-blue-500",
    },
    {
      id: 2,
      type: "update",
      title: "Empresa atualizada",
      description: "ABC Corp teve seus dados atualizados",
      time: "há 15 minutos",
      icon: <Building2 className="w-4 h-4" />,
      color: "bg-green-500",
    },
    {
      id: 3,
      type: "new_user",
      title: "Novo usuário criado",
      description: "Maria Santos agora tem acesso ao sistema",
      time: "há 1 hora",
      icon: <UserCheck className="w-4 h-4" />,
      color: "bg-purple-500",
    },
    {
      id: 4,
      type: "report",
      title: "Relatório gerado",
      description: "Relatório mensal de vendas disponível",
      time: "há 2 horas",
      icon: <Activity className="w-4 h-4" />,
      color: "bg-gold-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="executive-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-neutral-900">
          Atividades Recentes
        </h3>
        <Link
          href="#"
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Ver todas
        </Link>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="flex items-start gap-4 p-3 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
          >
            <div
              className={cn(
                "p-2 rounded-lg text-white shadow-md",
                activity.color
              )}
            >
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900">
                {activity.title}
              </p>
              <p className="text-xs text-neutral-600 truncate">
                {activity.description}
              </p>
            </div>
            <span className="text-xs text-neutral-500 whitespace-nowrap">
              {activity.time}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Componente de Quick Actions Premium
function QuickActions() {
  const actions = [
    {
      title: "Nova Pessoa Física",
      description: "Cadastrar pessoa física",
      icon: <Users className="w-6 h-6" />,
      href: "/cadastros/pessoa-fisica",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Nova Empresa",
      description: "Cadastrar pessoa jurídica",
      icon: <Building2 className="w-6 h-6" />,
      href: "/cadastros/pessoa-juridica",
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Novo Usuário",
      description: "Adicionar ao sistema",
      icon: <UserCheck className="w-6 h-6" />,
      href: "/usuarios",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Relatórios",
      description: "Análises e métricas",
      icon: <Activity className="w-6 h-6" />,
      href: "#",
      gradient: "from-gold-500 to-gold-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <motion.div
          key={action.title}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + index * 0.05 }}
        >
          <Link
            href={action.href}
            className="block p-6 bg-white rounded-2xl border border-neutral-200/60 hover:shadow-lg transition-all duration-300 group"
          >
            <div
              className={cn(
                "inline-flex p-3 rounded-xl bg-gradient-to-br text-white shadow-lg group-hover:shadow-xl transition-all",
                action.gradient
              )}
            >
              {action.icon}
            </div>
            <h4 className="mt-4 text-base font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
              {action.title}
            </h4>
            <p className="mt-1 text-sm text-neutral-600">
              {action.description}
            </p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { stats, loading, error, fetchStats, clearError } = useDashboard();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Erro ao carregar dados
          </h2>
          <p className="text-neutral-600 mb-6">{error}</p>
          <button
            onClick={() => {
              clearError();
              fetchStats();
            }}
            className="btn-premium px-6 py-3 text-white rounded-xl"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Dashboard Executivo
          </h1>
          <p className="text-neutral-600 mt-1">
            Bem-vindo de volta! Aqui está o resumo do seu CRM.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-semibold rounded-lg inline-flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Sistema Online
          </span>
          <button className="btn-gold px-6 py-2.5 text-sm font-semibold rounded-xl">
            Gerar Relatório
          </button>
        </div>
      </motion.div>

      {/* Dica de Uso - Instrução de Cliques */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-blue-50 to-primary-50 border border-blue-200/60 rounded-xl p-4 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              💡 Dica de Navegação
            </h3>
            <p className="text-sm text-blue-700">
              <strong>1 clique</strong> para selecionar uma linha na tabela •{" "}
              <strong>2 cliques seguidos</strong> para editar diretamente
            </p>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Pessoas Físicas"
          value={loading ? "..." : stats.totalPessoasFisicas}
          change="+12.5%"
          changeType="positive"
          icon={Users}
          loading={loading}
          subtitle="Pessoas físicas ativas"
          accentColor="primary"
        />
        <MetricCard
          title="Empresas Cadastradas"
          value={loading ? "..." : stats.totalPessoasJuridicas}
          change="+8.3%"
          changeType="positive"
          icon={Building2}
          loading={loading}
          subtitle="Pessoas jurídicas ativas"
          accentColor="green"
        />
        <MetricCard
          title="Usuários do Sistema"
          value={loading ? "..." : stats.totalUsuarios}
          change="+4.2%"
          changeType="positive"
          icon={UserCheck}
          loading={loading}
          subtitle="Usuários com acesso"
          accentColor="gold"
        />
        <MetricCard
          title="Total de Clientes"
          value={
            loading
              ? "..."
              : stats.totalPessoasFisicas + stats.totalPessoasJuridicas
          }
          change="+15.2%"
          changeType="positive"
          icon={Users}
          loading={loading}
          subtitle="Pessoas físicas + jurídicas"
          accentColor="orange"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 mb-4">
          Ações Rápidas
        </h2>
        <QuickActions />
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
        <div className="lg:col-span-1">
          <RecentActivities />
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="executive-card p-6 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 rounded-xl text-white shadow-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">98.5%</p>
              <p className="text-sm text-green-700">Taxa de Disponibilidade</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="executive-card p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-xl text-white shadow-lg">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">142</p>
              <p className="text-sm text-blue-700">Metas Alcançadas</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="executive-card p-6 bg-gradient-to-br from-gold-50 to-gold-100/50 border-gold-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl text-white shadow-lg">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gold-900">Premium</p>
              <p className="text-sm text-gold-700">Plano Enterprise</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
