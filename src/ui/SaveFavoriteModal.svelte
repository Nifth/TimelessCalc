<script lang="ts">
  import { onMount } from "svelte";

  let {
    suggestedName,
    onSave,
    onCancel
  } = $props<{
    suggestedName: string;
    onSave: (name: string) => void;
    onCancel: () => void;
  }>();

  let inputElement: HTMLInputElement;
  let name = $state("");

  onMount(() => {
    inputElement.focus();
  });

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      onSave(name);
    } else if (event.key === "Escape") {
      onCancel();
    }
  }

  function handleSave() {
    onSave(name);
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  }
</script>

<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onclick={handleBackdropClick}>
  <div class="bg-slate-800 rounded-xl shadow-2xl p-6 max-w-md w-full border border-slate-700">
    <h3 class="text-slate-200 text-lg font-semibold mb-4">Save to Favorites</h3>
    <input
      bind:this={inputElement}
      bind:value={name}
      type="text"
      placeholder={suggestedName}
      class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
      onkeydown={handleKeydown}
    />
    <div class="flex gap-3">
      <button
        type="button"
        onclick={handleSave}
        class="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium cursor-pointer transition-all duration-200"
      >
        Save
      </button>
      <button
        type="button"
        onclick={onCancel}
        class="flex-1 py-2 px-4 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium cursor-pointer transition-all duration-200"
      >
        Cancel
      </button>
    </div>
  </div>
</div>