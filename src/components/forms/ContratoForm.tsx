// src/components/forms/ContratoForm.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  FolderOpen,
  Briefcase,
  Target,
  Percent,
  DollarSign,
  CreditCard,
  Clock,
  Paperclip,
  AlertTriangle,
} from "lucide-react";
import { useForm } from "@/contexts/FormContext";
import ClientePickerModal from "@/components/ClientePickerModal";
import {
  Contrato,
  CreateContratoDTO,
  UpdateContratoDTO,
  Cliente,
  Consultor,
  Parceiro,
  SituacaoContratoOptions,
  SituacaoContrato,
  TipoServicoOptions,
} from "@/types/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useParceiros } from "@/hooks/useParceiros";

interface ContratoFormProps {
  contrato?: Contrato | null;
  clientes: Cliente[];
  consultores: Consultor[];
  contratos: Contrato[];
  onSubmit: (
    data: CreateContratoDTO | Partial<UpdateContratoDTO>
  ) => Promise<void>;
  onCancel: () => void;
  initialClienteId?: number;
}

export default function ContratoForm({
  contrato,
  clientes,
  consultores,
  contratos,
  onSubmit,
  onCancel,
  initialClienteId,
}: ContratoFormProps) {
  const { isFormOpen } = useForm();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ordenar consultores alfabeticamente por nome
  const consultoresOrdenados = [...consultores].sort((a, b) => {
    const nomeA = (a.pessoaFisica?.nome || a.nome || "").toLowerCase();
    const nomeB = (b.pessoaFisica?.nome || b.nome || "").toLowerCase();
    return nomeA.localeCompare(nomeB, "pt-BR");
  });

  // Função para obter estado inicial limpo
  const getInitialFormData = (): CreateContratoDTO => {
    // Definir data próximo contato como 3 dias no futuro por padrão
    const proximoContato = new Date();
    proximoContato.setDate(proximoContato.getDate() + 3);

    return {
      clienteId: initialClienteId || 0,
      consultorId: 0,
      parceiroId: undefined,
      situacao: "Leed" as SituacaoContrato,
      dataUltimoContato: new Date().toISOString().split("T")[0],
      dataProximoContato: proximoContato.toISOString().split("T")[0],
      valorDevido: 0,
      valorNegociado: undefined,
      observacoes: "",
      // Novos campos SEMPRE LIMPOS para novo contrato
      numeroPasta: "",
      dataFechamentoContrato: "",
      tipoServico: "",
      objetoContrato: "",
      comissao: undefined,
      valorEntrada: undefined,
      valorParcela: undefined,
      numeroParcelas: undefined,
      primeiroVencimento: "",
      anexoDocumento: "",
      pendencias: "",
    };
  };

  const [formData, setFormData] = useState<CreateContratoDTO>({
    ...getInitialFormData(),
    parceiroId: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showClientePicker, setShowClientePicker] = useState(false);
  const [hasParceiro, setHasParceiro] = useState(false);

  // Usar hook de parceiros
  const {
    parceiros,
    loading: loadingParceiros,
    error: errorParceiros,
    fetchParceiros,
  } = useParceiros();
  // Estados controlados para inputs de moeda (permite digitação livre e parse no blur/submit)
  const [valorDevidoText, setValorDevidoText] = useState<string>("");
  const [valorNegociadoText, setValorNegociadoText] = useState<string>("");
  const [comissaoText, setComissaoText] = useState<string>("");
  const [valorEntradaText, setValorEntradaText] = useState<string>("");
  const [valorParcelaText, setValorParcelaText] = useState<string>("");

  // Função para resetar completamente o formulário
  const resetForm = () => {
    console.log("🔧 ContratoForm: Resetando formulário completamente");
    setFormData({ ...getInitialFormData(), parceiroId: undefined });
    setValorDevidoText("");
    setValorNegociadoText("");
    setComissaoText("");
    setValorEntradaText("");
    setValorParcelaText("");
    setErrors({});
    setHasParceiro(false);
  };

  // Resetar formulário quando o componente for montado sem contrato
  useEffect(() => {
    if (!contrato) {
      resetForm();
    }
  }, []); // Executar apenas uma vez na montagem

  useEffect(() => {
    if (contrato) {
      console.log("🔧 ContratoForm: Recebido contrato para edição:", contrato);

      // Log detalhado de cada campo para identificar nulls
      console.log("🔧 ContratoForm: Análise detalhada dos campos:", {
        id: contrato.id,
        clienteId: contrato.clienteId,
        consultorId: contrato.consultorId,
        situacao: contrato.situacao,
        dataUltimoContato: contrato.dataUltimoContato,
        dataProximoContato: contrato.dataProximoContato,
        valorDevido: contrato.valorDevido,
        valorNegociado: contrato.valorNegociado,
        observacoes: contrato.observacoes,
        numeroPasta: contrato.numeroPasta,
        dataFechamentoContrato: contrato.dataFechamentoContrato,
        tipoServico: contrato.tipoServico,
        objetoContrato: contrato.objetoContrato,
        comissao: contrato.comissao,
        valorEntrada: contrato.valorEntrada,
        valorParcela: contrato.valorParcela,
        numeroParcelas: contrato.numeroParcelas,
        primeiroVencimento: contrato.primeiroVencimento,
        anexoDocumento: contrato.anexoDocumento,
        pendencias: contrato.pendencias,
      });
      setFormData({
        clienteId: contrato.clienteId,
        consultorId: contrato.consultorId,
        parceiroId: contrato.parceiroId,
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
        // Novos campos
        numeroPasta: contrato.numeroPasta || "",
        dataFechamentoContrato: contrato.dataFechamentoContrato
          ? contrato.dataFechamentoContrato.split("T")[0]
          : "",
        tipoServico: contrato.tipoServico || "",
        objetoContrato: contrato.objetoContrato || "",
        comissao: contrato.comissao,
        valorEntrada: contrato.valorEntrada,
        valorParcela: contrato.valorParcela,
        numeroParcelas: contrato.numeroParcelas,
        primeiroVencimento: contrato.primeiroVencimento
          ? contrato.primeiroVencimento.split("T")[0]
          : "",
        anexoDocumento: contrato.anexoDocumento || "",
        pendencias: contrato.pendencias || "",
      });
      setHasParceiro(!!contrato.parceiroId);
      const valorDevidoFormatted = formatCurrencyInput(contrato.valorDevido);
      const valorNegociadoFormatted = formatCurrencyInput(
        contrato.valorNegociado
      );
      const comissaoFormatted = formatCurrencyInput(contrato.comissao);
      const valorEntradaFormatted = formatCurrencyInput(contrato.valorEntrada);
      const valorParcelaFormatted = formatCurrencyInput(contrato.valorParcela);

      console.log("🔧 ContratoForm: Valores formatados:", {
        valorDevido: `${contrato.valorDevido} -> ${valorDevidoFormatted}`,
        valorNegociado: `${contrato.valorNegociado} -> ${valorNegociadoFormatted}`,
        comissao: `${contrato.comissao} -> ${comissaoFormatted}`,
        valorEntrada: `${contrato.valorEntrada} -> ${valorEntradaFormatted}`,
        valorParcela: `${contrato.valorParcela} -> ${valorParcelaFormatted}`,
      });

      setValorDevidoText(valorDevidoFormatted);
      setValorNegociadoText(valorNegociadoFormatted);
      setComissaoText(comissaoFormatted);
      setValorEntradaText(valorEntradaFormatted);
      setValorParcelaText(valorParcelaFormatted);

      console.log("🔧 ContratoForm: FormData definido:", {
        clienteId: contrato.clienteId,
        consultorId: contrato.consultorId,
        situacao: contrato.situacao,
        valorDevido: contrato.valorDevido,
        valorNegociado: contrato.valorNegociado,
        dataUltimoContato: contrato.dataUltimoContato,
        dataProximoContato: contrato.dataProximoContato,
        observacoes: contrato.observacoes,
        // Novos campos
        tipoServico: contrato.tipoServico,
        dataFechamentoContrato: contrato.dataFechamentoContrato,
        objetoContrato: contrato.objetoContrato,
        numeroPasta: contrato.numeroPasta,
        comissao: contrato.comissao,
        valorEntrada: contrato.valorEntrada,
        valorParcela: contrato.valorParcela,
        numeroParcelas: contrato.numeroParcelas,
        primeiroVencimento: contrato.primeiroVencimento,
        anexoDocumento: contrato.anexoDocumento,
        pendencias: contrato.pendencias,
      });

      console.log("🔧 ContratoForm: Estados de texto definidos:", {
        valorDevidoText: valorDevidoFormatted,
        valorNegociadoText: valorNegociadoFormatted,
        comissaoText: comissaoFormatted,
        valorEntradaText: valorEntradaFormatted,
        valorParcelaText: valorParcelaFormatted,
      });

      // Log específico dos campos mencionados pelo usuário
      console.log("🔧 ContratoForm: Campos específicos para edição:", {
        tipoServico: contrato.tipoServico,
        dataFechamentoContrato: contrato.dataFechamentoContrato,
        valorEntrada: contrato.valorEntrada,
        valorParcela: contrato.valorParcela,
        numeroParcelas: contrato.numeroParcelas,
        primeiroVencimento: contrato.primeiroVencimento,
        comissao: contrato.comissao,
        anexoDocumento: contrato.anexoDocumento,
        pendencias: contrato.pendencias,
      });

      console.log(
        "🔧 ContratoForm: Todos os campos do contrato recebido:",
        contrato
      );
    } else {
      // NOVO CONTRATO: Resetar TODOS os campos para valores em branco/padrão
      console.log(
        "🔧 ContratoForm: Configurando NOVO contrato - limpando todos os campos"
      );

      // Definir data próximo contato como 3 dias no futuro por padrão
      const proximoContato = new Date();
      proximoContato.setDate(proximoContato.getDate() + 3);

      // Resetar formData completamente para novo contrato
      setFormData({
        clienteId: initialClienteId || 0,
        consultorId: 0,
        situacao: "Leed" as SituacaoContrato,
        dataUltimoContato: new Date().toISOString().split("T")[0],
        dataProximoContato: proximoContato.toISOString().split("T")[0],
        valorDevido: 0,
        valorNegociado: undefined,
        observacoes: "",
        // Novos campos LIMPOS
        numeroPasta: "",
        dataFechamentoContrato: "",
        tipoServico: "",
        objetoContrato: "",
        comissao: undefined,
        valorEntrada: undefined,
        valorParcela: undefined,
        numeroParcelas: undefined,
        primeiroVencimento: "",
        anexoDocumento: "",
        pendencias: "",
      });

      // Limpar TODOS os textos de moeda para novo contrato
      setValorDevidoText("");
      setValorNegociadoText("");
      setComissaoText("");
      setValorEntradaText("");
      setValorParcelaText("");

      // Limpar erros
      setErrors({});

      console.log(
        "🔧 ContratoForm: Novo contrato configurado - todos os campos limpos"
      );
    }
  }, [contrato, initialClienteId]);

  // Debug: Monitorar mudanças nos valores
  useEffect(() => {
    console.log("🔧 ContratoForm: FormData atual:", {
      valorDevido: formData.valorDevido,
      valorNegociado: formData.valorNegociado,
      dataUltimoContato: formData.dataUltimoContato,
      dataProximoContato: formData.dataProximoContato,
      observacoes: formData.observacoes,
      tipoServico: formData.tipoServico,
      dataFechamentoContrato: formData.dataFechamentoContrato,
      objetoContrato: formData.objetoContrato,
      numeroPasta: formData.numeroPasta,
      comissao: formData.comissao,
      valorEntrada: formData.valorEntrada,
      valorParcela: formData.valorParcela,
      numeroParcelas: formData.numeroParcelas,
      primeiroVencimento: formData.primeiroVencimento,
      anexoDocumento: formData.anexoDocumento,
      pendencias: formData.pendencias,
    });
  }, [
    formData.valorDevido,
    formData.valorNegociado,
    formData.dataUltimoContato,
    formData.dataProximoContato,
    formData.observacoes,
    formData.tipoServico,
    formData.dataFechamentoContrato,
    formData.objetoContrato,
    formData.numeroPasta,
    formData.comissao,
    formData.valorEntrada,
    formData.valorParcela,
    formData.numeroParcelas,
    formData.primeiroVencimento,
    formData.anexoDocumento,
    formData.pendencias,
  ]);

  useEffect(() => {
    console.log("🔧 ContratoForm: Estados de texto atuais:", {
      valorDevidoText,
      valorNegociadoText,
      comissaoText,
      valorEntradaText,
      valorParcelaText,
    });
  }, [
    valorDevidoText,
    valorNegociadoText,
    comissaoText,
    valorEntradaText,
    valorParcelaText,
  ]);

  // Log dos parceiros para debug
  useEffect(() => {
    console.log("🔧 ContratoForm: Parceiros carregados:", parceiros.length);
    console.log("🔧 ContratoForm: Loading parceiros:", loadingParceiros);
    console.log("🔧 ContratoForm: Erro parceiros:", errorParceiros);
  }, [parceiros, loadingParceiros, errorParceiros]);

  // Pré-selecionar automaticamente o consultor ativo do cliente ou o primeiro disponível
  useEffect(() => {
    if (!contrato && formData.consultorId === 0 && consultores.length > 0) {
      // Se há um cliente selecionado, verificar se ele já tem consultor ativo
      if (formData.clienteId && formData.clienteId !== 0) {
        const contratosDoCliente = contratos.filter(
          (c) => c.clienteId === formData.clienteId && c.ativo
        );
        const consultorAtivoId = contratosDoCliente.find((contrato) => {
          const consultorDoContrato = consultores.find(
            (c) => c.id === contrato.consultorId
          );
          return consultorDoContrato && consultorDoContrato.ativo;
        })?.consultorId;

        if (consultorAtivoId) {
          setFormData((prev) => ({ ...prev, consultorId: consultorAtivoId }));
          return;
        }
      }

      // Senão, pré-selecionar o primeiro consultor ativo disponível
      const consultorAtivo = consultores.find((c) => c.ativo);
      if (consultorAtivo) {
        setFormData((prev) => ({ ...prev, consultorId: consultorAtivo.id }));
      }
    }
  }, [
    contrato,
    consultores,
    formData.consultorId,
    formData.clienteId,
    contratos,
  ]);

  // Manipular mudança do checkbox de parceiro
  const handleParceiroCheckboxChange = (checked: boolean) => {
    console.log("🔧 ContratoForm: Checkbox parceiro alterado:", checked);
    console.log("🔧 ContratoForm: Parceiros disponíveis:", parceiros.length);
    setHasParceiro(checked);
    if (!checked) {
      // Se desmarcar, limpar o parceiroId
      setFormData((prev) => ({ ...prev, parceiroId: undefined }));
    } else {
      // Se não há parceiros carregados, tentar buscar novamente
      if (parceiros.length === 0) {
        console.log("🔧 ContratoForm: Nenhum parceiro carregado, buscando...");
        fetchParceiros();
      }
    }
  };

  // Manipular seleção de parceiro
  const handleParceiroSelect = (parceiroId: number) => {
    setFormData((prev) => ({
      ...prev,
      parceiroId: parceiroId === 0 ? undefined : parceiroId,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar se arrays são válidos
    if (!clientes || !Array.isArray(clientes) || clientes.length === 0) {
      newErrors.general = "Nenhum cliente disponível. Por favor, cadastre um cliente primeiro.";
      setErrors(newErrors);
      return false;
    }

    if (!consultores || !Array.isArray(consultores) || consultores.length === 0) {
      newErrors.general = "Nenhum consultor disponível. Por favor, cadastre um consultor primeiro.";
      setErrors(newErrors);
      return false;
    }

    if (!formData.clienteId || formData.clienteId === 0) {
      newErrors.clienteId = "Cliente é obrigatório";
    }

    if (!formData.consultorId || formData.consultorId === 0) {
      newErrors.consultorId = "Consultor é obrigatório";
    } else if (formData.clienteId && formData.clienteId !== 0) {
      // Verificar se o cliente já tem um consultor ativo (para novos contratos e edição)
      {
        const consultorSelecionado = consultores.find(
          (c) => c && c.id && c.id === formData.consultorId
        );

        // Verificar se o consultor selecionado existe e está ativo
        if (!consultorSelecionado) {
          newErrors.consultorId = "Consultor selecionado não encontrado. Por favor, selecione outro consultor.";
        } else if (!consultorSelecionado.ativo) {
          newErrors.consultorId =
            "O consultor selecionado está inativo. Selecione um consultor ativo.";
        } else {
          // Para edição: filtrar contratos excluindo o contrato atual sendo editado
          // Validar se contratos é um array válido
          const contratosValidos = contratos && Array.isArray(contratos) ? contratos : [];
          const contratosDoCliente = contratosValidos.filter(
            (c) =>
              c &&
              c.clienteId === formData.clienteId &&
              c.ativo &&
              (contrato ? c.id !== contrato.id : true) // Excluir contrato atual se editando
          );

          // Verificar se há outros contratos ativos com consultores ativos
          const contratoComConsultorAtivo = contratosDoCliente.find(
            (contratoItem) => {
              if (!contratoItem || !contratoItem.consultorId) return false;
              const consultorDoContrato = consultores.find(
                (c) => c && c.id && c.id === contratoItem.consultorId
              );
              return consultorDoContrato && consultorDoContrato.ativo;
            }
          );

          if (contratoComConsultorAtivo) {
            const consultorAtualId = contratoComConsultorAtivo.consultorId;

            // Garantir comparação correta (convertendo ambos para números)
            const consultorAtualNumero = Number(consultorAtualId);
            const consultorSelecionadoNumero = Number(formData.consultorId);

            if (consultorAtualNumero !== consultorSelecionadoNumero) {
              const consultorAtual = consultores.find(
                (c) => c.id === consultorAtualId
              );
              const tipoOperacao = contrato ? "editar" : "criar";
              newErrors.consultorId = `Este cliente já possui um consultor ativo: ${
                consultorAtual?.pessoaFisica?.nome ||
                consultorAtual?.nome ||
                "Consultor"
              }. Para ${tipoOperacao} contrato com consultor diferente, o consultor atual deve estar inativo.`;
            }
          }
        }
      }
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

    // ✅ Validar tamanho das observações
    if (formData.observacoes && formData.observacoes.length > 1000) {
      newErrors.observacoes = `Observações muito longas (${formData.observacoes.length}/1000 caracteres)`;
    }

    const parsedDevido = parseCurrencyInput(valorDevidoText || "0", true);
    const parsedNegociado = valorNegociadoText
      ? parseCurrencyInput(valorNegociadoText, true)
      : undefined;

    // Validar se o parse foi bem-sucedido
    if (isNaN(parsedDevido) || parsedDevido <= 0) {
      newErrors.valorDevido = "Valor devido deve ser maior que zero";
    }

    if (parsedNegociado !== undefined) {
      if (isNaN(parsedNegociado)) {
        newErrors.valorNegociado = "Valor negociado inválido";
      } else if (parsedNegociado < 0) {
        newErrors.valorNegociado = "Valor negociado não pode ser negativo";
      }
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
      // Sincronizar valores numéricos a partir dos textos antes de enviar
      // Validar valores antes de enviar
      const parsedDevido = parseCurrencyInput(valorDevidoText || "0", true);
      if (isNaN(parsedDevido) || parsedDevido <= 0) {
        setErrors({ valorDevido: "Valor devido deve ser maior que zero" });
        setSubmitting(false);
        return;
      }

      const payload: CreateContratoDTO = {
        ...formData,
        valorDevido: parsedDevido,
        valorNegociado:
          valorNegociadoText && valorNegociadoText.trim() !== ""
            ? (() => {
                const parsed = parseCurrencyInput(valorNegociadoText, true);
                return isNaN(parsed) ? undefined : parsed;
              })()
            : undefined,
        comissao:
          comissaoText && comissaoText.trim() !== ""
            ? (() => {
                const parsed = parseCurrencyInput(comissaoText, true);
                return isNaN(parsed) ? undefined : parsed;
              })()
            : undefined,
        valorEntrada:
          valorEntradaText && valorEntradaText.trim() !== ""
            ? (() => {
                const parsed = parseCurrencyInput(valorEntradaText, true);
                return isNaN(parsed) ? undefined : parsed;
              })()
            : undefined,
        valorParcela:
          valorParcelaText && valorParcelaText.trim() !== ""
            ? (() => {
                const parsed = parseCurrencyInput(valorParcelaText, true);
                return isNaN(parsed) ? undefined : parsed;
              })()
            : undefined,
        // Limpar campos opcionais vazios
        numeroPasta: formData.numeroPasta?.trim() || undefined,
        dataFechamentoContrato: formData.dataFechamentoContrato || undefined,
        tipoServico: formData.tipoServico?.trim() || undefined,
        objetoContrato: formData.objetoContrato?.trim() || undefined,
        primeiroVencimento: formData.primeiroVencimento || undefined,
        anexoDocumento: formData.anexoDocumento?.trim() || undefined,
        pendencias: formData.pendencias?.trim() || undefined,
        observacoes: formData.observacoes?.trim() || undefined,
        numeroParcelas: formData.numeroParcelas || undefined,
      };
      await onSubmit(payload);
      onCancel();
    } catch (error: any) {
      console.error("🔧 ContratoForm: Erro ao salvar contrato:", error);

      // Extrair mensagem de erro mais específica
      let errorMessage = "Erro desconhecido ao salvar contrato";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.title) {
        errorMessage = error.response.data.title;
      }

      console.error(
        "🔧 ContratoForm: Mensagem de erro processada:",
        errorMessage
      );

      // Adicionar erro para o campo geral
      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));
    } finally {
      setSubmitting(false);
    }
  };

  // Função para formatar valor monetário
  const formatCurrencyInput = (value: number | undefined) => {
    if (value === undefined || value === null) return "";
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Função para fazer parse do valor monetário
  const parseCurrencyInput = (value: string, allowNaN: boolean = false): number => {
    if (!value || typeof value !== "string") return allowNaN ? NaN : 0;
    // Remove pontos e substitui vírgula por ponto
    const cleanValue = value.replace(/\./g, "").replace(",", ".").trim();
    if (!cleanValue) return allowNaN ? NaN : 0;
    const parsed = parseFloat(cleanValue);
    // Retornar NaN apenas se allowNaN for true (para validação), senão retornar 0
    return isNaN(parsed) ? (allowNaN ? NaN : 0) : parsed;
  };

  // Máscara amigável de moeda pt-BR durante digitação (milhares com ponto e decimais com vírgula)
  const maskCurrencyBR = (text: string): string => {
    if (!text) return "";
    // Retirar tudo que não for dígito ou vírgula
    const only = text.replace(/[^\d,]/g, "");
    const parts = only.split(",");
    const intDigits = parts[0].replace(/\D/g, "");
    const decDigits = (parts[1] || "").replace(/\D/g, "").slice(0, 2);
    if (!intDigits) return decDigits ? `,${decDigits}` : "";
    const intFormatted = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.length > 1 ? `${intFormatted},${decDigits}` : intFormatted;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (name === "valorDevido") {
      setValorDevidoText(maskCurrencyBR(value));
      return;
    } else if (name === "valorNegociado") {
      setValorNegociadoText(maskCurrencyBR(value));
      return;
    } else if (name === "comissao") {
      setComissaoText(maskCurrencyBR(value));
      return;
    } else if (name === "valorEntrada") {
      setValorEntradaText(maskCurrencyBR(value));
      return;
    } else if (name === "valorParcela") {
      setValorParcelaText(maskCurrencyBR(value));
      return;
    } else if (type === "file" && name === "anexoDocumento") {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validar se é PDF
        if (file.type !== "application/pdf") {
          setErrors((prev) => ({
            ...prev,
            anexoDocumento: "Apenas arquivos PDF são permitidos",
          }));
          return;
        }

        // Validar tamanho (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setErrors((prev) => ({
            ...prev,
            anexoDocumento: "Arquivo deve ter no máximo 10MB",
          }));
          return;
        }

        // Armazenar o nome do arquivo
        setFormData((prev) => ({
          ...prev,
          anexoDocumento: file.name,
        }));
      }
      return;
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

  const handleCurrencyBlur = (
    field:
      | "valorDevido"
      | "valorNegociado"
      | "comissao"
      | "valorEntrada"
      | "valorParcela"
  ) => {
    if (field === "valorDevido") {
      const parsed = parseCurrencyInput(valorDevidoText || "0");
      setFormData((prev) => ({ ...prev, valorDevido: parsed }));
      setValorDevidoText(formatCurrencyInput(parsed));
    } else if (field === "valorNegociado") {
      if (!valorNegociadoText || valorNegociadoText.trim() === "") {
        setFormData((prev) => ({ ...prev, valorNegociado: undefined }));
        setValorNegociadoText("");
        return;
      }
      const parsed = parseCurrencyInput(valorNegociadoText);
      setFormData((prev) => ({ ...prev, valorNegociado: parsed }));
      setValorNegociadoText(formatCurrencyInput(parsed));
    } else if (field === "comissao") {
      if (!comissaoText || comissaoText.trim() === "") {
        setFormData((prev) => ({ ...prev, comissao: undefined }));
        setComissaoText("");
        return;
      }
      const parsed = parseCurrencyInput(comissaoText);
      setFormData((prev) => ({ ...prev, comissao: parsed }));
      setComissaoText(formatCurrencyInput(parsed));
    } else if (field === "valorEntrada") {
      if (!valorEntradaText || valorEntradaText.trim() === "") {
        setFormData((prev) => ({ ...prev, valorEntrada: undefined }));
        setValorEntradaText("");
        return;
      }
      const parsed = parseCurrencyInput(valorEntradaText);
      setFormData((prev) => ({ ...prev, valorEntrada: parsed }));
      setValorEntradaText(formatCurrencyInput(parsed));
    } else if (field === "valorParcela") {
      if (!valorParcelaText || valorParcelaText.trim() === "") {
        setFormData((prev) => ({ ...prev, valorParcela: undefined }));
        setValorParcelaText("");
        return;
      }
      const parsed = parseCurrencyInput(valorParcelaText);
      setFormData((prev) => ({ ...prev, valorParcela: parsed }));
      setValorParcelaText(formatCurrencyInput(parsed));
    }
  };

  const selectedCliente =
    clientes && Array.isArray(clientes)
      ? clientes.find((c) => c && c.id === formData.clienteId) || null
      : null;

  if (!mounted) return null;

  // Validar se há dados necessários antes de renderizar
  const hasRequiredData =
    clientes &&
    Array.isArray(clientes) &&
    clientes.length > 0 &&
    consultores &&
    Array.isArray(consultores) &&
    consultores.length > 0;

  const modalContent = (
    <AnimatePresence>
      {isFormOpen && hasRequiredData && (
        <>
          {/* Overlay */}
          <motion.div
            key="contrato-form-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[99999]"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            key="contrato-form-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-[99999] p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden">
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
                {/* Erro Geral */}
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <p className="text-sm text-red-700 font-medium">
                        {errors.general}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-6 max-h-[calc(95vh-200px)] overflow-y-auto">
                  {/* Cliente e Consultor */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Cliente *
                      </label>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setShowClientePicker(true)}
                          className={cn(
                            "w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border rounded-lg text-sm",
                            "hover:bg-neutral-50 transition-colors",
                            errors.clienteId
                              ? "border-red-300 bg-red-50"
                              : "border-neutral-200"
                          )}
                        >
                          <Users className="w-4 h-4 text-neutral-500" />
                          {selectedCliente
                            ? selectedCliente.pessoaFisica?.nome ||
                              selectedCliente.pessoaJuridica?.razaoSocial
                            : "Selecionar cliente (duplo clique)"}
                        </button>
                        {selectedCliente && (
                          <div className="rounded-lg border border-neutral-200 p-4 bg-neutral-50 text-xs text-neutral-700">
                            <div className="space-y-3">
                              <div>
                                <span className="font-medium text-neutral-800">
                                  Email:{" "}
                                </span>
                                <span className="text-neutral-600">
                                  {selectedCliente.pessoaFisica
                                    ?.emailEmpresarial ||
                                    selectedCliente.pessoaJuridica?.email ||
                                    "—"}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-neutral-800">
                                  CPF/CNPJ:{" "}
                                </span>
                                <span className="text-neutral-600">
                                  {selectedCliente.pessoaFisica?.cpf ||
                                    selectedCliente.pessoaJuridica?.cnpj ||
                                    "—"}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-neutral-800">
                                  Telefones:{" "}
                                </span>
                                <div className="mt-1 space-y-1">
                                  {[
                                    selectedCliente.pessoaFisica?.telefone1 ||
                                      selectedCliente.pessoaJuridica?.telefone1,
                                    selectedCliente.pessoaFisica?.telefone2 ||
                                      selectedCliente.pessoaJuridica?.telefone2,
                                    (selectedCliente as any).telefone3 ||
                                      selectedCliente.pessoaJuridica?.telefone3,
                                    (selectedCliente as any).telefone4 ||
                                      selectedCliente.pessoaJuridica?.telefone4,
                                  ]
                                    .filter(Boolean)
                                    .map((telefone, index) => (
                                      <div
                                        key={index}
                                        className="text-neutral-600"
                                      >
                                        {telefone}
                                      </div>
                                    )) || (
                                    <span className="text-neutral-600">—</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
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
                            "w-full pl-12 pr-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all",
                            errors.consultorId
                              ? "border-red-300 bg-red-50"
                              : "border-neutral-200"
                          )}
                        >
                          <option value={0}>
                            {consultoresOrdenados.length === 0
                              ? "Carregando consultores..."
                              : "Selecione um consultor"}
                          </option>
                          {consultoresOrdenados.map((consultor) => (
                            <option
                              key={consultor.id}
                              value={consultor.id}
                              disabled={!consultor.ativo}
                            >
                              {consultor.pessoaFisica?.nome || consultor.nome} -{" "}
                              {consultor.filial?.nome || "Filial não informada"}
                              {!consultor.ativo && " (INATIVO)"}
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
                      {/* Mostrar consultor atual do cliente */}
                      {formData.clienteId &&
                        formData.clienteId !== 0 &&
                        !contrato &&
                        (() => {
                          const contratosDoCliente = contratos.filter(
                            (c) => c.clienteId === formData.clienteId && c.ativo
                          );
                          const consultorAtivo = contratosDoCliente.find(
                            (contrato) => {
                              const consultorDoContrato = consultores.find(
                                (c) => c.id === contrato.consultorId
                              );
                              return (
                                consultorDoContrato && consultorDoContrato.ativo
                              );
                            }
                          );

                          if (consultorAtivo) {
                            const consultor = consultores.find(
                              (c) => c.id === consultorAtivo.consultorId
                            );
                            return (
                              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs text-blue-800 font-medium">
                                  ℹ️ Consultor atual:{" "}
                                  {consultor?.pessoaFisica?.nome ||
                                    consultor?.nome ||
                                    "Consultor"}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                  Este cliente já possui um consultor ativo.
                                  Novos contratos serão atribuídos ao mesmo
                                  consultor.
                                </p>
                              </div>
                            );
                          }
                          return null;
                        })()}
                    </div>

                    {/* Checkbox de Parceiro */}
                    <div className="mt-4">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasParceiro}
                          onChange={(e) =>
                            handleParceiroCheckboxChange(e.target.checked)
                          }
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                        />
                        <span className="text-sm font-medium text-neutral-700">
                          Há parceiro neste contrato?
                        </span>
                      </label>
                    </div>

                    {/* Seletor de Parceiro */}
                    {hasParceiro && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Parceiro
                        </label>
                        <div className="relative">
                          <select
                            value={formData.parceiroId || ""}
                            onChange={(e) =>
                              handleParceiroSelect(
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          >
                            <option value="">
                              {loadingParceiros
                                ? "Carregando parceiros..."
                                : errorParceiros
                                ? "Erro ao carregar parceiros"
                                : parceiros.length === 0
                                ? "Nenhum parceiro cadastrado"
                                : "Selecione um parceiro"}
                            </option>
                            {parceiros.map((parceiro) => (
                              <option key={parceiro.id} value={parceiro.id}>
                                {parceiro.pessoaFisica?.nome ||
                                  "Nome não informado"}{" "}
                                -{" "}
                                {parceiro.filial?.nome ||
                                  "Filial não informada"}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Situação e Dados Básicos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Número da Pasta
                      </label>
                      <div className="relative">
                        <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          name="numeroPasta"
                          value={formData.numeroPasta}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="P-2025-001"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tipo de Serviço e Data de Fechamento */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Tipo de Serviço
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <select
                          name="tipoServico"
                          value={formData.tipoServico}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        >
                          <option value="">Selecione o tipo de serviço</option>
                          {TipoServicoOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Data de Fechamento do Contrato
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="date"
                          name="dataFechamentoContrato"
                          value={formData.dataFechamentoContrato}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Objeto do Contrato */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Objeto do Contrato
                    </label>
                    <div className="relative">
                      <Target className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                      <textarea
                        name="objetoContrato"
                        value={formData.objetoContrato}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full pl-12 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                        placeholder="Descreva o objeto do contrato..."
                      />
                    </div>
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
                            "w-full pl-12 pr-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all",
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
                            "w-full pl-12 pr-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all",
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

                  {/* Valores Principais */}
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
                          value={valorDevidoText}
                          onChange={handleInputChange}
                          onBlur={() => handleCurrencyBlur("valorDevido")}
                          className={cn(
                            "w-full pl-12 pr-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all",
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
                          value={valorNegociadoText}
                          onChange={handleInputChange}
                          onBlur={() => handleCurrencyBlur("valorNegociado")}
                          className={cn(
                            "w-full pl-12 pr-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all",
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

                  {/* Dados de Pagamento */}
                  <div className="border-t border-neutral-200 pt-6">
                    <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary-600" />
                      Dados de Pagamento
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Valor de Entrada
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-400">
                            R$
                          </span>
                          <input
                            type="text"
                            name="valorEntrada"
                            value={valorEntradaText}
                            onChange={handleInputChange}
                            onBlur={() => handleCurrencyBlur("valorEntrada")}
                            className={cn(
                              "w-full pl-12 pr-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all",
                              errors.valorEntrada
                                ? "border-red-300 bg-red-50"
                                : "border-neutral-200"
                            )}
                            placeholder="0,00"
                          />
                        </div>
                        {errors.valorEntrada && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.valorEntrada}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Valor da Parcela
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-400">
                            R$
                          </span>
                          <input
                            type="text"
                            name="valorParcela"
                            value={valorParcelaText}
                            onChange={handleInputChange}
                            onBlur={() => handleCurrencyBlur("valorParcela")}
                            className={cn(
                              "w-full pl-12 pr-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all",
                              errors.valorParcela
                                ? "border-red-300 bg-red-50"
                                : "border-neutral-200"
                            )}
                            placeholder="0,00"
                          />
                        </div>
                        {errors.valorParcela && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.valorParcela}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Número de Parcelas
                        </label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                          <input
                            type="number"
                            name="numeroParcelas"
                            value={formData.numeroParcelas || ""}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="12"
                            min="1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Primeiro Vencimento
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                          <input
                            type="date"
                            name="primeiroVencimento"
                            value={formData.primeiroVencimento}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Comissão (%)
                        </label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                          <input
                            type="text"
                            name="comissao"
                            value={comissaoText}
                            onChange={handleInputChange}
                            onBlur={() => handleCurrencyBlur("comissao")}
                            className={cn(
                              "w-full pl-12 pr-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all",
                              errors.comissao
                                ? "border-red-300 bg-red-50"
                                : "border-neutral-200"
                            )}
                            placeholder="15,00"
                          />
                        </div>
                        {errors.comissao && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.comissao}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Outros Campos */}
                  <div className="border-t border-neutral-200 pt-6">
                    <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                      <Paperclip className="w-5 h-5 text-primary-600" />
                      Outros Campos
                    </h4>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Anexo de Documento (PDF)
                        </label>
                        <div className="relative">
                          <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 z-30" />
                          <div className="relative overflow-visible">
                            <input
                              type="file"
                              name="anexoDocumento"
                              accept=".pdf"
                              onChange={handleInputChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 hover:cursor-pointer"
                              id="anexoDocumento"
                            />
                            <div
                              className={cn(
                                "w-full pl-12 pr-4 py-2.5 bg-white border rounded-lg text-sm flex items-center justify-between",
                                errors.anexoDocumento
                                  ? "border-red-300 bg-red-50"
                                  : "border-neutral-200"
                              )}
                            >
                              <span className="text-neutral-500">
                                {formData.anexoDocumento ||
                                  "Nenhum arquivo escolhido"}
                              </span>
                              <span className="text-primary-600 font-medium text-xs bg-primary-50 px-3 py-1 rounded">
                                Escolher Arquivo
                              </span>
                            </div>
                          </div>
                        </div>
                        {errors.anexoDocumento && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.anexoDocumento}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-neutral-500">
                          Selecione um arquivo PDF para anexar ao contrato (máx.
                          10MB)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Pendências
                        </label>
                        <div className="relative">
                          <AlertTriangle className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                          <textarea
                            name="pendencias"
                            value={formData.pendencias}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full pl-12 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                            placeholder="Descreva pendências existentes..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <label className="flex items-center justify-between text-sm font-medium text-neutral-700 mb-2">
                      <span>Observações</span>
                      <span
                        className={`text-xs ${
                          formData.observacoes &&
                          formData.observacoes.length > 1000
                            ? "text-red-500 font-bold"
                            : formData.observacoes &&
                              formData.observacoes.length > 900
                            ? "text-orange-500"
                            : "text-neutral-400"
                        }`}
                      >
                        {formData.observacoes?.length || 0}/1000
                      </span>
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                      <textarea
                        name="observacoes"
                        value={formData.observacoes}
                        onChange={handleInputChange}
                        rows={4}
                        maxLength={1000}
                        className={`w-full pl-12 pr-4 py-2.5 bg-white border ${
                          errors.observacoes
                            ? "border-red-300"
                            : "border-neutral-200"
                        } rounded-lg text-sm focus:outline-none focus:ring-2 ${
                          errors.observacoes
                            ? "focus:ring-red-500"
                            : "focus:ring-primary-500"
                        } focus:border-transparent transition-all resize-none`}
                        placeholder="Adicione observações sobre o contrato..."
                      />
                    </div>
                    {errors.observacoes && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.observacoes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-6 pb-20 border-t border-neutral-200">
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

          {/* Seleção de Cliente */}
          <ClientePickerModal
            isOpen={showClientePicker}
            clientes={clientes}
            onClose={() => setShowClientePicker(false)}
            onSelect={(cliente) => {
              setFormData((prev) => ({ ...prev, clienteId: cliente.id }));
              setShowClientePicker(false);
              // limpar erro de cliente se havia
              if (errors.clienteId) {
                setErrors((prev) => {
                  const e = { ...prev };
                  delete e.clienteId;
                  return e;
                });
              }
            }}
          />
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
