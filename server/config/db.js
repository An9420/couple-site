import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env') })

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'couple_site',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
})

// Test connection
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected successfully')
    conn.release()
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message)
    console.error('Make sure MySQL is running and the database exists.')
    console.error('Run: mysql -u root < server/schema.sql')
  })

export default pool
