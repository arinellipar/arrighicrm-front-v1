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
import { usePessoaJuridica } from "@/hooks/usePessoaJuridica";
import { usePessoaFisica } from "@/hooks/usePessoaFisica";
import { PessoaJuridica, ResponsavelTecnicoOption } from "@/types/api";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: "ativo" | "inativo" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
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

  // Filtrar pessoas por termo de busca
  const filteredPessoas = pessoas.filter(
    (pessoa) =>
      pessoa.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pessoa.cnpj.includes(searchTerm) ||
      pessoa.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pessoa.nomeFantasia &&
        pessoa.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                Pessoas Jurídicas
              </h1>
              <p className="text-secondary-600">
                Gerenciar cadastros de empresas e organizações
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (responsaveisTecnicos.length === 0) {
                alert(
                  "É necessário cadastrar pelo menos uma pessoa física como responsável técnico antes de criar uma pessoa jurídica."
                );
                return;
              }
              setShowForm(true);
            }}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium shadow-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
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
                <a
                  href="/cadastros/pessoa-fisica"
                  className="underline hover:no-underline font-medium"
                >
                  Cadastrar pessoa física
                </a>
              </p>
            </div>
          </motion.div>
        )}

        {/* Filtros e Busca */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-secondary-200/50"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por razão social, CNPJ ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-2 px-6 py-3 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded-xl font-medium transition-all duration-200"
            >
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-secondary-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 text-sm font-medium">
                  Total de Empresas
                </p>
                <p className="text-3xl font-bold text-secondary-900">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-secondary-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 text-sm font-medium">
                  Empresas Ativas
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.ativos}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-secondary-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 text-sm font-medium">
                  Novas este mês
                </p>
                <p className="text-3xl font-bold text-accent-600">
                  {stats.novosEstemês}
                </p>
              </div>
              <div className="p-3 bg-accent-100 rounded-xl">
                <Plus className="w-6 h-6 text-accent-600" />
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
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-secondary-200/50 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-secondary-200/50">
              <h3 className="text-lg font-semibold text-secondary-900">
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        CNPJ
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Responsável Técnico
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Data Cadastro
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-white">
                                {pessoa.razaoSocial.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-secondary-900">
                                {pessoa.razaoSocial}
                              </div>
                              {pessoa.nomeFantasia && (
                                <div className="text-sm text-secondary-500">
                                  {pessoa.nomeFantasia}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                          {pessoa.cnpj}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-900">
                            {pessoa.responsavelTecnico.nome}
                          </div>
                          <div className="text-sm text-secondary-500">
                            {pessoa.responsavelTecnico.cpf}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-900">
                            {pessoa.email}
                          </div>
                          <div className="text-sm text-secondary-500">
                            {pessoa.telefone1}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status="ativo" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                          {formatDate(pessoa.dataCadastro)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-secondary-400 hover:text-primary-600 transition-colors duration-200"
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEdit(pessoa)}
                              className="p-2 text-secondary-400 hover:text-accent-600 transition-colors duration-200"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setShowDeleteConfirm(pessoa.id)}
                              className="p-2 text-secondary-400 hover:text-red-600 transition-colors duration-200"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
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
              <div className="px-6 py-4 bg-secondary-50/30 border-t border-secondary-200/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-secondary-500">
                    Mostrando {filteredPessoas.length} de {pessoas.length}{" "}
                    registros
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors duration-200"
                    >
                      Anterior
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 transition-colors duration-200"
                    >
                      Próximo
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

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
