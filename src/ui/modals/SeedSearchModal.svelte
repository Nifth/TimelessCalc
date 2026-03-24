<script lang="ts">
  import { onMount } from "svelte";
  import { jewelTypes } from "$lib/constants/timeless";
  import type { JewelType, SeedSearchResults, SocketResult, StatModification } from "$lib/types";
  import RadioButton from "$lib/ui/common/RadioButton.svelte";
  import { calculateSeed } from "$lib/utils/Timeless/calculator";
  import { canvas } from "$lib/canvas/canvasContext";
  import { parseClipboard } from "$lib/utils/clipboard/clipboardParser";
  import { findNearbyKeystone } from "$lib/utils/formatters";
  import { formatStatTranslation } from "$lib/utils/sidebar/sidebarUtils";
  import { translations } from "$lib/providers/translations";

  interface Props {
    onclose: () => void;
    onresults: (results: SeedSearchResults) => void;
    triggerPaste: boolean;
  }

  let { onclose, onresults, triggerPaste = false }: Props = $props();

  let seedInput = $state("");
  let selectedJewelType = $state<JewelType | null>(null);
  let results = $state<Record<string, SocketResult> | null>(null);
  let error = $state<string | null>(null);
  let searchTimeout: number | null = $state(null);

  function handleInput() {
    if (searchTimeout) window.clearTimeout(searchTimeout);
    searchTimeout = window.setTimeout(() => {
      analyzeSeed();
    }, 50);
  }

  onMount(async () => {
    try {
      if (triggerPaste) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const parsed = parseClipboard(text);
          if (parsed) {
            seedInput = parsed.seed.toString();
            if (parsed.jewelType) {
              selectedJewelType = parsed.jewelType;
            }
            analyzeSeed();
          }
        }
      }
    } catch {
      silentlyIgnore();
    }
  });

  async function parseClipboardAndFill() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const parsed = parseClipboard(text);
        if (parsed) {
          seedInput = parsed.seed.toString();
          if (parsed.jewelType) {
            selectedJewelType = parsed.jewelType;
          }
          analyzeSeed();
        }
      }
    } catch {
      silentlyIgnore();
    }
  }

  function silentlyIgnore() {
    return;
  }

  async function analyzeSeed() {
    const seed = parseInt(seedInput, 10);
    if (isNaN(seed)) {
      error = "Please enter a valid seed number";
      return;
    }

    if (!selectedJewelType) {
      error = "Please select a jewel type";
      return;
    }
    if (
      isNaN(seed) ||
      !selectedJewelType ||
      seed < selectedJewelType.min ||
      seed > selectedJewelType.max
    ) {
      return;
    }

    error = null;

    try {
      const socketIds = Object.keys(canvas.treeData.socketNodes);
      const socketResults: Record<string, SocketResult> = {};

      for (const socketId of socketIds) {
        try {
          const modifications = await calculateSeed(seed, selectedJewelType.id);
          if (modifications) {
            const socketMod = modifications[socketId];
            if (socketMod) {
              const replacementsMap: Map<number, StatModification> = new Map();
              const additionsMap: Map<number, StatModification> = new Map();

              for (const [key, nodeIds] of Object.entries(socketMod.r)) {
                if (nodeIds && nodeIds.length > 0) {
                  const { rid, stats } = parseKey(key);
                  const existing = replacementsMap.get(rid);
                  if (existing) {
                    for (const [statId, value] of Object.entries(stats)) {
                      existing.statValues[statId] = (existing.statValues[statId] || 0) + value;
                    }
                    existing.nodeIds.push(...nodeIds);
                    existing.occurrenceCount += nodeIds.length;
                    existing.statLabel = getStatLabel(existing.statValues);
                  } else {
                    const statValues = { ...stats };
                    if (Object.entries(statValues).length > 0) {
                        replacementsMap.set(rid, {
                            statKey: rid,
                            statValues,
                            statLabel: getStatLabel(statValues),
                            nodeIds: [...nodeIds],
                            occurrenceCount: nodeIds.length
                        });
                    }
                  }
                }
              }

              for (const [key, nodeIds] of Object.entries(socketMod.a)) {
                if (nodeIds && nodeIds.length > 0) {
                  const { rid, stats } = parseKey(key);
                  const existing = additionsMap.get(rid);
                  if (existing) {
                    for (const [statId, value] of Object.entries(stats)) {
                      existing.statValues[statId] = (existing.statValues[statId] || 0) + value;
                    }
                    existing.nodeIds.push(...nodeIds);
                    existing.occurrenceCount += nodeIds.length;
                    existing.statLabel = getStatLabel(existing.statValues);
                  } else {
                    const statValues = { ...stats };
                    additionsMap.set(rid, {
                      statKey: rid,
                      statValues,
                      statLabel: getStatLabel(statValues),
                      nodeIds: [...nodeIds],
                      occurrenceCount: nodeIds.length
                    });
                  }
                }
              }

              const replacements: StatModification[] = Array.from(replacementsMap.values());
              const additions: StatModification[] = Array.from(additionsMap.values());

              replacements.sort((a, b) => b.occurrenceCount - a.occurrenceCount);
              additions.sort((a, b) => b.occurrenceCount - a.occurrenceCount);

              socketResults[socketId] = {
                socketId,
                replacements,
                additions
              };
            }
          }
        } catch {
          silentlyIgnore();
        }
      }

      results = socketResults;

      const seedResults: SeedSearchResults = {
        seed,
        jewelType: selectedJewelType,
        socketResults
      };

      onresults(seedResults);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      error = `Failed to analyze seed: ${errorMessage}`;
    }
  }

  function parseKey(key: string): { rid: number; stats: Record<string, number> } {
    const dashIndex = key.indexOf("-");
    const rid = parseInt(key.slice(0, dashIndex), 10);
    const stats = JSON.parse(key.slice(dashIndex + 1));
    return { rid, stats };
  }

  function getStatLabel(statValues: Record<string, number>): string {
    const labels = Object.entries(statValues)
      .map(([statId, value]) => formatStatTranslation(parseInt(statId), value, translations))
      .filter(Boolean);
    return labels.join(" / ");
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onclose();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const hasClipboardData = 'clipboardData' in e && e.clipboardData !== null;
    if (!hasClipboardData) return;

    const text = e.clipboardData.getData("text");
    if (text) {
      const parsed = parseClipboard(text);
      if (parsed) {
        seedInput = parsed.seed.toString();
        if (parsed.jewelType) {
          selectedJewelType = parsed.jewelType;
        }
      }
    }
  }
