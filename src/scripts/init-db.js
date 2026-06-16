// This script initializes the database tables required for Phase 1.
// You can run this locally with Node.js: node src/scripts/init-db.js

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: 'srv1327.hstgr.io',
  user: 'u175452495_vooerpmanohar',
  password: 'Skn@123nch',
  database: 'u175452495_vooerpmanohar',
};

async function initDB() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected!');

    // Create Users Table
    console.log('Creating users table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(15) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'teacher', 'parent') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if an admin exists
    const [rows] = await connection.execute('SELECT * FROM users WHERE role = "admin"');
    if (rows.length === 0) {
      console.log('No admin found. Creating default admin...');
      const defaultPassword = 'admin'; // VERY insecure default, must be changed!
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(defaultPassword, salt);
      
      await connection.execute(
        'INSERT INTO users (name, phone, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Super Admin', '9999999999', hash, 'admin']
      );
      console.log('Default admin created! Phone: 9999999999, Password: admin');
    } else {
      console.log('Admin user already exists.');
    }

    console.log('Database initialization complete!');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit();
  }
}

initDB();
