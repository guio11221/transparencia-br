/**
 * Agenda requisições em fila FIFO com limite de taxa por janela deslizante
 * e teto de concorrência, respeitando as regras de rate limit do Portal.
 *
 * @example
 * ```ts
 * const scheduler = new RequestScheduler({ maxRequests: 150, windowMs: 60000 });
 * const resposta = await scheduler.run(() => fetch(url));
 * ```
 */
export class RequestScheduler {
  private readonly stamps: number[] = [];
  private readonly queue: Array<{
    resolve: () => void;
    reject: (e: unknown) => void;
    signal?: AbortSignal;
    cancelled: boolean;
  }> = [];
  private inFlight = 0;
  private timer?: ReturnType<typeof setTimeout>;
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly maxConcurrent: number;
  constructor(options: { maxRequests?: number; windowMs?: number; maxConcurrent?: number } = {}) {
    this.maxRequests = options.maxRequests ?? 150;
    this.windowMs = options.windowMs ?? 60000;
    this.maxConcurrent = options.maxConcurrent ?? 4;
    for (const n of [this.maxRequests, this.windowMs, this.maxConcurrent]) {
      if (!Number.isSafeInteger(n) || n < 1) throw new Error('Configuração de rate limit inválida');
    }
  }
  /**
   * Enfileira e executa `operation` assim que houver vaga na janela e em concorrência.
   *
   * @param operation Função assíncrona a ser executada (ex.: uma chamada `fetch`).
   * @param signal Sinal de cancelamento; abortar remove a operação da fila.
   * @returns O resultado de `operation`.
   * @throws {Error} Imediatamente, se o `signal` já estiver abortado.
   */
  async run<T>(operation: () => Promise<T>, signal?: AbortSignal): Promise<T> {
    if (signal?.aborted) throw signal.reason ?? new Error('Operação cancelada');
    await new Promise<void>((resolve, reject) => {
      const job = { resolve, reject, signal, cancelled: false };
      this.queue.push(job);
      const abort = () => {
        job.cancelled = true;
        reject(signal?.reason ?? new Error('Operação cancelada'));
        this.pump();
      };
      signal?.addEventListener('abort', abort, { once: true });
      const previousResolve = job.resolve;
      job.resolve = () => {
        signal?.removeEventListener('abort', abort);
        previousResolve();
      };
      this.pump();
    });
    try {
      return await operation();
    } finally {
      this.inFlight--;
      this.pump();
    }
  }
  private pump(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    const now = Date.now();
    while (this.stamps.length && this.stamps[0]! <= now - this.windowMs) this.stamps.shift();
    while (
      this.queue.length &&
      this.inFlight < this.maxConcurrent &&
      this.stamps.length < this.maxRequests
    ) {
      const next = this.queue.shift()!;
      if (next.cancelled || next.signal?.aborted) continue;
      this.inFlight++;
      this.stamps.push(Date.now());
      next.resolve();
    }
    if (this.queue.length && this.stamps.length >= this.maxRequests) {
      this.timer = setTimeout(
        () => this.pump(),
        Math.max(1, this.stamps[0]! + this.windowMs - Date.now()),
      );
    }
  }
}
