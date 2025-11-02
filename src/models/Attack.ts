export class Attack {
constructor(
public id: number,
public name: string,
public damage: number,
public usageLimit: number
) {}


toReadable(): string {
return `${this.name} - ${this.damage} dégâts (max ${this.usageLimit})`;
}
}