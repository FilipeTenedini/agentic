export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  /** Loga linha ja formatada, sem prefixo adicional. */
  raw(level: LogLevel, message: string): void;
  child(context: string): Logger;
}

type LogSink = (line: string, meta?: Record<string, unknown>) => void;

/** Sinks atuais: console. Trocar aqui para Pino, Winston, etc. */
const sinks: Record<LogLevel, LogSink> = {
  debug: (line, meta) => (meta ? console.log(line, meta) : console.log(line)),
  info: (line, meta) => (meta ? console.log(line, meta) : console.log(line)),
  warn: (line, meta) => (meta ? console.warn(line, meta) : console.warn(line)),
  error: (line, meta) => (meta ? console.error(line, meta) : console.error(line)),
};

function formatLine(
  level: LogLevel,
  context: string | undefined,
  message: string
): string {
  const ts = new Date().toISOString();
  const ctx = context ? ` [${context}]` : "";
  return `[${ts}] ${level.toUpperCase()}${ctx} ${message}`;
}

function createLogger(context?: string): Logger {
  const write = (
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>
  ) => {
    sinks[level](formatLine(level, context, message), meta);
  };

  return {
    debug: (message, meta) => write("debug", message, meta),
    info: (message, meta) => write("info", message, meta),
    warn: (message, meta) => write("warn", message, meta),
    error: (message, meta) => write("error", message, meta),
    raw: (level, message) => sinks[level](message),
    child: (childContext) =>
      createLogger(context ? `${context}:${childContext}` : childContext),
  };
}

/** Logger raiz do backend. */
export const logger = createLogger();
