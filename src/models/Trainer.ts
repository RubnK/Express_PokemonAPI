import { Pokemon } from './Pokemon.js';


export class Trainer {
public pokemons: Pokemon[] = [];


constructor(
public id: number,
public name: string,
public level: number = 1,
public experience: number = 0
) {}


addPokemon(p: Pokemon) { this.pokemons.push(p); }
healAll() { this.pokemons.forEach(p => p.heal()); }


gainExp(amount: number) {
this.experience += amount;
while (this.experience >= 10) {
this.level += 1;
this.experience -= 10;
}
}


pickRandomAlive(): Pokemon | null {
const alive = this.pokemons.filter(p => !p.isFainted());
if (alive.length === 0) return null;
return alive[Math.floor(Math.random() * alive.length)];
}


pickHighestHP(): Pokemon | null {
const alive = this.pokemons.filter(p => !p.isFainted());
if (alive.length === 0) return null;
return alive.sort((a,b) => b.lifePoint - a.lifePoint)[0];
}
}