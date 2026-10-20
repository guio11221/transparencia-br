import type { HttpClientContract, Query } from '../../../core/contracts/http-client.contract.js';
import {
  beneficioQuerySchema,
  identificadorSchema,
  type BeneficioQueryDto,
  type BeneficioRegistroDto,
  type ProgramaBeneficio,
  type ConsultaBeneficiosDto,
  type ResultadoPrograma,
} from '../dtos/beneficio-query.dto.js';
import { PortalApiError } from '../../../core/errors/portal-api.error.js';
import { z } from 'zod';
import {
  collectPages,
  paginate,
  type PaginationOptions,
} from '../../../core/pagination/paginator.js';
import {
  apenasNis,
  catalogoProgramas,
  paths,
  todosProgramas,
  type ProgramaCatalogo,
} from '../catalogo.js';

/** Converte cada desfecho de `Promise.allSettled` em {@link ResultadoPrograma}, preservando a ordem dos programas. */
function agruparResultados(
  selecionados: ProgramaBeneficio[],
  results: PromiseSettledResult<BeneficioRegistroDto[]>[],
): ResultadoPrograma[] {
  return results.map((r, i) =>
    r.status === 'fulfilled'
      ? { programa: selecionados[i]!, status: 'sucesso' as const, dados: r.value }
      : {
          programa: selecionados[i]!,
          status: 'erro' as const,
          erro: {
            mensagem: r.reason instanceof Error ? r.reason.message : String(r.reason),
            ...(r.reason instanceof PortalApiError ? { status: r.reason.status } : {}),
          },
        },
  );
}

/**
 * Consulta de benefícios sociais (Bolsa Família, BPC, PETI, Seguro Defeso...) da API do
 * Portal da Transparência, em versão de programa único ou agregada por vários programas.
 *
 * A validação de parâmetros obrigatórios é síncrona: `Error` é lançado antes de a promise da
 * requisição existir. Nas consultas agregadas, a falha de um programa não interrompe os
 * demais — cada programa é reportado com `status: 'sucesso' | 'erro'` via `Promise.allSettled`.
 */
