import type { Node } from "$lib/types";

export type SkillIndex = Map<number, string>;

export function buildSkillIndex(nodes: Record<string, Node>): SkillIndex {
  const index = new Map<number, string>();
  for (const [key, node] of Object.entries(nodes)) {
    index.set(node.skill, key);
  }
  return index;
}

export function findNodeBySkill(
  skill: number,
  nodes: Record<string, Node>,
  index?: SkillIndex,
): Node | null {
  const nodeId = (index ?? buildSkillIndex(nodes)).get(skill);
  return nodeId ? nodes[nodeId] : null;
}

export function findNodeIdBySkill(
  skill: number,
  nodes: Record<string, Node>,
  index?: SkillIndex,
): string | null {
  return (index ?? buildSkillIndex(nodes)).get(skill) ?? null;
}
