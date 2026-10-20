import { RecursoComIdService } from './recurso.service.js';

/**
 * Consulta de viagens a serviço.
 *
 * Cobre o endpoint oficial de viagens por CPF (`/viagens-por-cpf`). A listagem por
 * período e órgão e a busca por id são herdadas de {@link RecursoComIdService};
 * `listar` exige `dataIdaDe`, `dataIdaAte`, `dataRetornoDe`, `dataRetornoAte` e
 * `codigoOrgao`, validados de forma síncrona antes da requisição.
 */
export class ViagensService extends RecursoComIdService<'viagens'> {
  /**
   * Consulta as viagens registradas para um CPF.
   *
   * @param cpf CPF do viajante (somente dígitos).
   * @param pagina Número da página (padrão `1`).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com as viagens da página atual.
   * @throws Error de forma síncrona se `cpf` estiver vazio.
   * @example
   * const viagens = await api.viagens.porCpf('12345678901');
   */
  porCpf(cpf: string, pagina = 1, signal?: AbortSignal) {
    return this.consultas.consultar('viagensPorCpf', { cpf, pagina }, signal);
  }
}
