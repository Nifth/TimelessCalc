<!-- src/Tree.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import Konva from 'konva';
  import treeData from '$lib/data/tree.json' with { type: 'json' };
  import { preloadSprites } from '$lib/konva/utils/sprites';
  import type { TreeData } from '$lib/types';

  import { canvas } from '$lib/konva/canvasContext';
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
    import { getHighlighteableNodes } from './konva/utils/nodes';

  const data: TreeData = JSON.parse(JSON.stringify(treeData));

  let tooltip: HTMLDivElement; // todo: improve tooltip to ressemble poe one

  // todo: pouvoir déselectionné / re selectionné les nodes dans le radius
  // tood: tooltip au hover

  onMount(() => {
    let cleanup: () => void = () => {};
    (async () => {
      await preloadSprites(data.sprites);

      canvas.stage = new Konva.Stage({
        container: document.getElementById('tree')! as HTMLDivElement,
        width: window.innerWidth,
        height: window.innerHeight,
        draggable: true,
      });
      tooltip = document.getElementById('tooltip')! as HTMLDivElement;

      // init
      canvas.stage.scale({ x: 0.2, y: 0.2 });
      canvas.stage.position({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

      canvas.backgroundLayer = new Konva.Layer({ listening: false });
      canvas.mainLayer = new Konva.Layer({ listening: false });
      canvas.lineLayer = new Konva.Layer({ listening: false });
      canvas.hitLayer = new Konva.Layer({ listening: true });
      canvas.treeData = data;

      canvas.stage.add(
        canvas.backgroundLayer,
        canvas.lineLayer,
        canvas.mainLayer,
        canvas.hitLayer
      );

      getHighlighteableNodes() // initialise the highlighteable nodes cache
      // dessin une fois
      drawBackground();
      drawNodes();
      drawLines();
      drawBaseRadius();
      createHitLayer();

      // interactions
      setupZoom();
      setupHover();
      setupClick();

      canvas.mainLayer.batchDraw();
      canvas.lineLayer.batchDraw();

      // mise à jour réactive des jewels

      cleanup = () => {
        canvas.stage?.destroy();
      };
    })();

    return () => cleanup();
  });

  $: if (canvas.mainLayer && $treeStore.chosenSocket !== undefined) {
    updateJewelSockets();
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