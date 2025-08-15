export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface OllamaModelInfo {
  license: string;
  modelfile: string;
  parameters: string;
  template: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface OllamaGenerateMetrics {
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
}

export interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaPerformanceMetrics {
  tokensPerSecond: number;
  modelLoadTimeMs: number;
  totalDurationMs: number;
  promptProcessingMs: number;
  averageLatency: number;
  requestCount: number;
  errorCount: number;
}

export interface OllamaModelStats {
  model: string;
  size: number;
  memoryUsage?: number;
  lastUsed: string;
  requestCount: number;
  averageTokensPerSecond: number;
  isLoaded: boolean;
}

export interface OllamaSystemInfo {
  models: OllamaModel[];
  activeModels: OllamaModelStats[];
  totalMemoryUsage: number;
  performanceMetrics: OllamaPerformanceMetrics;
  isOnline: boolean;
  version?: string;
  timestamp: string;
}

export interface OllamaHostConfig {
  url: string;
  name: string;
  isEnabled: boolean;
  apiKey?: string;
}

export interface OllamaRequest {
  timestamp: number;
  model: string;
  prompt: string;
  duration: number;
  tokenCount: number;
  tokensPerSecond: number;
  success: boolean;
  error?: string;
}

export interface OllamaHostData {
  url: string;
  name: string;
  isConnected: boolean;
  systemInfo?: OllamaSystemInfo;
  recentRequests: OllamaRequest[];
  error?: string;
}