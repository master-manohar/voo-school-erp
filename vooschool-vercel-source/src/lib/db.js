import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'srv1327.hstgr.io',
  user: 'u175452495_vooerpmanohar',
  password: 'Skn@123nch',
  database: 'u175452495_vooerpmanohar',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create the connection pool
const pool = mysql.createPool(dbConfig);

// Helper function to query the database easily
export async function query(sql, values) {
  try {
    const [results] = await pool.execute(sql, values);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export default pool;
