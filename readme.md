# Liga de futebol (PASSE) — estudo de caso SENAI/PE

Aplicação para administrar jogadores, clubes, transferências e partidas de uma
liga fictícia. O fluxo previsto é: cadastrar jogadores e clubes, comprar e vender
jogadores com contrato de fidelidade, consultar o histórico, escalar titulares,
jogar partidas e consultar a classificação.

**Etapa atual:** backend com todos os endpoints do enunciado; frontend com as
telas de Jogadores e de Clubes (lista, criação e página do clube). O Docker
Compose sobe só o banco ou a aplicação inteira. O que falta está em
"Funcionalidades não implementadas".

## Stack e bibliotecas previstas

| Camada | Tecnologia | Finalidade |
| --- | --- | --- |
| Backend | NestJS + TypeScript, com Node.js 22 LTS | API HTTP e coordenação dos casos de uso |
| Frontend | React + Vite + TypeScript | Interface e consumo da API |
| Persistência | PostgreSQL 16 + Prisma | Dados, migrations e acesso transacional |
| Ambiente local | Docker Engine + Compose v2 | PostgreSQL e, no Compose completo, a API e a interface |

### Dependências do backend

| Biblioteca | Versão | Uso |
| --- | --- | --- |
| `@nestjs/common` e `@nestjs/core` | 11.2.7 | Composição dos módulos e inicialização da aplicação |
| `@nestjs/platform-express` | 11.2.7 | Adaptador HTTP padrão do NestJS |
| `reflect-metadata` | 0.2.2 | Metadados dos decorators usados pelo NestJS |
| `rxjs` | 7.8.2 | Dependência de execução do NestJS |
| `@prisma/client` | 6.19.3 | Acesso ao PostgreSQL e transações do banco |
| `prisma` | 6.19.3 | Migrations e geração do cliente do Prisma |
| `typescript` | 5.9.3 | Compilação com tipagem estrita |
| `@types/node` | 22.x | Tipos do runtime Node.js adotado |
| `@types/express` | 5.0.3 | Tipos da resposta do Express nos controllers (`Location` e CSV) e no tratamento central de erros |
| `vitest` | 4.1.11 | Testes automatizados dos cálculos de domínio, sem modo de observação |

O `backend/package-lock.json` fixa as versões resolvidas. A instalação é feita
com `npm ci`. O campo `allowScripts` do `package.json` aprova os scripts de
instalação do Prisma, que baixam os motores usados pelas migrations e pelo
cliente; o npm 10 executa esses scripts por padrão, e o npm 12 exige essa
aprovação. O arquivo `.env` é carregado pelo suporte nativo do Node.js, sem
biblioteca adicional de configuração.

### Dependências do frontend

| Biblioteca | Versão | Uso |
| --- | --- | --- |
| `react` e `react-dom` | 19.3.0 | Componentes e renderização da interface |
| `vite` | 7.3.7 | Servidor de desenvolvimento e build da interface |
| `@vitejs/plugin-react` | 5.x | Suporte a React e JSX no Vite |
| `typescript` | 5.9.3 | Tipagem estrita da interface |
| `@types/react`, `@types/react-dom` e `@types/node` | 19.x e 22.x | Tipos do React e do Node.js (configuração do Vite) |
| `eslint`, `@eslint/js` e `typescript-eslint` | 9.x e 8.x | Lint do código TypeScript |
| `eslint-plugin-react-hooks` e `eslint-plugin-react-refresh` | 5.x e 0.4.x | Regras dos hooks do React e do recarregamento do Vite |
| `globals` | 16.x | Variáveis globais do navegador na configuração do ESLint |

O `frontend/package-lock.json` fixa as versões resolvidas; a instalação é feita
com `npm ci`. Não há biblioteca de rotas, de estado nem de formulários: o estado
usa `useState`/`useEffect` e Context API (avisos), e as requisições usam `fetch`.

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

Estrutura do projeto:

