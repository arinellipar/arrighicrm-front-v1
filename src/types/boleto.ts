// Tipos para o módulo de boletos baseados no backend

export interface Boleto {
  id: number;
  contratoId: number;
  nsuCode: string;
  nsuDate: string;
  covenantCode: string;
  bankNumber: string;
  clientNumber?: string;
  dueDate: string;
  issueDate: string;
  nominalValue: number;
  value: number; // Alias for nominalValue for compatibility
  documentKind: string;
  status: BoletoStatus;

  // Dados do Pagador
  payerName: string;
  payerDocumentType: string;
  payerDocumentNumber: string;
  payerAddress: string;
  payerNeighborhood: string;
  payerCity: string;
  payerState: string;
  payerZipCode: string;

  // Dados de resposta da API Santander
  barCode?: string;
  digitableLine?: string;
  entryDate?: string;
  qrCodePix?: string;
  qrCodeUrl?: string;

  // Informações do Contrato
  contrato?: ContratoInfo;

  // Campos de controle
  dataCadastro: string;
  dataAtualizacao?: string;

  // Campos de erro
  errorCode?: string;
  errorMessage?: string;
  traceId?: string;
}

export interface ContratoInfo {
  id: number;
  numeroContrato: string;
  clienteNome?: string;
  clienteDocumento?: string;
  valorContrato?: number;
}

export interface CreateBoletoDTO {
  contratoId: number;
  dueDate: string;
  nominalValue: number;
  clientNumber?: string;

  // Campos opcionais para desconto, multa e juros
  finePercentage?: number;
  fineQuantityDays?: number;
  interestPercentage?: number;
  deductionValue?: number;
  writeOffQuantityDays?: number;

  // Mensagens personalizadas
  messages?: string[];

  // Dados PIX (opcionais)
  pixKeyType?: PixKeyType;
  pixKey?: string;
  txId?: string;

  // Dados de desconto (opcionais)
  discount?: DescontoDTO;
}

export interface DescontoDTO {
  type: "VALOR_DATA_FIXA" | "PERCENTUAL_DATA_FIXA";
  discountOne?: DescontoValorDTO;
  discountTwo?: DescontoValorDTO;
  discountThree?: DescontoValorDTO;
}

export interface DescontoValorDTO {
  value: number;
  limitDate: string;
}

export type BoletoStatus =
  | "PENDENTE"
  | "REGISTRADO"
  | "LIQUIDADO"
  | "VENCIDO"
  | "CANCELADO"
  | "ERRO";

export type PixKeyType =
  | "EMAIL"
  | "CPF"
  | "CNPJ"
  | "TELEFONE"
  | "CHAVE_ALEATORIA";

export interface DashboardFinanceiro {
  totalBoletos: number;
  boletosPendentes: number;
  boletosRegistrados: number;
  boletosLiquidados: number;
  boletosVencidos: number;
  boletosCancelados: number;
  valorTotalRegistrado: number;
  valorTotalLiquidado: number;
  boletosHoje: number;
  boletosEsteMes: number;
}

export interface BoletoFilters {
  status?: BoletoStatus;
  contratoId?: number;
  clienteNome?: string;
  dataInicio?: string;
  dataFim?: string;
  valorMinimo?: number;
  valorMaximo?: number;
}

// Opções para status com cores e labels
export const BoletoStatusOptions = [
  {
    value: "PENDENTE" as BoletoStatus,
    label: "Aguardando Registro",
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  {
    value: "REGISTRADO" as BoletoStatus,
    label: "Registrado",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    value: "LIQUIDADO" as BoletoStatus,
    label: "Pago",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    value: "VENCIDO" as BoletoStatus,
    label: "Vencido",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  {
    value: "CANCELADO" as BoletoStatus,
    label: "Cancelado",
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
  {
    value: "ERRO" as BoletoStatus,
    label: "Erro",
    color: "bg-pink-100 text-pink-800 border-pink-200",
  },
] as const;

export const PixKeyTypeOptions = [
  { value: "EMAIL" as PixKeyType, label: "E-mail" },
  { value: "CPF" as PixKeyType, label: "CPF" },
  { value: "CNPJ" as PixKeyType, label: "CNPJ" },
  { value: "TELEFONE" as PixKeyType, label: "Telefone" },
  { value: "CHAVE_ALEATORIA" as PixKeyType, label: "Chave Aleatória" },
] as const;
