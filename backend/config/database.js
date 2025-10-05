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

// Create tables if they don't exist
const createTables = async () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createAdminsTable = `
    CREATE TABLE IF NOT EXISTS admins (
      admin_id SERIAL PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createMembersTable = `
    CREATE TABLE IF NOT EXISTS members (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(user_id),
      family_share VARCHAR(100),
      name VARCHAR(100) NOT NULL,
      address TEXT,
      email VARCHAR(100),
      mobile_no VARCHAR(15),
      service_address TEXT,
      current_city VARCHAR(100),
      current_state VARCHAR(100),
      current_address TEXT,
      age INTEGER,
      swa_gotra VARCHAR(100),
      mame_gotra VARCHAR(100),
      home_town_address TEXT,
      qualification VARCHAR(100),
      specialization VARCHAR(150),
      other_info TEXT,
      profile_image VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    const client = await pool.connect();
    
    await client.query(createUsersTable);
    await client.query(createAdminsTable);
    await client.query(createMembersTable);
    
    console.log('✅ Database tables created successfully');
    client.release();
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  }
};

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
      
      // Create tables after successful connection
      await createTables();
      
      return true;
    } catch (error) {
      retries--;
      console.error(`❌ Database connection failed (${3-retries}/3):`, error.message);
      
      if (retries === 0) {
        console.error('🔍 Troubleshooting tips:');
        console.error('   - Check your DATABASE_URL in .env file');
        console.error('   - Ensure Render PostgreSQL service is running');
        console.error('   - Verify SSL connection is allowed');
        console.error('   - Check network connectivity');
        return false;
      }
      
      console.log(`🔄 Retrying connection in 2 seconds... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

module.exports = { pool, testConnection, createTables };
