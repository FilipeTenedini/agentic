import { env } from "./config/env.js";
import { createServer } from "./infra/http/server.js";
import { ensureDatabaseReady, disconnectPrisma } from "./infra/prisma.js";
import { resumeStuckMockProcessing } from "./modules/knowledge/knowledge.service.js";

async function bootstrap() {
  console.log("Iniciando FlowAssist backend...");

  console.log("Conectando ao PostgreSQL...");
  await ensureDatabaseReady();
  console.log("Banco de dados pronto.");

  const resumed = await resumeStuckMockProcessing();
  if (resumed > 0) {
    console.log(`${resumed} arquivo(s) retomando processamento mock.`);
  }

  const app = createServer();
  const server = app.listen(env.PORT, () => {
    console.log(`Servidor HTTP em http://localhost:${env.PORT}`);
    console.log(
      `Mock mode -> AI: ${env.MOCK_AI} | RAG: ${env.MOCK_RAG} | WhatsApp: ${env.MOCK_WHATSAPP}`
    );
    console.log("Aguardando requisicoes...\n");
  });

  const shutdown = async (signal: string) => {
    console.log(`\nRecebido ${signal}, encerrando...`);
    server.close(async () => {
      await disconnectPrisma();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

bootstrap().catch((err) => {
  console.error("Falha ao iniciar o servidor:", err);
  process.exit(1);
});
