import type { ConsultasService } from '../../consultas/services/consultas.service.js';
import type { RegistroDto } from '../../consultas/dtos/consulta.dto.js';
import type { ResultadoPrograma } from '../../beneficios/dtos/beneficio-query.dto.js';
import type { BeneficiosService } from '../../beneficios/services/beneficios.service.js';
import { PortalApiError } from '../../../core/errors/portal-api.error.js';

/**
 * Representa uma seção do resumo consolidado de uma pessoa.
 * Cada seção é tratada de forma independente e traz a primeira página dos dados consultados.
 *
 * @template T Tipo dos dados retornados em caso de sucesso.
 */
export type SecaoResumo<T> =
  { status: 'sucesso'; dados: T } | { status: 'erro'; erro: { mensagem: string; status?: number } };

/**
 * Estrutura consolidada com as seções do resumo de uma pessoa.
 * As seções `pessoa` e `beneficios` são sempre presentes. As demais seções
 * só são consultadas quando há CPF informado.
 */
export interface ResumoPessoa {
  /** Dados cadastrais da pessoa física consultada. */
  pessoa: SecaoResumo<RegistroDto>;
  /** Benefícios vinculados à pessoa. */
  beneficios: SecaoResumo<ResultadoPrograma[]>;
  /** Cartões de pagamento vinculados ao portador (apenas quando há CPF). */
  cartoes?: SecaoResumo<RegistroDto[]>;
  /** Viagens registradas vinculadas ao CPF (apenas quando há CPF). */
  viagens?: SecaoResumo<RegistroDto[]>;
  /** Contratos vinculados ao CPF/CNPJ (apenas quando há CPF). */
  contratos?: SecaoResumo<RegistroDto[]>;
  /** Pessoas Expostas Politicamente vinculadas ao CPF (apenas quando há CPF). */
  peps?: SecaoResumo<RegistroDto[]>;
  /** Cadastro de Entidades Inidôneas e Suspensas vinculado ao CPF (apenas quando há CPF). */
  ceis?: SecaoResumo<RegistroDto[]>;
  /** Cadastro Nacional de Empresas Punidas vinculado ao CPF (apenas quando há CPF). */
  cnep?: SecaoResumo<RegistroDto[]>;
  /** Cadastro de Expulsões da Administração Federal vinculado ao CPF (apenas quando há CPF). */
  ceaf?: SecaoResumo<RegistroDto[]>;
}

interface TarefaResumo {
  chave: keyof ResumoPessoa;
  executar: () => Promise<unknown>;
}

function secaoDe(resultado: PromiseSettledResult<unknown>): SecaoResumo<unknown> {
  if (resultado.status === 'fulfilled') return { status: 'sucesso', dados: resultado.value };
  return {
    status: 'erro',
    erro: {
      mensagem:
        resultado.reason instanceof Error ? resultado.reason.message : String(resultado.reason),
      ...(resultado.reason instanceof PortalApiError ? { status: resultado.reason.status } : {}),
    },
  };
}

/**
 * Serviço para consultas consolidadas e pontuais de pessoas físicas e jurídicas.
 */
export class PessoasService {
  constructor(
    private readonly consultas: ConsultasService,
    private readonly beneficios: BeneficiosService,
  ) {}

  /**
   * Consulta os dados cadastrais de uma pessoa física.
   *
   * @param filtro Objeto com `cpf` ou `nis` (pelo menos um).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Dados cadastrais da pessoa física.
   * @throws Error se nenhum identificador for informado (síncrono).
   * @example
   * const pessoa = await api.pessoas.fisica({ cpf: '12345678901' });
   */
  fisica(filtro: { cpf?: string; nis?: string }, signal?: AbortSignal): Promise<RegistroDto> {
    if (!filtro?.cpf?.trim() && !filtro?.nis?.trim()) throw new Error('Informe cpf ou nis');
    return this.consultas.consultarUm('pessoaFisica', filtro, signal);
  }

  /**
   * Consulta os dados cadastrais de uma pessoa jurídica.
   *
   * @param cnpj CNPJ da pessoa jurídica.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Dados cadastrais da pessoa jurídica.
   * @example
   * const empresa = await api.pessoas.juridica('12345678000190');
   */
  juridica(cnpj: string, signal?: AbortSignal): Promise<RegistroDto> {
    return this.consultas.consultarUm('pessoaJuridica', { cnpj }, signal);
  }

  /**
   * Obtém um resumo consolidado do que uma pessoa recebe, consultado em paralelo.
   *
   * Dispara em paralelo (Promise.allSettled) as seções independentes: `pessoa` e
   * `beneficios` sempre. `cartoes`, `viagens`, `contratos`, `peps`, `ceis`, `cnep` e
   * `ceaf` apenas quando há CPF. Cada seção é `SecaoResumo` = `{ status: 'sucesso', dados }`
   * ou `{ status: 'erro', erro: { mensagem, status? } }` e traz a primeira página.
   * Falha em uma seção não interrompe as demais.
   *
   * @param identificador Objeto com `cpf` ou `nis` (pelo menos um).
   * @param signal AbortSignal opcional para cancelar as requisições.
   * @returns Seções independentes do resumo da pessoa.
   * @throws Error se nenhum identificador for informado (síncrono).
   * @example
   * const resumo = await api.pessoas.resumo({ cpf: '12345678901' });
   */
  resumo(
    identificador: { cpf?: string; nis?: string },
    signal?: AbortSignal,
  ): Promise<ResumoPessoa> {
    const cpf = identificador?.cpf?.trim() || undefined;
    const nis = identificador?.nis?.trim() || undefined;
    if (!cpf && !nis) throw new Error('Informe cpf ou nis');
    return (async () => {
      const tarefas: TarefaResumo[] = [
        {
          chave: 'pessoa',
          executar: () =>
            this.consultas.consultarUm('pessoaFisica', cpf ? { cpf } : { nis }, signal),
        },
        {
          chave: 'beneficios',
          executar: () => this.beneficios.porPessoa({ cpf, nis }, signal),
        },
      ];
      if (cpf) {
        tarefas.push(
          {
            chave: 'cartoes',
            executar: () => this.consultas.consultar('cartoes', { cpfPortador: cpf }, signal),
          },
          {
            chave: 'viagens',
            executar: () => this.consultas.consultar('viagensPorCpf', { cpf }, signal),
          },
          {
            chave: 'contratos',
            executar: () =>
              this.consultas.consultar('contratosPorCpfCnpj', { cpfCnpj: cpf }, signal),
          },
          { chave: 'peps', executar: () => this.consultas.consultar('peps', { cpf }, signal) },
          {
            chave: 'ceis',
            executar: () => this.consultas.consultar('ceis', { codigoSancionado: cpf }, signal),
          },
          {
            chave: 'cnep',
            executar: () => this.consultas.consultar('cnep', { codigoSancionado: cpf }, signal),
          },
          {
            chave: 'ceaf',
            executar: () => this.consultas.consultar('ceaf', { cpfSancionado: cpf }, signal),
          },
        );
      }
      const resultados = await Promise.allSettled(tarefas.map((tarefa) => tarefa.executar()));
      const secoes: Record<string, SecaoResumo<unknown>> = {};
      resultados.forEach((resultado, indice) => {
        secoes[tarefas[indice]!.chave] = secaoDe(resultado);
      });
      return secoes as unknown as ResumoPessoa;
    })();
  }
}