```text
.
├── readme.md
├── compose.yaml
├── .env.example
├── .gitignore
├── backend/
│   ├── Dockerfile
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
    ├── Dockerfile
    ├── package.json
    ├── package-lock.json
    ├── .env.example
    └── src/
        ├── modules/            # players/, clubs/, market/, league/
        │   # Cada módulo: api/ (chamadas), hooks/ (dados), components/ e a página
        └── shared/
            ├── api/            # Cliente HTTP e ApiError
            ├── components/     # Tabela, campo de formulário, modal, avisos e estados de lista
            ├── format/         # Moedas, inteiros e datas (só formatação)
            ├── hooks/          # Ação única por clique e avisos
            └── validation/     # Normalização (V4) e tamanho de textos
```

Cada módulo do backend contém seu arquivo `*.module.ts` e as quatro pastas de
camadas. Cada endpoint tem um caso de uso próprio em `application/`
(`*.use-case.ts`), que depende de uma porta de repositório, implementada com
Prisma em `infrastructure/`.
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

Configuração do frontend, em `frontend/.env.example`:

| Variável | Valor de exemplo | Finalidade |
| --- | --- | --- |
| `VITE_API_ORIGIN` | `http://localhost:3000` | Origem da API, sem `/api/v1`; lida na compilação do Vite |

Sem a variável, o frontend usa `http://localhost:3000`.

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
**Prefixo HTTP:** `/api/v1`. Rotas disponíveis: `GET /players`, `POST /players`,
`GET /players/{id}`, `PUT /players/{id}`, `PATCH /players/{id}/condition` e
`DELETE /players/{id}`, `POST /players/{id}/buy`, `POST /players/{id}/sell`,
`GET /clubs`, `POST /clubs`, `GET /clubs/{id}`, `GET /clubs/{id}/transactions`,
`GET /clubs/{id}/transactions/export`, `PUT /clubs/{id}/lineup`,
`GET /clubs/{id}/lineup`, `POST /matches`, `GET /matches`, `GET /matches/{id}` e
`GET /standings`; as demais respondem 404. O bootstrap configura CORS restrito e os sinais
de encerramento do NestJS. Porta ou origem inválidas impedem a inicialização,
com uma mensagem de configuração.

O backend conecta ao PostgreSQL ao iniciar e encerra com mensagem de configuração
se `DATABASE_URL` estiver ausente, inválida ou o banco inativo. `npm run build`
também gera o cliente do Prisma.

### Testes do backend

Na pasta `backend/`, depois do `npm ci` (não precisa do banco):

```sh
npm test
```

O comando termina sozinho e cobre o valor de mercado (RN02–RN05), o overall e
o valor base (RN06), o arredondamento de moedas, a ordem alfabética das
Premissas, a busca sem acentos e a paginação (RN07), o formato do nome e da
sigla do clube, o caixa inicial, o patrimônio e a ordem dos clubes e do elenco
(RN10 e RN11), a taxa e o limite de 50% do caixa (RN13), o fim da fidelidade,
os dias restantes, o percentual e o valor da multa (RN15) e o lucro, a comissão
e o crédito da venda (RN16), o histórico de transações e seu resumo (RN17) e o
arquivo CSV da exportação (RN18), as formações e a escalação (RN19) e a partida,
com o exemplo completo de Águias FC × Delta FC (RN20), e a classificação, com os
exemplos de 6 clubes e de 3 clubes (RN21), com
as tabelas de exemplo do enunciado. Os testes ficam em `backend/test/`.

### Frontend

Pré-requisitos: Node.js **22 LTS, a partir de 22.12.0**, e npm **10 ou superior**.
Com o backend em execução, em outro terminal, a partir da raiz do repositório:

```sh
cd frontend
cp .env.example .env
npm ci
npm run dev
```

**URL do frontend:** `http://localhost:5173`. No PowerShell, substitua
`cp .env.example .env` por `Copy-Item .env.example .env`.

Para verificar o código com o ESLint, na pasta `frontend/`:

```sh
npm run lint
```

## Docker Compose completo: interface, API e banco

Caminho alternativo, sem Node.js na máquina: um único comando sobe o banco, a
API e a interface. Pré-requisitos: Docker Engine com Docker Compose v2. Na raiz
do repositório:

```sh
cp .env.example .env
docker compose up -d --build --wait --wait-timeout 600
```

No PowerShell, substitua o primeiro comando por `Copy-Item .env.example .env`.

- Interface: `http://localhost:8080`
- Origem da API: `http://localhost:3000` (prefixo `/api/v1`)

