<script lang="ts">
  let { isOpen = $bindable(false) }: { isOpen?: boolean } = $props();
</script>

<button
  onclick={() => (isOpen = !isOpen)}
  class="fixed top-4 left-4 z-50 bg-slate-800 hover:bg-slate-700 text-white w-10 h-10 rounded-lg flex flex-col justify-center items-center gap-1 cursor-pointer transition-all duration-200 shadow-lg border border-slate-600"
  aria-label="Toggle menu"
>
  <span
    class="w-5 h-0.5 bg-white rounded transition-all duration-300 {isOpen
      ? 'rotate-45 translate-y-1.5'
      : ''}"
  ></span>
  <span
    class="w-5 h-0.5 bg-white rounded transition-all duration-300 {isOpen
      ? 'opacity-0'
      : ''}"
  ></span>
  <span
    class="w-5 h-0.5 bg-white rounded transition-all duration-300 {isOpen
      ? '-rotate-45 -translate-y-1.5'
      : ''}"
  ></span>
</button>
