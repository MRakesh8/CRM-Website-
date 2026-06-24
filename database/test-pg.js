import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    const res = await pool.query('SELECT 1 as test');
    console.log('Success:', res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}
run();
