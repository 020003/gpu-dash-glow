import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ControlPanelProps {
  apiUrl: string;
  setApiUrl: (url: string) => void;
  demo: boolean;
  setDemo: (demo: boolean) => void;
  refreshInterval: number;
  setRefreshInterval: (interval: number) => void;
  energyRate: number;
  setEnergyRate: (rate: number) => void;
  isConnected: boolean;
  isFetching: boolean;
  onRefresh: () => void;
}

export function ControlPanel({
  apiUrl,
  setApiUrl,
  demo,
  setDemo,
  refreshInterval,
  setRefreshInterval,
  energyRate,
  setEnergyRate,
  isConnected,
  isFetching,
  onRefresh
}: ControlPanelProps) {
  const [inputUrl, setInputUrl] = useState(apiUrl);

  const handleSaveUrl = () => {
    const cleanUrl = inputUrl.trim();
    setApiUrl(cleanUrl);
    localStorage.setItem("gpu_monitor_api_url", cleanUrl);
    toast.success("API URL saved");
  };

  const handleDemoToggle = (enabled: boolean) => {
    setDemo(enabled);
    localStorage.setItem("gpu_monitor_demo", enabled.toString());
    if (enabled) {
      toast.info("Demo mode enabled");
    } else {
      toast.info("Demo mode disabled");
    }
  };

  const handleIntervalChange = (value: string) => {
    const interval = parseInt(value);
    setRefreshInterval(interval);
    localStorage.setItem("gpu_monitor_refresh_interval", interval.toString());
  };

  const handleEnergyRateChange = (value: string) => {
    const rate = parseFloat(value) || 0;
    setEnergyRate(rate);
    localStorage.setItem("gpu_monitor_energy_rate", rate.toString());
  };

  return (
    <Card className="control-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Control Panel
          <div className="flex items-center gap-2 ml-auto">
            {isConnected ? (
              <div className="flex items-center gap-2 text-emerald">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gpu-red">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm">Disconnected</span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {/* API URL */}
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="api-url">API URL</Label>
            <div className="flex gap-2">
              <Input
                id="api-url"
                placeholder="http://localhost:5000/nvidia-smi.json"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                disabled={demo}
              />
              <Button onClick={handleSaveUrl} disabled={demo} size="sm">
                Save
              </Button>
            </div>
          </div>

          {/* Demo Mode */}
          <div className="space-y-2">
            <Label htmlFor="demo-mode">Demo Mode</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="demo-mode"
                checked={demo}
                onCheckedChange={handleDemoToggle}
              />
              <Label htmlFor="demo-mode" className="text-sm text-muted-foreground">
                {demo ? "Enabled" : "Disabled"}
              </Label>
            </div>
          </div>

          {/* Refresh Interval */}
          <div className="space-y-2">
            <Label>Refresh Interval</Label>
            <Select value={refreshInterval.toString()} onValueChange={handleIntervalChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Manual</SelectItem>
                <SelectItem value="1000">1 second</SelectItem>
                <SelectItem value="2000">2 seconds</SelectItem>
                <SelectItem value="3000">3 seconds</SelectItem>
                <SelectItem value="5000">5 seconds</SelectItem>
                <SelectItem value="10000">10 seconds</SelectItem>
                <SelectItem value="30000">30 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Energy Rate */}
          <div className="space-y-2">
            <Label htmlFor="energy-rate">Energy Rate ($/kWh)</Label>
            <Input
              id="energy-rate"
              type="number"
              step="0.01"
              placeholder="0.12"
              value={energyRate || ""}
              onChange={(e) => handleEnergyRateChange(e.target.value)}
            />
          </div>

          {/* Refresh Button */}
          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Button 
              onClick={onRefresh} 
              disabled={isFetching}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}