#!/usr/bin/env bash
# Expoe Ollama (e opcionalmente o backend) via ngrok para o N8N Cloud.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${OLLAMA_PORT:-11434}"
MODE="${NGROK_MODE:-ollama}" # ollama | all

if ! command -v ngrok >/dev/null 2>&1; then
  echo "Erro: ngrok nao encontrado. Instale em https://ngrok.com/download" >&2
  exit 1
fi

if ! curl -sf "http://localhost:${PORT}/api/tags" >/dev/null 2>&1; then
  echo "Erro: Ollama nao esta rodando em localhost:${PORT}" >&2
  echo "Rode primeiro: npm run ollama:setup" >&2
  exit 1
fi

if curl -sf http://127.0.0.1:4040/api/tunnels >/dev/null 2>&1; then
  EXISTING="$(curl -s http://127.0.0.1:4040/api/tunnels | python3 -c "
import json, sys
data = json.load(sys.stdin)
for t in data.get('tunnels', []):
    print(t.get('public_url',''), t.get('config',{}).get('addr',''))
" 2>/dev/null || true)"
  if [ -n "$EXISTING" ]; then
    echo "Aviso: ja existe um ngrok ativo:"
    echo "$EXISTING"
    echo ""
    echo "O plano free permite 1 agente. Pare o ngrok atual (Ctrl+C) e use:"
    echo "  NGROK_MODE=all npm run ollama:tunnel"
    echo "  (com backend/ngrok.yml — veja ngrok.example.yml)"
    echo ""
    if [ "$MODE" = "ollama" ]; then
      echo "Ou pare o tunel na porta 3000 e rode este script de novo."
      exit 1
    fi
  fi
fi

print_n8n_hints() {
  local ollama_url="$1"
  echo ""
  echo "Configure no N8N (Settings → Variables):"
  echo "  OLLAMA_URL = ${ollama_url}"
  echo "  EMBEDDING_MODEL = nomic-embed-text"
  echo ""
  echo "Node HTTP de embedding:"
  echo "  URL: ={{ (\$vars.OLLAMA_URL).replace(/\\/\$/, '') + '/api/embed' }}"
  echo "  Body: { \"model\": \"nomic-embed-text\", \"input\": \"...\" }"
  echo "  Vetor: \$json.embeddings[0]"
}

if [ "$MODE" = "all" ]; then
  CONFIG="${NGROK_CONFIG:-$ROOT/ngrok.yml}"
  GLOBAL_CONFIG="${NGROK_GLOBAL_CONFIG:-$HOME/.config/ngrok/ngrok.yml}"

  if [ ! -f "$CONFIG" ]; then
    echo "Erro: $CONFIG nao encontrado." >&2
    echo "Copie ngrok.example.yml para ngrok.yml" >&2
    exit 1
  fi

  NGROK_START_ARGS=(start --all --config "$CONFIG")
  if [ -f "$GLOBAL_CONFIG" ]; then
    # authtoken fica no config global (~/.config/ngrok/ngrok.yml)
    NGROK_START_ARGS=(start --all --config "$GLOBAL_CONFIG" --config "$CONFIG")
  else
    echo "Aviso: $GLOBAL_CONFIG nao encontrado." >&2
    echo "Configure o authtoken: ngrok config add-authtoken SEU_TOKEN" >&2
    echo "https://dashboard.ngrok.com/get-started/your-authtoken" >&2
    exit 1
  fi

  echo "==> Iniciando ngrok (backend:3000 + ollama:11434)..."
  echo "Apos subir, abra http://127.0.0.1:4040 e copie a URL do tunel 'ollama'."
  echo ""
  exec ngrok "${NGROK_START_ARGS[@]}"
fi

echo "==> Expondo apenas Ollama (porta ${PORT}) via ngrok..."
echo "Ctrl+C para encerrar."
echo ""

NGROK_ARGS=(http "$PORT")
if [ -n "${NGROK_BASIC_AUTH:-}" ]; then
  NGROK_ARGS+=(--basic-auth="$NGROK_BASIC_AUTH")
fi

# Roda ngrok em background brevemente para capturar URL (modo one-shot informativo)
ngrok "${NGROK_ARGS[@]}" --log=stdout > /tmp/flowassist-ngrok-ollama.log 2>&1 &
NGROK_PID=$!
trap 'kill $NGROK_PID 2>/dev/null || true' EXIT

for i in $(seq 1 20); do
  OLLAMA_PUBLIC="$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | python3 -c "
import json, sys
data = json.load(sys.stdin)
for t in data.get('tunnels', []):
    addr = t.get('config', {}).get('addr', '')
    if '11434' in str(addr):
        print(t.get('public_url', ''))
        break
else:
    ts = data.get('tunnels') or []
    if len(ts) == 1 and '11434' in str(ts[0].get('config', {}).get('addr', '')):
        print(ts[0].get('public_url', ''))
" 2>/dev/null || true)"
  if [ -n "$OLLAMA_PUBLIC" ]; then
    print_n8n_hints "$OLLAMA_PUBLIC"
    break
  fi
  sleep 1
done

wait $NGROK_PID
