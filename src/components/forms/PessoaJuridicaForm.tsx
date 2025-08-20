// src/components/forms/PessoaJuridicaForm.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, X, Loader2 } from "lucide-react";
import {
  CreatePessoaJuridicaDTO,
  UpdatePessoaJuridicaDTO,
  PessoaJuridica,
  ResponsavelTecnicoOption,
} from "@/types/api";
import { cn } from "@/lib/utils";

interface PessoaJuridicaFormProps {
  initialData?: PessoaJuridica | null;
  responsaveisTecnicos: ResponsavelTecnicoOption[];
  onSubmit: (
    data: CreatePessoaJuridicaDTO | UpdatePessoaJuridicaDTO
  ) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

interface FormData {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  responsavelTecnicoId: string;
  email: string;
  telefone1: string;
  telefone2: string;
  endereco: {
    cidade: string;
    bairro: string;
    logradouro: string;
    cep: string;
    numero: string;
    complemento: string;
  };
}

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  isEndereco?: boolean;
  options?: { value: string; label: string }[];
  formatter?: (value: string) => string;
}

const initialFormData: FormData = {
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  responsavelTecnicoId: "",
  email: "",
  telefone1: "",
  telefone2: "",
  endereco: {
    cidade: "",
    bairro: "",
    logradouro: "",
    cep: "",
    numero: "",
    complemento: "",
  },
};

