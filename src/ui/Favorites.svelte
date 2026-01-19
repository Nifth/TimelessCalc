<script lang="ts">

  import { favoritesStore, favoritesActions } from "$lib/stores/favoritesStore";
  import Modal from "./Modal.svelte";
  import type { FavoriteEntry, Stat } from "$lib/types";

  let { onswitchtotab } = $props<{
    onswitchtotab: (tab: "search" | "favorites" | "history") => void;
  }>();

  let showConfirmModal = $state(false);
  let pendingLoadEntry: FavoriteEntry | null = $state(null);
  let editingId: string | null = $state(null);
  let editValue = $state("");
  let editInput: HTMLInputElement | null = $state(null);

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toISOString().split("T")[0]; // YYYY-MM-DD
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

  function loadEntry(entry: FavoriteEntry) {
    favoritesActions.loadFavorite(entry);
    onswitchtotab('search');
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
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
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
    message="Loading this favorite will replace your current configuration. Continue?"
    onConfirm={confirmLoad}
    onCancel={() => {
      showConfirmModal = false;
      pendingLoadEntry = null;
    }}
  />
{/if}