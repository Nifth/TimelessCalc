<script lang="ts">
  import { onMount } from "svelte";
  import Sidebar from "./ui/Sidebar.svelte";
  import Tooltip from "./ui/Tooltip.svelte";
  import Konva from "konva";
  import treeData from "$lib/data/tree.json" with { type: "json" };
  import { preloadSprites } from "$lib/konva/utils/sprites";
  import type { TreeData } from "$lib/types";

  import { canvas } from "$lib/konva/canvasContext";
  import { drawBackground } from "$lib/konva/layers/background";
  import { drawLines } from "$lib/konva/layers/lines";
  import { drawBaseRadius, drawNodes } from "$lib/konva/layers/nodes";
  import { createHitLayer } from "$lib/konva/layers/hit";
  import { setupZoom } from "$lib/konva/utils/zoom";
  import { setupHover } from "$lib/konva/utils/hover";
  import { setupClick } from "$lib/konva/utils/click";
  import {
    updateAllocatedDisplay,
    updateJewelSockets,
  } from "$lib/konva/utils/jewelHighlight";
  import { treeStore } from "./stores/treeStore";
  import { mouseStore } from "./stores/mouseStore";
  import { getHighlighteableNodes } from "./konva/utils/nodes";
  import { preloadJewels } from "./providers/jewels";

  const data: TreeData = JSON.parse(JSON.stringify(treeData));

  let previousSkill: number | null = null;

  onMount(() => {
    let cleanup: () => void = () => {};
    (async () => {
      preloadSprites(data.sprites);
      await preloadJewels();

      canvas.stage = new Konva.Stage({
        container: document.getElementById("tree")! as HTMLDivElement,
        width: window.innerWidth,
        height: window.innerHeight,
        draggable: true,
      });

      // init
      canvas.stage.scale({ x: 0.2, y: 0.2 });
      canvas.stage.position({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });

      canvas.backgroundLayer = new Konva.Layer({ listening: false });
      canvas.mainLayer = new Konva.Layer({ listening: false });
      canvas.lineLayer = new Konva.Layer({ listening: false });
      canvas.hitLayer = new Konva.Layer({ listening: true });
      canvas.highlightLayer = new Konva.Layer({ listening: false });
      canvas.treeData = data;

      canvas.stage.add(
        canvas.backgroundLayer,
        canvas.lineLayer,
        canvas.mainLayer,
        canvas.hitLayer,
        canvas.highlightLayer,
      );

      getHighlighteableNodes(); // initialise the highlighteable nodes cache
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

      cleanup = () => {
        canvas.stage?.destroy();
      };
    })();

    return () => cleanup();
  });

  $: currentSkill = $treeStore.chosenSocket?.skill ?? null;
  $: if (canvas.mainLayer && currentSkill !== previousSkill) {
    updateJewelSockets();
    previousSkill = currentSkill;
  }

  $: if (canvas.mainLayer && $treeStore.allocated) {
    updateAllocatedDisplay();
  }
</script>

<div id="tree" style="position:fixed;inset:0;background:#070c11"></div>
<Tooltip node={$treeStore.hovered} x={$mouseStore.x} y={$mouseStore.y} />
<Sidebar />

<style>
  :global(body) {
    margin: 0;
    overflow: hidden;
    font-family: Fontin, sans-serif;
  }
</style>
