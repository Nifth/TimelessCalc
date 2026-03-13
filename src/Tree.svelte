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
import { URLS } from "$lib/constants/urls";

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

<a
	href={URLS.GITHUB_REPO}
	target="_blank"
	rel="noopener noreferrer"
	class="github-link"
	aria-label="View on GitHub"
>
	<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
		<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
	</svg>
</a>

<style>
  :global(body) {
    margin: 0;
    overflow: hidden;
    font-family: Fontin, sans-serif;
  }
	.github-link {
		position: fixed;
		bottom: 8px;
		right: 8px;
		color: rgba(31, 20, 53, 0.8);
		transition: color 0.2s ease;
		z-index: 1;
	}

	.github-link:hover {
		color: #fff;
	}
</style>
