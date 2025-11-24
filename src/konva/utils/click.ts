import Konva from "konva";
import { treeStore } from "$lib/stores/treeStore";
import { get } from "svelte/store";
import { canvas } from "$lib/konva/canvasContext";

export function setupClick()
{
    const stage = canvas.stage!,
        nodes = canvas.treeData.nodes;
    // ---------- CLIC ----------
    stage.on('click tap', e => {
        const treeState = get(treeStore);
        const shape = e.target;
        if (shape instanceof Konva.Circle) {
            const skill = Number(shape.name());
            const node = nodes[Object.keys(nodes).find(k => nodes[k].skill === skill)!];
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
        }
    });
}