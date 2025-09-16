"use client";

import React from "react";
import { useSessoesAtivas } from "@/hooks/useSessoesAtivas";
import { Users, AlertTriangle, Loader2 } from "lucide-react";

/**
 * Componente para mostrar o status das sessões ativas
 */
export const SessoesAtivasStatus: React.FC = () => {
  const { sessoes, count, loading, error, countError } = useSessoesAtivas();

  if (loading) {
    return (
      <div className="flex items-center text-gray-500">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        <span className="text-sm">Carregando sessões...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center text-red-600">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <span className="text-sm">Erro ao carregar sessões</span>
      </div>
    );
  }

  return (
    <div className="flex items-center text-gray-600">
      <Users className="h-4 w-4 mr-2" />
      <span className="text-sm">
        {count} sessão{count !== 1 ? "ões" : ""} ativa{count !== 1 ? "s" : ""}
        {countError && (
          <span className="text-yellow-600 ml-1" title="Contagem aproximada">
            *
          </span>
        )}
      </span>
    </div>
  );
};

/**
 * Componente para mostrar lista de sessões ativas
 */
export const SessoesAtivasList: React.FC = () => {
  const { sessoes, loading, error, countError } = useSessoesAtivas();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-red-800 font-medium">Erro ao carregar sessões</h3>
        </div>
        <p className="text-red-600 text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Sessões Ativas</h3>
        {countError && (
          <span className="text-yellow-600 text-sm" title="Contagem aproximada">
            Contagem aproximada
          </span>
        )}
      </div>

      {sessoes.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhuma sessão ativa</p>
      ) : (
        <div className="space-y-3">
          {sessoes.map((sessao) => (
            <div
              key={sessao.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {sessao.nomeUsuario}
                </p>
                <p className="text-sm text-gray-600">{sessao.email}</p>
                <p className="text-xs text-gray-500">
                  {sessao.perfil} • {sessao.tempoOnline}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  {new Date(sessao.ultimaAtividade).toLocaleTimeString()}
                </p>
                <p className="text-xs text-gray-400">{sessao.enderecoIP}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
