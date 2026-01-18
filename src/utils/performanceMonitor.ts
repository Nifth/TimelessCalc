import type { PerformanceMetrics } from "$lib/types";

export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, PerformanceMeasure> = new Map();
  private initialMemory: number = 0;

  constructor() {
    this.initialMemory = this.getMemoryUsage();
  }

  mark(name: string): void {
    performance.mark(name);
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string, endMark: string): PerformanceMeasure | null {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0] as PerformanceMeasure;
      this.measures.set(name, measure);
      return measure;
    } catch (e) {
      console.warn(`Failed to measure ${name}:`, e);
      return null;
    }
  }

  getMemoryDelta(): number {
    return this.getMemoryUsage() - this.initialMemory;
  }

  getMemoryUsage(): number {
    // @ts-expect-error - Chrome-specific
    return performance.memory?.usedJSHeapSize || 0;
  }

  getTotalMemory(): number {
    // @ts-expect-error
    return performance.memory?.totalJSHeapSize || 0;
  }

  getMemoryLimit(): number {
    // @ts-expect-error
    return performance.memory?.jsHeapSizeLimit || 0;
  }

  getResourceTiming(urlPattern?: string): PerformanceResourceTiming[] {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return urlPattern ? resources.filter(r => r.name.includes(urlPattern)) : resources;
  }

  getNetworkStats(): { totalTransferred: number; totalDuration: number; requestCount: number } {
    const resources = this.getResourceTiming();
    return {
      totalTransferred: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
      totalDuration: resources.reduce((sum, r) => sum + r.duration, 0),
      requestCount: resources.length
    };
  }

  getAllMetrics(): PerformanceMetrics {
    const networkStats = this.getNetworkStats();
    return {
      timing: Object.fromEntries(this.measures),
      memory: {
        initial: this.initialMemory,
        current: this.getMemoryUsage(),
        total: this.getTotalMemory(),
        limit: this.getMemoryLimit(),
        delta: this.getMemoryDelta()
      },
      network: networkStats,
      canvas: {} // Will be populated by canvas-specific code
    };
  }

  clearMarks(): void {
    performance.clearMarks();
    this.marks.clear();
  }

  clearMeasures(): void {
    performance.clearMeasures();
    this.measures.clear();
  }

  exportMetrics(): string {
    return JSON.stringify(this.getAllMetrics(), null, 2);
  }
}

export const perfMonitor = new PerformanceMonitor();