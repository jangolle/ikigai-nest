# ikigai - Basic development starter kit

## Description

This is universal TypeScript starter kit built on top of [Nest](https://github.com/nestjs/nest) framework.

Includes:
- [Nest Commander](https://docs.nestjs.com/recipes/nest-commander)
- [Nest Schedule](https://docs.nestjs.com/techniques/task-scheduling)
- [Nest Swagger](https://docs.nestjs.com/openapi/introduction)
- [Nest Validation](https://docs.nestjs.com/techniques/validation)
- [Nest Config](https://docs.nestjs.com/techniques/configuration)
- [Prisma](https://docs.nestjs.com/recipes/prisma)
- [Joi](https://joi.dev/api/)
- [Passport](https://docs.nestjs.com/security/authentication)

## Getting started

Create local dev copy for `.env` file.

```bash
cp .env.tpl .env
```

Replace `.env` values with desired variables.

## Running all services with docker-compose

```bash
docker-compose up -d
```

## Installation

```bash
$ yarn install
```

Build for production usage

```bash
$ yarn build
```

## Modes

Application could be run in different modes `SERVER` ro `JOBS`.

Entrypoint for both modes: [src/main.ts](./src/main.ts).

### SERVER

NestApplication apply context and start server on port.

### JOBS

Creates NestApplicationContext and infinite loop as worker.

Jobs must be described in cron-way in separate [jobs](./src/jobs/jobs.service.ts) directory.

Read more about NestJS [task scheduling](https://docs.nestjs.com/techniques/task-scheduling).

## Running the main in `server` mode

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Running jobs app in `jobs` mode

`Precondictions:` yarn build

```bash
# development
$ yarn start:jobs
```

## Test

```bash
# unit and e2e tests and oneliner
$ yarn test:all

# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## IDE REST client

`Preconditions:` VSCODE plugin `REST Client` or similar in WebStorm.

Presets of requests for most of use-cases stored and available to run in [.requests.http](.requests.http)

## Working with DB