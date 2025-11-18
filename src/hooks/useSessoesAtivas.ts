import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export interface SessaoAtiva {
  id: number;
  usuarioId: number;
  nomeUsuario: string;
  email: string;
  ultimoAcesso: string | null;
  perfil: string;
  inicioSessao: string | null;
  ultimaAtividade: string;
  tempoOnline: string;
  enderecoIP: string | null;
  paginaAtual?: string | null;
  estaOnline?: boolean;
  sessaoId?: number;
}

export function useSessoesAtivas(incluirInativos: boolean = false) {
  const { permissoes } = useAuth();
  const [sessoes, setSessoes] = useState<SessaoAtiva[]>([]);
  const [count, setCount] = useState(0);
  const [countOnline, setCountOnline] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countError, setCountError] = useState(false);

  // Verificar se o usuário é administrador
  const isAdmin = permissoes?.grupo === "Administrador";

  const fetchSessoes = async () => {
    // Apenas administradores podem buscar sessões
    if (!isAdmin) {
      setSessoes([]);
      setCount(0);
      setCountOnline(0);
      setLoading(false);
      setError("Apenas administradores podem visualizar sessões ativas");
      return;
    }

    try {
      setLoading(true);

      // Se incluirInativos for true, busca o histórico completo
      const endpoint = incluirInativos
        ? "/SessaoAtiva/historico"
        : "/SessaoAtiva";
      const response = await apiClient.get<SessaoAtiva[]>(endpoint);

      if (response.data && Array.isArray(response.data)) {
        setSessoes(response.data);

        if (incluirInativos) {
          // Contar usuários online e total
          const online = response.data.filter((s) => s.estaOnline).length;
          setCountOnline(online);
          setCount(response.data.length);
        } else {
          setCount(response.data.length);
          setCountOnline(response.data.length);
        }
      } else {
        setSessoes([]);
        setCount(0);
        setCountOnline(0);
      }
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar sessões:", err);
      setError("Erro ao carregar sessões");
      setSessoes([]);
      setCount(0);
      setCountOnline(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchCount = async () => {
    // Apenas administradores podem buscar contagem
    if (!isAdmin) {
      return;
    }

    // Se já houve erro de contagem, não tentar novamente
    if (countError) {
      return;
    }

    try {
      const response = await apiClient.get<number>("/SessaoAtiva/count");
      if (typeof response.data === "number") {
        setCount(response.data);
        setCountError(false);
      }
    } catch (err) {
      console.warn("Erro ao buscar contagem de sessões (não crítico):", err);
      setCountError(true);
      // Usar contagem baseada no array de sessões
      setCount(sessoes.length);
    }
  };

  useEffect(() => {
    // Apenas buscar se for administrador
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    fetchSessoes();

    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      fetchSessoes();
      if (!countError && !incluirInativos) {
        fetchCount();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [countError, incluirInativos, isAdmin]);

  return {
    sessoes,
    count,
    countOnline,
    loading,
    error,
    countError,
    refetch: fetchSessoes,
  };
}
