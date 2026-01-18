<script lang="ts">
  import { onMount } from "svelte";
  import Sidebar from "./ui/Sidebar.svelte";
  import Tooltip from "./ui/Tooltip.svelte";
  import Preloader from "./ui/Preloader.svelte";
  import Konva from "konva";
  import treeData from "$lib/data/tree.json" with { type: "json" };
  import translationsJson from "$lib/data/translation.json" with { type: "json" };
  import { preloadSprites } from "$lib/konva/utils/sprites";
  import type { TreeData } from "$lib/types";
  import { parseUrlAndInitialize } from "$lib/utils/sharing/urlParser";
  import { handleSearch as performSearch } from "$lib/utils/sidebar/searchLogic";

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
    changeRadius,
  } from "$lib/konva/utils/jewelHighlight";
  import { treeStore } from "./stores/treeStore";
  import { searchStore } from "./stores/searchStore";
  import { mouseStore } from "./stores/mouseStore";
  import { getHighlighteableNodes } from "./konva/utils/nodes";
  import { preloadJewels } from "./providers/jewels";

  const data: TreeData = JSON.parse(JSON.stringify(treeData));
  const translation: Record<string, any[]> = JSON.parse(JSON.stringify(translationsJson));

  let previousSkill: number | null = null;

  let fps = 0;
  let lastTime = performance.now();
  let frameCount = 0;
  let parsedFromUrl = false;
  let isLoading = true;
  let loadingComplete = false;

  function updateFPS() {
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      fps = frameCount;
      frameCount = 0;
      lastTime = now;
    }
    requestAnimationFrame(updateFPS);
  }

  onMount(() => {
    let cleanup: () => void = () => {};
    (async () => {
      await preloadSprites(data.sprites);
      await preloadJewels();

       canvas.stage = new Konva.Stage({
          container: document.getElementById("tree")! as HTMLDivElement,
          width: window.innerWidth,
          height: window.innerHeight,
          draggable: true,
        });

       // initialization
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

        getHighlighteableNodes(); // initializationialise the highlighteable nodes cache
        drawBackground();
        drawNodes();
        drawLines();
        drawBaseRadius();
        createHitLayer();

        setupZoom();
        setupHover();
        setupClick();

        canvas.mainLayer.batchDraw();
        canvas.lineLayer.batchDraw();

        // Mark loading as complete, progress bar will finish and then hide preloader
        loadingComplete = true;

         // Parse URL and initialize if parameters present
        parsedFromUrl = parseUrlAndInitialize(
          data,
          canvas,
          performSearch,
          translation,
        );

       updateFPS();

       const handleResize = () => {
         if (canvas.stage) {
           canvas.stage.width(window.innerWidth);
           canvas.stage.height(window.innerHeight);
           canvas.stage.batchDraw();
         }
       };

       window.addEventListener('resize', handleResize);

       cleanup = () => {
         window.removeEventListener('resize', handleResize);
         canvas.stage?.destroy();
       };
    })();

    return () => cleanup();
  });

  $: currentSkill = $treeStore.chosenSocket?.skill ?? null;
  $: if (canvas.mainLayer && currentSkill !== previousSkill) {
    if (!parsedFromUrl) {
      updateJewelSockets();
    }
    parsedFromUrl = false;

    previousSkill = currentSkill;
  }

  $: if (canvas.mainLayer && $searchStore.jewelType) {
    changeRadius($treeStore.chosenSocket);
  }

  $: if (canvas.mainLayer && $treeStore.allocated) {
    updateAllocatedDisplay();
  }

  $: if (loadingComplete) {
    // Allow progress bar to complete its animation before hiding preloader
    setTimeout(() => {
      isLoading = false;
    }, 200);
  }
</script>

{#if isLoading}
  <Preloader {loadingComplete} />
{/if}

<div id="tree" style="position:fixed;inset:0;background:#070c11" on:mouseleave={() => treeStore.update(s => ({ ...s, hovered: null }))}></div>
<Tooltip node={$treeStore.hovered} x={$mouseStore.x} y={$mouseStore.y} />
<Sidebar />
<div class="fps-counter">{fps} FPS</div>

<style>
  :global(body) {
    margin: 0;
    overflow: hidden;
    font-family: Fontin, sans-serif;
  }

  .fps-counter {
    position: absolute;
    top: 10px;
    right: 10px;
    color: white;
    font-size: 14px;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.5);
    padding: 5px;
    border-radius: 3px;
  }
</style>
