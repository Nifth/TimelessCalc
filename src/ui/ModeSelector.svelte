<script lang="ts">
  interface Props {
    mode: "seed" | "stats" | null;
    disabled?: boolean;
    onselectmode: (mode: "seed" | "stats") => void;
  }

  let { mode, disabled = false, onselectmode }: Props = $props();
</script>

<div class="flex gap-2">
  <button
    onclick={() => onselectmode("seed")}
    class="flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 {disabled
      ? 'cursor-not-allowed'
      : 'cursor-pointer'} {mode === 'seed'
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}"
    disabled={disabled}
  >
    Enter Seed
  </button>
  <button
    onclick={() => onselectmode("stats")}
    class="flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 {disabled
      ? 'cursor-not-allowed'
      : 'cursor-pointer'} {mode === 'stats'
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}"
    disabled={disabled}
  >
    Select Stats
  </button>
</div>
