# FlowAssist

Plataforma SaaS de automações e assistentes inteligentes. Esta é a versão MVP com o
frontend totalmente mockado (sem backend nem IA real), criada para validar produto, UX e
conversão.

## Stack

- React + TypeScript
- Vite
- TailwindCSS + componentes no estilo Shadcn/UI
- React Router
- Lucide Icons
- react-hook-form + zod (validação)
- next-themes (tema claro/escuro) + sonner (toasts)

## Como rodar

```bash
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

Outros comandos:

```bash
npm run build    # type-check + build de produção
npm run preview  # serve o build
```

## Acesso de demonstração

- Email: `demo@flowassist.com`
- Senha: `demo1234`

Qualquer email válido com senha de 8+ caracteres também cria uma conta mock. Os dados de
sessão, configurações do agente e preferências são persistidos no `localStorage`.

## Mapa de rotas

- `/` — Landing page pública
- `/login`, `/cadastro`, `/recuperar-senha` — Autenticação
- `/app/dashboard` — Painel inicial com onboarding e estatísticas
- `/app/meu-agente` — Configuração de WhatsApp e uso pessoal (toggles)
- `/app/chat` — Chat interno estilo ChatGPT (visível apenas com uso pessoal ativo)
- `/app/configuracoes`, `/app/perfil`, `/app/assinatura`, `/app/ajuda`

## Estrutura

```
src/
├── app/          # Bootstrap (App, providers, rotas)
├── components/   # ui/ (Shadcn) + layouts/ + seções por domínio
├── contexts/     # auth, settings, chat (estado mockado)
├── hooks/        # use-local-storage, use-mobile
├── lib/          # utils, constants, validators
├── mocks/        # dados falsos (usuário, conversas, assinatura, faq...)
├── pages/        # uma página por rota
├── styles/       # globals.css com tokens do design system
└── types/        # contratos TypeScript compartilhados
```

> Esta versão é uma demonstração: as respostas do assistente, a conexão do WhatsApp e a
> gestão de assinatura são todas simuladas.
