import { pool } from '../db.js';
import { Trainer } from '../models/Trainer.js';
import { getPokemonById } from './pokemons.js';

export async function createTrainer(name: string): Promise<Trainer> {
  const r = await pool.query('INSERT INTO trainers (name) VALUES ($1) RETURNING *', [name]);
  const row = r.rows[0];
  return new Trainer(row.id, row.name, row.level, row.experience);
}

export async function getAllTrainers(): Promise<Trainer[]> {
  const r = await pool.query('SELECT * FROM trainers ORDER BY id');
  const res: Trainer[] = [];
  for (const row of r.rows) {
    const t = new Trainer(row.id, row.name, row.level, row.experience);
    const pr = await pool.query('SELECT id FROM pokemons WHERE trainer_id=$1 ORDER BY id', [t.id]);
    for (const prow of pr.rows) {
      t.pokemons.push(await getPokemonById(prow.id));
    }
    res.push(t);
  }
  return res;
}

export async function getTrainerById(id: number): Promise<Trainer | null> {
  const r = await pool.query('SELECT * FROM trainers WHERE id=$1', [id]);
  if (r.rowCount === 0) return null;
  const row = r.rows[0];
  const t = new Trainer(row.id, row.name, row.level, row.experience);
  const pr = await pool.query('SELECT id FROM pokemons WHERE trainer_id=$1 ORDER BY id', [t.id]);
  for (const prow of pr.rows) {
    t.pokemons.push(await getPokemonById(prow.id));
  }
  return t;
}

export async function addExperience(trainerId: number, amount: number): Promise<void> {
  // Récupère l'état courant
  const r = await pool.query('SELECT level, experience FROM trainers WHERE id=$1', [trainerId]);
  if (r.rowCount === 0) throw new Error('Trainer not found');
  let { level, experience } = r.rows[0];
  level = Number(level);
  experience = Number(experience) + amount;
  while (experience >= 10) {
    level += 1;
    experience -= 10;
  }
  await pool.query('UPDATE trainers SET level=$1, experience=$2 WHERE id=$3', [level, experience, trainerId]);
}
