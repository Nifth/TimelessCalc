<script lang="ts">
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { hideNotification, notificationStore } from "$lib/stores/notificationStore";

  let timeouts = new Map<number, number>();

  $effect(() => {
    const currentIds = new Set($notificationStore.map(n => n.id));

    // Clear timeouts for removed notifications
    for (const [id, timeoutId] of timeouts) {
      if (!currentIds.has(id)) {
        clearTimeout(timeoutId);
        timeouts.delete(id);
      }
    }

    // Set timeouts for new notifications
    for (const notification of $notificationStore) {
      if (!timeouts.has(notification.id)) {
        const timeoutId = setTimeout(() => {
          hideNotification(notification.id);
        }, notification.timeout);
        timeouts.set(notification.id, timeoutId);
      }
    }
  });
</script>

{#each $notificationStore as notification, index (notification.id)}
  <div
    class="fixed right-4 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-4 z-50 flex items-center gap-3 max-w-xs"
    style="bottom: {2 + index * 4.5}rem"
    transition:fly={{ x: 320, duration: 500, easing: cubicOut }}
  >
    <div class="flex items-center gap-2">
      {#if notification.type === 'share'}
        <svg
          class="w-5 h-5 text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      {:else if notification.type === 'favorite'}
        <svg
          class="w-5 h-5 text-yellow-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      {/if}
      <span class="text-slate-200 text-sm font-medium">{notification.text}</span>
    </div>
    <button
      onclick={() => hideNotification(notification.id)}
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
{/each}