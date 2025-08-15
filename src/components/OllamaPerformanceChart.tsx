import { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Zap, Clock, TrendingUp, Brain } from "lucide-react";
import type { OllamaHostData, OllamaRequest } from "@/types/ollama";

interface OllamaPerformanceChartProps {
  hostsData: OllamaHostData[];
  timeRange?: number; // minutes
}

export const OllamaPerformanceChart = memo(function OllamaPerformanceChart({ 
  hostsData, 
  timeRange = 60 
}: OllamaPerformanceChartProps) {
  
  // Prepare time series data for token/s performance
  const performanceData = useMemo(() => {
    const now = Date.now();
    const timeRangeMs = timeRange * 60 * 1000;
    const startTime = now - timeRangeMs;
    
    // Create time buckets (every 5 minutes)
    const bucketSize = 5 * 60 * 1000;
    const buckets = Math.ceil(timeRangeMs / bucketSize);
    
    const data: Array<{ time: string; [key: string]: number | string }> = [];
    
    for (let i = 0; i < buckets; i++) {
      const bucketStart = startTime + (i * bucketSize);
      const bucketEnd = bucketStart + bucketSize;
      
      const timeLabel = new Date(bucketStart).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const bucketData: { time: string; [key: string]: number | string } = { time: timeLabel };
      
      hostsData.forEach(host => {
        if (!host.isConnected) return;
        
        const hostRequests = host.recentRequests.filter(req => 
          req.timestamp >= bucketStart && 
          req.timestamp < bucketEnd && 
          req.success
        );
        
        const avgTokensPerSecond = hostRequests.length > 0
          ? hostRequests.reduce((sum, req) => sum + req.tokensPerSecond, 0) / hostRequests.length
          : 0;
        
        bucketData[host.name] = Math.round(avgTokensPerSecond * 100) / 100;
      });
      
      data.push(bucketData);
    }
    
    return data;
  }, [hostsData, timeRange]);

  // Model performance comparison data
  const modelPerformanceData = useMemo(() => {
    const modelStats: { [model: string]: { totalRequests: number; avgTokensPerSecond: number; successRate: number } } = {};
    
    hostsData.forEach(host => {
      if (!host.isConnected) return;
      
      host.recentRequests.forEach(req => {
        if (!modelStats[req.model]) {
          modelStats[req.model] = { totalRequests: 0, avgTokensPerSecond: 0, successRate: 0 };
        }
        
        modelStats[req.model].totalRequests += 1;
        if (req.success) {
          modelStats[req.model].avgTokensPerSecond += req.tokensPerSecond;
        }
      });
    });
    
    return Object.entries(modelStats)
      .map(([model, stats]) => ({
        model: model.length > 15 ? model.substring(0, 15) + '...' : model,
        fullModel: model,
        avgTokensPerSecond: stats.totalRequests > 0 
          ? Math.round((stats.avgTokensPerSecond / stats.totalRequests) * 100) / 100
          : 0,
        totalRequests: stats.totalRequests,
        successRate: stats.totalRequests > 0 
          ? Math.round((hostsData.reduce((sum, host) => 
              sum + host.recentRequests.filter(r => r.model === model && r.success).length, 0
            ) / stats.totalRequests) * 100)
          : 0
      }))
      .filter(data => data.totalRequests > 0)
      .sort((a, b) => b.avgTokensPerSecond - a.avgTokensPerSecond)
      .slice(0, 10); // Top 10 models
  }, [hostsData]);

  // Latency distribution data
  const latencyData = useMemo(() => {
    const latencies: number[] = [];
    
    hostsData.forEach(host => {
      host.recentRequests
        .filter(req => req.success)
        .forEach(req => latencies.push(req.duration));
    });
    
    if (latencies.length === 0) return [];
    
    // Create latency buckets
    const max = Math.max(...latencies);
    const bucketSize = Math.ceil(max / 10);
    const buckets: { [key: string]: number } = {};
    
    for (let i = 0; i < 10; i++) {
      const start = i * bucketSize;
      const end = (i + 1) * bucketSize;
      const label = `${start}-${end}ms`;
      buckets[label] = 0;
    }
    
    latencies.forEach(latency => {
      const bucketIndex = Math.min(9, Math.floor(latency / bucketSize));
      const start = bucketIndex * bucketSize;
      const end = (bucketIndex + 1) * bucketSize;
      const label = `${start}-${end}ms`;
      buckets[label]++;
    });
    
    return Object.entries(buckets).map(([range, count]) => ({
      range,
      count
    }));
  }, [hostsData]);

  const totalRequests = hostsData.reduce((sum, host) => 
    sum + host.recentRequests.length, 0
  );

  const avgLatency = useMemo(() => {
    const successfulRequests = hostsData.flatMap(host => 
      host.recentRequests.filter(req => req.success)
    );
    
    if (successfulRequests.length === 0) return 0;
    
    return successfulRequests.reduce((sum, req) => sum + req.duration, 0) / successfulRequests.length;
  }, [hostsData]);

  const CHART_COLORS = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6366f1"
  ];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Last {timeRange} minutes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgLatency)}ms</div>
            <p className="text-xs text-muted-foreground">
              Response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelPerformanceData.length}</div>
            <p className="text-xs text-muted-foreground">
              With recent activity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {modelPerformanceData.length > 0 
                ? Math.round(modelPerformanceData[0].avgTokensPerSecond) 
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              tokens/second
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Time Series */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Token Generation Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="time" />
                <YAxis label={{ value: 'Tokens/Second', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value} tok/s`, 
                    name
                  ]}
                />
                <Legend />
                {hostsData
                  .filter(host => host.isConnected)
                  .map((host, index) => (
                    <Line
                      key={host.url}
                      type="monotone"
                      dataKey={host.name}
                      stroke={CHART_COLORS[index % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls={false}
                    />
                  ))
                }
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No performance data available</p>
                <p className="text-sm">Run some inference requests to see performance metrics</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Performance Comparison */}
      {modelPerformanceData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Model Performance Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modelPerformanceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" label={{ value: 'Tokens/Second', position: 'insideBottom', offset: -5 }} />
                <YAxis dataKey="model" type="category" width={100} />
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => [
                    `${value} tok/s`,
                    `Avg Performance (${props.payload.totalRequests} requests)`
                  ]}
                />
                <Bar dataKey="avgTokensPerSecond" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Latency Distribution */}
      {latencyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Response Time Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="range" />
                <YAxis label={{ value: 'Requests', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => [`${value} requests`, 'Count']} />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

OllamaPerformanceChart.displayName = 'OllamaPerformanceChart';