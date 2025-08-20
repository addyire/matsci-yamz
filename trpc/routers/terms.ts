import { db, termsTable } from "@yamz/db";
import { baseProcedure, createTRPCRouter } from "../init";
import { like } from "drizzle-orm";
import { z } from "zod";

export const termsRouter = createTRPCRouter({
  list: baseProcedure.query(async () => {
    const terms = await db
      .select({ value: termsTable.term, id: termsTable.id })
      .from(termsTable);

    return terms;
  }),
});
