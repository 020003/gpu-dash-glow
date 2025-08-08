import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { GpuInfo } from "@/types/gpu";
import { memo } from "react";

function pct(a: number, b: number) {
  return Math.min(100, Math.max(0, Math.round((a / b) * 100)));
}

function chipColorByTemp(temp: number): "default" | "secondary" | "destructive" | "outline" {
  if (temp >= 80) return "destructive";
  if (temp >= 70) return "secondary";
  return "default";
}

export const GpuCard = memo(function GpuCard({ info, energyRate = 0, onSelect, selected = false }: { info: GpuInfo; energyRate?: number; onSelect?: () => void; selected?: boolean }) {
  const memPct = pct(info.memory.used, info.memory.total);

  return (
    <Card onClick={onSelect} className={`glass-card hover-scale cursor-pointer ${selected ? "ring-2 ring-primary" : ""}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg leading-tight">
              {info.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">GPU {info.id}{info.driverVersion ? ` • Driver ${info.driverVersion}` : ""}</p>
          </div>
          <Badge variant={chipColorByTemp(info.temperature)}>{info.temperature}°C</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Utilization</span>
            <span className="font-medium text-foreground">{info.utilization}%</span>
          </div>
          <Progress value={info.utilization} className="h-2" />
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Memory</span>
            <span className="font-medium text-foreground">{info.memory.used} / {info.memory.total} MiB ({memPct}%)</span>
          </div>
          <Progress value={memPct} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-md border p-3">
            <div className="text-muted-foreground">Power</div>
            <div className="font-medium">{info.power.draw} / {info.power.limit} W</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-muted-foreground">Fan</div>
            <div className="font-medium">{info.fan ?? 0}%</div>
          </div>
        </div>

        {energyRate > 0 ? (
          <div className="text-xs text-muted-foreground">Est. cost/hr at ${energyRate}/kWh: ${(info.power.draw / 1000 * energyRate).toFixed(3)}</div>
        ) : null}

        {/* History charts moved to right-side panel; removed inline charts here. */}

        {info.processes && info.processes.length > 0 ? (
          <div>
            <div className="text-sm text-muted-foreground mb-1">Top processes</div>
            <ul className="space-y-1 max-h-28 overflow-auto pr-1">
              {info.processes.slice(0, 5).map((p) => (
                <li key={p.pid} className="flex items-center justify-between text-sm">
                  <span className="truncate mr-3">{p.name} ({p.pid})</span>
                  <span className="tabular-nums">{p.memory} MiB</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No running GPU processes</div>
        )}
      </CardContent>
    </Card>
  );
});

export default GpuCard;
