import mysql from 'mysql2/promise'

// TiDB Cloud / MySQL connection
// Supports DATABASE_URL or individual env vars
const pool = mysql.createPool(
  process.env.DATABASE_URL
    ? { uri: process.env.DATABASE_URL, charset: 'utf8mb4', waitForConnections: true, connectionLimit: 5 }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 4000,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'couple_site',
        charset: 'utf8mb4',
        waitForConnections: true,
        connectionLimit: 5,
        // TiDB Cloud requires SSL
        ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false }
      }
)

// Test on startup (non-blocking)
pool.getConnection()
  .then(conn => { console.log('✅ DB connected'); conn.release() })
  .catch(err => console.error('❌ DB connect failed:', err.message))

export default pool
