# MatSci YAMZ Metadictionary

This is the source code for matsci.yamz.net

## Requirements

Running the MatSci YAMZ web server requires two other services to be running

1. PostgreSQL (database)
2. Ollama (running LLM models)

## Installation

1. Copy `.env.example` to `.env` and fill in each environment variable with it's appropriate value
2. Run `pnpm install` to install all required dependencies
3. Run `pnpm db:migrate` to get your database setup
4. For development, run `pnpm dev`
5. For production, run `pnpm build` to build the project and then `pnpm start` to serve the app

## Upgrading

After pulling a new version of MatSci YAMZ use the upgrade script in `scripts/upgrade.sh` to install dependencies, migrate the database, and build the new version of the app
