const { Pool } = require('pg');
require('dotenv').config();

// Database configuration for PostgreSQL
const dbConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false, require: true }
        : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 60000, // Increased for production
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'mavs',
      port: process.env.DB_PORT || 5432,
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false, require: true }
        : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 60000,
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
    };

// Create connection pool
const pool = new Pool(dbConfig);

// Test database connection
const testConnection = async () => {
  let retries = 3;
  
  while (retries > 0) {
    try {
      const client = await pool.connect();
      console.log('✅ PostgreSQL Database connected successfully');
      
      // Test query
      const result = await client.query('SELECT NOW() as current_time');
      console.log(`📊 Database time: ${result.rows[0].current_time}`);
      console.log(`🔗 Connected via: ${process.env.DATABASE_URL ? 'DATABASE_URL' : 'Individual credentials'}`);
      
      client.release();
      return true;
    } catch (error) {
      retries--;
      console.error(`❌ Database connection failed (${3-retries}/3):`, error.message);
      
      if (retries === 0) {
        console.error('🔍 Troubleshooting tips:');
        console.error('   - Check your DATABASE_URL in .env file');
        console.error('   - Ensure Railway PostgreSQL service is running');
        console.error('   - Verify SSL connection is allowed');
        console.error('   - Check network connectivity');
        return false;
      }
      
      console.log(`🔄 Retrying connection in 2 seconds... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

module.exports = { pool, testConnection };