O `--wait` termina quando o banco e a API respondem. A API aplica as migrations
ao iniciar (`prisma migrate deploy`) e só depois aceita requisições. As imagens
são construídas a partir deste repositório, sobre as imagens públicas
`node:22-bookworm-slim`, `nginx:1.27-alpine` e `postgres:16-alpine`:

| Serviço | Origem | O que faz |
| --- | --- | --- |
| `db` | `postgres:16-alpine` | PostgreSQL, com o volume `postgres_data` |
| `backend` | `backend/Dockerfile` | Instala com `npm ci`, compila e inicia a API depois das migrations |
| `frontend` | `frontend/Dockerfile` | Compila a interface com `VITE_API_ORIGIN=http://localhost:3000` e a serve pelo nginx |

No Compose completo, `FRONTEND_ORIGIN` é `http://localhost:8080` e
`DATABASE_URL` aponta para o serviço `db`, montada com as variáveis do `.env` da
raiz. Use `localhost`, e não `127.0.0.1`, no navegador: o CORS libera só a
origem `http://localhost:8080`.

Para parar, preservando os dados: `docker compose down`. Para recriar o banco
do zero, **apagando os dados do volume deste projeto**:

```sh
docker compose down --volumes
docker compose up -d --build --wait --wait-timeout 600
```

O Compose completo e a execução com Node.js usam as mesmas portas 3000 e 5432;
use um caminho de cada vez.

## Rastreabilidade inicial

Este quadro registra os responsáveis e os critérios relacionados, sem declarar
conformidade; o que falta está em "Funcionalidades não implementadas".
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

- O Compose sobe o banco sozinho (`docker compose up -d db`) ou, sem indicar o
  serviço, o banco, a API e a interface. Na imagem da interface, a origem da API
  é definida na compilação, porque o Vite a grava no código gerado; o nginx só
  serve os arquivos estáticos.
- No Compose completo, as migrations rodam ao iniciar a API, para que o banco
  recriado pelo `down --volumes` já suba com as tabelas.
- Arquitetura modular em camadas, sem microsserviços, event sourcing, CQRS ou
  autenticação, conforme a aprovação inicial.
- Identificadores de código em inglês; nomes HTTP e do banco seguirão o enunciado.
- O modelo de dados do C03 é o do enunciado, sem tabelas ou colunas extras.
- A imagem fixa a versão principal 16; atualizações de patch seguem a tag oficial.
- No C01, a configuração HTTP é uma função de inicialização. Não foi criada uma
  camada de serviços genéricos ou uma biblioteca extra para carregar `.env`.
- Serviços, controllers, regras e repositórios são introduzidos junto com seus
  casos de uso.
- No C03, listas de valores são `VARCHAR` com `CHECK`, e não enums do Prisma,
  para manter os tipos oficiais. A unicidade do nome do clube usa índice em
  `lower(nome)` na migration, sem coluna extra preenchida pela aplicação.
- Cálculos em moedas são feitos em centavos inteiros (percentuais em centésimos
  de ponto), sem erro de ponto flutuante, e arredondados uma única vez no final
  (`src/shared/domain/money.ts`). Valor de mercado, overall e valor base têm uma
  só implementação, em `src/modules/players/domain/`, reutilizada pelos demais módulos.
- Prisma e transações ficam em `src/infrastructure/database/`
  (`PrismaService` e `TransactionRunner`); controllers e domain não os importam.
- Jogadores: a validação do corpo fica em pipes (`http/player-body.pipes.ts`),
  com recusa `400` antes de consultar o banco; inexistente ou excluído (`404`) e
  regras de negócio (`409`) são conferidos depois, nos casos de uso. As regras
  que cruzam campos (agilidade com 35 anos ou mais, soma dos atributos e
  potencial) também são `400`, por estarem em "Limites de cada campo".
- No `PUT`, a agilidade máxima de 85 com 35 anos ou mais vale para a agilidade e
  a idade enviadas; o potencial não é conferido de novo, porque não muda.
- No nome do jogador, conta como palavra o trecho entre espaços com pelo menos
  uma letra (V4); outros caracteres, como hífen e apóstrofo, são aceitos.
- Na alteração para a condição atual, a resposta é `200` e nada é gravado,
  inclusive `atualizado_em`.
