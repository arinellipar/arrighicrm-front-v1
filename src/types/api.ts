// src/types/api.ts - Adicionar os tipos de Usuario

export interface Endereco {
  id: number;
  cidade: string;
  bairro: string;
  logradouro: string;
  cep: string;
  numero: string;
  complemento?: string;
}

export interface CreateEnderecoDTO {
  cidade: string;
  bairro: string;
  logradouro: string;
  cep: string;
  numero: string;
  complemento?: string;
}

export interface PessoaFisica {
  id: number;
  nome: string;
  email: string;
  codinome?: string;
  sexo: string;
  dataNascimento: string;
  estadoCivil: string;
  cpf: string;
  rg?: string;
  cnh?: string;
  telefone1: string;
  telefone2?: string;
  enderecoId: number;
  endereco: Endereco;
  dataCadastro: string;
  dataAtualizacao?: string;
}

export interface CreatePessoaFisicaDTO {
  nome: string;
  email: string;
  codinome?: string;
  sexo: string;
  dataNascimento: string;
  estadoCivil: string;
  cpf: string;
  rg?: string;
  cnh?: string;
  telefone1: string;
  telefone2?: string;
  endereco: CreateEnderecoDTO;
}

export interface UpdatePessoaFisicaDTO extends CreatePessoaFisicaDTO {
  id: number;
  enderecoId: number;
}

export interface PessoaJuridica {
  id: number;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  responsavelTecnicoId: number;
  responsavelTecnico: PessoaFisica;
  email: string;
  telefone1: string;
  telefone2?: string;
  enderecoId: number;
  endereco: Endereco;
  dataCadastro: string;
  dataAtualizacao?: string;
}

export interface CreatePessoaJuridicaDTO {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  responsavelTecnicoId: number;
  email: string;
  telefone1: string;
  telefone2?: string;
  endereco: CreateEnderecoDTO;
}

export interface UpdatePessoaJuridicaDTO extends CreatePessoaJuridicaDTO {
  id: number;
  enderecoId: number;
}

// Tipos de Usuario - NOVOS
export interface Usuario {
  id: number;
  login: string;
  email: string;
  senha: string;
  grupoAcesso: string;
  tipoPessoa: string; // "Fisica" ou "Juridica"
  pessoaFisicaId?: number;
  pessoaFisica?: PessoaFisica;
  pessoaJuridicaId?: number;
  pessoaJuridica?: PessoaJuridica;
  ativo: boolean;
  dataCadastro: string;
  dataAtualizacao?: string;
  ultimoAcesso?: string;
}

export interface CreateUsuarioDTO {
  login: string;
  email: string;
  senha: string;
  grupoAcesso: string;
  tipoPessoa: string;
  pessoaFisicaId?: number;
  pessoaJuridicaId?: number;
  ativo?: boolean;
}

export interface UpdateUsuarioDTO extends CreateUsuarioDTO {
  id: number;
}

// Tipos para options de select
export interface ResponsavelTecnicoOption {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  sexo: string;
  dataNascimento: string;
  estadoCivil: string;
  telefone1: string;
  telefone2?: string;
  enderecoId: number;
  endereco: Endereco;
}

export interface PessoaFisicaOption {
  id: number;
  nome: string;
  cpf: string;
  email: string;
}

export interface PessoaJuridicaOption {
  id: number;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  email: string;
}

// Tipos para Consultor
export interface Consultor {
  id: number;
  pessoaFisicaId: number;
  pessoaFisica: PessoaFisica;
  filial: string;
  dataCadastro: string;
  dataAtualizacao?: string;
  ativo: boolean;
  // Propriedades adicionadas durante transformação no frontend
  nome?: string;
  email?: string;
  telefone1?: string;
  telefone2?: string;
  oab?: string;
  especialidades?: string[];
  status?: "ativo" | "inativo" | "ferias" | "licenca";
  casosAtivos?: number;
  taxaSucesso?: number;
}

export interface CreateConsultorDTO {
  pessoaFisicaId: number;
  filial: string;
}

export interface UpdateConsultorDTO extends CreateConsultorDTO {
  id: number;
}

// Tipos para Cliente
export interface Cliente {
  id: number;
  tipoPessoa: "Fisica" | "Juridica";
  pessoaFisicaId?: number;
  pessoaFisica?: PessoaFisica;
  pessoaJuridicaId?: number;
  pessoaJuridica?: PessoaJuridica;
  consultorAtualId?: number;
  filial: string;
  status?: string;
  observacoes?: string;
  dataCadastro: string;
  dataAtualizacao?: string;
  ativo: boolean;
  // Propriedades adicionadas durante transformação no frontend
  tipo?: "fisica" | "juridica";
  nome?: string;
  razaoSocial?: string;
  email?: string;
  cpf?: string;
  cnpj?: string;
  telefone1?: string;
  telefone2?: string;
  segmento?: string;
  valorContrato?: number;
}

export interface CreateClienteDTO {
  tipoPessoa: "Fisica" | "Juridica";
  pessoaId: number;
  filial: string;
  status?: string;
  observacoes?: string;
}

export interface UpdateClienteDTO extends CreateClienteDTO {
  id: number;
}

// Tipos para HistoricoConsultor
export interface HistoricoConsultor {
  id: number;
  clienteId: number;
  cliente?: Cliente;
  consultorId: number;
  consultor?: Consultor;
  dataInicio: string;
  dataFim?: string;
  motivoTransferencia?: string;
  dataCadastro: string;
}

export interface AtribuirClienteDTO {
  consultorId: number;
  clienteId: number;
  motivoAtribuicao?: string;
}

// Tipos para Filial
export interface Filial {
  id: number;
  nome: string;
  cidade: string;
  estado: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  ativo: boolean;
  dataCadastro: string;
  dataAtualizacao?: string;
}

// Enums
export const SexoOptions = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Feminino" },
  { value: "O", label: "Outros" },
] as const;

export const EstadoCivilOptions = [
  { value: "Solteiro", label: "Solteiro(a)" },
  { value: "Casado", label: "Casado(a)" },
  { value: "Divorciado", label: "Divorciado(a)" },
  { value: "Viuvo", label: "Viúvo(a)" },
  { value: "Separado", label: "Separado(a)" },
  { value: "Uniao_Estavel", label: "União Estável" },
] as const;

export const GrupoAcessoOptions = [
  { value: "Administrador", label: "Administrador" },
  { value: "Usuario", label: "Usuário" },
  { value: "Visualizador", label: "Visualizador" },
] as const;

export const TipoPessoaOptions = [
  { value: "Fisica", label: "Pessoa Física" },
  { value: "Juridica", label: "Pessoa Jurídica" },
] as const;
