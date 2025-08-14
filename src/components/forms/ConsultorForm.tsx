// src/components/forms/ConsultorForm.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Calendar,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Consultor, CreateConsultorDTO, UpdateConsultorDTO } from "@/types/api";
import { cn } from "@/lib/utils";

interface ConsultorFormProps {
  initialData?: Consultor | null;
  onSubmit: (data: CreateConsultorDTO | UpdateConsultorDTO) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConsultorForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: ConsultorFormProps) {
  const [formData, setFormData] = useState<CreateConsultorDTO>({
    pessoaFisicaId: 0,
    filial: "",
    nome: "",
    email: "",
    oab: "",
    telefone1: "",
    telefone2: "",
    especialidades: [],
    status: "ativo",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newEspecialidade, setNewEspecialidade] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        pessoaFisicaId: initialData.pessoaFisicaId || 0,
        filial: initialData.filial || "",
        nome: initialData.nome || "",
        email: initialData.email || "",
        oab: initialData.oab || "",
        telefone1: initialData.telefone1 || "",
        telefone2: initialData.telefone2 || "",
        especialidades: initialData.especialidades || [],
        status: initialData.status || "ativo",
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome?.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email || "")) {
      newErrors.email = "Email inválido";
    }

    if (!formData.telefone1?.trim()) {
      newErrors.telefone1 = "Telefone é obrigatório";
    }

    if (!formData.filial.trim()) {
      newErrors.filial = "Filial é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = initialData
      ? ({ ...formData, id: initialData.id } as UpdateConsultorDTO)
      : formData;

    const success = await onSubmit(data);
    if (success) {
      onCancel();
    }
  };

  const addEspecialidade = () => {
    if (
      newEspecialidade.trim() &&
      !formData.especialidades?.includes(newEspecialidade.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        especialidades: [
          ...(prev.especialidades || []),
          newEspecialidade.trim(),
        ],
      }));
      setNewEspecialidade("");
    }
  };

  const removeEspecialidade = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      especialidades:
        prev.especialidades?.filter((_: string, i: number) => i !== index) ||
        [],
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-auto"
    >
      <div className="flex items-center justify-between p-6 border-b border-secondary-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <User className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-secondary-900">
              {initialData ? "Editar Consultor" : "Novo Consultor"}
            </h2>
            <p className="text-sm text-secondary-600">
              {initialData
                ? "Atualize as informações do consultor"
                : "Preencha as informações do novo consultor"}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-secondary-400 hover:text-secondary-600 rounded-lg transition-colors duration-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Nome Completo *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                value={formData.nome}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nome: e.target.value }))
                }
                className={cn(
                  "w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
                  errors.nome
                    ? "border-red-300 focus:ring-red-500"
                    : "border-secondary-300"
                )}
                placeholder="Nome completo"
              />
            </div>
            {errors.nome && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.nome}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className={cn(
                  "w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
                  errors.email
                    ? "border-red-300 focus:ring-red-500"
                    : "border-secondary-300"
                )}
                placeholder="email@exemplo.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* OAB */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              OAB
            </label>
            <input
              type="text"
              value={formData.oab}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, oab: e.target.value }))
              }
              className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              placeholder="123456/SP"
            />
          </div>

          {/* Telefone 1 */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Telefone Principal *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="tel"
                value={formData.telefone1}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    telefone1: e.target.value,
                  }))
                }
                className={cn(
                  "w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
                  errors.telefone1
                    ? "border-red-300 focus:ring-red-500"
                    : "border-secondary-300"
                )}
                placeholder="(11) 99999-9999"
              />
            </div>
            {errors.telefone1 && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.telefone1}
              </p>
            )}
          </div>

          {/* Telefone 2 */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Telefone Secundário
            </label>
            <input
              type="tel"
              value={formData.telefone2}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, telefone2: e.target.value }))
              }
              className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              placeholder="(11) 88888-8888"
            />
          </div>

          {/* Filial */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Filial *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                value={formData.filial}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, filial: e.target.value }))
                }
                className={cn(
                  "w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
                  errors.filial
                    ? "border-red-300 focus:ring-red-500"
                    : "border-secondary-300"
                )}
                placeholder="Nome da filial"
              />
            </div>
            {errors.filial && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.filial}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as
                    | "ativo"
                    | "inativo"
                    | "ferias"
                    | "licenca",
                }))
              }
              className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="ferias">Férias</option>
              <option value="licenca">Licença</option>
            </select>
          </div>
        </div>

        {/* Especialidades */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Especialidades
          </label>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newEspecialidade}
                onChange={(e) => setNewEspecialidade(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addEspecialidade())
                }
                className="flex-1 px-4 py-3 border border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder="Adicionar especialidade"
              />
              <button
                type="button"
                onClick={addEspecialidade}
                className="px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors duration-200"
              >
                Adicionar
              </button>
            </div>
            {formData.especialidades && formData.especialidades.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.especialidades?.map((esp: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {esp}
                    <button
                      type="button"
                      onClick={() => removeEspecialidade(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-secondary-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-secondary-700 bg-secondary-100 hover:bg-secondary-200 rounded-xl font-medium transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl font-medium transition-colors duration-200"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" />
            <span>{loading ? "Salvando..." : "Salvar"}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
}
