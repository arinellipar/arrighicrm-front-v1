"use client";

import { useState, useEffect, useCallback, memo, useRef } from "react";
import { motion } from "framer-motion";
import { Save, X, Loader2 } from "lucide-react";
import {
  CreatePessoaFisicaDTO,
  UpdatePessoaFisicaDTO,
  PessoaFisica,
  SexoOptions,
  EstadoCivilOptions,
} from "@/types/api";
import { cn } from "@/lib/utils";

interface PessoaFisicaFormProps {
  initialData?: PessoaFisica | null;
  onSubmit: (
    data: CreatePessoaFisicaDTO | UpdatePessoaFisicaDTO
  ) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

interface FormData {
  nome: string;
  email: string;
  codinome: string;
  sexo: string;
  dataNascimento: string;
  estadoCivil: string;
  cpf: string;
  rg: string;
  cnh: string;
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
  options?: readonly { readonly value: string; readonly label: string }[];
  formatter?: (value: string) => string;
}

const initialFormData: FormData = {
  nome: "",
  email: "",
  codinome: "",
  sexo: "",
  dataNascimento: "",
  estadoCivil: "",
  cpf: "",
  rg: "",
  cnh: "",
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
    value,
    onChange,
    error,
    formatter,
  }: InputFieldProps & {
    value: string;
    onChange: (value: string) => void;
    error?: string;
  }) => {
    const fieldId = isEndereco ? `endereco-${name}` : name;
    const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onChange(e.target.value);
      },
      [onChange]
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

export default function PessoaFisicaForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: PessoaFisicaFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar dados se for edição
  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome,
        email: initialData.email,
        codinome: initialData.codinome || "",
        sexo: initialData.sexo,
        dataNascimento: initialData.dataNascimento,
        estadoCivil: initialData.estadoCivil,
        cpf: initialData.cpf,
        rg: initialData.rg || "",
        cnh: initialData.cnh || "",
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
    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!formData.email.trim()) newErrors.email = "E-mail é obrigatório";
    if (!formData.sexo) newErrors.sexo = "Sexo é obrigatório";
    if (!formData.dataNascimento)
      newErrors.dataNascimento = "Data de nascimento é obrigatória";
    if (!formData.estadoCivil)
      newErrors.estadoCivil = "Estado civil é obrigatório";
    if (!formData.cpf.trim()) newErrors.cpf = "CPF é obrigatório";

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

    const submitData = {
      nome: formData.nome,
      email: formData.email,
      codinome: formData.codinome || undefined,
      sexo: formData.sexo,
      dataNascimento: formData.dataNascimento,
      estadoCivil: formData.estadoCivil,
      cpf: formData.cpf,
      rg: formData.rg || undefined,
      cnh: formData.cnh || undefined,
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
      const updateData: UpdatePessoaFisicaDTO = {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-secondary-200/50"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold gradient-text">
          {initialData ? "Editar Pessoa Física" : "Nova Pessoa Física"}
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
        {/* Dados Pessoais */}
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Dados Pessoais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Nome"
              name="nome"
              required
              value={formData.nome}
              onChange={(value) => handleFieldChange("nome", value)}
              error={errors.nome}
            />
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
              label="Codinome"
              name="codinome"
              value={formData.codinome}
              onChange={(value) => handleFieldChange("codinome", value)}
              error={errors.codinome}
            />
            <InputField
              label="Sexo"
              name="sexo"
              options={SexoOptions}
              required
              value={formData.sexo}
              onChange={(value) => handleFieldChange("sexo", value)}
              error={errors.sexo}
            />
            <InputField
              label="Data de Nascimento"
              name="dataNascimento"
              type="date"
              required
              value={formData.dataNascimento}
              onChange={(value) => handleFieldChange("dataNascimento", value)}
              error={errors.dataNascimento}
            />
            <InputField
              label="Estado Civil"
              name="estadoCivil"
              options={EstadoCivilOptions}
              required
              value={formData.estadoCivil}
              onChange={(value) => handleFieldChange("estadoCivil", value)}
              error={errors.estadoCivil}
            />
          </div>
        </div>

        {/* Documentos */}
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Documentos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField
              label="CPF"
              name="cpf"
              required
              value={formData.cpf}
              onChange={(value) => handleFieldChange("cpf", value)}
              error={errors.cpf}
            />
            <InputField
              label="RG"
              name="rg"
              value={formData.rg}
              onChange={(value) => handleFieldChange("rg", value)}
              error={errors.rg}
            />
            <InputField
              label="CNH"
              name="cnh"
              value={formData.cnh}
              onChange={(value) => handleFieldChange("cnh", value)}
              error={errors.cnh}
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