export default function PessoaJuridicaForm({
  initialData,
  responsaveisTecnicos,
  onSubmit,
  onCancel,
  loading = false,
}: PessoaJuridicaFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preencher formulário com dados iniciais se fornecidos
  useEffect(() => {
    if (initialData) {
      setFormData({
        razaoSocial: initialData.razaoSocial,
        nomeFantasia: initialData.nomeFantasia || "",
        cnpj: initialData.cnpj,
        responsavelTecnicoId: initialData.responsavelTecnicoId.toString(),
        email: initialData.email,
        telefone1: initialData.telefone1,
        telefone2: initialData.telefone2 || "",
        endereco: {
          cidade: initialData.endereco.cidade,
          bairro: initialData.endereco.bairro,
          logradouro: initialData.endereco.logradouro,
          cep: initialData.endereco.cep,
          numero: initialData.endereco.numero,
          complemento: initialData.endereco.complemento || "",
        },
      });
    }
  }, [initialData]);

  const handleInputChange = (
    field: string,
    value: string,
    isEndereco = false
  ) => {
    if (isEndereco) {
      setFormData((prev) => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Limpar erro do campo quando começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const formatCNPJ = (value: string) => {
    // Remove tudo que não é dígito
    const onlyNumbers = value.replace(/\D/g, "");

    // Aplica a máscara
    return onlyNumbers
      .substring(0, 14)
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  };

  const formatCEP = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, "");
    return onlyNumbers.substring(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
  };

  const formatTelefone = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, "");
    if (onlyNumbers.length <= 10) {
      return onlyNumbers.replace(/^(\d{2})(\d{4})(\d)/, "($1) $2-$3");
    } else {
      return onlyNumbers
        .substring(0, 11)
        .replace(/^(\d{2})(\d{5})(\d)/, "($1) $2-$3");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.razaoSocial.trim())
      newErrors.razaoSocial = "Razão social é obrigatória";
    if (!formData.cnpj.trim()) newErrors.cnpj = "CNPJ é obrigatório";
    if (!formData.responsavelTecnicoId)
      newErrors.responsavelTecnicoId = "Responsável técnico é obrigatório";
    if (!formData.email.trim()) newErrors.email = "E-mail é obrigatório";
    if (!formData.telefone1.trim())
      newErrors.telefone1 = "Telefone principal é obrigatório";

    // Validações do endereço
    if (!formData.endereco.cidade.trim())
      newErrors["endereco.cidade"] = "Cidade é obrigatória";
    if (!formData.endereco.bairro.trim())
      newErrors["endereco.bairro"] = "Bairro é obrigatório";
    if (!formData.endereco.logradouro.trim())
      newErrors["endereco.logradouro"] = "Logradouro é obrigatório";
    if (!formData.endereco.cep.trim())
      newErrors["endereco.cep"] = "CEP é obrigatório";
    if (!formData.endereco.numero.trim())
      newErrors["endereco.numero"] = "Número é obrigatório";

    // Validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    // Validação de CNPJ (básica)
    const cnpjNumbers = formData.cnpj.replace(/\D/g, "");
    if (formData.cnpj && cnpjNumbers.length !== 14) {
      newErrors.cnpj = "CNPJ deve ter 14 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      razaoSocial: formData.razaoSocial,
      nomeFantasia: formData.nomeFantasia || undefined,
      cnpj: formData.cnpj,
      responsavelTecnicoId: parseInt(formData.responsavelTecnicoId),
      email: formData.email,
      telefone1: formData.telefone1,
      telefone2: formData.telefone2 || undefined,
      endereco: {
        cidade: formData.endereco.cidade,
        bairro: formData.endereco.bairro,
        logradouro: formData.endereco.logradouro,
        cep: formData.endereco.cep,
        numero: formData.endereco.numero,
        complemento: formData.endereco.complemento || undefined,
      },
    };

    // Se é edição, incluir IDs
    if (initialData) {
      const updateData: UpdatePessoaJuridicaDTO = {
        ...submitData,
        id: initialData.id,
        enderecoId: initialData.enderecoId,
      };
      const success = await onSubmit(updateData);
      if (success) {
        onCancel();
      }
    } else {
      const success = await onSubmit(submitData);
      if (success) {
        setFormData(initialFormData);
        onCancel();
      }
    }
  };

  const InputField = ({
    label,
    name,
    type = "text",
    required = false,
    isEndereco = false,
    options = undefined,
    formatter = undefined,
  }: InputFieldProps) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-secondary-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {options ? (
        <select
          value={
            isEndereco
              ? (formData.endereco[
                  name as keyof typeof formData.endereco
                ] as string)
              : (formData[name as keyof FormData] as string)
          }
          onChange={(e) => handleInputChange(name, e.target.value, isEndereco)}
          className={cn(
            "w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "transition-all duration-200",
            errors[isEndereco ? `endereco.${name}` : name] &&
              "border-red-500 focus:ring-red-500"
          )}
        >
          <option value="">Selecione...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={
            isEndereco
              ? (formData.endereco[
                  name as keyof typeof formData.endereco
                ] as string)
              : (formData[name as keyof FormData] as string)
          }
          onChange={(e) => {
            const value = formatter
              ? formatter(e.target.value)
              : e.target.value;
            handleInputChange(name, value, isEndereco);
          }}
          className={cn(
            "w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "transition-all duration-200",
            errors[isEndereco ? `endereco.${name}` : name] &&
              "border-red-500 focus:ring-red-500"
          )}
        />
      )}
      {errors[isEndereco ? `endereco.${name}` : name] && (
        <p className="text-sm text-red-600">
          {errors[isEndereco ? `endereco.${name}` : name]}
        </p>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-secondary-200/50"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold gradient-text">
          {initialData ? "Editar Pessoa Jurídica" : "Nova Pessoa Jurídica"}
        </h2>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onCancel}
          className="p-2 text-secondary-400 hover:text-red-600 transition-colors duration-200"
        >
          <X className="w-6 h-6" />
        </motion.button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Dados da Empresa */}
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Dados da Empresa
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Razão Social" name="razaoSocial" required />
            <InputField label="Nome Fantasia" name="nomeFantasia" />
            <InputField
              label="CNPJ"
              name="cnpj"
              required
              formatter={formatCNPJ}
            />
            <InputField
              label="Responsável Técnico"
              name="responsavelTecnicoId"
              required
              options={responsaveisTecnicos.map((rt) => ({
                value: rt.id.toString(),
                label: `${rt.nome} - ${rt.cpf}`,
              }))}
            />
          </div>
        </div>

        {/* Contato */}
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Contato
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField label="E-mail" name="email" type="email" required />
            <InputField
              label="Telefone Principal"
              name="telefone1"
              required
              formatter={formatTelefone}
            />
            <InputField
              label="Telefone Secundário"
              name="telefone2"
              formatter={formatTelefone}
            />
          </div>
        </div>

        {/* Endereço */}
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Endereço
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Cidade" name="cidade" isEndereco required />
            <InputField label="Bairro" name="bairro" isEndereco required />
            <InputField
              label="Logradouro"
              name="logradouro"
              isEndereco
              required
            />
            <InputField
              label="CEP"
              name="cep"
              isEndereco
              required
              formatter={formatCEP}
            />
            <InputField label="Número" name="numero" isEndereco required />
            <InputField label="Complemento" name="complemento" isEndereco />
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-secondary-200">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="px-6 py-3 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded-xl font-medium transition-all duration-200"
          >
            Cancelar
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{loading ? "Salvando..." : "Salvar"}</span>
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
