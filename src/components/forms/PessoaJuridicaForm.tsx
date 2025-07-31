// src/components/forms/PessoaJuridicaForm.tsx
"use client";

import { useState, useEffect, useCallback, memo, useRef } from "react";
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

// Componente InputField separado e memoizado
const InputField = memo(
  ({
    label,
    name,
    type = "text",
    required = false,
    isEndereco = false,
    options = undefined,
    formatter = undefined,
    value,
    onChange,
    error,
  }: InputFieldProps & {
    value: string;
    onChange: (value: string) => void;
    error?: string;
  }) => {
    const fieldId = isEndereco ? `endereco-${name}` : name;
    const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = formatter ? formatter(e.target.value) : e.target.value;
        onChange(value);
      },
      [onChange, formatter]
    );

    return (
      <div className="space-y-2">
        <label
          htmlFor={fieldId}
          className="text-sm font-medium text-secondary-900"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {options ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            id={fieldId}
            name={name}
            value={value}
            onChange={handleChange}
            className={cn(
              "w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              "transition-all duration-200",
              error && "border-red-500 focus:ring-red-500"
            )}
            required={required}
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
            ref={inputRef as React.RefObject<HTMLInputElement>}
            id={fieldId}
            name={name}
            type={type}
            value={value}
            onChange={handleChange}
            className={cn(
              "w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              "transition-all duration-200",
              error && "border-red-500 focus:ring-red-500"
            )}
            required={required}
            autoComplete={
              type === "email" ? "email" : type === "tel" ? "tel" : "off"
            }
          />
        )}
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default function PessoaJuridicaForm({
  initialData,
  responsaveisTecnicos,
  onSubmit,
  onCancel,
  loading = false,
}: PessoaJuridicaFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar dados se for edição
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

  const handleFieldChange = useCallback(
    (field: string, value: string, isEndereco = false) => {
      setFormData((prev) => {
        if (isEndereco) {
          return {
            ...prev,
            endereco: {
              ...prev.endereco,
              [field]: value,
            },
          };
        } else {
          return {
            ...prev,
            [field]: value,
          };
        }
      });

      // Limpar erro do campo
      const errorKey = isEndereco ? `endereco.${field}` : field;
      if (errors[errorKey]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[errorKey];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Funções de formatação
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6)
      return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 9)
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
        5
      )}`;
    if (numbers.length <= 13)
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
        5,
        8
      )}/${numbers.slice(8)}`;
    // Formato correto: XX.XXX.XXX/XXXX-XX
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
      5,
      8
    )}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(
        6
      )}`;
    // Permitir 11 dígitos (com DDD)
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
      7,
      11
    )}`;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações básicas
    if (!formData.razaoSocial.trim())
      newErrors.razaoSocial = "Razão social é obrigatória";

    // Validação de CNPJ
    if (!formData.cnpj.trim()) {
      newErrors.cnpj = "CNPJ é obrigatório";
    } else {
      const cnpjNumeros = formData.cnpj.replace(/\D/g, "");
      if (cnpjNumeros.length < 14) {
        newErrors.cnpj = "CNPJ deve ter pelo menos 14 dígitos numéricos";
      } else if (cnpjNumeros.length > 14) {
        newErrors.cnpj = "CNPJ deve ter no máximo 14 dígitos numéricos";
      }
    }

    if (!formData.responsavelTecnicoId)
      newErrors.responsavelTecnicoId = "Responsável técnico é obrigatório";
    if (!formData.email.trim()) newErrors.email = "E-mail é obrigatório";

    // Validação de telefone
    if (!formData.telefone1.trim()) {
      newErrors.telefone1 = "Telefone é obrigatório";
    } else {
      const telefoneNumeros = formData.telefone1.replace(/\D/g, "");
      if (telefoneNumeros.length < 10) {
        newErrors.telefone1 = "Telefone deve ter pelo menos 10 dígitos";
      } else if (telefoneNumeros.length > 11) {
        newErrors.telefone1 = "Telefone deve ter no máximo 11 dígitos";
      }
    }

    // Validações de endereço
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Encontrar o responsável técnico selecionado
    const responsavelTecnico = responsaveisTecnicos.find(
      (resp) => resp.id.toString() === formData.responsavelTecnicoId
    );

    if (!responsavelTecnico) {
      setErrors({ responsavelTecnicoId: "Responsável técnico inválido" });
      return;
    }

    // Validar CNPJ antes de enviar
    const cnpjNumeros = formData.cnpj.replace(/\D/g, "");
    if (cnpjNumeros.length < 14) {
      setErrors({ cnpj: "CNPJ deve ter pelo menos 14 dígitos numéricos" });
      return;
    } else if (cnpjNumeros.length > 14) {
      setErrors({ cnpj: "CNPJ deve ter no máximo 14 dígitos numéricos" });
      return;
    }

    // Garantir que o CNPJ esteja formatado corretamente antes de enviar
    const cnpjFormatado = formatCNPJ(cnpjNumeros);
    if (cnpjFormatado.length !== 18) {
      setErrors({ cnpj: "CNPJ deve estar formatado como XX.XXX.XXX/XXXX-XX" });
      return;
    }

    const submitData = {
      razaoSocial: formData.razaoSocial,
      nomeFantasia: formData.nomeFantasia || undefined,
      cnpj: cnpjFormatado,
      responsavelTecnicoId: responsavelTecnico.id,
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

  // Converter responsáveis técnicos para formato de opções
  const responsavelOptions = responsaveisTecnicos.map((resp) => ({
    value: resp.id.toString(),
    label: resp.nome,
  }));

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
            <InputField
              label="Razão Social"
              name="razaoSocial"
              required
              value={formData.razaoSocial}
              onChange={(value) => handleFieldChange("razaoSocial", value)}
              error={errors.razaoSocial}
            />
            <InputField
              label="Nome Fantasia"
              name="nomeFantasia"
              value={formData.nomeFantasia}
              onChange={(value) => handleFieldChange("nomeFantasia", value)}
              error={errors.nomeFantasia}
            />
            <InputField
              label="CNPJ"
              name="cnpj"
              required
              value={formData.cnpj}
              onChange={(value) => handleFieldChange("cnpj", value)}
              error={errors.cnpj}
              formatter={formatCNPJ}
            />
            <InputField
              label="Responsável Técnico"
              name="responsavelTecnicoId"
              options={responsavelOptions}
              required
              value={formData.responsavelTecnicoId}
              onChange={(value) =>
                handleFieldChange("responsavelTecnicoId", value)
              }
              error={errors.responsavelTecnicoId}
            />
          </div>
        </div>

        {/* Contato */}
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Contato
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="E-mail"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={(value) => handleFieldChange("email", value)}
              error={errors.email}
            />
            <InputField
              label="Telefone Principal"
              name="telefone1"
              type="tel"
              required
              value={formData.telefone1}
              onChange={(value) => handleFieldChange("telefone1", value)}
              error={errors.telefone1}
              formatter={formatTelefone}
            />
            <InputField
              label="Telefone Secundário"
              name="telefone2"
              type="tel"
              value={formData.telefone2}
              onChange={(value) => handleFieldChange("telefone2", value)}
              error={errors.telefone2}
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
            <InputField
              label="CEP"
              name="cep"
              isEndereco
              required
              value={formData.endereco.cep}
              onChange={(value) => handleFieldChange("cep", value, true)}
              error={errors["endereco.cep"]}
              formatter={formatCEP}
            />
            <InputField
              label="Logradouro"
              name="logradouro"
              isEndereco
              required
              value={formData.endereco.logradouro}
              onChange={(value) => handleFieldChange("logradouro", value, true)}
              error={errors["endereco.logradouro"]}
            />
            <InputField
              label="Número"
              name="numero"
              isEndereco
              required
              value={formData.endereco.numero}
              onChange={(value) => handleFieldChange("numero", value, true)}
              error={errors["endereco.numero"]}
            />
            <InputField
              label="Complemento"
              name="complemento"
              isEndereco
              value={formData.endereco.complemento}
              onChange={(value) =>
                handleFieldChange("complemento", value, true)
              }
              error={errors["endereco.complemento"]}
            />
            <InputField
              label="Bairro"
              name="bairro"
              isEndereco
              required
              value={formData.endereco.bairro}
              onChange={(value) => handleFieldChange("bairro", value, true)}
              error={errors["endereco.bairro"]}
            />
            <InputField
              label="Cidade"
              name="cidade"
              isEndereco
              required
              value={formData.endereco.cidade}
              onChange={(value) => handleFieldChange("cidade", value, true)}
              error={errors["endereco.cidade"]}
            />
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-4 pt-6">
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 text-secondary-600 border border-secondary-300 rounded-xl hover:bg-secondary-50 transition-colors duration-200"
          >
            Cancelar
          </motion.button>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{initialData ? "Atualizar" : "Salvar"}</span>
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