- Em `GET /players`, o banco aplica os filtros que não dependem de cálculo
  (posição, condição, livres ou com clube, clube e idade); a busca, a faixa e a
  ordenação pelo valor de mercado e a paginação são feitas na aplicação, com o
  valor calculado pelo domínio. Assim o valor de mercado tem uma única
  implementação, sem fórmula repetida em SQL, e a busca e a ordem alfabética
  seguem exatamente a V4 e as Premissas (NFD sem marcas, comparação por ponto
  de código), sem depender de collation ou extensões do PostgreSQL. Com o limite
  de 12 jogadores por elenco e 20 clubes, o volume de dados é pequeno.
- No `sort`, o campo de cada opção é o nome antes do sufixo (`value_asc` e
  `value_desc` são `value`); repetir o campo, passar de dois critérios ou
  incluir espaços é recusado com `400`.
- Parâmetro repetido (como `position=MEI&position=ATA`) é recusado com `400`,
  como o parâmetro vazio.
- A existência do clube do filtro `club_id` é conferida pelo `ClubRepository`,
  fornecido pelo `ClubPersistenceModule` (`clubs/infrastructure/`). Jogadores e
  Clubes importam esse módulo, e Clubes importa Jogadores e Mercado; assim não
  há dependência circular entre os módulos.
- Clubes: a conferência do nome repetido usa a mesma comparação do índice único
  do banco, `lower(nome)`, para que a API e o banco nunca divirjam. O banco
  criado pelo `compose.yaml` usa o locale `en_US.utf8`, em que o `lower()` trata
  letras acentuadas ("ÁGUIAS FC" colide com "águias fc").
- A sigla é lida exatamente como enviada, sem a normalização de espaços da V4,
  que vale só para nomes e para o `search`: `" AGU"` é recusada com `400`.
- Como a sigla tem 3 letras do nome e o nome tem pelo menos 2 palavras, um nome
  de 3 caracteres nunca tem sigla válida e é sempre recusado com `400`.
- O limite de 20 clubes é conferido e o clube é gravado numa única transação,
  com a tabela `clubes` travada contra inserções simultâneas (`LOCK TABLE ... IN
  SHARE ROW EXCLUSIVE MODE`); assim, pedidos simultâneos não passam do limite.
  Nome ou sigla gravados por outro pedido entre a conferência e a gravação são
  recusados com `409` pela unicidade do banco.
- Toda transação interativa do Prisma espera até 5 s por uma conexão e dura até
  8 s (`src/infrastructure/database/prisma.service.ts`), abaixo do limite de 10 s
  por requisição; o padrão do Prisma (2 s de espera) gerava `500` em pedidos
  simultâneos.
- `POST /clubs` devolve `squad_value` e `net_worth` calculados pela mesma função
  da RN11 (`summarizeClub`), com o elenco vazio do clube recém-criado.
- `GET /clubs` e `GET /clubs/{id}` usam a mesma `summarizeClub`; o valor de
  mercado vem do domínio de Jogadores, e os dias restantes e o percentual de
  multa, do domínio de Mercado (`market/domain/loyalty.ts`), que também servirá
  à venda. Nada disso é gravado.
- Na consulta do clube, o instante é lido uma única vez e vale para os dias
  restantes de todos os contratos do elenco.
- Dias restantes são contados em períodos de 24 horas a partir do instante da
  consulta (o horário de Brasília não tem horário de verão).
- Regras do Mercado em `src/modules/market/domain/`, uma implementação cada:
  `purchase.ts` (taxa e limite de 50% do caixa, RN13), `loyalty.ts` (fim da
  fidelidade, dias restantes, percentual e multa, RN15) e `sale.ts` (lucro,
  comissão e crédito, RN16). A consulta do clube e a venda usam as mesmas
  funções de dias restantes e percentual.
- O limite de 50% do caixa compara em centavos o dobro do custo com o caixa
  (`2 × custo ≤ caixa`), o que equivale à metade exata sem arredondá-la: com
  caixa de 261,15, 130,57 é aceito e 130,58 é recusado.
- O fim da fidelidade é aceito se for depois do instante da compra e no máximo
  1.095 × 24 horas depois dele, inclusive.
- A comissão soma 10% da parte do lucro até 10,00 e 20% da parte acima e
  arredonda uma única vez, no final (`sumOfPercentages`, em `money.ts`).