export class BeneficiosService {
  constructor(private readonly http: HttpClientContract) {}
  /**
   * Lista os auxílios disponíveis como catálogo estático, sem chamada à API.
   *
   * @returns Cópia defensiva dos programas com nome, identificador aceito e endpoint oficial.
   * @example
   * const catalogo = api.beneficios.catalogo();
   */
  catalogo(): ProgramaCatalogo[] {
    return catalogoProgramas.map((programa) => ({ ...programa }));
  }
  /**
   * Consulta as parcelas de um único programa de benefício.
   *
   * A validação ocorre de forma síncrona, antes de qualquer requisição: programa desconhecido,
   * identificador diferente de 11 dígitos ou CPF enviado a um programa exclusivo de NIS lançam
   * `Error` imediatamente. O filtro `mes` aceita `AAAA-MM` (ou `AAAAMM`) e é convertido para
   * `mesAno=AAAAMM` na query string.
   *
   * @param programa Chave do programa no catálogo (ex.: `'bolsaFamilia'`).
   * @param dto Filtros: um único identificador (`cpf`, `nis` ou `codigo`), `mes` e `pagina`.
   * @param signal Sinal de cancelamento repassado ao HTTP client.
   * @returns Os registros devolvidos pelo endpoint oficial do programa.
   * @throws `Error` síncrono (incluindo ZodError) se programa, identificador ou mês forem inválidos.
   * @example
   * const parcelas = await api.beneficios.consultar('bolsaFamilia', { cpf: '12345678901' });
   */
  consultar(
    programa: ProgramaBeneficio,
    dto: BeneficioQueryDto,
    signal?: AbortSignal,
  ): Promise<BeneficioRegistroDto[]>;
  /**
   * Consulta vários programas de uma vez e agrega o desfecho de cada um.
   *
   * Quando `programas` não é informado, consulta os 9 programas do catálogo. As falhas não
   * interrompem as demais consultas: cada programa vem com `status: 'sucesso'` (com `dados`)
   * ou `'erro'` (com `mensagem` e, se HTTP, `status`). Erros de validação do lote rejeitam a
   * promise em vez de lançar de forma síncrona.
   *
   * @param dto Filtros comuns e lista opcional de `programas` a consultar.
   * @param signal Sinal de cancelamento repassado a cada requisição.
   * @returns Um {@link ResultadoPrograma} por programa, na ordem da seleção.
   * @example
   * const agregado = await api.beneficios.consultar({ nis: '12345678901', programas: ['bpc', 'peti'] });
   */
  consultar(dto: ConsultaBeneficiosDto, signal?: AbortSignal): Promise<ResultadoPrograma[]>;
  /** Implementação única das sobrecargas: despacha para a consulta de um programa ou para a agregação. */
  consultar(
    arg: ProgramaBeneficio | ConsultaBeneficiosDto,
    dtoOuSignal?: BeneficioQueryDto | AbortSignal,
    signal?: AbortSignal,
  ): Promise<BeneficioRegistroDto[] | ResultadoPrograma[]> {
    if (typeof arg !== 'string')
      return this.consultarProgramas(arg, dtoOuSignal as AbortSignal | undefined);
    const parsed = beneficioQuerySchema.parse(dtoOuSignal as BeneficioQueryDto);
    if (!Object.prototype.hasOwnProperty.call(paths, arg))
      throw new Error(`Programa inválido: ${arg}`);
    if (apenasNis.has(arg) && parsed.cpf) throw new Error(`${arg} aceita somente NIS, não CPF`);
    const codigo = parsed.nis ?? parsed.cpf ?? parsed.codigo!;
    const query: Query = { pagina: parsed.pagina };
    query[apenasNis.has(arg) ? 'nis' : 'codigo'] = codigo;
    const mesAno = parsed.mes ?? parsed.mesAno;
    if (mesAno !== undefined) query.mesAno = mesAno;
    return this.http.get<BeneficioRegistroDto[]>(paths[arg], query, signal);
  }
  /**
   * Percorre as páginas de um programa como async iterable, sem materializar tudo de uma vez.
   *
   * A paginação é coletiva e sob demanda: cada página só é buscada enquanto o iterable é
   * consumido, encerrando na primeira página vazia ou ao atingir `maxPaginas` (padrão 100).
   *
   * @param programa Chave do programa no catálogo.
   * @param filtros Filtros da consulta; `pagina` serve de página inicial quando `paginaInicial` não é informada.
   * @param options Opções de paginação (`paginaInicial`, `maxPaginas`, `signal`).
   * @returns Async generator que devolve uma página de registros por iteração.
   * @example
   * const paginas = api.beneficios.paginas('bpc', { nis: '12345678901' });
   * for await (const pagina of paginas) console.log(pagina.length);
   */
  paginas(
    programa: ProgramaBeneficio,
    filtros: BeneficioQueryDto,
    options: PaginationOptions = {},
  ) {
    return paginate((pagina, signal) => this.consultar(programa, { ...filtros, pagina }, signal), {
      ...options,
      paginaInicial: options.paginaInicial ?? filtros.pagina ?? 1,
    });
  }
  /**
   * Coleta todas as páginas de um programa em um único array.
   *
   * Enquanto {@link paginas} entrega uma página por vez, aqui os registros são acumulados
   * até `maxItens` (padrão 10000) ou até as páginas se esgotarem.
   *
   * @param programa Chave do programa no catálogo.
   * @param filtros Filtros da consulta.
   * @param options Opções de paginação mais `maxItens`, o limite de registros acumulados.
   * @returns Todos os registros coletados, sem exceder `maxItens`.
   * @example
   * const bpc = await api.beneficios.todos('bpc', { nis: '12345678901' }, { maxPaginas: 10 });
   */
  todos(
    programa: ProgramaBeneficio,
    filtros: BeneficioQueryDto,
    options: PaginationOptions & { maxItens?: number } = {},
  ) {
    return collectPages(this.paginas(programa, filtros, options), options.maxItens ?? 10000);
  }
  /** Alias de {@link consultarProgramas} — a forma agregada de {@link consultar}. */
  buscar(dto: ConsultaBeneficiosDto, signal?: AbortSignal) {
    return this.consultarProgramas(dto, signal);
  }
  /** Alias de {@link consultar} na forma de programa único. */
  listar(programa: ProgramaBeneficio, dto: BeneficioQueryDto, signal?: AbortSignal) {
    return this.consultar(programa, dto, signal);
  }
  /**
   * Consulta por ID não é suportada nesta versão da API.
   *
   * Nenhum endpoint de benefícios do Portal da Transparência expõe busca por identificador
   * numérico; o método existe apenas para falhar com uma mensagem explicativa.
   *
   * @param programa Programa informado, citado na mensagem de erro.
   * @param id Identificador informado, citado na mensagem de erro.
   * @throws `Error` sempre — nenhum dado é retornado.
   */
  porId(programa: ProgramaBeneficio, id: string | number): never {
    throw new Error(
      `O endpoint ${programa} não oferece consulta por ID nesta versão da API. ID informado: ${id}`,
    );
  }
  /**
   * Consulta cada programa selecionado e agrega os desfechos individualmente.
   *
   * Usa `Promise.allSettled`: a falha de um programa não interrompe os demais e aparece como
   * `status: 'erro'` com a mensagem (e o código HTTP, quando `PortalApiError`). Programas
   * repetidos são deduplicados. Como o método é `async`, a validação do lote rejeita a
   * promise em vez de lançar de forma síncrona.
   *
   * @param dto Filtros comuns e lista opcional de `programas` (padrão: os 9 do catálogo).
   * @param signal Sinal de cancelamento repassado a cada requisição.
   * @returns Um {@link ResultadoPrograma} por programa, na ordem da seleção.
   * @example
   * const resultados = await api.beneficios.consultarProgramas({ nis: '12345678901' });
   * const bpc = resultados.find((r) => r.programa === 'bpc');
   */
  async consultarProgramas(
    dto: ConsultaBeneficiosDto,
    signal?: AbortSignal,
  ): Promise<ResultadoPrograma[]> {
    const { programas = todosProgramas, ...filtros } = dto;
    const parsed = beneficioQuerySchema.parse(filtros);
    const selecionados = [...new Set(programas)];
    if (selecionados.some((p) => !(p in paths))) throw new Error('Programa não reconhecido');
    const results = await Promise.allSettled(
      selecionados.map((p) => this.consultar(p, parsed, signal)),
    );
    return agruparResultados(selecionados, results);
  }
  /**
   * Consulta todos os programas compatíveis com o CPF e/ou NIS informado.
   *
   * Seleção automática: os 3 programas exclusivos de NIS só entram quando há NIS — com
   * apenas CPF são consultados 6 dos 9 programas; com NIS, os 9; com ambos, o CPF prevalece
   * nos programas que aceitam os dois. A validação é síncrona: `Error` é lançado antes de a
   * promise existir se nenhum identificador válido for informado. Os desfechos são agregados
   * por programa via `Promise.allSettled`.
   *
   * @param identificador Objeto com `cpf` e/ou `nis`; a máscara é removida e exigem 11 dígitos.
   * @param signal Sinal de cancelamento repassado a cada requisição.
   * @returns Um {@link ResultadoPrograma} por programa compatível, com `status: 'sucesso' | 'erro'`.
   * @throws `Error` síncrono se não houver `cpf` nem `nis`, ou ZodError se o formato for inválido.
   * @example
   * const auxilios = await api.beneficios.porPessoa({ cpf: '12345678901' });
   */
  porPessoa(
    identificador: { cpf?: string; nis?: string },
    signal?: AbortSignal,
  ): Promise<ResultadoPrograma[]> {
    const cpf = identificador?.cpf?.trim()
      ? identificadorSchema.parse(identificador.cpf)
      : undefined;
    const nis = identificador?.nis?.trim()
      ? identificadorSchema.parse(identificador.nis)
      : undefined;
    if (!cpf && !nis) throw new Error('Informe cpf ou nis');
    const selecionados = todosProgramas.filter((p) =>
      apenasNis.has(p) ? Boolean(nis) : Boolean(cpf || nis),
    );
    return (async () => {
      const results = await Promise.allSettled(
        selecionados.map((p) =>
          this.consultar(p, apenasNis.has(p) ? { nis } : { codigo: cpf ?? nis }, signal),
        ),
      );
      return agruparResultados(selecionados, results);
    })();
  }
  /** Alias de {@link consultar} para o programa `bolsaFamilia` (parcelas por CPF ou NIS). */
  bolsaFamilia(dto: BeneficioQueryDto, signal?: AbortSignal) {
    return this.consultar('bolsaFamilia', dto, signal);
  }
  /** Valores sacados do Bolsa Família por NIS, com página inicial direta. */
  bolsaFamiliaSacado(nis: string, pagina = 1) {
    return this.consultar('bolsaFamiliaSacado', { nis, pagina });
  }
  /** Novo Bolsa Família; aceita um NIS direto (com `pagina`) ou a consulta completa em DTO. */
  novoBolsaFamilia(nis: string | BeneficioQueryDto, pagina = 1) {
    return this.consultar('novoBolsaFamilia', typeof nis === 'string' ? { nis, pagina } : nis);
  }
  /** Auxílio Brasil; aceita um NIS direto (com `pagina`) ou a consulta completa em DTO. */
  auxilioBrasil(nis: string | BeneficioQueryDto, pagina = 1) {
    return this.consultar('auxilioBrasil', typeof nis === 'string' ? { nis, pagina } : nis);
  }
  /** Alias de {@link consultar} para o programa `auxilioEmergencial`. */
  auxilioEmergencial(dto: BeneficioQueryDto) {
    return this.consultar('auxilioEmergencial', dto);
  }
  /** Alias de {@link consultar} para o programa `bpc` (BPC/LOAS). */
  bpc(dto: BeneficioQueryDto) {
    return this.consultar('bpc', dto);
  }
  /** Alias de {@link consultar} para o programa `seguroDefeso` (consulta por código). */
  seguroDefeso(dto: BeneficioQueryDto) {
    return this.consultar('seguroDefeso', dto);
  }
  /** Alias de {@link consultar} para o programa `garantiaSafra` (consulta por código). */
  garantiaSafra(dto: BeneficioQueryDto) {
    return this.consultar('garantiaSafra', dto);
  }
  /** Alias de {@link consultar} para o programa `peti` (consulta por código). */
  peti(dto: BeneficioQueryDto) {
    return this.consultar('peti', dto);
  }
  /**
   * Consulta os benefícios de um programa agregados por município (código IBGE).
   *
   * Valida o `codigoIbge` (7 dígitos) de forma síncrona, antes da requisição, e monta a rota
   * `/api-de-dados/{programa}-por-municipio`. Aqui o programa é nomeado em kebab-case
   * (ex.: `'bolsa-familia'`), diferente das chaves do catálogo usadas nos demais métodos.
   *
   * @param programa Nome do endpoint municipal em kebab-case.
   * @param codigoIbge Código IBGE do município, com exatamente 7 dígitos.
   * @param mesAno Mês de referência em `AAAAMM` (ex.: `202401`).
   * @param pagina Página a consultar (padrão `1`).
   * @returns Os registros do município no mês informado.
   * @throws `Error` síncrono (ZodError) se o código IBGE não tiver 7 dígitos.
   * @example
   * const dados = await api.beneficios.porMunicipio('bpc', '3550308', 202401);
   */
  porMunicipio(
    programa:
      | 'bolsa-familia'
      | 'novo-bolsa-familia'
      | 'auxilio-brasil'
      | 'auxilio-emergencial'
      | 'bpc'
      | 'seguro-defeso'
      | 'safra'
      | 'peti',
    codigoIbge: string,
    mesAno: number,
    pagina = 1,
  ) {
    z.string()
      .regex(/^\d{7}$/)
      .parse(codigoIbge);
    return this.http.get<BeneficioRegistroDto[]>(`/api-de-dados/${programa}-por-municipio`, {
      codigoIbge,
      mesAno,
      pagina,
    });
  }
  /**
   * Agrega todos os programas para um único identificador.
   *
   * Normaliza `codigo` de forma síncrona (11 dígitos, máscara removida) e delega a
   * {@link consultarProgramas}, aplicando o `mesAno` opcional a todos os programas.
   *
   * @param codigo CPF, NIS ou código do beneficiário, com ou sem máscara.
   * @param mesAno Mês de referência opcional em `AAAAMM`.
   * @returns Um {@link ResultadoPrograma} por programa, com `status: 'sucesso' | 'erro'`.
   * @throws `Error` síncrono (ZodError) se o identificador não tiver 11 dígitos.
   * @example
   * const tudo = await api.beneficios.consultarTodos('12345678901', 202401);
   */
  consultarTodos(codigo: string, mesAno?: number) {
    return this.consultarProgramas({ codigo: identificadorSchema.parse(codigo), mesAno });
  }
}
