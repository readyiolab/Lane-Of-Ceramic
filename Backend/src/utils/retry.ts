export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  context?: string;
  retryIf?: (error: any) => boolean;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelay = options.baseDelay ?? 300;
  const maxDelay = options.maxDelay ?? 5000;
  const context = options.context ?? "operation";
  const retryIf = options.retryIf ?? (() => true);

  let lastError: any;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const canRetry = attempt < maxAttempts && retryIf(error);
      if (!canRetry) break;
      const delay = Math.min(maxDelay, baseDelay * Math.pow(2, attempt - 1));
      console.warn(`[retry] ${context} failed on attempt ${attempt}, retrying in ${delay}ms`);
      await sleep(delay);
    }
  }

  throw lastError;
}
