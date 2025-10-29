# MatSci YAMZ Developer Guide

Welcome to the MatSci YAMZ development guide! This document will help you understand how to add features, modify pages, and work with the database in this codebase.

## Table of Contents

- [Quick Start](#quick-start)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Migrations](#database-migrations)
- [Adding/Editing Pages](#addingediting-pages)
- [Working with tRPC APIs](#working-with-trpc-apis)
- [UI Components](#ui-components)
- [Authentication](#authentication)
- [Common Tasks](#common-tasks)
- [Deployment](#deployment)

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
pnpm db:migrate

# Start development server (with Turbopack)
pnpm dev
```

Visit `http://localhost:3000` to see the app running.

---

## Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: tRPC for type-safe APIs
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Auth**: Google OAuth with iron-session
- **AI**: Ollama for LLM-powered features

---

## Project Structure

```
├── app/                    # Next.js App Router (pages & layouts)
│   ├── api/               # API routes
│   ├── terms/            # Term-related pages
│   ├── admin/            # Admin pages
│   └── ...               # Other pages
├── trpc/                  # tRPC API layer
│   ├── routers/          # API endpoints by feature
│   └── init.ts           # tRPC setup & context
├── drizzle/              # Database
│   ├── schema.ts         # Database schema
│   └── migrations/       # SQL migrations
├── components/           # React components
│   └── ui/              # shadcn/ui components
└── lib/                  # Utilities & helpers
```

---

## Database Migrations

### Understanding the Schema

The database schema is defined in `drizzle/schema.ts`. Main tables:

- **users** - User accounts (Google OAuth)
- **terms** - Material science terms
- **definitions** - Definitions for terms (one per user per term)
- **votes** - User votes on definitions
- **comments** - Comments on definitions
- **tags** - Category tags
- **definitionEdits** - Edit history

### Creating a Migration

**Step 1: Modify the Schema**

Edit `drizzle/schema.ts`. For example, to add a field to the terms table:

```typescript
export const termsTable = pgTable("terms", {
  id: serial("id").primaryKey(),
  term: text("term").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Add your new field here:
  description: text("description"),
})
```

**Step 2: Generate Migration**

```bash
pnpm db:generate
```

This creates a new SQL file in `drizzle/migrations/` with the schema changes.

**Step 3: Apply Migration**

```bash
pnpm db:migrate
```

This runs all pending migrations against your database.

### Quick Database Commands

```bash
pnpm db:studio     # Open Drizzle Studio (visual database editor)
pnpm db:push       # Push schema changes without migrations (dev only)
pnpm db:drop       # Drop all tables (careful!)
```

### Example: Adding a New Table

```typescript
// In drizzle/schema.ts

export const myNewTable = pgTable("my_new_table", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type MyNewTable = typeof myNewTable.$inferSelect
export type InsertMyNewTable = typeof myNewTable.$inferInsert
```

Then generate and run the migration:

```bash
pnpm db:generate
pnpm db:migrate
```

---

## Adding/Editing Pages

### Creating a New Page

Next.js uses file-based routing in the `app/` directory.

**Example: Create `/my-page`**

1. Create `app/my-page/page.tsx`:

```tsx
export default function MyPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">My New Page</h1>
      <p>This is my new page!</p>
    </div>
  )
}
```

2. Add metadata (optional):

```tsx
export const metadata = {
  title: "My Page - MatSci YAMZ",
  description: "Description of my page",
}
```

### Creating a Dynamic Route

**Example: Create `/my-page/[id]`**

Create `app/my-page/[id]/page.tsx`:

```tsx
export default async function MyDynamicPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="container mx-auto p-4">
      <h1>Item {id}</h1>
    </div>
  )
}
```

### Server vs Client Components

By default, all components in `app/` are **Server Components** (run on server).

To use client-side features (hooks, interactivity), add `"use client"`:

```tsx
"use client"

import { useState } from "react"

export default function MyClientComponent() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

### Editing Existing Pages

Look in the `app/` directory. For example:

- Homepage: `app/page.tsx`
- Terms list: `app/terms/page.tsx`
- Term detail: `app/terms/[termId]/page.tsx`
- Admin dashboard: `app/admin/page.tsx`

---

## Working with tRPC APIs

### Understanding tRPC

tRPC provides end-to-end type-safe APIs. Define procedures on the server, call them from the client with full TypeScript support.

### Creating a New API Endpoint

**Step 1: Define the Router**

Create or edit a router in `trpc/routers/`. For example, `trpc/routers/my-feature.ts`:

```typescript
import { z } from "zod"
import { authenticatedProcedure, baseProcedure } from "../procedures"
import { router } from "../init"
import { db } from "@yamz/db"

export const myFeatureRouter = router({
  // Public endpoint
  getAll: baseProcedure.query(async () => {
    return await db.select().from(myNewTable)
  }),

  // Authenticated endpoint
  create: authenticatedProcedure
    .input(z.object({
      name: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx

      return await db.insert(myNewTable).values({
        name: input.name,
        userId,
      })
    }),
})
```

**Step 2: Add to Main Router**

In `trpc/routers/_app.ts`:

```typescript
import { myFeatureRouter } from "./my-feature"

export const appRouter = router({
  // ... existing routers
  myFeature: myFeatureRouter,
})
```

**Step 3: Use in Client Components**

```tsx
"use client"

import { trpc } from "@/trpc/client"

export function MyComponent() {
  const { data, isLoading } = trpc.myFeature.getAll.useQuery()
  const createMutation = trpc.myFeature.create.useMutation()

  const handleCreate = () => {
    createMutation.mutate({ name: "New item" })
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {data?.map(item => <div key={item.id}>{item.name}</div>)}
      <button onClick={handleCreate}>Create</button>
    </div>
  )
}
```

**Step 4: Use in Server Components**

```tsx
import { trpcServer } from "@/trpc/server"

export default async function MyServerComponent() {
  const data = await trpcServer.myFeature.getAll()

  return (
    <div>
      {data.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  )
}
```

### Available Procedures

- `baseProcedure` - Public endpoints
- `authenticatedProcedure` - Requires logged-in user (has `userId` in context)

---

## UI Components

### Using shadcn/ui Components

The project uses shadcn/ui components in `components/ui/`. To use them:

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function MyComponent() {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>My Dialog</DialogTitle>
        </DialogHeader>
        <Input placeholder="Enter text..." />
        <Button>Submit</Button>
      </DialogContent>
    </Dialog>
  )
}
```

### Available UI Components

Located in `components/ui/`:

- `button`, `input`, `textarea`, `label`
- `dialog`, `popover`, `dropdown-menu`
- `table`, `tabs`, `card`, `badge`
- `form` (with react-hook-form integration)
- `skeleton` (loading states)
- `sonner` (toast notifications)

### Adding a New shadcn/ui Component

```bash
npx shadcn@latest add [component-name]
```

For example:
```bash
npx shadcn@latest add alert-dialog
```

### Styling with Tailwind

Use Tailwind classes directly:

```tsx
<div className="flex items-center gap-4 p-6 bg-background text-foreground">
  <h1 className="text-2xl font-bold">Title</h1>
</div>
```

The theme supports dark mode automatically via CSS variables.

---

## Authentication

### Getting Current User

**In Server Components:**

```tsx
import { getIronSession } from "iron-session"
import { sessionOptions } from "@/lib/session"
import { cookies } from "next/headers"

export default async function MyPage() {
  const session = await getIronSession(await cookies(), sessionOptions)
  const user = session.user

  if (!user) {
    return <div>Please log in</div>
  }

  return <div>Welcome, {user.name}!</div>
}
```

**In Client Components (via tRPC):**

```tsx
"use client"

import { trpc } from "@/trpc/client"

export function MyComponent() {
  const { data: user } = trpc.user.me.useQuery()

  if (!user) return <div>Not logged in</div>

  return <div>Welcome, {user.name}!</div>
}
```

**In tRPC Procedures:**

Authentication is handled automatically in `authenticatedProcedure`:

```typescript
create: authenticatedProcedure
  .input(z.object({ name: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const { userId } = ctx // User ID is available here
    // ...
  })
```

### Checking Admin Status

```tsx
const { data: user } = trpc.user.me.useQuery()

if (user?.isAdmin) {
  // Admin-only UI
}
```

---

## Common Tasks

### Adding a New Form

1. Create a Zod schema for validation:

```typescript
import { z } from "zod"

const myFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
})
```

2. Use with react-hook-form and shadcn/ui Form:

```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function MyForm() {
  const form = useForm({
    resolver: zodResolver(myFormSchema),
    defaultValues: { title: "", description: "" },
  })

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### Adding Toast Notifications

```tsx
"use client"

import { toast } from "sonner"

export function MyComponent() {
  const handleClick = () => {
    toast.success("Action completed!")
    // or
    toast.error("Something went wrong")
    // or
    toast.info("Information message")
  }

  return <button onClick={handleClick}>Do Something</button>
}
```

### Using Search

The app has a global search feature. Check `app/search/page.tsx` and `components/autocomplete.tsx` for examples.

### Working with Tags

Tags are many-to-many with definitions. See `trpc/routers/tags.ts` for the API and `app/tags/` for page examples.

---

## Deployment

### Environment Variables

Ensure all required variables are set (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` - OAuth
- `SESSION_PASSWORD` - Session encryption (32+ chars)
- `OLLAMA_HOST` - AI service URL
- `SYSTEM_PROMPT` - AI prompt configuration

### Production Build

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Run migrations
pnpm db:migrate

# Build the app
pnpm build

# Start production server
pnpm start
```

### Upgrade Script

For production deployments, use the upgrade script:

```bash
./scripts/upgrade.sh
```

This script handles pulling code, installing dependencies, running migrations, and restarting the service.

---

## Tips & Best Practices

1. **Type Safety**: Always define Zod schemas for form inputs and API endpoints
2. **Database Queries**: Use Drizzle ORM, avoid raw SQL when possible
3. **Server Components**: Prefer Server Components for data fetching, use Client Components only when needed
4. **tRPC**: Keep routers organized by feature in `trpc/routers/`
5. **UI Consistency**: Use shadcn/ui components for consistent styling
6. **Migrations**: Always generate migrations for schema changes, never modify the database directly
7. **Code Formatting**: Run `pnpm lint` before committing

---

## Getting Help

- Check existing code in similar features for patterns
- Review `README.md` for additional documentation
- Explore `drizzle/schema.ts` to understand the data model
- Use `pnpm db:studio` to visually inspect the database
- Check the Next.js, Drizzle, and tRPC documentation for framework-specific questions

Happy coding!
