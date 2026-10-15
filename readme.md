# Liga de futebol — estudo de caso SENAI/PE

Aplicação para administrar jogadores, clubes, transferências e partidas de uma
liga fictícia. O fluxo previsto é: cadastrar jogadores e clubes, comprar e vender
jogadores com contrato de fidelidade, consultar o histórico, escalar titulares,
jogar partidas e consultar a classificação.

**Etapa atual:** composição inicial do backend NestJS (C01) e base React/Vite
do frontend (C02), com navegação pelos quatro módulos. O Docker continua limitado ao PostgreSQL; o schema do
banco (C03) está versionado em migrations e as funcionalidades de negócio
permanecem pendentes.

## Stack e bibliotecas previstas

| Camada | Tecnologia | Finalidade |
| --- | --- | --- |
| Backend | NestJS + TypeScript, com Node.js 22 LTS | API HTTP e coordenação dos casos de uso |
| Frontend | React + Vite + TypeScript | Interface e consumo da API |
| Persistência | PostgreSQL 16 + Prisma | Dados, migrations e acesso transacional |
| Ambiente local | Docker Engine + Compose v2 | Execução do PostgreSQL |

### Dependências do backend

| Biblioteca | Versão | Uso |
| --- | --- | --- |
| `@nestjs/common` e `@nestjs/core` | 11.2.7 | Composição dos módulos e inicialização da aplicação |
| `@nestjs/platform-express` | 11.2.7 | Adaptador HTTP padrão do NestJS |
| `reflect-metadata` | 0.2.2 | Metadados dos decorators usados pelo NestJS |
| `rxjs` | 7.8.2 | Dependência de execução do NestJS |
| `typescript` | 5.9.3 | Compilação com tipagem estrita |
| `@types/node` | 22.x | Tipos do runtime Node.js adotado |

O `backend/package-lock.json` fixa as versões resolvidas. A instalação é feita
com `npm ci`. O arquivo `.env` é carregado pelo suporte nativo do Node.js, sem
biblioteca adicional de configuração. Prisma e as dependências do frontend
serão adicionados nas respectivas tarefas.

## Arquitetura planejada

Monólito modular em camadas, com um único backend e quatro módulos: **Jogadores,
Clubes, Mercado e Liga**. A interface React consumirá esse backend por HTTP.

| Camada do backend | Responsabilidade |
| --- | --- |
| `http/` | Controllers e DTOs: entrada e saída HTTP, chamando serviços de aplicação |
| `application/` | Serviços de aplicação: coordenação dos casos de uso |
| `domain/` | Regras e cálculos de negócio, com implementação única |
| `infrastructure/` | Repositórios, persistência com Prisma e transações encapsuladas |

Controllers não acessarão o banco nem calcularão regras. O domain será
independente de HTTP e de persistência. Regras usadas por mais de um módulo serão
reutilizadas a partir de seu responsável, incluindo valor de mercado e multa
por fidelidade (isso é inegociável, vide documentação proposta). O frontend exibirá os resultados 
e a ordem devolvidos pela API,
respeitando as exceções expressas no enunciado. O frontend JAMAIS fará recálculos, conforme solicitado.

Estrutura do projeto: a composição e as camadas do backend foram criadas. As
pastas de Prisma, testes e frontend abaixo representam as próximas etapas.

```text
.
├── readme.md
├── compose.yaml
├── .env.example
├── .gitignore
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/                 # Schema e migrations
│   ├── test/
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── config/app.config.ts
│       └── modules/
│           ├── players/        # Jogadores
│           ├── clubs/          # Clubes
│           ├── market/         # Mercado
│           └── league/         # Liga
│               # Cada módulo: http/, application/, domain/, infrastructure/
└── frontend/
    └── src/
        ├── modules/            # players/, clubs/, market/, league/
        └── shared/             # Cliente HTTP e componentes reutilizados
```

Cada módulo contém seu arquivo `*.module.ts` e as quatro pastas de camadas.
Enquanto não houver casos de uso, essas pastas contêm somente `.gitkeep` para
serem preservadas no Git. Nenhum controller, serviço ou endpoint foi criado por ora.
O `AppModule` registra `PlayersModule`, `ClubsModule`, `MarketModule` e
`LeagueModule` no mesmo processo.

## Docker básico: PostgreSQL