- O contrato vendido passa a `RESCINDIDO` quando a multa é maior que zero e a
  `ENCERRADO` quando é zero; como o valor de mercado tem piso de 1,00, toda
  fidelidade não cumprida gera multa de pelo menos 0,05.
- Compra (`POST /players/{id}/buy`): numa única transação do banco, trava o
  jogador e depois o clube (`SELECT ... FOR UPDATE`, sempre nessa ordem), confere
  as regras e grava caixa, vínculo, contrato `ATIVO` e transação `COMPRA`. Com as
  linhas travadas, compras simultâneas do mesmo jogador ou para o mesmo clube
  são atendidas uma por vez e não passam dos limites de elenco e de caixa.
- Ordem das conferências da compra: corpo (`400`), fim da fidelidade em relação
  ao instante da compra (`400`), jogador inexistente ou excluído (`404`), clube
  inexistente (`404`) e, por fim, as regras de negócio (`409`): jogador com
  clube, recompra pelo clube que o vendeu, elenco com 12 e custo acima de 50% do
  caixa.
- O instante da compra é lido uma vez e usado na conferência da fidelidade, em
  `created_at` da transação e no início do contrato (`iniciado_em`).
- A recompra é identificada por uma transação `VENDA` do mesmo clube e jogador
  no histórico.
- O Mercado lê e grava jogadores e clubes pela sua própria sessão de transação
  (`market/infrastructure/prisma-market.repository.ts`), usando os conversores
  de linha de Jogadores e Clubes (`player-row.mapper.ts` e `club-row.mapper.ts`),
  sem duplicá-los.
- Venda (`POST /players/{id}/sell`): sem corpo; um corpo enviado, mesmo inválido,
  é ignorado (V1). Numa única transação, trava o jogador e depois o clube atual
  dele, calcula a venda com `settleSale` (multa, lucro, comissão e crédito) e
  grava o crédito no caixa, o jogador livre, o contrato `ENCERRADO` ou
  `RESCINDIDO` com `encerrado_em`, a transação `VENDA` e a saída do titular da
  escalação. Ordem das recusas: jogador inexistente ou excluído (`404`) e
  jogador livre (`409`).
- Na resposta da venda, o crédito no caixa é o `cash_change`, e `fee` é a
  comissão, como na transação `VENDA` (RN17); não há campo `credit`.
- A saída do titular fica na Liga (`league/infrastructure/lineup-slots.ts`) e
  recebe a transação em andamento; ela apaga só a linha do jogador em
  `escalacoes`, mantém a formação do clube e não escala ninguém no lugar.
- Histórico (`GET /clubs/{id}/transactions`): devolve as transações como foram
  gravadas, sem consultar o nome ou o valor atuais do jogador, da mais recente
  para a mais antiga e, no mesmo instante, maior id primeiro. Não há paginação;
  `page` e `limit` são parâmetros fora da tabela e são ignorados.
- O `summary` é calculado sobre as transações já filtradas por `type` e
  `player_id`, com somas exatas em centavos (`market/domain/transaction-summary.ts`).
- Ordem das recusas do histórico: filtro inválido (`400`), clube inexistente
  (`404`) e jogador do filtro inexistente ou excluído (`404`). Sem o filtro, as
  transações do jogador excluído continuam no histórico, com o nome do momento.
- Exportação (`GET /clubs/{id}/transactions/export`): usa a mesma consulta do
  histórico, com os mesmos filtros, validações, recusas e ordem, e monta o
  arquivo em `market/http/transactions-csv.ts`. Responde
  `Content-Type: text/csv; charset=utf-8`, em UTF-8 sem BOM, com cada linha
  terminada em LF, inclusive a última, e sem `Content-Disposition` (opcional na
  RN18).
- O tipo `text/csv` é definido só depois que a consulta deu certo; assim as
  recusas `400` e `404` continuam em JSON, com `message`.
- No CSV, o nome é o gravado na transação; nomes com `;` ou aspas vão entre aspas
  duplas, com cada aspa interna duplicada. Os outros campos (data, tipo e
  valores) nunca contêm `;` nem aspas e não recebem aspas.
