import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useNvidiaSmi } from "@/hooks/useNvidiaSmi";
import { GpuCard } from "@/components/GpuCard";
import type { NvidiaSmiResponse } from "@/types/gpu";
import { toast } from "sonner";

const Index = () => {
  const [apiUrl, setApiUrl] = useState<string | null>(() => localStorage.getItem("nvidia_api_url"));
  const [inputUrl, setInputUrl] = useState<string>(apiUrl ?? "");
  const [demo, setDemo] = useState<boolean>(() => localStorage.getItem("nvidia_demo") === "1");
  const [intervalMs, setIntervalMs] = useState<number>(() => Number(localStorage.getItem("nvidia_interval_ms")) || 5000);

  const { data, isError, error, isFetching } = useNvidiaSmi({ apiUrl: demo ? null : apiUrl, demo, refetchIntervalMs: intervalMs });

  useEffect(() => {
    if (isError) {
      toast.error("Failed to fetch NVIDIA SMI data. Showing demo data.");
    }
  }, [isError]);

  const handleSave = () => {
    const cleaned = inputUrl.trim() || null;
    setApiUrl(cleaned);
    if (cleaned) {
      localStorage.setItem("nvidia_api_url", cleaned);
      toast.success("API URL saved.");
      setDemo(false);
      localStorage.setItem("nvidia_demo", "0");
    } else {
      localStorage.removeItem("nvidia_api_url");
    }
  };

  const handleDemoToggle = (checked: boolean) => {
    setDemo(checked);
    localStorage.setItem("nvidia_demo", checked ? "1" : "0");
  };

  const handleInterval = (value: string) => {
    const ms = Number(value);
    setIntervalMs(ms);
    localStorage.setItem("nvidia_interval_ms", String(ms));
  };

  const gpus = (data as NvidiaSmiResponse | undefined)?.gpus ?? [];

  const pageTitle = "NVIDIA SMI Dashboard";
  const description = "Monitor NVIDIA GPU utilization, memory, temperature and power in a modern dashboard.";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : '/'} />
      </Helmet>
      <header className="border-b">
        <div className="container py-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight bg-gradient-to-r from-brand to-brand-2 bg-clip-text text-transparent">
            NVIDIA SMI Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">{description}</p>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        <section aria-label="Controls" className="rounded-lg border p-4 md:p-5">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="api-url">API URL (JSON)</Label>
              <Input id="api-url" placeholder="https://your-host:port/nvidia-smi.json" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} />
            </div>
            <div className="flex items-center gap-3 md:justify-center">
              <Switch id="demo" checked={demo} onCheckedChange={handleDemoToggle} />
              <Label htmlFor="demo">Use demo data</Label>
            </div>
            <div className="space-y-2">
              <Label>Refresh</Label>
              <Select value={String(intervalMs)} onValueChange={handleInterval}>
                <SelectTrigger>
                  <SelectValue placeholder="Refresh interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Manual</SelectItem>
                  <SelectItem value="2000">2s</SelectItem>
                  <SelectItem value="5000">5s</SelectItem>
                  <SelectItem value="10000">10s</SelectItem>
                  <SelectItem value="30000">30s</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button className="w-full" onClick={handleSave}>Save URL</Button>
              <Button variant="secondary" className="w-full" onClick={() => window.location.reload()} disabled={isFetching}>Refresh</Button>
            </div>
          </div>
        </section>

        <Separator />

        <section aria-label="GPU Grid" className="pb-10">
          {gpus.length === 0 ? (
            <div className="text-center text-muted-foreground py-24">No GPU data available.</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {gpus.map((gpu) => (
                <GpuCard key={gpu.uuid ?? gpu.id} info={gpu} />
              ))}
            </div>
          )}
        </section>
      </main>
      <footer className="border-t">
        <div className="container py-6 text-sm text-muted-foreground flex items-center justify-between">
          <span>{data?.host ?? "Local"}</span>
          <span>{data?.timestamp ? new Date(data.timestamp).toLocaleString() : ""}</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
