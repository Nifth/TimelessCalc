<script lang="ts">
  interface Props {
    onclick: () => void;
  }

  let { onclick }: Props = $props();
</script>

<button
  onclick={onclick}
  title="Analyze seed accross all sockets"
  class="w-8 h-8 flex items-center justify-center text-[rgba(200,200,200,0.8)] hover:text-white transition-colors rounded cursor-pointer"
  aria-label="Analyze Seed"
>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
    <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
  </svg>
</button>
