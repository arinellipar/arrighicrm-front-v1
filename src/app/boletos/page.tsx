// src/app/boletos/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useBoletos } from "@/hooks/useBoletos";
import { BoletoCard } from "@/components/boletos/BoletoCard";
import { Boleto, BoletoStatus, BoletoFilters } from "@/types/boleto";
import { StatusBadge } from "@/components/boletos/StatusBadge";
import { Plus, Search, Filter, RefreshCw } from "lucide-react";

export default function BoletosPage() {
  const {
    boletos,
    loading,
    error,
    fetchBoletos,
    syncBoleto,
    deleteBoleto,
    clearError,
  } = useBoletos();

  const [filters, setFilters] = useState<BoletoFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchBoletos();
  }, [fetchBoletos]);

  const handleSync = async (boleto: Boleto) => {
    if (boleto.status !== "REGISTRADO") return;

    setSyncingId(boleto.id);
    try {
      await syncBoleto(boleto.id);
      // Recarregar lista após sincronização
      await fetchBoletos();
    } catch (error) {
      console.error("Erro ao sincronizar boleto:", error);
    } finally {
      setSyncingId(null);
    }
  };

  const handleDelete = async (boleto: Boleto) => {
    if (boleto.status === "LIQUIDADO") return;

    if (!confirm(`Deseja realmente cancelar o boleto #${boleto.id}?`)) {
      return;
    }

    setDeletingId(boleto.id);
    try {
      await deleteBoleto(boleto.id);
      // Recarregar lista após exclusão
      await fetchBoletos();
    } catch (error) {
      console.error("Erro ao cancelar boleto:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDetails = (boleto: Boleto) => {
    // TODO: Implementar modal de detalhes
    console.log("Ver detalhes do boleto:", boleto);
  };

  const handleFilterChange = (key: keyof BoletoFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const applyFilters = () => {
    fetchBoletos(filters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
    fetchBoletos();
  };

  const filteredBoletos = boletos.filter((boleto) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      boleto.id.toString().includes(searchLower) ||
      boleto.nsuCode.toLowerCase().includes(searchLower) ||
      boleto.payerName.toLowerCase().includes(searchLower) ||
      boleto.contrato?.clienteNome?.toLowerCase().includes(searchLower) ||
      boleto.contrato?.numeroContrato?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Boletos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie todos os boletos do sistema
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          Novo Boleto
        </button>
      </div>

      {/* Barra de pesquisa e filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Campo de pesquisa */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por ID, NSU, cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>
            <button
              onClick={() => fetchBoletos()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
              Atualizar
            </button>
          </div>
        </div>

        {/* Filtros expandidos */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status || ""}
                  onChange={(e) =>
                    handleFilterChange("status", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="REGISTRADO">Registrado</option>
                  <option value="LIQUIDADO">Liquidado</option>
                  <option value="VENCIDO">Vencido</option>
                  <option value="CANCELADO">Cancelado</option>
                  <option value="ERRO">Erro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={filters.dataInicio || ""}
                  onChange={(e) =>
                    handleFilterChange("dataInicio", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Final
                </label>
                <input
                  type="date"
                  value={filters.dataFim || ""}
                  onChange={(e) =>
                    handleFilterChange("dataFim", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aplicar Filtros
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Limpar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-red-800">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Carregando boletos...</span>
        </div>
      )}

      {/* Lista de boletos */}
      {!loading && (
        <>
          <div className="mb-4">
            <p className="text-gray-600">
              {filteredBoletos.length} boleto
              {filteredBoletos.length !== 1 ? "s" : ""} encontrado
              {filteredBoletos.length !== 1 ? "s" : ""}
            </p>
          </div>

          {filteredBoletos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhum boleto encontrado</p>
              <p className="text-gray-400 mt-2">
                {searchTerm || Object.keys(filters).length > 0
                  ? "Tente ajustar os filtros de busca"
                  : "Comece criando seu primeiro boleto"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBoletos.map((boleto) => (
                <BoletoCard
                  key={boleto.id}
                  boleto={boleto}
                  onViewDetails={handleViewDetails}
                  onSync={() => handleSync(boleto)}
                  onDelete={() => handleDelete(boleto)}
                  className={
                    syncingId === boleto.id || deletingId === boleto.id
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
