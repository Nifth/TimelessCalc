import { type AlternatePassiveAddition } from './Models/AlternatePassiveAddition';
import { type AlternatePassiveSkill } from './Models/AlternatePassiveSkill';
import { AlternateTreeVersion } from './Models/AlternateTreeVersion';
import { type PassiveSkill, PassiveSkillNode } from './Models/PassiveSkill';
import type { TreeDataFile } from './Models/TreeDataFile';
import { TimelessJewel } from '../Game/TimelessJewel';
import { GeneratorSettings } from '../GeneratorSettings';

export enum PassiveSkillType {
  None,
  SmallAttribute,
  SmallNormal,
  Notable,
  KeyStone,
  JewelSocket
}

export class DataManager {
  private static _alternatePassiveAdditions: readonly AlternatePassiveAddition[] | null = null;
  private static _alternatePassiveSkills: readonly AlternatePassiveSkill[] | null = null;
  private static _alternateTreeVersions: readonly AlternateTreeVersion[] | null = null;
  private static _passiveSkills: readonly PassiveSkillNode[] | null = null;

  public static get AlternatePassiveAdditions(): readonly AlternatePassiveAddition[] | null {
    return this._alternatePassiveAdditions;
  }

  public static get AlternatePassiveSkills(): readonly AlternatePassiveSkill[] | null {
    return this._alternatePassiveSkills;
  }

  public static get AlternateTreeVersions(): readonly AlternateTreeVersion[] | null {
    return this._alternateTreeVersions;
  }

  public static get PassiveSkills(): readonly PassiveSkillNode[] | null {
    return this._passiveSkills;
  }

  public static Initialize(): boolean {
    this._alternatePassiveAdditions = this.freeze<AlternatePassiveAddition>(
      GeneratorSettings.AlternatePassiveAdditions
    );
    this._alternatePassiveSkills = this.freeze<AlternatePassiveSkill>(
      GeneratorSettings.AlternatePassiveSkills
    );
    this._alternateTreeVersions = this.getAlternateTrees();

    const treeData = GeneratorSettings.PassiveSkills as TreeDataFile;
    if (!treeData) {
      this._passiveSkills = null;
    } else {
      const { root: _, ...nodes } = treeData.nodes;
      this._passiveSkills = Object.values(nodes).map(raw => new PassiveSkillNode(raw as PassiveSkill));
    }

    return !!(
      this._alternatePassiveAdditions &&
      this._alternatePassiveSkills &&
      this._alternateTreeVersions &&
      this._passiveSkills
    );
  }

  private static getAlternateTrees(): readonly AlternateTreeVersion[] {
    return [
      new AlternateTreeVersion(1),
      new AlternateTreeVersion(2),
      new AlternateTreeVersion(3),
      new AlternateTreeVersion(4),
      new AlternateTreeVersion(5),
      new AlternateTreeVersion(6),
    ];
  }

  public static GetApplicableAlternatePassiveAdditions(
    passiveSkill: PassiveSkillNode,
    timelessJewel: TimelessJewel
  ): AlternatePassiveAddition[] {
    if (!passiveSkill) throw new Error('passiveSkill is required');
    if (!timelessJewel) throw new Error('timelessJewel is required');

    const result: AlternatePassiveAddition[] = [];

    for (const addition of this._alternatePassiveAdditions ?? []) {
      const type = this.GetPassiveSkillType(passiveSkill);

      if (
        addition.AlternateTreeVersionsKey !== timelessJewel.AlternateTreeVersion.Index ||
        !addition.PassiveType.includes(type as unknown as number)
      ) {
        continue;
      }

      result.push(addition);
    }

    return result;
  }

  public static GetAlternatePassiveSkillKeyStone(timelessJewel: TimelessJewel): AlternatePassiveSkill | null {
    if (!timelessJewel) throw new Error('timelessJewel is required');

    const candidate = (this._alternatePassiveSkills ?? []).find(
      (s) => s.AlternateTreeVersionsKey === timelessJewel.AlternateTreeVersion.Index
    );

    if (
      !candidate ||
      !candidate.PassiveType.includes(PassiveSkillType.KeyStone as unknown as number)
    ) {
      return null;
    }

    return candidate;
  }

  public static GetApplicableAlternatePassiveSkills(
    passiveSkill: PassiveSkillNode,
    timelessJewel: TimelessJewel
  ): AlternatePassiveSkill[] {
    if (!passiveSkill) throw new Error('passiveSkill is required');
    if (!timelessJewel) throw new Error('timelessJewel is required');

    const result: AlternatePassiveSkill[] = [];

    for (const skill of this._alternatePassiveSkills ?? []) {
      const type = this.GetPassiveSkillType(passiveSkill);

      if (
        skill.AlternateTreeVersionsKey !== timelessJewel.AlternateTreeVersion.Index ||
        !skill.PassiveType.includes(type as unknown as number)
      ) {
        continue;
      }

      result.push(skill);
    }

    return result;
  }

  public static GetPassiveSkillType(passiveSkill: PassiveSkillNode): PassiveSkillType {
    if (!passiveSkill) throw new Error('passiveSkill is required');

    if (passiveSkill.IsJewelSocket) return PassiveSkillType.JewelSocket;
    if (passiveSkill.IsKeyStone) return PassiveSkillType.KeyStone;
    if (passiveSkill.IsNotable) return PassiveSkillType.Notable;
    if (passiveSkill.IsAttribute) return PassiveSkillType.SmallAttribute; // via getter
    return PassiveSkillType.SmallNormal;
  }

  private static freeze<T>(data: object): readonly T[] | null {
    return Object.freeze(data as T[]);
  }
}
