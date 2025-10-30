/**
 * Performance monitoring utilities
 * Helps track render performance and identify bottlenecks
 */

import { logger } from './logger';

/**
 * Measures execution time of a function
 * Useful for profiling expensive calculations
 *
 * @example
 * const result = measurePerformance('tokenCalculation', () => {
 *   return calculateTokensConsumed(duration);
 * });
 */
export function measurePerformance<T>(label: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  logger.logPerformance(label, duration);

  return result;
}

/**
 * Debounce function to prevent excessive calls
 * Useful for preventing rapid state updates
 *
 * @example
 * const debouncedCheck = debounce(checkBalance, 100);
 */
// eslint-disable-next-line no-unused-vars
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
  // eslint-disable-next-line no-unused-vars
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function to limit call frequency
 * Ensures function is called at most once per interval
 *
 * @example
 * const throttledUpdate = throttle(updateBalance, 1000);
 */
// eslint-disable-next-line no-unused-vars
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  interval: number
  // eslint-disable-next-line no-unused-vars
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= interval) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Format duration in seconds to MM:SS
 * Ensures consistent time display across UI
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format token amount with 2 decimal places
 * Ensures consistent currency display
 */
export function formatTokens(tokens: number): string {
  return tokens.toFixed(2);
}
