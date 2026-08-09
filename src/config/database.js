import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';

const sql = neon(process.env.Database_URL, neonConfig());
const db = drizzle(sql);

export {db, sql};