import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const defaultPersonas = [
  {
    name: 'Default Evaluator',
    description: 'General purpose listing evaluator',
    instruction:
      "You are an expert evaluator of online listings. Your goal is to determine if an item matches the user's search intent and if it represents a good value.",
    isDefault: true,
  },
  {
    name: 'Car Mechanic',
    description: 'Expert for car parts and restoration projects',
    instruction:
      'You are an expert car mechanic and parts trader specializing in Mercedes AMG, Porsche, and Jeep. Evaluate if the item fits the restoration project and if the price is competitive for the condition.',
    isDefault: false,
  },
  {
    name: 'Tech Enthusiast',
    description: 'Hardware compatibility and price/performance analyst',
    instruction:
      'You are a tech enthusiast and hardware expert. Evaluate components for compatibility, performance/price ratio, and condition.',
    isDefault: false,
  },
  {
    name: 'Reseller',
    description: 'Profit margin focused flipper',
    instruction:
      'You are a professional reseller looking for underpriced items to flip. Focus heavily on profit margin and market demand.',
    isDefault: false,
  },
];

async function main() {
  const email = 'admin@lifeos.com';
  const client = await pool.connect();
    
    // Seed Personas
    for (const p of defaultPersonas) {
      const existing = await client.query('SELECT * FROM "ExpertPersona" WHERE name = $1', [p.name]);
      if (existing.rows.length === 0) {
        await client.query(
          'INSERT INTO "ExpertPersona" (id, name, description, instruction, "isDefault", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())',
          [p.name, p.description, p.instruction, p.isDefault]
        );
        console.log(`Created persona: ${p.name}`);
      }
    }

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
