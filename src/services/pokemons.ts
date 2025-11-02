import { pool } from '../db.js';
import { Attack } from '../models/Attack.js';
import { Pokemon } from '../models/Pokemon.js';

export async function createPokemon(name: string, lifePoint: number, maxLifePoint: number, attacksIds?: number[]): Promise<Pokemon> {
  const r = await pool.query('INSERT INTO pokemons (name, life_point, max_life_point) VALUES ($1,$2,$3) RETURNING *', [name, lifePoint, maxLifePoint]);
  const row = r.rows[0];
  const p = new Pokemon(row.id, row.name, row.life_point, row.max_life_point);
  if (Array.isArray(attacksIds)) {
    for (const id of attacksIds) {
      await pool.query('INSERT INTO pokemon_attacks (pokemon_id, attack_id, current_uses) VALUES ($1,$2,0) ON CONFLICT (pokemon_id, attack_id) DO NOTHING', [p.id, id]);
    }
  }
  return await getPokemonById(p.id);
}

export async function getPokemonById(id: number): Promise<Pokemon> {
  const pr = await pool.query('SELECT * FROM pokemons WHERE id=$1', [id]);
  if (pr.rowCount === 0) throw new Error('Pokemon not found');
  const row = pr.rows[0];
  const p = new Pokemon(row.id, row.name, row.life_point, row.max_life_point);
  const ar = await pool.query(`SELECT a.id,a.name,a.damage,a.usage_limit, pa.current_uses
    FROM attacks a JOIN pokemon_attacks pa ON a.id=pa.attack_id WHERE pa.pokemon_id=$1`, [id]);
  for (const arow of ar.rows) {
    const at = new Attack(arow.id, arow.name, arow.damage, arow.usage_limit);
    p.attacks.push({ attack: at, currentUses: arow.current_uses });
  }
  return p;
}

export async function getAllPokemons(): Promise<Pokemon[]> {
  const r = await pool.query('SELECT * FROM pokemons ORDER BY id');
  const res: Pokemon[] = [];
  for (const row of r.rows) {
    res.push(await getPokemonById(row.id));
  }
  return res;
}

export async function assignPokemonToTrainer(pokemonId: number, trainerId: number): Promise<void> {
  await pool.query('UPDATE pokemons SET trainer_id=$1 WHERE id=$2', [trainerId, pokemonId]);
}

export async function healTrainerPokemons(trainerId: number): Promise<void> {
  await pool.query('UPDATE pokemons SET life_point = max_life_point WHERE trainer_id = $1', [trainerId]);
  await pool.query(`UPDATE pokemon_attacks SET current_uses = 0 WHERE pokemon_id IN (SELECT id FROM pokemons WHERE trainer_id = $1)`, [trainerId]);
}

export async function incrementAttackUse(pokemonId: number, attackId: number): Promise<void> {
  await pool.query('UPDATE pokemon_attacks SET current_uses = current_uses + 1 WHERE pokemon_id=$1 AND attack_id=$2', [pokemonId, attackId]);
}

export async function updatePokemonLife(pokemonId: number, newLife: number): Promise<void> {
  await pool.query('UPDATE pokemons SET life_point = $1 WHERE id=$2', [newLife, pokemonId]);
}

export async function addAttackToPokemon(pokemonId: number, attackId: number): Promise<void> {
  await pool.query('INSERT INTO pokemon_attacks (pokemon_id, attack_id, current_uses) VALUES ($1,$2,0) ON CONFLICT (pokemon_id, attack_id) DO NOTHING', [pokemonId, attackId]);
}
