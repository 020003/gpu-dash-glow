import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNvidiaSmi } from "@/hooks/useNvidiaSmi";
import { GpuCard } from "@/components/GpuCard";
import type { NvidiaSmiResponse } from "@/types/gpu";
import { toast } from "sonner";
import { useGpuHistory } from "@/hooks/useGpuHistory";

const Index = () => {
  const [apiUrl, setApiUrl] = useState<string | null>(() => localStorage.getItem("nvidia_api_url"));
  const [inputUrl, setInputUrl] = useState<string>(apiUrl ?? "");
  const [demo, setDemo] = useState<boolean>(() => localStorage.getItem("nvidia_demo") === "1");
  const [intervalMs, setIntervalMs] = useState<number>(() => Number(localStorage.getItem("nvidia_interval_ms")) || 5000);
  const [hosts, setHosts] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("nvidia_hosts") || "[]");
    } catch {
      return [];
    }
  });
const [energyRate, setEnergyRate] = useState<number>(() => Number(localStorage.getItem("nvidia_energy_rate")) || 0);
const [hostWatts, setHostWatts] = useState<Record<string, number>>({});

  const { data, isError, error, isFetching } = useNvidiaSmi({ apiUrl: demo ? null : apiUrl, demo, refetchIntervalMs: intervalMs });
  const history = useGpuHistory({ data, intervalMs });

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

  const handleAddHost = () => {
    const cleaned = inputUrl.trim();
    if (!cleaned) return;
    setHosts((prev) => {
      const next = Array.from(new Set([...prev, cleaned]));
      localStorage.setItem("nvidia_hosts", JSON.stringify(next));
      return next;
    });
    setApiUrl(cleaned);
    localStorage.setItem("nvidia_api_url", cleaned);
    toast.success("Host added.");
  };

  const handleRemoveHost = (host: string) => {
    setHosts((prev) => {
      const next = prev.filter((h) => h !== host);
      localStorage.setItem("nvidia_hosts", JSON.stringify(next));
      return next;
    });
  };

  const HostSection = ({ host, onUpdate }: { host: string; onUpdate: (watts: number) => void }) => {
    const { data: hostData, isFetching: hostFetching } = useNvidiaSmi({ apiUrl: host, demo: false, refetchIntervalMs: intervalMs });
    const hostHistory = useGpuHistory({ data: hostData, intervalMs });
  const gpusHost = (hostData as NvidiaSmiResponse | undefined)?.gpus ?? [];
  const totalDraw = gpusHost.reduce((sum, g) => sum + (g.power?.draw || 0), 0);
  useEffect(() => { onUpdate(totalDraw); }, [totalDraw, onUpdate]);
  return (
      <section aria-label={`GPU Grid for ${host}`} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">{host}</h2>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            {hostData?.timestamp ? <span>{new Date(hostData.timestamp).toLocaleString()}</span> : null}
            <span>• {Math.round(totalDraw)} W</span>
            {energyRate > 0 ? <span>• ${((totalDraw / 1000) * energyRate).toFixed(2)}/hr</span> : null}
          </div>
        </div>
        {gpusHost.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">No GPU data available.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gpusHost.map((gpu) => {
              const id = gpu.uuid ?? String(gpu.id);
              return <GpuCard key={id} info={gpu} historySeries={hostHistory[id] ?? []} energyRate={energyRate} />;
            })}
          </div>
        )}
      </section>
    );
  };

  const gpus = (data as NvidiaSmiResponse | undefined)?.gpus ?? [];

  const totalWattsAll = useMemo(() => {
    if (hosts.length > 0 && !demo) {
      return Object.values(hostWatts).reduce((s, v) => s + v, 0);
    }
    return gpus.reduce((s, g) => s + (g.power?.draw || 0), 0);
  }, [hosts, demo, hostWatts, gpus]);

  const costHrAll = useMemo(() => (energyRate > 0 ? (totalWattsAll / 1000) * energyRate : 0), [totalWattsAll, energyRate]);

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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 items-end">
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
            <div className="space-y-2">
              <Label>Electricity rate ($/kWh)</Label>
              <Input
                type="number"
                step="0.001"
                inputMode="decimal"
                placeholder="0.20"
                value={energyRate ? String(energyRate) : ""}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  const rate = isNaN(v) ? 0 : v;
                  setEnergyRate(rate);
                  localStorage.setItem("nvidia_energy_rate", String(rate));
                }}
              />
            </div>
            <div className="flex gap-3">
              <Button className="w-full" onClick={handleAddHost}>Add host</Button>
              <Button variant="secondary" className="w-full" onClick={() => window.location.reload()} disabled={isFetching}>Refresh</Button>
            </div>
          </div>
        </section>

        {hosts.length > 0 && (
          <section aria-label="Hosts List" className="container">
            <div className="text-sm text-muted-foreground mb-2">Hosts</div>
            <div className="flex flex-wrap gap-2">
              {hosts.map((h) => (
                <div key={h} className="flex items-center gap-2 rounded-md border px-2 py-1">
                  <a href={h} className="text-sm underline underline-offset-2" target="_blank" rel="noreferrer">{h}</a>
                  <Button size="sm" variant="secondary" onClick={() => handleRemoveHost(h)}>Remove</Button>
                </div>
              ))}
            </div>
          </section>
        )}

        <Separator />

        <section aria-label="GPU Grid" className="pb-10 space-y-8">
          {energyRate > 0 ? (
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base">Estimated Power Cost (all visible GPUs)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground flex gap-6">
                <div><span className="font-medium text-foreground">{Math.round(totalWattsAll)}</span> W total</div>
                <div>≈ <span className="font-medium text-foreground">${costHrAll.toFixed(2)}</span>/hr</div>
              </CardContent>
            </Card>
          ) : null}
          {hosts.length > 0 && !demo ? (
            hosts.map((host) => (
              <HostSection key={host} host={host} onUpdate={(w) => setHostWatts((prev) => ({ ...prev, [host]: w }))} />
            ))
          ) : gpus.length === 0 ? (
            <div className="text-center text-muted-foreground py-24">No GPU data available.</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {gpus.map((gpu) => {
                const id = gpu.uuid ?? String(gpu.id);
                return <GpuCard key={id} info={gpu} historySeries={history[id] ?? []} energyRate={energyRate} />;
              })}
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
