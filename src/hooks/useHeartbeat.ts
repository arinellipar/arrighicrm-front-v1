import { useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// Hook para manter a sessão ativa via heartbeat
export function useHeartbeat() {
  const { user } = useAuth();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Função para enviar heartbeat
  const sendHeartbeat = useCallback(async () => {
    if (!user?.id) return;

    try {
      await apiClient.post(`/Auth/heartbeat/${user.id}`, {});
      console.log("🔄 Heartbeat enviado com sucesso");
    } catch (error) {
      console.error("❌ Erro ao enviar heartbeat:", error);
    }
  }, [user?.id]);

  // Função para registrar atividade do usuário
  const registerActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Inicializar heartbeat automático
  useEffect(() => {
    if (!user?.id) return;

    // Enviar heartbeat inicial
    sendHeartbeat();

    // Configurar heartbeat a cada 5 minutos
    heartbeatIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;

      // Só enviar heartbeat se houve atividade nos últimos 10 minutos
      if (timeSinceLastActivity < 10 * 60 * 1000) {
        sendHeartbeat();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [user?.id, sendHeartbeat]);

  // Detectar atividade do usuário (mouse, teclado, scroll, etc.)
  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      registerActivity();
    };

    // Adicionar listeners para todos os eventos de atividade
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      // Remover listeners
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [registerActivity]);

  // Enviar heartbeat quando a página ficar visível novamente
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        registerActivity();
        sendHeartbeat();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sendHeartbeat, registerActivity, user?.id]);

  return {
    sendHeartbeat,
    registerActivity,
  };
}
