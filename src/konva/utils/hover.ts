import Konva from "konva";
import { mouseStore } from "$lib/stores/mouseStore"
import { treeStore } from "$lib/stores/treeStore";
import { canvas } from "$lib/konva/canvasContext";

export function setupHover()
{
    const stage = canvas.stage!,
        hitLayer = canvas.hitLayer!,
        nodes = canvas.treeData.nodes;
    // ---------- HOVER ----------
    stage.on('mousemove', () => {
        const p = stage.getPointerPosition()!;
        const shape = hitLayer.getIntersection(p);
        mouseStore.set({x: p.x, y: p.y});
        if (shape instanceof Konva.Circle) {
            const skill = Number(shape.name());
            const hovered = nodes[Object.keys(nodes).find(k => nodes[k].skill === skill)!];
            treeStore.update(state => {
                state.hovered = hovered
                return state;
            })
            if (hovered.isJewelSocket) {
            document.body.style.cursor = 'pointer';
            }
        } else {
            treeStore.update(state => {
                state.hovered = null
                return state;
            })
            document.body.style.cursor = 'default';
        }
    });
}