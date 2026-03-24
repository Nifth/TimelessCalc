import type { AlternatePassiveAddition } from '../Data/Models/AlternatePassiveAddition';

export class AlternatePassiveAdditionInformation {
  public readonly AlternatePassiveAddition: AlternatePassiveAddition;
  public readonly StatRolls: Readonly<Record<number, number>>;

  constructor(
    alternatePassiveAddition: AlternatePassiveAddition,
    statRolls: Record<number, number>
  ) {
    if (!alternatePassiveAddition) {
      throw new Error('alternatePassiveAddition is required');
    }

    this.AlternatePassiveAddition = alternatePassiveAddition;
    this.StatRolls = Object.freeze({ ...statRolls });
  }
}
