import { db, usersTable } from "@yamz/db";
import { eq } from "drizzle-orm";
import { cache } from "react";

export const GetUser = cache((userId: number) =>
  db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
  }),
);
