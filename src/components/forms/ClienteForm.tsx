// src/components/forms/ClienteForm.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Save,
  Loader2,
  AlertCircle,
  DollarSign,
  FileText,
  Search,
  Users,
  CheckCircle,
} from "lucide-react";
import {
  Cliente,
  CreateClienteDTO,
  UpdateClienteDTO,
  PessoaFisica,
  PessoaJuridica,
} from "@/types/api";
import { cn } from "@/lib/utils";
import { usePessoasFisicas } from "@/hooks/usePessoasFisicas";
import { usePessoasJuridicas } from "@/hooks/usePessoasJuridicas";
import { useFiliais } from "@/hooks/useFiliais";
import { useClienteSearch } from "@/hooks/useClienteSearch";
import { useClientes } from "@/hooks/useClientes";

interface ClienteFormProps {
  initialData?: Cliente | null;
  onSubmit: (data: CreateClienteDTO | UpdateClienteDTO) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ClienteForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: ClienteFormProps) {
  const [formData, setFormData] = useState<CreateClienteDTO>({
    tipoPessoa: "Fisica",
    pessoaId: 0,
    filialId: 0,
    nome: "",
    razaoSocial: "",
    email: "",
    cpf: "",
    cnpj: "",
    telefone1: "",
    telefone2: "",
    tipo: "fisica",
    status: "ativo",
    segmento: "",
    valorContrato: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [documentoSearch, setDocumentoSearch] = useState("");
  const [searchingCliente, setSearchingCliente] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState<Cliente | null>(
    null
  );
  const [showClienteExistente, setShowClienteExistente] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientesExistentes, setClientesExistentes] = useState<Cliente[]>([]);

  const {
    pessoas: pessoasFisicas,
    loading: loadingPessoasFisicas,
    error: errorPessoasFisicas,
    fetchPessoasFisicas,
    buscarPorCpf,
  } = usePessoasFisicas();
  const {
    pessoas: pessoasJuridicas,
    loading: loadingPessoasJuridicas,
    error: errorPessoasJuridicas,
    fetchPessoasJuridicas,
    buscarPorCnpj,
  } = usePessoasJuridicas();
  const { buscarPorDocumento } = useClienteSearch();
  const {
    filiais,
    loading: loadingFiliais,
    error: errorFiliais,
  } = useFiliais();

  const { clientes } = useClientes();

  // Função para verificar se uma pessoa física já é cliente
  const isPessoaFisicaCliente = (pessoaId: number): Cliente | null => {
    return (
      clientes.find(
        (cliente) => cliente.pessoaFisicaId === pessoaId && cliente.ativo
      ) || null
    );
  };

  // Função para verificar se uma pessoa jurídica já é cliente
  const isPessoaJuridicaCliente = (pessoaId: number): Cliente | null => {
    return (
      clientes.find(
        (cliente) => cliente.pessoaJuridicaId === pessoaId && cliente.ativo
      ) || null
    );
  };

  const handleBuscarClienteExistente = async () => {
    if (!documentoSearch.trim()) return;

    setSearchingCliente(true);
    setClienteEncontrado(null);
    setShowClienteExistente(false);
    setErrorMessage(null);
    setShowError(false);

    try {
      const cliente = await buscarPorDocumento(documentoSearch);
      if (cliente) {
        setClienteEncontrado(cliente);
        setShowClienteExistente(true);
      } else {
        // Se não encontrou cliente, buscar pessoa física/jurídica para criar novo cliente
        const documentoLimpo = documentoSearch.replace(/\D/g, "");

        if (documentoLimpo.length === 11) {
          // CPF - buscar pessoa física
          const pessoa = await buscarPorCpf(documentoSearch);
          if (pessoa) {
            setFormData((prev) => ({
              ...prev,
              tipoPessoa: "Fisica",
              pessoaId: pessoa.id,
              nome: pessoa.nome || "",
              email: pessoa.emailEmpresarial || "",
              cpf: pessoa.cpf || "",
              telefone1: pessoa.telefone1 || "",
              telefone2: pessoa.telefone2 || "",
              tipo: "fisica",
            }));
            setErrorMessage(null);
            setShowError(false);
          } else {
            setErrorMessage(
              `CPF ${documentoSearch} não encontrado no sistema. Cadastre primeiro a pessoa física antes de criar o cliente.`
            );
            setShowError(true);
          }
        } else if (documentoLimpo.length === 14) {
          // CNPJ - buscar pessoa jurídica
          const pessoa = await buscarPorCnpj(documentoSearch);
          if (pessoa) {
            setFormData((prev) => ({
              ...prev,
              tipoPessoa: "Juridica",
              pessoaId: pessoa.id,
              razaoSocial: pessoa.razaoSocial || "",
              email: pessoa.email || "",
              cnpj: pessoa.cnpj || "",
              telefone1: pessoa.telefone1 || "",
              telefone2: pessoa.telefone2 || "",
              tipo: "juridica",
            }));
            setErrorMessage(null);
            setShowError(false);
          } else {
            setErrorMessage(
              `CNPJ ${documentoSearch} não encontrado no sistema. Cadastre primeiro a pessoa jurídica antes de criar o cliente.`
            );
            setShowError(true);
          }
        } else {
          setErrorMessage(
            "Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)"
          );
          setShowError(true);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      setErrorMessage("Erro ao buscar no sistema. Tente novamente.");
      setShowError(true);
    } finally {
      setSearchingCliente(false);
    }
  };

  const selectPessoaFisica = (pessoa: PessoaFisica) => {
    setFormData((prev) => ({
      ...prev,
      tipoPessoa: "Fisica",
      pessoaId: pessoa.id,
      nome: pessoa.nome || "",
      email: pessoa.emailEmpresarial || "",
      cpf: pessoa.cpf || "",
      telefone1: pessoa.telefone1 || "",
      telefone2: pessoa.telefone2 || "",
      tipo: "fisica",
    }));
    setSearchTerm("");
    setErrorMessage(null);
    setShowError(false);
  };

  const selectPessoaJuridica = (pessoa: PessoaJuridica) => {
    setFormData((prev) => ({
      ...prev,
      tipoPessoa: "Juridica",
      pessoaId: pessoa.id,
      razaoSocial: pessoa.razaoSocial || "",
      email: pessoa.email || "",
      cnpj: pessoa.cnpj || "",
      telefone1: pessoa.telefone1 || "",
      telefone2: pessoa.telefone2 || "",
      tipo: "juridica",
    }));
    setSearchTerm("");
    setErrorMessage(null);
    setShowError(false);
  };

  // ✅ REMOVIDO FILTRO CLIENT-SIDE - Backend já filtra os dados otimizadamente
  // Os dados vêm pré-filtrados do endpoint /buscar
  const filteredPessoasFisicas = pessoasFisicas;
  const filteredPessoasJuridicas = pessoasJuridicas;

  // NÃO carregar pessoas automaticamente para melhor performance
  // As buscas serão feitas sob demanda quando o usuário clicar no botão "Buscar"
  // ou quando digitar no campo de pesquisa

  // Busca automática com debounce quando o usuário digita
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 3) {
      // Só busca se tiver 3 ou mais caracteres
      return;
    }

    const timer = setTimeout(() => {
      console.log("🔍 Buscando automaticamente:", searchTerm);
      if (formData.tipo === "fisica") {
        fetchPessoasFisicas(searchTerm, 50);
      } else {
        fetchPessoasJuridicas(searchTerm, 50);
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timer);
  }, [searchTerm, formData.tipo, fetchPessoasFisicas, fetchPessoasJuridicas]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        tipoPessoa: initialData.tipoPessoa || "Fisica",
        pessoaId:
          initialData.pessoaFisicaId || initialData.pessoaJuridicaId || 0,
        filialId: initialData.filialId || 0,
        nome: initialData.nome || "",
        razaoSocial: initialData.razaoSocial || "",
        email: initialData.email || "",
        cpf: initialData.cpf || "",
        cnpj: initialData.cnpj || "",
        telefone1: initialData.telefone1 || "",
        telefone2: initialData.telefone2 || "",
        tipo: initialData.tipo || "fisica",
        status: initialData.status || "ativo",
        segmento: initialData.segmento || "",
        valorContrato: initialData.valorContrato || 0,
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar se uma pessoa foi selecionada
    if (!formData.pessoaId || formData.pessoaId === 0) {
      newErrors.pessoaId =
        "É necessário buscar e selecionar uma pessoa física ou jurídica antes de criar o cliente";
    }

    if (formData.tipo === "fisica") {
      if (!formData.nome?.trim()) {
        newErrors.nome = "Nome é obrigatório para pessoa física";
      }
      if (!formData.cpf?.trim()) {
        newErrors.cpf = "CPF é obrigatório para pessoa física";
      } else {
        // Validar formato do CPF (11 dígitos)
        const cpfLimpo = formData.cpf.replace(/\D/g, "");
        if (cpfLimpo.length !== 11) {
          newErrors.cpf = "CPF deve ter 11 dígitos";
        }
      }
    } else {
      if (!formData.razaoSocial?.trim()) {
        newErrors.razaoSocial =
          "Razão social é obrigatória para pessoa jurídica";
      }
      if (!formData.cnpj?.trim()) {
        newErrors.cnpj = "CNPJ é obrigatório para pessoa jurídica";
      } else {
        // Validar formato do CNPJ (14 dígitos)
        const cnpjLimpo = formData.cnpj.replace(/\D/g, "");
        if (cnpjLimpo.length !== 14) {
          newErrors.cnpj = "CNPJ deve ter 14 dígitos";
        }
      }
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email || "")) {
      newErrors.email = "Email inválido";
    }

    if (!formData.telefone1?.trim()) {
      newErrors.telefone1 = "Telefone é obrigatório";
    }

    if (!formData.filialId || formData.filialId === 0) {
      newErrors.filialId = "Filial é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpar mensagens de erro anteriores
    setErrorMessage(null);
    setShowError(false);

    if (!validateForm()) {
      // Mostrar mensagem de erro geral se a validação falhar
      const errorCount = Object.keys(errors).length;
      setErrorMessage(
        `Formulário contém ${errorCount} erro(s). Verifique os campos destacados em vermelho.`
      );
      setShowError(true);

      // Scroll para o topo para mostrar a mensagem de erro
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const data = initialData
        ? ({ ...formData, id: initialData.id } as UpdateClienteDTO)
        : formData;

      const success = await onSubmit(data);
      if (success) {
        onCancel();
      } else {
        setErrorMessage(
          "Erro ao salvar cliente. Verifique os dados e tente novamente."
        );
        setShowError(true);
      }
    } catch (error: any) {
      console.error("Erro ao salvar cliente:", error);

      // Verificar se é erro de cliente duplicado
      const errorMessage =
        error?.message || error?.response?.data?.message || "";
      if (
        errorMessage.includes(
          "Já existe um cliente cadastrado para esta pessoa"
        )
      ) {
        setShowDuplicateModal(true);
      } else {
        setErrorMessage("Erro inesperado ao salvar cliente. Tente novamente.");
        setShowError(true);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const parseCurrency = (value: string) => {
    return Number(value.replace(/\D/g, "")) / 100;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-auto"
    >
      <div className="flex items-center justify-between p-6 border-b border-secondary-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            {formData.tipo === "fisica" ? (
              <User className="w-6 h-6 text-green-600" />
            ) : (
              <Building2 className="w-6 h-6 text-green-600" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-secondary-900">
              {initialData ? "Editar Cliente" : "Novo Cliente"}
            </h2>
            <p className="text-sm text-secondary-600">
              {initialData
                ? "Atualize as informações do cliente"
                : "Preencha as informações do novo cliente"}
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
        {/* Buscar Cliente Existente */}
        {!initialData && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <label className="block text-sm font-medium text-blue-800 mb-2">
              Buscar Cliente Existente por CPF/CNPJ
            </label>
            <p className="text-xs text-blue-600 mb-3">
              Digite o CPF ou CNPJ para verificar se o cliente já existe ou
              buscar pessoa para criar novo cliente
            </p>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                <input
                  type="text"
                  value={documentoSearch}
                  onChange={(e) => setDocumentoSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Digite CPF (11 dígitos) ou CNPJ (14 dígitos)"
                />
              </div>
              <button
                type="button"
                onClick={handleBuscarClienteExistente}
                disabled={searchingCliente || !documentoSearch.trim()}
                className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
              >
                {searchingCliente ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Buscar</span>
              </button>
            </div>
          </div>
        )}

        {/* Cliente Encontrado */}
        {showClienteExistente && clienteEncontrado && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">
                  Cliente já existe!
                </h4>
                <div className="text-sm text-yellow-700">
                  <p className="font-medium">
                    {clienteEncontrado.pessoaFisica?.nome ||
                      clienteEncontrado.pessoaJuridica?.razaoSocial}
                  </p>
                  <p>
                    {clienteEncontrado.pessoaFisica?.cpf ||
                      clienteEncontrado.pessoaJuridica?.cnpj}
                  </p>
                  <p>Status: {clienteEncontrado.status}</p>
                  {clienteEncontrado.filial && (
                    <p>Filial: {clienteEncontrado.filial.nome}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowClienteExistente(false);
                    setClienteEncontrado(null);
                    setDocumentoSearch("");
                  }}
                  className="mt-2 text-xs text-yellow-600 hover:text-yellow-800 underline"
                >
                  Continuar mesmo assim
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem de Erro */}
        {showError && errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 mb-2">Erro</h4>
                <p className="text-sm text-red-700">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowError(false);
                    setErrorMessage(null);
                    setDocumentoSearch("");
                  }}
                  className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Erro de Pessoa não selecionada */}
        {errors.pessoaId && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 mb-2">
                  Pessoa não selecionada
                </h4>
                <p className="text-sm text-red-700">{errors.pessoaId}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tipo de Cliente */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Tipo de Cliente *
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="fisica"
                checked={formData.tipo === "fisica"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tipo: e.target.value as "fisica" | "juridica",
                  }))
                }
                className="mr-2"
              />
              <User className="w-4 h-4 mr-1" />
              Pessoa Física
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="juridica"
                checked={formData.tipo === "juridica"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tipo: e.target.value as "fisica" | "juridica",
                  }))
                }
                className="mr-2"
              />
              <Building2 className="w-4 h-4 mr-1" />
              Pessoa Jurídica
            </label>
          </div>
        </div>

        {/* Buscar Pessoa por Nome */}
        {!initialData && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <label className="block text-sm font-medium text-green-800 mb-2">
              Buscar Pessoa por Nome
            </label>
            <p className="text-xs text-green-600 mb-3">
              Digite o nome para buscar na lista de pessoas cadastradas
            </p>

            {/* Campo de busca com botão */}
            <div className="flex space-x-2 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (formData.tipo === "fisica") {
                        fetchPessoasFisicas();
                      } else {
                        fetchPessoasJuridicas();
                      }
                    }
                  }}
                  placeholder={
                    formData.tipo === "fisica"
                      ? "Digite nome, email ou CPF..."
                      : "Digite razão social, nome fantasia, email ou CNPJ..."
                  }
                  className="w-full pl-12 pr-4 py-3 border border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  console.log("🔍 Botão Buscar clicado - termo:", searchTerm);
                  if (formData.tipo === "fisica") {
                    fetchPessoasFisicas(searchTerm || "", 50);
                  } else {
                    fetchPessoasJuridicas(searchTerm || "", 50);
                  }
                }}
                disabled={loadingPessoasFisicas || loadingPessoasJuridicas}
                className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
              >
                {loadingPessoasFisicas || loadingPessoasJuridicas ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Buscar</span>
              </button>
            </div>

            {/* Lista de resultados */}
            {(searchTerm || formData.pessoaId > 0) && (
              <div className="max-h-60 overflow-y-auto border border-green-200 rounded-lg">
                {formData.tipo === "fisica" ? (
                  // Lista de Pessoas Físicas
                  loadingPessoasFisicas ? (
                    <div className="p-4 text-center text-green-600">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Carregando pessoas físicas...
                    </div>
                  ) : errorPessoasFisicas ? (
                    <div className="p-4 text-center text-red-600">
                      <AlertCircle className="w-5 h-5 mx-auto mb-2" />
                      Erro ao carregar pessoas físicas
                    </div>
                  ) : filteredPessoasFisicas.length === 0 ? (
                    <div className="p-4 text-center text-green-600">
                      {searchTerm
                        ? "Nenhuma pessoa encontrada com este termo"
                        : "Digite um termo para buscar"}
                    </div>
                  ) : (
                    <div className="divide-y divide-green-100">
                      {filteredPessoasFisicas.map((pessoa) => {
                        const clienteExistente = isPessoaFisicaCliente(
                          pessoa.id
                        );
                        const isJaCliente = !!clienteExistente;

                        return (
                          <button
                            key={pessoa.id}
                            type="button"
                            onClick={() => {
                              if (isJaCliente) {
                                setErrorMessage(
                                  `${pessoa.nome} já é cliente no sistema.`
                                );
                                setShowError(true);
                              } else {
                                selectPessoaFisica(pessoa);
                              }
                            }}
                            className={cn(
                              "w-full p-3 text-left transition-colors duration-200",
                              isJaCliente
                                ? "hover:bg-orange-50 border-l-4 border-orange-400"
                                : "hover:bg-green-50"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <p
                                    className={cn(
                                      "font-medium",
                                      isJaCliente
                                        ? "text-orange-900"
                                        : "text-green-900"
                                    )}
                                  >
                                    {pessoa.nome}
                                  </p>
                                  {isJaCliente && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Já é cliente
                                    </span>
                                  )}
                                </div>
                                <p
                                  className={cn(
                                    "text-sm",
                                    isJaCliente
                                      ? "text-orange-600"
                                      : "text-green-600"
                                  )}
                                >
                                  {pessoa.emailEmpresarial}
                                </p>
                                {pessoa.cpf && (
                                  <p
                                    className={cn(
                                      "text-xs",
                                      isJaCliente
                                        ? "text-orange-500"
                                        : "text-green-500"
                                    )}
                                  >
                                    CPF: {pessoa.cpf}
                                  </p>
                                )}
                                {isJaCliente && clienteExistente && (
                                  <p className="text-xs text-orange-600 mt-1">
                                    Cliente ID: {clienteExistente.id} • Status:{" "}
                                    {clienteExistente.status}
                                  </p>
                                )}
                              </div>
                              <div
                                className={cn(
                                  isJaCliente
                                    ? "text-orange-600"
                                    : "text-green-600"
                                )}
                              >
                                {isJaCliente ? (
                                  <AlertCircle className="w-4 h-4" />
                                ) : (
                                  <User className="w-4 h-4" />
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )
                ) : // Lista de Pessoas Jurídicas
                loadingPessoasJuridicas ? (
                  <div className="p-4 text-center text-green-600">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Carregando pessoas jurídicas...
                  </div>
                ) : errorPessoasJuridicas ? (
                  <div className="p-4 text-center text-red-600">
                    <AlertCircle className="w-5 h-5 mx-auto mb-2" />
                    Erro ao carregar pessoas jurídicas
                  </div>
                ) : filteredPessoasJuridicas.length === 0 ? (
                  <div className="p-4 text-center text-green-600">
                    {searchTerm
                      ? "Nenhuma pessoa encontrada com este termo"
                      : "Digite um termo para buscar"}
                  </div>
                ) : (
                  <div className="divide-y divide-green-100">
                    {filteredPessoasJuridicas.map((pessoa) => {
                      const clienteExistente = isPessoaJuridicaCliente(
                        pessoa.id
                      );
                      const isJaCliente = !!clienteExistente;

                      return (
                        <button
                          key={pessoa.id}
                          type="button"
                          onClick={() => {
                            if (isJaCliente) {
                              setErrorMessage(
                                `${pessoa.razaoSocial} já é cliente no sistema.`
                              );
                              setShowError(true);
                            } else {
                              selectPessoaJuridica(pessoa);
                            }
                          }}
                          className={cn(
                            "w-full p-3 text-left transition-colors duration-200",
                            isJaCliente
                              ? "hover:bg-orange-50 border-l-4 border-orange-400"
                              : "hover:bg-green-50"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p
                                  className={cn(
                                    "font-medium",
                                    isJaCliente
                                      ? "text-orange-900"
                                      : "text-green-900"
                                  )}
                                >
                                  {pessoa.razaoSocial}
                                </p>
                                {isJaCliente && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Já é cliente
                                  </span>
                                )}
                              </div>
                              {pessoa.nomeFantasia && (
                                <p
                                  className={cn(
                                    "text-sm",
                                    isJaCliente
                                      ? "text-orange-600"
                                      : "text-green-600"
                                  )}
                                >
                                  {pessoa.nomeFantasia}
                                </p>
                              )}
                              <p
                                className={cn(
                                  "text-sm",
                                  isJaCliente
                                    ? "text-orange-600"
                                    : "text-green-600"
                                )}
                              >
                                {pessoa.email}
                              </p>
                              {pessoa.cnpj && (
                                <p
                                  className={cn(
                                    "text-xs",
                                    isJaCliente
                                      ? "text-orange-500"
                                      : "text-green-500"
                                  )}
                                >
                                  CNPJ: {pessoa.cnpj}
                                </p>
                              )}
                              {isJaCliente && clienteExistente && (
                                <p className="text-xs text-orange-600 mt-1">
                                  Cliente ID: {clienteExistente.id} • Status:{" "}
                                  {clienteExistente.status}
                                </p>
                              )}
                            </div>
                            <div
                              className={cn(
                                isJaCliente
                                  ? "text-orange-600"
                                  : "text-green-600"
                              )}
                            >
                              {isJaCliente ? (
                                <AlertCircle className="w-4 h-4" />
                              ) : (
                                <Building2 className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Pessoa Selecionada */}
            {formData.pessoaId > 0 && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-4 mt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-green-800 font-medium mb-2">
                      Pessoa selecionada:
                    </p>
                    <div className="space-y-1">
                      <p className="text-sm text-green-900 font-semibold">
                        {formData.tipo === "fisica"
                          ? formData.nome
                          : formData.razaoSocial}
                      </p>
                      <p className="text-xs text-green-700">
                        Email: {formData.email}
                      </p>
                      <p className="text-xs text-green-700">
                        {formData.tipo === "fisica"
                          ? `CPF: ${formData.cpf}`
                          : `CNPJ: ${formData.cnpj}`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        pessoaId: 0,
                        nome: "",
                        razaoSocial: "",
                        email: "",
                        cpf: "",
                        cnpj: "",
                        telefone1: "",
                        telefone2: "",
                      }));
                      setSearchTerm("");
                    }}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome/Razão Social */}
          {formData.tipo === "fisica" ? (
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
                    "w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
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
          ) : (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Razão Social *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.razaoSocial}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      razaoSocial: e.target.value,
                    }))
                  }
                  className={cn(
                    "w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
                    errors.razaoSocial
                      ? "border-red-300 focus:ring-red-500"
                      : "border-secondary-300"
                  )}
                  placeholder="Razão social"
                />
              </div>
              {errors.razaoSocial && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.razaoSocial}
                </p>
              )}
            </div>
          )}

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
                  "w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
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

          {/* CPF/CNPJ */}
          {formData.tipo === "fisica" ? (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                CPF *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cpf: e.target.value }))
                  }
                  className={cn(
                    "w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
                    errors.cpf
                      ? "border-red-300 focus:ring-red-500"
                      : "border-secondary-300"
                  )}
                  placeholder="000.000.000-00"
                />
              </div>
              {errors.cpf && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.cpf}
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                CNPJ *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cnpj: e.target.value }))
                  }
                  className={cn(
                    "w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
                    errors.cnpj
                      ? "border-red-300 focus:ring-red-500"
                      : "border-secondary-300"
                  )}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              {errors.cnpj && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.cnpj}
                </p>
              )}
            </div>
          )}

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
                  "w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
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
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              {loadingFiliais ? (
                <div className="w-full px-4 py-3 border border-secondary-300 rounded-xl bg-gray-50 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Carregando filiais...
                </div>
              ) : errorFiliais ? (
                <div className="w-full px-4 py-3 border border-red-300 rounded-xl bg-red-50 text-red-600">
                  Erro ao carregar filiais: {errorFiliais}
                </div>
              ) : (
                <select
                  value={formData.filialId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      filialId: parseInt(e.target.value) || 0,
                    }))
                  }
                  className={cn(
                    "w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
                    errors.filialId
                      ? "border-red-300 focus:ring-red-500"
                      : "border-secondary-300"
                  )}
                >
                  <option value={0}>Selecione uma filial</option>
                  {filiais.map((filial) => (
                    <option key={filial.id} value={filial.id}>
                      {filial.nome}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {errors.filialId && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.filialId}
              </p>
            )}
          </div>

          {/* Segmento */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Segmento
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                value={formData.segmento}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, segmento: e.target.value }))
                }
                className="w-full pl-12 pr-4 py-3 border border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder="Ex: Tecnologia, Saúde, Educação"
              />
            </div>
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
                    | "prospecto"
                    | "arquivado",
                }))
              }
              className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="prospecto">Prospecto</option>
              <option value="arquivado">Arquivado</option>
            </select>
          </div>

          {/* Valor do Contrato */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Valor do Contrato
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                value={formatCurrency(formData.valorContrato || 0)}
                onChange={(e) => {
                  const value = parseCurrency(e.target.value);
                  setFormData((prev) => ({ ...prev, valorContrato: value }));
                }}
                className="w-full pl-12 pr-4 py-3 border border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder="R$ 0,00"
              />
            </div>
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

      {/* Modal de Cliente Duplicado */}
      <AnimatePresence>
        {showDuplicateModal && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowDuplicateModal(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-lg font-semibold text-white">
                        Cliente já cadastrado
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowDuplicateModal(false)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Cliente já cadastrado no sistema
                    </h3>
                    <p className="text-gray-600">
                      A pessoa{" "}
                      <strong>
                        {formData.tipo === "fisica"
                          ? formData.nome
                          : formData.razaoSocial}
                      </strong>{" "}
                      já possui um cliente cadastrado no sistema.
                    </p>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={() => {
                        setShowDuplicateModal(false);
                        // Buscar o cliente existente
                        const documento =
                          formData.tipo === "fisica"
                            ? formData.cpf
                            : formData.cnpj;
                        if (documento) {
                          setDocumentoSearch(documento);
                          handleBuscarClienteExistente();
                        }
                      }}
                      className="w-full px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium"
                    >
                      Ver Cliente Existente
                    </button>
                    <button
                      onClick={() => {
                        setShowDuplicateModal(false);
                        // Limpar formulário para escolher outra pessoa
                        setFormData((prev) => ({
                          ...prev,
                          pessoaId: 0,
                          nome: "",
                          razaoSocial: "",
                          email: "",
                          cpf: "",
                          cnpj: "",
                          telefone1: "",
                          telefone2: "",
                        }));
                        setSearchTerm("");
                      }}
                      className="w-full px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
                    >
                      Escolher Outra Pessoa
                    </button>
                    <button
                      onClick={() => setShowDuplicateModal(false)}
                      className="w-full px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
