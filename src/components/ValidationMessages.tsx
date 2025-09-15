// src/components/ValidationMessages.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";
import { ValidationResult } from "@/types/api";
import { cn } from "@/lib/utils";

interface ValidationMessagesProps {
  validation: ValidationResult | null;
  className?: string;
}

export function ValidationMessages({
  validation,
  className,
}: ValidationMessagesProps) {
  if (!validation) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={cn("space-y-3", className)}
      >
        {/* Mensagem de erro */}
        {validation.errorMessage && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <div className="flex-shrink-0 mt-0.5">
              <div className="p-1.5 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900 mb-1">
                Erro de Validação
              </h4>
              <p className="text-sm text-red-700">{validation.errorMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Mensagem de aviso */}
        {validation.warningMessage && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
          >
            <div className="flex-shrink-0 mt-0.5">
              <div className="p-1.5 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                Aviso
              </h4>
              <p className="text-sm text-yellow-700">
                {validation.warningMessage}
              </p>
            </div>
          </motion.div>
        )}

        {/* Sugestão de filial */}
        {validation.suggestedFilial && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl"
          >
            <div className="flex-shrink-0 mt-0.5">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Sugestão de Filial
              </h4>
              <p className="text-sm text-blue-700 mb-2">
                Este usuário está vinculado à filial "
                {validation.suggestedFilial.filialNome}".
              </p>
              <div className="flex flex-wrap gap-2">
                {validation.suggestedFilial.isConsultor && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Consultor
                    {validation.suggestedFilial.oab &&
                      ` - OAB: ${validation.suggestedFilial.oab}`}
                  </span>
                )}
                {validation.suggestedFilial.isParceiro && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Parceiro
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Mensagem de sucesso quando válido */}
        {validation.isValid && !validation.warningMessage && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl"
          >
            <div className="flex-shrink-0 mt-0.5">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-green-900 mb-1">
                Validação Bem-sucedida
              </h4>
              <p className="text-sm text-green-700">
                A combinação de grupo e filial está válida.
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Componente de informação de pessoa física
interface PessoaInfoCardProps {
  pessoaInfo: {
    pessoaFisica: {
      nome: string;
      cpf: string;
      emailEmpresarial: string;
      emailPessoal?: string;
    };
    filialInfo?: {
      filialNome: string;
      isConsultor: boolean;
      isParceiro: boolean;
      oab?: string;
    };
  } | null;
  className?: string;
}

export function PessoaInfoCard({ pessoaInfo, className }: PessoaInfoCardProps) {
  if (!pessoaInfo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-5 border border-primary-200/50",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-secondary-900 mb-4 flex items-center gap-2">
        <Info className="w-4 h-4 text-primary-600" />
        Informações da Pessoa
      </h3>

      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-secondary-500">Nome</label>
            <p className="text-sm font-medium text-secondary-900">
              {pessoaInfo.pessoaFisica.nome}
            </p>
          </div>
          <div>
            <label className="text-xs text-secondary-500">CPF</label>
            <p className="text-sm font-medium text-secondary-900">
              {pessoaInfo.pessoaFisica.cpf}
            </p>
          </div>
          <div>
            <label className="text-xs text-secondary-500">
              Email Empresarial
            </label>
            <p className="text-sm font-medium text-secondary-900">
              {pessoaInfo.pessoaFisica.emailEmpresarial}
            </p>
          </div>
          {pessoaInfo.pessoaFisica.emailPessoal && (
            <div>
              <label className="text-xs text-secondary-500">
                Email Pessoal
              </label>
              <p className="text-sm font-medium text-secondary-900">
                {pessoaInfo.pessoaFisica.emailPessoal}
              </p>
            </div>
          )}
        </div>

        {pessoaInfo.filialInfo && (
          <div className="pt-3 border-t border-primary-200/50">
            <h4 className="text-xs font-semibold text-secondary-700 mb-2">
              Informações de Filial
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600">Filial:</span>
                <span className="text-sm font-medium text-secondary-900">
                  {pessoaInfo.filialInfo.filialNome}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {pessoaInfo.filialInfo.isConsultor && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Consultor
                    {pessoaInfo.filialInfo.oab &&
                      ` (OAB: ${pessoaInfo.filialInfo.oab})`}
                  </span>
                )}
                {pessoaInfo.filialInfo.isParceiro && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Parceiro
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
