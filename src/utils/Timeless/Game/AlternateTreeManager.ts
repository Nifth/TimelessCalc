import { DataManager, PassiveSkillType } from '../Data/DataManager';
import type { AlternatePassiveAddition } from '../Data/Models/AlternatePassiveAddition';
import type { AlternatePassiveSkill } from '../Data/Models/AlternatePassiveSkill';
import { PassiveSkillNode } from '../Data/Models/PassiveSkill';
import { TimelessJewel } from './TimelessJewel';
import { RandomNumberGenerator } from '../Random/RandomNumberGenerator';
import { AlternatePassiveSkillInformation } from './AlternatePassiveSkillInformation';
import { AlternatePassiveAdditionInformation } from './AlternatePassiveAdditionInformation';

export class AlternateTreeManager {
  public readonly PassiveSkill: PassiveSkillNode;
  public readonly TimelessJewel: TimelessJewel;

  constructor(passiveSkill: PassiveSkillNode, timelessJewel: TimelessJewel) {
    if (!passiveSkill) throw new Error('passiveSkill is required');
    if (!timelessJewel) throw new Error('timelessJewel is required');
    this.PassiveSkill = passiveSkill;
    this.TimelessJewel = timelessJewel;
  }

  public IsPassiveSkillReplaced(): boolean {
    if (this.PassiveSkill.IsKeyStone) return true;

    if (this.PassiveSkill.IsNotable) {
      const spawnWeight = this.TimelessJewel.AlternateTreeVersion.NotableReplacementSpawnWeight;
      if (spawnWeight >= 100) return true;

      const rng = new RandomNumberGenerator(this.PassiveSkill, this.TimelessJewel);
      const roll = rng.generateRange(0, 100); // [0, 100] inclusive → 101 values
      return roll < spawnWeight;
    }

    const type = DataManager.GetPassiveSkillType(this.PassiveSkill);
    if (type === PassiveSkillType.SmallAttribute) {
      return this.TimelessJewel.AlternateTreeVersion.AreSmallAttributePassiveSkillsReplaced;
    }

    return this.TimelessJewel.AlternateTreeVersion.AreSmallNormalPassiveSkillsReplaced;
  }

  public ReplacePassiveSkill(): AlternatePassiveSkillInformation {
    // --- Keystone ---
    if (this.PassiveSkill.IsKeyStone) {
      const keystone = DataManager.GetAlternatePassiveSkillKeyStone(this.TimelessJewel);
      const statRolls: Record<number, number> = { 0: keystone.Stat1Min };
      return new AlternatePassiveSkillInformation(keystone, statRolls, []);
    }

    // --- Normal replacement ---
    const applicable = DataManager.GetApplicableAlternatePassiveSkills(this.PassiveSkill, this.TimelessJewel);
    let rolledSkill: AlternatePassiveSkill | null = null;
    const rng = new RandomNumberGenerator(this.PassiveSkill, this.TimelessJewel);

    // Dummy roll for notables
    if (DataManager.GetPassiveSkillType(this.PassiveSkill) === PassiveSkillType.Notable) {
      rng.generateRange(0, 100);
    }

    let currentSpawnWeight = 0;
    for (const skill of applicable) {
      currentSpawnWeight += skill.SpawnWeight;
      const roll = rng.generate(currentSpawnWeight);
      if (roll < skill.SpawnWeight) {
        rolledSkill = skill;
      }
    }

    if (!rolledSkill) throw new Error('Failed to roll replacement skill');

    // --- Stat rolls ---
    const statRanges: Record<number, { min: number; max: number }> = {
      0: { min: rolledSkill.Stat1Min, max: rolledSkill.Stat1Max },
      1: { min: rolledSkill.Stat2Min, max: rolledSkill.Stat2Max },
      2: { min: rolledSkill.Unknown10, max: rolledSkill.Unknown11 },
      3: { min: rolledSkill.Unknown12, max: rolledSkill.Unknown13 },
    };

    const statRolls: Record<number, number> = {};
    for (let i = 0; i < Math.min(rolledSkill.StatsKeys.length, 4); i++) {
      const { min, max } = statRanges[i];
      let value = min;
      if (max > min) {
        value = rng.generateRange(min, max);
      }
      statRolls[i] = value;
    }

    // --- Additions ---
    const minAdd = this.TimelessJewel.AlternateTreeVersion.MinimumAdditions + rolledSkill.RandomMin;
    const maxAdd = this.TimelessJewel.AlternateTreeVersion.MaximumAdditions + rolledSkill.RandomMax;
    let addCount = minAdd;
    if (maxAdd > minAdd) {
      addCount = rng.generateRange(minAdd, maxAdd);
    }

    const additions: AlternatePassiveAdditionInformation[] = [];
    for (let i = 0; i < addCount; i++) {
      let rolledAddition: AlternatePassiveAddition | null = null;
      while (!rolledAddition) {
        rolledAddition = this.RollAlternatePassiveAddition(rng);
      }

      const addRanges: Record<number, { min: number; max: number }> = {
        0: { min: rolledAddition.Stat1Min, max: rolledAddition.Stat1Max },
        1: { min: rolledAddition.Stat2Min, max: rolledAddition.Stat2Max },
      };

      const addRolls: Record<number, number> = {};
      for (let j = 0; j < Math.min(rolledAddition.StatsKeys.length, 2); j++) {
        const { min, max } = addRanges[j];
        let value = min;
        if (max > min) {
          value = rng.generateRange(min, max);
        }
        addRolls[j] = value;
      }

      additions.push(new AlternatePassiveAdditionInformation(rolledAddition, addRolls));
    }

    return new AlternatePassiveSkillInformation(rolledSkill, statRolls, additions);
  }

