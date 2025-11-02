import { Attack } from './Attack.js';


export class Pokemon {
public attacks: { attack: Attack; currentUses: number }[] = [];


constructor(
public id: number,
public name: string,
public lifePoint: number,
public maxLifePoint: number
) {}


learnAttack(attack: Attack) {
if (this.attacks.length >= 4) throw new Error('Max 4 attaques');
if (this.attacks.some(a => a.attack.id === attack.id)) throw new Error('Pas de doublons');
this.attacks.push({ attack, currentUses: 0 });
}


heal() {
this.lifePoint = this.maxLifePoint;
this.attacks = this.attacks.map(a => ({ ...a, currentUses: 0 }));
}


isFainted(): boolean { return this.lifePoint <= 0; }


// Choisit une attaque aléatoire parmi celles qui ont des PP restants et l'utilise contre la cible.
// Retourne un objet contenant le message et l'ID de l'attaque utilisée (si une attaque a été choisie).
strikeRandom(target: Pokemon): { message: string; attackId?: number } {
	const usable = this.attacks.filter(a => a.currentUses < a.attack.usageLimit);
	if (usable.length === 0) return { message: `${this.name} n'a plus de PP !` };
	const chosen = usable[Math.floor(Math.random() * usable.length)];
	chosen.currentUses += 1;
	target.lifePoint = Math.max(0, target.lifePoint - chosen.attack.damage);
	return { message: `${this.name} a utilisé ${chosen.attack.name} ! ${target.name} a ${target.lifePoint}/${target.maxLifePoint} PV restants.`, attackId: chosen.attack.id };
}
}