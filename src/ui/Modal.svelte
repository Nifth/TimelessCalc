<script lang="ts">
  let { message, onConfirm, onCancel } = $props<{
    message: string;
    onConfirm?: () => void;
    onCancel: () => void;
  }>();
</script>

<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <div class="bg-slate-800 rounded-xl shadow-2xl p-6 max-w-md w-full border border-slate-700">
    <p class="text-slate-200 text-lg mb-6">{message}</p>
     <div class="flex gap-3">
       {#if onConfirm}
         <button
           type="button"
           onclick={onConfirm}
           class="flex-1 py-2 px-4 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium cursor-pointer transition-all duration-200"
         >
           Confirm
         </button>
       {/if}
       <button
         type="button"
         onclick={onCancel}
         class="{onConfirm ? 'flex-1' : 'w-full'} py-2 px-4 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium cursor-pointer transition-all duration-200"
       >
         {onConfirm ? 'Cancel' : 'OK'}
       </button>
     </div>
  </div>
</div>
