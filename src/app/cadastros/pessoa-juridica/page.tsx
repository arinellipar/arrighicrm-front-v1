// src/app/cadastros/pessoa-juridica/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  Loader2,
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import PessoaJuridicaForm from "@/components/forms/PessoaJuridicaForm";
import { usePessoaJuridica } from "@/hooks/usePessoaJuridica";
import { usePessoaFisica } from "@/hooks/usePessoaFisica";
import { PessoaJuridica, ResponsavelTecnicoOption } from "@/types/api";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useForm } from "@/contexts/FormContext";

function StatusBadge({ status }: { status: "ativo" | "inativo" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium",
        status === "ativo"
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      )}
    >
      {status === "ativo" ? "Ativo" : "Inativo"}
    </span>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
    </div>
  );
}

function ErrorMessage({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
    >
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-900 mb-2">
        Erro ao carregar dados
      </h3>
      <p className="text-red-700 mb-4">{message}</p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
      >
        Tentar novamente
      </motion.button>
    </motion.div>
  );
}

export default function PessoaJuridicaPage() {
  const {
    pessoas,
    loading,
    error,
    creating,
    updating,
    deleting,
    fetchPessoas,
    createPessoa,
    updatePessoa,
    deletePessoa,
    clearError,
  } = usePessoaJuridica();

  const { fetchResponsaveisTecnicos } = usePessoaFisica();
  const { openForm, closeForm } = useForm();

  const [showForm, setShowForm] = useState(false);
  const [editingPessoa, setEditingPessoa] = useState<PessoaJuridica | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );
  const [responsaveisTecnicos, setResponsaveisTecnicos] = useState<
    ResponsavelTecnicoOption[]
  >([]);

  // Carregar responsáveis técnicos
  useEffect(() => {
    const loadResponsaveis = async () => {
      const responsaveis = await fetchResponsaveisTecnicos();
      setResponsaveisTecnicos(responsaveis);
    };
    loadResponsaveis();
  }, [fetchResponsaveisTecnicos]);

  // Filtrar pessoas por termo de busca e ordenar alfabeticamente
  const filteredPessoas = pessoas
    .filter(
      (pessoa) =>
        pessoa.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pessoa.cnpj.includes(searchTerm) ||
        pessoa.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pessoa.nomeFantasia &&
          pessoa.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => a.razaoSocial.localeCompare(b.razaoSocial, "pt-BR"));

  const handleCreateOrUpdate = async (data: any) => {
    if (editingPessoa) {
      return await updatePessoa(editingPessoa.id, data);
    } else {
      return await createPessoa(data);
    }
  };

  const handleEdit = (pessoa: PessoaJuridica) => {
    setEditingPessoa(pessoa);
    setShowForm(true);
    openForm();
  };

  const handleDelete = async (id: number) => {
    const success = await deletePessoa(id);
    if (success) {
      setShowDeleteConfirm(null);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPessoa(null);
    clearError();
    closeForm();
  };

  const handleOpenForm = () => {
    if (responsaveisTecnicos.length === 0) {
      alert(
        "É necessário cadastrar pelo menos uma pessoa física como responsável técnico antes de criar uma pessoa jurídica."
      );
      return;
    }
    setShowForm(true);
    openForm();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Estatísticas calculadas
  const stats = {
    total: pessoas.length,
    ativos: pessoas.length, // Assumindo que todos estão ativos por enquanto
    novosEstemês: pessoas.filter((p) => {
      const cadastro = new Date(p.dataCadastro);
      const hoje = new Date();
      const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      return cadastro >= mesAtual;
    }).length,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
        >
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            <div className="p-1.5 sm:p-2 lg:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl text-white">
              <Building2 className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold gradient-text">
                Pessoas Jurídicas
              </h1>
              <p className="text-xs sm:text-sm text-secondary-600">
                Gerenciar cadastros de empresas e organizações
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenForm}
            className="btn-mobile flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg sm:rounded-xl font-medium shadow-lg transition-all duration-200 text-xs sm:text-sm lg:text-base"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            <span>Nova Empresa</span>
          </motion.button>
        </motion.div>

        {/* Aviso se não há responsáveis técnicos */}
        {responsaveisTecnicos.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800">
                <strong>Atenção:</strong> É necessário ter pelo menos uma pessoa
                física cadastrada para ser responsável técnico antes de criar
                pessoas jurídicas.{" "}
                <Link
                  href="/cadastros/pessoa-fisica"
                  className="underline hover:no-underline font-medium"
                >
                  Cadastrar pessoa física
                </Link>
              </p>
            </div>
          </motion.div>
        )}

        {/* Filtros e Busca */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-secondary-200/50"
        >
          <div className="flex flex-col md:flex-row gap-2 sm:gap-3 lg:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              <input
                type="text"
                placeholder="Buscar por razão social, CNPJ ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 sm:pl-8 lg:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 lg:py-3 bg-secondary-50 border border-secondary-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm lg:text-base"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-mobile flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded-lg sm:rounded-xl font-medium transition-all duration-200 text-xs sm:text-sm lg:text-base"
            >
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              <span>Filtros</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 shadow-sm border border-secondary-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 text-xs sm:text-sm font-medium">
                  Total de Empresas
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-secondary-900">
                  {stats.total}
                </p>
              </div>
              <div className="p-1.5 sm:p-2 lg:p-3 bg-green-100 rounded-lg sm:rounded-xl">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 shadow-sm border border-secondary-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 text-xs sm:text-sm font-medium">
                  Empresas Ativas
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                  {stats.ativos}
                </p>
              </div>
              <div className="p-1.5 sm:p-2 lg:p-3 bg-green-100 rounded-lg sm:rounded-xl">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 shadow-sm border border-secondary-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 text-xs sm:text-sm font-medium">
                  Novas este mês
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-accent-600">
                  {stats.novosEstemês}
                </p>
              </div>
              <div className="p-1.5 sm:p-2 lg:p-3 bg-accent-100 rounded-lg sm:rounded-xl">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-accent-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabela ou Estados de Loading/Error */}
        {error ? (
          <ErrorMessage message={error} onRetry={fetchPessoas} />
        ) : loading ? (
          <LoadingSpinner />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm border border-secondary-200/50 overflow-hidden w-full"
          >
            <div className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 border-b border-secondary-200/50">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-secondary-900">
                Lista de Empresas ({filteredPessoas.length} registros)
              </h3>
            </div>

            {filteredPessoas.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  {searchTerm
                    ? "Nenhum resultado encontrado"
                    : "Nenhuma empresa cadastrada"}
                </h3>
                <p className="text-secondary-600">
                  {searchTerm
                    ? "Tente ajustar o termo de busca"
                    : responsaveisTecnicos.length === 0
                    ? "Cadastre primeiro uma pessoa física como responsável técnico"
                    : "Clique em 'Nova Empresa' para começar"}
                </p>
              </div>
            ) : (
              <div className="table-responsive table-container overflow-x-auto">
                <table className="w-full min-w-[700px] sm:min-w-[800px] lg:min-w-[900px] xl:min-w-[1000px]">
                  <thead className="bg-secondary-50/50">
                    <tr>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider hidden sm:table-cell">
                        CNPJ
                      </th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider hidden md:table-cell">
                        Responsável Técnico
                      </th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider hidden lg:table-cell">
                        Contato
                      </th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider hidden xl:table-cell">
                        Status
                      </th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider hidden xl:table-cell">
                        Data Cadastro
                      </th>
                      <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200/50">
                    {filteredPessoas.map((pessoa, index) => (
                      <motion.tr
                        key={pessoa.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        className="hover:bg-secondary-50/50 transition-colors duration-200"
                      >
                        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5 sm:space-x-2 max-w-[200px] sm:max-w-[250px] lg:max-w-[300px]">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-white">
                                {pessoa.razaoSocial.charAt(0)}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                className="text-xs sm:text-sm font-medium text-secondary-900 truncate"
                                title={pessoa.razaoSocial}
                              >
                                {pessoa.razaoSocial}
                              </div>
                              {pessoa.nomeFantasia && (
                                <div
                                  className="text-xs text-secondary-500 truncate hidden sm:block"
                                  title={pessoa.nomeFantasia}
                                >
                                  {pessoa.nomeFantasia}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 whitespace-nowrap text-xs sm:text-sm text-secondary-600 hidden sm:table-cell">
                          {pessoa.cnpj}
                        </td>
                        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 whitespace-nowrap hidden md:table-cell">
                          <div className="text-xs sm:text-sm text-secondary-900">
                            {pessoa.responsavelTecnico.nome}
                          </div>
                          <div className="text-xs sm:text-sm text-secondary-500">
                            {pessoa.responsavelTecnico.cpf}
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 whitespace-nowrap hidden lg:table-cell">
                          <div className="text-xs sm:text-sm text-secondary-900">
                            {pessoa.email}
                          </div>
                          <div className="text-xs sm:text-sm text-secondary-500">
                            {pessoa.telefone1}
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 whitespace-nowrap hidden xl:table-cell">
                          <StatusBadge status="ativo" />
                        </td>
                        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 whitespace-nowrap text-xs sm:text-sm text-secondary-600 hidden xl:table-cell">
                          {formatDate(pessoa.dataCadastro)}
                        </td>
                        <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-0.5 sm:space-x-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1 sm:p-1.5 text-secondary-400 hover:text-primary-600 transition-colors duration-200"
                              title="Visualizar"
                            >
                              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEdit(pessoa)}
                              className="p-1 sm:p-1.5 text-secondary-400 hover:text-accent-600 transition-colors duration-200"
                              title="Editar"
                            >
                              <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setShowDeleteConfirm(pessoa.id)}
                              className="p-1 sm:p-1.5 text-secondary-400 hover:text-red-600 transition-colors duration-200"
                              title="Excluir"
                            >
                              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginação */}
            {filteredPessoas.length > 0 && (
              <div className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 bg-secondary-50/30 border-t border-secondary-200/50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
                  <div className="text-xs sm:text-sm text-secondary-500 text-center sm:text-left">
                    Mostrando {filteredPessoas.length} de {pessoas.length}{" "}
                    registros
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-mobile px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors duration-200"
                    >
                      Anterior
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-mobile px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 transition-colors duration-200"
                    >
                      Próximo
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Formulário Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-4xl max-h-screen overflow-y-auto">
                <PessoaJuridicaForm
                  initialData={editingPessoa}
                  responsaveisTecnicos={responsaveisTecnicos}
                  onSubmit={handleCreateOrUpdate}
                  onCancel={handleCloseForm}
                  loading={creating || updating}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Confirmação de Exclusão */}
        <AnimatePresence>
          {showDeleteConfirm !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-secondary-900">
                    Confirmar Exclusão
                  </h3>
                </div>
                <p className="text-secondary-600 mb-6">
                  Tem certeza que deseja excluir esta empresa? Esta ação não
                  pode ser desfeita.
                </p>
                <div className="flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 text-secondary-700 bg-secondary-100 hover:bg-secondary-200 rounded-lg font-medium transition-colors duration-200"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDelete(showDeleteConfirm)}
                    disabled={deleting}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                  >
                    {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{deleting ? "Excluindo..." : "Excluir"}</span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
