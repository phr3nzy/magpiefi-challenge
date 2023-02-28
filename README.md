# MagpieFi Challenge Solution

A single CRON job ([here](./lib/server/plugins/cron.ts)) is responsible for updating the pairs from thegraph's endpoint. It will run every 30 minutes.

An HTTP endpoint (`/pairs`) that fetches all pairs stored in the database is used to validate that the cron is working.

We could extend the functionality to only upsert newly updated values by storing a computed hash of the current values in a cache and then when refetching through the CRON to either insert or not based on the new payload's hash value.

There is also a documentation route that displays a Swagger UI (HTML) with all HTTP routes in this codebase and what their schemas/return values are.

## Requirements

- [Node.js](https://nodejs.org/en/)
- [MongoDB](https://www.mongodb.com/)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Installation

```bash
npm install
```

## Usage

```bash
# spin up the necessary infrastructure
$ docker compose up -d

# create a development-only environment variables file
$ cp .env.template .env

# sync the database
$ npm run push

# run in development mode
$ npm run dev # or dev:esbuild for faster startup/reload
```
