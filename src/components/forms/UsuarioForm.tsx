// src/components/forms/UsuarioForm.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, X, Loader2, Eye, EyeOff } from "lucide-react";
import {
  CreateUsuarioDTO,
  UpdateUsuarioDTO,
  Usuario,
  PessoaFisicaOption,
  PessoaJuridicaOption,
  GrupoAcessoOptions,
} from "@/types/api";
import { cn } from "@/lib/utils";

interface UsuarioFormProps {
  initialData?: Usuario | null;
  pessoasFisicas: PessoaFisicaOption[];
  pessoasJuridicas: PessoaJuridicaOption[];
  onSubmit: (data: CreateUsuarioDTO | UpdateUsuarioDTO) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

interface FormData {
  login: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  grupoAcesso: string;
  tipoPessoa: "Fisica" | "Juridica" | "";
  pessoaFisicaId: string;
  pessoaJuridicaId: string;
  ativo: boolean;
}

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  options?: readonly { readonly value: string; readonly label: string }[];
  disabled?: boolean;
}

const initialFormData: FormData = {
  login: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  grupoAcesso: "",
  tipoPessoa: "",
  pessoaFisicaId: "",
  pessoaJuridicaId: "",
  ativo: true,
};

export default function UsuarioForm({
  initialData,
  pessoasFisicas,
  pessoasJuridicas,
  onSubmit,
  onCancel,
  loading = false,
}: UsuarioFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Preencher formulário com dados iniciais se fornecidos
  useEffect(() => {
    if (initialData) {
      setFormData({
        login: initialData.login,
        email: initialData.email,
        senha: "", // Não pré-preencher senha por segurança
        confirmarSenha: "",
        grupoAcesso: initialData.grupoAcesso,
        tipoPessoa: initialData.tipoPessoa,
        pessoaFisicaId: initialData.pessoaFisicaId?.toString() || "",
        pessoaJuridicaId: initialData.pessoaJuridicaId?.toString() || "",
        ativo: initialData.ativo,
      });
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpar erro do campo quando começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Limpar campos de pessoa quando mudar o tipo
    if (field === "tipoPessoa") {
      setFormData((prev) => ({
        ...prev,
        pessoaFisicaId: "",
        pessoaJuridicaId: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.login.trim()) newErrors.login = "Login é obrigatório";
    if (!formData.email.trim()) newErrors.email = "E-mail é obrigatório";
    if (!formData.grupoAcesso)
      newErrors.grupoAcesso = "Grupo de acesso é obrigatório";
    if (!formData.tipoPessoa)
      newErrors.tipoPessoa = "Tipo de pessoa é obrigatório";

    // Validação de senha apenas para novos usuários ou quando preenchida
    if (!initialData) {
      if (!formData.senha.trim()) newErrors.senha = "Senha é obrigatória";
      if (!formData.confirmarSenha.trim())
        newErrors.confirmarSenha = "Confirmação de senha é obrigatória";
    }

    // Validação de confirmação de senha
    if (formData.senha && formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = "Senhas não coincidem";
    }

    // Validação de pessoa associada
    if (formData.tipoPessoa === "Fisica" && !formData.pessoaFisicaId) {
      newErrors.pessoaFisicaId = "Pessoa física é obrigatória";
    }
    if (formData.tipoPessoa === "Juridica" && !formData.pessoaJuridicaId) {
      newErrors.pessoaJuridicaId = "Pessoa jurídica é obrigatória";
    }

    // Validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    // Validação de senha forte
    if (formData.senha && formData.senha.length < 6) {
      newErrors.senha = "Senha deve ter pelo menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: CreateUsuarioDTO = {
      login: formData.login,
      email: formData.email,
      senha: formData.senha || "temp123", // Senha temporária se não fornecida (edição)
      grupoAcesso: formData.grupoAcesso,
      tipoPessoa: formData.tipoPessoa as "Fisica" | "Juridica",
      pessoaFisicaId:
        formData.tipoPessoa === "Fisica"
          ? parseInt(formData.pessoaFisicaId)
          : undefined,
      pessoaJuridicaId:
        formData.tipoPessoa === "Juridica"
          ? parseInt(formData.pessoaJuridicaId)
          : undefined,
      ativo: formData.ativo,
    };

    // Se é edição, incluir ID
    if (initialData) {
      const updateData: UpdateUsuarioDTO = {
        ...submitData,
        id: initialData.id,
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
    options = undefined,
    disabled = false,
  }: InputFieldProps) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-secondary-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {options ? (
        <select
          value={formData[name as keyof FormData] as string}
          onChange={(e) => handleInputChange(name, e.target.value)}
          disabled={disabled}
          className={cn(
            "w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "transition-all duration-200",
            disabled && "opacity-50 cursor-not-allowed",
            errors[name] && "border-red-500 focus:ring-red-500"
          )}
        >
          <option value="">Selecione...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "password" ? (
        <div className="relative">
          <input
            type={
              name === "senha"
                ? showPassword
                  ? "text"
                  : "password"
                : showConfirmPassword
                ? "text"
                : "password"
            }
            value={formData[name as keyof FormData] as string}
            onChange={(e) => handleInputChange(name, e.target.value)}
            disabled={disabled}
            className={cn(
              "w-full px-4 py-3 pr-12 bg-secondary-50 border border-secondary-200 rounded-xl",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              "transition-all duration-200",
              disabled && "opacity-50 cursor-not-allowed",
              errors[name] && "border-red-500 focus:ring-red-500"
            )}
          />
          <button
            type="button"
            onClick={() => {
              if (name === "senha") {
                setShowPassword(!showPassword);
              } else {
                setShowConfirmPassword(!showConfirmPassword);
              }
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
          >
            {(name === "senha" ? showPassword : showConfirmPassword) ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      ) : (
        <input
          type={type}
          value={formData[name as keyof FormData] as string}
          onChange={(e) => handleInputChange(name, e.target.value)}
          disabled={disabled}
          className={cn(
            "w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "transition-all duration-200",
            disabled && "opacity-50 cursor-not-allowed",
            errors[name] && "border-red-500 focus:ring-red-500"
          )}
        />
      )}
      {errors[name] && <p className="text-sm text-red-600">{errors[name]}</p>}
    </div>
  );

  const CheckboxField = ({ label, name }: { label: string; name: string }) => (
    <div className="flex items-center space-x-3">
      <input
        type="checkbox"
        id={name}
        checked={formData[name as keyof FormData] as boolean}
        onChange={(e) => handleInputChange(name, e.target.checked)}
        className="w-4 h-4 text-primary-600 bg-secondary-50 border-secondary-300 rounded focus:ring-primary-500 focus:ring-2"
      />
      <label htmlFor={name} className="text-sm font-medium text-secondary-900">
        {label}
      </label>
    </div>
  );

  // Opções de pessoas baseadas no tipo selecionado
  const getPessoaOptions = () => {
    if (formData.tipoPessoa === "Fisica") {
      return pessoasFisicas.map((pf) => ({
        value: pf.id.toString(),
        label: `${pf.nome} - ${pf.cpf}`,
      }));
    }
    if (formData.tipoPessoa === "Juridica") {
      return pessoasJuridicas.map((pj) => ({
        value: pj.id.toString(),
        label: `${pj.razaoSocial} - ${pj.cnpj}`,
      }));
    }
    return [];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-secondary-200/50"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold gradient-text">
          {initialData ? "Editar Usuário" : "Novo Usuário"}
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
        {/* Dados de Acesso */}
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Dados de Acesso
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Login" name="login" required />
            <InputField label="E-mail" name="email" type="email" required />
            <InputField
              label={
                initialData
                  ? "Nova Senha (deixe em branco para manter atual)"
                  : "Senha"
              }
              name="senha"
              type="password"
              required={!initialData}
            />
            <InputField
              label="Confirmar Senha"
              name="confirmarSenha"
              type="password"
              required={!initialData || formData.senha.length > 0}
            />
          </div>
        </div>

        {/* Permissões */}
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Permissões
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Grupo de Acesso"
              name="grupoAcesso"
              options={GrupoAcessoOptions}
              required
            />
            <div className="flex items-end">
              <CheckboxField label="Usuário Ativo" name="ativo" />
            </div>
          </div>
        </div>

        {/* Associação com Pessoa */}
        <div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Associação com Pessoa
          </h3>
          <div className="space-y-6">
            <InputField
              label="Tipo de Pessoa"
              name="tipoPessoa"
              options={[
                { value: "Fisica", label: "Pessoa Física" },
                { value: "Juridica", label: "Pessoa Jurídica" },
              ]}
              required
            />

            {formData.tipoPessoa === "Fisica" && (
              <InputField
                label="Pessoa Física"
                name="pessoaFisicaId"
                options={getPessoaOptions()}
                required
              />
            )}

            {formData.tipoPessoa === "Juridica" && (
              <InputField
                label="Pessoa Jurídica"
                name="pessoaJuridicaId"
                options={getPessoaOptions()}
                required
              />
            )}
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
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
