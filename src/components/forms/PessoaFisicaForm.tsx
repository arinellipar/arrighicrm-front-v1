// src/components/forms/PessoaFisicaForm.tsx
"use client";

import { useState, useEffect } from "react";
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

export default function PessoaFisicaForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: PessoaFisicaFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preencher formulário com dados iniciais se fornecidos
  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome,
        email: initialData.email,
        codinome: initialData.codinome || "",
        sexo: initialData.sexo,
        dataNascimento: initialData.dataNascimento.split("T")[0], // Formato YYYY-MM-DD
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!formData.email.trim()) newErrors.email = "E-mail é obrigatório";
    if (!formData.sexo) newErrors.sexo = "Sexo é obrigatório";
    if (!formData.dataNascimento)
      newErrors.dataNascimento = "Data de nascimento é obrigatória";
    if (!formData.estadoCivil)
      newErrors.estadoCivil = "Estado civil é obrigatório";
    if (!formData.cpf.trim()) newErrors.cpf = "CPF é obrigatório";
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      codinome: formData.codinome || undefined,
      rg: formData.rg || undefined,
      cnh: formData.cnh || undefined,
      telefone2: formData.telefone2 || undefined,
      endereco: {
        ...formData.endereco,
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

  const InputField = ({
    label,
    name,
    type = "text",
    required = false,
    isEndereco = false,
    options = undefined,
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
          onChange={(e) => handleInputChange(name, e.target.value, isEndereco)}
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
            <InputField label="Nome" name="nome" required />
            <InputField label="E-mail" name="email" type="email" required />
            <InputField label="Codinome" name="codinome" />
            <InputField
              label="Sexo"
              name="sexo"
              options={SexoOptions}
              required
            />
            <InputField
              label="Data de Nascimento"
              name="dataNascimento"
              type="date"
              required
            />
            <InputField
              label="Estado Civil"
              name="estadoCivil"
              options={EstadoCivilOptions}
              required
            />
          </div>
        </div>

        {/* Documentos */}
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Documentos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField label="CPF" name="cpf" required />
            <InputField label="RG" name="rg" />
            <InputField label="CNH" name="cnh" />
          </div>
        </div>

        {/* Contato */}
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Contato
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Telefone Principal" name="telefone1" required />
            <InputField label="Telefone Secundário" name="telefone2" />
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
            <InputField label="CEP" name="cep" isEndereco required />
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
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
