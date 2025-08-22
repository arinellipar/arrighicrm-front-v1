// src/components/forms/ContratoForm.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  AlertCircle,
  FileText,
  Users,
  Calendar,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useForm } from "@/contexts/FormContext";
import {
  Contrato,
  CreateContratoDTO,
  UpdateContratoDTO,
  Cliente,
  Consultor,
  SituacaoContratoOptions,
  SituacaoContrato,
} from "@/types/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ContratoFormProps {
  contrato?: Contrato | null;
  clientes: Cliente[];
  consultores: Consultor[];
  onSubmit: (
    data: CreateContratoDTO | Partial<UpdateContratoDTO>
  ) => Promise<void>;
  onCancel: () => void;
}

export default function ContratoForm({
  contrato,
  clientes,
  consultores,
  onSubmit,
  onCancel,
}: ContratoFormProps) {
  const { isFormOpen } = useForm();
  const [formData, setFormData] = useState<CreateContratoDTO>({
    clienteId: 0,
    consultorId: 0,
    situacao: "Leed" as SituacaoContrato,
    dataUltimoContato: new Date().toISOString().split("T")[0],
    dataProximoContato: "",
    valorDevido: 0,
    valorNegociado: undefined,
    observacoes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (contrato) {
      setFormData({
        clienteId: contrato.clienteId,
        consultorId: contrato.consultorId,
        situacao: contrato.situacao,
        dataUltimoContato: contrato.dataUltimoContato
          ? contrato.dataUltimoContato.split("T")[0]
          : new Date().toISOString().split("T")[0],
        dataProximoContato: contrato.dataProximoContato
          ? contrato.dataProximoContato.split("T")[0]
          : "",
        valorDevido: contrato.valorDevido,
        valorNegociado: contrato.valorNegociado,
        observacoes: contrato.observacoes || "",
      });
    } else {
      // Definir data próximo contato como 3 dias no futuro por padrão
      const proximoContato = new Date();
      proximoContato.setDate(proximoContato.getDate() + 3);
      setFormData((prev) => ({
        ...prev,
        dataProximoContato: proximoContato.toISOString().split("T")[0],
      }));
    }
  }, [contrato]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clienteId || formData.clienteId === 0) {
      newErrors.clienteId = "Cliente é obrigatório";
    }

    if (!formData.consultorId || formData.consultorId === 0) {
      newErrors.consultorId = "Consultor é obrigatório";
    }

    if (!formData.situacao) {
      newErrors.situacao = "Situação é obrigatória";
    }

    if (!formData.dataUltimoContato) {
      newErrors.dataUltimoContato = "Data do último contato é obrigatória";
    }

    if (!formData.dataProximoContato) {
      newErrors.dataProximoContato = "Data do próximo contato é obrigatória";
    } else {
      const proximoContato = new Date(formData.dataProximoContato);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (proximoContato < hoje) {
        newErrors.dataProximoContato =
          "Data do próximo contato deve ser futura";
      }
    }

    if (!formData.valorDevido || formData.valorDevido <= 0) {
      newErrors.valorDevido = "Valor devido deve ser maior que zero";
    }

    if (formData.valorNegociado && formData.valorNegociado < 0) {
      newErrors.valorNegociado = "Valor negociado não pode ser negativo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      onCancel();
    } catch (error) {
      console.error("Erro ao salvar contrato:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Função para formatar valor monetário
  const formatCurrencyInput = (value: number | undefined) => {
    if (!value) return "";
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Função para fazer parse do valor monetário
  const parseCurrencyInput = (value: string) => {
    if (!value) return 0;
    // Remove pontos e substitui vírgula por ponto
    const cleanValue = value.replace(/\./g, "").replace(",", ".");
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (name === "valorDevido" || name === "valorNegociado") {
      // Tratamento especial para valores monetários
      const parsedValue = parseCurrencyInput(value);
      setFormData((prev) => ({
        ...prev,
        [name]: parsedValue,
      }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <AnimatePresence>
      {isFormOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="contrato-form-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            key="contrato-form-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      {contrato ? "Editar Contrato" : "Novo Contrato"}
                    </h2>
                  </div>
                  <button
                    onClick={onCancel}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
                  {/* Cliente e Consultor */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Cliente *
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <select
                          name="clienteId"
                          value={formData.clienteId}
                          onChange={handleInputChange}
                          className={cn(
                            "w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all",
                            errors.clienteId
                              ? "border-red-300 bg-red-50"
                              : "border-neutral-200"
                          )}
                        >
                          <option value={0}>Selecione um cliente</option>
                          {clientes.map((cliente) => (
                            <option key={cliente.id} value={cliente.id}>
                              {cliente.pessoaFisica?.nome ||
                                cliente.pessoaJuridica?.razaoSocial}{" "}
                              -
                              {cliente.pessoaFisica?.cpf ||
                                cliente.pessoaJuridica?.cnpj}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.clienteId && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.clienteId}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Consultor *
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <select
                          name="consultorId"
                          value={formData.consultorId}
                          onChange={handleInputChange}
                          className={cn(
                            "w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all",
                            errors.consultorId
                              ? "border-red-300 bg-red-50"
                              : "border-neutral-200"
                          )}
                        >
                          <option value={0}>Selecione um consultor</option>
                          {consultores.map((consultor) => (
                            <option key={consultor.id} value={consultor.id}>
                              {consultor.pessoaFisica?.nome || consultor.nome} -
                              {consultor.filial}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.consultorId && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.consultorId}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Situação */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Situação *
                    </label>
                    <select
                      name="situacao"
                      value={formData.situacao}
                      onChange={handleInputChange}
                      className={cn(
                        "w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all",
                        errors.situacao
                          ? "border-red-300 bg-red-50"
                          : "border-neutral-200"
                      )}
                    >
                      {SituacaoContratoOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.situacao && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.situacao}
                      </p>
                    )}
                  </div>

                  {/* Datas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Data Último Contato *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="date"
                          name="dataUltimoContato"
                          value={formData.dataUltimoContato}
                          onChange={handleInputChange}
                          className={cn(
                            "w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all",
                            errors.dataUltimoContato
                              ? "border-red-300 bg-red-50"
                              : "border-neutral-200"
                          )}
                        />
                      </div>
                      {errors.dataUltimoContato && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.dataUltimoContato}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Data Próximo Contato *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="date"
                          name="dataProximoContato"
                          value={formData.dataProximoContato}
                          onChange={handleInputChange}
                          className={cn(
                            "w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all",
                            errors.dataProximoContato
                              ? "border-red-300 bg-red-50"
                              : "border-neutral-200"
                          )}
                        />
                      </div>
                      {errors.dataProximoContato && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.dataProximoContato}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Valores */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Valor Devido *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-400">
                          R$
                        </span>
                        <input
                          type="text"
                          name="valorDevido"
                          value={formatCurrencyInput(formData.valorDevido)}
                          onChange={handleInputChange}
                          className={cn(
                            "w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all",
                            errors.valorDevido
                              ? "border-red-300 bg-red-50"
                              : "border-neutral-200"
                          )}
                          placeholder="0,00"
                        />
                      </div>
                      {errors.valorDevido && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.valorDevido}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Valor Negociado
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-400">
                          R$
                        </span>
                        <input
                          type="text"
                          name="valorNegociado"
                          value={formatCurrencyInput(formData.valorNegociado)}
                          onChange={handleInputChange}
                          className={cn(
                            "w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all",
                            errors.valorNegociado
                              ? "border-red-300 bg-red-50"
                              : "border-neutral-200"
                          )}
                          placeholder="0,00"
                        />
                      </div>
                      {errors.valorNegociado && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.valorNegociado}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Observações
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                      <textarea
                        name="observacoes"
                        value={formData.observacoes}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                        placeholder="Adicione observações sobre o contrato..."
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-neutral-200">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCancel}
                    className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg font-medium transition-colors"
                    disabled={submitting}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={submitting}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {contrato ? "Atualizar" : "Criar"} Contrato
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
