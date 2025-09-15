import { useState, useEffect, useCallback, useMemo } from "react";
import { apiClient } from "@/lib/api";

// Interfaces para o novo endpoint
interface SessaoAtiva {
  usuarioId: number;
  login: string;
  nome: string;
  email: string;
  grupoAcesso: string;
  filialNome?: string;
  ultimoAcesso: string;
  tipoPessoa: string;
  minutosOnline: number;
}

interface SessoesAtivasResponse {
  totalSessoes: number;
  dataConsulta: string;
  sessoes: SessaoAtiva[];
}

export function useActiveUsers() {
  const [sessions, setSessions] = useState<SessoesAtivasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar sessões ativas do endpoint dedicado
  const fetchActiveSessions = useCallback(async () => {
    try {
      setError(null);
      const response = await apiClient.get<SessoesAtivasResponse>(
        "/Auth/sessoes-ativas"
      );
      if (response.data) {
        setSessions(response.data);
      }
      setLoading(false);
    } catch (error: any) {
      console.error("Erro ao buscar sessões ativas:", error);
      setError(error.message || "Erro ao carregar sessões ativas");
      setLoading(false);
    }
  }, []);

  // Contagem de sessões ativas
  const activeSessions = useMemo(() => {
    return sessions?.totalSessoes || 0;
  }, [sessions]);

  // Lista de usuários ativos com detalhes
  const activeUsers = useMemo(() => {
    return sessions?.sessoes || [];
  }, [sessions]);

  // Informações detalhadas dos usuários online (compatibilidade)
  const onlineUserDetails = useMemo(() => {
    return activeUsers.map((sessao) => ({
      id: sessao.usuarioId,
      name: sessao.nome,
      login: sessao.login,
      email: sessao.email,
      lastAccess: sessao.ultimoAcesso,
      userType: sessao.tipoPessoa,
      grupo: sessao.grupoAcesso,
      filial: sessao.filialNome,
      minutosOnline: sessao.minutosOnline,
    }));
  }, [activeUsers]);

  // Função de refresh manual
  const refreshData = useCallback(async () => {
    setLoading(true);
    await fetchActiveSessions();
  }, [fetchActiveSessions]);

  // Inicializar e configurar refresh automático
  useEffect(() => {
    // Buscar dados iniciais
    fetchActiveSessions();

    // Configurar refresh a cada 1 minuto para dados em tempo real
    const interval = setInterval(() => {
      fetchActiveSessions();
    }, 60 * 1000); // 1 minuto

    return () => {
      clearInterval(interval);
    };
  }, [fetchActiveSessions]);

  return {
    activeSessions,
    activeUsers,
    onlineUserDetails,
    loading,
    error,
    refreshData,
    lastUpdated: sessions?.dataConsulta
      ? new Date(sessions.dataConsulta)
      : new Date(),
  };
}
