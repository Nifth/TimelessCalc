import type { Node, TreeData, Stat } from "$lib/types";

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function formatStats(stats: Stat[]): string {
  const selectedStats = stats.filter((stat) => !stat.exclude);
  if (selectedStats.length === 0) return "No stats";
  if (selectedStats.length === 1) return selectedStats[0].label;
  if (selectedStats.length === 2)
    return `${selectedStats[0].label}, ${selectedStats[1].label}`;
  return `${selectedStats[0].label}, ${selectedStats[1].label} (+${selectedStats.length - 2} more)`;
}

export function formatExcludedStats(stats: Stat[]): string {
  const excludedStats = stats.filter((stat) => stat.exclude);
  if (excludedStats.length === 0) return "";
  if (excludedStats.length === 1) return `excluded: ${excludedStats[0].label}`;
  if (excludedStats.length === 2)
    return `excluded: ${excludedStats[0].label}, ${excludedStats[1].label}`;
  return `excluded: ${excludedStats[0].label}, ${excludedStats[1].label} (+${excludedStats.length - 2} more)`;
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
