import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Server, 
  Cpu, 
  Activity,
  HardDrive, 
  Thermometer, 
  Zap,
  DollarSign,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import type { GpuInfo } from "@/types/gpu";

interface HostData {
  url: string;
  name: string;
  isConnected: boolean;
  gpus: GpuInfo[];
  timestamp?: string;
  error?: string;
}

interface MultiHostOverviewProps {
  hostsData: HostData[];
  energyRate: number;
}

export function MultiHostOverview({ hostsData, energyRate }: MultiHostOverviewProps) {
  const connectedHosts = hostsData.filter(host => host.isConnected);
  const totalGpus = connectedHosts.reduce((sum, host) => sum + host.gpus.length, 0);
  const allGpus = connectedHosts.flatMap(host => host.gpus);
  
  const averageUtilization = allGpus.length > 0 
    ? Math.round(allGpus.reduce((sum, gpu) => sum + gpu.utilization, 0) / allGpus.length)
    : 0;
  
  const averageTemperature = allGpus.length > 0
    ? Math.round(allGpus.reduce((sum, gpu) => sum + gpu.temperature, 0) / allGpus.length)
    : 0;
  
  const totalPowerDraw = allGpus.reduce((sum, gpu) => sum + gpu.power.draw, 0);
  const totalMemoryUsed = allGpus.reduce((sum, gpu) => sum + gpu.memory.used, 0);
  const totalMemoryCapacity = allGpus.reduce((sum, gpu) => sum + gpu.memory.total, 0);
  const memoryUtilization = totalMemoryCapacity > 0 
    ? Math.round((totalMemoryUsed / totalMemoryCapacity) * 100)
    : 0;
  
  const hourlyCost = energyRate > 0 ? (totalPowerDraw / 1000) * energyRate : 0;

  return (
    <div className="space-y-6">
      {/* Global Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald/10">
                <Server className="h-5 w-5 text-emerald" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Active Hosts</div>
                <div className="text-lg font-bold font-mono">
                  {connectedHosts.length}/{hostsData.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald/10">
                <Cpu className="h-5 w-5 text-emerald" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Total GPUs</div>
                <div className="text-lg font-bold font-mono">{totalGpus}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${averageUtilization >= 80 ? 'bg-orange-500/10' : 'bg-blue-500/10'}`}>
                <Activity className={`h-5 w-5 ${averageUtilization >= 80 ? 'text-gpu-orange' : 'text-gpu-blue'}`} />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Avg Utilization</div>
                <div className="text-lg font-bold font-mono">{averageUtilization}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${memoryUtilization >= 80 ? 'bg-red-500/10' : 'bg-purple-500/10'}`}>
                <HardDrive className={`h-5 w-5 ${memoryUtilization >= 80 ? 'text-gpu-red' : 'text-gpu-purple'}`} />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Memory Usage</div>
                <div className="text-lg font-bold font-mono">{memoryUtilization}%</div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(totalMemoryUsed / 1024)} / {Math.round(totalMemoryCapacity / 1024)} GB
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                averageTemperature >= 80 ? 'bg-red-500/10' : 
                averageTemperature >= 70 ? 'bg-orange-500/10' : 'bg-emerald/10'
              }`}>
                <Thermometer className={`h-5 w-5 ${
                  averageTemperature >= 80 ? 'text-gpu-red' : 
                  averageTemperature >= 70 ? 'text-gpu-orange' : 'text-emerald'
                }`} />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Avg Temperature</div>
                <div className="text-lg font-bold font-mono">{averageTemperature}°C</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Zap className="h-5 w-5 text-gpu-orange" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Total Power</div>
                <div className="text-lg font-bold font-mono">{Math.round(totalPowerDraw)}W</div>
                {energyRate > 0 && (
                  <div className="text-xs text-emerald font-medium">
                    ${hourlyCost.toFixed(2)}/hr
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Host Summary */}
      <Card className="control-panel">
        <CardHeader>
          <CardTitle>Host Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {hostsData.map((host) => (
              <Card key={host.url} className="metric-card">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        <span className="font-medium">{host.name}</span>
                      </div>
                      <Badge variant={host.isConnected ? "default" : "secondary"}>
                        {host.isConnected ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {host.isConnected ? "Online" : "Offline"}
                      </Badge>
                    </div>

                    {host.isConnected ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">GPUs:</span>
                            <span className="ml-1 font-mono font-bold">{host.gpus.length}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg Util:</span>
                            <span className="ml-1 font-mono font-bold">
                              {host.gpus.length > 0 
                                ? Math.round(host.gpus.reduce((sum, gpu) => sum + gpu.utilization, 0) / host.gpus.length)
                                : 0}%
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Power:</span>
                            <span className="ml-1 font-mono font-bold">
                              {Math.round(host.gpus.reduce((sum, gpu) => sum + gpu.power.draw, 0))}W
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg Temp:</span>
                            <span className="ml-1 font-mono font-bold">
                              {host.gpus.length > 0 
                                ? Math.round(host.gpus.reduce((sum, gpu) => sum + gpu.temperature, 0) / host.gpus.length)
                                : 0}°C
                            </span>
                          </div>
                        </div>
                        {host.timestamp && (
                          <div className="text-xs text-muted-foreground">
                            Last update: {new Date(host.timestamp).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {host.error || "Connection failed"}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}