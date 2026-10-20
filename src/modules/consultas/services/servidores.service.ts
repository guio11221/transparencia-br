import type { FiltrosConsultaDto } from '../dtos/consulta.dto.js';
import { RecursoComIdService } from './recurso.service.js';

/**
 * Consulta de servidores públicos federais.
 *
 * Cobre os endpoints oficiais de listagem (`/servidores`), de filtragem por órgão
 * (`/servidores/por-orgao`) e de funções e cargos (`/servidores/funcoes-e-cargos`),
 * além da busca por identificador herdada de {@link RecursoComIdService}.
 */
export class ServidoresService extends RecursoComIdService<'servidores'> {
  /**
   * Lista servidores filtrados por órgão de lotação ou de exercício.
   *
   * @param filtros Filtros do endpoint (`orgaoLotacao`, `orgaoExercicio`, `tipoServidor`...).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com os registros da página atual.
   * @example
   * const servidores = await api.servidores.porOrgao({ orgaoLotacao: '21000' });
   */
  porOrgao(filtros: FiltrosConsultaDto = {}, signal?: AbortSignal) {
    return this.consultas.consultar('servidoresPorOrgao', filtros, signal);
  }
  /**
   * Lista as funções e cargos disponíveis para consulta de servidores.
   *
   * @param filtros Filtros do endpoint (apenas `pagina`, com padrão `1`).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com os registros da página atual.
   * @example
   * const opcoes = await api.servidores.funcoesECargos();
   */
  funcoesECargos(filtros: FiltrosConsultaDto = {}, signal?: AbortSignal) {
    return this.consultas.consultar('servidoresFuncoesECargos', filtros, signal);
  }
}
