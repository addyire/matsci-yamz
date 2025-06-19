import {
  integer,
  varchar,
  pgTable,
  boolean,
  text,
  timestamp,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";

export type User = typeof usersTable.$inferSelect;
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  googleId: varchar().notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 254 }).notNull(),
  notifications: boolean().default(false),
});

export type Term = typeof termsTable.$inferSelect;
export const termsTable = pgTable("terms", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  authorId: integer()
    .references(() => usersTable.id)
    .notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  modifiedAt: timestamp()
    .$onUpdateFn(() => new Date())
    .notNull(),
  term: varchar().notNull(),
  definition: text().notNull(),
  examples: text().notNull(),
});

export const voteTypeEnum = pgEnum("vote_type", ["up", "down"]);

export type Vote = typeof votesTable.$inferSelect;
export const votesTable = pgTable(
  "votes",
  {
    termId: integer()
      .references(() => termsTable.id)
      .notNull(),
    userId: integer()
      .references(() => usersTable.id)
      .notNull(),
    kind: voteTypeEnum().notNull(),
  },
  (table) => [primaryKey({ columns: [table.termId, table.userId] })],
);

export type Comment = typeof commentsTable.$inferSelect;
export const commentsTable = pgTable("comments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  termId: integer()
    .references(() => termsTable.id)
    .notNull(),
  userId: integer()
    .references(() => usersTable.id)
    .notNull(),
  message: text().notNull(),
});

export type Tag = typeof tagsTable.$inferSelect;
export const tagsTable = pgTable("tags", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
});

export const tagsToTerms = pgTable(
  "tagsToTerms",
  {
    termId: integer()
      .references(() => termsTable.id)
      .notNull(),
    tagId: integer()
      .references(() => tagsTable.id)
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.tagId, table.termId] })],
);
