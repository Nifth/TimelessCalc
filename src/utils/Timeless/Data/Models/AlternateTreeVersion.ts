export class AlternateTreeVersion {
  public readonly Index: number;

  constructor(index: number) {
    this.Index = index;
  }

  public get AreSmallAttributePassiveSkillsReplaced(): boolean {
    return this.Index === 1 || this.Index === 4 || this.Index === 5;
  }

  public get AreSmallNormalPassiveSkillsReplaced(): boolean {
    return this.Index === 1 || this.Index === 5;
  }

  public get MinimumAdditions(): number {
    return this.Index >= 2 && this.Index <= 4 ? 1 : 0;
  }

  public get MaximumAdditions(): number {
    return this.MinimumAdditions; // identique dans toutes les versions
  }

  public get NotableReplacementSpawnWeight(): number {
    switch (this.Index) {
      case 1: return 100;
      case 4: return 20;
      case 5: return 100;
      case 6: return 100;
      default: return 0;
    }
  }
}
