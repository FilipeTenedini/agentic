# Workflow 08 — Eventos de Conexão WhatsApp

## O que criar

Workflow que recebe eventos de conexão da Evolution API e atualiza o status no backend.

## Por que existe

Quando o usuário clica "Conectar WhatsApp" no frontend, o backend cria a instância e exibe o QR code. A Evolution emite eventos de QR/conexão/desconexão que precisam chegar ao backend para o frontend refletir o estado real.

## Trigger

- **Tipo:** Webhook (POST)
- **Origem:** Evolution API
- **Eventos:** `qrcode.updated`, `connection.update` (ou equivalentes na sua versão)
- **Não é chamado pelo backend**

## Configuração na Evolution

Ao criar instância, configurar webhook global ou por instância apontando para:
```
{N8N_URL}/webhook/whatsapp-events
```

Eventos necessários:
- `QRCODE_UPDATED` / `qrcode.updated`
- `CONNECTION_UPDATE` / `connection.update`

## Saída esperada (callback ao backend)

```
PUT {API_URL}/api/webhooks/whatsapp-status
Header: x-webhook-secret: {WEBHOOK_SECRET}

Body:
{
  "instanceName": "flowassist-a1b2c3d4",
  "connectionStatus": "connected",
  "phoneNumber": "+55 11 98765-4321",
  "connectedAt": "2025-06-19T12:00:00.000Z",
  "qrCode": null
}
```

## Mapeamento de eventos

| Evento Evolution | connectionStatus | Campos extras |
|---|---|---|
| `qrcode.updated` | `connecting` | `qrCode`: base64 ou string do QR |
| `connection.open` | `connected` | `phoneNumber`, `connectedAt`, `qrCode: null` |
| `connection.close` | `disconnected` | `phoneNumber: null`, `qrCode: null` |
| reconexão automática | `reconnecting` | manter `phoneNumber` se disponível |

Valores válidos de `connectionStatus`:
`disconnected` | `connecting` | `connected` | `reconnecting`

## Fluxo de nodes

### 1. Webhook
Receber payload da Evolution.

### 2. Code — Extrair dados
```javascript
const instanceName = $json.instance || $json.instanceName;
const event = $json.event || $json.data?.event;

let connectionStatus = 'disconnected';
let qrCode = null;
let phoneNumber = null;
let connectedAt = null;

if (event.includes('qrcode')) {
  connectionStatus = 'connecting';
  qrCode = $json.data?.qrcode?.base64 || $json.qrcode;
} else if (event.includes('open') || $json.data?.state === 'open') {
  connectionStatus = 'connected';
  phoneNumber = $json.data?.phoneNumber || formatPhone($json);
  connectedAt = new Date().toISOString();
} else if (event.includes('close')) {
  connectionStatus = 'disconnected';
} else if (event.includes('connecting')) {
  connectionStatus = 'reconnecting';
}

return { instanceName, connectionStatus, qrCode, phoneNumber, connectedAt };
```

> Ajuste conforme estrutura real da sua versão da Evolution API v1/v2.

### 3. IF — instanceName válido?
Filtrar eventos sem `instanceName` ou que não comecem com `flowassist-`.

### 4. HTTP Request — Atualizar backend
```
PUT {API_URL}/api/webhooks/whatsapp-status
Headers:
  Content-Type: application/json
  x-webhook-secret: {WEBHOOK_SECRET}
Body: campos normalizados do passo 2
```

### 5. Respond to Webhook (opcional)
`{ "ok": true }`

## Relação com o backend

O backend cria instâncias com:
```
instanceName = "flowassist-" + agentId.substring(0, 8)
```

Tabela `whatsapp_connections` mapeia `instance_name` → `agent_id`.

O frontend faz polling em `GET /api/agent/whatsapp/status` enquanto `connecting`/`reconnecting`.

## Teste

1. Backend: `MOCK_WHATSAPP=false`, Evolution rodando
2. Frontend: clicar "Conectar WhatsApp"
3. Verificar QR code aparece (`connecting`)
4. Escanear QR no celular
5. Status muda para `connected` com número exibido

## Teste manual (simular evento)

```bash
curl -X POST http://localhost:5678/webhook/whatsapp-events \
  -H "Content-Type: application/json" \
  -d '{
    "instance": "flowassist-a1b2c3d4",
    "event": "connection.update",
    "data": { "state": "open", "phoneNumber": "5511987654321" }
  }'
```

Verificar no frontend ou:
```bash
curl http://localhost:3000/api/agent/whatsapp/status \
  -H "Authorization: Bearer <token>"
```

## Dependências

- Evolution API configurada
- Backend com `MOCK_WHATSAPP=false`
- Workflow independente — criar após Workflow 05

## Alternativa

A Evolution pode enviar eventos direto ao backend (`POST /api/webhooks/evolution`). O N8N é preferido para normalizar e estender (logs, alertas, retry).
