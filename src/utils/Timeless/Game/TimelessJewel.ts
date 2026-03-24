import { AlternateTreeVersion } from '../Data/Models/AlternateTreeVersion';

export class TimelessJewel {
  public readonly AlternateTreeVersion: AlternateTreeVersion;
  public readonly Seed: number;

  constructor(alternateTreeVersion: AlternateTreeVersion, seed: number) {
    if (!alternateTreeVersion) {
      throw new Error('alternateTreeVersion is required');
    }

    this.AlternateTreeVersion = alternateTreeVersion;

    // Elegant Hubris (version 5) : seed /= 20
    this.Seed = alternateTreeVersion.Index === 5 ? Math.floor(seed / 20) : seed;
  }
}