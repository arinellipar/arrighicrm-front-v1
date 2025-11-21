import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (isOpen) {
      carregarStatus();
    }
  }, [isOpen, boletoId]);

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

  const copiarParaClipboard = (texto: string, tipo: string) => {
    navigator.clipboard.writeText(texto);
    alert(`${tipo} copiado para área de transferência!`);
  };

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
                {/* Status Atual */}
                <div className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700">
                  <h3 className="font-bold text-lg mb-3 text-neutral-50">
                    📊 Status Atual
                  </h3>
                  <StatusBadge
                    status={status.status}
                    statusDescription={status.statusDescription}
                    size="lg"
                  />
                  <p className="text-sm text-neutral-400 mt-3">
                    {status.statusDescription}
                  </p>
                </div>

                {/* Informações de Pagamento (se pago) */}
                {status.paidValue && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-br from-green-500/10 to-green-600/10 p-6 rounded-xl border-2 border-green-500/30 shadow-lg"
                  >
                    <h3 className="font-bold text-lg mb-4 text-green-400 flex items-center gap-2">
                      <CheckCircle className="w-6 h-6" />
                      Informações de Pagamento
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-green-400 font-medium">
                          Valor Pago
                        </p>
                        <p className="text-2xl font-bold text-green-300">
                          R$ {status.paidValue.toFixed(2)}
                        </p>
                      </div>
                      {status.settlementDate && (
                        <div>
                          <p className="text-sm text-green-400 font-medium">
                            Data de Pagamento
                          </p>
                          <p className="text-xl font-bold text-green-300">
                            {new Date(status.settlementDate).toLocaleDateString(
                              "pt-BR"
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Informações Básicas */}
                <div className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700">
                  <h3 className="font-bold text-lg mb-4 text-neutral-100">
                    📋 Informações Básicas
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-400 font-medium">Valor Nominal</p>
                      <p className="text-lg font-bold text-neutral-50">
                        R$ {status.nominalValue?.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-400 font-medium">Vencimento</p>
                      <p className="text-lg font-bold text-neutral-50">
                        {status.dueDate
                          ? new Date(status.dueDate).toLocaleDateString(
                              "pt-BR"
                            )
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-400 font-medium">Nosso Número</p>
                      <p className="font-mono text-neutral-50 font-semibold">
                        {status.bankNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-400 font-medium">
                        Código do Convênio
                      </p>
                      <p className="font-mono text-neutral-50 font-semibold">
                        {status.beneficiaryCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dados do Pagador */}
                {status.payer && (
                  <div className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700">
                    <h3 className="font-bold text-lg mb-4 text-neutral-50">
                      👤 Dados do Pagador
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-neutral-400 font-medium">Nome</p>
                        <p className="text-neutral-50 font-semibold">
                          {status.payer.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-400 font-medium">Documento</p>
                        <p className="font-mono text-neutral-50 font-semibold">
                          {status.payer.documentNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PIX com QR Code Visual */}
                {status.qrCodePix && (
                  <div className="bg-gradient-to-br from-gold-500/10 to-gold-600/10 p-6 rounded-xl border-2 border-gold-500/30 shadow-lg">
                    <h3 className="font-bold text-lg mb-4 text-gold-400 flex items-center gap-2">
                      💳 Pagamento via PIX
                    </h3>

                    {/* QR Code Visual */}
                    <div className="flex flex-col items-center mb-4">
                      <div className="bg-white p-4 rounded-xl shadow-lg">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(status.qrCodePix)}`}
                          alt="QR Code PIX"
                          className="w-48 h-48"
                        />
                      </div>
                      <p className="text-sm text-neutral-400 mt-3">
                        Escaneie com seu app de pagamento
                      </p>
                    </div>

                    {/* Código PIX Copia e Cola */}
                    <div className="bg-neutral-800/50 p-3 rounded-lg border border-neutral-700 mb-3">
                      <p className="text-xs text-neutral-400 mb-2">Código PIX Copia e Cola:</p>
                      <p className="font-mono text-xs text-neutral-200 break-all max-h-20 overflow-y-auto">
                        {status.qrCodePix}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        copiarParaClipboard(status.qrCodePix!, "Código PIX")
                      }
                      className="w-full px-4 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-neutral-950 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20"
                    >
                      <Copy className="w-5 h-5" />
                      Copiar Código PIX
                    </button>
                  </div>
                )}

                {/* Linha Digitável */}
                {status.digitableLine && (
                  <div className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700">
                    <h3 className="font-bold text-lg mb-3 text-neutral-50 flex items-center gap-2">
                      🔢 Linha Digitável
                    </h3>
                    <p className="font-mono text-sm bg-neutral-900 p-3 rounded border border-neutral-700 break-all mb-3 text-neutral-100">
                      {status.digitableLine}
                    </p>
                    <button
                      onClick={() =>
                        copiarParaClipboard(
                          status.digitableLine!,
                          "Linha digitável"
                        )
                      }
                      className="w-full px-4 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-neutral-950 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20"
                    >
                      <Copy className="w-5 h-5" />
                      Copiar
                    </button>
                  </div>
                )}

                {/* Código de Barras */}
                {status.barCode && (
                  <div className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700">
                    <h3 className="font-bold text-lg mb-3 text-neutral-50">
                      📊 Código de Barras
                    </h3>
                    <p className="font-mono text-sm bg-neutral-900 p-3 rounded border border-neutral-700 break-all text-neutral-100 mb-3">
                      {status.barCode}
                    </p>
                    <button
                      onClick={() =>
                        copiarParaClipboard(status.barCode!, "Código de barras")
                      }
                      className="w-full px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 border border-neutral-600"
                    >
                      <Copy className="w-5 h-5" />
                      Copiar Código
                    </button>
                  </div>
                )}

                {/* Botão Atualizar */}
                <button
                  onClick={carregarStatus}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-neutral-950 rounded-lg disabled:opacity-50 transition-all font-semibold shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30"
                >
                  🔄 Atualizar Status
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
