"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Building2,
  UserCheck,
  TrendingUp,
  Calendar,
  Bell,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Menu,
  X,
  Home,
  BarChart3,
  Settings,
  LogOut,
  Moon,
  Sun,
  Activity,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Clock,
  Target,
  Award,
  Zap,
  Globe,
  Sparkles,
  ChevronRight,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  ChartBar,
  PieChart,
  LineChart,
  Layers,
  Shield,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";

// Componente de Card Moderno com Glassmorphism
const GlassCard = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20, rotateX: -10 }}
    animate={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{
      duration: 0.6,
      delay,
      type: "spring",
      stiffness: 100,
    }}
    whileHover={{
      y: -5,
      scale: 1.02,
      transition: { duration: 0.2 },
    }}
    className={`
      relative backdrop-blur-xl bg-white/10 dark:bg-gray-900/20
      border border-white/20 dark:border-gray-700/30
      rounded-3xl p-6 shadow-2xl
      before:absolute before:inset-0 before:rounded-3xl
      before:bg-gradient-to-br before:from-white/10 before:to-transparent
      before:pointer-events-none
      hover:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)]
      dark:hover:shadow-[0_20px_70px_-15px_rgba(255,255,255,0.1)]
      ${className}
    `}
    style={{
      transformStyle: "preserve-3d",
      transform: "perspective(1000px)",
    }}
  >
    {children}
  </motion.div>
);

// Componente de Estatística Animada
const AnimatedStat = ({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="tabular-nums">
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
};

// Componente de Gráfico Circular Animado
const CircularProgress = ({
  percentage,
  color,
  size = 120,
}: {
  percentage: number;
  color: string;
  size?: number;
}) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {percentage}%
        </span>
      </div>
    </div>
  );
};

// Componente de Notificação
const NotificationBadge = ({ count }: { count: number }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 500 }}
    className="absolute -top-2 -right-2 min-w-[24px] h-6 px-1.5
               bg-gradient-to-r from-red-500 to-pink-500
               rounded-full flex items-center justify-center
               text-white text-xs font-bold
               shadow-lg shadow-red-500/50"
  >
    {count > 99 ? "99+" : count}
  </motion.div>
);

