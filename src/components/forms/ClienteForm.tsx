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
      className="bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-neutral-800 max-w-4xl w-full mx-auto"
    >
      <div className="flex items-center justify-between p-6 border-b border-neutral-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg">
            {formData.tipo === "fisica" ? (
              <User className="w-6 h-6 text-neutral-900" />
            ) : (
              <Building2 className="w-6 h-6 text-neutral-900" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              {initialData ? "Editar Cliente" : "Novo Cliente"}
            </h2>
            <p className="text-sm text-neutral-400">
              {initialData
                ? "Atualize as informações do cliente"
                : "Preencha as informações do novo cliente"}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200 border border-transparent hover:border-red-500/30"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Buscar Cliente Existente */}
        {!initialData && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <label className="block text-sm font-medium text-amber-300 mb-2">
              Buscar Cliente Existente por CPF/CNPJ
            </label>
            <p className="text-xs text-amber-400 mb-3">
              Digite o CPF ou CNPJ para verificar se o cliente já existe ou
              buscar pessoa para criar novo cliente
            </p>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 w-5 h-5" />
                <input
                  type="text"
                  value={documentoSearch}
                  onChange={(e) => setDocumentoSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-neutral-900/50 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all duration-200 text-neutral-100 placeholder:text-neutral-500"
                  placeholder="Digite CPF (11 dígitos) ou CNPJ (14 dígitos)"
                />
              </div>
              <button
                type="button"
                onClick={handleBuscarClienteExistente}
                disabled={searchingCliente || !documentoSearch.trim()}
                className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-neutral-900 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2 font-medium"
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
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-amber-300 mb-2">
                  Cliente já existe!
                </h4>
                <div className="text-sm text-amber-200">
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
                  className="mt-2 text-xs text-amber-400 hover:text-amber-300 underline"
                >
                  Continuar mesmo assim
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem de Erro */}
        {showError && errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-400 mb-2">Erro</h4>
                <p className="text-sm text-red-300">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowError(false);
                    setErrorMessage(null);
                    setDocumentoSearch("");
                  }}
                  className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Erro de Pessoa não selecionada */}
        {errors.pessoaId && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-400 mb-2">
                  Pessoa não selecionada
                </h4>
                <p className="text-sm text-red-300">{errors.pessoaId}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tipo de Cliente */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Tipo de Cliente *
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center text-neutral-300 cursor-pointer">
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
                className="mr-2 w-4 h-4 text-amber-500 focus:ring-amber-500"
              />
              <User className="w-4 h-4 mr-1" />
              Pessoa Física
            </label>
            <label className="flex items-center text-neutral-300 cursor-pointer">
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
                className="mr-2 w-4 h-4 text-amber-500 focus:ring-amber-500"
              />
              <Building2 className="w-4 h-4 mr-1" />
              Pessoa Jurídica
            </label>
          </div>
        </div>

        {/* Buscar Pessoa por Nome */}
        {!initialData && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <label className="block text-sm font-medium text-green-300 mb-2">
              Buscar Pessoa por Nome
            </label>
            <p className="text-xs text-green-400 mb-3">
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
                  className="w-full pl-12 pr-4 py-3 bg-neutral-900/50 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-200 text-neutral-100 placeholder:text-neutral-500"
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
                className="px-4 py-3 bg-green-500 hover:bg-green-600 text-neutral-900 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2 font-medium"
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
              <div className="max-h-60 overflow-y-auto border border-neutral-700 rounded-lg bg-neutral-900/30">
                {formData.tipo === "fisica" ? (
                  // Lista de Pessoas Físicas
                  loadingPessoasFisicas ? (
                    <div className="p-4 text-center text-green-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Carregando pessoas físicas...
                    </div>
                  ) : errorPessoasFisicas ? (
                    <div className="p-4 text-center text-red-400">
                      <AlertCircle className="w-5 h-5 mx-auto mb-2" />
                      Erro ao carregar pessoas físicas
                    </div>
                  ) : filteredPessoasFisicas.length === 0 ? (
                    <div className="p-4 text-center text-green-400">
                      {searchTerm
                        ? "Nenhuma pessoa encontrada com este termo"
                        : "Digite um termo para buscar"}
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-700">
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
                                ? "hover:bg-orange-500/10 border-l-4 border-orange-500/50"
                                : "hover:bg-green-500/10"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <p
                                    className={cn(
                                      "font-medium",
                                      isJaCliente
                                        ? "text-orange-300"
                                        : "text-green-300"
                                    )}
                                  >
                                    {pessoa.nome}
                                  </p>
                                  {isJaCliente && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Já é cliente
                                    </span>
                                  )}
                                </div>
                                <p
                                  className={cn(
                                    "text-sm",
                                    isJaCliente
                                      ? "text-orange-400"
                                      : "text-green-400"
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
                                  <p className="text-xs text-orange-400 mt-1">
                                    Cliente ID: {clienteExistente.id} • Status:{" "}
                                    {clienteExistente.status}
                                  </p>
                                )}
                              </div>
                              <div
                                className={cn(
                                  isJaCliente
                                    ? "text-orange-400"
                                    : "text-green-400"
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
                  <div className="p-4 text-center text-green-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Carregando pessoas jurídicas...
                  </div>
                ) : errorPessoasJuridicas ? (
                  <div className="p-4 text-center text-red-400">
                    <AlertCircle className="w-5 h-5 mx-auto mb-2" />
                    Erro ao carregar pessoas jurídicas
                  </div>
                ) : filteredPessoasJuridicas.length === 0 ? (
                  <div className="p-4 text-center text-green-400">
                    {searchTerm
                      ? "Nenhuma pessoa encontrada com este termo"
                      : "Digite um termo para buscar"}
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-700">
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
                              ? "hover:bg-orange-500/10 border-l-4 border-orange-500/50"
                              : "hover:bg-green-500/10"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p
                                  className={cn(
                                    "font-medium",
                                    isJaCliente
                                      ? "text-orange-300"
                                      : "text-green-300"
                                  )}
                                >
                                  {pessoa.razaoSocial}
                                </p>
                                {isJaCliente && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
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
                                      ? "text-orange-400"
                                      : "text-green-400"
                                  )}
                                >
                                  {pessoa.nomeFantasia}
                                </p>
                              )}
                              <p
                                className={cn(
                                  "text-sm",
                                  isJaCliente
                                    ? "text-orange-400"
                                    : "text-green-400"
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
                                <p className="text-xs text-orange-400 mt-1">
                                  Cliente ID: {clienteExistente.id} • Status:{" "}
                                  {clienteExistente.status}
                                </p>
                              )}
                            </div>
                            <div
                              className={cn(
                                isJaCliente
                                  ? "text-orange-400"
                                  : "text-green-400"
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
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-green-300 font-medium mb-2">
                      Pessoa selecionada:
                    </p>
                    <div className="space-y-1">
                      <p className="text-sm text-green-200 font-semibold">
                        {formData.tipo === "fisica"
                          ? formData.nome
                          : formData.razaoSocial}
                      </p>
                      <p className="text-xs text-green-400">
                        Email: {formData.email}
                      </p>
                      <p className="text-xs text-green-400">
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
                    className="text-green-400 hover:text-green-300"
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
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Nome Completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nome: e.target.value }))
                  }
                  className={cn(
                    "w-full pl-12 pr-4 py-3 bg-neutral-900/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all duration-200 text-neutral-100 placeholder:text-neutral-500",
                    errors.nome
                      ? "border-red-500 focus:ring-red-500/50"
                      : "border-neutral-700"
                  )}
                  placeholder="Nome completo"
                />
              </div>
              {errors.nome && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.nome}
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Razão Social *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
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
                    "w-full pl-12 pr-4 py-3 bg-neutral-900/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all duration-200 text-neutral-100 placeholder:text-neutral-500",
                    errors.razaoSocial
                      ? "border-red-500 focus:ring-red-500/50"
                      : "border-neutral-700"
                  )}
                  placeholder="Razão social"
                />
              </div>
              {errors.razaoSocial && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.razaoSocial}
                </p>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className={cn(
                  "w-full pl-12 pr-4 py-3 bg-neutral-900/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all duration-200 text-neutral-100 placeholder:text-neutral-500",
                  errors.email
                    ? "border-red-500 focus:ring-red-500/50"
                    : "border-neutral-700"
                )}
                placeholder="email@exemplo.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* CPF/CNPJ */}
          {formData.tipo === "fisica" ? (
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                CPF *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cpf: e.target.value }))
                  }
                  className={cn(
                    "w-full pl-12 pr-4 py-3 bg-neutral-900/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all duration-200 text-neutral-100 placeholder:text-neutral-500",
                    errors.cpf
                      ? "border-red-500 focus:ring-red-500/50"
                      : "border-neutral-700"
                  )}
                  placeholder="000.000.000-00"
                />
              </div>
              {errors.cpf && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.cpf}
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                CNPJ *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cnpj: e.target.value }))
                  }
                  className={cn(
                    "w-full pl-12 pr-4 py-3 bg-neutral-900/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all duration-200 text-neutral-100 placeholder:text-neutral-500",
                    errors.cnpj
                      ? "border-red-500 focus:ring-red-500/50"
                      : "border-neutral-700"
                  )}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              {errors.cnpj && (
                <p className="mt-1 text-sm text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.cnpj}
                </p>
              )}
            </div>
          )}

          {/* Telefone 1 */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Telefone Principal *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
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
                  "w-full pl-12 pr-4 py-3 bg-neutral-900/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all duration-200 text-neutral-100 placeholder:text-neutral-500",
                  errors.telefone1
                    ? "border-red-500 focus:ring-red-500/50"
                    : "border-neutral-700"
                )}
                placeholder="(11) 99999-9999"
              />
            </div>
            {errors.telefone1 && (
              <p className="mt-1 text-sm text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.telefone1}
              </p>
            )}
          </div>

          {/* Telefone 2 */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Telefone Secundário
            </label>
            <input
              type="tel"
              value={formData.telefone2}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, telefone2: e.target.value }))
              }
              className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all duration-200 text-neutral-100 placeholder:text-neutral-500"
              placeholder="(11) 88888-8888"
            />
          </div>

          {/* Filial */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Filial *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
              {loadingFiliais ? (
                <div className="w-full px-4 py-3 border border-neutral-700 rounded-xl bg-neutral-900/50 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2 text-amber-400" />
                  <span className="text-neutral-300">Carregando filiais...</span>
                </div>
              ) : errorFiliais ? (
                <div className="w-full px-4 py-3 border border-red-500 rounded-xl bg-red-500/10 text-red-400">
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
                    "w-full pl-12 pr-4 py-3 bg-neutral-900/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all duration-200 text-neutral-100",
                    errors.filialId
                      ? "border-red-500 focus:ring-red-500/50"
                      : "border-neutral-700",
                    "[&>option]:bg-neutral-900 [&>option]:text-neutral-200"
                  )}
                >
                  <option value={0} className="text-neutral-500">Selecione uma filial</option>
                  {filiais.map((filial) => (
                    <option key={filial.id} value={filial.id} className="bg-neutral-900 text-neutral-200">
                      {filial.nome}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {errors.filialId && (
              <p className="mt-1 text-sm text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.filialId}
              </p>
            )}
          </div>

          {/* Segmento */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Segmento
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
              <input
                type="text"
                value={formData.segmento}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, segmento: e.target.value }))
                }
                className="w-full pl-12 pr-4 py-3 bg-neutral-900/50 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all duration-200 text-neutral-100 placeholder:text-neutral-500"
                placeholder="Ex: Tecnologia, Saúde, Educação"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
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
              className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all duration-200 text-neutral-100 [&>option]:bg-neutral-900 [&>option]:text-neutral-200"
            >
              <option value="ativo" className="bg-neutral-900 text-neutral-200">Ativo</option>
              <option value="inativo" className="bg-neutral-900 text-neutral-200">Inativo</option>
              <option value="prospecto" className="bg-neutral-900 text-neutral-200">Prospecto</option>
              <option value="arquivado" className="bg-neutral-900 text-neutral-200">Arquivado</option>
            </select>
          </div>

          {/* Valor do Contrato */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Valor do Contrato
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5" />
              <input
                type="text"
                value={formatCurrency(formData.valorContrato || 0)}
                onChange={(e) => {
                  const value = parseCurrency(e.target.value);
                  setFormData((prev) => ({ ...prev, valorContrato: value }));
                }}
                className="w-full pl-12 pr-4 py-3 bg-neutral-900/50 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all duration-200 text-neutral-100 placeholder:text-neutral-500"
                placeholder="R$ 0,00"
              />
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-neutral-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-neutral-300 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 rounded-xl font-medium transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-900 rounded-xl font-medium transition-colors duration-200 shadow-lg shadow-amber-500/30"
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
              <div className="bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-800 w-full max-w-md">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-neutral-900/20 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-neutral-900" />
                      </div>
                      <h2 className="text-lg font-semibold text-neutral-900">
                        Cliente já cadastrado
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowDuplicateModal(false)}
                      className="p-2 hover:bg-neutral-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-neutral-900" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4 border border-amber-500/30">
                      <AlertCircle className="w-8 h-8 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-100 mb-2">
                      Cliente já cadastrado no sistema
                    </h3>
                    <p className="text-neutral-300">
                      A pessoa{" "}
                      <strong className="text-neutral-100">
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
                      className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-600 text-neutral-900 rounded-xl transition-colors font-medium"
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
                      className="w-full px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl transition-colors font-medium border border-neutral-700"
                    >
                      Escolher Outra Pessoa
                    </button>
                    <button
                      onClick={() => setShowDuplicateModal(false)}
                      className="w-full px-4 py-3 text-neutral-400 hover:text-neutral-200 transition-colors font-medium"
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
