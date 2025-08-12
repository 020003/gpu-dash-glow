import { NvidiaSmiResponse } from "@/types/gpu";

function rand(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min));
}

export function createMockNvidiaData(gpuCount = 2): NvidiaSmiResponse {
  const gpus = Array.from({ length: gpuCount }).map((_, i) => {
    const total = [8192, 12288, 16384, 24576, 24564, 49152][i % 6];
    const used = rand(512, total - 256);
    const util = rand(5, 98);
    const temp = rand(35, 84);

    return {
      id: i,
      uuid: `GPU-${i}-${Math.random().toString(36).slice(2, 8)}`,
      name: [
        "NVIDIA GeForce RTX 3090",
        "NVIDIA RTX A6000",
        "NVIDIA GeForce RTX 4090",
        "NVIDIA Tesla V100",
        "NVIDIA A100",
      ][i % 5],
      driverVersion: "555.85",
      temperature: temp,
      utilization: util,
      memory: { used, total },
      power: { draw: rand(50, 300), limit: 350 },
      fan: rand(10, 90),
      processes: Array.from({ length: rand(0, 4) }).map(() => ({
        pid: rand(1000, 50000),
        name: ["python", "pytorch", "tensorflow", "render", "train"][rand(0, 4)],
        memory: rand(50, 4096),
      })),
    };
  });

  return {
    host: window.location.hostname,
    timestamp: new Date().toISOString(),
    gpus,
  };
}
