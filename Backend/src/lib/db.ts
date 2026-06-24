import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle PostgreSQL client:', err);
    process.exit(-1);
});

/**
 * Convenience wrapper around pool.query().
 * Usage: const { rows } = await query('SELECT * FROM ...', [param1]);
 */
export async function query(text: string, params?: unknown[]) {
    return pool.query(text, params);
}

export default pool;
