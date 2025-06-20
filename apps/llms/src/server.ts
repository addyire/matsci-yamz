import express from 'express'
import { Ollama } from 'ollama'
import { db, usersTable } from '@yamz/db'
import zodToJsonSchema from 'zod-to-json-schema'
import { DefinitionOutput } from './outputs'

const app = express()
const ollama = new Ollama()
// eslint-disable-next-line turbo/no-undeclared-env-vars
const port = process.env.PORT || 3001

app.get('/', async (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.write('Loading model...\n\n')

  const ai = await ollama.chat({
    model: 'gemma3',
    messages: [{ role: 'user', content: 'Define: melt\n\nExample: The metal will melt at 400 degrees.' }],
    format: zodToJsonSchema(DefinitionOutput),
    keep_alive: 0,
    stream: true
  })

  for await (const part of ai) {
    console.log('got part', part)
    res.write(part.message.content)
  }

  res.end()
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
