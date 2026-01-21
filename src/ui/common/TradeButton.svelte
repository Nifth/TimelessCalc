<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  interface Props {
    variant?: "primary" | "secondary";
    onclick?: HTMLButtonAttributes["onclick"];
    children: Snippet;
  }

  let {
    variant = "primary",
    onclick,
    children,
  }: Props = $props();

  const classes =
    variant === "primary"
      ? "bg-blue-600 hover:bg-blue-500 text-white"
      : "bg-blue-600/50 hover:bg-blue-600/70 text-blue-200";
</script>

<button
  type="button"
  {onclick}
  class="px-2 py-1 rounded text-xs font-medium cursor-pointer transition-all duration-200 {classes}"
>
  {@render children()}
</button>
