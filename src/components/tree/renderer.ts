import Konva from 'konva';
import { createSprite, preloadSprites } from './sprites';
import type { TreeData, Group, Node } from './types';
import type { Layer } from 'konva/lib/Layer';

//https://konvajs.org/docs/sandbox/10000_Shapes_with_Tooltip.html pour tooltip?
export function renderTree(container: HTMLDivElement, treeData: TreeData) {
	preloadSprites(treeData.sprites)
	// Fullscreen
	container.style.position = 'fixed';
	container.style.top = '0';
	container.style.left = '0';
	container.style.width = '100vw';
	container.style.height = '100vh';
	container.style.backgroundColor = '#070c11';
	const stage = new Konva.Stage({
		container: container,
		width: window.innerWidth,
		height: window.innerHeight,
		draggable: true,
	});

	// Zoom/pan support
	// Récupérer les niveaux de zoom min/max
	const zoomLevels = treeData.imageZoomLevels || [0.1, 5];
	const minZoom = 0.15;
	const maxZoom = 0.3;
    console.log(zoomLevels)

	let scale = minZoom;
	stage.scale({ x: scale, y: scale });
	stage.on('wheel', (e) => {
		e.evt.preventDefault();
		const oldScale = scale;
		const pointer = stage.getPointerPosition();
		if (!pointer) return;
		if (e.evt.deltaY < 0) {
			scale *= 1.1;
		} else {
			scale /= 1.1;
		}
		scale = Math.max(minZoom, Math.min(maxZoom, scale));
		stage.scale({ x: scale, y: scale });
		stage.position({
			x: pointer.x - (pointer.x - stage.x()) * (scale / oldScale),
			y: pointer.y - (pointer.y - stage.y()) * (scale / oldScale),
		});
		stage.batchDraw();
	});

	// Orbit radii from constants
	const orbitRadii = treeData.constants?.orbitRadii || [0, 82, 162, 335, 493, 662, 846];
	const centerScreenX = window.innerWidth / 2;
	const centerScreenY = window.innerHeight / 2;
	stage.position({
		x: centerScreenX,
		y: centerScreenY,
	});
    const nodePositions: Record<string, NodePosition> = {};  // "12345" → { x: 1234.56, y: 789.01 }
	const nodeLayer = new Konva.Layer({listening: false});
	const groupLayer = new Konva.Layer({listening: false});
	const hitLayer = new Konva.Layer({ listening: true });  // SEULE layer avec events (juste les cercles invisibles)
    Object.entries(treeData.groups).forEach(([, group]) => {
        // Group center
		const centerX = group.x;
		const centerY = group.y;
		
		renderGroup(group, centerX, centerY, groupLayer);

		// Draw nodes on their orbit
		group.nodes.forEach((nodeId, idx) => {
			const node: Node | undefined = treeData.nodes[nodeId];
			const orbit = node?.orbit ?? group.orbits?.[0] ?? 0;
			const orbitIndex = node?.orbitIndex ?? idx;
			const radius = orbitRadii[orbit] || 0;
			const angle = (2 * Math.PI * orbitIndex) / (node?.orbit != null ? (treeData.constants?.skillsPerOrbit?.[orbit] || 1) : group.nodes.length);
			const nodeX = centerX + radius * Math.sin(angle);
			const nodeY = centerY - radius * Math.cos(angle);
            nodePositions[nodeId] = { x: nodeX, y: nodeY };

			if (node.isJewelSocket) {
				renderSocket(node, nodeX, nodeY, nodeLayer);
			} else {
				renderNode(node, nodeX, nodeY, nodeLayer);
			}

            // === HITSHAPE INVISIBLE POUR HOVER (seule partie interactive) ===
            const hitCircle = new Konva.Circle({
                nodeX,
                nodeY,
                radius: node.isNotable ? 30 : 20, // plus grand = plus facile à hover
                listening: true,
                visible: false, // important : pas dessiné à l'écran
                name: nodeId
            });

            // Hover ultra léger (pas de batchDraw ici !)
            hitCircle.on('mouseenter', () => {
                document.body.style.cursor = 'pointer';
                showNodeLabel(node, nodeX, nodeY); // on ajoute le label dynamiquement
            });
            hitCircle.on('mouseleave', () => {
                document.body.style.cursor = 'default';
                hideNodeLabel();
            });
            hitCircle.on('click tap', () => {
                console.log('Clicked node', node.name, nodeId);
                // ton code d'alloc ici
            });

            hitLayer.add(hitCircle);
		});
	});

    const lineLayer = renderLines(treeData, nodePositions)
	stage.add(groupLayer, lineLayer, nodeLayer, hitLayer);
    // === LABELS DYNAMIQUES (un seul groupe caché) ===
    const labelGroup = new Konva.Group({ visible: false });
    hitLayer.add(labelGroup);

    function showNodeLabel(node: Node, x: number, y: number) {
        if (!node.name) return;
        labelGroup.visible(true);
        labelGroup.destroyChildren(); // clean ancien

        const label = new Konva.Text({
            x: x + 25,
            y: y - 15,
            text: node.name,
            fontSize: 20,
            fontFamily: 'Fontin',
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 3,
            shadowColor: '#000',
            shadowBlur: 10,
            shadowOffset: { x: 2, y: 2 },
            padding: 8,
            align: 'center',
            background: '#000000aa',
        });
        labelGroup.add(label);
        hitLayer.batchDraw(); // un seul redraw par hover
    }

    function hideNodeLabel() {
        labelGroup.visible(false);
        hitLayer.batchDraw();
    }
}

