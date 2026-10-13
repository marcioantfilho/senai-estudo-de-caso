# Liga de futebol — estudo de caso SENAI/PE

Aplicação para administrar jogadores, clubes, transferências e partidas de uma
liga fictícia. O fluxo previsto é: cadastrar jogadores e clubes, comprar e vender
jogadores com contrato de fidelidade, consultar o histórico, escalar titulares,
jogar partidas e consultar a classificação.

**Etapa atual:** ideia inicial, arquitetura planejada e Docker básico para o
PostgreSQL. Backend, frontend e regras de negócio ainda não foram implementados.

## Stack e bibliotecas previstas

| Camada | Tecnologia | Finalidade |
| --- | --- | --- |
| Backend | NestJS + TypeScript, com Node.js 22 LTS | API HTTP e coordenação dos casos de uso |
| Frontend | React + Vite + TypeScript | Interface e consumo da API |
| Persistência | PostgreSQL 16 + Prisma | Dados, migrations e acesso transacional |
| Ambiente local | Docker Engine + Compose v2 | Execução do PostgreSQL |

Nenhuma biblioteca da aplicação foi instalada nesta etapa. Suas versões e
arquivos de trava serão definidos quando os projetos forem inicializados.

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

Estrutura proposta (prevista):

```text
.
├── readme.md
├── compose.yaml
├── .env.example
├── .gitignore
├── backend/
│   ├── prisma/                 # Schema e migrations
│   ├── test/
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
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

O Compose inicializa só o servidor e o banco vazio. Não cria as sete tabelas
obrigatórias que propõe o documento. Migrations, restrições e recriação do schema da
aplicação permanecem pendentes nesse momento incial, assim como o critério B3 integral.

## Variáveis de ambiente

| Variável | Valor de exemplo | Finalidade |
| --- | --- | --- |
| `POSTGRES_DB` | `liga` | Nome do banco local |
| `POSTGRES_USER` | `liga` | Usuário local |
| `POSTGRES_PASSWORD` | `liga_dev_local` | Senha fictícia do ambiente local |
| `POSTGRES_PORT` | `5432` | Porta publicada somente em `127.0.0.1` |

O `.env.example` é versionado; o `.env` é ignorado pelo Git. Não usei credenciais
reais. A conexão do Prisma será configurada na tarefa de persistência.

## Execução da aplicação

Pendente: ainda não há comandos de instalação, build ou execução do backend e
frontend. A API seguirá o prefixo obrigatório `/api/v1`; as URLs serão
documentadas quando os servidores forem implementados e verificados.
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
- Nenhum contrato HTTP, modelo de dados ou cálculo foi implementado ou alterado.
- A imagem fixa a versão principal 16; atualizações de patch seguem a tag oficial.

## Funcionalidades não implementadas

RN01–RN21, V1–V9, fluxos B01–B22 e F01–F14; inicialização dos projetos NestJS e
React; schema e migrations Prisma; testes funcionais; integração HTTP; compra,
venda, históricos, escalação, partidas e classificação. A arquitetura descrita
é uma proposta de organização para a implementação já aprovada.

## Uso de inteligência artificial

Codex (OpenAI), com um único agente, auxiliou na leitura dos documentos, na
elaboração de `compose.yaml`, `.env.example`, `.gitignore` e deste `readme.md`,
para organizar o ambiente local e documentar a arquitetura aprovada. Nesta
etapa, foram adotados apenas Docker básico e documentação; código funcional,
Dockerfiles da aplicação e abstrações adicionais ficaram fora do escopo.
O conteúdo permanece sujeito à revisão e aprovação técnica do candidato.
