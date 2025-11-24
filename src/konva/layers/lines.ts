import type { TreeData } from "$lib/types";
import Konva from "konva";

export function drawLines(layer: Konva.Layer, data: TreeData)
{
    const skillsPerOrbit = data.constants.skillsPerOrbit;
    const orbitRadii = data.constants.orbitRadii;

    Object.entries(data.groups).forEach(([_, group]: [any, any]) => {
        group.nodes.forEach((nodeId: string, idx: number) => {
          const node = data.nodes[nodeId];
          if (node.out && !node.isMastery && !node.classStartIndex) {
                node.out.forEach((targetId: string) => {
                    const target = data.nodes[targetId];
                    if (!target || target.isMastery || target.classStartIndex !== undefined) return;

                    const key = node.skill < target.skill ? `${node.skill}-${target.skill}` : `${target.skill}-${node.skill}`;
                    if ((window as any).drawn?.has(key)) return;
                    (window as any).drawn = (window as any).drawn || new Set();
                    (window as any).drawn.add(key);

                    const a = node;
                    const b = target;
                    if (!a || !b) return;
                    const sameGroup = node.group === target.group;
                    const sameOrbit = node.orbit === target.orbit && node.orbit! > 0;
                    if (sameGroup && sameOrbit) {
                        const group = data.groups[node.group!];
                        const orbit = node.orbit!;
                        const count = skillsPerOrbit[orbit];

                        const idxA = node.orbitIndex!;
                        const idxB = target.orbitIndex!;

                        const angleA = (2 * Math.PI * idxA) / count - Math.PI / 2;
                        const angleB = (2 * Math.PI * idxB) / count - Math.PI / 2;

                        let delta = angleB - angleA;
                        // shortest arc
                        if (Math.abs(delta) > Math.PI) {
                            delta += delta > 0 ? -2 * Math.PI : 2 * Math.PI;
                        }

                        const arc = new Konva.Arc({
                            x: group.x,
                            y: group.y,
                            innerRadius: orbitRadii[orbit],
                            outerRadius: orbitRadii[orbit],
                            angle: delta * 180 / Math.PI,
                            rotation: angleA * 180 / Math.PI,
                            clockwise: delta < 0,
                            stroke: '#9f7140',
                            strokeWidth: 2.5,
                            lineCap: 'round',
                            listening: false
                        });

                        layer.add(arc);
                    } else {
                        const line = new Konva.Line({
                        points: [a.x, a.y, b.x, b.y],
                        stroke: '#9f7140',
                        strokeWidth: 3,
                        lineCap: 'round',
                        listening: false,
                        });
                        layer.add(line);
                    }
                });
            }
        });
    });
}