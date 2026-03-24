import { PassiveSkillNode } from './PassiveSkill';

export interface TreeDataFile {
  readonly nodes: Readonly<Record<string, PassiveSkillNode>>;
}
