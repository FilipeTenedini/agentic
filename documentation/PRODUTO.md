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
10. [Linguagem e comunicação](#10-linguagem-e-comunicação)
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

O Assistente tem **dois canais de atuação**, que o cliente liga de forma independente:

1. **WhatsApp** — o assistente responde os clientes finais automaticamente.
2. **Uso Pessoal** — o assistente ajuda o próprio dono dentro do painel, via chat interno.

O cliente pode usar **um, outro, os dois ou nenhum** — total flexibilidade.

### O Assistente é totalmente personalizável

A tela **"Meu Agente"** deixou de ser apenas um interruptor de liga/desliga: ela é agora o
**centro de configuração** do assistente. Nela o cliente define:

- **Personalidade** — como o assistente se comporta e se comunica (formalidade, criatividade,
  estilo de escrita, uso de emojis, tamanho das respostas, etc.).
- **Instruções do Assistente** — um campo livre onde o cliente escreve as regras do negócio,
  o contexto da empresa e o que o assistente deve (ou não deve) fazer.
- **Base de Conhecimento** — materiais (PDFs, planilhas, documentos, imagens) que o
  assistente consulta para responder com mais contexto.
- **Configuração por canal** — cada canal (WhatsApp e Uso Pessoal) pode **compartilhar** a
  mesma personalidade e base de conhecimento **ou** ter as suas próprias, além de instruções
  específicas.

> Pense em WhatsApp e Uso Pessoal como **dois assistentes** que partem de uma mesma base, mas
> que você pode ajustar separadamente para cada situação.

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
| **Dashboard** | Visão geral: boas-vindas, status do agente, saúde da base, conversas e pendências |
| **Meu Agente** | Centro de configuração do assistente: Visão Geral, Personalidade, Base de Conhecimento, Instruções e Canais |
| **Chat** | Conversar com o assistente (aparece só quando o Uso Pessoal está ligado) |
| **Configurações** | Preferências gerais: tema, notificações, idioma |
| **Perfil** | Dados pessoais: nome, email e foto |
| **Assinatura** | Plano atual, data de renovação e limites de uso |
| **Ajuda** | Perguntas frequentes e contato com o suporte |

### Seções de "Meu Agente"

A tela "Meu Agente" é organizada em abas:

| Aba | Para que serve |
| --- | --- |
| **Visão geral** | Resumo do agente: nome, status, canais ativos e configurações pendentes |
| **Personalidade** | Define o comportamento e o estilo de comunicação do assistente |
| **Base de Conhecimento** | Envio e gestão dos materiais que o assistente consulta |
| **Instruções** | Campo livre com as regras e o contexto do negócio |
| **Canais** | Configuração específica do WhatsApp e do Uso Pessoal (herança ou personalização) |

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

1. Em **Meu Agente**, na aba **Canais**, o cliente liga o botão de **Uso Pessoal**.
2. Um novo item, **"Chat"**, aparece no menu lateral.
3. No Chat, o cliente vê conversas anteriores e pode **iniciar uma nova**.
4. Ele digita uma mensagem, o assistente mostra **"digitando..."** e responde.

### 7.5 Personalizando o comportamento do assistente

1. O cliente abre **Meu Agente** e vai à aba **Personalidade**.
2. Pode começar por um **modelo pronto** (Atendimento, Vendas, Suporte técnico, Corporativo)
   ou ajustar manualmente os controles: espontaneidade, criatividade, formalidade,
   objetividade, nível técnico, estilo de escrita, uso de emojis e tamanho médio das respostas.
3. Quem prefere termos técnicos pode ligar o **"modo avançado"**.
4. As mudanças são **salvas automaticamente**.

### 7.6 Ensinando o assistente (Base de Conhecimento)

1. Na aba **Base de Conhecimento**, o cliente **arrasta arquivos** ou clica para selecioná-los
   (PDF, DOCX, TXT, CSV, XLSX e imagens).
2. Cada arquivo passa por estados visuais: **enviando → processando → pronto** (ou **erro**,
   com opção de tentar novamente).
3. O cliente acompanha um resumo da saúde da base (prontos, em processo, com erro).

> Nesta fase, **nada é realmente processado** — é uma demonstração que prepara a futura
> "memória" do assistente (ver seção 11 e roadmap).

### 7.7 Configurando cada canal de forma independente

1. Na aba **Canais**, cada canal (WhatsApp e Uso Pessoal) tem seus próprios ajustes.
2. O cliente decide se o canal **usa a personalidade base** ou define **uma personalidade
   própria**.
3. Decide também se o canal **usa a base de conhecimento compartilhada**.
4. E pode escrever **instruções específicas** só para aquele canal.

### 7.8 Cuidando da conta

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

A "casa" do cliente depois do login. Reflete o conceito de produto baseado em agentes. Mostra:

- **Saudação personalizada** ("Bom dia, Maria") que muda conforme o horário.
- **Checklist de ativação** (some quando concluído).
- **Cartões de resumo:** status do WhatsApp, conversas no chat, **arquivos enviados** e
  mensagens respondidas.
- **Status do agente:** se está ativo/pausado e quais canais estão ligados.
- **Saúde da base de conhecimento:** quantos arquivos estão prontos, em processamento ou com
  erro.
- **Últimas conversas:** atalho para as conversas mais recentes do chat.
- **Configurações pendentes:** lista do que ainda falta configurar (ex.: ativar um canal,
  escrever instruções, adicionar arquivos), com atalho direto para resolver.
- **Atividade recente:** lista das últimas ações relevantes.

### 8.3 Meu Agente (funcionalidade principal)

É o **centro de configuração** do assistente, organizado em abas.

**Visão geral**
- Nome, descrição e **status** do agente (Em configuração / Ativo / Pausado).
- Resumo rápido: canais ativos e arquivos prontos na base de conhecimento.
- **Configurações pendentes** com botão "Resolver" que leva à aba certa.

**Personalidade**
- **Modelos prontos** (Atendimento, Vendas, Suporte técnico, Corporativo) aplicáveis com um
  clique.
- **Controles de comportamento** (deslizadores de 0 a 100): espontaneidade, criatividade,
  formalidade, objetividade e nível técnico.
- **Escolhas de estilo:** estilo de escrita, uso de emojis e tamanho médio das respostas.
- **Modo avançado** que revela os nomes técnicos dos controles (ex.: "Temperatura").

**Instruções do Assistente**
- Campo de texto longo para o cliente definir, em linguagem natural: como responder, como não
  responder, regras de negócio e contexto da empresa.
- Salvo automaticamente.

**Base de Conhecimento**
- Área de **upload** (arrastar/soltar ou selecionar) para PDF, DOCX, TXT, CSV, XLSX e imagens.
- Lista de arquivos com **estados visuais**: enviando, processando, pronto ou erro (com
  "tentar novamente").
- Resumo de saúde: total, prontos, em processo e com erro.

**Canais**
- Para cada canal (WhatsApp e Uso Pessoal):
  - Liga/desliga (o WhatsApp mostra número conectado, status e "Reconectar"; o Uso Pessoal
    libera o Chat no menu).
  - **"Usar a personalidade base"** — desligar revela uma personalidade própria do canal.
  - **"Usar a base de conhecimento compartilhada"**.
  - **Instruções específicas** daquele canal.

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

### 8.9 Regras de negócio do assistente

- **Personalidade base é o padrão.** Por padrão, todos os canais herdam a mesma personalidade
  e a mesma base de conhecimento. O cliente pode quebrar essa herança por canal.
- **Herança por canal.** Cada canal pode, de forma independente: usar ou não a personalidade
  base; usar ou não a base de conhecimento compartilhada; ter instruções próprias.
- **Pronto para responder bem.** Um canal "responde melhor" quando tem instruções definidas e
  pelo menos um arquivo pronto na base — o Dashboard sinaliza o que falta.
- **Base de conhecimento compartilhada.** A base é única para o agente; um canal apenas
  escolhe usá-la ou não. (No futuro, isso definirá o que cada canal "enxerga".)
- **Salvamento automático.** As configurações de personalidade, instruções e canais são salvas
  automaticamente e persistem no navegador.

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

## 10. Linguagem e comunicação

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
- **A Personalidade e as Instruções não afetam respostas reais.** Os controles são salvos e
  exibidos, mas como não há IA, não mudam o comportamento de um modelo de verdade.
- **A Base de Conhecimento não é processada.** O upload, os estados (enviando, processando,
  pronto, erro) e a lista de arquivos são **apenas visuais**. Não há leitura de arquivo,
  vetorização, indexação ou busca semântica (RAG). A arquitetura, porém, já está preparada
  para isso.
- **A configuração por canal é estrutural.** A herança e as instruções por canal são salvas,
  mas, sem IA, ainda não alteram respostas reais.
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
| **4** | Inteligência real | Respostas por IA de verdade, usando a **Personalidade**, as **Instruções** e a **Base de Conhecimento** já configuradas: leitura dos arquivos, vetorização, busca semântica (RAG) e contexto personalizado por canal |
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
| **Canal** | Cada meio em que o assistente atua (WhatsApp ou Uso Pessoal), com configuração própria |
| **Personalidade** | Conjunto de ajustes de comportamento e estilo (tom, formalidade, emojis, etc.) |
| **Instruções do Assistente** | Texto livre com as regras e o contexto que o assistente deve seguir |
| **Base de Conhecimento** | Materiais (PDFs, planilhas, documentos, imagens) que o assistente consulta |
| **Herança de configuração** | Quando um canal usa a personalidade/base "base" em vez de uma própria |
| **Chat** | Tela de conversa com o assistente, parecida com o ChatGPT |
| **Dashboard / Painel** | Tela inicial após o login, com resumo e próximos passos |
| **Onboarding** | Checklist de boas-vindas que guia os primeiros passos |
| **Plano** | Nível de assinatura (Free, Starter, Pro, Business) |
| **Limites de uso** | Quantidade de mensagens/conversas incluídas no plano |
| **Conexão** | Status do WhatsApp: conectado, conectando, desconectado |
