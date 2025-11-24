"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ChevronDown, Plus, Minus } from "lucide-react";

interface ContratoCompleto {
  id: number;
  numeroContrato: string;
  valorNegociado?: number;
  valorDevido?: number;
  valorEntrada?: number;
  valorParcela?: number;
  numeroParcelas?: number;
  cliente?: {
    pessoaFisica?: {
      nome?: string;
      cpf?: string;
    };
    pessoaJuridica?: {
      razaoSocial?: string;
      cnpj?: string;
    };
  };
}

interface ContratoDisplay {
  id: number;
  numeroContrato: string;
  clienteNome: string;
  clienteDocumento: string;
  valorNegociado?: number;
}

interface NovoBoletoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NovoBoletoModal({
  isOpen,
  onClose,
  onSuccess,
}: NovoBoletoModalProps) {
  const [contratosRaw, setContratosRaw] = useState<ContratoCompleto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContrato, setSelectedContrato] =
    useState<ContratoDisplay | null>(null);
  const [showContratoDropdown, setShowContratoDropdown] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [valorNominal, setValorNominal] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [clientNumber, setClientNumber] = useState("");

  // Advanced fields
  const [finePercentage, setFinePercentage] = useState("");
  const [interestPercentage, setInterestPercentage] = useState("");
  const [messages, setMessages] = useState<string[]>([""]);

  useEffect(() => {
    if (isOpen) {
      fetchContratos();
    }
  }, [isOpen]);

  const fetchContratos = async () => {
    try {
      const token = localStorage.getItem("token");
      const usuarioId = localStorage.getItem("usuarioId");

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5101/api"
        }/Contrato`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Usuario-Id": usuarioId || "1",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("📄 Contratos carregados:", data.length, "contratos");
        console.log("📄 Primeiro contrato:", data[0]);
        console.log("📄 Valores do primeiro contrato:", {
          valorNegociado: data[0]?.valorNegociado,
          valorDevido: data[0]?.valorDevido,
          valorEntrada: data[0]?.valorEntrada,
          valorParcela: data[0]?.valorParcela,
          numeroParcelas: data[0]?.numeroParcelas,
        });
        setContratosRaw(data);
      }
    } catch (error) {
      console.error("Erro ao buscar contratos:", error);
    }
  };

  // Transformar contratos raw em formato de exibição
  const contratos: ContratoDisplay[] = contratosRaw.map((c) => {
    const clienteNome =
      c.cliente?.pessoaFisica?.nome ||
      c.cliente?.pessoaJuridica?.razaoSocial ||
      "Cliente não identificado";

    const clienteDocumento =
      c.cliente?.pessoaFisica?.cpf ||
      c.cliente?.pessoaJuridica?.cnpj ||
      "Sem documento";

    // Calcular valor total do contrato
    // Prioridade: ValorNegociado > ValorDevido > (ValorEntrada + ValorParcela * NumeroParcelas)
    let valorTotal = c.valorNegociado || c.valorDevido;

    if (!valorTotal && c.valorEntrada && c.valorParcela && c.numeroParcelas) {
      valorTotal = c.valorEntrada + c.valorParcela * c.numeroParcelas;
    } else if (!valorTotal && c.valorParcela && c.numeroParcelas) {
      valorTotal = c.valorParcela * c.numeroParcelas;
    }

    return {
      id: c.id,
      numeroContrato: c.numeroContrato || `CONT-${c.id}`,
      clienteNome,
      clienteDocumento,
      valorNegociado: valorTotal,
    };
  });

  const filteredContratos = contratos.filter((c) => {
    const search = searchTerm.toLowerCase().replace(/[^\w]/g, "");
    const numeroContrato = c?.numeroContrato?.toLowerCase() || "";
    const clienteNome = c?.clienteNome?.toLowerCase() || "";
    const clienteDocumento = (c?.clienteDocumento || "").replace(/[^\w]/g, "");

    return (
      numeroContrato.includes(searchTerm.toLowerCase()) ||
      clienteNome.includes(searchTerm.toLowerCase()) ||
      clienteDocumento.includes(search)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedContrato) {
      setError("Selecione um contrato");
      return;
    }

    if (!valorNominal || !dataVencimento) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const payload: any = {
        contratoId: selectedContrato.id,
        nominalValue: parseFloat(valorNominal.replace(",", ".")),
        dueDate: dataVencimento,
      };

      if (clientNumber) payload.clientNumber = clientNumber;
      if (finePercentage) payload.finePercentage = parseFloat(finePercentage);
      if (interestPercentage)
        payload.interestPercentage = parseFloat(interestPercentage);

      const validMessages = messages.filter((m) => m.trim());
      if (validMessages.length > 0) payload.messages = validMessages;

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5101/api"
        }/Boleto`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        onSuccess();
        handleClose();
      } else {
        const errorData = await response.json();
        setError(errorData.mensagem || "Erro ao criar boleto");
      }
    } catch (error) {
      console.error("Erro ao criar boleto:", error);
      setError("Erro ao criar boleto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedContrato(null);
    setSearchTerm("");
    setValorNominal("");
    setDataVencimento("");
    setClientNumber("");
    setFinePercentage("");
    setInterestPercentage("");
    setMessages([""]);
    setShowAdvanced(false);
    setError("");
    onClose();
  };

  const addMessage = () => {
    if (messages.length < 5) {
      setMessages([...messages, ""]);
    }
  };

  const removeMessage = (index: number) => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  const updateMessage = (index: number, value: string) => {
    const newMessages = [...messages];
    newMessages[index] = value;
    setMessages(newMessages);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-amber-400 to-amber-600 p-6 rounded-t-2xl flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-neutral-950">Novo Boleto</h2>
              <p className="text-sm text-neutral-800 mt-1">Criar novo boleto para cobrança</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-black/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-950" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                Informações Obrigatórias
              </h3>

              {/* Contrato */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Contrato *{" "}
                  <span className="text-neutral-500 font-normal">
                    (busque por número, cliente ou CPF/CNPJ)
                  </span>
                </label>
                <div className="relative">
                  <div
                    onClick={() =>
                      setShowContratoDropdown(!showContratoDropdown)
                    }
                    className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 cursor-pointer flex items-center justify-between hover:bg-neutral-800/70 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-5 h-5 text-neutral-500" />
                      <span
                        className={
                          selectedContrato ? "text-neutral-100" : "text-neutral-500"
                        }
                      >
                        {selectedContrato
                          ? `${selectedContrato.numeroContrato} - ${selectedContrato.clienteNome}`
                          : "Digite para buscar..."}
                      </span>
                    </div>
                    <ChevronDown className="w-5 h-5 text-neutral-500" />
                  </div>

                  {showContratoDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-neutral-900/95 backdrop-blur-xl border border-neutral-700 rounded-lg shadow-2xl shadow-black/50 max-h-60 overflow-y-auto">
                      <div className="p-2">
                        <input
                          type="text"
                          placeholder="Buscar..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-800/50 border border-neutral-700 text-neutral-100 placeholder-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredContratos.map((contrato) => (
                          <div
                            key={contrato.id}
                            onClick={() => {
                              console.log("🔍 Contrato selecionado:", contrato);
                              console.log(
                                "🔍 Valor negociado:",
                                contrato.valorNegociado
                              );
                              setSelectedContrato(contrato);
                              setShowContratoDropdown(false);
                              setSearchTerm("");
                              // Preencher automaticamente o valor negociado do contrato
                              if (contrato.valorNegociado) {
                                console.log(
                                  "✅ Preenchendo valor:",
                                  contrato.valorNegociado.toFixed(2)
                                );
                                setValorNominal(
                                  contrato.valorNegociado.toFixed(2)
                                );
                              } else {
                                console.log("⚠️ Contrato sem valor negociado");
                              }
                            }}
                            className="px-4 py-3 hover:bg-neutral-800/50 cursor-pointer border-b border-neutral-800 last:border-0 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-neutral-100">
                                  {contrato.numeroContrato}
                                </p>
                                <p className="text-sm text-neutral-400">
                                  {contrato.clienteNome}
                                </p>
                                <p className="text-xs text-neutral-500">
                                  {contrato.clienteDocumento}
                                </p>
                              </div>
                              {contrato.valorNegociado && (
                                <div className="ml-3 text-right">
                                  <p className="text-xs text-neutral-500">
                                    Valor Total
                                  </p>
                                  <p className="text-sm font-semibold text-amber-400">
                                    {new Intl.NumberFormat("pt-BR", {
                                      style: "currency",
                                      currency: "BRL",
                                    }).format(contrato.valorNegociado)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {filteredContratos.length === 0 && (
                          <p className="px-4 py-3 text-neutral-500 text-center">
                            Nenhum contrato encontrado
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Valor e Data */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Valor Nominal (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={valorNominal}
                    onChange={(e) => setValorNominal(e.target.value)}
                    placeholder="0,00"
                    className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 text-neutral-100 placeholder-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                    required
                  />
                  {selectedContrato && selectedContrato.valorNegociado && (
                    <p className="mt-1 text-xs text-amber-400">
                      ✓ Valor preenchido automaticamente do contrato
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50"
                    required
                  />
                </div>
              </div>

              {/* Seu Número */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Seu Número (Opcional)
                </label>
                <input
                  type="text"
                  value={clientNumber}
                  onChange={(e) => setClientNumber(e.target.value)}
                  placeholder="Número de referência do cliente"
                  className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 text-neutral-100 placeholder-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                />
              </div>
            </div>

            {/* Opções Avançadas */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                <Plus
                  className={`w-5 h-5 transition-transform ${
                    showAdvanced ? "rotate-45" : ""
                  }`}
                />
                Mostrar opções avançadas
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4 p-4 bg-neutral-800/30 border border-neutral-700/50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Multa (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={finePercentage}
                        onChange={(e) => setFinePercentage(e.target.value)}
                        placeholder="2.00"
                        className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 text-neutral-100 placeholder-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Juros (% ao mês)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={interestPercentage}
                        onChange={(e) => setInterestPercentage(e.target.value)}
                        placeholder="1.00"
                        className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 text-neutral-100 placeholder-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                      />
                    </div>
                  </div>

                  {/* Mensagens */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Mensagens no Boleto
                    </label>
                    {messages.map((msg, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={msg}
                          onChange={(e) => updateMessage(index, e.target.value)}
                          placeholder={`Mensagem ${index + 1}`}
                          maxLength={80}
                          className="flex-1 px-4 py-2 bg-neutral-800/50 border border-neutral-700 text-neutral-100 placeholder-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                        />
                        {messages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMessage(index)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {messages.length < 5 && (
                      <button
                        type="button"
                        onClick={addMessage}
                        className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        + Adicionar mensagem
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-neutral-700">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-neutral-800/50 border border-neutral-700 text-neutral-300 rounded-lg font-medium hover:bg-neutral-800/70 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-900 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Criando..." : "Criar Boleto"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
