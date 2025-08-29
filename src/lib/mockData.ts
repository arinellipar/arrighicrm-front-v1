// Dados mock para bypass da API
export interface MockPessoaFisica {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone1: string;
  telefone2?: string;
  dataNascimento: string;
  sexo: string;
  estadoCivil: string;
  rg?: string;
  cnh?: string;
  codinome?: string;
  ativo: boolean;
  dataCadastro: string;
  dataAtualizacao?: string;
  enderecoId: number;
  endereco: {
    id: number;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    cep: string;
  };
}

export interface MockPessoaJuridica {
  id: number;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  email: string;
  telefone1: string;
  telefone2?: string;
  ativo: boolean;
  dataCadastro: string;
  dataAtualizacao?: string;
  enderecoId: number;
  responsavelTecnicoId: number;
  endereco: {
    id: number;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    cep: string;
  };
  responsavelTecnico: {
    id: number;
    nome: string;
    cpf: string;
    email: string;
  };
}

// Dados mock para pessoas físicas
export const mockPessoasFisicas: MockPessoaFisica[] = [
  {
    id: 1,
    nome: "João Silva",
    cpf: "123.456.789-00",
    email: "joao.silva@email.com",
    telefone1: "(11) 99999-9999",
    telefone2: "(11) 88888-8888",
    dataNascimento: "1990-05-15",
    sexo: "Masculino",
    estadoCivil: "Solteiro",
    rg: "12.345.678-9",
    cnh: "12345678901",
    ativo: true,
    dataCadastro: "2024-01-15T10:00:00",
    enderecoId: 1,
    endereco: {
      id: 1,
      logradouro: "Rua das Flores",
      numero: "123",
      complemento: "Apto 45",
      bairro: "Centro",
      cidade: "São Paulo",
      cep: "01234-567",
    },
  },
  {
    id: 2,
    nome: "Maria Santos",
    cpf: "987.654.321-00",
    email: "maria.santos@email.com",
    telefone1: "(11) 77777-7777",
    dataNascimento: "1985-08-20",
    sexo: "Feminino",
    estadoCivil: "Casada",
    ativo: true,
    dataCadastro: "2024-01-16T09:00:00",
    enderecoId: 2,
    endereco: {
      id: 2,
      logradouro: "Avenida Paulista",
      numero: "1000",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      cep: "01310-100",
    },
  },
  {
    id: 3,
    nome: "Pedro Oliveira",
    cpf: "456.789.123-00",
    email: "pedro.oliveira@email.com",
    telefone1: "(11) 66666-6666",
    dataNascimento: "1992-12-10",
    sexo: "Masculino",
    estadoCivil: "Solteiro",
    ativo: true,
    dataCadastro: "2024-01-17T11:00:00",
    enderecoId: 3,
    endereco: {
      id: 3,
      logradouro: "Rua Augusta",
      numero: "500",
      bairro: "Consolação",
      cidade: "São Paulo",
      cep: "01305-000",
    },
  },
  {
    id: 4,
    nome: "Ana Costa",
    cpf: "789.123.456-00",
    email: "ana.costa@email.com",
    telefone1: "(11) 55555-5555",
    dataNascimento: "1988-03-25",
    sexo: "Feminino",
    estadoCivil: "Divorciada",
    ativo: false,
    dataCadastro: "2024-01-10T10:00:00",
    enderecoId: 4,
    endereco: {
      id: 4,
      logradouro: "Rua Oscar Freire",
      numero: "200",
      bairro: "Jardins",
      cidade: "São Paulo",
      cep: "01426-000",
    },
  },
];

// Dados mock para pessoas jurídicas
export const mockPessoasJuridicas: MockPessoaJuridica[] = [
  {
    id: 1,
    razaoSocial: "Empresa ABC Ltda",
    nomeFantasia: "ABC Corp",
    cnpj: "12.345.678/0001-90",
    email: "contato@empresaabc.com",
    telefone1: "(11) 44444-4444",
    telefone2: "(11) 33333-3333",
    ativo: true,
    dataCadastro: "2024-01-18T08:00:00",
    enderecoId: 5,
    responsavelTecnicoId: 1,
    endereco: {
      id: 5,
      logradouro: "Rua da Consolação",
      numero: "1000",
      complemento: "Sala 100",
      bairro: "Consolação",
      cidade: "São Paulo",
      cep: "01302-001",
    },
    responsavelTecnico: {
      id: 1,
      nome: "João Silva",
      cpf: "123.456.789-00",
      email: "joao.silva@email.com",
    },
  },
];

// Função para simular delay da API
export const simulateApiDelay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Função para simular erro aleatório (para testar tratamento de erros)
export const simulateRandomError = (): boolean => {
  return Math.random() < 0.1; // 10% de chance de erro
};
