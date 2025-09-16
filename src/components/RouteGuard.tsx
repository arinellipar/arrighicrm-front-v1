"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigationFilter } from "@/hooks/useNavigationFilter";
import { Shield, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, isLoading, permissoes } = useAuth();
  const { canAccessRoute, isUsuarioGroup } = useNavigationFilter();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Se não está carregando e não está autenticado, redirecionar para login
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // Se está autenticado mas não pode acessar a rota
    if (isAuthenticated && permissoes && !canAccessRoute(pathname)) {
      // Se é grupo Usuario tentando acessar rota protegida, redirecionar para dashboard
      if (isUsuarioGroup) {
        router.push("/dashboard");
        return;
      }

      // Para outros grupos, também redirecionar para dashboard
      router.push("/dashboard");
    }
  }, [
    isAuthenticated,
    isLoading,
    permissoes,
    pathname,
    canAccessRoute,
    isUsuarioGroup,
    router,
  ]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600 font-medium">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, não renderizar nada (será redirecionado)
  if (!isAuthenticated) {
    return null;
  }

  // Se não tem permissões ainda, mostrar loading
  if (!permissoes) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600 font-medium">
            Carregando permissões...
          </p>
        </div>
      </div>
    );
  }

  // Se não pode acessar a rota, mostrar tela de acesso negado temporariamente
  if (!canAccessRoute(pathname)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Acesso Negado
          </h1>

          <p className="text-neutral-600 mb-6">
            {isUsuarioGroup
              ? "Seu grupo de acesso permite apenas o dashboard principal."
              : "Você não tem permissão para acessar esta página."}
          </p>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/dashboard")}
              className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              Ir para Dashboard
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.back()}
              className="w-full px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-medium transition-colors"
            >
              Voltar
            </motion.button>
          </div>

          {isUsuarioGroup && (
            <div className="mt-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <p className="text-xs text-orange-700 font-medium">
                  Grupo: {permissoes.grupo} - Acesso Limitado
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Se chegou até aqui, pode renderizar o conteúdo
  return <>{children}</>;
}
