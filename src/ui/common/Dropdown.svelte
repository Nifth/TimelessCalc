<script lang="ts">
let {
	label,
	options = [],
	selectedValue,
	onSelect,
	loading = false,
	loadingText = "Loading...",
	dropdownClass = "",
	id,
	truncate = true,
}: {
	label?: string;
	options: Array<{ value: string; display?: string }>;
	selectedValue: string;
	onSelect: (value: string) => void;
	loading?: boolean;
	loadingText?: string;
	dropdownClass?: string;
	id?: string;
	truncate?: boolean;
} = $props();

let isOpen = $state(false);

function handleSelect(value: string) {
	onSelect(value);
	isOpen = false;
}

function handleSelectWithPreventDefault(value: string, e: MouseEvent) {
	e.preventDefault();
	handleSelect(value);
}

function handleBlur() {
	isOpen = false;
}

function handleKeydown(e: KeyboardEvent) {
	if (e.key === "Escape") {
		isOpen = false;
	}
}

function getDisplayValue(option: { value: string; display?: string }): string {
	return option.display || option.value;
}

const uniqueId = id || `dropdown-${crypto.randomUUID()}`;
</script>

<svelte:window onkeydown={handleKeydown} />

{#if loading}
  <div
    class="w-full py-2.5 px-4 rounded-lg bg-slate-700 border border-slate-600 text-slate-400 font-medium flex items-center justify-between"
  >
    <span>{loadingText}</span>
    <div
      class="w-4 h-4 border-2 border-slate-500 border-t-blue-400 rounded-full animate-spin"
    ></div>
  </div>
{:else}
  <div class="relative {dropdownClass}">
    {#if label}
      <label
        for={uniqueId}
        class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 block"
      >
        {label}
      </label>
    {/if}
    <div>
      <button
        id={uniqueId}
        type="button"
        onclick={() => (isOpen = !isOpen)}
        onblur={handleBlur}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        class="w-full py-2.5 px-4 rounded-lg bg-slate-700 border border-slate-600 text-white text-left font-medium cursor-pointer transition-all duration-200 flex items-center justify-between hover:bg-slate-600 hover:border-slate-500"
      >
        <span class="{truncate ? 'truncate' : ''} text-nowrap"
          >{selectedValue}</span
        >
        <svg
          class="w-4 h-4 transition-transform duration-200 {isOpen
            ? 'rotate-180'
            : ''} flex-shrink-0 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {#if isOpen}
        <div
          role="listbox"
          class="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-10 overflow-hidden min-w-[12rem] max-h-60 overflow-y-auto"
        >
          {#each options as option (option.value)}
            <button
              type="button"
              role="option"
              aria-selected={selectedValue === option.value}
              class="w-full px-4 py-2.5 text-left cursor-pointer transition-all duration-150 {selectedValue ===
              option.value
                ? 'bg-blue-600 text-white'
                : 'text-slate-200 hover:bg-slate-700'}"
              onmousedown={(e) =>
                handleSelectWithPreventDefault(option.value, e)}
            >
              {getDisplayValue(option)}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}
