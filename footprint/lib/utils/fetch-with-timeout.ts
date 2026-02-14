/**
 * Fetch wrapper with AbortController-based timeout support.
 * Prevents external API hangs from exhausting serverless function time.
 */

export const TIMEOUT_DEFAULTS = {
  /** 15s — payments, shipping APIs */
  API: 15_000,
  /** 30s — AI services (Gemini, Replicate, Remove.bg) */
  AI: 30_000,
} as const;

export async function fetchWithTimeout(
  url: string | URL,
  options: RequestInit & { timeout: number }
): Promise<Response> {
  const { timeout, ...fetchOptions } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...fetchOptions, signal: controller.signal });
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms: ${url}`);
    }
    throw e;
  } finally {
    clearTimeout(id);
  }
}
