# Repertoire

> Repertoire is still in development

Repertoire is a [Playwright](https://playwright.dev/) reporter & dashboard that records your end-to-end test runs.

This setup is written for a simple use-case of keeping all test runs visible in one place.  
There is currently no support for the following: (but they may be supported in the future)

- Webhooks
- Auth (_anyone can push and view test runs_)
- Multi-tenancy

## Getting started

This guide assumes you're running the stack with `docker-compose` locally, but you can easily write the deployment to a kubernetes cluster.

### Docker compose

Copy [`docker-compose.yml`](./docker-compose.yml) to your own environment and run

```sh
docker-compose up -d
```

### Playwright config

```sh
npm install repertoire-reporter
# or
yarn add repertoire-reporter
# or
pnpm add repertoire-reporter
```

```js
export default defineConfig({
  reporter: [["repertoire-reporter", { url: "http://localhost:3000" }]],
});
```

By default, a random simple hash is assigned to your run.
You can alternatively set `RUN_ID` in your environment variable to assign it yourself.
You should do this in CI with your pipeline or commit id.

### Configuring for CI

> TODO

## Contributing

If you wish to contribute, these are pre-requisite steps for a local setup:

### Dependencies & Prisma

The package manager of choice is [`pnpm`](https://pnpm.io/)

```sh
# Install all dependencies
pnpm i

# Generate prisma client
cd apps/web
pnpm run prisma:generate
```

### Mongo & Minio

Start both minio and mongodb instances with `docker-compose`

```sh
cd apps/web
docker-compose up
```

Create a `.env` file in `apps/web` with the following strings, change it according to your setup

```
DATABASE_URL="mongodb://localhost:27017/repertoire?directConnection=true"
MINIO_ACCESS_KEY="ROOTUSER"
MINIO_SECRET_KEY="CHANGEME123"
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_PUBLIC_ENDPOINT="http://localhost:9000"
```

### Starting dev server

Now you should be able to run `pnpm dev` in the root directory and run tests in the `packages/reporter` folder.
