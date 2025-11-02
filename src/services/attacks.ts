import { pool } from '../db.js';
import { Attack } from '../models/Attack.js';

export async function createAttack(name: string, damage: number, usageLimit: number): Promise<Attack> {
  const r = await pool.query('INSERT INTO attacks (name, damage, usage_limit) VALUES ($1,$2,$3) RETURNING *', [name, damage, usageLimit]);
  const row = r.rows[0];
  return new Attack(row.id, row.name, row.damage, row.usage_limit);
}

export async function getAllAttacks(): Promise<Attack[]> {
  const r = await pool.query('SELECT * FROM attacks ORDER BY id');
  return r.rows.map((row: any) => new Attack(row.id, row.name, row.damage, row.usage_limit));
}
