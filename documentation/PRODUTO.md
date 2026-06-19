# FlowAssist — Documentação de Produto

> Documento de produto completo. Escrito em linguagem de negócio/produto, sem termos
> técnicos de programação. Serve para fundadores, time comercial, marketing, suporte,
> design e qualquer pessoa que precise entender **o que** é o FlowAssist, **para quem** ele
> serve e **como** o cliente o utiliza.

---

## Sumário

1. [O que é o FlowAssist](#1-o-que-é-o-flowassist)
2. [O problema que resolvemos](#2-o-problema-que-resolvemos)
3. [Para quem é (público-alvo)](#3-para-quem-é-público-alvo)
4. [Proposta de valor e diferenciais](#4-proposta-de-valor-e-diferenciais)
5. [Conceito central: o "Assistente"](#5-conceito-central-o-assistente)
6. [Visão geral das telas](#6-visão-geral-das-telas)
7. [Jornada do cliente (passo a passo)](#7-jornada-do-cliente-passo-a-passo)
8. [Funcionalidades em detalhe](#8-funcionalidades-em-detalhe)
9. [Planos e limites](#9-planos-e-limites)
10. [Linguagem e tom de voz](#10-linguagem-e-tom-de-voz)
11. [Estado atual: o que é demonstração](#11-estado-atual-o-que-é-demonstração)
12. [Roadmap de produto](#12-roadmap-de-produto)
13. [Perguntas frequentes (FAQ)](#13-perguntas-frequentes-faq)
14. [Glossário de produto](#14-glossário-de-produto)

---

## 1. O que é o FlowAssist

O **FlowAssist** é uma plataforma online (SaaS) que dá a qualquer negócio um **assistente
inteligente** que trabalha sozinho, 24 horas por dia. Esse assistente pode:

- **Responder clientes automaticamente no WhatsApp**, sem que ninguém precise estar online.
- **Ajudar o próprio dono do negócio no dia a dia** através de um chat interno (parecido com
  o ChatGPT), para escrever mensagens, organizar ideias, resumir textos e mais.

Tudo é configurado em poucos minutos, por meio de botões simples, **sem precisar de
conhecimento técnico e sem escrever uma linha de código**.

A promessa central do produto, exibida logo na página inicial, é:

> "Automatize seu atendimento e tenha um assistente inteligente trabalhando por você — no
> WhatsApp e no seu painel."

---

## 2. O problema que resolvemos

Pequenos negócios e profissionais autônomos enfrentam três dores principais:

| Dor | Consequência para o cliente |
| --- | --- |
| **Atendimento manual** consome muito tempo | O dono fica preso respondendo mensagens em vez de cuidar do negócio |
| **Demora para responder** | Clientes desistem, vendas são perdidas, a reputação cai |
| **Ferramentas de IA são complicadas** | A maioria exige configuração técnica que o pequeno negócio não domina |

Além disso, no Brasil o **WhatsApp é o principal canal de contato** — mas conectar um
atendimento automático a ele costuma ser difícil e caro.

O FlowAssist resolve isso entregando **automação de atendimento simples, no canal que o
cliente já usa**, com uma experiência bonita e fácil.

---

## 3. Para quem é (público-alvo)

| Prioridade | Quem é | O que mais valoriza |
| --- | --- | --- |
| **Principal** | Donos de negócios locais (clínicas, lojas, consultórios, salões) | Atender clientes 24/7 no WhatsApp sem contratar mais gente |
| **Secundário** | Profissionais autônomos (consultores, freelancers, corretores) | Um assistente pessoal para organizar tarefas e responder rápido |
| **Terciário** | Pequenas equipes comerciais | Centralizar o atendimento e padronizar as respostas |

**Perfil comum:** pessoas que entendem do seu negócio, mas **não são técnicas**. A interface
precisa ser tão simples quanto usar um aplicativo de banco.

---

## 4. Proposta de valor e diferenciais

O que faz o FlowAssist se destacar:

- **Simplicidade real:** configuração em minutos, com botões de liga/desliga. Nada de código.
- **Canal nativo:** WhatsApp e chat interno no mesmo lugar.
- **Experiência premium:** visual moderno, inspirado em produtos de referência (ChatGPT,
  Linear, Vercel, Stripe). Transmite confiança e qualidade.
- **Tudo em um só painel:** atendimento, configuração, conversas e assinatura unificados.

**Resumo da promessa:** "Um assistente inteligente trabalhando por você, fácil de ligar e
bonito de usar."

---

## 5. Conceito central: o "Assistente"

> **Regra de ouro do produto:** o cliente **nunca** vê termos técnicos como "agente de IA",
> "LLM", "modelo de linguagem" ou "prompt". Para o cliente, é simplesmente o **"Assistente"**
> ou **"Meu Agente"** — um ajudante inteligente.

Internamente, o time pode chamar de "agente de IA". Externamente, sempre usamos linguagem
de benefício: "seu assistente responde", "seu assistente te ajuda", "ative seu assistente".

O Assistente tem **dois modos de uso**, que o cliente liga de forma independente:

1. **WhatsApp** — o assistente responde os clientes finais automaticamente.
2. **Uso Pessoal** — o assistente ajuda o próprio dono dentro do painel, via chat interno.

O cliente pode usar **um, outro, os dois ou nenhum** — total flexibilidade.

---

## 6. Visão geral das telas

O produto tem duas grandes áreas: **pública** (antes de entrar) e **logada** (depois de
entrar).

### Área pública

| Tela | Para que serve |
| --- | --- |
| **Página inicial (Landing)** | Apresentar o produto e converter visitantes em cadastros |
| **Login** | Entrar na conta |
| **Cadastro** | Criar uma conta nova |
| **Recuperar senha** | Pedir um link para redefinir a senha |

### Área logada (o "painel")

| Tela | Para que serve |
| --- | --- |
| **Dashboard** | Visão geral: boas-vindas, próximos passos e resumo de uso |
| **Meu Agente** | Ligar/desligar WhatsApp e Uso Pessoal — o coração do produto |
| **Chat** | Conversar com o assistente (aparece só quando o Uso Pessoal está ligado) |
| **Configurações** | Preferências gerais: tema, notificações, idioma |
| **Perfil** | Dados pessoais: nome, email e foto |
| **Assinatura** | Plano atual, data de renovação e limites de uso |
| **Ajuda** | Perguntas frequentes e contato com o suporte |

---

## 7. Jornada do cliente (passo a passo)

### 7.1 Primeiro contato e cadastro

1. O visitante chega à **página inicial** e conhece os benefícios, como funciona, os planos
   e as perguntas frequentes.
2. Clica em **"Começar grátis"** (ou "Entrar", se já tiver conta).
3. Preenche **nome, email e senha** e cria a conta.
4. É levado direto ao **Dashboard**, já dentro do painel.

### 7.2 Configuração inicial (onboarding)

No Dashboard, um **checklist de boas-vindas** mostra os 3 passos para começar:

1. ☐ Conectar o WhatsApp
2. ☐ Ativar o uso pessoal
3. ☐ Enviar a primeira mensagem no chat

O checklist some sozinho quando os 3 passos são concluídos (ou se o cliente fechá-lo). Isso
guia o cliente a tirar valor do produto rapidamente.

### 7.3 Ligando o WhatsApp

1. O cliente vai em **Meu Agente**.
2. Liga o botão de **WhatsApp**.
3. O sistema mostra **"Conectando..."** e, em seguida, **"Conectado"**, exibindo o número
   conectado.
4. Se precisar, há um botão **"Reconectar"**.

A partir daí (na versão final do produto), o assistente passaria a responder os clientes no
WhatsApp.

### 7.4 Ligando o Uso Pessoal e usando o Chat

1. Em **Meu Agente**, o cliente liga o botão de **Uso Pessoal**.
2. Um novo item, **"Chat"**, aparece no menu lateral.
3. No Chat, o cliente vê conversas anteriores e pode **iniciar uma nova**.
4. Ele digita uma mensagem, o assistente mostra **"digitando..."** e responde.

### 7.5 Cuidando da conta

- **Perfil:** editar nome e trocar a foto.
- **Assinatura:** ver o plano, quando renova e quanto já usou; trocar de plano.
- **Configurações:** mudar tema (claro/escuro), notificações e ver idioma/fuso.
- **Ajuda:** consultar dúvidas comuns ou enviar mensagem ao suporte.
- **Sair:** pelo menu do usuário, no canto superior direito.

---

## 8. Funcionalidades em detalhe

### 8.1 Página inicial (Landing)

Tem o objetivo único de **converter visitante em cadastro**. É composta por:

- **Hero:** título de impacto, frase de apoio, botões de ação e uma prévia visual do painel.
- **Benefícios:** atendimento 24/7, direto no WhatsApp, assistente pessoal, mais conversões.
- **Como funciona:** três passos simples (crie a conta → conecte os canais → deixe o
  assistente trabalhar).
- **Planos:** comparação dos quatro planos disponíveis.
- **Perguntas frequentes:** dúvidas mais comuns.
- **Chamada final + Rodapé:** último convite para começar e links institucionais.

### 8.2 Dashboard

A "casa" do cliente depois do login. Mostra:

- **Saudação personalizada** ("Bom dia, Maria") que muda conforme o horário.
- **Checklist de ativação** (some quando concluído).
- **Cartões de resumo:** status do WhatsApp, número de conversas no chat e mensagens
  respondidas.
- **Atividade recente:** lista das últimas ações relevantes.

### 8.3 Meu Agente (funcionalidade principal)

É onde o cliente decide **como** quer usar o assistente. Dois cartões, cada um com um botão
de liga/desliga:

**WhatsApp**
- Ligado → mostra o número conectado, o status da conexão e um botão "Reconectar".
- Desligado → o painel some e o status fica como "Desconectado".

**Uso Pessoal**
- Ligado → libera o **Chat** no menu e mostra um atalho "Abrir chat".
- Desligado → o Chat some do menu.

### 8.4 Chat interno

Inspirado no ChatGPT, com uma experiência premium:

- **Lista de conversas** à esquerda, com busca e botão "Nova conversa".
- **Área de mensagens** à direita, com as falas do cliente e do assistente.
- **Campo de escrita fixo** embaixo.
- **Estado vazio elegante:** quando não há mensagens, mostra "Como posso ajudar?" e algumas
  sugestões clicáveis.
- **Indicador "digitando..."** enquanto o assistente prepara a resposta.

### 8.5 Perfil

- Editar **nome**.
- Trocar **foto** (pré-visualização imediata).
- O **email** aparece, mas não pode ser alterado.

### 8.6 Assinatura

- **Plano atual** com preço e selo "Ativo".
- **Data de renovação**.
- **Limites de uso** em barras de progresso (mensagens de WhatsApp, mensagens de chat,
  conversas).
- Botão **"Alterar plano"** abre uma janela para comparar e trocar de plano.

### 8.7 Configurações

- **Aparência:** tema claro, escuro ou automático.
- **Notificações:** ligar/desligar avisos por email, novidades e relatório semanal.
- **Idioma e região:** Português (Brasil) e fuso de Brasília.

### 8.8 Ajuda

- **Perguntas frequentes** em formato sanfona (expande/recolhe).
- **Cartão de contato:** email e horário do suporte.
- **Formulário** para enviar uma mensagem ao suporte.

---

## 9. Planos e limites

Quatro planos, do gratuito ao avançado. O cliente pode mudar de plano quando quiser, sem
fidelidade.

| Plano | Preço/mês | Mensagens WhatsApp | Mensagens no chat | Conversas |
| --- | --- | --- | --- | --- |
| **Free** | R$ 0 | 100 | 50 | 5 |
| **Starter** | R$ 97 | 1.000 | 500 | 50 |
| **Pro** | R$ 197 | 5.000 | 2.000 | 200 |
| **Business** | R$ 497 | Ilimitado | Ilimitado | Ilimitado |

O plano **Starter** é destacado como "Mais popular". O cliente de demonstração começa no
Starter, com parte dos limites já consumida, para ilustrar como as barras de uso aparecem.

---

## 10. Linguagem e tom de voz

**Princípios de comunicação com o cliente:**

- **Fale de benefícios, não de tecnologia.** "Seu assistente responde sozinho" em vez de
  "nosso modelo de IA processa mensagens".
- **Nunca exponha jargão interno** ("agente de IA", "LLM", "prompt", "mock").
- **Tom acolhedor e confiante**, em Português do Brasil.
- **Clareza acima de tudo:** frases curtas, instruções simples.
- **Reforce segurança e simplicidade** em momentos de decisão (cadastro, conexão, upgrade).

**Exemplos de microtexto usados no produto:**

- "Bem-vindo de volta!" (após login)
- "Conta criada com sucesso!" (após cadastro)
- "Conectando o WhatsApp..." → "Conectado"
- "Uso pessoal ativado. O chat está disponível."
- "Mensagem enviada! Retornaremos em breve." (suporte)

---

## 11. Estado atual: o que é demonstração

> Importante para alinhar expectativas com clientes, investidores e parceiros.

A versão atual é um **protótipo navegável (MVP de validação)**. Ele serve para **mostrar a
experiência completa do produto e validar o interesse do mercado**, antes de construir a
tecnologia pesada por trás.

**O que já funciona de verdade (na experiência):**

- Navegar por todas as telas.
- Criar conta, entrar e sair.
- Ligar/desligar WhatsApp e Uso Pessoal, com os status mudando na tela.
- Conversar no chat e receber respostas.
- Editar perfil, trocar de plano, alternar tema.

**O que ainda é simulado (não real):**

- **Não há conexão real com o WhatsApp.** O status "Conectado" e o número são ilustrativos.
- **Não há inteligência artificial real.** As respostas do chat são mensagens prontas e
  rotativas, apenas para demonstrar a experiência.
- **Não há cobrança real.** Trocar de plano não gera pagamento.
- **Os dados ficam só no navegador do cliente.** Se ele limpar o navegador, os dados são
  reiniciados. Não há servidor guardando informações.

Essa abordagem permite **testar e vender a ideia rapidamente**, com baixo custo, antes do
investimento na infraestrutura completa (descrita no roadmap).

---

## 12. Roadmap de produto

Evolução planejada após a validação do MVP:

| Fase | Tema | Entrega principal |
| --- | --- | --- |
| **2** | Conta real | Servidor, login seguro e recuperação de senha de verdade |
| **3** | WhatsApp real | Integração oficial com o WhatsApp para enviar e receber mensagens |
| **4** | Inteligência real | Respostas geradas por IA de verdade, com base de conhecimento do cliente |
| **5** | Múltiplos assistentes | Vários assistentes com personalidades e canais diferentes |
| **6** | Equipes | Vários usuários por conta, com papéis e permissões |
| **7** | Relatórios | Métricas de atendimento, tempo de resposta e satisfação |
| **8** | Integrações | Conexão com CRM, agenda, e-commerce e outras ferramentas |
| **9** | Monetização avançada | Cobrança automática, faturas, período de teste e upsell |

---

## 13. Perguntas frequentes (FAQ)

As mesmas perguntas aparecem na página inicial e na tela de Ajuda:

1. **O que é o FlowAssist?** Uma plataforma com automações e um assistente inteligente para
   atender no WhatsApp e ajudar no dia a dia, tudo em um painel.
2. **Preciso de conhecimento técnico?** Não. A configuração é feita com botões simples, em
   minutos.
3. **Como funciona a conexão com o WhatsApp?** O cliente habilita o canal em "Meu Agente",
   confirma a conexão e o número passa a responder.
4. **Posso usar só o chat interno?** Sim. Dá para ativar apenas o uso pessoal, sem WhatsApp.
5. **Quais planos existem?** Do gratuito ao Business, variando pelos limites. Troca a
   qualquer momento.
6. **Posso cancelar quando quiser?** Sim, sem fidelidade.
7. **Meus dados estão seguros?** Tratamos a segurança com seriedade; dados não são
   compartilhados sem autorização.
8. **Como falo com o suporte?** Pela tela de Ajuda ou pelo email suporte@flowassist.com,
   de segunda a sexta, das 9h às 18h.

---

## 14. Glossário de produto

| Termo (cliente) | Significado |
| --- | --- |
| **Assistente / Meu Agente** | O ajudante inteligente do cliente. Nunca chamamos de "IA" para o cliente |
| **WhatsApp** | Canal em que o assistente atende os clientes finais |
| **Uso Pessoal** | Modo em que o assistente ajuda o próprio dono, via chat interno |
| **Chat** | Tela de conversa com o assistente, parecida com o ChatGPT |
| **Dashboard / Painel** | Tela inicial após o login, com resumo e próximos passos |
| **Onboarding** | Checklist de boas-vindas que guia os primeiros passos |
| **Plano** | Nível de assinatura (Free, Starter, Pro, Business) |
| **Limites de uso** | Quantidade de mensagens/conversas incluídas no plano |
| **Conexão** | Status do WhatsApp: conectado, conectando, desconectado |
