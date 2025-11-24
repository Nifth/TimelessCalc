import type { Node } from "$lib/types";
import Konva from "konva";
import { treeStore } from "$lib/stores/treeStore";
import { get } from "svelte/store";

export function setupClick(stage: Konva.Stage, nodes: Record<string, Node>)
{
    // ---------- CLIC ----------
    stage.on('click tap', e => {
        const treeState = get(treeStore);
        const shape = e.target;
        console.log(treeState);
        console.log(shape);
        if (shape instanceof Konva.Circle) {
            const skill = Number(shape.name());
            const node = nodes[Object.keys(nodes).find(k => nodes[k].skill === skill)!];
            console.log(node);
            if (node.isJewelSocket) {
                if (treeState.chosenSocket === node) {
                    treeStore.update(state => {
                        state.chosenSocket = null;
                        return state;
                    })
                } else {
                    treeStore.update(state => {
                        state.chosenSocket = node;
                        return state;
                    });
                }
                return;
            }
            treeStore.update(state => {
                state.allocated.set(node.name + '-' + node.skill, node.skill)
                return state;
            })
            console.log(get(treeStore).allocated)
        }
    });
}