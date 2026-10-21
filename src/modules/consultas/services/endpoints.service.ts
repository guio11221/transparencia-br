import type { ConsultasService } from './consultas.service.js';
import type { FiltrosConsultaDto, RegistroDto } from '../dtos/consulta.dto.js';
import {
  buscarEndpoints,
  catalogoEndpoints,
  type DominioEndpoint,
  type EndpointInfo,
  type EndpointParametro,
} from '../catalogo-endpoints.js';

/**
 * Descoberta e execução de qualquer endpoint oficial do Portal da Transparência.
 *
 * Este serviço é a porta de entrada para "achar o que procura": `catalogo()` devolve a
 * lista completa de endpoints com título, descrição e parâmetros, `buscar()` faz uma
 * pesquisa textual tolerante a acentos e `listar()` filtra por domínio. O método
 * `consultar()` executa um endpoint do catálogo diretamente, reaproveitando a validação
 * e a paginação do {@link ConsultasService}.
 *
 * @example
 * const resultados = api.endpoints.buscar('cartao');
 * const dados = await api.endpoints.consultar('cartoes', { cpfPortador: '12345678901' });
 */
export class EndpointsService {
  constructor(private readonly consultas: ConsultasService) {}

  /**
   * Lista o catálogo completo de endpoints, opcionalmente restrito a um domínio.
   *
   * @param dominio Domínio de negócio para filtrar (ex.: `'beneficios'`, `'sancoes'`).
   * @returns Cópia defensiva das entradas do catálogo.
   * @example
   * const deSancoes = api.endpoints.listar('sancoes');
   */
  listar(dominio?: DominioEndpoint): EndpointInfo[] {
    return buscarEndpoints('', dominio).map(clonar);
  }

  /**
   * Pesquisa endpoints por texto livre.
   *
   * A busca ignora acentos e caixa e varre título, descrição, caminho, tags e nomes de
   * parâmetros. Vários termos funcionam como filtro aditivo (todos precisam casar).
   *
   * @param termo Texto a procurar; vazio devolve tudo (respeitando `dominio`).
   * @param dominio Domínio opcional para restringir a busca.
   * @returns Endpoints que casam com o termo, na ordem do catálogo.
   * @example
   * const cartoes = api.endpoints.buscar('cartao');
   * const municipio = api.endpoints.buscar('municipio', 'beneficios');
   */
  buscar(termo = '', dominio?: DominioEndpoint): EndpointInfo[] {
    return buscarEndpoints(termo, dominio).map(clonar);
  }

  /**
   * Descreve um endpoint específico do catálogo.
   *
   * @param recurso Chave do endpoint em `endpoints` (ex.: `'ceis'`).
   * @returns A entrada do catálogo correspondente, ou `undefined` se não existir.
   * @example
   * const info = api.endpoints.descrever('ceis');
   * console.log(info?.parametros.map((p) => p.nome));
   */
  descrever(recurso: string): EndpointInfo | undefined {
    const encontrado = catalogoEndpoints.find((e) => e.recurso === recurso);
    return encontrado ? clonar(encontrado) : undefined;
  }

  /**
   * Lista os domínios disponíveis no catálogo.
   *
   * @returns Os domínios distintos, em ordem alfabética.
   * @example
   * const dominios = api.endpoints.dominios();
   */
  dominios(): DominioEndpoint[] {
    return [...new Set(catalogoEndpoints.map((e) => e.dominio))].sort();
  }

  /**
   * Executa um endpoint do catálogo com os filtros informados.
   *
   * Delega ao {@link ConsultasService}, aplicando validação síncrona, página padrão e
   * substituição de placeholders de caminho — o mesmo comportamento dos serviços por
   * domínio, acessível por chave.
   *
   * @param recurso Chave do endpoint em `endpoints`.
   * @param filtros Filtros em query string; `pagina` recebe `1` quando omitida.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Os registros devolvidos pelo endpoint.
   * @throws `Error` síncrono se algum parâmetro obrigatório estiver ausente ou inválido.
   * @example
   * const peps = await api.endpoints.consultar('peps', { nome: 'Silva' });
   */
  consultar(
    recurso: EndpointInfo['recurso'],
    filtros: FiltrosConsultaDto = {},
    signal?: AbortSignal,
  ): Promise<RegistroDto[]> {
    return this.consultas.consultar(recurso, filtros, signal);
  }
}

/** Cópia defensiva de uma entrada do catálogo, incluindo os parâmetros aninhados. */
function clonar(info: EndpointInfo): EndpointInfo {
  return {
    ...info,
    parametros: info.parametros.map((p): EndpointParametro => ({ ...p })),
    tags: [...info.tags],
  };
}
