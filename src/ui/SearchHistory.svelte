<script lang="ts">
  import type { SearchHistoryEntry, Node, TreeData } from "$lib/types";
  import { historyStore, historyActions } from "$lib/stores/historyStore";
  import { searchStore } from "$lib/stores/searchStore";
  import { treeStore } from "$lib/stores/treeStore";
  import { handleSearch as performSearch } from "$lib/utils/sidebar/searchLogic";
  import translationsJson from "$lib/data/translation.json" with { type: "json" };
  import treeData from "$lib/data/tree.json" with { type: "json" };
  import { centerCanvasOnSocket } from "$lib/utils/sharing/urlParser";
  import { canvas } from "$lib/konva/canvasContext";
  import Modal from "./Modal.svelte";

  let { onswitchtotab }: { onswitchtotab: (tab: 'search' | 'favorites' | 'history') => void } = $props();

  const translation: Record<string, any[]> = JSON.parse(
    JSON.stringify(translationsJson),
  );

  const treeNodes: Record<string, Node> = (treeData as unknown as TreeData).nodes;

  let showConfirmModal = $state(false);
  let pendingLoadEntry: SearchHistoryEntry | null = $state(null);

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
  }

  function findNearbyKeystone(socket: Node): string {
    // Get nodes that are actually within the socket's radius
    const socketNodes = (treeData as unknown as TreeData).socketNodes[socket.skill.toString()];

    if (!socketNodes) {
      return socket.name; // Fallback if no socket data
    }

    // Look for keystones first among nodes in socket radius
    for (const nodeId of socketNodes) {
      const node = treeNodes[nodeId];
      if (node && node.isKeystone) {
        return node.name;
      }
    }

    // If no keystone found, look for notables
    for (const nodeId of socketNodes) {
      const node = treeNodes[nodeId];
      if (node && node.isNotable) {
        return node.name;
      }
    }

    // If nothing special found, look for any named node (not just "Basic Jewel Socket")
    for (const nodeId of socketNodes) {
      const node = treeNodes[nodeId];
      if (node && node.name && node.name !== "Basic Jewel Socket" && !node.name.includes("Jewel Socket")) {
        return node.name;
      }
    }

    // Fallback to socket name if nothing found
    return socket.name;
  }

  function formatStats(stats: any[]): string {
    if (stats.length === 0) return "No stats";
    if (stats.length === 1) return stats[0].label;
    if (stats.length === 2) return `${stats[0].label}, ${stats[1].label}`;
    return `${stats[0].label}, ${stats[1].label} (+${stats.length - 2} more)`;
  }

  function handleLoadEntry(entry: SearchHistoryEntry) {
    // Check if current search has configuration
    if (historyActions.hasCurrentConfiguration()) {
      pendingLoadEntry = entry;
      showConfirmModal = true;
    } else {
      loadEntry(entry);
    }
  }

  function confirmLoad() {
    if (pendingLoadEntry) {
      loadEntry(pendingLoadEntry);
      showConfirmModal = false;
      pendingLoadEntry = null;
    }
  }

  async function loadEntry(entry: SearchHistoryEntry) {
    // Load the configuration
    searchStore.update(s => ({
      ...s,
      automated: true,
    }));
    historyActions.loadSearch(entry);

    // Center canvas on the socket
    if (canvas.stage && entry.socket) {
      centerCanvasOnSocket(canvas.stage, entry.socket, 0.2);
      // Update tree store scale to match
      treeStore.update(s => ({ ...s, scale: 0.2 }));
    }

    // Automatically trigger the search
    await performSearch(
      "stats", // Force stats mode
      null, // No seed input for stats mode
      translation,
      entry.jewelType,
      entry.stats,
    );

    // Switch to search tab to show results
    onswitchtotab('search');

    // Update search state after successful search
    if ($searchStore.searched) {
      searchStore.update(s => ({
        ...s,
        statsSearched: true,
      }));
    }
    searchStore.update(s => ({
      ...s,
      automated: false,
    }));
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
      <p class="text-slate-500 text-sm mt-2">Search configurations will appear here automatically.</p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each $historyStore as entry (entry.id)}
        <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-sm font-medium text-slate-200 truncate">
                  {findNearbyKeystone(entry.socket)}
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
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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