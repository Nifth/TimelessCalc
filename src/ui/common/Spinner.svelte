<script lang="ts">
  let { text = "Loading..." }: { text?: string } = $props();
</script>

<div class="flex flex-col items-center gap-4">
  <div class="w-10 h-10 border-3 border-slate-500 border-t-blue-400 rounded-full animate-spin"></div>
  <span class="text-slate-200 text-lg font-medium">{text}</span>
</div>

<style>
  .border-3 {
    border-width: 3px;
  }
</style>
