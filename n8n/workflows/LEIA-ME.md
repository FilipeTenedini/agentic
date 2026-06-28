# Workflows N8N — FlowAssist

## Arquivo único (recomendado)

**`flowassist-all-workflows.json`** — contém os 8 workflows em um array JSON.

> **Atenção:** a interface do N8N **não importa arrays**. Use o arquivo único apenas via CLI (abaixo). Na UI, importe os arquivos `01-...json` a `08-...json` individualmente.

### Importar via CLI

```bash
n8n import:workflow --input=flowassist-all-workflows.json
```

Com Docker:

```bash
docker cp flowassist-all-workflows.json n8n:/tmp/flowassist-all-workflows.json
docker exec n8n n8n import:workflow --input=/tmp/flowassist-all-workflows.json
```

### Importar via interface (UI)

N8N → **⋯** → **Import from File** → escolha **um** arquivo `.json` por vez (ex.: `01-receber-whatsapp.json`).

**Não use** `flowassist-all-workflows.json` na UI — esse arquivo é um array e gera o erro *"does not contain valid JSON data"*.

---

## Arquivos individuais (alternativa)

Importe via **Import from File** nesta ordem:

| # | Arquivo | Webhook |
|---|---------|---------|
| 1 | `02-buscar-agente.json` | — (sub-workflow) |
| 2 | `03-montar-prompt.json` | — (sub-workflow) |
| 3 | `04-buscar-conhecimento.json` | — (sub-workflow) |
| 4 | `05-executar-llm.json` | `POST /webhook/personal-use-chat` |
| 5 | `06-salvar-historico.json` | — (sub-workflow) |
| 6 | `07-processar-arquivo.json` | `POST /webhook/knowledge-file-processing` |
| 7 | `08-eventos-whatsapp.json` | `POST /webhook/whatsapp-events` |
| 8 | `01-receber-whatsapp.json` | `POST /webhook/whatsapp-incoming` |
4. Configure variáveis de ambiente no N8N:

```
API_URL=http://localhost:3000
N8N_WEBHOOK_SECRET=dev-webhook-secret
OPENAI_API_KEY=sk-...
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=...
# Arquivos da base de conhecimento ficam no S3; o backend envia downloadUrl assinada ao N8N.
```

5. Ative os workflows (toggle **Active**)

## Backend

No `.env` do backend, para usar o N8N:

```
MOCK_AI=false
MOCK_RAG=false
MOCK_WHATSAPP=false
N8N_URL=http://localhost:5678
```
