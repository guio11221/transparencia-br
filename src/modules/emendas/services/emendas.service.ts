import { RecursoService } from '../../consultas/services/recurso.service.js';

/**
 * Serviço para consulta de emendas parlamentares.
 */
export class EmendasService extends RecursoService<'emendas'> {
  /**
   * Consulta os documentos de uma emenda parlamentar.
   * O `codigo` é enviado no caminho da URL.
   *
   * @param codigo Código da emenda parlamentar.
   * @param pagina Número da página (padrão: 1).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Documentos da emenda parlamentar.
   * @example
   * const documentos = await api.emendas.documentos('1234567');
   */
  documentos(codigo: string, pagina = 1, signal?: AbortSignal) {
    return this.consultas.consultar('emendasDocumentos', { codigo, pagina }, signal);
  }
}
