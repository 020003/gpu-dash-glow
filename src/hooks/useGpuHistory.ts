import { useEffect, useMemo, useState } from "react";
import type { NvidiaSmiResponse } from "@/types/gpu";

export type GpuHistoryPoint = {
  t: number;
  util: number;
  memUsed: number;
  memTotal: number;
  temp: number;
  power: number;
};

interface UseGpuHistoryOptions {
  data?: NvidiaSmiResponse;
  intervalMs: number;
  maxPoints?: number;
}

// Keeps an in-memory rolling history of GPU metrics per GPU id/uuid
export function useGpuHistory({ data, intervalMs, maxPoints }: UseGpuHistoryOptions) {
  const computedMax = useMemo(() => {
    const interval = intervalMs > 0 ? intervalMs : 5000; // fallback for manual refresh
    const targetMinutes = 10; // keep ~10 minutes by default
    return maxPoints ?? Math.max(60, Math.round((targetMinutes * 60 * 1000) / interval));
  }, [intervalMs, maxPoints]);

  const [byId, setById] = useState<Record<string, GpuHistoryPoint[]>>({});

  useEffect(() => {
    if (!data?.gpus?.length) return;

    const timestamp = data.timestamp ? Date.parse(data.timestamp) : Date.now();

    setById((prev) => {
      const next = { ...prev };
      for (const gpu of data.gpus) {
        const id = gpu.uuid ?? String(gpu.id);
        const series = next[id] ? [...next[id]] : [];
        series.push({
          t: timestamp,
          util: gpu.utilization,
          memUsed: gpu.memory.used,
          memTotal: gpu.memory.total,
          temp: gpu.temperature,
          power: gpu.power.draw,
        });
        if (series.length > computedMax) {
          series.splice(0, series.length - computedMax);
        }
        next[id] = series;
      }
      return next;
    });
  }, [data, computedMax]);

  return byId;
}
