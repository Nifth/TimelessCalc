import type { AlternatePassiveSkill } from '../Data/Models/AlternatePassiveSkill';
import { AlternatePassiveAdditionInformation } from './AlternatePassiveAdditionInformation';

export class AlternatePassiveSkillInformation {
  public readonly AlternatePassiveSkill: AlternatePassiveSkill;
  public readonly StatRolls: Readonly<Record<number, number>>;
  public readonly AlternatePassiveAdditionInformations: readonly AlternatePassiveAdditionInformation[];

  constructor(
    alternatePassiveSkill: AlternatePassiveSkill,
    statRolls: Record<number, number>,
    alternatePassiveAdditionInformations: readonly AlternatePassiveAdditionInformation[]
  ) {
    if (!alternatePassiveSkill) {
      throw new Error('alternatePassiveSkill is required');
    }
    if (!statRolls) {
      throw new Error('statRolls is required');
    }
    if (!alternatePassiveAdditionInformations) {
      throw new Error('alternatePassiveAdditionInformations is required');
    }

    this.AlternatePassiveSkill = alternatePassiveSkill;
    this.StatRolls = Object.freeze({ ...statRolls });
    this.AlternatePassiveAdditionInformations = Object.freeze([...alternatePassiveAdditionInformations]);
  }
}
