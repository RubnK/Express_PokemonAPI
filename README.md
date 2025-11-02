# Express_PokemonAPI — mini projet TypeScript + Express

Projet backend d'API Express implémentant un système de jeu Pokémon simplifié. Le projet met l'accent sur la programmation orientée objet (POO) via des classes `Attack`, `Pokemon` et `Trainer`.

Auteur : [@RubnK](https://github.com/RubnK)

## Table des matières
- [Fonctionnalités](#fonctionnalites)
- [Technos](#technos)
- [Structure du projet](#structure-du-projet)
- [Endpoints principaux](#endpoints-principaux)
- [Base de données (PostgreSQL)](#base-de-donnees-postgresql)
- [Installation & exécution](#installation--exécution)
- [Démonstration rapide](#demonstration-rapide)
- [Notes pour la soutenance](#notes-pour-la-soutenance)

---

## Fonctionnalités

- Gestion des attaques : nom, dégâts, limite d'usage (usageLimit) et compteur d'usage.
- Gestion des pokémons : nom, PV (lifePoint / maxLifePoint), liste d'attaques (max 4, pas de doublons).
- Gestion des dresseurs : nom, niveau, expérience, collection de pokémons.
- Actions : apprendre une attaque, soigner (taverne), attaquer aléatoirement, gagner de l'expérience.
- Modes de combat fournis : défi aléatoire, défi déterministe, Arène 1 (100 combats aléatoires), Arène 2 (100 combats déterministes).

## Technos

- Node.js
- TypeScript
- Express
- PostgreSQL

## Structure du projet

```
/src
  /models       # classes POO : Attack, Pokemon, Trainer
  /services     # fonctions d'accès à la BD (attacks/pokemons/trainers)
  db.ts         # configuration du pool Postgres
  server.ts     # serveur Express + routes
db.sql          # schéma et données exemples
package.json
tsconfig.json
README.md
```

## Endpoints principaux

Tous les endpoints attendent/renvoient du JSON.

- GET /health
- POST /attacks  -> { name, damage, usageLimit }
- GET  /attacks
- POST /pokemons -> { name, lifePoint, maxLifePoint, attacksIds? }
- GET  /pokemons
- POST /trainers -> { name }
- GET  /trainers
- POST /trainers/:id/addPokemon -> { pokemonId }
- POST /trainers/:id/heal
- POST /combat/challenge       -> { trainerAId, trainerBId }  (défi aléatoire avec taverne)
- POST /combat/deterministic  -> { trainerAId, trainerBId }  (défi déterministe, pas de taverne)
- POST /arena/arena1          -> { trainerAId, trainerBId }  (100 combats aléatoires)
- POST /arena/arena2          -> { trainerAId, trainerBId }  (100 combats déterministes)

## Base de données (PostgreSQL)

Le fichier `db.sql` fourni contient le schéma minimal (tables `trainers`, `pokemons`, `attacks`, `pokemon_attacks`) et des INSERTs d'exemple. Pour initialiser la DB :

1. Créez la base PostgreSQL nommée 'pokemon'.

2. Importez le fichier db.sql dans la base de données nouvellement créée.

3. Configurez les variables d'environnement (fichier `.env`) :

```
PGHOST=localhost
PGPORT=5432
PGUSER=youruser
PGPASSWORD=yourpassword
PGDATABASE=pokemon_api
PORT=3000
```

## Installation & exécution

1. Installer les dépendances :

```powershell
npm install
```

2. Lancer en développement (TypeScript ESM via ts-node) :

```powershell
npm run dev
```

Le serveur écoute par défaut sur http://localhost:3000.

## Demonstration rapide

1. Créez quelques attaques : POST `/attacks` avec `{ "name":"Éclair", "damage":40, "usageLimit":15 }`.
2. Créez des pokémons en leur associant `attacksIds` (IDs renvoyés par `/attacks`).
3. Créez deux dresseurs et assignez-leur des pokémons.
4. Lancez POST `/combat/challenge` avec `{ "trainerAId":1, "trainerBId":2 }` pour voir un combat.

# Licence
Ce projet est distribué sous (licence MIT)[LICENSE].
