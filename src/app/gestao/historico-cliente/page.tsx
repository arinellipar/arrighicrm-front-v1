"use client";

import React, { useState, useEffect } from "react";
import { History, Search, Users, Building2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import MainLayout from "@/components/MainLayout";
import { PermissionWrapper } from "@/components/permissions";
import { useClientes } from "@/hooks/useClientes";
import { HistoricoClienteModal } from "@/components/historico/HistoricoClienteModal";
import type { Cliente } from "@/types/api";
import { cn } from "@/lib/utils";

export default function HistoricoClientePage() {
  const { clientes, loading, fetchClientes } = useClientes();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // Filtrar clientes
  const filteredClientes = clientes.filter((cliente: Cliente) => {
    if (!cliente) return false;

    const nome = cliente.nome || "";
    const razaoSocial = cliente.razaoSocial || "";
    const email = cliente.email || "";
    const cpf = cliente.cpf || "";
    const cnpj = cliente.cnpj || "";

    const searchLower = searchTerm.toLowerCase();
    return (
      nome.toLowerCase().includes(searchLower) ||
      razaoSocial.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower) ||
      cpf.includes(searchTerm) ||
      cnpj.includes(searchTerm)
    );
  });

  const handleOpenHistorico = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCliente(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string }> = {
      ativo: { bg: "bg-green-100", text: "text-green-800" },
      inativo: { bg: "bg-red-100", text: "text-red-800" },
      prospecto: { bg: "bg-yellow-100", text: "text-yellow-800" },
      arquivado: { bg: "bg-gray-100", text: "text-gray-800" },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.inativo;

    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          config.bg,
          config.text
        )}
      >
        {status || "Inativo"}
      </span>
    );
  };

  return (
    <PermissionWrapper
      modulo="Cliente"
      acao="Visualizar"
      fallback={
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Acesso Negado
              </h3>
              <p className="text-gray-500">
                Você não tem permissão para acessar o histórico de clientes.
              </p>
            </div>
          </div>
        </MainLayout>
      }
    >
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl text-white">
                <History className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  Histórico do Cliente
                </h1>
                <p className="text-sm text-secondary-600 mt-1">
                  Visualize o histórico de mudanças de cada cliente
                </p>
              </div>
            </div>
          </motion.div>

          {/* Busca */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-secondary-200/50"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome, CPF/CNPJ ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </motion.div>

          {/* Tabela */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-secondary-200/50 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-secondary-200/50">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Clientes ({filteredClientes.length})
                </h3>
              </div>

              {filteredClientes.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    Nenhum cliente encontrado
                  </h3>
                  <p className="text-secondary-600">
                    {searchTerm
                      ? "Tente ajustar o termo de busca"
                      : "Nenhum cliente cadastrado"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary-50/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          CPF/CNPJ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-200/50">
                      {filteredClientes.map(
                        (cliente: Cliente, index: number) => (
                          <motion.tr
                            key={cliente.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index }}
                            className="hover:bg-secondary-50/50 transition-colors duration-200"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                  {cliente.tipo === "fisica" ? (
                                    <Users className="w-5 h-5 text-white" />
                                  ) : (
                                    <Building2 className="w-5 h-5 text-white" />
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-secondary-900">
                                    {cliente.nome || cliente.razaoSocial}
                                  </div>
                                  <div className="text-xs text-secondary-500">
                                    {cliente.tipo === "fisica"
                                      ? "Pessoa Física"
                                      : "Pessoa Jurídica"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                              {cliente.cpf || cliente.cnpj || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                              {cliente.email || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(cliente.status || "inativo")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => handleOpenHistorico(cliente)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                              >
                                <History className="w-4 h-4" />
                                Histórico
                              </button>
                            </td>
                          </motion.tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </MainLayout>

      {/* Modal de Histórico */}
      {selectedCliente && (
        <HistoricoClienteModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          cliente={selectedCliente}
        />
      )}
    </PermissionWrapper>
  );
}
