# 🤖 Ollama Auto-Discovery Integration

## Overview

The GPU Dashboard now automatically discovers and integrates Ollama instances running on the same hosts as your GPU monitoring endpoints. This provides seamless visibility into both hardware utilization and AI workload performance within each host tab.

## ✨ How It Works

### **Automatic Discovery Process**

1. **Host Addition**: When you add a GPU monitoring host, the system automatically checks for Ollama
2. **Port Scanning**: Scans common Ollama ports (11434, 8080, 3000, 5000) on the same host
3. **API Validation**: Tests `/api/tags` endpoint to confirm Ollama availability
4. **Model Detection**: Automatically discovers available AI models
5. **Integration**: Displays Ollama metrics alongside GPU data in the host tab

### **Discovery Logic**
```typescript
// Extract base URL from GPU host
const hostUrl = "http://server1:5000/nvidia-smi.json"
const baseUrl = "http://server1"

// Test common Ollama ports
const ollamaPorts = ['11434', '8080', '3000', '5000']
// Result: Ollama found at http://server1:11434
```

## 🎯 **Integrated Features**

### **Host Tab Enhancement**
Each GPU host tab now includes:

**Ollama Detection Indicator**
- 🤖 "Ollama detected (X models)" badge when found
- Automatic model count display
- No additional configuration required

**Tabbed Interface**
- **GPUs Tab**: Traditional GPU monitoring (unchanged)
- **AI Models Tab**: Ollama models and metrics (auto-appears when detected)

**Ollama Statistics Cards**
- **AI Models**: Count of available models
- **Model Storage**: Total size of all models
- **Requests**: Inference request statistics  
- **Performance**: Average tokens/second

**Model Cards**
- Model details (size, parameters, quantization)
- Performance testing capabilities
- Family and format information
- Last modified timestamps

## 📊 **Integrated Metrics**

### **Header Statistics**
The main dashboard header now shows:
- **GPU Hosts**: Connected GPU monitoring endpoints
- **GPUs**: Total GPU count across hosts
- **Ollama**: Hosts with Ollama detected
- **AI Models**: Total models across all Ollama instances

### **Footer Summary**
- GPU count and distribution
- AI model count and distribution
- Cross-host statistics

### **Per-Host Metrics**
Each host tab displays:
- GPU utilization and temperature
- AI model availability and performance
- Storage usage for both GPU memory and AI models
- Request statistics and error rates

## 🔧 **Configuration**

### **Zero Configuration Required**
- No separate Ollama host management
- No manual endpoint configuration
- Automatic discovery on every host refresh
- Seamless integration with existing workflow

### **Discovery Settings**
- **Timeout**: 2 seconds per port check
- **Default Ports**: 11434 (Ollama default), 8080, 3000, 5000
- **Retry Logic**: Tests multiple ports automatically
- **Fallback**: Graceful handling when Ollama not found

### **Host URL Examples**
```bash
# GPU monitoring endpoint
http://server1:5000/nvidia-smi.json

# Auto-discovers Ollama at:
http://server1:11434  # Primary Ollama port
http://server1:8080   # Alternative port
http://server1:3000   # Development port
```

## 🚀 **Benefits**

### **Unified Monitoring**
- **Single Pane of Glass**: GPU + AI workloads in one view
- **Contextual Correlation**: See GPU usage alongside AI model activity
- **Simplified Management**: One host entry monitors everything

### **Operational Insights**
- **Resource Correlation**: Link GPU spikes to specific AI models
- **Capacity Planning**: Understand both compute and storage needs
- **Performance Optimization**: Identify bottlenecks across the stack

### **User Experience**
- **Automatic Detection**: No manual configuration
- **Contextual Information**: AI metrics appear where relevant
- **Familiar Interface**: Uses existing host management

## 🔍 **Discovery Examples**

### **Scenario 1: Standard Setup**
```
GPU Host: http://ml-server-1:5000/nvidia-smi.json
✅ Ollama discovered at: http://ml-server-1:11434
📊 Result: Host tab shows both GPU and Ollama metrics
```

### **Scenario 2: Custom Port**
```
GPU Host: http://ai-workstation:8000/nvidia-smi.json  
✅ Ollama discovered at: http://ai-workstation:8080
📊 Result: Auto-discovery finds Ollama on alternative port
```

### **Scenario 3: No Ollama**
```
GPU Host: http://gpu-only-server:5000/nvidia-smi.json
❌ Ollama not found on any common ports
📊 Result: Host tab shows only GPU metrics (normal behavior)
```

## 🎨 **UI Integration**

### **Visual Indicators**
- **Ollama Badge**: 🤖 icon with model count
- **Tab Enhancement**: Additional "AI Models" tab when detected
- **Status Integration**: Ollama info in connection status
- **Statistics Cards**: AI metrics alongside GPU metrics

### **Responsive Design**
- **Desktop**: Full tabbed interface with detailed metrics
- **Tablet**: Condensed view with essential information
- **Mobile**: Stacked layout with priority information

### **Error Handling**
- **Discovery Failures**: Silent fallback to GPU-only mode
- **Network Timeouts**: Non-blocking checks with 2s timeout
- **API Errors**: Graceful handling of Ollama API issues

## 📈 **Performance Metrics**

### **Model Performance**
- **Token Generation Speed**: Real-time inference performance
- **Model Load Time**: Time to initialize models
- **Request Latency**: End-to-end response times
- **Success Rates**: Error monitoring and tracking

### **System Integration**
- **GPU Correlation**: Link GPU usage to AI workloads
- **Memory Tracking**: Both GPU VRAM and model storage
- **Power Analysis**: GPU power draw during AI inference
- **Thermal Monitoring**: Temperature during AI workloads

## 🚦 **Implementation Details**

### **Discovery Architecture**
```typescript
interface HostData {
  url: string;
  name: string;
  isConnected: boolean;
  gpus: GpuInfo[];
  timestamp?: string;
  error?: string;
  ollama?: {                    // ← Auto-discovered
    isAvailable: boolean;
    models: OllamaModel[];
    performanceMetrics: OllamaPerformanceMetrics;
    recentRequests: OllamaRequest[];
  };
}
```

### **Discovery Flow**
1. Fetch GPU data from host
2. Parse host URL to extract base URL
3. Test common Ollama ports with timeout
4. Validate Ollama API response
5. Integrate data into host tab
6. Display unified metrics

### **Error Resilience**
- Non-blocking discovery process
- Timeout protection (2s per port)
- Graceful degradation when Ollama unavailable
- No impact on GPU monitoring functionality

## 🎉 **Ready to Use**

The Ollama auto-discovery feature is now **active and ready**. Simply:

1. **Add GPU hosts normally** using existing host management
2. **Ollama will be discovered automatically** if running on the same host
3. **Access AI metrics** through the enhanced host tabs
4. **Monitor both GPU and AI workloads** in unified interface

**No additional configuration required!** 🚀

---

**The dashboard now provides complete visibility into your GPU + AI infrastructure with zero-configuration auto-discovery.**