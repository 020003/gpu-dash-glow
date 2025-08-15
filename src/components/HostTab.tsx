import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GpuCard } from "./GpuCard";
import { OverviewStats } from "./OverviewStats";
import { 
  Server, 
  AlertTriangle, 
  RefreshCw,
  Wifi,
  WifiOff,
  Bot,
  Brain,
  Zap,
  HardDrive
} from "lucide-react";
// import { OllamaModelCard } from "./OllamaModelCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ollama?: {
    isAvailable: boolean;
    models: any[];
    performanceMetrics: any;
    recentRequests: any[];
  };
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
  onRefresh,
  ollama
}: HostTabProps) {
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
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
                {ollama?.isAvailable && (
                  <div className="flex items-center gap-2 mt-1">
                    <Bot className="h-3 w-3 text-primary" />
                    <span className="text-xs text-primary font-medium">
                      Ollama detected ({ollama.models.length} models)
                    </span>
                  </div>
                )}
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
          
          {/* Ollama Overview Stats (if available) */}
          {ollama?.isAvailable && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Models</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ollama.models.length}</div>
                  <p className="text-xs text-muted-foreground">Available</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Model Storage</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatBytes(ollama.models.reduce((sum, model) => sum + model.size, 0))}
                  </div>
                  <p className="text-xs text-muted-foreground">Total size</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Requests</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ollama.performanceMetrics.requestCount}</div>
                  <p className="text-xs text-muted-foreground">
                    {ollama.performanceMetrics.errorCount} errors
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performance</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {ollama.performanceMetrics.tokensPerSecond > 0 
                      ? Math.round(ollama.performanceMetrics.tokensPerSecond)
                      : '—'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">avg tokens/sec</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Tabbed Content */}
          <Tabs defaultValue="gpus" className="space-y-4">
            <TabsList>
              <TabsTrigger value="gpus" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                GPUs ({gpus.length})
              </TabsTrigger>
              {ollama?.isAvailable && (
                <TabsTrigger value="ollama" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI Models ({ollama.models.length})
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="gpus" className="space-y-4">
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
            </TabsContent>
            
            {ollama?.isAvailable && (
              <TabsContent value="ollama" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    AI Models ({ollama.models.length} model{ollama.models.length !== 1 ? 's' : ''})
                  </h3>
                  {ollama.models.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Models Found</h3>
                        <p className="text-muted-foreground text-center">
                          No AI models are currently available on this Ollama instance.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {ollama.models.map((model) => (
                        <Card key={model.name}>
                          <CardHeader>
                            <CardTitle className="text-sm">{model.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground">
                              Size: {formatBytes(model.size)}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
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
            {ollama?.isAvailable && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-2 text-primary">
                  <Bot className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Ollama detected with {ollama.models.length} AI models
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}