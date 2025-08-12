import { Card, CardContent } from "@/components/ui/card";
import { 
  Cpu, 
  HardDrive, 
  Thermometer, 
  Zap,
  DollarSign,
  Activity
} from "lucide-react";
import type { GpuInfo } from "@/types/gpu";

interface OverviewStatsProps {
  gpus: GpuInfo[];
  energyRate: number;
}

export function OverviewStats({ gpus, energyRate }: OverviewStatsProps) {
  const totalGpus = gpus.length;
  const averageUtilization = totalGpus > 0 
    ? Math.round(gpus.reduce((sum, gpu) => sum + gpu.utilization, 0) / totalGpus)
    : 0;
  const averageTemperature = totalGpus > 0
    ? Math.round(gpus.reduce((sum, gpu) => sum + gpu.temperature, 0) / totalGpus)
    : 0;
  const totalPowerDraw = gpus.reduce((sum, gpu) => sum + gpu.power.draw, 0);
  const totalMemoryUsed = gpus.reduce((sum, gpu) => sum + gpu.memory.used, 0);
  const totalMemoryCapacity = gpus.reduce((sum, gpu) => sum + gpu.memory.total, 0);
  const memoryUtilization = totalMemoryCapacity > 0 
    ? Math.round((totalMemoryUsed / totalMemoryCapacity) * 100)
    : 0;
  
  const hourlyCost = energyRate > 0 ? (totalPowerDraw / 1000) * energyRate : 0;
  const dailyCost = hourlyCost * 24;

  const stats = [
    {
      title: "Active GPUs",
      value: totalGpus.toString(),
      icon: Cpu,
      color: "text-emerald",
      bgColor: "bg-emerald/10"
    },
    {
      title: "Avg Utilization",
      value: `${averageUtilization}%`,
      icon: Activity,
      color: averageUtilization >= 80 ? "text-gpu-orange" : "text-gpu-blue",
      bgColor: averageUtilization >= 80 ? "bg-orange-500/10" : "bg-blue-500/10"
    },
    {
      title: "Memory Usage",
      value: `${memoryUtilization}%`,
      icon: HardDrive,
      color: memoryUtilization >= 80 ? "text-gpu-red" : "text-gpu-purple",
      bgColor: memoryUtilization >= 80 ? "bg-red-500/10" : "bg-purple-500/10",
      subtitle: `${Math.round(totalMemoryUsed / 1024)} / ${Math.round(totalMemoryCapacity / 1024)} GB`
    },
    {
      title: "Avg Temperature",
      value: `${averageTemperature}°C`,
      icon: Thermometer,
      color: averageTemperature >= 80 ? "text-gpu-red" : averageTemperature >= 70 ? "text-gpu-orange" : "text-emerald",
      bgColor: averageTemperature >= 80 ? "bg-red-500/10" : averageTemperature >= 70 ? "bg-orange-500/10" : "bg-emerald/10"
    },
    {
      title: "Total Power",
      value: `${Math.round(totalPowerDraw)}W`,
      icon: Zap,
      color: "text-gpu-orange",
      bgColor: "bg-orange-500/10"
    },
    ...(energyRate > 0 ? [{
      title: "Energy Cost",
      value: `$${hourlyCost.toFixed(2)}/hr`,
      icon: DollarSign,
      color: "text-emerald",
      bgColor: "bg-emerald/10",
      subtitle: `$${dailyCost.toFixed(2)}/day`
    }] : [])
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="metric-card hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <IconComponent className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </div>
                  <div className="text-lg font-bold font-mono">
                    {stat.value}
                  </div>
                  {stat.subtitle && (
                    <div className="text-xs text-muted-foreground">
                      {stat.subtitle}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}