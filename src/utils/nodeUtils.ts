import type { Node } from "$lib/types";

export function findNodeBySkill(
  skill: number,
  nodes: Record<string, Node>,
): Node | null {
  const nodeId = Object.keys(nodes).find((k) => nodes[k].skill === skill);
  return nodeId ? nodes[nodeId] : null;
}

export function findNodeIdBySkill(
  skill: number,
  nodes: Record<string, Node>,
): string | null {
  const nodeId = Object.keys(nodes).find((k) => nodes[k].skill === skill);
  return nodeId || null;
}

export function getNodeWithFallback(
  skill: number,
  options: {
    allocated?: Map<string, Node>;
    canvasNodes?: Map<number, { node: Node }>;
    treeNodes?: Record<string, Node>;
  },
): Node | null {
  const { allocated, canvasNodes, treeNodes } = options;

  if (allocated) {
    const allocatedNode = allocated.get(skill.toString());
    if (allocatedNode) {
      return allocatedNode;
    }
  }

  if (canvasNodes) {
    const canvasNode = canvasNodes.get(skill)?.node;
    if (canvasNode) {
      return canvasNode;
    }
  }

  if (treeNodes) {
    return findNodeBySkill(skill, treeNodes);
  }

  return null;
}
