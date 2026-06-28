import { env } from "./config/env.js";
import { createServer } from "./infra/http/server.js";
import { ensureDatabaseReady, disconnectPrisma } from "./infra/prisma.js";
import { resumeStuckMockProcessing } from "./modules/knowledge/knowledge.service.js";
import { logger } from "./shared/utils/logger.js";

const log = logger.child("boot");

async function bootstrap() {
  log.info("Iniciando FlowAssist backend...");

  log.info("Conectando ao PostgreSQL...");
  await ensureDatabaseReady();
  log.info("Banco de dados pronto.");

  const resumed = await resumeStuckMockProcessing();
  if (resumed > 0) {
    log.info(`${resumed} arquivo(s) retomando processamento mock.`);
  }

  if (env.N8N_URL.includes("webhook-test")) {
    log.warn(
      "N8N_URL usa /webhook-test. Em producao use /webhook com workflows Active."
    );
  }

  const app = createServer();
  const server = app.listen(env.PORT, () => {
    log.info(`Servidor HTTP em http://localhost:${env.PORT}`);
    log.info("Mock mode configurado", {
      MOCK_AI: env.MOCK_AI,
      MOCK_RAG: env.MOCK_RAG,
      MOCK_WHATSAPP: env.MOCK_WHATSAPP,
    });
    log.info("Aguardando requisicoes...");
  });

  const shutdown = async (signal: string) => {
    log.info(`Recebido ${signal}, encerrando...`);
    server.close(async () => {
      await disconnectPrisma();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

bootstrap().catch((err) => {
  log.error("Falha ao iniciar o servidor", {
    error: err instanceof Error ? err.message : String(err),
  });
  process.exit(1);
});
