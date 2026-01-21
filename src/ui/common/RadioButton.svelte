<script lang="ts">
  interface Props {
    _value: unknown;
    label: string;
    isSelected: boolean;
    onclick: () => void;
    size?: "sm" | "md" | "lg";
  }

  let { _value, label, isSelected, onclick, size = "md" }: Props = $props();

  const sizeClasses =
    size === "lg"
      ? "px-4 py-3"
      : size === "sm"
        ? "px-2 py-2"
        : "px-3 py-2.5";

  const textSize = size === "lg" ? "" : "text-sm";
</script>

<button
  type="button"
  {onclick}
  class="w-full {sizeClasses} cursor-pointer rounded-lg border-2 text-center {textSize} transition-all duration-200 font-medium {isSelected
    ? 'border-blue-400 bg-slate-700/50 text-white shadow-lg shadow-blue-500/10'
    : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500 hover:bg-slate-700'}"
>
  {label}
</button>
