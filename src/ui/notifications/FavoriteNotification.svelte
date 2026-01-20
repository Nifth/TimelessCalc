<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  let { name, onDismiss } = $props<{
    name: string;
    onDismiss: () => void;
  }>();

  onMount(() => {
    const timeout = setTimeout(() => {
      onDismiss();
    }, 3000);

    return () => clearTimeout(timeout);
  });
</script>

<div
  class="fixed right-4 bottom-20 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-4 z-50 flex items-center gap-3 max-w-xs"
  transition:fly={{ x: 320, duration: 500, easing: cubicOut }}
>
  <span class="text-slate-200 text-sm">Saved as '{name}'</span>
  <button
    onclick={onDismiss}
    class="text-slate-400 hover:text-white p-1 transition-colors duration-200 ml-auto"
    aria-label="Dismiss"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </button>
</div>
