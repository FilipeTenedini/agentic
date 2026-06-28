#!/usr/bin/env bash
# Sobe Ollama (Docker), baixa nomic-embed-text e valida /api/embed localmente.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MODEL="${EMBEDDING_MODEL:-nomic-embed-text}"
CONTAINER="flowassist-ollama"
OLLAMA_URL="${OLLAMA_URL:-http://localhost:11434}"

echo "==> Subindo Ollama (docker compose)..."
docker compose up -d ollama

echo "==> Aguardando Ollama ficar pronto..."
for i in $(seq 1 60); do
  if curl -sf "${OLLAMA_URL}/api/tags" >/dev/null 2>&1; then
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "Erro: Ollama nao respondeu em ${OLLAMA_URL}" >&2
    exit 1
  fi
  sleep 2
done

echo "==> Baixando modelo ${MODEL} (pode demorar na primeira vez)..."
docker exec "$CONTAINER" ollama pull "$MODEL"

echo "==> Testando embedding local..."
RESPONSE="$(curl -sf "${OLLAMA_URL}/api/embed" \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"${MODEL}\",\"input\":\"teste ghg protocol\"}")"

DIMS="$(echo "$RESPONSE" | python3 -c "
import json, sys
data = json.load(sys.stdin)
emb = (data.get('embeddings') or [[]])[0]
print(len(emb))
" 2>/dev/null || echo "0")"

if [ "$DIMS" -lt 700 ]; then
  echo "Erro: embedding retornou ${DIMS} dims (esperado ~768)" >&2
  echo "$RESPONSE" | head -c 500 >&2
  exit 1
fi

echo ""
echo "Ollama OK — modelo ${MODEL}, ${DIMS} dimensoes."
echo "Local: ${OLLAMA_URL}/api/embed"
echo ""
echo "Para expor ao N8N Cloud, rode em outro terminal:"
echo "  npm run ollama:tunnel"
echo ""
echo "Depois configure no N8N (Settings → Variables):"
echo "  OLLAMA_URL = URL publica do ngrok (sem /api/embed)"
echo "  EMBEDDING_MODEL = ${MODEL}"
