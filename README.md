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

## Stack

- **NextJS**: The web framework used for generating server and client side pages
- **DrizzleORM**: ORM for interacting with the postgres database
- **TRPc**: Used to easily make server side actions that can be used on the server and client

## Folder Structure

- `/app` - Each `page.tsx` refers to a page on the website
- `/trpc` - CRUD operations
- `/scripts` - Helper scripts for dumping the database and upgrading
- `/drizzle` - Database schema and migrations
- `/lib` - Helper functions for interacting with Google and Ollama API
