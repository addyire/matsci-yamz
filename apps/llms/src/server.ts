import express from 'express'
import { db, usersTable } from '@yamz/db'

const app = express()
// eslint-disable-next-line turbo/no-undeclared-env-vars
const port = process.env.PORT || 3001

app.get('/', async (_req, res) => {
  const users = await db.select().from(usersTable).limit(1)
  res.json({ message: 'Hello World!', users })
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