Pré-requisitos: Docker Engine ativo com suporte a contêineres Linux e Docker
Compose v2. A configuração foi preparada para PostgreSQL 16, usando a
[imagem oficial](https://hub.docker.com/_/postgres).

Execute na raiz do repositório:

```sh
cp .env.example .env
docker compose config --quiet
docker compose up -d --wait --wait-timeout 60 db
docker compose ps
```

No PowerShell, substitua o primeiro comando por:

```powershell
Copy-Item .env.example .env
```

O PostgreSQL será acessível em `127.0.0.1:5432`, com os valores locais de exemplo
do `.env`. O volume `postgres_data` preserva os dados ao parar o contêiner.
O healthcheck verifica a disponibilidade do servidor com `pg_isready`.

Para parar o banco preservando os dados:

```sh
docker compose down
```

Para recriar o banco local vazio, **apagando os dados do volume deste projeto**:

```sh
docker compose down --volumes
docker compose up -d --wait --wait-timeout 60 db
```

O Compose inicializa só o servidor e o banco vazio. As sete tabelas obrigatórias
são criadas pelas migrations do Prisma, a partir da pasta `backend/`, com o banco
ativo e o `backend/.env` criado (`DATABASE_URL`):

```sh
cd backend
npm ci
npm run db:migrate
```

Para **recriar o schema do zero** (apaga as tabelas e os dados, sem seed
automático), na pasta `backend/`:

```sh
npm run db:reset
```

Alternativa, recriando também o volume do PostgreSQL: `docker compose down --volumes`,
`docker compose up -d --wait --wait-timeout 60 db` e `npm run db:migrate`.
O banco criado começa vazio, sem jogadores, clubes, transações nem partidas; não
há dados de exemplo.

O modelo está em `backend/prisma/schema.prisma` e o SQL em
`backend/prisma/migrations/`. Os modelos têm nomes em inglês e são mapeados
para os nomes oficiais (`jogadores`, `clubes`, `contratos`, `transacoes`,
`escalacoes`, `partidas` e `duelos_partida`). Moedas são `DECIMAL`, e não há
colunas de valor de mercado, overall, valor do elenco, patrimônio, dias
restantes, percentual de multa, pontos ou posição. Na migration, além do que o
Prisma gera:

- índice único em `lower(nome)` de `clubes`: "Águias FC" e "águias fc" colidem,
  "Águias FC" e "Aguias FC" não (a sigla tem `UNIQUE` próprio);
- `escalacoes` com chave primária composta (`clube_id`, `jogador_id`) e
  `jogador_id` único;
- `CHECK` para listas de valores (posição, condição, tipo, situação, formação),
  faixas dos atributos, da agilidade e da idade, gols de 0 a 3 e duelos de 1 a 6.

Conferência das restrições no PostgreSQL (`docker compose exec db psql -U liga -d liga`):

```sql
INSERT INTO clubes (nome, sigla) VALUES ('Águias FC', 'AGU');
INSERT INTO clubes (nome, sigla) VALUES ('águias fc', 'AGX'); -- recusado
INSERT INTO clubes (nome, sigla) VALUES ('Aguias FC', 'AGA'); -- aceito
```

## Variáveis de ambiente

| Variável | Valor de exemplo | Finalidade |
| --- | --- | --- |
| `POSTGRES_DB` | `liga` | Nome do banco local |
| `POSTGRES_USER` | `liga` | Usuário local |
| `POSTGRES_PASSWORD` | `liga_dev_local` | Senha fictícia do ambiente local |
| `POSTGRES_PORT` | `5432` | Porta publicada somente em `127.0.0.1` |

O `.env.example` é versionado; o `.env` é ignorado pelo Git. Não usei credenciais
reais.

Configuração HTTP do backend, em `backend/.env.example`:

| Variável | Valor de exemplo | Finalidade |
| --- | --- | --- |
| `PORT` | `3000` | Porta HTTP, inteiro entre 1 e 65535 |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Única origem liberada por CORS |
| `DATABASE_URL` | `postgresql://liga:liga_dev_local@localhost:5432/liga?schema=public` | Conexão com o PostgreSQL, usada pela aplicação e pelo Prisma; sem valor padrão |

A origem deve usar HTTP ou HTTPS, sem caminho, barra final ou curinga. Os valores
de exemplo também são os padrões quando as variáveis não estão definidas.
Variáveis já presentes no ambiente têm precedência sobre o `.env`.

## Execução da aplicação

### Backend

Pré-requisitos: Node.js **22 LTS, a partir de 22.12.0**, e npm **10 ou superior**.
O código usa CommonJS, decorators compatíveis com NestJS e TypeScript estrito.

No Ubuntu 24.04, a partir da raiz do repositório:

```sh
cd backend
cp .env.example .env
npm ci
npm run db:migrate
npm run build
npm start
```

Com o PostgreSQL ativo (seção Docker básico) antes do `db:migrate`.

No PowerShell, substitua `cp .env.example .env` por
`Copy-Item .env.example .env`. Se a execução de `npm.ps1` estiver bloqueada,
utilize `npm.cmd` nos comandos npm.

**Origem configurada da API:** `http://localhost:3000`, sem o prefixo.
**Prefixo HTTP:** `/api/v1`. Ainda não existem rotas funcionais; acessar uma
rota neste estágio retorna 404. O bootstrap configura CORS restrito e os sinais
de encerramento do NestJS. Porta ou origem inválidas impedem a inicialização,
com uma mensagem de configuração.

O backend conecta ao PostgreSQL ao iniciar e encerra com mensagem de configuração
se `DATABASE_URL` estiver ausente, inválida ou o banco inativo. `npm run build`
também gera o cliente do Prisma.

### Frontend

A inicialização do React/Vite e seus comandos de instalação e execução ficam
para o C02.

O Compose atual sobe apenas o banco; não atende ao diferencial B5 de subir
interface, API e banco com um único comando.

## Rastreabilidade inicial

Todos os itens funcionais abaixo permanecem pendentes. Este quadro registra os
responsáveis previstos e os critérios relacionados, sem declarar conformidade.
V1–V9 deverão ser aplicadas em todos os endpoints pertinentes.
Atualizarei os requisitos conforme vou avançando e realizando-as.


| Requisitos | Responsável principal | Critérios do barema relacionados |
| --- | --- | --- |
| RN01 | Datas nos módulos pertinentes | B12; F06 e apresentação de datas |
| RN02–RN06 | Jogadores | B05, B06, B13; F01, F04, F06, F07 |
| RN07–RN09 | Jogadores | B03, B04, B07, B08, B11, B16, B17, B18; F01–F04 |
| RN10–RN11 | Clubes | B09, B13, B17; F05, F07 |
| RN12–RN14 | Mercado | B10, B11, B13, B16; F06 |
| RN15–RN16 | Mercado; efeitos na escalação em Liga | B14–B16; F07, F08 |
| RN17–RN18 | Mercado | B18, B19; F09–F11 |
| RN19 | Liga; colaboração de Jogadores e Mercado | B20; F12 |
| RN20–RN21 | Liga | B21, B22; F13, F14 |
| V1–V6 | Validação de entrada dos módulos | B01, B04 e validações de cada operação |
| V7 | Campos controlados ou estranhos ignorados | B03 |
| V8–V9 | Recursos inexistentes e códigos de recusa | B02 e recusas dos demais itens |


## Decisões e premissas

- Docker limitado ao PostgreSQL nesta etapa, sem Dockerfiles da aplicação.
- Arquitetura modular em camadas, sem microsserviços, event sourcing, CQRS ou
  autenticação, conforme a aprovação inicial.
- Identificadores de código em inglês; nomes HTTP e do banco seguirão o enunciado.
- Nenhum contrato HTTP ou cálculo foi implementado; o modelo de dados do C03
  é o do enunciado, sem tabelas ou colunas extras.
- A imagem fixa a versão principal 16; atualizações de patch seguem a tag oficial.
- No C01, a configuração HTTP é uma função de inicialização. Não foi criada uma
  camada de serviços genéricos ou uma biblioteca extra para carregar `.env`.
- Serviços, controllers, regras e repositórios serão introduzidos junto com seus
  casos de uso; o código atual apenas registra os módulos e compõe a aplicação.
- No C03, listas de valores são `VARCHAR` com `CHECK`, e não enums do Prisma,
  para manter os tipos oficiais. A unicidade do nome do clube usa índice em
  `lower(nome)` na migration, sem coluna extra preenchida pela aplicação.
- Prisma e transações ficam em `src/infrastructure/database/`
  (`PrismaService` e `TransactionRunner`); controllers e domain não os importam.

## Funcionalidades não implementadas

RN01–RN21, V1–V9, fluxos B01–B22 e F01–F14; inicialização do projeto React; integração HTTP; 
compra, venda, históricos, escalação, partidas e classificação. A arquitetura descrita
é uma proposta de organização para a implementação já aprovada por mim.

## Uso de inteligência artificial

Codex (OpenAI), com um único agente, auxiliou na leitura dos documentos, na
elaboração de `compose.yaml`, `.env.example`, `.gitignore` e deste `readme.md`,
para organizar o ambiente local e documentar a arquitetura aprovada. Nesta
etapa, foram adotados apenas Docker básico  e documentação; código funcional,
Dockerfiles da aplicação e abstrações adicionais ficaram fora do escopo.
O conteúdo permanece sujeito à revisão e aprovação técnica do candidato.
