import express from 'express';
import bodyParser from 'body-parser';
import { Attack } from './models/Attack.js';
import { Pokemon } from './models/Pokemon.js';
import { Trainer } from './models/Trainer.js';
import * as attacksSvc from './services/attacks.js';
import * as pokemonsSvc from './services/pokemons.js';
import * as trainersSvc from './services/trainers.js';

const app = express();
app.use(bodyParser.json());

// Persistance via les services (Postgres)

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/attacks', async (req, res) => {
  const { name, damage, usageLimit } = req.body;
  if (!name || typeof damage !== 'number' || typeof usageLimit !== 'number') return res.status(400).json({ error: 'Bad body' });
  try {
  const a = await attacksSvc.createAttack(name, damage, usageLimit);
    res.status(201).json(a);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/attacks', async (req, res) => {
  const a = await attacksSvc.getAllAttacks();
  res.json(a);
});

// Pokémons
app.post('/pokemons', async (req, res) => {
  const { name, lifePoint, maxLifePoint, attacksIds } = req.body;
  if (!name || typeof lifePoint !== 'number' || typeof maxLifePoint !== 'number') return res.status(400).json({ error: 'Bad body' });
  try {
  const p = await pokemonsSvc.createPokemon(name, lifePoint, maxLifePoint, attacksIds);
    res.status(201).json(p);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/pokemons', async (req, res) => {
  const p = await pokemonsSvc.getAllPokemons();
  res.json(p);
});

// Dresseurs
app.post('/trainers', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Bad body' });
  try {
  const t = await trainersSvc.createTrainer(name);
    res.status(201).json(t);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/trainers', async (req, res) => {
  const t = await trainersSvc.getAllTrainers();
  res.json(t);
});

app.post('/trainers/:id/addPokemon', async (req, res) => {
  const id = Number(req.params.id);
  const { pokemonId } = req.body;
  try {
  const t = await trainersSvc.getTrainerById(id);
  const p = await pokemonsSvc.getPokemonById(pokemonId);
    if (!t || !p) return res.status(404).json({ error: 'Not found' });
  await pokemonsSvc.assignPokemonToTrainer(p.id, t.id);
  const updated = await trainersSvc.getTrainerById(id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/trainers/:id/heal', async (req, res) => {
  const id = Number(req.params.id);
  try {
  const t = await trainersSvc.getTrainerById(id);
    if (!t) return res.status(404).json({ error: 'Not found' });
  await pokemonsSvc.healTrainerPokemons(id);
  const updated = await trainersSvc.getTrainerById(id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Fonctions utilitaires de combat
async function duel(p1: Pokemon, p2: Pokemon, trainerAId?: number, trainerBId?: number, persist = false) {
  // renvoie le journal et le gagnant (1 ou 2)
  const log: string[] = [];
  while (!p1.isFainted() && !p2.isFainted()) {
    const res1 = p1.strikeRandom(p2);
    log.push(res1.message);
    if (persist && res1.attackId) {
      try { await pokemonsSvc.incrementAttackUse(p1.id, res1.attackId); } catch (e) { /* ignore */ }
      try { await pokemonsSvc.updatePokemonLife(p2.id, p2.lifePoint); } catch (e) { /* ignore */ }
    }
    if (p2.isFainted()) break;
    const res2 = p2.strikeRandom(p1);
    log.push(res2.message);
    if (persist && res2.attackId) {
      try { await pokemonsSvc.incrementAttackUse(p2.id, res2.attackId); } catch (e) { /* ignore */ }
      try { await pokemonsSvc.updatePokemonLife(p1.id, p1.lifePoint); } catch (e) { /* ignore */ }
    }
  }
  const winner = p1.isFainted() ? 2 : 1;
  // attribuer de l'expérience au dresseur gagnant si demandé
  if (persist) {
    try {
      if (winner === 1 && trainerAId) await trainersSvc.addExperience(trainerAId, 1);
      else if (winner === 2 && trainerBId) await trainersSvc.addExperience(trainerBId, 1);
    } catch (e) { /* ignore */ }
  }
  return { winner, log };
}

async function randomChallenge(t1: Trainer, t2: Trainer, withTavern = true) {
  if (withTavern) { t1.healAll(); t2.healAll(); }
  const a = t1.pickRandomAlive();
  const b = t2.pickRandomAlive();
  if (!a || !b) return { error: 'No available Pokemon' };
  // clonage pour combat isolé (clone simple) — pas de persistance
  const ca = new Pokemon(a.id, a.name, a.lifePoint, a.maxLifePoint);
  const cb = new Pokemon(b.id, b.name, b.lifePoint, b.maxLifePoint);
  // copier les compteurs d'usage des attaques
  for (const at of a.attacks) ca.attacks.push({ attack: at.attack, currentUses: 0 });
  for (const at of b.attacks) cb.attacks.push({ attack: at.attack, currentUses: 0 });
  const result = await duel(ca, cb, undefined, undefined, false);
  return { result, challengerPokemon: a.name, opponentPokemon: b.name };
}

app.post('/combat/challenge', async (req, res) => {
  const { trainerAId, trainerBId } = req.body ?? {};
  try {
  const t1 = await trainersSvc.getTrainerById(trainerAId);
  const t2 = await trainersSvc.getTrainerById(trainerBId);
    if (!t1 || !t2) return res.status(404).json({ error: 'Trainer not found' });
  const r = await randomChallenge(t1, t2, true);
  res.json(r);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/combat/deterministic', async (req, res) => {
  const { trainerAId, trainerBId } = req.body ?? {};
  try {
  const t1 = await trainersSvc.getTrainerById(trainerAId);
  const t2 = await trainersSvc.getTrainerById(trainerBId);
    if (!t1 || !t2) return res.status(404).json({ error: 'Trainer not found' });
  // choisir le pokémon avec le plus de PV
    const a = t1.pickHighestHP();
    const b = t2.pickHighestHP();
    if (!a || !b) return res.status(400).json({ error: 'No available Pokemon' });
  // combattre de façon déterministe et persister les effets
    const result = await duel(a, b, t1.id, t2.id, true);
    res.json({ result, a: a.name, b: b.name });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Arène 1 : 100 combats aléatoires, comparer niveau/expérience
app.post('/arena/arena1', async (req, res) => {
  const { trainerAId, trainerBId } = req.body ?? {};
  try {
  const t1 = await trainersSvc.getTrainerById(trainerAId);
  const t2 = await trainersSvc.getTrainerById(trainerBId);
    if (!t1 || !t2) return res.status(404).json({ error: 'Trainer not found' });
    let scoreA = 0, scoreB = 0;
    for (let i = 0; i < 100; i++) {
      const r = randomChallenge(t1, t2, true);
      if ((r as any).result?.winner === 1) scoreA++; else if ((r as any).result?.winner === 2) scoreB++;
    }
    let winner = 'draw';
    if (scoreA > scoreB) winner = t1.name; else if (scoreB > scoreA) winner = t2.name; else {
      if (t1.level > t2.level) winner = t1.name; else if (t2.level > t1.level) winner = t2.name; else winner = t1.experience >= t2.experience ? t1.name : t2.name;
    }
    res.json({ scoreA, scoreB, winner });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Arène 2 : 100 combats déterministes, arrêt si un dresseur perd tous ses pokémons
app.post('/arena/arena2', async (req, res) => {
  const { trainerAId, trainerBId } = req.body ?? {};
  try {
  const t1 = await trainersSvc.getTrainerById(trainerAId);
  const t2 = await trainersSvc.getTrainerById(trainerBId);
    if (!t1 || !t2) return res.status(404).json({ error: 'Trainer not found' });
    for (let i = 0; i < 100; i++) {
      const a = t1.pickHighestHP();
      const b = t2.pickHighestHP();
      if (!a || !b) break;
      // combattre en persistant les effets directement
      const r = await duel(a, b, t1.id, t2.id, true);
      if (t1.pokemons.every((p: Pokemon) => p.isFainted()) || t2.pokemons.every((p: Pokemon) => p.isFainted())) break;
    }
    let winner = 'draw';
  if (t1.pokemons.some((p: Pokemon) => !p.isFainted()) && t2.pokemons.every((p: Pokemon) => p.isFainted())) winner = t1.name;
  else if (t2.pokemons.some((p: Pokemon) => !p.isFainted()) && t1.pokemons.every((p: Pokemon) => p.isFainted())) winner = t2.name;
    res.json({ winner });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

export {};
