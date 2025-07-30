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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

function StatsCard({ title, value, change, changeType, icon }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-secondary-200/50 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl text-white">
          {icon}
        </div>
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
      </div>
      <div>
        <h3 className="text-2xl font-bold text-secondary-900 mb-1">{value}</h3>
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
    <motion.a
      href={href}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
    </motion.a>
  );
}

export default function Dashboard() {
  const stats = [
    {
      title: "Total de Clientes",
      value: "2,847",
      change: "+12%",
      changeType: "positive" as const,
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "Empresas Cadastradas",
      value: "1,429",
      change: "+8%",
      changeType: "positive" as const,
      icon: <Building2 className="w-6 h-6" />,
    },
    {
      title: "Processos Ativos",
      value: "847",
      change: "+5%",
      changeType: "positive" as const,
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "Taxa de Conversão",
      value: "68%",
      change: "+3%",
      changeType: "positive" as const,
      icon: <TrendingUp className="w-6 h-6" />,
    },
  ];

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
      description: "Adicionar usuário ao sistema",
      icon: <Plus className="w-8 h-8" />,
      href: "/cadastros/usuarios",
      color: "purple" as const,
    },
    {
      title: "Agenda",
      description: "Visualizar compromissos",
      icon: <Calendar className="w-8 h-8" />,
      href: "/agenda",
      color: "orange" as const,
    },
  ];

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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-secondary-200/50 hover:shadow-lg transition-all duration-300"
        >
          <Bell className="w-6 h-6 text-secondary-600" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatsCard {...stat} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          Atividades Recentes
        </h2>
        <div className="space-y-4">
          {[
            {
              user: "Maria Silva",
              action: "cadastrou novo cliente",
              time: "2 horas atrás",
            },
            {
              user: "João Santos",
              action: "atualizou processo #1234",
              time: "4 horas atrás",
            },
            {
              user: "Ana Costa",
              action: "agendou reunião",
              time: "1 dia atrás",
            },
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="flex items-center space-x-4 p-4 bg-secondary-50/50 rounded-xl"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {activity.user.charAt(0)}
                </span>
              </div>
              <div className="flex-grow">
                <p className="text-secondary-900 font-medium">
                  <span className="font-semibold">{activity.user}</span>{" "}
                  {activity.action}
                </p>
                <p className="text-secondary-500 text-sm">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
