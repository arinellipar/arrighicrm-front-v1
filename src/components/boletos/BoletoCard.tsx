// src/components/boletos/BoletoCard.tsx
import { Boleto } from "@/types/boleto";
import { StatusBadge } from "./StatusBadge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, RefreshCw, Trash2 } from "lucide-react";

interface BoletoCardProps {
  boleto: Boleto;
  onViewDetails?: (boleto: Boleto) => void;
  onSync?: (boleto: Boleto) => void;
  onDelete?: (boleto: Boleto) => void;
  className?: string;
}

export function BoletoCard({
  boleto,
  onViewDetails,
  onSync,
  onDelete,
  className = "",
}: BoletoCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const isVencido =
    new Date(boleto.dueDate) < new Date() &&
    boleto.status !== "LIQUIDADO" &&
    boleto.status !== "BAIXADO" &&
    boleto.status !== "CANCELADO";
  const canSync = boleto.status === "REGISTRADO";
  const canDelete =
    boleto.status !== "LIQUIDADO" && boleto.status !== "BAIXADO";

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Boleto #{boleto.id}
          </h3>
          <p className="text-sm text-gray-600">NSU: {boleto.nsuCode}</p>
        </div>
        <StatusBadge status={boleto.status} />
      </div>

      {/* Valor e Vencimento */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Valor</p>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(boleto.nominalValue)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Vencimento</p>
          <p
            className={`text-sm font-medium ${
              isVencido ? "text-red-600" : "text-gray-900"
            }`}
          >
            {formatDate(boleto.dueDate)}
            {isVencido && <span className="ml-1 text-xs">(VENCIDO)</span>}
          </p>
        </div>
      </div>

      {/* Informações do Contrato */}
      {boleto.contrato && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Contrato</p>
          <p className="text-sm font-medium text-gray-900">
            {boleto.contrato.numeroContrato}
          </p>
          <p className="text-sm text-gray-700">{boleto.contrato.clienteNome}</p>
          {boleto.contrato.valorContrato && (
            <p className="text-sm text-gray-600">
              Valor: {formatCurrency(boleto.contrato.valorContrato)}
            </p>
          )}
        </div>
      )}

      {/* Informações do Pagador */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-1">Pagador</p>
        <p className="text-sm font-medium text-gray-900">{boleto.payerName}</p>
        <p className="text-sm text-gray-700">
          {boleto.payerDocumentType}: {boleto.payerDocumentNumber}
        </p>
      </div>

      {/* Código de barras (se disponível) */}
      {boleto.digitableLine && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Linha Digitável</p>
          <p className="text-xs font-mono bg-gray-50 p-2 rounded break-all">
            {boleto.digitableLine}
          </p>
        </div>
      )}

      {/* Data de cadastro */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Criado em: {formatDate(boleto.dataCadastro)}
        </p>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(boleto)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Ver detalhes"
          >
            <Eye className="w-4 h-4" />
            Detalhes
          </button>
        )}

        {onSync && canSync && (
          <button
            onClick={() => onSync(boleto)}
            className="flex items-center gap-1 px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
            title="Sincronizar com Santander"
          >
            <RefreshCw className="w-4 h-4" />
            Sincronizar
          </button>
        )}

        {onDelete && canDelete && (
          <button
            onClick={() => onDelete(boleto)}
            className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Cancelar boleto"
          >
            <Trash2 className="w-4 h-4" />
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
