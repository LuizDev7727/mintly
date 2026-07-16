# Mintly

Mintly é uma plataforma SaaS para criadores de conteúdo agendarem, publicarem e acompanharem posts em múltiplas redes sociais a partir de um único lugar — e gerarem automaticamente clipes de "melhores momentos" prontos para Reels/Shorts/TikTok a partir de vídeos longos, usando um pipeline de IA.

## Principais funcionalidades

### Criação de posts para múltiplas redes sociais
- Organização do conteúdo por organizações, canais e pastas.
- Integração via OAuth com YouTube e TikTok, permitindo publicar o mesmo post em múltiplas plataformas a partir de um único canal.
- Upload de vídeo, agendamento e acompanhamento do status de cada publicação.

### Geração de melhores momentos
A partir de um vídeo enviado, um pipeline automatizado:
1. transcreve o áudio do vídeo;
2. usa IA para identificar os trechos com maior potencial ("melhores momentos");
3. envia cada trecho para um serviço com GPU que roda detecção de locutor ativo (active speaker detection) para identificar quem está falando, recorta um vídeo vertical seguindo o rosto (ou com fundo desfocado), queima as legendas automaticamente e disponibiliza o clipe pronto para publicação.

## Tecnologias utilizadas

### Backend (`api/`)
- **Node.js + TypeScript** — runtime e tipagem estática da API.
- **Fastify** — framework HTTP usado para expor as rotas da API.
- **Drizzle ORM + PostgreSQL** — ORM type-safe para acesso ao banco relacional.
- **better-auth** — autenticação (e-mail/senha, login social com Google, organizações/multi-tenancy).
- **Trigger.dev** — orquestração de jobs em background (transcrição, identificação de melhores momentos, publicação assíncrona).
- **Cloudflare R2** (via AWS SDK) — armazenamento de objetos (vídeos, thumbnails, clipes gerados) compatível com S3.
- **Google Gemini** (`@google/genai`) — modelo de IA usado para identificar melhores momentos e enriquecer metadados dos posts.
- **Replicate** — inferência de modelos de IA (ex: transcrição de áudio).
- **googleapis** — integração com a API do YouTube para publicação de vídeos.
- **Zod** — validação de schemas e variáveis de ambiente.
- **Vitest + Supertest** — testes automatizados da API.

### Frontend (`web/`)
- **React 19 + TypeScript** — biblioteca de UI e tipagem estática.
- **Vite** — build tool e dev server.
- **TanStack Router** — roteamento baseado em arquivos, com rotas type-safe.
- **TanStack Query** — cache e sincronização de dados assíncronos com a API.
- **Tailwind CSS v4** — estilização utilitária.
- **Radix UI / shadcn** — componentes acessíveis e headless usados como base do design system.
- **React Hook Form + Zod** — formulários com validação de schema.
- **Storybook** — catálogo e documentação visual dos componentes.
- **Playwright** — testes end-to-end.

### Processamento de vídeo e IA (`py/`)
- **Python + Modal** — funções serverless com GPU sob demanda para processar cada clipe.
- **LR-ASD (Active Speaker Detection)** — modelo que identifica quem está falando em cada frame, usado para decidir o enquadramento do corte vertical.
- **OpenCV / ffmpeg / ffmpegcv** — corte, recorte e composição dos vídeos verticais.
- **pysubs2** — geração e queima de legendas nos clipes.
- **boto3** — upload dos clipes processados para o R2.

### Infraestrutura (`infra/`)
- **Pulumi (TypeScript)** — infraestrutura como código.
- **AWS (ECS/Fargate, ECR)** — hospedagem containerizada da API.
