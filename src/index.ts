/**
 * Ponto único da API pública do pacote `sdk-transparencia-br`.
 *
 * Reexporta o cliente principal, os serviços por domínio, o núcleo
 * (HTTP, cache, paginação, erros) e os tipos de contrato dos consumidores.
 * Importe tudo a partir deste barrel — não aprofunde caminhos internos.
 */

// Cliente principal
export { Transparencia, PortalTransparenciaClient } from './client/portal-transparencia.client.js';

// Núcleo: erros e transporte HTTP padrão
export { PortalApiError } from './core/errors/portal-api.error.js';
export { FetchHttpClient } from './core/http/fetch-http-client.js';

// Módulos: serviços por domínio, constantes de endpoints e catálogo de programas
export { BeneficiosService } from './modules/beneficios/services/beneficios.service.js';
export { OrgaosService } from './modules/orgaos/services/orgaos.service.js';
export { ConsultasService } from './modules/consultas/services/consultas.service.js';
export {
  RecursoService,
  RecursoComIdService,
} from './modules/consultas/services/recurso.service.js';
export { ServidoresService } from './modules/consultas/services/servidores.service.js';
export { ContratosService } from './modules/consultas/services/contratos.service.js';
export { LicitacoesService } from './modules/consultas/services/licitacoes.service.js';
export { ConveniosService } from './modules/consultas/services/convenios.service.js';
export { ViagensService } from './modules/consultas/services/viagens.service.js';
export { NotasFiscaisService } from './modules/consultas/services/notas-fiscais.service.js';
export {
  CartoesService,
  TIPOS_CARTAO,
  ROTULOS_TIPOS_CARTAO,
} from './modules/consultas/services/cartoes.service.js';
export { EndpointsService } from './modules/consultas/services/endpoints.service.js';
export { PessoasService, secoesResumo } from './modules/pessoas/services/pessoas.service.js';
export { DespesasService } from './modules/despesas/services/despesas.service.js';
export { RenunciasService } from './modules/renuncias/services/renuncias.service.js';
export { EmendasService } from './modules/emendas/services/emendas.service.js';
export { endpoints } from './modules/consultas/endpoints.js';
export { catalogoProgramas } from './modules/beneficios/catalogo.js';
export {
  catalogoEndpoints,
  buscarEndpoints,
  type EndpointInfo,
  type EndpointParametro,
  type DominioEndpoint,
} from './modules/consultas/catalogo-endpoints.js';

// Tipos públicos: opções do SDK, contratos e DTOs de cada domínio
export type { SdkOptions } from './core/types/sdk-options.type.js';
export type { HttpClientContract, Query } from './core/contracts/http-client.contract.js';
export type {
  ProgramaBeneficio,
  BeneficioQueryDto,
  BeneficioRegistroDto,
  ConsultaBeneficiosDto,
  ResultadoPrograma,
} from './modules/beneficios/dtos/beneficio-query.dto.js';
export type { ProgramaCatalogo, IdentificadorPrograma } from './modules/beneficios/catalogo.js';
export type { RecursoConsulta } from './modules/consultas/services/consultas.service.js';
export type { RecursoPorId } from './modules/consultas/services/consultas.service.js';
export type { TipoCartao } from './modules/consultas/services/cartoes.service.js';
export type {
  ResumoPessoa,
  SecaoResumo,
  ChaveResumo,
  EntradaResumo,
} from './modules/pessoas/services/pessoas.service.js';
export type { EndpointConsulta } from './modules/consultas/endpoints.js';
export type { FiltrosConsultaDto, RegistroDto } from './modules/consultas/dtos/consulta.dto.js';

// Infraestrutura de núcleo: limite de requisições, cache e paginação
export { RequestScheduler } from './core/http/request-scheduler.js';
export { TtlCache } from './core/http/ttl-cache.js';
export { paginate, collectPages } from './core/pagination/paginator.js';
export type { PaginationOptions } from './core/pagination/paginator.js';
export type { CacheOptions, RateLimitOptions } from './core/types/sdk-options.type.js';
