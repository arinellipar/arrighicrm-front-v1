// src/app/usuarios/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  Loader2,
  Shield,
  User,
  Building2,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import MainLayout from "@/components/MainLayout";
import UsuarioForm from "@/components/forms/UsuarioForm";
import { useUsuario } from "@/hooks/useUsuario";
import { Usuario, PessoaFisicaOption, PessoaJuridicaOption } from "@/types/api";
import { cn } from "@/lib/utils";
import { useForm } from "@/contexts/FormContext";

function StatusBadge({ status }: { status: "ativo" | "inativo" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
        status === "ativo"
          ? "bg-green-100 text-green-800 border border-green-200"
          : "bg-red-100 text-red-800 border border-red-200"
      )}
    >
      {status === "ativo" ? (
        <CheckCircle className="w-3 h-3 mr-1" />
      ) : (
        <XCircle className="w-3 h-3 mr-1" />
      )}
      {status === "ativo" ? "Ativo" : "Inativo"}
    </span>
  );
}

function TipoPessoaBadge({ tipo }: { tipo: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        tipo === "Fisica"
          ? "bg-blue-100 text-blue-800"
          : "bg-purple-100 text-purple-800"
      )}
    >
      {tipo === "Fisica" ? (
        <User className="w-3 h-3 mr-1" />
      ) : (
        <Building2 className="w-3 h-3 mr-1" />
      )}
      {tipo === "Fisica" ? "Pessoa Física" : "Pessoa Jurídica"}
    </span>
  );
}

