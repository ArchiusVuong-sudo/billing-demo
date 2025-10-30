/**
 * Logging utility for tracking session events and errors
 * In production, this would integrate with services like Sentry, DataDog, or LogRocket
 */

export enum LogLevel {
  DEBUG = 'debug', // eslint-disable-line no-unused-vars
  INFO = 'info', // eslint-disable-line no-unused-vars
  WARN = 'warn', // eslint-disable-line no-unused-vars
  ERROR = 'error', // eslint-disable-line no-unused-vars
}

export interface SessionEvent {
  type: 'SESSION_START' | 'SESSION_END' | 'LOW_BALANCE_WARNING' | 'BALANCE_DEPLETED' | 'ERROR';
  timestamp: number;
  avatarId: string;
  sessionType: string;
  data?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  /**
   * Log session events for analytics
   * In production, send to analytics service (e.g., Mixpanel, Amplitude)
   */
  logSessionEvent(event: SessionEvent): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.log('[Session Event]', {
        ...event,
        timestamp: new Date(event.timestamp).toISOString(),
      });
    }

    // In production, send to analytics service:
    // analyticsService.track(event.type, { ...event });
  }

  /**
   * Log performance metrics
   * Useful for monitoring timer accuracy and calculation performance
   */
  logPerformance(metric: string, duration: number): void {
    if (this.isDevelopment && duration > 10) {
      console.warn(`[Performance] ${metric} took ${duration}ms (threshold: 10ms)`);
    }

    // In production, send to monitoring service:
    // performanceMonitoring.record(metric, duration);
  }

  /**
   * Log errors with context
   * In production, send to error tracking service (e.g., Sentry)
   */
  logError(error: Error, context?: Record<string, unknown>): void {
    console.error('[Error]', error.message, context);

    // In production:
    // Sentry.captureException(error, { extra: context });
  }

  /**
   * Log general info messages
   */
  log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (!this.isDevelopment) return;

    /* eslint-disable no-console */
    const logFn = {
      [LogLevel.DEBUG]: console.debug,
      [LogLevel.INFO]: console.log,
      [LogLevel.WARN]: console.warn,
      [LogLevel.ERROR]: console.error,
    }[level];
    /* eslint-enable no-console */

    logFn(`[${level.toUpperCase()}]`, message, data || '');
  }
}

export const logger = new Logger();