function renderLines(treeData: TreeData, nodePositions: Record<string, NodePosition>): Layer {
    const layer = new Konva.Layer({ listening: false });
    const drawn = new Set<string>();

    const orbitRadii = treeData.constants.orbitRadii;
    const skillsPerOrbit = treeData.constants.skillsPerOrbit;

    Object.values(treeData.nodes).forEach(nodeA => {
        if (!nodeA.out || nodeA.isMastery) return;

        nodeA.out.forEach(rawIdB => {
            const nodeB = treeData.nodes[rawIdB];
            if (!nodeB || nodeB.isMastery) return;

            // Anti-doublon strict
            const key = nodeA.skill! < nodeB.skill ? `${nodeA.skill}-${rawIdB}` : `${rawIdB}-${nodeA.skill}`;
            if (drawn.has(key)) return;
            drawn.add(key);

            const a = nodePositions[nodeA.skill!];
            const b = nodePositions[rawIdB];
            if (!a || !b) return;

            const sameGroup = nodeA.group === nodeB.group;
            const sameOrbit = nodeA.orbit === nodeB.orbit && nodeA.orbit! > 0;

            if (sameGroup && sameOrbit) {
                const group = treeData.groups[nodeA.group!];
                const orbit = nodeA.orbit!;
                const count = skillsPerOrbit[orbit];

                const idxA = nodeA.orbitIndex!;
                const idxB = nodeB.orbitIndex!;

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
                    listening: false
                });
                layer.add(line);
            }
        });
    });

    layer.batchDraw();
    return layer;
}

interface NodePosition {
  x: number;
  y: number;
}

function renderGroup(group: Group, centerX: number, centerY: number, layer: Layer) {
	if (!group.background) return;
	if (!group.background.isHalfImage) {
		const image = createSprite(
			'groupBackground',
			group.background.image,
			centerX,
			centerY,
		)
		layer.add(image);
		return;
	}
	
	// move half-image groups up by half their height
	const halfUp = createSprite(
		'groupBackground',
		group.background.image,
		centerX,
		centerY,
		'halfUp'
	)
	layer.add(halfUp);
	const halfDown = createSprite(
		'groupBackground',
		group.background.image,
		centerX,
		centerY,
		'halfDown'
	)
	layer.add(halfDown);

}

function renderSocket(node: Node, nodeX: number, nodeY: number, layer: Layer) {
	let jewelType = 'JewelFrameUnallocated';
	if (node.expansionJewel) {
		jewelType = 'JewelSocketAltNormal';
	}
	const image = createSprite(
		'frame',
		jewelType,
		nodeX,
		nodeY,
	)
	layer.add(image)
}

function renderNode(node: Node, nodeX: number, nodeY: number, layer: Layer) {
	let nodeType = 'small';
	if (node.isNotable) {
		nodeType = 'notable';
	} else if (node.isMastery) {
		nodeType = 'mastery';
	} else if (node.isKeystone) {
		nodeType = 'keystone';
	}
	// Label (hidden by default, shown on hover)
	let label: Konva.Text | null = null;
	if (node?.name) {
		label = new Konva.Text({
			x: nodeX + 18,
			y: nodeY - 8,
			text: node.name,
			fontSize: 24,
			fill: '#fff',
			visible: false,
		});
		layer.add(label);
	}

	let spriteKey: string;
	switch (nodeType) {
		case 'small':
			spriteKey = 'normalInactive';
			break;
		case 'notable':
			spriteKey = 'notableInactive';
			break
		case 'mastery':
			spriteKey = 'masteryInactive';
			break;
		case 'keystone':
			spriteKey = 'keystoneInactive';
			break;
		default:
			spriteKey = 'normalInactive';
			break;
	};

	const background = createSprite(
		spriteKey,
		node.inactiveIcon || node.icon || 'DefaultInactive',
		nodeX,
		nodeY
	)
	layer.add(background);

	if (['keystone', 'notable', 'small'].includes(nodeType)) {
		let frameType: string;
		switch (nodeType) {
			case 'keystone':
				frameType = 'KeystoneFrameUnallocated';
				break;
			case 'notable':
				frameType = 'NotableFrameUnallocated';
				break;
			default:
				frameType = 'PSSkillFrame';
				break;
		}
		const border = createSprite(
			'frame',
			frameType,
			nodeX,
			nodeY
		)
		layer.add(border);
	}
}