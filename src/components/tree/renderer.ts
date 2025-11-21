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

	const stage = new Konva.Stage({
		container: container,
		width: window.innerWidth,
		height: window.innerHeight,
		draggable: true,
	});
	const layer = new Konva.Layer();

	// Zoom/pan support
	// Récupérer les niveaux de zoom min/max
	const zoomLevels = treeData.imageZoomLevels || [0.1, 5];
	const minZoom = zoomLevels[0] - 0.05;
	const maxZoom = zoomLevels[zoomLevels.length - 1];

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
	const minX = treeData.min_x ?? -13902;
	const minY = treeData.min_y ?? -10689;
	const maxX = treeData.max_x ?? 12430;
	const maxY = treeData.max_y ?? 10023;
	// Centrage initial du stage sur le centre du tree, en tenant compte du zoom
	const treeWidth = maxX - minX;
	const treeHeight = maxY - minY;
	const centerTreeX = treeWidth / 2;
	const centerTreeY = treeHeight / 2;
	const centerScreenX = window.innerWidth / 2;
	const centerScreenY = window.innerHeight / 2;
	stage.position({
		x: centerScreenX - centerTreeX * minZoom,
		y: centerScreenY - centerTreeY * minZoom,
	});

	let testGroups: Group[] = [];
	Object.entries(treeData.groups).forEach(([groupId, group]) => {
		let hasNode = false;
		group.nodes.forEach((nodeId, idx) => {
			if (['57264',
				'33296',
				'36774',
				'17579',
				'21934',
				'1957',
				'739',
				'18866',
				'11420',
				'48362',
				'11128',
				'27203',
				'8135',
				'2292',
				'11659',
				'27929',
				'40637',
				'55643',
				'6949',
				'25222',
				'9650',
				'19374',
				'59650',
				'4397',
				'36542',
				'37569',
				'57226'].includes(nodeId)) {
					hasNode = true;
				}
		})
		if (!hasNode) {return};

		testGroups.push(group);
	});
	console.log(testGroups);

	Object.entries(treeData.groups).forEach(([groupId, group]) => {
		// Group center
		const centerX = group.x - minX;
		const centerY = group.y - minY;
		
		renderGroup(group, centerX, centerY, layer);

		// Draw nodes on their orbit
		group.nodes.forEach((nodeId, idx) => {
			const node: Node | undefined = treeData.nodes[nodeId];
			const orbit = node?.orbit ?? group.orbits?.[0] ?? 0;
			const orbitIndex = node?.orbitIndex ?? idx;
			const radius = orbitRadii[orbit] || 0;
			const angle = (2 * Math.PI * orbitIndex) / (node?.orbit != null ? (treeData.constants?.skillsPerOrbit?.[orbit] || 1) : group.nodes.length);
			const nodeX = centerX + radius * Math.sin(angle);
			const nodeY = centerY - radius * Math.cos(angle);

			if (node.isJewelSocket) {
				renderSocket(node, nodeX, nodeY, layer);
			} else {
				renderNode(node, nodeX, nodeY, layer);
			}
		});
	});

	stage.add(layer);
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
	

	const nodeCircle = new Konva.Circle({
		x: nodeX,
		y: nodeY,
		radius: node?.isNotable ? 18 : 12,
		stroke: '#333',
		strokeWidth: 3,
	});
	layer.add(nodeCircle);

	nodeCircle.on('mouseenter', () => {
		document.body.style.cursor = 'pointer';
		if (label) label.visible(true);
		layer.batchDraw();
	});
	nodeCircle.on('mouseleave', () => {
		document.body.style.cursor = 'default';
		if (label) label.visible(false);
		layer.batchDraw();
	});
}
