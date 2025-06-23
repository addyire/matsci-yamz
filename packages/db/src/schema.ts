import { relations } from "drizzle-orm";
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

export const usersTableRelations = relations(usersTable, ({one, many}) => ({
  terms: many(termsTable),
  comments: many(commentsTable),
  votes: many(votesTable)
}))

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

export const termsTableRelations = relations(termsTable, ({one, many}) => ({
  author: one(usersTable, {fields: [termsTable.authorId], references: [usersTable.id]}),
  comments: many(commentsTable),
  votes: many(votesTable)
}))

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

export const votesTableRelations = relations(votesTable, ({one, many}) => ({
  author: one(usersTable, {fields: [votesTable.userId], references: [usersTable.id]}),
  term: one(termsTable, {fields: [votesTable.termId], references: [termsTable.id]}),
}))

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

export const commentsTableRelations = relations(commentsTable, ({one, many}) => ({
  author: one(usersTable, {fields: [commentsTable.userId], references: [usersTable.id]}),
  term: one(termsTable, {fields: [commentsTable.termId], references: [termsTable.id]}),
}))

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
