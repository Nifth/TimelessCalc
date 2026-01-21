<script lang="ts">
  import type { SearchHistoryEntry, Node, TreeData } from "$lib/types";
  import { historyStore, historyActions } from "$lib/stores/historyStore";
  import { searchStore } from "$lib/stores/searchStore";
  import { treeStore } from "$lib/stores/treeStore";
  import { canvas } from "$lib/konva/canvasContext";
  import Modal from "$lib/ui/common/Modal.svelte";
  import { translations } from "$lib/providers/translations";
  import { loadEntry as loadEntryUtil } from "$lib/utils/entryLoader";
  import { formatDate, formatStats, findNearbyKeystone } from "$lib/utils/formatters";

  let {
    onswitchtotab,
  }: { onswitchtotab: (tab: "search" | "favorites" | "history") => void } =
    $props();

  const treeNodes: Record<string, Node> = canvas.treeData.nodes;
  const treeData: TreeData = canvas.treeData;

  let showConfirmModal = $state(false);
  let pendingLoadEntry: SearchHistoryEntry | null = $state(null);

  function handleLoadEntry(entry: SearchHistoryEntry) {
    if (historyActions.hasCurrentConfiguration()) {
      pendingLoadEntry = entry;
      showConfirmModal = true;
    } else {
      loadEntryUtil({
        entry,
        loadAction: (e) => historyActions.loadSearch(e),
        translation: translations,
        canvas,
        onSwitchToTab: () => onswitchtotab("search"),
      });
    }
  }

  async function confirmLoad() {
    if (pendingLoadEntry) {
      await loadEntryUtil({
        entry: pendingLoadEntry,
        loadAction: (e) => historyActions.loadSearch(e),
        translation: translations,
        canvas,
        onSwitchToTab: () => onswitchtotab("search"),
      });
      showConfirmModal = false;
      pendingLoadEntry = null;
    }
  }

  function handleDeleteEntry(entryId: string) {
    historyActions.deleteEntry(entryId);
  }
</script>

<div class="space-y-4">
  <div class="text-sm text-slate-400">
    Previous searches are saved automatically when you search.
  </div>

  {#if $historyStore.length === 0}
    <div class="bg-slate-800 rounded-lg p-8 text-center">
      <p class="text-slate-400 italic">No search history yet.</p>
      <p class="text-slate-500 text-sm mt-2">
        Search configurations will appear here automatically.
      </p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each $historyStore as entry (entry.id)}
        <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-sm font-medium text-slate-200 truncate">
                  {findNearbyKeystone(entry.socket, treeNodes, treeData)}
                </span>
                <span class="text-xs text-slate-500">•</span>
                <span class="text-sm text-slate-300 truncate">
                  {entry.jewelType.label}
                </span>
                {#if entry.conqueror}
                  <span class="text-xs text-slate-500">•</span>
                  <span class="text-sm text-slate-300 truncate">
                    {entry.conqueror.label}
                  </span>
                {/if}
              </div>

              <div class="text-xs text-slate-400 mb-1">
                {formatStats(entry.stats)}
              </div>

              <div class="flex items-center gap-4 text-xs text-slate-500">
                <span>{entry.allocatedSkillIds?.length || 0} allocated</span>
                <span>Min weight: {entry.minTotalWeight}</span>
                <span>{formatDate(entry.timestamp)}</span>
              </div>
            </div>

            <div class="flex gap-2 flex-shrink-0">
              <button
                onclick={() => handleLoadEntry(entry)}
                class="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded cursor-pointer transition-all duration-200"
              >
                Load
              </button>
              <button
                onclick={() => handleDeleteEntry(entry.id)}
                class="px-3 py-1.5 text-sm bg-red-600/80 hover:bg-red-600 text-white rounded cursor-pointer transition-all duration-200"
                aria-label="Delete search"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if showConfirmModal}
  <Modal
    message="Loading this search will replace your current configuration. Continue?"
    onConfirm={confirmLoad}
    onCancel={() => {
      showConfirmModal = false;
      pendingLoadEntry = null;
    }}
  />
{/if}
