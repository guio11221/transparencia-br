import { z } from 'zod';

/** Schema Zod do parâmetro de paginação (`pagina`), com valor padrão 1. */
export const paginationSchema = z.object({ pagina: z.number().int().positive().default(1) });

/** Tipo de entrada aceito pelo {@link paginationSchema}. */
export type PaginationDto = z.input<typeof paginationSchema>;
