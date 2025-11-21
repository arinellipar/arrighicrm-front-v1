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
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              📄 Detalhes do Boleto #{boletoId}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
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
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-neutral-700">
                  <h3 className="font-bold text-lg mb-3 text-neutral-100">
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
                    className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-300 shadow-lg"
                  >
                    <h3 className="font-bold text-lg mb-4 text-green-800 flex items-center gap-2">
                      <CheckCircle className="w-6 h-6" />
                      ✅ Informações de Pagamento
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-green-700 font-medium">
                          Valor Pago
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          R$ {status.paidValue.toFixed(2)}
                        </p>
                      </div>
                      {status.settlementDate && (
                        <div>
                          <p className="text-sm text-green-700 font-medium">
                            Data de Pagamento
                          </p>
                          <p className="text-xl font-bold text-green-900">
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
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="font-bold text-lg mb-4 text-blue-800">
                      👤 Dados do Pagador
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-blue-700 font-medium">Nome</p>
                        <p className="text-neutral-50 font-semibold">
                          {status.payer.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-700 font-medium">Documento</p>
                        <p className="font-mono text-neutral-50 font-semibold">
                          {status.payer.documentNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PIX */}
                {status.qrCodePix && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-300">
                    <h3 className="font-bold text-lg mb-4 text-purple-800 flex items-center gap-2">
                      💳 Pagamento via PIX
                    </h3>
                    <button
                      onClick={() =>
                        copiarParaClipboard(status.qrCodePix!, "Código PIX")
                      }
                      className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <Copy className="w-5 h-5" />
                      📋 Copiar Código PIX
                    </button>
                  </div>
                )}

                {/* Linha Digitável */}
                {status.digitableLine && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-300">
                    <h3 className="font-bold text-lg mb-3 text-blue-800 flex items-center gap-2">
                      🔢 Linha Digitável
                    </h3>
                    <p className="font-mono text-sm bg-white p-3 rounded border border-blue-200 break-all mb-3 text-neutral-100">
                      {status.digitableLine}
                    </p>
                    <button
                      onClick={() =>
                        copiarParaClipboard(
                          status.digitableLine!,
                          "Linha digitável"
                        )
                      }
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <Copy className="w-5 h-5" />
                      📋 Copiar
                    </button>
                  </div>
                )}

                {/* Código de Barras */}
                {status.barCode && (
                  <div className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700">
                    <h3 className="font-bold text-lg mb-3 text-neutral-100">
                      📊 Código de Barras
                    </h3>
                    <p className="font-mono text-sm bg-white p-3 rounded border border-neutral-700 break-all text-neutral-100">
                      {status.barCode}
                    </p>
                  </div>
                )}

                {/* Botão Atualizar */}
                <button
                  onClick={carregarStatus}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  🔄 Atualizar Status
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">
                  Nenhum dado disponível
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-neutral-800/50 p-4 rounded-b-2xl border-t border-neutral-700">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