</script>

<div
  class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
  role="dialog"
  aria-modal="true"
  tabindex="0"
  onkeydown={handleKeydown}
>
  <div
    class="bg-slate-800 flex flex-col w-full h-full"
  >
    <div class="flex justify-between items-center p-6 border-b border-slate-700">
      <h2 class="text-2xl font-semibold text-blue-400">Analyze Seed</h2>
      <button
        onclick={onclose}
        class="text-slate-400 hover:text-white transition-colors text-2xl cursor-pointer"
        aria-label="Close"
      >
        ×
      </button>
    </div>

    <div class="bg-slate-900 p-6">
      <div class="flex flex-wrap items-center gap-4 mb-4">
        <div class="flex-1 min-w-[200px]">
          <div class="relative">
            <input
              type="number"
              bind:value={seedInput}
              oninput={handleInput}
              onpaste={handlePaste}
              class="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Enter seed"
              step="1"
            />
            <button
              onclick={parseClipboardAndFill}
              class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
              title="Paste from clipboard (Ctrl+V)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h2zm-3-1a1.5 1.5 0 0 0-1.5 1.5v1a1.5 1.5 0 0 0 1.5 1.5h2a1.5 1.5 0 0 0 1.5-1.5v-1a1.5 1.5 0 0 0-1.5-1.5h-2z"/>
              </svg>
            </button>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            {selectedJewelType ? `Range: ${selectedJewelType.min.toLocaleString()} - ${selectedJewelType.max.toLocaleString()}` : 'Select jewel type'}
          </p>
        </div>

        <div class="flex gap-2 items-center">
          {#each jewelTypes as jewel (jewel.name)}
            <label class="relative cursor-pointer">
              <input
                type="radio"
                bind:group={selectedJewelType}
                value={jewel}
                class="sr-only"
              />
              <RadioButton
                _value={jewel}
                label={jewel.label}
                isSelected={selectedJewelType?.name === jewel.name}
                size="lg"
                onclick={() => {
                  selectedJewelType = jewel;
                  analyzeSeed();
                }}
              />
            </label>
          {/each}
        </div>
      </div>

      {#if error}
        <div class="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
          {error}
        </div>
      {/if}
    </div>

    {#if results && Object.keys(results).length > 0}
      <div class="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div class="grid grid-cols-4 gap-4">
          {#each Object.entries(results).sort(([a], [b]) => a.localeCompare(b, undefined, {numeric: true})) as [socketId, socketResult] (socketId)}
            <div class="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <h4 class="text-sm font-semibold text-blue-300 mb-1">Socket {socketId}: {findNearbyKeystone(canvas.treeData.nodes[socketId], canvas.treeData.nodes, canvas.treeData)}</h4>
              {#if canvas.treeData.nodes[socketId]?.expansionJewel}
                <p class="text-xs text-amber-400 font-medium mb-2">/!\ Cluster Jewel</p>
              {/if}

              {#if socketResult.replacements.length > 0 || socketResult.additions.length > 0}
                <div>
                  {#each socketResult.replacements as mod (mod.statKey)}
                    <div class="px-1 py-0.5 hover:bg-slate-800 rounded text-sm">
                      <span class="text-green-400">({mod.occurrenceCount})</span>
                      <span class="text-slate-300"> {mod.statLabel}</span>
                    </div>
                  {/each}
                  {#each socketResult.additions as mod (mod.statKey)}
                    <div class="px-1 py-0.5 hover:bg-slate-800 rounded text-sm">
                      <span class="text-blue-400">({mod.occurrenceCount})</span>
                      <span class="text-slate-300"> {mod.statLabel}</span>
                    </div>
                  {/each}
                </div>
              {:else}
                <div class="text-slate-500 italic text-sm">No modifications</div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {:else if results}
      <div class="flex-1 flex items-center justify-center">
        <div class="text-slate-400">No modifications found for this seed</div>
      </div>
    {/if}
  </div>
</div>
