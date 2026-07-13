export async function withPerf<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const end = performance.now();
    const duration = (end - start).toFixed(2);
    
    // Color coding based on latency thresholds
    let color = "\x1b[32m"; // Green (< 100ms)
    if (end - start >= 500) {
      color = "\x1b[31m"; // Red (> 500ms)
    } else if (end - start >= 100) {
      color = "\x1b[33m"; // Yellow (100ms - 500ms)
    }
    const reset = "\x1b[0m";

    console.log(`[PERF] ${name}: ${color}${duration}ms${reset}`);
  }
}
