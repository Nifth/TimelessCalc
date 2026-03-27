<script lang="ts">
  /* global localStorage */
  import { fade, scale } from "svelte/transition";
  import { onMount } from "svelte";
  import { X, Sparkles } from "lucide-svelte";

  interface Feature {
    name: string;
    description: string;
    mediaUrl?: string;
  }

  interface ReleaseData {
    version: string;
    title: string;
    date: string;
    features: Feature[];
  }

  interface Props {
    releaseData: ReleaseData;
  }

  let { releaseData }: Props = $props();
  let visible = $state(false);

  onMount(() => {
    const lastSeen = localStorage.getItem("last_seen_version");
    if (lastSeen !== releaseData.version) {
      localStorage.setItem("last_seen_version", releaseData.version);
      visible = true;
    }
  });

  function close() {
    visible = false;
  }
</script>

{#if visible}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-1000 flex items-center justify-center p-4"
    transition:fade={{ duration: 200 }}
    onclick={close}
    onkeydown={(e) => e.key === "Escape" && close()}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 max-w-4xl w-full flex flex-col max-h-[80vh] overflow-hidden"
      transition:scale={{ duration: 200, start: 0.95 }}
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="flex items-start justify-between p-6 pb-4 border-b border-slate-700 shrink-0">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1.5 bg-blue-600/20 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-500/30">
            <Sparkles size={12} />
            {releaseData.version}
          </span>
          <div>
            <h2 class="text-xl font-semibold text-white">{releaseData.title}</h2>
            <p class="text-sm text-slate-400 mt-0.5">{releaseData.date}</p>
          </div>
        </div>
        <button
          class="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700 cursor-pointer"
          onclick={close}
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        {#each releaseData.features as feature, i (feature.name)}
          <div class="space-y-3">
            <div>
              <h3 class="text-base font-semibold text-slate-100">
                {#if releaseData.features.length > 1}
                  <span class="text-blue-400 mr-2">{String(i + 1).padStart(2, "0")}.</span>
                {/if}
                {feature.name}
              </h3>
              <p class="text-sm text-slate-300 leading-relaxed mt-1">{@html feature.description}</p>

              {#if feature.mediaUrl}
                <div class="mt-2 relative rounded-lg overflow-hidden bg-slate-900 border-2 border-teal-400">
                  <img
                    src={feature.mediaUrl}
                    alt={feature.name}
                    class="object-cover rounded-lg"
                    loading="lazy"
                  />
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}
