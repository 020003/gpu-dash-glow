import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bot, Brain, Zap, HardDrive, Clock, TrendingUp, AlertCircle } from "lucide-react";
import type { OllamaHostData } from "@/types/ollama";

interface OllamaOverviewProps {
  hostsData: OllamaHostData[];
}

export function OllamaOverview({ hostsData }: OllamaOverviewProps) {
  const connectedHosts = hostsData.filter(host => host.isConnected);
  const totalModels = hostsData.reduce((sum, host) => sum + (host.systemInfo?.models.length || 0), 0);
  const totalMemoryUsage = hostsData.reduce((sum, host) => sum + (host.systemInfo?.totalMemoryUsage || 0), 0);
  
  const avgTokensPerSecond = connectedHosts.length > 0 
    ? connectedHosts.reduce((sum, host) => 
        sum + (host.systemInfo?.performanceMetrics.tokensPerSecond || 0), 0
      ) / connectedHosts.length
    : 0;

  const totalRequests = hostsData.reduce((sum, host) => 
    sum + (host.systemInfo?.performanceMetrics.requestCount || 0), 0
  );

  const totalErrors = hostsData.reduce((sum, host) => 
    sum + (host.systemInfo?.performanceMetrics.errorCount || 0), 0
  );

  const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTokensPerSecond = (tokens: number) => {
    if (tokens === 0) return '0';
    if (tokens < 1) return tokens.toFixed(2);
    return Math.round(tokens).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ollama Hosts</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedHosts.length}/{hostsData.length}</div>
            <p className="text-xs text-muted-foreground">
              {connectedHosts.length === hostsData.length 
                ? "All hosts online" 
                : `${hostsData.length - connectedHosts.length} offline`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalModels}</div>
            <p className="text-xs text-muted-foreground">
              Across all hosts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTokensPerSecond(avgTokensPerSecond)}</div>
            <p className="text-xs text-muted-foreground">
              tokens/second
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(totalMemoryUsage)}</div>
            <p className="text-xs text-muted-foreground">
              Total model size
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Request Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all hosts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className={`h-4 w-4 ${errorRate > 5 ? 'text-red-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${errorRate > 5 ? 'text-red-500' : ''}`}>
              {errorRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {totalErrors} errors total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${errorRate < 5 ? 'text-emerald' : ''}`}>
              {(100 - errorRate).toFixed(1)}%
            </div>
            <Progress value={100 - errorRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Host Status Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Ollama Hosts Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hostsData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No Ollama hosts configured</p>
              <p className="text-sm">Add Ollama instances in Settings to monitor AI workloads</p>
            </div>
          ) : (
            <div className="space-y-4">
              {hostsData.map((host) => (
                <div
                  key={host.url}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        host.isConnected ? 'bg-emerald animate-pulse-slow' : 'bg-red-500'
                      }`} />
                      <div>
                        <div className="font-medium">{host.name}</div>
                        <div className="text-sm text-muted-foreground">{host.url}</div>
                      </div>
                    </div>
                    
                    {host.isConnected && host.systemInfo && (
                      <div className="flex items-center gap-4 ml-4">
                        <Badge variant="outline">
                          {host.systemInfo.models.length} models
                        </Badge>
                        {host.systemInfo.performanceMetrics.tokensPerSecond > 0 && (
                          <Badge variant="secondary">
                            {formatTokensPerSecond(host.systemInfo.performanceMetrics.tokensPerSecond)} tok/s
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {formatBytes(host.systemInfo.totalMemoryUsage)}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={host.isConnected ? "default" : "secondary"}>
                      {host.isConnected ? "Online" : "Offline"}
                    </Badge>
                    {host.error && (
                      <Badge variant="destructive" className="text-xs">
                        Error
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}