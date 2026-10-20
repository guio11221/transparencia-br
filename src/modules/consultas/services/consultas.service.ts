import type { HttpClientContract, Query } from '../../../core/contracts/http-client.contract.js';
import { endpoints, type EndpointConsulta } from '../endpoints.js';
import {
  filtrosPorRecursoSchema,
  type RegistroDto,
  type FiltrosConsultaDto,
} from '../dtos/consulta.dto.js';

export { endpoints };
export type RecursoConsulta = EndpointConsulta;
export type Registro = RegistroDto;

/** Endpoints oficiais que expõem o identificador como query string `/id?id=N`. */
const endpointPorIdComQuery: Partial<Record<EndpointConsulta, EndpointConsulta>> = {
  contratos: 'contratosPorId',
  convenios: 'conveniosPorId',
};
/** Placeholders `{chave}` presentes em alguns caminhos de `endpoints`. */
const placeholderCaminho = /\{(\w+)\}/g;

/**
 * Camada de acesso genérica a todos os endpoints oficiais de dados do Portal da
 * Transparência.
 *
 * Valida os filtros com o schema do recurso, insere `pagina: 1` quando o endpoint suporta
 * paginação, substitui placeholders de caminho (`{codigo}`) pela query correspondente e
 * executa a requisição via `HttpClientContract`. Falhas de validação são lançadas de
 * forma síncrona, antes de qualquer chamada HTTP.
 */
export class ConsultasService {
  constructor(private readonly http: HttpClientContract) {}

  /**
   * Executa uma consulta paginada e retorna a página atual de registros.
   *
   * @param recurso Chave do endpoint em `endpoints`.
   * @param parametros Filtros em query string; `pagina` recebe `1` quando omitida.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com os registros da página.
   * @throws Error de forma síncrona se algum parâmetro obrigatório do recurso estiver ausente.
   * @example
   * const servidores = await api.consultas.consultar('servidores', { pagina: 1 });
   */
  consultar(
    recurso: EndpointConsulta,
    parametros: FiltrosConsultaDto = {},
    signal?: AbortSignal,
  ): Promise<RegistroDto[]> {
    const { caminho, query } = this.preparar(recurso, parametros);
    return this.http.get<RegistroDto[]>(caminho, query, signal);
  }

  /**
   * Executa uma consulta que devolve um único registro (endpoint não paginado).
   *
   * @param recurso Chave do endpoint em `endpoints`.
   * @param parametros Parâmetros de caminho/query exigidos pelo endpoint.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com o registro retornado.
   * @throws Error de forma síncrona se algum parâmetro obrigatório estiver ausente.
   * @example
   * const empresa = await api.consultas.consultarUm('pessoaJuridica', { cnpj: '11222333000181' });
   */
  consultarUm(
    recurso: EndpointConsulta,
    parametros: FiltrosConsultaDto = {},
    signal?: AbortSignal,
  ): Promise<RegistroDto> {
    const { caminho, query } = this.preparar(recurso, parametros);
    return this.http.get<RegistroDto>(caminho, query, signal);
  }

  /**
   * Localiza um registro pelo identificador.
   *
   * Para `contratos` e `convenios` usa `GET /id?id=N`; nos demais recursos monta o
   * caminho `/{id}` a partir de `endpoints`.
   *
   * @param recurso Recurso que possui busca por identificador.
   * @param id Identificador do registro.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com o registro encontrado.
   * @throws Error de forma síncrona se `id` estiver vazio.
   * @example
   * const contrato = await api.consultas.porId('contratos', 12);
   */
  porId(
    recurso:
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
    id: string | number,
    signal?: AbortSignal,
  ) {
    if (!String(id).trim()) throw new Error('ID obrigatório');
    const endpointId = endpointPorIdComQuery[recurso];
    if (endpointId) {
      return this.consultarUm(endpointId, { id }, signal);
    }
    return this.http.get<RegistroDto>(
      `${endpoints[recurso]}/${encodeURIComponent(String(id))}`,
      {},
      signal,
    );
  }

  /**
   * Valida os filtros, aplica a página padrão, monta a query e resolve os placeholders
   * do caminho.
   *
   * @returns Caminho final da requisição e parâmetros de query prontos.
   * @throws Error síncrono com o detalhe de cada falha de validação do schema do recurso.
   */
  private preparar(
    recurso: EndpointConsulta,
    parametros: FiltrosConsultaDto,
  ): { caminho: string; query: Query } {
    const schema = filtrosPorRecursoSchema[recurso];
    const entrada: Record<string, unknown> = { ...parametros };
    if ('pagina' in schema.shape && entrada.pagina === undefined) entrada.pagina = 1;
    const resultado = schema.safeParse(entrada);
    if (!resultado.success) {
      const detalhes = resultado.error.issues
        .map((iss) => `${iss.path.join('.')}: ${iss.message}`)
        .join('; ');
      throw new Error(`Filtros inválidos para o recurso "${recurso}" — ${detalhes}`);
    }
    const query = { ...resultado.data } as Query;
    const caminho = endpoints[recurso].replace(placeholderCaminho, (_, chave: string) => {
      const valor = query[chave];
      delete query[chave];
      return encodeURIComponent(String(valor));
    });
    return { caminho, query };
  }
}
