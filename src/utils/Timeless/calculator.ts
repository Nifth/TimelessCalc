import data from "./config/data.json" with { type: "json" };
import additions from "./config/alternatepassiveadditions.json" with { type: "json" }
import replacements from "./config/alternatepassiveskills.json" with { type: "json" }
import { GeneratorSettings } from "./GeneratorSettings";
import { DataManager } from "./Data/DataManager";
import { canvas } from "$lib/canvas/canvasContext";
import { TimelessJewel } from "./Game/TimelessJewel";
import { AlternateTreeManager } from "./Game/AlternateTreeManager";
import type { PassiveSkillNode } from "./Data/Models/PassiveSkill";

const isInitialized = false;
let modifiableNodeIds: number[] = [];
let socketNodeIds: string[] = [];

export async function calculateSeed(seed: number, jewelId: number) {
    await initializeSeedsCalculator();
    const version = DataManager.AlternateTreeVersions!.find(v => v.Index === jewelId);
    if (!version) throw new Error(`Version ${jewelId} not found`);
    const treeData = canvas.treeData;

    const nodes = jewelId === 1 ? DataManager.PassiveSkills!.filter(n => n.IsModifiable).filter(n => modifiableNodeIds.includes(n.GraphIdentifier))
        : DataManager.PassiveSkills!
            .filter(n => n.IsNotable && n.IsModifiable)
            .filter(n => modifiableNodeIds.includes(n.GraphIdentifier));
    const nodesBySocket: Record<string, typeof nodes> = {};

    socketNodeIds.forEach(socketNodeId => {
      const socketNodeIdsAsNumbers = treeData.socketNodes[socketNodeId].map((n: string) => Number(n));
      nodesBySocket[socketNodeId] = nodes.filter(n =>
        socketNodeIdsAsNumbers.includes(n.GraphIdentifier)
      );
    });

    const timelessJewel = new TimelessJewel(version, seed);
    
    return calculateModifications(timelessJewel, socketNodeIds, nodesBySocket);
}

function calculateModifications(timelessJewel: TimelessJewel, socketNodeIds: string[], nodesBySocket: Record<string, PassiveSkillNode[]>) {
    const socketModifications: Record<string, { r: Record<string, number[]>, a: Record<string, number[]>}> = {};
    for (const socketNodeId of socketNodeIds) {
      const socketNodes = nodesBySocket[socketNodeId];
      const replacedMap: Record<string, number[]> = {};
      const addedMap: Record<string, number[]> = {};

      for (const node of socketNodes) {
        const manager = new AlternateTreeManager(node, timelessJewel);
        const replaced = manager.IsPassiveSkillReplaced();

        if (replaced) {
          const res = manager.ReplacePassiveSkill();
          const stats: Record<string, number> = {};
          Object.values(res.StatRolls).forEach((roll, index) => {
            stats[res.AlternatePassiveSkill.StatsKeys[index]] = roll;
          });
          const key = res.AlternatePassiveSkill._rid + '-' + JSON.stringify(stats);
          if (!replacedMap[key]) {
            replacedMap[key] = [node.GraphIdentifier];
          } else {
            replacedMap[key].push(node.GraphIdentifier);
          }
        } else {
          const adds = manager.AugmentPassiveSkill();
          if (adds.length > 0) {
            const add = adds[0];
            const stats: Record<string, number> = {};
            Object.values(add.StatRolls).forEach((roll, index) => {
              stats[add.AlternatePassiveAddition.StatsKeys[index]] = roll;
            });
            const key = add.AlternatePassiveAddition._rid + '-' + JSON.stringify(stats);
            if (!addedMap[key]) {
              addedMap[key] = [node.GraphIdentifier];
            } else {
              addedMap[key].push(node.GraphIdentifier);
            }
          }
        }
      }

      const entry = { r: replacedMap, a: addedMap };
      socketModifications[socketNodeId] = entry;
    }
    return socketModifications;
}

async function initializeSeedsCalculator() {
    if (isInitialized) return;
    GeneratorSettings.AlternatePassiveAdditions = additions;
    GeneratorSettings.AlternatePassiveSkills = replacements;
    GeneratorSettings.PassiveSkills = data;

    if (!DataManager.Initialize()) {
        throw new Error('could not initialize seeds calculator');
    }
    const treeData = canvas.treeData;
    Object.values(treeData.socketNodes).forEach((node: string[]) => {
      modifiableNodeIds = [...modifiableNodeIds, ...node.map((n) => {return Number(n)})];
    })
    modifiableNodeIds = modifiableNodeIds.filter((item, index, arr) => {
      return arr.indexOf(item) === index;
    });
    socketNodeIds = Object.keys(treeData.socketNodes) as string[];
}
