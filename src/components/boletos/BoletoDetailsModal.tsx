import { useState, useEffect, useRef } from "react";
import { X, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { consultarStatusBoleto, BoletoStatus } from "@/services/boletoService";
import { StatusBadge } from "./StatusBadge";
import { motion, AnimatePresence } from "framer-motion";

interface BoletoDetailsModalProps {
  boletoId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function BoletoDetailsModal({
  boletoId,
  isOpen,
  onClose,
}: BoletoDetailsModalProps) {
  const [status, setStatus] = useState<BoletoStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formatCurrency = (value?: number) => {
    if (typeof value !== "number") return "—";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  };

  const formatDate = (value?: string) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleDateString("pt-BR");
    } catch {
      return "—";
    }
  };

  useEffect(() => {
    if (isOpen) {
      carregarStatus();
    }
  }, [isOpen, boletoId]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const carregarStatus = async () => {
    setLoading(true);
    try {
      const statusAtual = await consultarStatusBoleto(boletoId);
      setStatus(statusAtual);
    } catch (error) {
      console.error("Erro ao carregar status:", error);
      alert("Erro ao carregar detalhes do boleto");
    } finally {
      setLoading(false);
    }
  };

  const copiarParaClipboard = (texto?: string, campo?: string) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto);
    if (campo) {
      setCopiedField(campo);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const qrCodeImage =
    status?.qrCodeUrl ||
    (status?.qrCodePix
      ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
          status.qrCodePix
        )}`
      : null);

  const resumoFinanceiro = [
    { label: "Valor nominal", value: formatCurrency(status?.nominalValue) },
    { label: "Valor pago", value: formatCurrency(status?.paidValue) },
    { label: "Descontos", value: formatCurrency(status?.discountValue) },
    { label: "Multa", value: formatCurrency(status?.fineValue) },
    { label: "Juros", value: formatCurrency(status?.interestValue) },
    { label: "Vencimento", value: formatDate(status?.dueDate) },
    { label: "Emissão", value: formatDate(status?.issueDate) },
    { label: "Entrada Santander", value: formatDate(status?.entryDate) },
    { label: "Pagamento", value: formatDate(status?.settlementDate) },
  ];

  const identificadoresTecnicos = [
    { label: "NSU Code", value: status?.nsuCode, id: "nsuCode" },
    { label: "Nosso Número", value: status?.bankNumber, id: "bankNumber" },
    {
      label: "Código do Convênio",
      value: status?.beneficiaryCode,
      id: "beneficiaryCode",
    },
    { label: "Client Number", value: status?.clientNumber, id: "clientNumber" },
  ];

  const ultimaAtualizacao = status?.consultaRealizadaEm
    ? formatDate(status.consultaRealizadaEm)
    : formatDate(status?.entryDate);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-gold-500 to-gold-600 text-neutral-950 p-6 rounded-t-2xl flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              Detalhes do Boleto #{boletoId}
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-950 hover:bg-black/20 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="text-6xl mb-4"
                >
                  ⏳
                </motion.div>
                <p className="text-neutral-400">Carregando detalhes...</p>
              </div>
            ) : status ? (
              <div className="space-y-6">
                <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 shadow-lg shadow-black/30">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                        Dados do boleto
                      </p>
                      <h3 className="text-2xl lg:text-3xl font-semibold text-neutral-50">
                        {status.payer?.name || `Boleto #${boletoId}`}
                      </h3>
                      <p className="text-sm text-neutral-400">
                        {status.payer?.documentNumber || "Documento não informado"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 w-full lg:max-w-sm">
                      <StatusBadge
                        status={status.status}
                        statusDescription={status.statusDescription}
                        size="lg"
                      />
                      <p className="text-sm text-neutral-400">
                        {status.statusDescription}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Última atualização: {ultimaAtualizacao}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-sm">
                    <div>
                      <p className="text-neutral-400 uppercase text-xs tracking-wide">
                        NSU Code
                      </p>
                      <p className="font-mono text-lg text-gold-400">
                        {status.nsuCode ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-400 uppercase text-xs tracking-wide">
                        Nosso Número
                      </p>
                      <p className="font-mono text-lg text-neutral-50">
                        {status.bankNumber ?? "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 shadow-lg shadow-black/30">
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                    <h3 className="text-xl font-semibold text-neutral-50">
                      Resumo financeiro
                    </h3>
                    <span className="text-xs text-neutral-500 uppercase">
                      Consulta Santander: {ultimaAtualizacao}
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {resumoFinanceiro.map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-neutral-950/40 border border-neutral-800 rounded-xl p-4"
                      >
                        <p className="text-xs uppercase tracking-wide text-neutral-500">
                          {stat.label}
                        </p>
                        <p className="text-lg font-semibold text-neutral-50 mt-1">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 shadow-lg shadow-black/30 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-50">
                      Dados Santander
                    </h3>
                    <p className="text-sm text-neutral-400">
                      Utilize as informações oficiais para pagamento e conferência
                      no banco.
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <CopyableValue
                      label="Código de barras"
                      value={status.barCode}
                      copyId="barCode"
                      onCopy={copiarParaClipboard}
                      isCopied={copiedField === "barCode"}
                    />
                    <CopyableValue
                      label="Linha digitável"
                      value={status.digitableLine}
                      copyId="digitableLine"
                      onCopy={copiarParaClipboard}
                      isCopied={copiedField === "digitableLine"}
                    />
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {identificadoresTecnicos.map((campo) => (
                      <CopyableValue
                        key={campo.id}
                        label={campo.label}
                        value={campo.value}
                        copyId={campo.id}
                        onCopy={copiarParaClipboard}
                        isCopied={copiedField === campo.id}
                      />
                    ))}
                  </div>
                </div>

                {(status.qrCodePix || qrCodeImage) && (
                  <div className="bg-gradient-to-br from-gold-500/10 to-gold-600/10 border border-gold-500/30 rounded-2xl p-6 shadow-lg shadow-gold-500/20 space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <h3 className="text-xl font-semibold text-gold-300">
                        Pagamento via PIX Santander
                      </h3>
                      <span className="text-xs text-neutral-700 uppercase">
                        QR Code oficial retornado pela API Santander
                      </span>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-2xl p-4 w-full lg:max-w-xs">
                        {qrCodeImage ? (
                          <img
                            src={qrCodeImage}
                            alt="QR Code PIX Santander"
                            className="w-48 h-48"
                            loading="lazy"
                          />
                        ) : (
                          <p className="text-sm text-neutral-500 text-center">
                            QR Code não disponível para este boleto
                          </p>
                        )}
                        <p className="text-xs text-neutral-500 mt-3 flex items-center gap-1">
                          Abra o app do seu banco e escaneie o QR Code
                        </p>
                      </div>
                      <div className="flex-1 space-y-4">
                        <CopyableValue
                          label="Código PIX (copia e cola)"
                          value={status.qrCodePix}
                          copyId="pixCode"
                          onCopy={copiarParaClipboard}
                          isCopied={copiedField === "pixCode"}
                          helperText="Cole diretamente no app do seu banco para pagar este boleto."
                        />
                        <CopyableValue
                          label="Link oficial do QR Code"
                          value={status.qrCodeUrl}
                          copyId="pixUrl"
                          onCopy={copiarParaClipboard}
                          isCopied={copiedField === "pixUrl"}
                          helperText="URL fornecida pela API Santander contendo a imagem oficial do QR."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {status.payer && (
                  <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 shadow-lg shadow-black/30 space-y-4">
                    <h3 className="text-xl font-semibold text-neutral-50">
                      Dados do pagador
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-neutral-500">
                          Nome
                        </p>
                        <p className="text-neutral-50 font-semibold">
                          {status.payer.name || "Não informado"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-neutral-500">
                          Documento
                        </p>
                        <p className="font-mono text-neutral-100">
                          {status.payer.documentNumber || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-neutral-500">
                          Endereço
                        </p>
                        <p className="text-neutral-50">
                          {status.payer.address || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-neutral-500">
                          Bairro
                        </p>
                        <p className="text-neutral-50">
                          {status.payer.neighborhood || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-neutral-500">
                          Cidade / UF
                        </p>
                        <p className="text-neutral-50">
                          {[status.payer.city, status.payer.state]
                            .filter(Boolean)
                            .join(" / ") || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-neutral-500">
                          CEP
                        </p>
                        <p className="text-neutral-50">
                          {status.payer.zipCode || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {status.settlements && status.settlements.length > 0 && (
                  <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 shadow-lg shadow-black/30 space-y-4">
                    <h3 className="text-xl font-semibold text-neutral-50">
                      Liquidações registradas
                    </h3>
                    <div className="space-y-3">
                      {status.settlements.map((settlement, index) => (
                        <div
                          key={`${settlement.settlementDate}-${index}`}
                          className="bg-neutral-950/40 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                        >
                          <div>
                            <p className="text-xs uppercase tracking-wide text-neutral-500">
                              Data
                            </p>
                            <p className="text-neutral-50">
                              {formatDate(settlement.settlementDate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-neutral-500">
                              Origem
                            </p>
                            <p className="text-neutral-50">
                              {settlement.settlementOrigin || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-neutral-500">
                              Valor
                            </p>
                            <p className="text-neutral-50 font-semibold">
                              {formatCurrency(settlement.settlementValue)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {status.messages && status.messages.length > 0 && (
                  <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 shadow-lg shadow-black/30">
                    <h3 className="text-xl font-semibold text-neutral-50 mb-3">
                      Mensagens do Santander
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-sm text-neutral-300">
                      {status.messages.map((message, index) => (
                        <li key={`mensagem-${index}`}>{message}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={carregarStatus}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-neutral-950 rounded-lg disabled:opacity-50 transition-all font-semibold shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30"
                >
                  🔄 Atualizar status na API Santander
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 mx-auto text-neutral-600 mb-4" />
                <p className="text-neutral-400 text-lg">
                  Nenhum dado disponível
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-neutral-800/50 p-4 rounded-b-2xl border-t border-neutral-700">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors font-semibold text-neutral-200 border border-neutral-600"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface CopyableValueProps {
  label: string;
  value?: string | number | null;
  copyId: string;
  onCopy: (value?: string, fieldId?: string) => void;
  isCopied: boolean;
  helperText?: string;
  mono?: boolean;
}

function CopyableValue({
  label,
  value,
  copyId,
  onCopy,
  isCopied,
  helperText,
  mono = true,
}: CopyableValueProps) {
  if (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return null;
  }

  const textValue = String(value);

  return (
    <div className="space-y-2">
      <p className="text-sm text-neutral-400 font-medium">{label}</p>
      <div className="flex items-center gap-3 bg-neutral-950/60 border border-neutral-800 rounded-xl p-3">
        <p
          className={`flex-1 break-all ${
            mono ? "font-mono text-sm" : "text-base font-semibold"
          } text-neutral-50`}
        >
          {textValue}
        </p>
        <button
          onClick={() => onCopy(textValue, copyId)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
            isCopied
              ? "bg-emerald-600/20 text-emerald-300 border border-emerald-400/40"
              : "bg-gradient-to-r from-gold-500 to-gold-600 text-neutral-950 shadow-gold-500/30"
          }`}
        >
          {isCopied ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copiar
            </>
          )}
        </button>
      </div>
      {helperText && (
        <p className="text-xs text-neutral-500">{helperText}</p>
      )}
    </div>
  );
}
