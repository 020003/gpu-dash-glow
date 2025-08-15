import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OllamaModelCard } from "./OllamaModelCard";
import { OllamaPerformanceChart } from "./OllamaPerformanceChart";
import { 
  Bot, 
  Brain, 
  RefreshCw, 
  AlertCircle, 
  HardDrive, 
  Clock,
  Zap,
  BarChart3,
  List
} from "lucide-react";
import { toast } from "sonner";
import type { OllamaHostData } from "@/types/ollama";

interface OllamaHostTabProps {
  hostData: OllamaHostData;
  onRefresh?: () => void;
  onTestPerformance?: (modelName: string) => Promise<void>;
  isRefreshing?: boolean;
}

export function OllamaHostTab({ 
  hostData, 
  onRefresh, 
  onTestPerformance,
  isRefreshing = false 
}: OllamaHostTabProps) {
  const [testingModel, setTestingModel] = useState<string | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleTestPerformance = async (modelName: string) => {
    if (!onTestPerformance) return;
    
    setTestingModel(modelName);
    try {
      await onTestPerformance(modelName);
      toast.success(`Performance test completed for ${modelName}`);
    } catch (error) {
      toast.error(`Performance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTestingModel(null);
    }
  };

  if (!hostData.isConnected) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connection Failed</h3>
          <p className="text-muted-foreground text-center mb-4">
            Unable to connect to {hostData.name}
            {hostData.error && (
              <span className="block text-sm mt-1">
                Error: {hostData.error}
              </span>
            )}
          </p>
          <Button onClick={onRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!hostData.systemInfo) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bot className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No System Info</h3>
          <p className="text-muted-foreground text-center">
            Connected to {hostData.name} but no system information is available.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { systemInfo } = hostData;

  return (
    <div className="space-y-6">
      {/* Host Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemInfo.models.length}</div>
            <p className="text-xs text-muted-foreground">
              Total available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(systemInfo.totalMemoryUsage)}</div>
            <p className="text-xs text-muted-foreground">
              Model storage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemInfo.performanceMetrics.requestCount}</div>
            <p className="text-xs text-muted-foreground">
              {systemInfo.performanceMetrics.errorCount} errors
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
              {systemInfo.performanceMetrics.tokensPerSecond > 0 
                ? Math.round(systemInfo.performanceMetrics.tokensPerSecond)
                : '—'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              avg tokens/sec
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Models ({systemInfo.models.length})
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          {/* Refresh Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Available Models</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>

          {systemInfo.models.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Models Found</h3>
                <p className="text-muted-foreground text-center">
                  No models are currently available on this Ollama instance.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {systemInfo.models.map((model) => {
                const modelStats = systemInfo.activeModels.find(m => m.model === model.name);
                
                return (
                  <OllamaModelCard
                    key={model.name}
                    model={model}
                    stats={modelStats}
                    hostUrl={hostData.url}
                    onTestPerformance={handleTestPerformance}
                    isLoading={testingModel === model.name}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <OllamaPerformanceChart hostsData={[hostData]} timeRange={60} />
        </TabsContent>
      </Tabs>

      {/* Recent Requests */}
      {hostData.recentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {hostData.recentRequests.slice(-5).reverse().map((request, index) => (
                <div
                  key={`${request.timestamp}-${index}`}
                  className="flex items-center justify-between p-3 border rounded-lg bg-card/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      request.success ? 'bg-emerald' : 'bg-red-500'
                    }`} />
                    <div>
                      <div className="font-medium">{request.model}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                        {request.prompt}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <div className="font-medium">{request.duration}ms</div>
                      {request.success && (
                        <div className="text-muted-foreground">
                          {Math.round(request.tokensPerSecond * 10) / 10} tok/s
                        </div>
                      )}
                    </div>
                    <Badge variant={request.success ? "default" : "destructive"}>
                      {request.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}