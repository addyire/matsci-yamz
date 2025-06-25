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

// --- USERS ---
export type User = typeof usersTable.$inferSelect;
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  googleId: varchar().unique(undefined, { nulls: "distinct" }),
  name: varchar({ length: 255 }),
  email: varchar({ length: 254 }),
  isAi: boolean().notNull().default(false),
  createdAt: timestamp().defaultNow().notNull(),
  notifications: boolean().default(false),
});

export const usersTableRelations = relations(usersTable, ({ one, many }) => ({
  definitions: many(definitionsTable),
  comments: many(commentsTable),
  votes: many(votesTable),
}));

// --- TERMS ---
export type Term = typeof termsTable.$inferSelect;
export const termsTable = pgTable("terms", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  // authorId: integer().references(() => usersTable.id),
  createdAt: timestamp().defaultNow().notNull(),
  term: text().notNull().unique(),
});

export const termsTableRelations = relations(termsTable, ({ one, many }) => ({
  definitions: many(definitionsTable),
}));

// --- DEFINITIONS ---
export type Definition = typeof definitionsTable.$inferSelect;
export const definitionsTable = pgTable("definitions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  termId: integer()
    .references(() => termsTable.id)
    .notNull(),
  authorId: integer().references(() => usersTable.id),
  definition: text().notNull(),
  example: text().notNull(),
  score: integer().notNull().default(0),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().$onUpdateFn(() => new Date()),
});

export const definitionsTableRelations = relations(
  definitionsTable,
  ({ one, many }) => ({
    term: one(termsTable, {
      fields: [definitionsTable.termId],
      references: [termsTable.id],
    }),
    author: one(usersTable, {
      fields: [definitionsTable.authorId],
      references: [usersTable.id],
    }),
    edits: many(editsTable),
    comments: many(commentsTable),
    votes: many(votesTable),
  }),
);

// --- DEFINITION EDITS ---
export const editsTable = pgTable("definitionEdits", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  definitionId: integer()
    .references(() => definitionsTable.id)
    .notNull(),
  definition: text().notNull(), // what the definition used to be
  editedAt: timestamp().defaultNow().notNull(),
});

export const editsTableRelations = relations(editsTable, ({ one }) => ({
  definition: one(definitionsTable, {
    fields: [editsTable.definitionId],
    references: [definitionsTable.id],
  }),
}));

// --- VOTES ---
export const voteTypeEnum = pgEnum("vote_type", ["up", "down"]);

export type Vote = typeof votesTable.$inferSelect;
export const votesTable = pgTable(
  "votes",
  {
    definitionId: integer()
      .references(() => definitionsTable.id)
      .notNull(),
    userId: integer()
      .references(() => usersTable.id)
      .notNull(),
    kind: voteTypeEnum().notNull(),
  },
  (table) => [primaryKey({ columns: [table.definitionId, table.userId] })],
);

export const votesTableRelations = relations(votesTable, ({ one, many }) => ({
  author: one(usersTable, {
    fields: [votesTable.userId],
    references: [usersTable.id],
  }),
  term: one(definitionsTable, {
    fields: [votesTable.definitionId],
    references: [definitionsTable.id],
  }),
}));

// --- COMMENTS ---
export type Comment = typeof commentsTable.$inferSelect;
export const commentsTable = pgTable("comments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  definitionId: integer()
    .references(() => definitionsTable.id)
    .notNull(),
  userId: integer()
    .references(() => usersTable.id)
    .notNull(),
  message: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

export const commentsTableRelations = relations(commentsTable, ({ one }) => ({
  author: one(usersTable, {
    fields: [commentsTable.userId],
    references: [usersTable.id],
  }),
  term: one(definitionsTable, {
    fields: [commentsTable.definitionId],
    references: [definitionsTable.id],
  }),
}));

// --- TAGS ---
export type Tag = typeof tagsTable.$inferSelect;
export const tagsTable = pgTable("tags", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
});

export const tagsToTerms = pgTable(
  "tagsToTerms",
  {
    definitionId: integer()
      .references(() => definitionsTable.id)
      .notNull(),
    tagId: integer()
      .references(() => tagsTable.id)
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.tagId, table.definitionId] })],
);

// --- JOBS ---

const jobStatusEnum = pgEnum("job_status", [
  "pending",
  "in_progress",
  "succeeded",
  "failed",
]);

const jobType = pgEnum("job_type", ["create", "revise"]);

export const jobsTable = pgTable("jobs", {});
