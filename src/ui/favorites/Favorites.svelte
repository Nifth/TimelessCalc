<script lang="ts">
  import { favoritesStore, favoritesActions } from "$lib/stores/favoritesStore";
  import {
    generateShareUrlFromData,
    copyToClipboard,
  } from "$lib/utils/sharing/shareUtils";
  import { searchStore } from "$lib/stores/searchStore";
  import { treeStore } from "$lib/stores/treeStore";
  import { handleSearch as performSearch } from "$lib/utils/sidebar/searchLogic";
  import translationsJson from "$lib/data/translation.json" with { type: "json" };
  import { centerCanvasOnSocket } from "$lib/utils/sharing/urlParser";
  import { canvas } from "$lib/konva/canvasContext";
   import Modal from "$lib/ui/common/Modal.svelte";
   import { showNotification } from "$lib/stores/notificationStore";
   import type { FavoriteEntry, Stat } from "$lib/types";

  let { onswitchtotab } = $props<{
    onswitchtotab: (tab: "search" | "favorites" | "history") => void;
  }>();

  const translation: Record<string, any[]> = JSON.parse(
    JSON.stringify(translationsJson),
  );

  let showConfirmModal = $state(false);
  let pendingLoadEntry: FavoriteEntry | null = $state(null);
  let editingId: string | null = $state(null);
  let editValue = $state("");
   let editInput: HTMLInputElement | null = $state(null);

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  function formatStats(stats: Stat[]): string {
    if (stats.length === 0) return "No stats";
    if (stats.length === 1) return stats[0].label;
    if (stats.length === 2) return `${stats[0].label}, ${stats[1].label}`;
    return `${stats[0].label}, ${stats[1].label} (+${stats.length - 2} more)`;
  }

  function handleLoadEntry(entry: FavoriteEntry) {
    // Check if current search has configuration
    if (favoritesActions.hasCurrentConfiguration()) {
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

  async function loadEntry(entry: FavoriteEntry) {
    // Load the configuration
    searchStore.update((s) => ({
      ...s,
      automated: true,
    }));
    favoritesActions.loadFavorite(entry);

    // Center canvas on the socket
    if (canvas.stage && entry.socket) {
      centerCanvasOnSocket(canvas.stage, entry.socket, 0.2);
      // Update tree store scale to match
      treeStore.update((s) => ({ ...s, scale: 0.2 }));
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
    onswitchtotab("search");

    // Update search state after successful search
    if ($searchStore.searched) {
      searchStore.update((s) => ({
        ...s,
        statsSearched: true,
      }));
    }
    searchStore.update((s) => ({
      ...s,
      automated: false,
    }));
  }

  function startEdit(id: string, currentName: string) {
    editingId = id;
    editValue = currentName;
  }

  function saveEdit() {
    if (editingId) {
      favoritesActions.updateName(editingId, editValue);
      editingId = null;
      editInput = null;
    }
  }

  function cancelEdit() {
    editingId = null;
    editInput = null;
  }

  function handleEditKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      saveEdit();
    } else if (event.key === "Escape") {
      cancelEdit();
    }
  }

  async function handleShare(entry: FavoriteEntry) {
    const shareUrl = generateShareUrlFromData(
      entry.jewelType,
      entry.conqueror,
      entry.stats,
      entry.socket,
      entry.allocatedSkillIds.map((i) => Number(i)),
      entry.minTotalWeight,
      null,
      null
    );
    const success = await copyToClipboard(shareUrl);
    if (success) {
      showNotification('share', 'Link copied to clipboard!');
    }
   }

  $effect(() => {
    if (editingId && editInput) {
      editInput.focus();
      editInput.select();
    }
  });
</script>

<div class="space-y-4">
  <div class="text-sm text-slate-400">
    Favorites are saved when you manually save a search configuration.
  </div>

  {#if $favoritesStore.length === 0}
    <div class="bg-slate-800 rounded-lg p-8 text-center">
      <p class="text-slate-400 italic">No favorites yet.</p>
      <p class="text-slate-500 text-sm mt-2">Save a search to see it here.</p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each $favoritesStore as entry (entry.id)}
        <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="mb-2">
                {#if editingId === entry.id}
                  <input
                    bind:this={editInput}
                    bind:value={editValue}
                    class="text-sm font-medium bg-slate-700 border border-slate-500 rounded px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                    onkeydown={handleEditKeydown}
                    onblur={saveEdit}
                  />
                {:else}
                  <div class="flex items-center">
                    <span class="text-sm font-medium text-slate-200 truncate">
                      {entry.name}
                    </span>
                    <button
                      onclick={() => startEdit(entry.id, entry.name)}
                      class="text-slate-400 hover:text-slate-200 p-1 ml-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                      aria-label="Edit name"
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
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  </div>
                {/if}
                <div class="text-xs text-slate-400">
                  {entry.conqueror?.label || "Any"} ({entry.jewelType.label})
                </div>
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
                onclick={() => handleShare(entry)}
                class="p-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-300 hover:text-white transition-all duration-200 cursor-pointer"
                aria-label="Share favorite"
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
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              </button>
              <button
                onclick={() => handleLoadEntry(entry)}
                class="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded cursor-pointer transition-all duration-200"
              >
                Load
              </button>
              <button
                onclick={() => favoritesActions.deleteFavorite(entry.id)}
                class="px-3 py-1.5 text-sm bg-red-600/80 hover:bg-red-600 text-white rounded cursor-pointer transition-all duration-200"
                aria-label="Delete favorite"
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
    message="Loading this favorite will replace your current configuration. Continue?"
    onConfirm={confirmLoad}
    onCancel={() => {
      showConfirmModal = false;
      pendingLoadEntry = null;
    }}
  />
{/if}

