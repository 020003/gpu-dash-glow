export interface GpuProcess {
  pid: number;
  name: string;
  memory: number; // MiB
}

export interface GpuInfo {
  id: number;
  uuid?: string;
  name: string;
  driverVersion?: string;
  temperature: number; // Celsius
  utilization: number; // Percent
  memory: {
    used: number; // MiB
    total: number; // MiB
  };
  power: {
    draw: number; // W
    limit: number; // W
  };
  fan?: number; // Percent
  processes?: GpuProcess[];
}

export interface NvidiaSmiResponse {
  host?: string;
  timestamp?: string;
  gpus: GpuInfo[];
}
