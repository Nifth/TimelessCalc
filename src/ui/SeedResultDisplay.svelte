<script lang="ts">
  interface Props {
    seed: number | null;
  }

  let { seed }: Props = $props();
</script>

<div class="bg-slate-800 rounded-lg p-4">
  <h3 class="text-lg font-semibold text-white mb-2">Seed Applied</h3>
  <p class="text-slate-300">Seed {seed} has been applied successfully.</p>
</div>
