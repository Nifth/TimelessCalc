<!-- src/Tree.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import Konva from 'konva';
  import treeData from '$lib/data/tree.json' with { type: 'json' };
  import { preloadSprites } from '$lib/konva/utils/sprites';
  import type { TreeData } from '$lib/types';

  import { drawBackground } from '$lib/konva/layers/background';
  import { drawLines } from '$lib/konva/layers/lines';
  import { drawBaseRadius, drawNodes } from '$lib/konva/layers/nodes';
  import { createHitLayer } from '$lib/konva/layers/hit';
  import { setupZoom } from '$lib/konva/utils/zoom';
  import { setupHover } from '$lib/konva/utils/hover';
  import { setupClick } from '$lib/konva/utils/click';
  import { updateJewelSockets } from '$lib/konva/utils/jewelHighlight';
    import { treeStore } from './stores/treeStore';
    import { mouseStore } from './stores/mouseStore';

  const data: TreeData = JSON.parse(JSON.stringify(treeData));

  let stage: Konva.Stage;
  let backgroundLayer: Konva.Layer;
  let mainLayer: Konva.Layer;
  let lineLayer: Konva.Layer;
  let hitLayer: Konva.Layer;
  let tooltip: HTMLDivElement; // todo: improve tooltip to ressemble poe one
  const jewelImages = new Map<number, Konva.Image>();
  const jewelRadiusImages = new Map<string, {a: Konva.Image, b: Konva.Image}>(); // jewel type → images

  // todo: Avoir un fichier constants, on en peut plus là
  // todo: Highlight les nodes dispo dans le radius du socket sélectionné
  // todo: mettre en valeur les socket
  // todo: pouvoir déselectionné / re selectionné les nodes dans le radius
  // tood: tooltip au hover

  onMount(() => {
    let cleanup: () => void = () => {};
    (async () => {
      await preloadSprites(data.sprites);

      stage = new Konva.Stage({
        container: document.getElementById('tree')! as HTMLDivElement,
        width: window.innerWidth,
        height: window.innerHeight,
        draggable: true,
      });
      tooltip = document.getElementById('tooltip')! as HTMLDivElement;

      // init
      stage.scale({ x: 0.2, y: 0.2 });
      stage.position({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

      backgroundLayer = new Konva.Layer({ listening: false });
      mainLayer = new Konva.Layer({ listening: false });
      lineLayer = new Konva.Layer({ listening: false });
      hitLayer = new Konva.Layer({ listening: true });

      stage.add(backgroundLayer, lineLayer, mainLayer, hitLayer);

      // dessin une fois
      drawBackground(backgroundLayer, data);
      drawNodes(mainLayer, data, jewelImages);
      drawLines(lineLayer, data);
      drawBaseRadius(mainLayer, jewelRadiusImages);
      createHitLayer(hitLayer, data);

      // interactions
      setupZoom(stage);
      setupHover(stage, hitLayer, data.nodes);
      setupClick(stage, data.nodes);

      mainLayer.batchDraw();
      lineLayer.batchDraw();

      // mise à jour réactive des jewels

      cleanup = () => {
        stage?.destroy();
      };
    })();

    return () => cleanup();
  });

  $: if (mainLayer && $treeStore.chosenSocket !== undefined) {
    updateJewelSockets(jewelImages, jewelRadiusImages, mainLayer, data.nodes);
  }

  $: if ($treeStore.hovered && tooltip) {
    const hovered = $treeStore.hovered;
    const abs = { x: hovered.x || 0, y: hovered.y || 0 };
    const screenX = $mouseStore.x;
    const screenY = $mouseStore.y;
    tooltip.style.left = screenX + 20 + 'px';
    tooltip.style.top = screenY - 20 + 'px';
    tooltip.textContent = hovered.name;
    tooltip.style.display = 'block';
  } else if (tooltip) {
    tooltip.style.display = 'none';
  }
</script>

<div id="tree" style="position:fixed;inset:0;background:#070c11"></div>
<div id="tooltip" style="position:fixed;display:none;background:rgba(0,0,0,0.92);color:#e8e1d2;padding:12px 18px;border-radius:8px;font:20px Fontin;pointer-events:none;z-index:9999"></div>

<style>
  :global(body) { margin:0; overflow:hidden; font-family: Fontin, sans-serif; }
</style>