  public AugmentPassiveSkill(): readonly AlternatePassiveAdditionInformation[] {
    const rng = new RandomNumberGenerator(this.PassiveSkill, this.TimelessJewel);

    // Dummy roll for notables
    if (DataManager.GetPassiveSkillType(this.PassiveSkill) === PassiveSkillType.Notable) {
      rng.generateRange(0, 100);
    }

    const minAdd = this.TimelessJewel.AlternateTreeVersion.MinimumAdditions;
    const maxAdd = this.TimelessJewel.AlternateTreeVersion.MaximumAdditions;
    let addCount = minAdd;
    if (maxAdd > minAdd) {
      addCount = rng.generateRange(minAdd, maxAdd);
    }

    const additions: AlternatePassiveAdditionInformation[] = [];
    for (let i = 0; i < addCount; i++) {
      let rolledAddition: AlternatePassiveAddition | null = null;
      while (!rolledAddition) {
        rolledAddition = this.RollAlternatePassiveAddition(rng);
      }

      const addRanges: Record<number, { min: number; max: number }> = {
        0: { min: rolledAddition.Stat1Min, max: rolledAddition.Stat1Max },
        1: { min: rolledAddition.Stat2Min, max: rolledAddition.Stat2Max },
      };

      const addRolls: Record<number, number> = {};
      for (let j = 0; j < Math.min(rolledAddition.StatsKeys.length, 2); j++) {
        const { min, max } = addRanges[j];
        let value = min;
        if (max > min) {
          value = rng.generateRange(min, max);
        }
        addRolls[j] = value;
      }

      additions.push(new AlternatePassiveAdditionInformation(rolledAddition, addRolls));
    }

    return Object.freeze(additions);
  }

  private RollAlternatePassiveAddition(rng: RandomNumberGenerator): AlternatePassiveAddition | null {
    if (!rng) throw new Error('rng is required');

    const applicable = DataManager.GetApplicableAlternatePassiveAdditions(this.PassiveSkill, this.TimelessJewel);
    const totalSpawnWeight = applicable.reduce((sum, a) => sum + a.SpawnWeight, 0);
    if (totalSpawnWeight === 0) return null;

    const roll = rng.generate(totalSpawnWeight);
    let current = roll;

    for (const addition of applicable) {
      if (addition.SpawnWeight > current) {
        return addition;
      }
      current -= addition.SpawnWeight;
    }

    return null;
  }
}