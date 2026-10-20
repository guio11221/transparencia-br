import { z } from 'zod';

/**
 * Normaliza um identificador removendo formatação e exige exatamente 11 dígitos.
 *
 * Aceita CPF, NIS ou código com máscara (pontos, hífens, espaços); a comparação de
 * dígito verificador não é feita porque os três formatos compartilham o mesmo tamanho.
 * `parse()` lança `Error` (ZodError) de forma síncrona, antes de qualquer requisição.
 */
export const identificadorSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ''))
  .pipe(z.string().regex(/^\d{11}$/, 'CPF ou NIS deve possuir 11 dígitos'));
/**
 * Converte o filtro de mês para o formato numérico `AAAAMM` exigido pela API.
 *
 * Aceita string `AAAA-MM` (ex.: `'2024-03'`) ou número inteiro `AAAAMM` entre 200001 e
 * 209912, e devolve sempre o número correspondente, validando a parte mensal (01–12).
 * Lança `Error` síncrono (`Mês inválido`) quando o mês está fora da faixa.
 */
export const mesSchema = z
  .union([z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/), z.number().int().min(200001).max(209912)])
  .transform((v) => {
    const mes = typeof v === 'string' ? Number(v.replace('-', '')) : v;
    if (mes % 100 < 1 || mes % 100 > 12) throw new Error('Mês inválido');
    return mes;
  });
/**
 * Filtros aceitos pelos métodos de consulta de benefícios.
 *
 * Exige exatamente um identificador entre `cpf`, `nis` e `codigo` (todos normalizados por
 * {@link identificadorSchema}), aceita `mes`/`mesAno` (convertidos por {@link mesSchema} para
 * `mesAno=AAAAMM`) e aplica `pagina=1` por padrão. A validação é síncrona: `parse()` lança
 * `Error` antes de a promise da requisição ser criada.
 */
export const beneficioQuerySchema = z
  .object({
    cpf: identificadorSchema.optional(),
    nis: identificadorSchema.optional(),
    codigo: identificadorSchema.optional(), // compatibilidade com a v0.2
    mes: mesSchema.optional(),
    mesAno: mesSchema.optional(),
    pagina: z.number().int().positive().default(1),
  })
  .refine(
    (v) => Number(Boolean(v.cpf)) + Number(Boolean(v.nis)) + Number(Boolean(v.codigo)) === 1,
    'Informe apenas um identificador: cpf, nis ou codigo',
  );
/** Forma aceita pelos métodos da SDK — o input do schema, antes das transformações e do `default` de `pagina`. */
export type BeneficioQueryDto = z.input<typeof beneficioQuerySchema>;
/** Registro retornado pela API; shape livre porque cada programa devolve colunas próprias. */
export type BeneficioRegistroDto = Record<string, unknown> & {
  id?: number;
  mesReferencia?: string;
  valor?: number;
  beneficiario?: Record<string, unknown>;
};
/** Consulta agregada: filtros comuns mais a lista de `programas` a consultar (`undefined` = todos). */
export type ConsultaBeneficiosDto = BeneficioQueryDto & { programas?: ProgramaBeneficio[] };
/** Chaves dos programas de benefício suportados pela SDK (definidas em `catalogo.ts`). */
export type ProgramaBeneficio =
  | 'bolsaFamilia'
  | 'bolsaFamiliaSacado'
  | 'novoBolsaFamilia'
  | 'auxilioBrasil'
  | 'auxilioEmergencial'
  | 'bpc'
  | 'seguroDefeso'
  | 'garantiaSafra'
  | 'peti';
/**
 * Resultado por programa nas consultas agregadas (`consultarProgramas`, `porPessoa`).
 *
 * União discriminada por `status`: `'sucesso'` traz `dados`; `'erro'` traz `mensagem` e,
 * quando a falha for HTTP, o código `status` — permitindo tratar cada programa isoladamente.
 */
export type ResultadoPrograma =
  | {
      programa: ProgramaBeneficio;
      status: 'sucesso';
      dados: BeneficioRegistroDto[];
    }
  | {
      programa: ProgramaBeneficio;
      status: 'erro';
      erro: { mensagem: string; status?: number };
    };