// Componente Principal do Dashboard
export default function ModernDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [refreshing, setRefreshing] = useState(false);

  // Dados mockados
  const stats = {
    totalUsers: 2847,
    newUsers: 182,
    revenue: 48650,
    revenueGrowth: 12.5,
    activeSessions: 1259,
    conversionRate: 3.48,
    totalOrders: 524,
    orderGrowth: 8.3,
  };

  const chartData = [
    { day: "Seg", value: 42 },
    { day: "Ter", value: 65 },
    { day: "Qua", value: 58 },
    { day: "Qui", value: 72 },
    { day: "Sex", value: 89 },
    { day: "Sáb", value: 95 },
    { day: "Dom", value: 78 },
  ];

  const activities = [
    {
      id: 1,
      user: "João Silva",
      action: "Cadastrou nova empresa",
      time: "2 min atrás",
      type: "success",
    },
    {
      id: 2,
      user: "Maria Santos",
      action: "Atualizou perfil",
      time: "15 min atrás",
      type: "info",
    },
    {
      id: 3,
      user: "Pedro Costa",
      action: "Enviou documento",
      time: "1 hora atrás",
      type: "warning",
    },
    {
      id: 4,
      user: "Ana Lima",
      action: "Completou cadastro",
      time: "2 horas atrás",
      type: "success",
    },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div
        className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50
                      dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500"
      >
        {/* Background Decorativo Animado */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-600
                       rounded-full blur-3xl opacity-20"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400 to-orange-600
                       rounded-full blur-3xl opacity-20"
          />
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-72 z-40"
            >
              <GlassCard className="h-full rounded-none rounded-r-3xl">
                <div className="flex items-center justify-between mb-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-3"
                  >
                    <div
                      className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600
                                    rounded-2xl flex items-center justify-center shadow-lg"
                    >
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h1
                        className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600
                                     bg-clip-text text-transparent"
                      >
                        CRM 2025
                      </h1>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Premium Dashboard
                      </p>
                    </div>
                  </motion.div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Menu Items */}
                <nav className="space-y-2">
                  {[
                    { icon: Home, label: "Dashboard", active: true },
                    { icon: Users, label: "Clientes", badge: 12 },
                    { icon: Building2, label: "Empresas" },
                    { icon: BarChart3, label: "Analytics" },
                    { icon: Settings, label: "Configurações" },
                  ].map((item, index) => (
                    <motion.button
                      key={item.label}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl
                                  transition-all duration-300 group
                                  ${
                                    item.active
                                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30"
                                      : "hover:bg-white/10"
                                  }`}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon
                          className={`w-5 h-5 ${
                            item.active
                              ? "text-blue-500"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            item.active
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                      {item.badge && (
                        <span
                          className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500
                                         text-white text-xs rounded-full font-bold"
                        >
                          {item.badge}
                        </span>
                      )}
                      {!item.badge && (
                        <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </motion.button>
                  ))}
                </nav>

                {/* User Profile */}
                <div className="absolute bottom-6 left-6 right-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-3 p-3 bg-white/10 rounded-2xl"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Admin User
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        admin@crm2025.com
                      </p>
                    </div>
                    <LogOut className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div
          className={`transition-all duration-300 ${
            sidebarOpen ? "lg:ml-72" : ""
          }`}
        >
          {/* Top Bar */}
          <GlassCard className="mx-6 mt-6 rounded-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </button>

                <div
                  className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white/20
                                dark:bg-gray-800/20 rounded-2xl backdrop-blur-sm"
                >
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-gray-700
                               dark:text-gray-300 placeholder-gray-400 w-64"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRefresh}
                  className="p-3 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <RefreshCw
                    className={`w-5 h-5 text-gray-700 dark:text-gray-300
                                        ${refreshing ? "animate-spin" : ""}`}
                  />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative p-3 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <NotificationBadge count={3} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-3 hover:bg-white/10 rounded-xl transition-colors"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-700" />
                  )}
                </motion.button>
              </div>
            </div>
          </GlassCard>

          {/* Header com Título */}
          <div className="px-6 mt-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                <span
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600
                                 bg-clip-text text-transparent animate-gradient"
                >
                  Bem-vindo de volta! 👋
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Aqui está o que está acontecendo com seu negócio hoje
              </p>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: "Total de Usuários",
                value: stats.totalUsers,
                change: stats.newUsers,
                changeType: "positive",
                icon: Users,
                color: "from-blue-500 to-cyan-500",
                bgColor: "from-blue-500/20 to-cyan-500/20",
              },
              {
                title: "Receita",
                value: stats.revenue,
                change: `${stats.revenueGrowth}%`,
                changeType: "positive",
                icon: DollarSign,
                color: "from-green-500 to-emerald-500",
                bgColor: "from-green-500/20 to-emerald-500/20",
                prefix: "R$ ",
              },
              {
                title: "Sessões Ativas",
                value: stats.activeSessions,
                change: "Em tempo real",
                changeType: "neutral",
                icon: Activity,
                color: "from-purple-500 to-pink-500",
                bgColor: "from-purple-500/20 to-pink-500/20",
              },
              {
                title: "Taxa de Conversão",
                value: stats.conversionRate,
                change: "+0.5%",
                changeType: "positive",
                icon: Target,
                color: "from-orange-500 to-red-500",
                bgColor: "from-orange-500/20 to-red-500/20",
                suffix: "%",
              },
            ].map((stat, index) => (
              <GlassCard key={stat.title} delay={index * 0.1}>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-2xl bg-gradient-to-r ${stat.bgColor}`}
                  >
                    <stat.icon
                      className={`w-6 h-6 text-transparent bg-gradient-to-r ${stat.color} bg-clip-text`}
                      style={{
                        stroke: `url(#gradient-${index})`,
                        fill: "none",
                      }}
                    />
                    <svg width="0" height="0">
                      <defs>
                        <linearGradient id={`gradient-${index}`}>
                          <stop
                            stopColor={
                              stat.color.includes("blue")
                                ? "#3B82F6"
                                : stat.color.includes("green")
                                ? "#10B981"
                                : stat.color.includes("purple")
                                ? "#8B5CF6"
                                : "#F97316"
                            }
                          />
                          <stop
                            offset="100%"
                            stopColor={
                              stat.color.includes("cyan")
                                ? "#06B6D4"
                                : stat.color.includes("emerald")
                                ? "#10B981"
                                : stat.color.includes("pink")
                                ? "#EC4899"
                                : "#EF4444"
                            }
                          />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold
                                ${
                                  stat.changeType === "positive"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : stat.changeType === "negative"
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                }`}
                  >
                    {stat.changeType === "positive" && (
                      <ArrowUpRight className="w-3 h-3" />
                    )}
                    {stat.changeType === "negative" && (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    <span>{stat.change}</span>
                  </motion.div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  <AnimatedStat
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.suffix === "%" ? 2 : 0}
                  />
                </p>
              </GlassCard>
            ))}
          </div>

          {/* Charts Section */}
          <div className="px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Chart */}
            <div className="lg:col-span-2">
              <GlassCard delay={0.4}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      Visão Geral de Vendas
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Últimos 7 dias
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {["dia", "semana", "mês"].map((period) => (
                      <motion.button
                        key={period}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedPeriod(period)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                                    ${
                                      selectedPeriod === period
                                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                                        : "bg-white/20 text-gray-600 dark:text-gray-400 hover:bg-white/30"
                                    }`}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Animated Bar Chart */}
                <div className="flex items-end justify-between h-64 px-2">
                  {chartData.map((item, index) => (
                    <motion.div
                      key={item.day}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: `${item.value}%`, opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scaleY: 1.05 }}
                      className="relative flex-1 mx-1 bg-gradient-to-t from-blue-500 to-purple-500
                                 rounded-t-2xl cursor-pointer group"
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute -top-8 left-1/2 transform -translate-x-1/2
                                   bg-gray-900 text-white text-xs px-2 py-1 rounded-lg"
                      >
                        {item.value}%
                      </motion.div>
                      <span
                        className="absolute -bottom-6 left-0 right-0 text-center text-xs
                                       text-gray-500 dark:text-gray-400"
                      >
                        {item.day}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Progress Cards */}
            <div className="space-y-6">
              <GlassCard delay={0.5}>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Metas do Mês
                </h3>
                <div className="flex items-center justify-center mb-4">
                  <CircularProgress percentage={68} color="#3B82F6" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Vendas
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      R$ 32.5k / 50k
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Novos Clientes
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      142 / 200
                    </span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard delay={0.6}>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Performance
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      label: "Produtividade",
                      value: 87,
                      color: "from-green-400 to-green-600",
                    },
                    {
                      label: "Qualidade",
                      value: 92,
                      color: "from-blue-400 to-blue-600",
                    },
                    {
                      label: "Satisfação",
                      value: 78,
                      color: "from-purple-400 to-purple-600",
                    },
                  ].map((metric, index) => (
                    <div key={metric.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {metric.label}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {metric.value}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value}%` }}
                          transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                          className={`h-full bg-gradient-to-r ${metric.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Activity Feed & Quick Actions */}
          <div className="px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Activity Feed */}
            <div className="lg:col-span-2">
              <GlassCard delay={0.7}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Atividade Recente
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Ver tudo →
                  </motion.button>
                </div>
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-white/20
                                 dark:hover:bg-gray-800/20 transition-all cursor-pointer"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center
                                      ${
                                        activity.type === "success"
                                          ? "bg-green-100 dark:bg-green-900/30"
                                          : activity.type === "warning"
                                          ? "bg-yellow-100 dark:bg-yellow-900/30"
                                          : "bg-blue-100 dark:bg-blue-900/30"
                                      }`}
                      >
                        {activity.type === "success" && (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        )}
                        {activity.type === "warning" && (
                          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        )}
                        {activity.type === "info" && (
                          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          <span className="font-bold">{activity.user}</span>{" "}
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.time}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Quick Actions */}
            <GlassCard delay={0.9}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Ações Rápidas
              </h3>
              <div className="space-y-3">
                {[
                  {
                    icon: Plus,
                    label: "Novo Cliente",
                    color: "from-blue-500 to-cyan-500",
                  },
                  {
                    icon: Upload,
                    label: "Upload Arquivo",
                    color: "from-green-500 to-emerald-500",
                  },
                  {
                    icon: Download,
                    label: "Exportar Relatório",
                    color: "from-purple-500 to-pink-500",
                  },
                  {
                    icon: Shield,
                    label: "Configurar Segurança",
                    color: "from-orange-500 to-red-500",
                  },
                ].map((action, index) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
                    className="w-full flex items-center space-x-3 p-3 rounded-2xl
                               bg-white/10 hover:bg-white/20 dark:bg-gray-800/20
                               dark:hover:bg-gray-800/30 transition-all group"
                  >
                    <div
                      className={`p-2 rounded-xl bg-gradient-to-r ${action.color}
                                     shadow-lg group-hover:shadow-xl transition-shadow`}
                    >
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {action.label}
                    </span>
                    <ChevronRight
                      className="w-4 h-4 text-gray-400 ml-auto
                                           group-hover:translate-x-1 transition-transform"
                    />
                  </motion.button>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
