import type { RecursoConsulta, ConsultasService } from './consultas.service.js';
import type { FiltrosConsultaDto, RegistroDto } from '../dtos/consulta.dto.js';
import {
  collectPages,
  paginate,
  type PaginationOptions,
} from '../../../core/pagination/paginator.js';
/**
 * Base dos serviços de recurso simples do Portal da Transparência.
 *
 * Cobre a listagem paginada do recurso via endpoint oficial: `listar` (e seus aliases),
 * `paginas` para iterar página a página e `todos` para acumular os registros. A validação
 * dos filtros, a página padrão e a montagem da URL ficam a cargo do
 * {@link ConsultasService}.
 */
export class RecursoService<R extends RecursoConsulta> {
  constructor(
    protected readonly consultas: ConsultasService,
    protected readonly recurso: R,
  ) {}
  /**
   * Lista uma página de registros do recurso.
   *
   * @param filtros Filtros em query string; `pagina` é preenchida com `1` quando ausente.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com os registros da página atual.
   * @throws Error de forma síncrona se algum parâmetro obrigatório do recurso estiver ausente.
   * @example
   * const contratos = await api.contratos.listar({ codigoOrgao: '10001' });
   */
  listar(filtros: FiltrosConsultaDto = {}, signal?: AbortSignal) {
    return this.consultas.consultar(this.recurso, filtros, signal);
  }
  /** Alias de {@link listar}. */
  buscar(filtros: FiltrosConsultaDto, signal?: AbortSignal) {
    return this.listar(filtros, signal);
  }
  /** Alias de {@link listar}. */
  consultar(filtros: FiltrosConsultaDto = {}, signal?: AbortSignal) {
    return this.listar(filtros, signal);
  }
  /**
   * Itera pelas páginas do recurso até a página vazia ou até `maxPaginas` (padrão 100).
   *
   * @param filtros Filtros da consulta; `pagina`, quando presente, define a página inicial.
   * @param options Limite de páginas, página inicial e cancelamento da paginação.
   * @returns Gerador assíncrono que produz os registros de cada página.
   * @throws Error se `paginaInicial` ou `maxPaginas` forem inválidos (lançado na iteração).
   * @example
   * for await (const registros of api.contratos.paginas({ codigoOrgao: '26000' })) {
   *   console.log(registros.length);
   * }
   */
  paginas(
    filtros: FiltrosConsultaDto = {},
    options: PaginationOptions = {},
  ): AsyncGenerator<RegistroDto[]> {
    const { pagina, ...rest } = filtros;
    return paginate((next, signal) => this.listar({ ...rest, pagina: next }, signal), {
      ...options,
      paginaInicial: options.paginaInicial ?? pagina ?? 1,
    });
  }
  /**
   * Acumula as páginas do recurso em um único array.
   *
   * @param filtros Filtros da consulta.
   * @param options Opções de paginação; `maxItens` limita o total de registros (padrão 10.000).
   * @returns Promessa com todos os registros coletados.
   * @throws Error se `maxItens` ou as opções de paginação forem inválidos.
   * @example
   * const licitacoes = await api.licitacoes.todos({ codigoOrgao: '10001' }, { maxItens: 500 });
   */
  todos(filtros: FiltrosConsultaDto = {}, options: PaginationOptions & { maxItens?: number } = {}) {
    return collectPages(this.paginas(filtros, options), options.maxItens ?? 10000);
  }
}
/**
 * Estende {@link RecursoService} com a busca de um registro pelo identificador.
 *
 * Cobre os recursos oficiais que publicam rota por id: `servidores`, `viagens`,
 * `contratos`, `convenios`, `licitacoes`, `ceis`, `cnep`, `ceaf`, `cepim` e
 * `acordosLeniencia`.
 */
export class RecursoComIdService<
  R extends
    | 'servidores'
    | 'viagens'
    | 'contratos'
    | 'convenios'
    | 'licitacoes'
    | 'ceis'
    | 'cnep'
    | 'ceaf'
    | 'cepim'
    | 'acordosLeniencia',
> extends RecursoService<R> {
  /**
   * Consulta um registro do recurso pelo identificador.
   *
   * @param id Identificador do registro.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com o registro encontrado.
   * @throws Error de forma síncrona se `id` estiver vazio.
   * @example
   * const convenio = await api.convenios.porId(12);
   */
  porId(id: string | number, signal?: AbortSignal) {
    return this.consultas.porId(this.recurso, id, signal);
  }
}
