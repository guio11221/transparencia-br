import type { ProgramaBeneficio } from './dtos/beneficio-query.dto.js';

/** Mapa de cada programa para o endpoint oficial (`/api-de-dados/...`) usado nas requisições. */
export const paths: Record<ProgramaBeneficio, string> = {
  bolsaFamilia: '/api-de-dados/bolsa-familia-disponivel-por-cpf-ou-nis',
  bolsaFamiliaSacado: '/api-de-dados/bolsa-familia-sacado-por-nis',
  novoBolsaFamilia: '/api-de-dados/novo-bolsa-familia-sacado-por-nis',
  auxilioBrasil: '/api-de-dados/auxilio-brasil-sacado-por-nis',
  auxilioEmergencial: '/api-de-dados/auxilio-emergencial-por-cpf-ou-nis',
  bpc: '/api-de-dados/bpc-por-cpf-ou-nis',
  seguroDefeso: '/api-de-dados/seguro-defeso-codigo',
  garantiaSafra: '/api-de-dados/safra-codigo-por-cpf-ou-nis',
  peti: '/api-de-dados/peti-por-cpf-ou-nis',
};

/** Programas que aceitam exclusivamente NIS; envio de CPF é rejeitado na validação. */
export const apenasNis = new Set<ProgramaBeneficio>([
  'bolsaFamiliaSacado',
  'novoBolsaFamilia',
  'auxilioBrasil',
]);
/** Todos os programas suportados, na mesma ordem de {@link paths}. */
export const todosProgramas = Object.keys(paths) as ProgramaBeneficio[];

/** Identificador aceito pelo programa: CPF ou NIS, somente NIS ou código do beneficiário. */
export type IdentificadorPrograma = 'cpf-ou-nis' | 'nis' | 'codigo';

/** Entrada do catálogo estático: identidade, identificador aceito, suporte a mês e endpoint. */
export interface ProgramaCatalogo {
  programa: ProgramaBeneficio;
  nome: string;
  descricao: string;
  identificador: IdentificadorPrograma;
  aceitaMes: boolean;
  endpoint: string;
}

/** Catálogo estático dos auxílios consultáveis pela API oficial; alimenta `BeneficiosService.catalogo()`. */
export const catalogoProgramas: readonly ProgramaCatalogo[] = [
  {
    programa: 'bolsaFamilia',
    nome: 'Bolsa Família — parcelas disponíveis',
    descricao: 'Parcelas do Bolsa Família disponíveis para pagamento, consultadas por CPF ou NIS.',
    identificador: 'cpf-ou-nis',
    aceitaMes: true,
    endpoint: paths.bolsaFamilia,
  },
  {
    programa: 'bolsaFamiliaSacado',
    nome: 'Bolsa Família — valores sacados',
    descricao: 'Valores já sacados do Bolsa Família, consultados por NIS.',
    identificador: 'nis',
    aceitaMes: true,
    endpoint: paths.bolsaFamiliaSacado,
  },
  {
    programa: 'novoBolsaFamilia',
    nome: 'Novo Bolsa Família',
    descricao: 'Valores sacados do Novo Bolsa Família, consultados por NIS.',
    identificador: 'nis',
    aceitaMes: true,
    endpoint: paths.novoBolsaFamilia,
  },
  {
    programa: 'auxilioBrasil',
    nome: 'Auxílio Brasil',
    descricao: 'Valores sacados do Auxílio Brasil, consultados por NIS.',
    identificador: 'nis',
    aceitaMes: true,
    endpoint: paths.auxilioBrasil,
  },
  {
    programa: 'auxilioEmergencial',
    nome: 'Auxílio Emergencial',
    descricao: 'Pagamentos do Auxílio Emergencial (emergência por COVID-19), por CPF ou NIS.',
    identificador: 'cpf-ou-nis',
    aceitaMes: false,
    endpoint: paths.auxilioEmergencial,
  },
  {
    programa: 'bpc',
    nome: 'BPC — Benefício de Prestação Continuada',
    descricao: 'BPC/LOAS para idoso ou pessoa com deficiência; o CPF ou NIS é enviado como codigo.',
    identificador: 'cpf-ou-nis',
    aceitaMes: false,
    endpoint: paths.bpc,
  },
  {
    programa: 'peti',
    nome: 'PETI — Erradicação do Trabalho Infantil',
    descricao: 'Benefícios do PETI consultados pelo código da criança ou adolescente.',
    identificador: 'codigo',
    aceitaMes: false,
    endpoint: paths.peti,
  },
  {
    programa: 'seguroDefeso',
    nome: 'Seguro Defeso',
    descricao: 'Seguro Defeso para pesca artesanal consultado pelo código do beneficiário.',
    identificador: 'codigo',
    aceitaMes: false,
    endpoint: paths.seguroDefeso,
  },
  {
    programa: 'garantiaSafra',
    nome: 'Garantia Safra',
    descricao: 'Garantia Safra consultado pelo código do beneficiário.',
    identificador: 'codigo',
    aceitaMes: false,
    endpoint: paths.garantiaSafra,
  },
];
