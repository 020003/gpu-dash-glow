import { useEffect, useMemo, useState } from "react";
import type { NvidiaSmiResponse } from "@/types/gpu";

export type PowerPoint = { t: number; power: number };

interface UsePowerHistoryOptions {
  data?: NvidiaSmiResponse;
  hostKey: string; // unique key per host to avoid mixing series
  retentionHours?: number; // default 24h
  maxPointsPerGpu?: number; // soft cap to avoid huge localStorage
}

// Persist per-GPU power history in localStorage with a rolling 24h window
export function usePowerHistory({ data, hostKey, retentionHours = 24, maxPointsPerGpu = 5000 }: UsePowerHistoryOptions) {
  const storageKey = `power_hist::${hostKey}`;
  const cutoffMs = useMemo(() => retentionHours * 60 * 60 * 1000, [retentionHours]);
  const [byId, setById] = useState<Record<string, PowerPoint[]>>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (!data?.gpus?.length) return;
    const timestamp = data.timestamp ? Date.parse(data.timestamp) : Date.now();

    setById((prev) => {
      const next: Record<string, PowerPoint[]> = { ...prev };
      for (const gpu of data.gpus) {
        const id = gpu.uuid ?? String(gpu.id);
        const series = next[id] ? [...next[id]] : [];
        series.push({ t: timestamp, power: gpu.power?.draw ?? 0 });
        // Trim by time window and soft cap
        const minT = timestamp - cutoffMs;
        const trimmed = series.filter((p) => p.t >= minT);
        // If still too big, keep last maxPointsPerGpu
        if (trimmed.length > maxPointsPerGpu) {
          trimmed.splice(0, trimmed.length - maxPointsPerGpu);
        }
        next[id] = trimmed;
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore quota errors
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, storageKey, cutoffMs]);

  return byId;
}
