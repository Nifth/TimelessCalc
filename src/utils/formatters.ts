import type { Node, TreeData, Stat } from "$lib/types";

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function formatStats(stats: Stat[]): string {
  if (stats.length === 0) return "No stats";
  if (stats.length === 1) return stats[0].label;
  if (stats.length === 2) return `${stats[0].label}, ${stats[1].label}`;
  return `${stats[0].label}, ${stats[1].label} (+${stats.length - 2} more)`;
}

export function findNearbyKeystone(
  socket: Node,
  treeNodes: Record<string, Node>,
  treeData: TreeData,
): string {
  const socketNodes = treeData.socketNodes[socket.skill.toString()];

  if (!socketNodes) {
    return socket.name;
  }

  for (const nodeId of socketNodes) {
    const node = treeNodes[nodeId];
    if (node && node.isKeystone) {
      return node.name;
    }
  }

  for (const nodeId of socketNodes) {
    const node = treeNodes[nodeId];
    if (node && node.isNotable) {
      return node.name;
    }
  }

  for (const nodeId of socketNodes) {
    const node = treeNodes[nodeId];
    if (
      node &&
      node.name &&
      node.name !== "Basic Jewel Socket" &&
      !node.name.includes("Jewel Socket")
    ) {
      return node.name;
    }
  }

  return socket.name;
}
