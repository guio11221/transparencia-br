import type { HttpClientContract } from '../../../core/contracts/http-client.contract.js';
import { paginationSchema } from '../../../core/schemas/pagination.schema.js';
/**
 * Órgão público listado pelos cadastros oficiais.
 *
 * Além de `codigo` e `descricao`, preserva quaisquer campos extras devolvidos pela API.
 */
export interface OrgaoDto {
  codigo?: string;
  descricao?: string;
  [key: string]: unknown;
}
/**
 * Consulta dos cadastros de órgãos do Governo Federal usados para alimentar filtros de outras consultas.
 *
 * Oferece as listas SIAFI (financeiro) e SIAPE (pessoal civil), paginadas. A validação da
 * página é síncrona: um valor inválido lança `Error` (ZodError) antes da requisição.
 */
export class OrgaosService {
  constructor(private readonly http: HttpClientContract) {}
  /**
   * Lista os órgãos do SIAFI, o cadastro financeiro da União.
   *
   * @param pagina Página a consultar, inteiro positivo (padrão `1`); validado de forma síncrona.
   * @returns Órgãos com código SIAFI e descrição.
   * @throws `Error` (ZodError) síncrono se a página não for um inteiro positivo.
   * @example
   * const orgaos = await api.orgaos.siafi();
   */
  siafi(pagina = 1) {
    return this.http.get<OrgaoDto[]>(
      '/api-de-dados/orgaos-siafi',
      paginationSchema.parse({ pagina }),
    );
  }
  /**
   * Lista os órgãos do SIAPE, o cadastro de pessoal civil da União.
   *
   * @param pagina Página a consultar, inteiro positivo (padrão `1`); validado de forma síncrona.
   * @returns Órgãos com código SIAPE e descrição.
   * @throws `Error` (ZodError) síncrono se a página não for um inteiro positivo.
   * @example
   * const orgaos = await api.orgaos.siape(2);
   */
  siape(pagina = 1) {
    return this.http.get<OrgaoDto[]>(
      '/api-de-dados/orgaos-siape',
      paginationSchema.parse({ pagina }),
    );
  }
}
