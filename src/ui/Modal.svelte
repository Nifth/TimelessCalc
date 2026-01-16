<script lang="ts">
  let { message, onConfirm, onCancel } = $props<{
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }>();
</script>

<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <div class="bg-slate-800 rounded-xl shadow-2xl p-6 max-w-md w-full border border-slate-700">
    <p class="text-slate-200 text-lg mb-6">{message}</p>
    <div class="flex gap-3">
      <button
        type="button"
        onclick={onCancel}
        class="flex-1 py-2 px-4 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium cursor-pointer transition-all duration-200"
      >
        Cancel
      </button>
      <button
        type="button"
        onclick={onConfirm}
        class="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium cursor-pointer transition-all duration-200"
      >
        Continue
      </button>
    </div>
  </div>
</div>
