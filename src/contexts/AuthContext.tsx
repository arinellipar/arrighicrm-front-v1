// src/contexts/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import { UsuarioPermissoes } from "@/types/permissions";
import { permissionService } from "@/services/permission.service";
import { userService } from "@/services/user.service";
import { useAuthCheck } from "@/hooks/useAuthCheck";

interface User {
  id: number;
  login: string;
  email: string;
  grupoAcesso: string;
  tipoPessoa: string;
  nome: string;
  ativo: boolean;
  ultimoAcesso?: string;
}

interface AuthContextType {
  user: User | null;
  permissoes: UsuarioPermissoes | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissoesLoading: boolean;
  login: (loginData: {
    login: string;
    senha: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => void;
  refreshPermissions: () => Promise<void>;
  hasPermission: (modulo: string, acao: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissoes, setPermissoes] = useState<UsuarioPermissoes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissoesLoading, setPermissoesLoading] = useState(false);
  const router = useRouter();
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const heartbeatFailureCount = useRef<number>(0);
  const MAX_HEARTBEAT_FAILURES = 3;

  const isAuthenticated = !!user;

  // Função para iniciar heartbeat com proteção contra falhas contínuas
  const startHeartbeat = (userId: number) => {
    // Limpar intervalo anterior se existir
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
    }

    // Reset do contador de falhas
    heartbeatFailureCount.current = 0;

    // Função para obter página atual
    const getCurrentPage = () => {
      if (typeof window !== "undefined") {
        const pathname = window.location.pathname;
        const cleanPath = pathname.replace(/^\/|\/$/g, "");
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
          login: "Login",
        };
        return routeMap[cleanPath] || cleanPath.split("/").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" - ");
      }
      return "";
    };

    // Enviar heartbeat a cada 5 minutos
    heartbeatInterval.current = setInterval(async () => {
      try {
        const paginaAtual = getCurrentPage();
        await apiClient.put(`/SessaoAtiva/atualizar/${userId}`, {
          paginaAtual: paginaAtual,
        });
        heartbeatFailureCount.current = 0; // Reset em caso de sucesso
      } catch (error) {
        heartbeatFailureCount.current++;
        console.error(
          `Erro ao atualizar sessão (${heartbeatFailureCount.current}/${MAX_HEARTBEAT_FAILURES}):`,
          error
        );

        // Se atingir o máximo de falhas, parar heartbeat
        if (heartbeatFailureCount.current >= MAX_HEARTBEAT_FAILURES) {
          console.warn("Heartbeat desabilitado após múltiplas falhas");
          stopHeartbeat();
        }
      }
    }, 5 * 60 * 1000); // 5 minutos
  };

  // Função para parar heartbeat
  const stopHeartbeat = () => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
  };

  // Verificar autenticação ao carregar
  useEffect(() => {
    checkAuth();
  }, []);

  // Carregar permissões quando o usuário estiver autenticado
  // Otimizado: usa apenas id ao invés do objeto user completo
  useEffect(() => {
    if (isAuthenticated && user && !permissoes) {
      loadPermissions();
    } else if (!isAuthenticated) {
      setPermissoes(null);
      permissionService.invalidateCache();
    }
  }, [isAuthenticated, user?.id]);

  // Limpar heartbeat ao desmontar componente
  useEffect(() => {
    return () => {
      stopHeartbeat();
    };
  }, []);

  const checkAuth = () => {
    try {
      const storedUser = localStorage.getItem("user");
      const isAuth = localStorage.getItem("isAuthenticated");

      if (storedUser && isAuth === "true") {
        const userData = JSON.parse(storedUser);

        // Verificar se os dados do usuário estão consistentes
        if (!userData.usuarioId || !userData.grupoAcesso) {
          console.warn(
            "Dados do usuário inconsistentes no localStorage, fazendo logout"
          );
          logout();
          return;
        }

        setUser(userData);
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      setPermissoesLoading(true);
      const userPermissions = await permissionService.getUserPermissions();
      setPermissoes(userPermissions);
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
      // Em caso de erro, definir permissões vazias para evitar quebrar a aplicação
      setPermissoes({
        usuarioId: 0,
        nome: "Erro ao carregar",
        login: "error",
        grupo: "Usuario",
        filial: undefined,
        semPermissao: true,
        mensagem: "Erro ao carregar permissões",
        permissoes: [],
      });
    } finally {
      setPermissoesLoading(false);
    }
  };

  const refreshPermissions = async () => {
    permissionService.invalidateCache();

    // Atualizar dados do usuário usando o novo serviço
    try {
      const updatedUserData = await userService.getCurrentUserData();
      if (updatedUserData) {
        setUser(updatedUserData as any);
        localStorage.setItem("user", JSON.stringify(updatedUserData));
        console.log("✅ Dados do usuário atualizados:", updatedUserData);
      }
    } catch (error) {
      console.warn("Erro ao atualizar dados do usuário:", error);
    }

    await loadPermissions();
  };

  const hasPermission = (modulo: string, acao: string): boolean => {
    if (!permissoes || permissoes.semPermissao) {
      return false;
    }

    const permissaoCompleta = `${modulo}_${acao}`;
    return permissoes.permissoes.includes(permissaoCompleta);
  };

  const login = async (loginData: {
    login: string;
    senha: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.post("/Auth/login", loginData);

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (
        response.data &&
        typeof response.data === "object" &&
        "usuarioId" in response.data
      ) {
        const userData = response.data as any;
        const token = userData.token;

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("isAuthenticated", "true");

        // Salvar token se fornecido pelo backend
        if (token) {
          localStorage.setItem("token", token);
        }

        // Registrar sessão ativa
        try {
          // Obter página atual (geralmente Dashboard após login)
          const getInitialPage = () => {
            if (typeof window !== "undefined") {
              const pathname = window.location.pathname;
              const cleanPath = pathname.replace(/^\/|\/$/g, "");
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
                login: "Login",
              };
              return routeMap[cleanPath] || cleanPath.split("/").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" - ");
            }
            return "Dashboard";
          };

          await apiClient.post("/SessaoAtiva/registrar", {
            usuarioId: userData.usuarioId,
            nomeUsuario: userData.nome,
            email: userData.email,
            perfil: userData.grupoAcesso,
            tokenSessao: token || "",
          });

          // Atualizar página atual imediatamente após registro
          setTimeout(async () => {
            try {
              const paginaAtual = getInitialPage();
              await apiClient.put(`/SessaoAtiva/atualizar/${userData.usuarioId}`, {
                paginaAtual: paginaAtual,
              });
            } catch (error) {
              console.error("Erro ao atualizar página inicial:", error);
            }
          }, 500);
        } catch (error) {
          console.error("Erro ao registrar sessão:", error);
        }

        // Iniciar heartbeat para manter sessão ativa
        startHeartbeat(userData.usuarioId);

        // Invalidar cache de permissões antes de carregar
        permissionService.invalidateCache();

        // Carregar permissões após login
        await loadPermissions();

        return { success: true };
      }

      return { success: false, error: "Resposta inválida do servidor" };
    } catch (error) {
      return { success: false, error: "Erro de conexão com o servidor" };
    }
  };

  const logout = async () => {
    // Remover sessão ativa do servidor
    if (user?.id) {
      try {
        await apiClient.delete(`/SessaoAtiva/remover/${user.id}`);
      } catch (error) {
        console.error("Erro ao remover sessão:", error);
      }
    }

    // Parar heartbeat
    stopHeartbeat();

    setUser(null);
    setPermissoes(null);
    permissionService.invalidateCache();
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissoes,
        isAuthenticated,
        isLoading,
        permissoesLoading,
        login,
        logout,
        checkAuth,
        refreshPermissions,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
