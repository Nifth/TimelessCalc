<script lang="ts">
  import { onMount } from "svelte";
  import Sidebar from "./ui/Sidebar.svelte";
  import Tooltip from "./ui/Tooltip.svelte";
  import Preloader from "./ui/Preloader.svelte";
  import DebugPanel from "./ui/DebugPanel.svelte";
  import JewelLoadErrorModal from "./ui/JewelLoadErrorModal.svelte";
  import Konva from "konva";
  import treeData from "$lib/data/tree.json" with { type: "json" };
  import translationsJson from "$lib/data/translation.json" with { type: "json" };
  import { preloadSprites } from "$lib/konva/utils/sprites";
  import type { TreeData, JewelType } from "$lib/types";
  import { parseUrlAndInitialize } from "$lib/utils/sharing/urlParser";
  import { handleSearch as performSearch } from "$lib/utils/sidebar/searchLogic";
  import { perfMonitor } from "$lib/utils/performanceMonitor";
  import { viewportCuller } from "$lib/konva/utils/viewportCuller";

  import { canvas } from "$lib/konva/canvasContext";
  import { drawBackground } from "$lib/konva/layers/background";
  import { drawLines } from "$lib/konva/layers/lines";
  import {
    drawBaseRadius,
    drawNodesProgressive,
  } from "$lib/konva/layers/nodes";
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
  import {
    searchStore,
    clearJewelLoadError,
    setJewelLoadError,
  } from "./stores/searchStore";
  import { mouseStore } from "./stores/mouseStore";
  import { getHighlighteableNodes } from "./konva/utils/nodes";
  import { fetchLeagues } from "./providers/leagues";
  import { get } from "svelte/store";
  import { loadJewel } from "./providers/jewels";

  const data: TreeData = JSON.parse(JSON.stringify(treeData));
  const translation: Record<string, any[]> = JSON.parse(
    JSON.stringify(translationsJson),
  );

  let previousSkill: number | null = null;

  let fps = 0;
  let lastTime = performance.now();
  let frameCount = 0;
  let parsedFromUrl = false;
  let isLoading = true;
  let loadingComplete = false;
  let loadingProgress = 0;
  let currentLoadingStep = "Initializing...";
  let debugMode = false;

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
      perfMonitor.mark("init-start");

      perfMonitor.mark("stage-setup-start");
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

      perfMonitor.mark("sprite-preload-start");
      await preloadSprites(data.sprites);
      perfMonitor.mark("sprite-preload-end");
      perfMonitor.measure(
        "sprite-preload",
        "sprite-preload-start",
        "sprite-preload-end",
      );

      perfMonitor.mark("stage-setup-end");
      perfMonitor.measure(
        "stage-setup",
        "stage-setup-start",
        "stage-setup-end",
      );
      loadingProgress = 25;
      currentLoadingStep = "Canvas initialized";

      perfMonitor.mark("background-draw-start");
      getHighlighteableNodes(); // initialize the highlighteable nodes cache
      drawBackground();
      perfMonitor.mark("background-draw-end");
      perfMonitor.measure(
        "background-draw",
        "background-draw-start",
        "background-draw-end",
      );
      loadingProgress = 30;
      currentLoadingStep = "Background drawn";

      perfMonitor.mark("nodes-draw-start");
      loadingProgress = 30;
      currentLoadingStep = "Drawing nodes...";
      await drawNodesProgressive(
        (progress: number, step: string) => {
          loadingProgress = 30 + progress * 0.4; // 30-70% for nodes
          currentLoadingStep = step;
        },
        () => {
          perfMonitor.mark("nodes-draw-end");
          perfMonitor.measure(
            "nodes-draw",
            "nodes-draw-start",
            "nodes-draw-end",
          );
        },
      );

      perfMonitor.mark("lines-draw-start");
      drawLines();
      perfMonitor.mark("lines-draw-end");
      perfMonitor.measure("lines-draw", "lines-draw-start", "lines-draw-end");
      loadingProgress = 75;
      currentLoadingStep = "Lines drawn";

      perfMonitor.mark("base-radius-draw-start");
      drawBaseRadius();
      perfMonitor.mark("base-radius-draw-end");
      perfMonitor.measure(
        "base-radius-draw",
        "base-radius-draw-start",
        "base-radius-draw-end",
      );
      loadingProgress = 80;
      currentLoadingStep = "Base radius drawn";

      perfMonitor.mark("hit-layer-setup-start");
      createHitLayer();
      perfMonitor.mark("hit-layer-setup-end");
      perfMonitor.measure(
        "hit-layer-setup",
        "hit-layer-setup-start",
        "hit-layer-setup-end",
      );
      loadingProgress = 85;
      currentLoadingStep = "Hit layer created";

      perfMonitor.mark("event-setup-start");
      setupZoom();
      setupHover();
      setupClick();
      perfMonitor.mark("event-setup-end");
      perfMonitor.measure(
        "event-setup",
        "event-setup-start",
        "event-setup-end",
      );
      loadingProgress = 90;
      currentLoadingStep = "Events set up";

      canvas.mainLayer.batchDraw();
      canvas.lineLayer.batchDraw();

      perfMonitor.mark("init-end");
      perfMonitor.measure("total-init", "init-start", "init-end");

      // Update metrics with canvas info
      perfMonitor.getAllMetrics().canvas = {
        nodeCount: canvas.nodes.size,
        visibleNodes: viewportCuller.getVisibleCount(),
        layerCount: canvas.stage?.children?.length || 0,
      };

      loadingProgress = 100;
      currentLoadingStep = "Complete!";
      loadingComplete = true;

      fetchLeagues();
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
          // Update viewport culling on resize
          viewportCuller.updateViewport(canvas.stage);
        }
      };

      window.addEventListener("resize", handleResize);

      const handleKeydown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.altKey && e.key === "f") {
          e.preventDefault();
          debugMode = !debugMode;
        }
      };
      window.addEventListener("keydown", handleKeydown);

      cleanup = () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("keydown", handleKeydown);
        canvas.stage?.destroy();
      };
    })();

    return () => cleanup();
  });

  $: currentSkill = $treeStore.chosenSocket?.skill ?? null;
  $: if (canvas.mainLayer && currentSkill !== previousSkill) {
    if (!get(searchStore).automated && !parsedFromUrl) {
      updateJewelSockets();
      parsedFromUrl = false;
    }
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
    }, 50);
  }

  function handleErrorClose() {
    // Reset jewelType selection so user can try another jewel
    searchStore.update((s) => ({ ...s, jewelType: null }));
    clearJewelLoadError();
  }

  function handleErrorRetry() {
    clearJewelLoadError();
    // Re-load the jewel data
    const state = get(searchStore);
    if (state.jewelType) {
      loadJewel(state.jewelType.name).catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        setJewelLoadError(state.jewelType!, message);
      });
    }
  }
</script>

{#if isLoading}
  <Preloader
    {loadingComplete}
    progress={loadingProgress}
    currentStep={currentLoadingStep}
  />
{/if}

<DebugPanel
  isVisible={debugMode}
  {fps}
  progress={loadingProgress}
  currentStep={currentLoadingStep}
/>

<div
  id="tree"
  style="position:fixed;inset:0;background:#070c11"
  on:mouseleave={() => treeStore.update((s) => ({ ...s, hovered: null }))}
></div>
<Tooltip node={$treeStore.hovered} x={$mouseStore.x} y={$mouseStore.y} />
<Sidebar />
{#if debugMode}
  <div class="fps-counter">{fps} FPS</div>
{/if}
{#if $searchStore.jewelLoadError}
  <JewelLoadErrorModal
    jewel={$searchStore.jewelLoadError.jewel}
    errorMessage={$searchStore.jewelLoadError.message}
    onclose={handleErrorClose}
    onretry={handleErrorRetry}
  />
{/if}

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
