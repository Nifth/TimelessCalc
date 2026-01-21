import type { Node } from "$lib/types";

/**
 * Internal helper: Find node ID by skill number.
 */
function findNodeIdInternal(
  skill: number,
  nodes: Record<string, Node>,
): string | null {
  return Object.keys(nodes).find((k) => nodes[k].skill === skill) || null;
}

export function findNodeBySkill(
  skill: number,
  nodes: Record<string, Node>,
): Node | null {
  const nodeId = findNodeIdInternal(skill, nodes);
  return nodeId ? nodes[nodeId] : null;
}

export function findNodeIdBySkill(
  skill: number,
  nodes: Record<string, Node>,
): string | null {
  return findNodeIdInternal(skill, nodes);
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
