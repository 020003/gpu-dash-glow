from flask import Flask, jsonify
from flask_cors import CORS
import subprocess
import socket
from datetime import datetime

app = Flask(__name__)
CORS(app)

def run_cmd(cmd: str) -> str:
    return subprocess.check_output(cmd, shell=True, text=True).strip()

def get_gpus():
    q = "index,uuid,name,driver_version,temperature.gpu,utilization.gpu,memory.used,memory.total,power.draw,power.limit,fan.speed"
    out = run_cmd(f"nvidia-smi --format=csv,noheader,nounits --query-gpu={q}")
    gpus = []
    for line in out.splitlines():
        parts = [p.strip() for p in line.split(",")]
        if len(parts) < 10:
            continue
        idx = int(parts[0])
        uuid = parts[1] or None
        name = parts[2]
        driver = parts[3] or None
        temp = int(float(parts[4] or 0))
        util = int(float(parts[5] or 0))
        mem_used = int(float(parts[6] or 0))
        mem_total = int(float(parts[7] or 0))
        p_draw = int(float(parts[8] or 0))
        p_limit = int(float(parts[9] or 0))
        fan_raw = parts[10] if len(parts) > 10 else ""
        fan = int(float(fan_raw)) if fan_raw and fan_raw not in ("N/A", "[N/A]") else None
        gpus.append({
            "id": idx,
            "uuid": uuid,
            "name": name,
            "driverVersion": driver,
            "temperature": temp,
            "utilization": util,
            "memory": {"used": mem_used, "total": mem_total},
            "power": {"draw": p_draw, "limit": p_limit},
            "fan": fan,
            "processes": []
        })

    # attach running processes
    try:
        pq = "gpu_uuid,pid,process_name,used_memory"
        pout = run_cmd(f"nvidia-smi --query-compute-apps={pq} --format=csv,noheader,nounits")
        for line in pout.splitlines():
            parts = [p.strip() for p in line.split(",")]
            if len(parts) < 4:
                continue
            gpu_uuid, pid, pname, pmem = parts[0], int(parts[1]), parts[2], int(float(parts[3] or 0))
            for g in gpus:
                if g.get("uuid") == gpu_uuid:
                    g["processes"].append({"pid": pid, "name": pname, "memory": pmem})
    except subprocess.CalledProcessError:
        pass

    return gpus

@app.get("/nvidia-smi.json")
def nvidia():
    return jsonify({
        "host": socket.gethostname(),
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "gpus": get_gpus(),
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
