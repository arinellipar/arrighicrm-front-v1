import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";

/**
 * Hook para rastrear e atualizar a página atual do usuário na sessão ativa
 * Atualiza automaticamente quando o usuário navega entre páginas
 */
export function useSessaoTracker() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const lastPathname = useRef<string | null>(null);
  const updateTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Só rastrear se estiver autenticado e tiver usuário
    if (!isAuthenticated || !user?.id) {
      return;
    }

    // Ignorar se for a mesma página
    if (lastPathname.current === pathname) {
      return;
    }

    // Limpar timeout anterior se existir
    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
    }

    // Atualizar após um pequeno delay para evitar múltiplas requisições
    updateTimeout.current = setTimeout(async () => {
      try {
        // Formatar o pathname para exibição amigável
        const paginaAtual = formatPathname(pathname);

        console.log(`📍 useSessaoTracker: Atualizando página atual para "${paginaAtual}" (${pathname})`);

        await apiClient.put(`/SessaoAtiva/atualizar/${user.id}`, {
          paginaAtual: paginaAtual,
        });

        console.log(`✅ useSessaoTracker: Página atual atualizada com sucesso`);
        lastPathname.current = pathname;
      } catch (error) {
        console.error("❌ useSessaoTracker: Erro ao atualizar página atual da sessão:", error);
        // Não bloquear a navegação em caso de erro
      }
    }, 300); // Delay reduzido para 300ms para atualização mais rápida

    return () => {
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
      }
    };
  }, [pathname, isAuthenticated, user?.id]);

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
      }
    };
  }, []);
}

/**
 * Formata o pathname para exibição amigável
 */
function formatPathname(pathname: string): string {
  // Remover barras iniciais e finais
  const cleanPath = pathname.replace(/^\/|\/$/g, "");

  // Mapear rotas conhecidas para nomes amigáveis
  const routeMap: Record<string, string> = {
    "": "Dashboard",
    dashboard: "Dashboard",
    contratos: "Contratos",
    clientes: "Clientes",
    usuarios: "Usuários",
    consultores: "Consultores",
    parceiros: "Parceiros",
    boletos: "Boletos",
    "cadastros/pessoa-fisica": "Cadastro - Pessoa Física",
    "cadastros/pessoa-juridica": "Cadastro - Pessoa Jurídica",
    cadastro: "Cadastro",
    "dashboard/financeiro": "Dashboard - Financeiro",
    "dashboard/financeiro/mapas-faturamento": "Mapas de Faturamento",
    login: "Login",
  };

  // Verificar se há mapeamento direto
  if (routeMap[cleanPath]) {
    return routeMap[cleanPath];
  }

  // Se não houver mapeamento, capitalizar e formatar
  return cleanPath
    .split("/")
    .map((part) => {
      // Capitalizar primeira letra
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" - ");
}

