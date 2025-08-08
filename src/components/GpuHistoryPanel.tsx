import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { useMemo } from "react";
import type { GpuHistoryPoint } from "@/hooks/useGpuHistory";

export function GpuHistoryPanel({ title = "History", series = [] as GpuHistoryPoint[] }: { title?: string; series?: GpuHistoryPoint[] }) {
  const chartData = useMemo(() => series.map((p) => ({
    t: p.t,
    util: p.util,
    memPct: Math.round((p.memUsed / Math.max(1, p.memTotal)) * 100),
    temp: p.temp,
    power: p.power,
  })), [series]);

  return (
    <Card className="h-full">
      <CardHeader className="py-4">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {chartData.length > 0 ? (
          <div className="grid gap-3">
            <ChartContainer
              config={{ util: { label: "Util (%)", color: "hsl(var(--brand))" } }}
              className="h-28 rounded-md border p-2"
            >
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" tickLine={false} axisLine={false} hide />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="util" stroke="var(--color-util)" strokeWidth={2} fill="var(--color-util)" fillOpacity={0.2} isAnimationActive={false} animationDuration={0} />
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
                <Area type="monotone" dataKey="memPct" stroke="var(--color-mem)" strokeWidth={2} fill="var(--color-mem)" fillOpacity={0.2} isAnimationActive={false} animationDuration={0} />
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
                <Area type="monotone" dataKey="temp" stroke="var(--color-temp)" strokeWidth={2} fill="var(--color-temp)" fillOpacity={0.2} isAnimationActive={false} animationDuration={0} />
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
