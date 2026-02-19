import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

async function main() {
  const email = 'admin@lifeos.com';
  const client = await pool.connect();

  try {
    const res = await client.query('SELECT * FROM "User" WHERE email = $1', [email]);
    if (res.rows.length > 0) {
      console.log('Admin user already exists');
    } else {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const user = await client.query(
        'INSERT INTO "User" (email, password, name, "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id',
        [email, hashedPassword, 'Admin User']
      );
      console.log(`Created admin user with id: ${user.rows[0].id}`);
    }
  } catch (e) {
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
