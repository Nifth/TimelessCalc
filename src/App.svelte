<script lang="ts">
  // todo: refactor en plusieurs composants
  // todo: mettre en valeur les nodes dans le radius du jewel socket sélectionné (avec preprocessing pour déterminer les nodes dans le radius de chaque socket, et ne pas avoir à le faire sur le front)
  
  import { onMount } from 'svelte';
  import Konva from 'konva';
  import type { TreeData, Node } from './types';
  import treeData from './data/tree.json' with { type: 'json'}; // ton tree.json complet
  import { preloadSprites, createSprite } from './konva/utils/sprites';

  const data: TreeData = JSON.parse(JSON.stringify(treeData));
  const jewelRadius = 1800;
  let stage: Konva.Stage;
  let mainLayer: Konva.Layer;
  let lineLayer: Konva.Layer;
  let backgroundLayer: Konva.Layer;
  let hitLayer: Konva.Layer;
  let tooltip: HTMLDivElement; // todo: improve tooltip to ressemble poe one
  let conqueror: string = 'default'; // todo: add HTML UI to select conqueror type => add a mapping for conqueror => radius image name

  // réactif svelte
  let scale = 0.2;
  let pos = { x: 0, y: 0 };
  let hovered: any = null;
  let chosenSocket: Node | null = null;
  const allocated = new Map<string, number>();
  const jewelRadiusImages = new Map<string, {a: Konva.Image, b: Konva.Image}>(); // conqueror type → images
  const jewelSocketImages = new Map<number, Konva.Image>(); // skill → Konva.Image

  onMount(() => {
    let cleanup: () => void = () => {};
    (async () => {
      await preloadSprites(data.sprites);

      const container = document.getElementById('tree')! as HTMLDivElement;
      tooltip = document.getElementById('tooltip')! as HTMLDivElement;

      stage = new Konva.Stage({
        container,
        width: window.innerWidth,
        height: window.innerHeight,
        draggable: true,
      });
      scale = 0.1;
      stage.scale({ x: scale, y: scale });
      stage.position({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      stage.batchDraw();

      mainLayer = new Konva.Layer({ listening: false });
      lineLayer = new Konva.Layer({ listening: false });
      backgroundLayer = new Konva.Layer({ listening: false });
      hitLayer = new Konva.Layer({ listening: true });
      stage.add(backgroundLayer);
      stage.add(lineLayer);
      stage.add(mainLayer);
      stage.add(hitLayer);

      const orbitRadii = data.constants.orbitRadii;
      const skillsPerOrbit = data.constants.skillsPerOrbit;

      // ---------- DESSIN ----------
      Object.entries(data.groups).forEach(([_, group]: [any, any]) => {
        // background
        if (group.background) {
          if (group.background.isHalfImage) {
            const up = createSprite('groupBackground', group.background.image, group.x, group.y, 'halfUp');
            const down = createSprite('groupBackground', group.background.image, group.x, group.y, 'halfDown');
            backgroundLayer.add(up, down);
          } else {
            const bg = createSprite('groupBackground', group.background.image, group.x, group.y);
            backgroundLayer.add(bg);
          }
        }

        group.nodes.forEach((nodeId: string, idx: number) => {
          const node = data.nodes[nodeId];
          if (!node) return;

          const orbit = node.orbit ?? group.orbits?.[0] ?? 0;
          const orbitIndex = node.orbitIndex ?? idx;
          const radius = orbitRadii[orbit] || 0;
          const angle = (2 * Math.PI * orbitIndex) /
            (node.orbit != null ? (skillsPerOrbit?.[orbit] || 1) : group.nodes.length);
          const nodeX = node.x;
          const nodeY = node.y;

          // node sprite
          if (node.classStartIndex !== undefined) {
            const img = createSprite('startNode', 'PSStartNodeBackgroundInactive', nodeX, nodeY);
            mainLayer.add(img);
            return;
          } else {
            if (node.isJewelSocket) {
                let jewelType = chosenSocket?.skill === node.skill ? 'JewelFrameAllocated' : 'JewelFrameUnallocated';
                if (node.expansionJewel) {
                  jewelType = chosenSocket?.skill === node.skill ? 'JewelSocketAltActive' : 'JewelSocketAltNormal';
                }
                const image = createSprite(
                  'frame',
                  jewelType,
                  nodeX,
                  nodeY,
                )

                // ON GARDE LA RÉFÉRENCE
                jewelSocketImages.set(node.skill, image);

                mainLayer.add(image)
            } else {
              const key = node.isMastery ? 'masteryInactive' :
                          node.isKeystone ? 'keystoneInactive' :
                          node.isNotable ? 'notableInactive' : 'normalInactive';
              const icon = createSprite(key, node.inactiveIcon || node.icon || 'DefaultInactive', nodeX, nodeY);
              mainLayer.add(icon);

              if (!node.isMastery && !node.isJewelSocket) {
                const frame = createSprite('frame',
                  node.isKeystone ? 'KeystoneFrameUnallocated' :
                  node.isNotable ? 'NotableFrameUnallocated' : 'PSSkillFrame',
                  nodeX, nodeY);
                mainLayer.add(frame);
              }
            }
          }

          // hit circle
          const hit = new Konva.Circle({
            x: nodeX,
            y: nodeY,
            radius: node.isNotable || node.isKeystone ? 90 : 70,
            name: node.skill.toString(),
            opacity: 0,
            listening: true,
          });
          hitLayer.add(hit);
        });
      });

      Object.entries(data.groups).forEach(([_, group]: [any, any]) => {
        group.nodes.forEach((nodeId: string, idx: number) => {
          const node = data.nodes[nodeId];
          // lignes (même code que toi, juste en vanilla)
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

                  lineLayer.add(arc);
              } else {
                const line = new Konva.Line({
                  points: [a.x, a.y, b.x, b.y],
                  stroke: '#9f7140',
                  strokeWidth: 3,
                  lineCap: 'round',
                  listening: false,
                });
                lineLayer.add(line);
              }
            });
          }
        });
      });

      const defaultRadius = createSprite('jewelRadius', 'JewelCircle1', 0, 0);
      const defaultRadius2 = createSprite('jewelRadius', 'JewelCircle1Inverse', 0, 0);
      defaultRadius.visible(false);
      defaultRadius2.visible(false);
      defaultRadius.opacity(0.5);
      defaultRadius2.opacity(0.5);
      let ratio = defaultRadius.width() / 2;
      defaultRadius.scaleX(jewelRadius / ratio);
      defaultRadius.scaleY(jewelRadius / ratio);
      defaultRadius2.scaleX(jewelRadius / ratio);
      defaultRadius2.scaleY(jewelRadius / ratio);
      jewelRadiusImages.set('default', {a: defaultRadius, b: defaultRadius2});
      mainLayer.add(defaultRadius);
      mainLayer.add(defaultRadius2);

      mainLayer.batchDraw();

      // ---------- ZOOM ----------
      stage.on('wheel', (e) => {
        e.evt.preventDefault();
        e.evt.stopPropagation();

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const oldScale = stage.scaleX();

        // zoom
        const newScale = e.evt.deltaY > 0 
          ? oldScale * 0.9 
          : oldScale * 1.1;
        scale = Math.max(0.1, Math.min(0.4, newScale));

        // KONVA GÈRE TOUT LUI-MÊME (magie noire qui marche)
        const mousePointTo = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale,
        };

        const newPos = {
          x: pointer.x - mousePointTo.x * scale,
          y: pointer.y - mousePointTo.y * scale,
        };

        stage.scale({ x: scale, y: scale });
        stage.position(newPos);
        stage.batchDraw();
      });

      // ---------- HOVER ----------
      stage.on('mousemove', () => {
        const p = stage.getPointerPosition()!;
        const shape = hitLayer.getIntersection(p);
        pos = {x: p.x, y: p.y};
        if (shape instanceof Konva.Circle) {
          const skill = Number(shape.name());
          hovered = data.nodes[Object.keys(data.nodes).find(k => data.nodes[k].skill === skill)!];
          if (hovered.isJewelSocket) {
            document.body.style.cursor = 'pointer';
          }
        } else {
          hovered = null;
          document.body.style.cursor = 'default';
        }
      });

      // ---------- CLIC ----------
      stage.on('click tap', e => {
        const shape = e.target;
        if (shape instanceof Konva.Circle) {
          const skill = Number(shape.name());
          const node = data.nodes[Object.keys(data.nodes).find(k => data.nodes[k].skill === skill)!];
          if (node.isJewelSocket) {
            if (chosenSocket === node) {
              chosenSocket = null;
            } else {
              chosenSocket = node;
            }
            return;
          }
          allocated.set(node.name + '-' + node.skill, node.skill)
          console.log(allocated)
        }
      });
      cleanup = () => {
        stage?.destroy();
      };
    })();

    // cleanup
    return () => cleanup();
  });

  $: if (hovered && tooltip) {
    const abs = { x: hovered.x || 0, y: hovered.y || 0 };
    const screenX = abs.x * scale + pos.x;
    const screenY = abs.y * scale + pos.y;
    tooltip.style.left = screenX + 20 + 'px';
    tooltip.style.top = screenY - 20 + 'px';
    tooltip.textContent = hovered.name;
    tooltip.style.display = 'block';
  } else if (tooltip) {
    tooltip.style.display = 'none';
  }
</script>

<div id="tree" style="position:fixed;inset:0;background:#070c11"></div>

<style>
  :global(body) { margin:0; overflow:hidden; font-family: Fontin, sans-serif; }
</style>