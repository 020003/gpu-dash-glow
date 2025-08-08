import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Line } from "recharts";
import { useMemo } from "react";
import type { GpuHistoryPoint } from "@/hooks/useGpuHistory";

export function GpuHistoryPanel({ title = "History", series = [] as GpuHistoryPoint[] }: { title?: string; series?: GpuHistoryPoint[] }) {
  const chartData = useMemo(() => {
    const base = series.map((p) => ({
      t: p.t,
      util: p.util,
      memPct: Math.round((p.memUsed / Math.max(1, p.memTotal)) * 100),
      temp: p.temp,
      power: p.power,
    }));

    const n = base.length;
    if (n < 3) return base;

    const totalDt = base[n - 1].t - base[0].t;
    const avgDt = totalDt > 0 ? totalDt / Math.max(1, n - 1) : 5000;
    const windowPts = Math.max(3, Math.round(60000 / Math.max(200, avgDt)));

    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += base[i].util;
      if (i >= windowPts) sum -= base[i - windowPts].util;
      // approx 60s simple moving average
      (base[i] as any).utilAvg = Math.round(sum / Math.min(i + 1, windowPts));
    }

    return base;
  }, [series]);

  const fiveMin = 5 * 60 * 1000;
  const ticks = useMemo(() => {
    if (chartData.length < 2) return [] as number[];
    const start = chartData[0].t;
    const end = chartData[chartData.length - 1].t;
    const first = Math.ceil(start / fiveMin) * fiveMin;
    const arr: number[] = [];
    for (let t = first; t <= end; t += fiveMin) arr.push(t);
    return arr;
  }, [chartData]);

  return (
    <Card className="h-full">
      <CardHeader className="py-4">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {chartData.length > 0 ? (
          <div className="grid gap-3">
            <ChartContainer
              config={{
                util: { label: "Util (%)", color: "hsl(var(--brand))" },
                utilAvg: { label: "Avg (≈60s)", color: "hsl(var(--muted-foreground))" },
              }}
              className="h-36 rounded-md border p-2"
            >
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="t"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  ticks={ticks}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit" })}
                />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={30} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="util" stroke="var(--color-util)" strokeWidth={2} fill="var(--color-util)" fillOpacity={0.2} isAnimationActive={false} animationDuration={0} />
                <Line type="monotone" dataKey="utilAvg" stroke="var(--color-utilAvg)" strokeWidth={2} dot={false} isAnimationActive={false} />
              </AreaChart>
            </ChartContainer>

            <ChartContainer
              config={{ memPct: { label: "Mem (%)", color: "hsl(var(--primary))" } }}
              className="h-36 rounded-md border p-2"
            >
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="t"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  ticks={ticks}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit" })}
                />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={30} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="memPct" stroke="var(--color-memPct)" strokeWidth={2} fill="var(--color-memPct)" fillOpacity={0.2} isAnimationActive={false} animationDuration={0} />
              </AreaChart>
            </ChartContainer>

            <ChartContainer
              config={{ temp: { label: "Temp (°C)", color: "hsl(var(--destructive))" } }}
              className="h-36 rounded-md border p-2"
            >
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="t"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  ticks={ticks}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit" })}
                />
                <YAxis domain={[0, 'auto']} tickLine={false} axisLine={false} width={30} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="temp" stroke="var(--color-temp)" strokeWidth={2} fill="var(--color-temp)" fillOpacity={0.2} isAnimationActive={false} animationDuration={0} />
              </AreaChart>
            </ChartContainer>

            <ChartContainer
              config={{ power: { label: "Power (W)", color: "hsl(var(--secondary))" } }}
              className="h-36 rounded-md border p-2"
            >
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="t"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  ticks={ticks}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit" })}
                />
                <YAxis domain={[0, 'auto']} tickLine={false} axisLine={false} width={30} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="power" stroke="var(--color-power)" strokeWidth={2} fill="var(--color-power)" fillOpacity={0.2} isAnimationActive={false} animationDuration={0} />
              </AreaChart>
            </ChartContainer>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">History will appear as data refreshes.</div>
        )}
      </CardContent>
    </Card>
  );
}

export default GpuHistoryPanel;
