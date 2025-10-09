import { chatsTable, db, definitionsTable, termsTable } from "@/drizzle"
import { desc } from "drizzle-orm"

const main = async () => {
  const terms = await db.query.termsTable.findMany({
    orderBy: desc(termsTable.createdAt)
  })

  const aiUser = await db.query.usersTable.findFirst({
    where: (u, { eq }) => eq(u.isAi, true)
  })
  if (!aiUser) throw new Error("No AI user found")

  for (const term of terms) {
    console.log(`\n\n[TERM] ${term.term}`)

    const definitions = await db.query.definitionsTable.findMany({
      where: (def, { eq }) => eq(def.termId, term.id),
      orderBy: desc(definitionsTable.createdAt)
    })

    for (const definition of definitions) {
      const aiGenerated = definition.authorId === aiUser.id

      console.log(
        `=> Definition: ${definition.definition}\n   Example: ${definition.example}\n   AI Generated: ${aiGenerated}`
      )

      const [comments, edits, chats] = await Promise.all([
        db.query.commentsTable.findMany({
          where: (c, { eq }) => eq(c.definitionId, definition.id)
        }),
        db.query.editsTable.findMany({
          where: (e, { eq }) => eq(e.definitionId, definition.id)
        }),
        aiGenerated
          ? db.query.chatsTable.findMany({
              where: (c, { eq }) => eq(c.termId, definition.termId),
              orderBy: desc(chatsTable.createdAt)
            })
          : []
      ])

      const history = [
        ...comments.map((c) => ({
          ...c,
          createdAt: new Date(
            new Date(c.createdAt).getTime() - 4 * 60 * 60 * 1000
          ),
          type: "comment" as const
        })),
        ...edits.map((e) => ({
          ...e,
          createdAt: e.editedAt,
          type: "edit" as const
        })),
        ...chats.map((c) => ({
          ...c,
          type: "chat" as const,
          createdAt: new Date(
            new Date(c.createdAt).getTime() - 4 * 60 * 60 * 1000
          )
        }))
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      for (const item of history) {
        if (item.type == "comment") {
          console.log(`\t[${item.createdAt}] [COMMENT] ${item.message} `)
        } else if (item.type === "chat") {
          const safeMsg = item.message.replaceAll(/[\r\n]+/g, "")
          if (item.role === "user") {
            console.log(
              `\t[${item.createdAt}] [AI FEEDBACK] [${item.role.toUpperCase()}] ${safeMsg}`
            )
          } else {
            console.log(
              `\t[${item.createdAt}] [EDIT] New Definition: ${safeMsg}`
            )
          }
        } else {
          console.log(
            `\t[${item.createdAt}] [EDIT] Previous Definition: ${item.definition}`
          )
        }
      }
    }
  }
}

main()
