// src/components/Dashboard.tsx
"use client";

import { motion } from "framer-motion";
import {
  Users,
  Building2,
  FileText,
  TrendingUp,
  Calendar,
  Bell,
  Plus,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  UserCheck,
  Bug,
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { testDashboardApis } from "@/lib/debug-env";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  loading?: boolean;
}

function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  loading = false,
}: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-secondary-200/50 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl text-white">
          {icon}
        </div>
        {change && (
          <div
            className={cn(
              "flex items-center space-x-1 text-sm font-medium",
              changeType === "positive" && "text-green-600",
              changeType === "negative" && "text-red-600",
              changeType === "neutral" && "text-secondary-600"
            )}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{change}</span>
          </div>
        )}
      </div>
      <div>
        {loading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            <div className="h-8 w-16 bg-secondary-200 rounded animate-pulse" />
          </div>
        ) : (
          <h3 className="text-2xl font-bold text-secondary-900 mb-1">
            {value}
          </h3>
        )}
        <p className="text-secondary-600 text-sm font-medium">{title}</p>
      </div>
    </motion.div>
  );
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: "blue" | "green" | "purple" | "orange";
}

function QuickAction({
  title,
  description,
  icon,
  href,
  color,
}: QuickActionProps) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    green:
      "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    purple:
      "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    orange:
      "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Link
        href={href}
        className={cn(
          "block p-6 bg-gradient-to-br text-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300",
          colorClasses[color]
        )}
      >
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">{icon}</div>
          <div>
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <p className="text-white/90 text-sm">{description}</p>
          </div>
        </div>
      </Link>
    </motion.div>
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
        Erro ao carregar estatísticas
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

export default function Dashboard() {
  const { stats, loading, error, fetchStats, clearError } = useDashboard();

  const handleDebugTest = async () => {
    console.log("🔧 Iniciando teste de debug...");
    await testDashboardApis();
  };

  const quickActions = [
    {
      title: "Nova Pessoa Física",
      description: "Cadastrar cliente pessoa física",
      icon: <Users className="w-8 h-8" />,
      href: "/cadastros/pessoa-fisica",
      color: "blue" as const,
    },
    {
      title: "Nova Pessoa Jurídica",
      description: "Cadastrar empresa ou organização",
      icon: <Building2 className="w-8 h-8" />,
      href: "/cadastros/pessoa-juridica",
      color: "green" as const,
    },
    {
      title: "Novo Usuário",
      description: "Cadastrar usuário do sistema",
      icon: <UserCheck className="w-8 h-8" />,
      href: "/usuarios",
      color: "purple" as const,
    },
  ];

  // Calcular porcentagem de crescimento (mockado para demonstração)
  const getChangePercentage = (current: number) => {
    if (current === 0) return "+0%";
    // Simular crescimento baseado no valor atual
    const percentage = Math.floor(Math.random() * 15) + 1;
    return `+${percentage}%`;
  };

  const statsCards = [
    {
      title: "Pessoas Físicas",
      value: loading ? 0 : stats.totalPessoasFisicas,
      change: loading
        ? undefined
        : getChangePercentage(stats.totalPessoasFisicas),
      changeType: "positive" as const,
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "Pessoas Jurídicas",
      value: loading ? 0 : stats.totalPessoasJuridicas,
      change: loading
        ? undefined
        : getChangePercentage(stats.totalPessoasJuridicas),
      changeType: "positive" as const,
      icon: <Building2 className="w-6 h-6" />,
    },
    {
      title: "Usuários do Sistema",
      value: loading ? 0 : stats.totalUsuarios,
      change: loading ? undefined : getChangePercentage(stats.totalUsuarios),
      changeType: "positive" as const,
      icon: <UserCheck className="w-6 h-6" />,
    },
  ];

  if (error) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Dashboard CRM
            </h1>
            <p className="text-secondary-600">
              Bem-vindo ao sistema de gestão Arrighi Advogados
            </p>
          </div>
        </motion.div>

        <ErrorMessage
          message={error}
          onRetry={() => {
            clearError();
            fetchStats();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Dashboard CRM
          </h1>
          <p className="text-secondary-600">
            Bem-vindo ao sistema de gestão Arrighi Advogados
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Debug button - temporary */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDebugTest}
            className="relative p-3 bg-yellow-500/80 backdrop-blur-sm rounded-xl shadow-sm border border-yellow-400/50 hover:shadow-lg transition-all duration-300"
            title="Testar APIs (Debug)"
          >
            <Bug className="w-6 h-6 text-yellow-800" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-secondary-200/50 hover:shadow-lg transition-all duration-300"
          >
            <Bell className="w-6 h-6 text-secondary-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatsCard {...stat} loading={loading} />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-secondary-900 mb-6">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <QuickAction {...action} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-secondary-200/50"
      >
        <h2 className="text-2xl font-bold text-secondary-900 mb-6">
          Sistema Integrado
        </h2>
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="flex items-center space-x-4 p-4 bg-green-50/50 rounded-xl border border-green-200/50"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-grow">
              <p className="text-secondary-900 font-medium">
                <span className="font-semibold">API Backend</span> conectada com
                sucesso
              </p>
              <p className="text-secondary-500 text-sm">
                Sistema .NET Core funcionando
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
            className="flex items-center space-x-4 p-4 bg-blue-50/50 rounded-xl border border-blue-200/50"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-grow">
              <p className="text-secondary-900 font-medium">
                <span className="font-semibold">Frontend Next.js</span>{" "}
                integrado à API
              </p>
              <p className="text-secondary-500 text-sm">
                {loading
                  ? "Carregando dados..."
                  : `${
                      stats.totalPessoasFisicas +
                      stats.totalPessoasJuridicas +
                      stats.totalUsuarios
                    } registros sincronizados`}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1 }}
            className="flex items-center space-x-4 p-4 bg-purple-50/50 rounded-xl border border-purple-200/50"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex-grow">
              <p className="text-secondary-900 font-medium">
                <span className="font-semibold">Gestão de Usuários</span>{" "}
                implementada
              </p>
              <p className="text-secondary-500 text-sm">
                Sistema completo de autenticação e permissões
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            className="flex items-center space-x-4 p-4 bg-orange-50/50 rounded-xl border border-orange-200/50"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="flex-grow">
              <p className="text-secondary-900 font-medium">
                <span className="font-semibold">CRUD Completo</span>{" "}
                implementado
              </p>
              <p className="text-secondary-500 text-sm">
                Criar, ler, atualizar e deletar registros
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