function GrupoAcessoBadge({ grupo }: { grupo: string }) {
  const getColor = (grupo: string) => {
    switch (grupo) {
      case "Administrador":
        return "bg-red-100 text-red-800 border-red-200";
      case "Usuario":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Visualizador":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        getColor(grupo)
      )}
    >
      <Shield className="w-3 h-3 mr-1" />
      {grupo}
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

export default function UsuariosPage() {
  const {
    usuarios,
    loading,
    error,
    creating,
    updating,
    deleting,
    fetchUsuarios,
    fetchPessoasFisicas,
    fetchPessoasJuridicas,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    clearError,
  } = useUsuario();

  const { openForm, closeForm } = useForm();

  const [showForm, setShowForm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrupo, setFilterGrupo] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );
  const [pessoasFisicas, setPessoasFisicas] = useState<PessoaFisicaOption[]>(
    []
  );
  const [pessoasJuridicas, setPessoasJuridicas] = useState<
    PessoaJuridicaOption[]
  >([]);

  // Carregar dados auxiliares
  useEffect(() => {
    const loadAuxData = async () => {
      const [pf, pj] = await Promise.all([
        fetchPessoasFisicas(),
        fetchPessoasJuridicas(),
      ]);
      setPessoasFisicas(pf);
      setPessoasJuridicas(pj);
    };
    loadAuxData();
  }, [fetchPessoasFisicas, fetchPessoasJuridicas]);

  // Filtrar usuários
  const filteredUsuarios = usuarios.filter((usuario) => {
    const matchesSearch =
      usuario.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usuario.pessoaFisica &&
        usuario.pessoaFisica.nome
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (usuario.pessoaJuridica &&
        usuario.pessoaJuridica.razaoSocial
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesGrupo = !filterGrupo || usuario.grupoAcesso === filterGrupo;
    const matchesTipo = !filterTipo || usuario.tipoPessoa === filterTipo;
    const matchesStatus =
      !filterStatus ||
      (filterStatus === "ativo" ? usuario.ativo : !usuario.ativo);

    return matchesSearch && matchesGrupo && matchesTipo && matchesStatus;
  });

  const handleCreateOrUpdate = async (data: any) => {
    if (editingUsuario) {
      return await updateUsuario(editingUsuario.id, data);
    } else {
      return await createUsuario(data);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setShowForm(true);
    openForm();
  };

  const handleDelete = async (id: number) => {
    const success = await deleteUsuario(id);
    if (success) {
      setShowDeleteConfirm(null);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUsuario(null);
    clearError();
    closeForm();
  };

  const handleOpenForm = () => {
    if (pessoasFisicas.length === 0 && pessoasJuridicas.length === 0) {
      alert(
        "É necessário cadastrar pelo menos uma pessoa física ou jurídica antes de criar um usuário."
      );
      return;
    }
    setShowForm(true);
    openForm();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  // Estatísticas calculadas
  const stats = {
    total: usuarios.length,
    ativos: usuarios.filter((u) => u.ativo).length,
    inativos: usuarios.filter((u) => !u.ativo).length,
    administradores: usuarios.filter((u) => u.grupoAcesso === "Administrador")
      .length,
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
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Usuários</h1>
              <p className="text-secondary-600">
                Gerenciar usuários do sistema
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenForm}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-medium shadow-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Usuário</span>
          </motion.button>
        </motion.div>

        {/* Aviso se não há pessoas cadastradas */}
        {pessoasFisicas.length === 0 && pessoasJuridicas.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800">
                <strong>Atenção:</strong> É necessário ter pelo menos uma pessoa
                física ou jurídica cadastrada para criar usuários.
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por login, email ou pessoa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <select
              value={filterGrupo}
              onChange={(e) => setFilterGrupo(e.target.value)}
              className="px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Todos os grupos</option>
              <option value="Administrador">Administrador</option>
              <option value="Usuario">Usuário</option>
              <option value="Visualizador">Visualizador</option>
            </select>

            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Todos os tipos</option>
              <option value="Fisica">Pessoa Física</option>
              <option value="Juridica">Pessoa Jurídica</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </motion.div>

        {/* Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-secondary-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 text-sm font-medium">
                  Total de Usuários
                </p>
                <p className="text-3xl font-bold text-secondary-900">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-secondary-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 text-sm font-medium">
                  Usuários Ativos
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.ativos}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-secondary-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 text-sm font-medium">
                  Usuários Inativos
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.inativos}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-secondary-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 text-sm font-medium">
                  Administradores
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.administradores}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabela ou Estados de Loading/Error */}
        {error ? (
          <ErrorMessage message={error} onRetry={fetchUsuarios} />
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
                Lista de Usuários ({filteredUsuarios.length} registros)
              </h3>
            </div>

            {filteredUsuarios.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  {searchTerm || filterGrupo || filterTipo || filterStatus
                    ? "Nenhum resultado encontrado"
                    : "Nenhum usuário cadastrado"}
                </h3>
                <p className="text-secondary-600">
                  {searchTerm || filterGrupo || filterTipo || filterStatus
                    ? "Tente ajustar os filtros de busca"
                    : pessoasFisicas.length === 0 &&
                      pessoasJuridicas.length === 0
                    ? "Cadastre primeiro uma pessoa física ou jurídica"
                    : "Clique em 'Novo Usuário' para começar"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Pessoa Vinculada
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Grupo de Acesso
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Último Acesso
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200/50">
                    {filteredUsuarios.map((usuario, index) => (
                      <motion.tr
                        key={usuario.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        className="hover:bg-secondary-50/50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-white">
                                {usuario.login.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-secondary-900">
                                {usuario.login}
                              </div>
                              <div className="text-sm text-secondary-500">
                                {usuario.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {usuario.pessoaFisica ? (
                            <div>
                              <div className="text-sm font-medium text-secondary-900">
                                {usuario.pessoaFisica.nome}
                              </div>
                              <div className="text-sm text-secondary-500">
                                {usuario.pessoaFisica.cpf}
                              </div>
                            </div>
                          ) : usuario.pessoaJuridica ? (
                            <div>
                              <div className="text-sm font-medium text-secondary-900">
                                {usuario.pessoaJuridica.razaoSocial}
                              </div>
                              <div className="text-sm text-secondary-500">
                                {usuario.pessoaJuridica.cnpj}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-secondary-400">
                              Não vinculado
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <GrupoAcessoBadge grupo={usuario.grupoAcesso} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <TipoPessoaBadge tipo={usuario.tipoPessoa} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge
                            status={usuario.ativo ? "ativo" : "inativo"}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                          {usuario.ultimoAcesso ? (
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {formatDateTime(usuario.ultimoAcesso)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-secondary-400">
                              Nunca acessou
                            </span>
                          )}
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
                              onClick={() => handleEdit(usuario)}
                              className="p-2 text-secondary-400 hover:text-accent-600 transition-colors duration-200"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setShowDeleteConfirm(usuario.id)}
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
            {filteredUsuarios.length > 0 && (
              <div className="px-6 py-4 bg-secondary-50/30 border-t border-secondary-200/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-secondary-500">
                    Mostrando {filteredUsuarios.length} de {usuarios.length}{" "}
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
                <UsuarioForm
                  initialData={editingUsuario}
                  pessoasFisicas={pessoasFisicas}
                  pessoasJuridicas={pessoasJuridicas}
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
                  Tem certeza que deseja excluir este usuário? Esta ação não
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
