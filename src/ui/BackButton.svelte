<script lang="ts">
  interface Props {
    onclick: () => void;
  }

  let { onclick }: Props = $props();
</script>

<button
  onclick={onclick}
  class="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
>
  <svg
    class="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M15 19l-7-7 7-7"
    />
  </svg>
  Back to Search
</button>
