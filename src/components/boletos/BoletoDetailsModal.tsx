// src/components/boletos/BoletoDetailsModal.tsx
import { Boleto } from "@/types/boleto";
import { StatusBadge } from "./StatusBadge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  X,
  Copy,
  Download,
  ExternalLink,
  RefreshCw,
  Trash2,
  Calendar,
  DollarSign,
  User,
  FileText,
  CreditCard,
} from "lucide-react";

interface BoletoDetailsModalProps {
  boleto: Boleto | null;
  isOpen: boolean;
  onClose: () => void;
  onSync?: (boleto: Boleto) => void;
  onDelete?: (boleto: Boleto) => void;
}

export function BoletoDetailsModal({
  boleto,
  isOpen,
  onClose,
  onSync,
  onDelete,
}: BoletoDetailsModalProps) {
  if (!isOpen || !boleto) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const isVencido =
    new Date(boleto.dueDate) < new Date() &&
    boleto.status !== "LIQUIDADO" &&
    boleto.status !== "CANCELADO";
  const canSync = boleto.status === "REGISTRADO";
  const canDelete = boleto.status !== "LIQUIDADO";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Boleto #{boleto.id}
            </h2>
            <StatusBadge status={boleto.status} />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Valor e Vencimento */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-900">Valor</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(boleto.nominalValue)}
              </p>

              <div className="flex items-center gap-2 mt-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Vencimento</span>
              </div>
              <p
                className={`text-lg ${
                  isVencido ? "text-red-600 font-semibold" : "text-gray-900"
                }`}
              >
                {format(new Date(boleto.dueDate), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
                {isVencido && <span className="ml-2 text-sm">(VENCIDO)</span>}
              </p>
            </div>

            {/* Informações do Boleto */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">
                Informações do Boleto
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">NSU Code:</span>
                  <span className="font-mono text-gray-900">
                    {boleto.nsuCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nosso Número:</span>
                  <span className="font-mono text-gray-900">
                    {boleto.bankNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seu Número:</span>
                  <span className="font-mono text-gray-900">
                    {boleto.clientNumber || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Convênio:</span>
                  <span className="font-mono text-gray-900">
                    {boleto.covenantCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Datas */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Datas</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Emissão:</span>
                  <p className="text-gray-900">
                    {format(new Date(boleto.issueDate), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Cadastro:</span>
                  <p className="text-gray-900">
                    {formatDate(boleto.dataCadastro)}
                  </p>
                </div>
                {boleto.dataAtualizacao && (
                  <div>
                    <span className="text-gray-600">Última Atualização:</span>
                    <p className="text-gray-900">
                      {formatDate(boleto.dataAtualizacao)}
                    </p>
                  </div>
                )}
                {boleto.entryDate && (
                  <div>
                    <span className="text-gray-600">Registro Santander:</span>
                    <p className="text-gray-900">
                      {format(new Date(boleto.entryDate), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Informações do Pagador */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Dados do Pagador
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Nome:</span>
                  <p className="text-gray-900 font-medium">
                    {boleto.payerName}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Documento:</span>
                  <p className="text-gray-900 font-medium">
                    {boleto.payerDocumentType}: {boleto.payerDocumentNumber}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Endereço:</span>
                  <p className="text-gray-900">{boleto.payerAddress}</p>
                  <p className="text-gray-900">
                    {boleto.payerNeighborhood}, {boleto.payerCity} -{" "}
                    {boleto.payerState}
                  </p>
                  <p className="text-gray-900">CEP: {boleto.payerZipCode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Contrato */}
          {boleto.contrato && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Contrato Relacionado
                </h3>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">
                      Número do Contrato:
                    </span>
                    <p className="text-gray-900 font-medium">
                      {boleto.contrato.numeroContrato}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Cliente:</span>
                    <p className="text-gray-900 font-medium">
                      {boleto.contrato.clienteNome}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">
                      Valor do Contrato:
                    </span>
                    <p className="text-gray-900 font-medium">
                      {boleto.contrato.valorContrato
                        ? formatCurrency(boleto.contrato.valorContrato)
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dados Santander */}
          {(boleto.barCode || boleto.digitableLine || boleto.qrCodePix) && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Dados Santander
                </h3>
              </div>

              <div className="space-y-4">
                {/* Código de Barras */}
                {boleto.barCode && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Código de Barras:
                      </span>
                      <button
                        onClick={() => copyToClipboard(boleto.barCode!)}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        <Copy className="w-4 h-4" />
                        Copiar
                      </button>
                    </div>
                    <p className="font-mono text-sm bg-gray-50 p-2 rounded break-all">
                      {boleto.barCode}
                    </p>
                  </div>
                )}

                {/* Linha Digitável */}
                {boleto.digitableLine && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Linha Digitável:
                      </span>
                      <button
                        onClick={() => copyToClipboard(boleto.digitableLine!)}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        <Copy className="w-4 h-4" />
                        Copiar
                      </button>
                    </div>
                    <p className="font-mono text-sm bg-gray-50 p-2 rounded break-all">
                      {boleto.digitableLine}
                    </p>
                  </div>
                )}

                {/* QR Code PIX */}
                {boleto.qrCodePix && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        QR Code PIX:
                      </span>
                      <button
                        onClick={() => copyToClipboard(boleto.qrCodePix!)}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        <Copy className="w-4 h-4" />
                        Copiar
                      </button>
                    </div>
                    <p className="font-mono text-xs bg-gray-50 p-2 rounded break-all">
                      {boleto.qrCodePix}
                    </p>
                  </div>
                )}

                {/* URL QR Code */}
                {boleto.qrCodeUrl && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-gray-600" />
                    <a
                      href={boleto.qrCodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Visualizar QR Code
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mensagens de Erro */}
          {(boleto.errorCode || boleto.errorMessage) && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-red-600 mb-4">Erros</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                {boleto.errorCode && (
                  <p className="text-sm text-red-800">
                    <strong>Código:</strong> {boleto.errorCode}
                  </p>
                )}
                {boleto.errorMessage && (
                  <p className="text-sm text-red-800 mt-2">
                    <strong>Mensagem:</strong> {boleto.errorMessage}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer com ações */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          {canSync && onSync && (
            <button
              onClick={() => onSync(boleto)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Sincronizar
            </button>
          )}

          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(boleto)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Cancelar Boleto
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
