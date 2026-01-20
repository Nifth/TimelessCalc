<script lang="ts">
  import { onMount } from "svelte";
  import { perfMonitor } from "$lib/utils/performanceMonitor";

  export let isVisible: boolean = true;
  export let metrics: any = {};
  export let progress: number = 0;
  export let currentStep: string = "";
  export let fps: number = 0;

  let expanded: boolean = false;
  let lastTime: number = performance.now();
  let frameCount: number = 0;
  let memoryHistory: number[] = [];
  let exportData: string = "";

  function updateFPS() {
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      fps = frameCount;
      frameCount = 0;
      lastTime = now;
    }
    requestAnimationFrame(updateFPS);
  }

  function updateMetrics() {
    metrics = perfMonitor.getAllMetrics();
    memoryHistory.push(metrics.memory.current);
    if (memoryHistory.length > 20) memoryHistory.shift();
    setTimeout(updateMetrics, 100);
  }

  function exportMetrics() {
    exportData = perfMonitor.exportMetrics();
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timelesscalc-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  function formatDuration(ms: number): string {
    return ms < 1000 ? `${ms.toFixed(1)}ms` : `${(ms / 1000).toFixed(2)}s`;
  }

  onMount(() => {
    updateFPS();
    updateMetrics();
  });
</script>

{#if isVisible}
  <div class="debug-panel" class:expanded>
    <div class="header" on:click={() => (expanded = !expanded)}>
      <span class="title">Debug Panel</span>
      <span class="fps">{fps} FPS</span>
    </div>

    {#if expanded}
      <div class="content">
        <div class="section">
          <h4>Progress</h4>
          <div class="progress-bar">
            <div class="progress-fill" style="width: {progress}%"></div>
          </div>
          <p>{currentStep} ({progress.toFixed(1)}%)</p>
        </div>

        <div class="section">
          <h4>Memory</h4>
          <p>Current: {formatBytes(metrics.memory?.current || 0)}</p>
          <p>Delta: {formatBytes(metrics.memory?.delta || 0)}</p>
          <p>Limit: {formatBytes(metrics.memory?.limit || 0)}</p>
          <div class="memory-graph">
            {#each memoryHistory as mem, i}
              <div
                class="memory-bar"
                style="height: {(mem / (metrics.memory?.limit || 1)) * 100}%"
              ></div>
            {/each}
          </div>
        </div>

        <div class="section">
          <h4>Timing</h4>
          {#each Object.entries(metrics.timing || {}) as [key, measure] (key)}
            <p>
              {key}: {formatDuration((measure as PerformanceMeasure).duration)}
            </p>
          {/each}
        </div>

        <div class="section">
          <h4>Network</h4>
          <p>Requests: {metrics.network?.requestCount || 0}</p>
          <p>
            Total Size: {formatBytes(metrics.network?.totalTransferred || 0)}
          </p>
          <p>
            Total Duration: {formatDuration(
              metrics.network?.totalDuration || 0,
            )}
          </p>
        </div>

        <button on:click={exportMetrics}>Export Metrics</button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .debug-panel {
    position: fixed;
    top: 10px;
    right: 10px;
    width: 300px;
    max-height: 80vh;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    z-index: 10000;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .debug-panel:not(.expanded) {
    width: 200px;
    max-height: 50px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.1);
  }

  .content {
    padding: 8px;
    max-height: calc(80vh - 50px);
    overflow-y: auto;
  }

  .section {
    margin-bottom: 12px;
  }

  .section h4 {
    margin: 0 0 4px 0;
    color: #4caf50;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #4caf50;
    transition: width 0.3s ease;
  }

  .memory-graph {
    display: flex;
    align-items: end;
    height: 30px;
    gap: 1px;
  }

  .memory-bar {
    flex: 1;
    background: #ff9800;
    min-height: 1px;
  }

  button {
    width: 100%;
    padding: 6px;
    background: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background: #1976d2;
  }
</style>
