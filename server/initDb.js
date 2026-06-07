import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function init() {
  // Connect without database first to create it
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    multipleStatements: true
  })

  console.log('📦 Creating database couple_site...')
  await conn.query('CREATE DATABASE IF NOT EXISTS couple_site CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci')
  await conn.query('USE couple_site')

  console.log('📋 Executing schema...')
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8')
  // Remove the CREATE DATABASE + USE lines since we handled them
  const cleanSchema = schema
    .replace(/CREATE DATABASE.*?;\n/gs, '')
    .replace(/USE couple_site;\n/g, '')

  await conn.query(cleanSchema)

  // Pre-seed default password: 123456
  const DEFAULT_PASSWORD = '123456'
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10)
  await conn.query('UPDATE couple_info SET password_hash = ? WHERE id = 1 AND password_hash IS NULL', [hash])
  console.log('🔑 Default password set: 123456')

  await conn.end()

  console.log('✅ Database initialized!')
  console.log('   Run: node server/index.js  to start the API')

  // Verify
  const verifyConn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'couple_site'
  })
  const [tables] = await verifyConn.query('SHOW TABLES')
  console.log('   Tables:', tables.map(t => Object.values(t)[0]).join(', '))
  await verifyConn.end()
}

init().catch(err => {
  console.error('❌', err.message)
  process.exit(1)
})
