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
