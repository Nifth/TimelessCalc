<script lang="ts">
  import { onMount } from "svelte";
   import Sidebar from "$lib/ui/sidebar/Sidebar.svelte";
   import Tooltip from "$lib/ui/common/Tooltip.svelte";
  import Preloader from "$lib/ui/common/Preloader.svelte";
  import DebugPanel from "$lib/ui/debug/DebugPanel.svelte";
  import JewelLoadErrorModal from "$lib/ui/modals/JewelLoadErrorModal.svelte";
  import Konva from "konva";
  import treeData from "$lib/data/tree.json" with { type: "json" };
  import translationsJson from "$lib/data/translation.json" with { type: "json" };
  import { preloadSprites } from "$lib/konva/utils/sprites";
  import type { TreeData } from "$lib/types";
  import { parseUrlAndInitialize } from "$lib/utils/sharing/urlParser";
  import { handleSearch as performSearch } from "$lib/utils/sidebar/searchLogic";
  import { perfMonitor } from "$lib/utils/performanceMonitor";

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
    updateJewelSockets,
  } from "$lib/konva/utils/jewelHighlight";
  import { treeStore } from "$lib/stores/treeStore";
  import {
    searchStore,
    clearJewelLoadError,
  } from "$lib/stores/searchStore";
  import { mouseStore } from "$lib/stores/mouseStore";
  import { getHighlighteableNodes } from "$lib/konva/utils/nodes";
  import { fetchLeagues } from "./providers/leagues";
  import { get } from "svelte/store";
  import Notification from "$lib/ui/notifications/Notification.svelte";
  import TradeNotification from "$lib/ui/notifications/TradeNotification.svelte";

  const data: TreeData = JSON.parse(JSON.stringify(treeData));
  const translation: Record<string, any[]> = JSON.parse(
    JSON.stringify(translationsJson),
  );

  let previousSkill: number | null = null;

  let parsedFromUrl = false;
  let isLoading = true;
  let loadingComplete = false;
  let loadingProgress = 0;
  let currentLoadingStep = "Initializing...";
  let debugMode = false;

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


      const handleResize = () => {
        if (canvas.stage) {
          canvas.stage.width(window.innerWidth);
          canvas.stage.height(window.innerHeight);
          canvas.stage.batchDraw();
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
</script>

{#if isLoading}
  <Preloader
    {loadingComplete}
    progress={loadingProgress}
  />
{/if}

<DebugPanel
  isVisible={debugMode}
/>

<div
  id="tree"
  style="position:fixed;inset:0;background:#070c11"
  on:mouseleave={() => treeStore.update((s) => ({ ...s, hovered: null }))}
></div>
<Tooltip node={$treeStore.hovered} x={$mouseStore.x} y={$mouseStore.y} />
<Sidebar />
{#if $searchStore.jewelLoadError}
   <JewelLoadErrorModal
     jewel={$searchStore.jewelLoadError.jewel}
     errorMessage={$searchStore.jewelLoadError.message}
     onclose={handleErrorClose}
   />
{/if}

{#if $searchStore.lastTradeInfo}
  <TradeNotification
    seeds={$searchStore.lastTradeInfo.seeds}
    conquerorLabel={$searchStore.lastTradeInfo.conquerorLabel}
    page={$searchStore.lastTradeInfo.page}
    groupName={$searchStore.lastTradeInfo.groupName}
    onDismiss={() => searchStore.update((s) => ({ ...s, lastTradeInfo: null }))}
  />
{/if}

<Notification />

<style>
  :global(body) {
    margin: 0;
    overflow: hidden;
    font-family: Fontin, sans-serif;
  }
</style>
