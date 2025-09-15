"use client";

import { Shield, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AccessDeniedMessageProps {
  module: string;
  action?: "view" | "edit" | "delete";
}

export default function AccessDeniedMessage({
  module,
  action = "view",
}: AccessDeniedMessageProps) {
  const { user } = useAuth();

  const getModuleName = (module: string): string => {
    const moduleNames: Record<string, string> = {
      "pessoa-fisica": "Pessoas Físicas",
      "pessoa-juridica": "Pessoas Jurídicas",
      consultores: "Consultores",
      parceiros: "Parceiros",
      clientes: "Clientes",
      contratos: "Contratos",
      usuarios: "Usuários",
      boletos: "Boletos",
      "dashboard-financeiro": "Dashboard Financeiro",
    };
    return moduleNames[module] || module;
  };

  const getActionName = (action: string): string => {
    const actionNames: Record<string, string> = {
      view: "visualizar",
      edit: "editar",
      delete: "excluir",
    };
    return actionNames[action] || action;
  };

  const getGroupLimitations = (grupo: string): string[] => {
    const limitations: Record<string, string[]> = {
      Faturamento: [
        "Não pode editar usuários",
        "Pode visualizar todos os dados",
        "Pode editar a maioria dos módulos",
      ],
      "Cobrança/Financeiro": [
        "Acesso apenas para visualização",
        "Não pode editar nenhum dado",
        "Pode ver todos os módulos permitidos",
      ],
      "Gestor de Filial": [
        "Acesso limitado à sua filial",
        "Pode editar dados da sua filial",
        "Não pode ver consultores de outras filiais",
      ],
      "Administrativo de Filial": [
        "Acesso apenas para visualização",
        "Limitado à sua filial",
        "Não pode editar dados",
        "Não pode ver consultores ou parceiros",
      ],
      Consultores: [
        "Pode ver apenas clientes relacionados",
        "Não pode ver outros consultores",
        "Não pode ver parceiros",
        "Pode editar apenas dados que cadastrou",
      ],
    };
    return limitations[grupo] || [];
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center bg-white rounded-3xl shadow-xl p-8 max-w-md border border-red-100">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold text-neutral-800 mb-3">
          Acesso Negado
        </h2>

        <p className="text-neutral-600 mb-6">
          Você não tem permissão para <strong>{getActionName(action)}</strong> o
          módulo <strong>{getModuleName(module)}</strong>.
        </p>

        {user && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mr-2" />
              <span className="text-sm font-medium text-amber-800">
                Limitações do seu grupo: {user.grupoAcesso}
              </span>
            </div>
            <ul className="text-xs text-amber-700 text-left space-y-1">
              {getGroupLimitations(user.grupoAcesso).map(
                (limitation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1 h-1 bg-amber-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {limitation}
                  </li>
                )
              )}
            </ul>
          </div>
        )}

        <p className="text-sm text-neutral-500 mb-4">
          Entre em contato com o administrador do sistema se precisar de acesso
          adicional.
        </p>

        <button
          onClick={() => window.history.back()}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
