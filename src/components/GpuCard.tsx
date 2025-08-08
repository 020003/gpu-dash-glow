import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { GpuInfo } from "@/types/gpu";
import type { GpuHistoryPoint } from "@/hooks/useGpuHistory";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

function pct(a: number, b: number) {
  return Math.min(100, Math.max(0, Math.round((a / b) * 100)));
}

function chipColorByTemp(temp: number): "default" | "secondary" | "destructive" | "outline" {
  if (temp >= 80) return "destructive";
  if (temp >= 70) return "secondary";
  return "default";
}

export function GpuCard({ info, historySeries = [] }: { info: GpuInfo; historySeries?: GpuHistoryPoint[] }) {
  const memPct = pct(info.memory.used, info.memory.total);
  const chartData = historySeries.map((p) => ({
    t: p.t,
    util: p.util,
    memPct: Math.round((p.memUsed / Math.max(1, p.memTotal)) * 100),
    temp: p.temp,
    power: p.power,
  }));

  return (
    <Card className="transition-transform duration-300 hover:-translate-y-0.5">
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

        {chartData.length > 0 ? (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">History</div>
            <div className="grid gap-3 sm:grid-cols-3">
              <ChartContainer
                config={{ util: { label: "Util (%)", color: "hsl(var(--brand))" } }}
                className="h-28 rounded-md border p-2"
              >
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="t" tickLine={false} axisLine={false} hide />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="util" stroke="var(--color-util)" fill="var(--color-util)" fillOpacity={0.15} dot={{ r: 1.5 }} />
                </AreaChart>
              </ChartContainer>

              <ChartContainer
                config={{ mem: { label: "Mem (%)", color: "hsl(var(--primary))" } }}
                className="h-28 rounded-md border p-2"
              >
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="t" tickLine={false} axisLine={false} hide />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="memPct" stroke="var(--color-mem)" fill="var(--color-mem)" fillOpacity={0.15} dot={{ r: 1.5 }} />
                </AreaChart>
              </ChartContainer>

              <ChartContainer
                config={{ temp: { label: "Temp (°C)", color: "hsl(var(--destructive))" } }}
                className="h-28 rounded-md border p-2"
              >
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="t" tickLine={false} axisLine={false} hide />
                  <YAxis domain={[0, 'auto']} tickLine={false} axisLine={false} hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="temp" stroke="var(--color-temp)" fill="var(--color-temp)" fillOpacity={0.15} dot={{ r: 1.5 }} />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">History will appear as data refreshes.</div>
        )}

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
}

export default GpuCard;
