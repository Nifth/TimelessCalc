import type { TreeData, Node } from "$lib/types";

export function getSocketNodeIds(
  socketSkill: string | number,
  treeData: TreeData
): number[] {
  const socketNodes = treeData.socketNodes[socketSkill.toString()];
  if (!socketNodes) return [];

  return socketNodes.map((id: string) => parseInt(id, 10));
}

export function getOptimalEncodingType(
  socketNodes: number[],
  allocatedSkills: number[]
): "allocated" | "unallocated" {
  const unallocatedCount = socketNodes.length - allocatedSkills.length;
  
  return allocatedSkills.length <= unallocatedCount
    ? "allocated"
    : "unallocated";
}

export function prepareNodeListForEncoding(
  socketNodes: number[],
  allocatedSkills: number[]
): { list: number[]; param: "a" | "un" } {
  const encodingType = getOptimalEncodingType(socketNodes, allocatedSkills);

  if (encodingType === "unallocated") {
    const unallocated = socketNodes.filter(
      (skill) => !allocatedSkills.includes(skill)
    );
    return { list: unallocated, param: "un" };
  } else {
    return { list: allocatedSkills, param: "a" };
  }
}

export function reconstructAllocatedNodes(
  socketSkill: string | number,
  allocatedSkills: number[] | null,
  unallocatedSkills: number[] | null,
  treeData: TreeData
): Map<string, Node> {
  const socketNodes = getSocketNodeIds(socketSkill, treeData);
  const allocated = new Map<string, Node>();

  let finalAllocated: number[] = [];

  if (allocatedSkills) {
    finalAllocated = allocatedSkills;
  } else if (unallocatedSkills) {
    finalAllocated = socketNodes.filter(
      (skill) => !unallocatedSkills.includes(skill)
    );
  }

  finalAllocated.forEach((skill) => {
    const node = treeData.nodes[skill.toString()];
    if (node) {
      allocated.set(node.skill.toString(), node);
    }
  });

  return allocated;
}
