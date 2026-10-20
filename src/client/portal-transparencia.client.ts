import type { SdkOptions } from '../core/types/sdk-options.type.js';
import { FetchHttpClient } from '../core/http/fetch-http-client.js';
import { BeneficiosService } from '../modules/beneficios/services/beneficios.service.js';
import { OrgaosService } from '../modules/orgaos/services/orgaos.service.js';
import { ConsultasService } from '../modules/consultas/services/consultas.service.js';
import {
  RecursoComIdService,
  RecursoService,
} from '../modules/consultas/services/recurso.service.js';
import { ServidoresService } from '../modules/consultas/services/servidores.service.js';
import { ContratosService } from '../modules/consultas/services/contratos.service.js';
import { LicitacoesService } from '../modules/consultas/services/licitacoes.service.js';
import { ConveniosService } from '../modules/consultas/services/convenios.service.js';
import { ViagensService } from '../modules/consultas/services/viagens.service.js';
import { NotasFiscaisService } from '../modules/consultas/services/notas-fiscais.service.js';
import { CartoesService } from '../modules/consultas/services/cartoes.service.js';
import { PessoasService } from '../modules/pessoas/services/pessoas.service.js';
import { DespesasService } from '../modules/despesas/services/despesas.service.js';
import { RenunciasService } from '../modules/renuncias/services/renuncias.service.js';
import { EmendasService } from '../modules/emendas/services/emendas.service.js';

/**
 * Cliente principal do SDK, com um serviço por domínio do Portal da Transparência.
 *
 * Cada propriedade `readonly` expõe um serviço pronto para uso, todos
 * compartilhando o mesmo transporte HTTP (com rate limit, cache e retries).
 * Acesso típico: `new PortalTransparenciaClient({ apiKey }).beneficios.listar(...)`.
 *
 * @example
 * ```ts
 * const api = new PortalTransparenciaClient({ apiKey: process.env.CHAVE_API! });
 * const servidores = await api.servidores.listar({ pagina: 1 });
 * ```
 */
export class PortalTransparenciaClient {
  /** Consulta de auxílios e programas sociais oficiais. */
  readonly beneficios: BeneficiosService;
  /** Órgãos e entidades do poder público federal. */
  readonly orgaos: OrgaosService;
  /** Serviço base de consultas aos endpoints genéricos do Portal. */
  readonly consultas: ConsultasService;
  /** Servidores públicos federais. */
  readonly servidores: ServidoresService;
  /** Remunerações de servidores públicos. */
  readonly remuneracoes: RecursoService<'remuneracoes'>;
  /** Benefícios de permissionários (ex.: aposentados e pensionistas). */
  readonly permissionarios: RecursoService<'permissionarios'>;
  /** Viagens a serviço do governo federal. */
  readonly viagens: ViagensService;
  /** Contratos firmados pela administração pública. */
  readonly contratos: ContratosService;
  /** Convênios e transferências voluntárias. */
  readonly convenios: ConveniosService;
  /** Licitações e processos de compra. */
  readonly licitacoes: LicitacoesService;
  /** Notas fiscais eletrônicas vinculadas a compras públicas. */
  readonly notasFiscais: NotasFiscaisService;
  /** Gastos com cartões de pagamento da administração. */
  readonly cartoes: CartoesService;
  /** Pessoas físicas com dados públicos relevantes (PEPs). */
  readonly peps: RecursoService<'peps'>;
  /** Imóveis da união e patrimônio público. */
  readonly imoveis: RecursoService<'imoveis'>;
  /** Acordos de leniência firmados com o poder público. */
  readonly acordosLeniencia: RecursoComIdService<'acordosLeniencia'>;
  /** Resumo de pessoas por identificador público (CPF/CNPJ). */
  readonly pessoas: PessoasService;
  /** Despesas orçamentárias da união. */
  readonly despesas: DespesasService;
  /** Renúncias de receitas públicas. */
  readonly renuncias: RenunciasService;
  /** Emendas parlamentares e suas destinações. */
  readonly emendas: EmendasService;
  /** Sanções administrativas por cadastro (CEIS, CNEP, CEAF, CEPIM). */
  readonly sancoes: {
    /** Cadastro Nacional de Empresas Inidôneas e Suspensas. */
    ceis: RecursoComIdService<'ceis'>;
    /** Cadastro Nacional de Empresas Punidas. */
    cnep: RecursoComIdService<'cnep'>;
    /** Cadastro de Entidades Punidas pela Administração Federal. */
    ceaf: RecursoComIdService<'ceaf'>;
    /** Cadastro de Pessoas Físicas Inidôneas e Suspensas. */
    cepim: RecursoComIdService<'cepim'>;
  };

  constructor(options: SdkOptions) {
    const http = options.httpClient ?? new FetchHttpClient(options);
    this.beneficios = new BeneficiosService(http);
    this.orgaos = new OrgaosService(http);
    this.consultas = new ConsultasService(http);
    this.servidores = new ServidoresService(this.consultas, 'servidores');
    this.remuneracoes = new RecursoService(this.consultas, 'remuneracoes');
    this.permissionarios = new RecursoService(this.consultas, 'permissionarios');
    this.viagens = new ViagensService(this.consultas, 'viagens');
    this.contratos = new ContratosService(this.consultas, 'contratos');
    this.convenios = new ConveniosService(this.consultas, 'convenios');
    this.licitacoes = new LicitacoesService(this.consultas, 'licitacoes');
    this.notasFiscais = new NotasFiscaisService(this.consultas, 'notasFiscais');
    this.cartoes = new CartoesService(this.consultas, 'cartoes');
    this.peps = new RecursoService(this.consultas, 'peps');
    this.imoveis = new RecursoService(this.consultas, 'imoveis');
    this.acordosLeniencia = new RecursoComIdService(this.consultas, 'acordosLeniencia');
    this.pessoas = new PessoasService(this.consultas, this.beneficios);
    this.despesas = new DespesasService(this.consultas);
    this.renuncias = new RenunciasService(this.consultas);
    this.emendas = new EmendasService(this.consultas, 'emendas');
    this.sancoes = {
      ceis: new RecursoComIdService(this.consultas, 'ceis'),
      cnep: new RecursoComIdService(this.consultas, 'cnep'),
      ceaf: new RecursoComIdService(this.consultas, 'ceaf'),
      cepim: new RecursoComIdService(this.consultas, 'cepim'),
    };
  }
}

/**
 * Classe principal do pacote npm `transparencia-br`.
 *
 * Herda todos os serviços de {@link PortalTransparenciaClient} sem adicionar
 * comportamento próprio — use-a como ponto de entrada canônico nas aplicações.
 *
 * @example
 * ```ts
 * import { Transparencia } from 'sdk-transparencia-br';
 * const api = new Transparencia({ apiKey: process.env.CHAVE_API! });
 * ```
 */
export class Transparencia extends PortalTransparenciaClient {}
