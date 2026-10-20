import type { ConsultasService } from '../../consultas/services/consultas.service.js';
import type { FiltrosConsultaDto } from '../../consultas/dtos/consulta.dto.js';

/**
 * Serviço para consulta de renúncias fiscais.
 */
export class RenunciasService {
  constructor(private readonly consultas: ConsultasService) {}

  /**
   * Consulta o valor das renúncias fiscais.
   *
   * @param filtros Filtros opcionais da consulta.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Valores das renúncias fiscais.
   * @example
   * const valor = await api.renuncias.valor();
   */
  valor(filtros: FiltrosConsultaDto = {}, signal?: AbortSignal) {
    return this.consultas.consultar('renunciasValor', filtros, signal);
  }

  /**
   * Consulta as entidades imunes e isentas.
   *
   * @param filtros Filtros opcionais da consulta.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Entidades imunes e isentas.
   * @example
   * const imunes = await api.renuncias.imunesIsentas();
   */
  imunesIsentas(filtros: FiltrosConsultaDto = {}, signal?: AbortSignal) {
    return this.consultas.consultar('renunciasImunesIsentas', filtros, signal);
  }

  /**
   * Consulta as entidades habilitadas.
   *
   * @param filtros Filtros opcionais da consulta.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Entidades habilitadas.
   * @example
   * const habilitadas = await api.renuncias.habilitadas();
   */
  habilitadas(filtros: FiltrosConsultaDto = {}, signal?: AbortSignal) {
    return this.consultas.consultar('renunciasHabilitadas', filtros, signal);
  }
}
