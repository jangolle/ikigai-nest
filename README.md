# ikigai:nest - server app starter kit

## Description

This is universal server app starter kit built on top of [Nest](https://github.com/nestjs/nest) framework with TypeScript.

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


## Directory structure

- [init/](./init/) - directory with `.sql` files that will executed on init of db running with `docker-compose`.
- [prisma/](./prisma/) - directory for all Prisma files.
- [src/](./src/) - directory for project sources.
  - [commands/](./src/commands/) - directory with `*.command.ts` each one for separate command. More about [Nest Commander](https://docs.nestjs.com/recipes/nest-commander)
  - [config/](./src/config/) - directory with configurations for your modules and components. More about [Nest Config](https://docs.nestjs.com/techniques/configuration)
  - [jobs/](./src/jobs/) - main jobs module. Each service here is aggregation for `@Cron` handlers. More about [Nest Schedule](https://docs.nestjs.com/techniques/task-scheduling)
  - [modules/](./src/modules/) - directory for application modules. More about [Nest Modules](https://docs.nestjs.com/modules)
    - [auth/](./src/modules/auth/) - implementation of auth. More at [Auth](#auth).
    - [identity/](./src/modules/identity/) - module that wrap `Identity` as core auth entity.
  - [services/](./src/services/) - directory for common application services.
- [test](./test/) - directory for e2e tests.


## Validation

In general for validation we use [Joi](https://joi.dev/api/) and it's schema.

In controllers we work with [Validation Pipes](https://docs.nestjs.com/techniques/validation) to validate and transform incoming data.

So we use composition of both approaches to valiate data in controllers.

Check as example: [src/modules/auth/validation.pipe.ts](./src/modules/auth/validation.pipe.ts)

Usage in controllers:

```typescript
async register(
    @Body(RegistrationValidationPipe) registrationDto: RegistrationDto
)
```

## Auth

Auth in application built with [Passport](https://docs.nestjs.com/security/authentication)

[src/modules/auth/guards/](./src/modules/auth/guards/) - auth guards directory

[src/modules/auth/strategies/](./src/modules/auth/strategies/) - auth strategies directory

Usage in controllers:

```typescript
@UseGuards(JwtAuthGuard)
@Get('/me')
async me(@Request() req: AuthenticatedRequest): Promise<IdentitySafe> {}

@UseGuards(LocalAuthGuard)
@Post('/sign-in')
async login(@Request() req: AuthenticatedRequest) {}
```

## IDE REST client

`Preconditions:` VSCODE plugin `REST Client` or similar in WebStorm.

Presets of requests for most of use-cases stored and available to run in [.requests.http](.requests.http)


## Swagger (OpenAPI)

By default application starts with Swagger UI and available on `/docs`.

You can change it modifying `SWAGGER_PATH` in your [.env](./.env)


## DB operations

DB management operates with [Prisma](https://www.prisma.io/).

Default driver is `mysql` but can easily override it with one you prefer.

All prisma files stored in [prisma](./prisma/) directory in root of project.

In your application use should use prepared dependency [PrismaService](./src/services/prisma.service.ts).

Set it up according to NestJS IoC concepts, e.g:

```typescript
constructor(private readonly prisma: PrismaService) {}
```

### Useful prisma commands

```bash
# Generate artifacts (e.g. Prisma Client)
$ yarn prisma:client

# DO NOT use on production. Create migrations from your Prisma schema, apply them to the database, generate artifacts (e.g. Prisma Client)
$ yarn prisma:dev <MIGRATION_NAME>

# Pull the schema from an existing database, updating the Prisma schema
$ yarn prisma:pull

# Push the Prisma schema state to the database
$ yarn prisma:push
```

### Prisma Studio

Also you could run UI client for simple data management if you prefer.

```bash
# Run prisma studio
$ yarn prisma:ui
```

By default this run instance of [Prisma Studio](https://www.prisma.io/docs/concepts/components/prisma-studio) on [localhost:5555](localhost:5555).

## Commands

Application provides it's own CLI commands build with [Nest Commander](https://docs.nestjs.com/recipes/nest-commander).

```bash
# check available commands
$ yarn command -h

# run command
$ yarn command <CMD> [options]

# run command in dev mode without build required (with ts-node)
$ yarn command:ts <CMD> [options]
```