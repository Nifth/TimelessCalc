<script lang="ts">
import { onMount } from "svelte";
import Sidebar from "$lib/ui/sidebar/Sidebar.svelte";
import Tooltip from "$lib/ui/common/Tooltip.svelte";
import Preloader from "$lib/ui/common/Preloader.svelte";
import DebugPanel from "$lib/ui/debug/DebugPanel.svelte";
import JewelLoadErrorModal from "$lib/ui/modals/JewelLoadErrorModal.svelte";
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

let isLoading = $state(true);
let loadingComplete = $state(false);
let debugMode = $state(false);
let renderDuration = $state(0);

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

<style>
  :global(body) {
    margin: 0;
    overflow: hidden;
    font-family: Fontin, sans-serif;
  }
</style>
