import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GpuCard } from "./GpuCard";
import { OverviewStats } from "./OverviewStats";
import { 
  Server, 
  AlertTriangle, 
  RefreshCw,
  Wifi,
  WifiOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GpuInfo } from "@/types/gpu";

interface HostTabProps {
  hostName: string;
  hostUrl: string;
  gpus: GpuInfo[];
  isConnected: boolean;
  isFetching: boolean;
  error?: string;
  timestamp?: string;
  energyRate: number;
  onRefresh: () => void;
}

export function HostTab({
  hostName,
  hostUrl,
  gpus,
  isConnected,
  isFetching,
  error,
  timestamp,
  energyRate,
  onRefresh
}: HostTabProps) {
  return (
    <div className="space-y-6">
      {/* Host Header */}
      <Card className="control-panel">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald/10 rounded-lg">
                <Server className="h-5 w-5 text-emerald" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {hostName}
                  <Badge variant={isConnected ? "default" : "secondary"}>
                    {isConnected ? (
                      <Wifi className="h-3 w-3 mr-1" />
                    ) : (
                      <WifiOff className="h-3 w-3 mr-1" />
                    )}
                    {isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{hostUrl}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {timestamp && isConnected && (
                <div className="text-sm text-muted-foreground">
                  Last update: {new Date(timestamp).toLocaleTimeString()}
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRefresh}
                disabled={isFetching}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                {isFetching ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content */}
      {isConnected && gpus.length > 0 ? (
        <div className="space-y-6">
          {/* Overview Statistics for this host */}
          <OverviewStats gpus={gpus} energyRate={energyRate} />
          
          {/* GPU Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              GPU Details ({gpus.length} GPU{gpus.length !== 1 ? 's' : ''})
            </h3>
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {gpus.map((gpu) => (
                <div key={gpu.uuid || gpu.id} className="animate-fade-in">
                  <GpuCard gpu={gpu} energyRate={energyRate} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="p-4 bg-muted/50 rounded-full">
            <AlertTriangle className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium text-foreground">
              {isConnected ? "No GPU Data Available" : "Connection Failed"}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {isConnected 
                ? "This host is connected but no GPU data was found. Make sure NVIDIA drivers are installed and GPUs are available."
                : error || "Could not connect to this host. Check the URL and ensure the API is running."
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}