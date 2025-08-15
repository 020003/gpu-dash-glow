import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Download, 
  Clock, 
  Zap, 
  HardDrive, 
  Play, 
  BarChart3,
  Calendar,
  Hash
} from "lucide-react";
import { toast } from "sonner";
import type { OllamaModelStats, OllamaModel } from "@/types/ollama";

interface OllamaModelCardProps {
  model: OllamaModel;
  stats?: OllamaModelStats;
  hostUrl: string;
  onTestPerformance?: (modelName: string) => void;
  isLoading?: boolean;
}

export function OllamaModelCard({ 
  model, 
  stats, 
  hostUrl, 
  onTestPerformance,
  isLoading = false 
}: OllamaModelCardProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getModelFamily = () => {
    if (model.details?.family) {
      return model.details.family;
    }
    
    const name = model.name.toLowerCase();
    if (name.includes('llama')) return 'LLaMA';
    if (name.includes('mistral')) return 'Mistral';
    if (name.includes('codellama')) return 'Code Llama';
    if (name.includes('vicuna')) return 'Vicuna';
    if (name.includes('orca')) return 'Orca';
    return 'Unknown';
  };

  const getParameterSize = () => {
    return model.details?.parameter_size || 'Unknown';
  };

  const getQuantization = () => {
    return model.details?.quantization_level || 'Unknown';
  };

  const handleTestPerformance = () => {
    if (onTestPerformance) {
      onTestPerformance(model.name);
      toast.info(`Testing performance for ${model.name}...`);
    }
  };

  const performanceColor = stats?.averageTokensPerSecond 
    ? stats.averageTokensPerSecond > 20 ? 'text-emerald' 
    : stats.averageTokensPerSecond > 10 ? 'text-yellow-500' 
    : 'text-red-500'
    : 'text-muted-foreground';

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">{model.name}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {stats?.isLoaded && (
              <div className="w-2 h-2 bg-emerald rounded-full animate-pulse" />
            )}
            <Badge variant="outline" className="text-xs">
              {getModelFamily()}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            {getParameterSize()}
          </div>
          <div className="flex items-center gap-1">
            <HardDrive className="h-3 w-3" />
            {formatBytes(model.size)}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(model.modified_at)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Model Details */}
        <div className="grid gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Quantization:</span>
            <Badge variant="secondary" className="text-xs">
              {getQuantization()}
            </Badge>
          </div>
          
          {model.details?.format && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Format:</span>
              <Badge variant="outline" className="text-xs">
                {model.details.format}
              </Badge>
            </div>
          )}
        </div>

        {/* Performance Stats */}
        {stats && (
          <div className="space-y-3 pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Performance:</span>
              <div className={`text-sm font-mono ${performanceColor}`}>
                {stats.averageTokensPerSecond > 0 
                  ? `${stats.averageTokensPerSecond.toFixed(1)} tok/s`
                  : 'Not tested'
                }
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Requests:</span>
              <Badge variant="outline" className="text-xs">
                {stats.requestCount}
              </Badge>
            </div>

            {stats.averageTokensPerSecond > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Performance Score</span>
                  <span>{Math.min(100, (stats.averageTokensPerSecond / 50) * 100).toFixed(0)}%</span>
                </div>
                <Progress 
                  value={Math.min(100, (stats.averageTokensPerSecond / 50) * 100)} 
                  className="h-2"
                />
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestPerformance}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Clock className="h-3 w-3 mr-1 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" />
                Test
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const modelInfo = {
                name: model.name,
                size: formatBytes(model.size),
                family: getModelFamily(),
                parameters: getParameterSize(),
                quantization: getQuantization(),
                modified: formatDate(model.modified_at),
                digest: model.digest.substring(0, 12) + '...',
                url: hostUrl
              };
              
              navigator.clipboard.writeText(JSON.stringify(modelInfo, null, 2));
              toast.success('Model info copied to clipboard');
            }}
          >
            <BarChart3 className="h-3 w-3" />
          </Button>
        </div>

        {/* Model Digest (truncated) */}
        <div className="text-xs text-muted-foreground font-mono bg-muted/30 rounded px-2 py-1 truncate">
          {model.digest}
        </div>
      </CardContent>
    </Card>
  );
}