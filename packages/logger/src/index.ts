import pino from "pino";

export type Logger = ReturnType<typeof createLogger>;

export function createLogger(scope: string, level: pino.Level = process.env.LOG_LEVEL as pino.Level | undefined ?? "info") {
  return pino({
    name: `oasis:${scope}`,
    level,
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { level: label };
      },
    },
  });
}

export const logger = createLogger("app");
