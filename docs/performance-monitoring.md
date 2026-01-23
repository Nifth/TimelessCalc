# Performance Monitoring System

## Overview

The TimelessCalc application includes a comprehensive performance monitoring system that tracks various metrics to help optimize and debug the application. The system consists of three main components:

1. **PerformanceMonitor** - Core monitoring functionality
2. **DebugPanel** - UI component for real-time metrics visualization
3. **PerformanceMetrics** - Type definitions for metrics data

## PerformanceMonitor

The `PerformanceMonitor` class provides low-level performance tracking capabilities using the browser's Performance API.

### Usage

```typescript
import { perfMonitor } from "$lib/utils/performanceMonitor";

// Mark performance points
perfMonitor.mark("operation-start");

// Execute some code
doSomethingExpensive();

// Measure the duration
perfMonitor.measure("operation-duration", "operation-start", "operation-end");

// Get all metrics
const metrics = perfMonitor.getAllMetrics();

// Export metrics for analysis
const jsonData = perfMonitor.exportMetrics();
```

### API Methods

#### `mark(name: string): void`

Creates a performance mark at the current time.

#### `measure(name: string, startMark: string, endMark: string): PerformanceMeasure | null`

Measures the duration between two marks. Returns null if measurement fails.

#### `getAllMetrics(): PerformanceMetrics`

Returns a comprehensive object containing all tracked metrics.

#### `exportMetrics(): string`

Exports all metrics as a formatted JSON string.

#### Memory Methods

- `getMemoryUsage(): number` - Current JS heap usage
- `getMemoryDelta(): number` - Memory usage change since initialization
- `getTotalMemory(): number` - Total allocated heap
- `getMemoryLimit(): number` - Heap size limit

#### Network Methods

- `getNetworkStats(): object` - Returns total transferred bytes, duration, and request count
- `getResourceTiming(urlPattern?: string): PerformanceResourceTiming[]` - Get resource timing data

## DebugPanel Component

The DebugPanel provides a real-time visualization of performance metrics in the UI.

### Props

```typescript
interface DebugPanelProps {
  isVisible?: boolean; // Show/hide the panel
  metrics?: PerformanceMetrics; // Metrics data
  progress?: number; // Loading progress (0-100)
  currentStep?: string; // Current loading step
  fps?: number; // Current FPS
}
```

### Features

- **Collapsible interface** - Click header to expand/collapse
- **Real-time metrics** - Updates every 100ms
- **Memory graph** - Visual history of memory usage
- **Progress tracking** - Loading progress with animated bar
- **Export functionality** - Download metrics as JSON
- **Responsive design** - Fixed position, non-intrusive

### Usage in Components

```svelte
<script lang="ts">
  import DebugPanel from "$lib/ui/DebugPanel.svelte";
  import { perfMonitor } from "$lib/utils/performanceMonitor";
</script>

<DebugPanel
  isVisible={true}
  metrics={perfMonitor.getAllMetrics()}
  progress={loadingProgress}
  {currentStep}
  fps={currentFps}
/>
```

## PerformanceMetrics Interface

TypeScript interface defining the structure of performance data.

```typescript
interface PerformanceMetrics {
  timing: Record<string, PerformanceMeasure>; // Performance measures
  memory: {
    initial: number; // Memory at startup
    current: number; // Current memory usage
    total: number; // Total allocated heap
    limit: number; // Heap size limit
    delta: number; // Memory change since startup
  };
  network: {
    totalTransferred: number; // Bytes downloaded
    totalDuration: number; // Total network time
    requestCount: number; // Number of requests
  };
}
```

## Integration Points

### Tree.svelte

The main application component integrates performance monitoring:

```typescript
import { perfMonitor } from "$lib/utils/performanceMonitor";

// Mark initialization phases
perfMonitor.mark("init-start");
perfMonitor.mark("sprite-preload-start");
// ... rendering code ...
perfMonitor.measure(
  "sprite-preload",
  "sprite-preload-start",
  "sprite-preload-end",
);
```

## Best Practices

### When to Use Marks and Measures

1. **Mark** key application phases:

   ```typescript
   perfMonitor.mark("app-init-start");
   // Initialization code
   perfMonitor.mark("app-init-end");
   perfMonitor.measure("app-init", "app-init-start", "app-init-end");
   ```

2. **Measure** performance-critical operations:
   ```typescript
   perfMonitor.mark("search-start");
   const results = performSearch(query);
   perfMonitor.mark("search-end");
   perfMonitor.measure("search-operation", "search-start", "search-end");
   ```

### Memory Monitoring

- Memory metrics are Chrome-specific and may not be available in all browsers
- The system gracefully falls back to 0 when `performance.memory` is unavailable
- Monitor memory delta to detect potential leaks

### Network Monitoring

- Tracks all resource requests (images, scripts, data files)
- Useful for identifying large assets or slow-loading resources
- Can filter by URL pattern for specific analysis

## Performance Considerations

### Overhead

- Performance monitoring has minimal impact on application performance
- Marks and measures use native browser APIs
- Metrics collection runs at low frequency (100ms intervals)

### Memory Usage

- The monitoring system itself uses minimal memory
- Memory history is limited to 20 data points
- Metrics are garbage collected when exported

## Troubleshooting

### Common Issues

1. **Memory metrics unavailable**: Check browser compatibility (Chrome recommended)
2. **Performance API disabled**: Some browsers may restrict performance APIs
3. **High memory usage**: Check for metric history buildup or frequent exports

### Debug Tips

- Use the DebugPanel export feature to analyze metrics offline
- Compare metrics across different browsers/devices
- Monitor memory delta trends to identify potential leaks

## Future Enhancements

- Add performance budgets and alerting
- Implement performance regression detection
- Add user experience metrics (FID, CLS, LCP)
- Create performance dashboards for CI/CD integration</content>
  <parameter name="filePath">C:\Users\alexa\Documents\Projects\TimelessCalc\docs\performance-monitoring.md
