import { apiClient } from "@/core/api/client";

export interface BoletoStatus {
  status: string;
  statusDescription: string;
  beneficiaryCode?: string;
  bankNumber?: string;
  dueDate?: string;
  nominalValue?: number;
  paidValue?: number;
  settlementDate?: string;
  payer?: {
    name?: string;
    documentType?: string;
    documentNumber?: string;
  };
  qrCodePix?: string;
  barCode?: string;
  digitableLine?: string;
}

export interface BoletoAtualizado {
  boletoId: number;
  nsuCode: string;
  statusAnterior: string;
  statusNovo: string;
}

export interface BoletoErro {
  boletoId: number;
  nsuCode: string;
  erro: string;
}

export interface SincronizacaoResultado {
  total: number;
  sucesso: number;
  erros: number;
  atualizados: BoletoAtualizado[];
  erros_Lista: BoletoErro[];
}

/**
 * Consulta status de um boleto e atualiza automaticamente no banco
 */
export async function consultarStatusBoleto(
  boletoId: number
): Promise<BoletoStatus> {
  const response = await apiClient.get<BoletoStatus>(
    `/Boleto/${boletoId}/status`
  );

  if (response.error || !response.data) {
    throw new Error(response.error || "Erro ao consultar status do boleto");
  }

  return response.data;
}

/**
 * Sincroniza um boleto específico com a API Santander
 */
export async function sincronizarBoleto(boletoId: number): Promise<any> {
  const response = await apiClient.put(`/Boleto/${boletoId}/sincronizar`, {});

  if (response.error || !response.data) {
    throw new Error(response.error || "Erro ao sincronizar boleto");
  }

  return response.data;
}

/**
 * Sincroniza todos os boletos registrados/ativos com a API Santander
 */
export async function sincronizarTodosBoletos(): Promise<SincronizacaoResultado> {
  const response = await apiClient.put<SincronizacaoResultado>(
    "/Boleto/sincronizar-todos",
    {}
  );

  if (response.error || !response.data) {
    throw new Error(response.error || "Erro ao sincronizar boletos");
  }

  return response.data;
}

