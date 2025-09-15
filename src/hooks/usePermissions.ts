// src/hooks/usePermissions.ts
"use client";

import { useAuth } from "@/contexts/AuthContext";

export function usePermissions() {
  const { user } = useAuth();

  const hasAccess = (allowedGroups: string[]): boolean => {
    if (!user) return false;
    return allowedGroups.includes(user.grupoAcesso);
  };

  const canAccessModule = (module: string): boolean => {
    if (!user) return false;

    const permissions: Record<string, string[]> = {
      "pessoa-fisica": [
        "Administrador",
        "Faturamento",
        "Cobrança/Financeiro",
        "Gestor de Filial",
        "Administrativo de Filial",
        "Consultores",
      ],
      "pessoa-juridica": [
        "Administrador",
        "Faturamento",
        "Cobrança/Financeiro",
        "Gestor de Filial",
        "Administrativo de Filial",
        "Consultores",
      ],
      consultores: [
        "Administrador",
        "Faturamento",
        "Cobrança/Financeiro",
        "Gestor de Filial",
        // Consultores NÃO podem ver outros consultores
      ],
      parceiros: [
        "Administrador",
        "Faturamento",
        "Cobrança/Financeiro",
        "Gestor de Filial",
        // Consultores e Administrativo de Filial NÃO podem ver parceiros
      ],
      clientes: [
        "Administrador",
        "Faturamento",
        "Cobrança/Financeiro",
        "Gestor de Filial",
        "Administrativo de Filial",
        "Consultores",
      ],
      contratos: [
        "Administrador",
        "Faturamento",
        "Cobrança/Financeiro",
        "Gestor de Filial",
        "Administrativo de Filial",
        "Consultores",
      ],
      usuarios: ["Administrador", "Faturamento", "Cobrança/Financeiro"],
      boletos: [
        "Administrador",
        "Faturamento",
        "Cobrança/Financeiro",
        "Gestor de Filial",
      ],
      "dashboard-financeiro": [
        "Administrador",
        "Faturamento",
        "Cobrança/Financeiro",
      ],
    };

    const allowedGroups = permissions[module];
    return allowedGroups ? hasAccess(allowedGroups) : false;
  };

  const canEdit = (module: string): boolean => {
    if (!user) return false;

    const editPermissions: Record<string, string[]> = {
      "pessoa-fisica": [
        "Administrador",
        "Faturamento",
        "Gestor de Filial",
        "Consultores",
      ],
      "pessoa-juridica": [
        "Administrador",
        "Faturamento",
        "Gestor de Filial",
        "Consultores",
      ],
      consultores: ["Administrador", "Faturamento", "Gestor de Filial"],
      // Administrativo de Filial NÃO pode editar consultores
      parceiros: ["Administrador", "Faturamento", "Gestor de Filial"],
      // Administrativo de Filial e Consultores NÃO podem editar parceiros
      clientes: [
        "Administrador",
        "Faturamento",
        "Gestor de Filial",
        "Consultores",
      ],
      contratos: [
        "Administrador",
        "Faturamento",
        "Gestor de Filial",
        "Consultores",
      ],
      usuarios: ["Administrador"], // Faturamento não pode editar usuários
      boletos: ["Administrador", "Faturamento", "Gestor de Filial"],
    };

    const allowedGroups = editPermissions[module];
    return allowedGroups ? hasAccess(allowedGroups) : false;
  };

  const canDelete = (module: string): boolean => {
    if (!user) return false;

    // Apenas Administrador e Faturamento podem excluir na maioria dos casos
    const deletePermissions: Record<string, string[]> = {
      "pessoa-fisica": ["Administrador", "Faturamento"],
      "pessoa-juridica": ["Administrador", "Faturamento"],
      consultores: ["Administrador", "Faturamento"],
      parceiros: ["Administrador", "Faturamento"],
      clientes: ["Administrador", "Faturamento"],
      contratos: ["Administrador", "Faturamento"],
      usuarios: ["Administrador"], // Apenas Administrador pode excluir usuários
      boletos: ["Administrador", "Faturamento"],
    };

    const allowedGroups = deletePermissions[module];
    return allowedGroups ? hasAccess(allowedGroups) : false;
  };

  const isReadOnly = (): boolean => {
    if (!user) return true;
    return (
      user.grupoAcesso === "Cobrança/Financeiro" ||
      user.grupoAcesso === "Administrativo de Filial"
    );
  };

  return {
    user,
    hasAccess,
    canAccessModule,
    canEdit,
    canDelete,
    isReadOnly,
  };
}
