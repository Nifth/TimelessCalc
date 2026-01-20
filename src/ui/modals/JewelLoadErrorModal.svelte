<script lang="ts">
  import type { JewelType } from "$lib/types";

  interface Props {
    jewel: JewelType;
    errorMessage: string;
    onclose: () => void;
    onretry: () => void;
  }

  let { jewel, errorMessage, onclose, onretry }: Props = $props();

  const issueUrl = "https://github.com/Nifth/TimelessCalc/issues/new";

  function copyError() {
    const text = `Jewel: ${jewel.name}\nError: ${errorMessage}`;
    navigator.clipboard.writeText(text);
  }

  function reloadPage() {
    window.location.reload();
  }
</script>

<div
  class="modal-overlay"
  onclick={onclose}
  role="button"
  tabindex="0"
  onkeydown={(e) => e.key === "Escape" && onclose()}
>
  <div
    class="modal"
    onclick={(e) => e.stopPropagation()}
    role="dialog"
    aria-modal="true"
  >
    <h2>Failed to load {jewel.name} data</h2>
    <p class="error-message">{errorMessage}</p>

    <div class="actions">
      <button onclick={copyError}>Copy error</button>
      <button onclick={reloadPage}>Reload page</button>
      <button class="cancel" onclick={onclose}>Cancel</button>
    </div>

    <p class="help-text">
      If the issue persists, please <a
        href={issueUrl}
        target="_blank"
        rel="noopener noreferrer">open an issue</a
      >.
    </p>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: #2a2a2a;
    padding: 24px;
    border-radius: 8px;
    max-width: 400px;
    width: 90%;
    color: #e0e0e0;
  }

  h2 {
    margin: 0 0 16px 0;
    font-size: 18px;
    color: #ff6b6b;
  }

  .error-message {
    background: #1a1a1a;
    padding: 12px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    word-break: break-all;
    margin-bottom: 16px;
  }

  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    background: #4a4a4a;
    color: #e0e0e0;
  }

  button:hover {
    background: #5a5a5a;
  }

  button.cancel {
    background: #3a3a3a;
  }

  button.cancel:hover {
    background: #4a4a4a;
  }

  .help-text {
    margin-top: 16px;
    font-size: 13px;
    color: #888;
  }

  .help-text a {
    color: #6bb8ff;
  }
</style>
