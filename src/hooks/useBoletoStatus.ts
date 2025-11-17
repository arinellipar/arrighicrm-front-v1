import { useState } from "react";
import {
  consultarStatusBoleto,
  sincronizarBoleto,
  sincronizarTodosBoletos,
  BoletoStatus,
  SincronizacaoResultado,
} from "@/services/boletoService";

export function useBoletoStatus() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<BoletoStatus | null>(null);

  const verificarStatus = async (boletoId: number) => {
    setLoading(true);
    try {
      const statusAtual = await consultarStatusBoleto(boletoId);
      setStatus(statusAtual);

      // Mostrar notificação se foi pago
      if (
        statusAtual.status === "LIQUIDADO" ||
        statusAtual.status === "BAIXADO"
      ) {
        alert(
          `✅ Boleto pago!\n\nValor: R$ ${statusAtual.paidValue?.toFixed(2)}`
        );
      } else {
        alert(`Status: ${statusAtual.statusDescription}`);
      }

      return statusAtual;
    } catch (error: any) {
      console.error("Erro ao verificar status:", error);
      alert(error?.message || "Erro ao verificar status do boleto");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sincronizar = async (boletoId: number) => {
    setLoading(true);
    try {
      const boleto = await sincronizarBoleto(boletoId);

      // Mostrar notificação se foi pago
      if (boleto.status === "LIQUIDADO" || boleto.status === "BAIXADO") {
        alert(`🎉 Boleto #${boletoId} foi pago!`);
      } else {
        alert(`✅ Boleto #${boletoId} sincronizado com sucesso!`);
      }

      return boleto;
    } catch (error: any) {
      console.error("Erro ao sincronizar boleto:", error);
      alert(error?.message || `Erro ao sincronizar boleto #${boletoId}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    status,
    loading,
    verificarStatus,
    sincronizar,
    isPago: status?.status === "LIQUIDADO" || status?.status === "BAIXADO",
  };
}

export function useSincronizacaoEmMassa() {
  const [syncing, setSyncing] = useState(false);
  const [resultado, setResultado] = useState<SincronizacaoResultado | null>(
    null
  );
  const [progresso, setProgresso] = useState({ atual: 0, total: 0 });

  const sincronizarTodos = async (
    onProgressUpdate?: (atual: number, total: number) => void
  ) => {
    setSyncing(true);
    setResultado(null);

    try {
      const result = await sincronizarTodosBoletos();
      setResultado(result);

      // Notificar sobre boletos pagos
      const boletosPagos = result.atualizados.filter(
        (item) =>
          item.statusNovo === "LIQUIDADO" || item.statusNovo === "BAIXADO"
      );

      // Mostrar resumo com boletos pagos
      let message = `✅ Sincronização concluída!\n\n`;
      message += `Total: ${result.total}\n`;
      message += `Sucesso: ${result.sucesso}\n`;
      message += `Erros: ${result.erros}\n`;

      if (boletosPagos.length > 0) {
        message += `\n🎉 ${boletosPagos.length} boleto(s) foram pagos!`;
      }

      if (result.erros > 0) {
        message += `\n\n⚠️ ${result.erros} boleto(s) com erro na sincronização`;
      }

      alert(message);

      return result;
    } catch (error: any) {
      console.error("Erro ao sincronizar todos os boletos:", error);
      alert(error?.message || "Erro ao sincronizar boletos em massa");
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncing,
    resultado,
    progresso,
    sincronizarTodos,
  };
}