- Escalação (`PUT /clubs/{id}/lineup`): numa única transação, trava os 5
  jogadores (em ordem de id) e depois o clube, a mesma ordem da compra e da
  venda, confere as regras e substitui a formação e os 5 titulares por inteiro.
  A resposta é a escalação gravada, lida na mesma transação, no formato do
  `GET /clubs/{id}/lineup`. O caixa não muda.
- Ordem das recusas da escalação: corpo (`400`: formação fora da lista,
  `player_ids` que não é lista de 5 inteiros positivos distintos), clube
  inexistente (`404`), jogador inexistente ou excluído (`404`) e, por fim, as
  regras de negócio (`409`): jogador fora do elenco do clube (de outro clube ou
  livre), jogador `DOENTE` e posições que não fecham a formação.
- `complete` é `true` só com a formação salva e os 5 titulares. Sem escalação,
  `formation` é `null`, `players` vem vazio e `complete` é `false`.
- A regra de quem pode ser titular (`canBeStarter`, em `league/domain/lineup.ts`)
  é usada na escalação e na alteração de condição. Na alteração para `DOENTE`, a
  condição é gravada e o titular sai da escalação na mesma transação, pela mesma
  operação usada na venda (`removeStarter`); a formação continua a salva e o
  jogador não volta sozinho quando deixa de estar `DOENTE`.
- Partida (`POST /matches`): o placar é calculado em `league/domain/match.ts`,
  sem sorteio. Os titulares seguem a ordem do elenco (a mesma `compareSquadOrder`
  do elenco e da escalação), os 6 duelos são sempre disputados e gol é só ataque
  maior que defesa. Titular `MAL_CONDICIONADO` usa `matchValue` (× 0,85, inteiro
  mais próximo, meio para cima); os atributos do jogador não mudam.
- Numa única transação, trava os dois clubes para leitura (`FOR SHARE`, em ordem
  de id), lê as escalações, joga e grava a partida e os 6 duelos com os nomes,
  posições, condições, atributos e valores do momento. A trava compartilhada
  impede que uma troca de escalação simultânea seja lida pela metade, sem
  bloquear outras partidas dos mesmos clubes. A partida não muda caixa,
  jogadores nem escalações, e o mesmo confronto pode se repetir sem limite.
- Ordem das recusas da partida: corpo (`400`, inclusive mandante igual ao
  visitante), mandante e depois visitante inexistentes (`404`) e escalação
  incompleta de um dos clubes (`409`).
- O `club_name` da partida é o nome atual do clube; como não há edição de
  clubes, ele é sempre o do momento da partida, e a tabela `partidas` segue o
  enunciado, sem coluna de nome.
- Histórico de partidas (`GET /matches` e `GET /matches/{id}`): monta cada
  partida a partir das linhas gravadas em `partidas` e `duelos_partida`, sem
  consultar os jogadores atuais nem recalcular duelos; o `result` sai dos gols
  gravados, pela mesma `matchResult` usada ao jogar. A lista vem da mais recente
  para a mais antiga (mesmo instante: maior id primeiro), sem `duels`; o detalhe
  traz os 6 duelos na ordem gravada. Não há paginação.
- O filtro `club_id` do histórico aceita só inteiros positivos no formato dos
  query params (`400` fora disso); clube inexistente → `404`.
- Classificação (`GET /standings`): calculada a cada consulta em
  `league/domain/standings.ts`, a partir dos placares gravados e de todos os
  clubes, inclusive os que ainda não jogaram; nada é gravado. Ordem: pontos,
  saldo de gols, gols marcados, nome pela ordem alfabética das Premissas e, para
  nomes iguais nessa comparação (como "Águias FC" e "Aguias FC"), id crescente.
- Frontend: todas as chamadas à API passam por `frontend/src/shared/api/http-client.ts`
  e pelas funções `*-api.ts` de cada módulo; os componentes usam essas funções ou
  hooks de dados, sem `fetch` direto. A recusa da API vira `ApiError`, e a tela
  mostra o `message` devolvido.
- Tela de Jogadores: segue o fluxo e a disposição do mockup dentro do shell do
  C02. O filtro "só livres" é a aba Livres (`free=true`), com Todos (sem `free`)
  e Em clubes (`free=false`). Livres e o filtro por clube não se combinam: com
  um deles ativo, o outro fica desabilitado, com o motivo.
