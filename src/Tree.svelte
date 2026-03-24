<script lang="ts">
import { onMount } from "svelte";
import Sidebar from "$lib/ui/sidebar/Sidebar.svelte";
import Tooltip from "$lib/ui/common/Tooltip.svelte";
import Preloader from "$lib/ui/common/Preloader.svelte";
import DebugPanel from "$lib/ui/debug/DebugPanel.svelte";
import JewelLoadErrorModal from "$lib/ui/modals/JewelLoadErrorModal.svelte";
import HelpModal from "$lib/ui/modals/HelpModal.svelte";
import SeedSearchModal from "$lib/ui/modals/SeedSearchModal.svelte";
import SeedSearchButton from "$lib/ui/common/SeedSearchButton.svelte";
import TreeCanvas from "$lib/TreeCanvas.svelte";
import { treeStore } from "$lib/stores/treeStore";
import { searchStore, clearJewelLoadError } from "$lib/stores/searchStore";
import { mouseStore } from "$lib/stores/mouseStore";
import { parseUrlAndInitialize } from "$lib/utils/sharing/urlParser";
import { translations } from "$lib/providers/translations";
import { handleSearch as performSearch } from "$lib/utils/sidebar/searchLogic";
import { perfMonitor } from "$lib/utils/performanceMonitor";
import { canvas } from "$lib/canvas/canvasContext";
import { fetchLeagues } from "./providers/leagues";
import Notification from "$lib/ui/notifications/Notification.svelte";
import TradeNotification from "$lib/ui/notifications/TradeNotification.svelte";
import { URLS } from "$lib/constants/urls";
import type { SeedSearchResults } from "$lib/types";

let isLoading = $state(true);
let loadingComplete = $state(false);
let debugMode = $state(false);
let renderDuration = $state(0);
let showHelp = $state(false);
let showSeedSearch = $state(false);
let _seedSearchResults = $state<SeedSearchResults | null>(null);

onMount(async () => {
	try {
		perfMonitor.mark("init-start");

		loadingComplete = true;

		fetchLeagues();
		await parseUrlAndInitialize(
			canvas.treeData,
			null,
			performSearch,
			translations,
		);

		perfMonitor.mark("init-end");
		perfMonitor.measure("total-init", "init-start", "init-end");
	} catch (e) {
		console.error("Error during initialization:", e);
		loadingComplete = true;
		isLoading = false;
	}
});

onMount(() => {
	const handleKeydown = (e: KeyboardEvent) => {
		if (e.ctrlKey && e.altKey && e.key === "f") {
			e.preventDefault();
			debugMode = !debugMode;
		}

		if (e.ctrlKey && e.key === "v") {
			const activeTag = document.activeElement?.tagName.toLowerCase();
			if (activeTag !== "input" && activeTag !== "textarea") {
				e.preventDefault();
				showSeedSearch = true;
			}
		}
	};
	window.addEventListener("keydown", handleKeydown);

	return () => {
		window.removeEventListener("keydown", handleKeydown);
	};
});

$effect(() => {
	if (loadingComplete) {
		const timeoutId = setTimeout(() => {
			isLoading = false;
		}, 50);
		return () => clearTimeout(timeoutId);
	}
});

function handleErrorClose() {
	searchStore.update((s) => ({ ...s, jewelType: null }));
	clearJewelLoadError();
}

function handleRenderDuration(duration: number) {
	renderDuration = duration;
}
</script>

 {#if isLoading}
  <Preloader {loadingComplete} progress={loadingComplete ? 100 : 0} />
 {/if}

<DebugPanel isVisible={debugMode} {renderDuration} />

<TreeCanvas onRender={handleRenderDuration} />

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

{#if showHelp}
  <HelpModal onclose={() => showHelp = false} />
{/if}

{#if showSeedSearch}
  <SeedSearchModal
    onclose={() => showSeedSearch = false}
    onresults={(results) => _seedSearchResults = results}
  />
{/if}

<div class="fixed bottom-2 right-2 flex gap-2 z-[1]">
  <a
    href={URLS.GITHUB_REPO}
    target="_blank"
    rel="noopener noreferrer"
    class="w-8 h-8 flex items-center justify-center text-[rgba(200,200,200,0.8)] hover:text-white transition-colors rounded"
    aria-label="View on GitHub"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
    </svg>
  </a>
  <button
    onclick={() => showHelp = true}
    class="w-8 h-8 flex items-center justify-center text-[rgba(200,200,200,0.8)] hover:text-white transition-colors rounded cursor-pointer"
    aria-label="Help"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
      <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
    </svg>
  </button>
  <SeedSearchButton onclick={() => showSeedSearch = true} />
</div>

<style>
  :global(body) {
    margin: 0;
    overflow: hidden;
    font-family: Fontin, sans-serif;
  }
</style>
