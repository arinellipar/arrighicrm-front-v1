// src/components/ProtectedRoute.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import AccessDeniedMessage from "./AccessDeniedMessage";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  requiredModule?: string; // Nome do módulo para verificar acesso
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredModule,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { canAccessModule } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">
            Verificando autenticação...
          </h2>
          <p className="text-neutral-600">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, não renderizar nada (redirecionamento já foi feito)
  if (!isAuthenticated) {
    return null;
  }

  // Verificar acesso por módulo
  if (requiredModule && !canAccessModule(requiredModule)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <AccessDeniedMessage module={requiredModule} />
      </div>
    );
  }

  // Verificar nível de acesso por role (mantido para compatibilidade)
  if (
    requiredRole &&
    user?.grupoAcesso !== requiredRole &&
    user?.grupoAcesso !== "Administrador"
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <AccessDeniedMessage module="generic" />
      </div>
    );
  }

  return <>{children}</>;
}