- A busca vai à API 300 ms depois da última tecla e só com 2 caracteres ou mais
  (a API recusa 1 caractere); com 1, a tela mostra a dica e não busca.
- Os formulários validam antes de enviar só os campos obrigatórios, o tamanho
  do nome (3 a 100) e as faixas de um campo (idade, agilidade, atributos e
  potencial); o formato do nome e as regras que cruzam campos (soma dos
  atributos, potencial, agilidade com 35 anos ou mais) ficam com a API, e o
  `message` aparece no formulário.
- Recusas previsíveis impedidas na tela, com o motivo: idade menor que a atual,
  mudança de posição de jogador com clube e de Doente direto para Apto. "Excluir"
  só aparece para jogador livre.
- Depois de cadastrar, editar, alterar a condição ou excluir, a lista e o painel
  de detalhes são lidos de novo da API, sem recarregar a página; o botão da ação
  fica desabilitado durante o envio, e um clique duplo envia um só pedido.
- Ao escolher Doente para jogador com clube, a tela consulta
  `GET /clubs/{id}/lineup` e avisa se ele é titular e vai sair da escalação.
- Tela de Clubes: a lista e a página do clube ficam no módulo Clubes, alternadas
  por estado, sem URL própria para o clube e sem biblioteca de rotas; "Voltar
  para clubes" lê a lista de novo da API, na ordem escolhida.
- A lista de clubes ordena por nome, por patrimônio do maior para o menor e do
  menor para o maior, sempre com `sort` enviado à API e na ordem devolvida.
- O formulário de clube valida antes de enviar o nome obrigatório de 3 a 60
  caracteres (depois da V4) e a sigla obrigatória com 3 letras; maiúsculas,
  acentos, palavras do nome, letras da sigla no nome e nome ou sigla repetidos
  ficam com a API, e o `message` aparece no formulário. A sigla é enviada como
  foi digitada.
- Depois de criar o clube, a tela mostra o aviso de sucesso e abre a página do
  clube criado, lida de `GET /clubs/{id}`.
- A página do clube mostra caixa, valor do elenco, patrimônio e o elenco com o
  contrato de cada jogador como a API devolve. O fim da fidelidade vem em
  `-03:00` e é só reescrito como DD/MM/AAAA e HH:MM; clube inexistente (`404`)
  mostra o `message` e o caminho de volta.
- As tabelas das telas usam o componente compartilhado `DataTable`, e a
  normalização e o tamanho dos nomes ficam em `shared/validation/text.ts`, usados
  por Jogadores e Clubes.
- Compra (F06): o botão Comprar aparece nos jogadores livres da tabela e abre o
  formulário com o clube comprador (lido de `GET /clubs`, com o caixa atual) e o
  fim da fidelidade em campos de data e hora, interpretados no horário de
  Brasília e enviados como `AAAA-MM-DDTHH:MM-03:00` (RN01). Antes de enviar, a
  tela confere só o clube, a data e a hora obrigatórios; o fim da fidelidade em
  relação ao momento da compra, o limite de 50% do caixa, o elenco cheio e a
  recompra ficam com a API, e o `message` da recusa aparece no formulário.
- A resposta de `POST /players/{id}/buy` traz o campo adicional `total_cost`
  (valor + taxa), vindo do mesmo cálculo da RN13 que confere o limite do caixa;
  os campos do enunciado não mudam. O resultado da compra mostra valor, taxa,
  custo total, fim da fidelidade, contrato e novo caixa como a API devolveu, sem
  calcular nada na tela. Depois da compra, a lista de jogadores é lida de novo
  da API e mostra o clube do jogador.
- Venda (F08): o botão Vender fica em cada jogador do elenco, na página do
  clube, e abre uma confirmação com o valor de mercado, o valor de compra e o
  contrato (fim da fidelidade, dias restantes e % de multa) lidos de
  `GET /clubs/{id}`. Só ao confirmar a tela envia `POST /players/{id}/sell`, sem
  corpo; durante o envio, os botões ficam desabilitados e um clique duplo envia
  um só pedido. Se o jogador for titular (`GET /clubs/{id}/lineup`), a
  confirmação avisa que ele sai da escalação.
