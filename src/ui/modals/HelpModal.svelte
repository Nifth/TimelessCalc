<script lang="ts">
  interface Props {
    onclose: () => void;
  }

  let { onclose }: Props = $props();

  let activeTab = $state<"search" | "favorites" | "share">("search");

  function setTab(tab: "search" | "favorites" | "share") {
    activeTab = tab;
  }
</script>

<div
  class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
  onclick={onclose}
  role="button"
  tabindex="0"
  onkeydown={(e) => e.key === "Escape" && onclose()}
>
  <div
    class="bg-slate-800 rounded-xl shadow-2xl p-6 max-w-4xl w-full border border-slate-700 flex flex-col max-h-[80vh]"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => (e.key === "Enter" || e.key === " ") && e.stopPropagation()}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <h2 class="text-2xl font-semibold mb-4 text-blue-400">TimelessCalc Help</h2>

    <div class="flex gap-1 border-b border-slate-600 mb-4">
      <button
        class="flex-1 py-2 transition-colors cursor-pointer {activeTab ===
        'search'
          ? 'text-white border-b-2 border-blue-400'
          : 'text-slate-400 hover:text-slate-200'}"
        onclick={() => setTab("search")}
      >
        Search Configuration
      </button>
      <button
        class="flex-1 py-2 transition-colors cursor-pointer {activeTab ===
        'favorites'
          ? 'text-white border-b-2 border-blue-400'
          : 'text-slate-400 hover:text-slate-200'}"
        onclick={() => setTab("favorites")}
      >
        Favorites &amp; History
      </button>
      <button
        class="flex-1 py-2 transition-colors cursor-pointer {activeTab ===
        'share'
          ? 'text-white border-b-2 border-blue-400'
          : 'text-slate-400 hover:text-slate-200'}"
        onclick={() => setTab("share")}
      >
        Share &amp; Export
      </button>
    </div>

    <div class="bg-slate-900 p-6 rounded-lg text-slate-200 text-sm leading-relaxed flex-1 overflow-hidden flex flex-col">
      {#if activeTab === "search"}
        <div class="overflow-y-auto custom-scrollbar flex-1 pr-2">
          <p class="mb-4 text-base font-semibold text-slate-100">Overview</p>
          <p class="mb-6">Find optimal Timeless Jewels based on your build's allocated passive nodes. Each jewel type has thousands of variants (seeds), each modifying different nodes with different stats.</p>

          <p class="mb-3 text-base font-semibold text-slate-100">Search Modes</p>
          <div class="mb-4 pl-4 border-l-2 border-slate-600">
            <p class="mb-2"><strong class="text-blue-300">Enter Seed:</strong> Input a known seed number to preview its effects on allocated nodes.</p>
            <p><strong class="text-blue-300">Select Stats:</strong> Search for seeds that provide desired stats based on your allocated nodes.</p>
          </div>

          <p class="mb-3 text-base font-semibold text-slate-100">Stats Search Features</p>
          <div class="mb-4 space-y-3">
            <p><strong class="text-blue-300">Add Multiple Stats:</strong> Search for several stats simultaneously using the autocomplete dropdown.</p>
            <p><strong class="text-blue-300">Weight:</strong> Multiplier for importance. Higher weight = higher priority in scoring. Default is 1.</p>
            <p><strong class="text-blue-300">Min Value/Occurrences:</strong> Minimum threshold requirement for each stat. Seeds must meet this threshold to be included.</p>
            <p><strong class="text-blue-300">Exclude Toggle:</strong> Filter out seeds that contain a specific stat (useful for build bricking modifiers).</p>
            <p><strong class="text-blue-300">Min Total Weight:</strong> Overall minimum score across all stats. Seeds below this are filtered out.</p>
            <p><strong class="text-blue-300">Glorious Vanity Only:</strong> Choose between two search modes:</p>
            <div class="pl-4 border-l-2 border-slate-600 mt-2">
              <p class="mb-1"><strong>Occurrences:</strong> Count how many allocated nodes have each stat</p>
              <p><strong>Total Value:</strong> Sum the actual stat values on allocated nodes</p>
            </div>
          </div>

          <div class="mb-6 p-4 bg-slate-800 rounded-lg">
            <p class="mb-3 font-semibold text-blue-300">Weight Calculation Example</p>
            <p class="mb-2">If you search for <span class="text-green-600">+%Strength</span> (weight: 5) and <span class="text-green-300">+maximum Fortification</span> (weight: 1):</p>
            <div class="pl-4 border-l-2 border-slate-600 mb-2">
              <p class="mb-1">Seed A: <span class="text-green-600">+%Strength</span> (2 nodes), <span class="text-green-300">+maximum Fortification</span> (1 node)</p>
              <p class="text-slate-400">→ (2 × 5) + (1 × 1) = <strong class="text-blue-300">11 total weight</strong></p>
            </div>
            <div class="pl-4 border-l-2 border-slate-600">
              <p class="mb-1">Seed B: <span class="text-green-600">+%Strength</span> (1 nodes), <span class="text-green-300">+maximum Fortification</span> (3 nodes)</p>
              <p class="text-slate-400">→ (1 × 5) + (3 × 1) = <strong class="text-blue-300">8 total weight</strong></p>
            </div>
            <p class="mt-3 text-slate-400 text-xs">Seed A ranks higher despite less affected nodes, because it matches your weight priorities.</p>
          </div>

          <p class="mb-3 text-base font-semibold text-slate-100">Tree Allocation</p>
          <div class="mb-4 space-y-2">
            <p><strong class="text-blue-300">Click any node</strong> on the passive tree to allocate or unallocate it.</p>
            <p><strong class="text-blue-300">Stats search only considers allocated nodes</strong> within the jewel's radius.</p>
            <p>Use the <strong class="text-blue-300">Notable/Small toggles</strong> to quickly allocate all nodes of that type in the jewel's radius.</p>
          </div>

          <p class="mb-3 text-base font-semibold text-slate-100">Trade Integration</p>
          <p class="mb-2">Browse results grouped by total weight, click any seed to preview it on the tree, then click <strong class="text-blue-300">Trade</strong> to search PoE Trade. Pagination handles large result sets automatically.</p>
        </div>

      {:else if activeTab === "favorites"}
        <div class="overflow-y-auto custom-scrollbar flex-1 pr-2">
          <p class="mb-4 text-base font-semibold text-slate-100">Favorites</p>
          <div class="mb-6 space-y-2">
            <p>Click the <strong class="text-blue-300">heart icon</strong> after any search to save it.</p>
            <p>Give your saved search a custom name (an auto-generated suggestion is provided).</p>
            <p>Rename, delete, load, or share favorites anytime from the Favorites tab.</p>
          </div>

          <p class="mb-4 text-base font-semibold text-slate-100">History</p>
          <div class="mb-6 space-y-2">
            <p>Automatically saves your last 10 searches, no manual action required.</p>
            <p>View, load, or delete entries from the History tab.</p>
          </div>

          <div class="p-4 bg-slate-800 rounded-lg border border-green-800">
            <p class="mb-2 font-semibold text-green-400">Important: Privacy Notice</p>
            <p class="leading-relaxed">All your data (favorites, history) is stored locally in your browser. Nothing is sent to any server or retained by us. Your configurations are private and remain on your device.</p>
          </div>
        </div>

      {:else if activeTab === "share"}
        <div class="overflow-y-auto custom-scrollbar flex-1 pr-2">
          <p class="mb-4 text-base font-semibold text-slate-100">Share</p>
          <div class="mb-6 space-y-2">
            <p>Click the <strong class="text-blue-300">share icon</strong> to copy a URL with your current configuration.</p>
            <p>Share favorites directly from the Favorites list using the share icon.</p>
            <p>Paste the URL anywhere—the recipient's app loads the configuration automatically.</p>
          </div>

          <p class="mb-3 text-base font-semibold text-slate-100">What's in a Shared URL?</p>
          <div class="mb-6 pl-4 border-l-2 border-slate-600 space-y-1">
            <p>Jewel type and conqueror</p>
            <p>Selected stats with weights, thresholds and exclude flags</p>
            <p>Allocated nodes (skill IDs)</p>
            <p>Selected jewel socket</p>
            <p>Search settings (mode, min total weight)</p>
          </div>

          <p class="mb-4 text-base font-semibold text-slate-100">Export</p>
          <div class="mb-6 space-y-2">
            <p>Export your jewel configuration in <strong class="text-blue-300">PoB format</strong> for Path of Building.</p>
            <p>Copy and paste directly into your build to import the jewel data.</p>
          </div>
        </div>
      {/if}
    </div>

    <button
      class="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-lg font-medium cursor-pointer transition-all duration-200"
      onclick={onclose}
    >
      Close
    </button>
  </div>
</div>
