export interface PassiveSkill {
  readonly skill: number;
  readonly name: string;
  readonly stats: readonly string[];
  readonly isBlight: boolean;
  readonly isJewelSocket: boolean;
  readonly isNotable: boolean;
  readonly isKeystone: boolean;
  readonly isMastery: boolean;
  readonly isProxy: boolean;
  readonly ascendancyName: string;
  readonly orbit: number | null;
}

export class PassiveSkillNode implements PassiveSkill {
  public readonly skill: number;
  public readonly name: string;
  public readonly stats: readonly string[];
  
  public readonly isBlight: boolean;
  public readonly isJewelSocket: boolean;
  public readonly isNotable: boolean;
  public readonly isKeystone: boolean;
  public readonly isMastery: boolean;
  public readonly isProxy: boolean;
  public readonly ascendancyName: string;
  public readonly orbit: number | null;

  constructor(data: PassiveSkill) {
    Object.assign(this, data);
  }

  get GraphIdentifier(): number { return this.skill; }

  get Name(): string { return this.name; }
  get IsBlight(): boolean { return this.isBlight; }
  get IsJewelSocket(): boolean { return this.isJewelSocket; }
  get IsNotable(): boolean { return this.isNotable; }
  get IsKeyStone(): boolean { return this.isKeystone; }
  get IsMastery(): boolean { return this.isMastery; }
  get IsProxy(): boolean { return this.isProxy; }

  get IsAscendancy(): boolean {
    return this.ascendancyName !== null && this.ascendancyName !== '' && this.ascendancyName !== undefined;
  }

  get IsCluster(): boolean {
    return this.orbit === null;
  }
  get StatStrings(): readonly string[] {
    return this.stats;
  }

  get IsAttribute(): boolean {
    return (
      this.StatStrings.length === 1 &&
      ['+10 to Strength', '+10 to Dexterity', '+10 to Intelligence'].includes(this.StatStrings[0])
    );
  }

  get IsModifiable(): boolean {
    return !(
      this.IsCluster ||
      this.IsAscendancy ||
      this.IsProxy ||
      this.IsMastery ||
      this.IsKeyStone ||
      this.IsJewelSocket ||
      this.IsBlight
    );
  }

  compareTo(other: PassiveSkillNode | null): number {
    if (other === null) return -1;
    return this.GraphIdentifier - other.GraphIdentifier;
  }
}