- O resultado da venda mostra valor de compra, valor de venda, dias restantes,
  multa, lucro, comissão, crédito no caixa, contrato e novo caixa como a API
  devolveu, inclusive lucro negativo e comissão 0,00; lucro e crédito aparecem
  com sinal ("+" ou "-"), só na formatação. Depois da venda, e também de uma
  recusa, a página do clube é lida de novo da API, sem recarregar a página; a
  recusa mostra o `message` na confirmação.
- Histórico (F09 a F11): fica na aba Histórico da página do clube, ao lado da
  aba Elenco. A tabela mostra as transações na ordem de
  `GET /clubs/{id}/transactions`, com a variação do caixa e o lucro com sinal
  ("+" e "-") e "—" no lucro das compras, que é nulo.
- O filtro de tipo aceita Compra, Venda ou os dois (`type=COMPRA,VENDA`); sem
  nenhum marcado, `type` não é enviado. A lista de jogadores do filtro vem do
  histórico sem filtros do clube, com o nome da transação mais recente de cada
  um, inclusive de quem já saiu do elenco ou foi excluído. Filtro recusado (como
  `player_id` de jogador excluído, `404`) mostra o `message` da API e o botão
  para limpar os filtros.
- Os totais abaixo da tabela são o `summary` da resposta, lido de novo a cada
  mudança de filtro; a tela não soma nada.
- Exportar CSV pede `GET /clubs/{id}/transactions/export` com os mesmos filtros
  da tela e baixa os bytes devolvidos pela API, sem montar o CSV, como
  `historico-clube-{id}.csv`; a recusa mostra o `message` num aviso. O download
  usa `apiDownload`, em `shared/api/http-client.ts`, com o mesmo tratamento de
  erro das chamadas JSON.

## Funcionalidades não implementadas

Implementados: cálculos da RN02–RN06 e os endpoints de listagem, cadastro,
consulta, edição, alteração de condição e exclusão lógica de jogadores (RN06 a
RN09, com V1–V9 nesses endpoints); criação, listagem e consulta de clubes
(RN10 e RN11), com os dias restantes e o percentual de multa da RN15; regras de
domínio da compra e da venda (RN13, RN15 e RN16); compra de jogadores
(`POST /players/{id}/buy`, RN12 a RN14), com a transação `COMPRA` (RN17); venda
de jogadores (`POST /players/{id}/sell`, RN15 e RN16), com a transação `VENDA` e
a saída do titular vendido da escalação (RN19); consulta do histórico de
transações com resumo (`GET /clubs/{id}/transactions`, RN17) e exportação em CSV
(`GET /clubs/{id}/transactions/export`, RN18); escalação (`PUT` e
`GET /clubs/{id}/lineup`, RN19), com a saída do titular vendido ou que passa a
`DOENTE` na mesma transação da operação; partidas (`POST /matches`, RN20), com a
gravação atômica dos 6 duelos; histórico de partidas e classificação
(`GET /matches`, `GET /matches/{id}` e `GET /standings`, RN21).

Frontend implementado: tela de Jogadores (F01 a F04), com listagem paginada,
busca, filtros, ordenação, cadastro, edição, alteração de condição, exclusão e
painel de detalhes; tela de Clubes (F05 e F07), com listagem ordenável por nome
e por patrimônio, criação de clube e página do clube com caixa, valor do
elenco, patrimônio e elenco com os contratos; compra a partir da lista de
jogadores livres (F06), com o resultado da compra; venda pelo elenco do clube
(F08), com confirmação e o resultado da venda; histórico de transações na
página do clube (F09 a F11), com filtros por tipo e por jogador, totais do
`summary` e exportação em CSV.

Pendentes no frontend: escalação, partidas e classificação (F12 a F14). A arquitetura descrita
é uma proposta de organização para a implementação já aprovada por mim.

## Uso de inteligência artificial

Codex (OpenAI), com um único agente, auxiliou na leitura dos documentos, na
elaboração de `compose.yaml`, `.env.example`, `.gitignore` e deste `readme.md`,
para organizar o ambiente local e documentar a arquitetura aprovada. Nesta
etapa, foram adotados apenas Docker básico e documentação; código funcional,
Dockerfiles da aplicação e abstrações adicionais ficaram fora do escopo.
O conteúdo permanece sujeito à revisão e aprovação técnica do candidato.
