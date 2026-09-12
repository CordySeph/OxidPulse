import React, { useState } from 'react';
import { CpuMetrics, MemoryMetrics, ProcessSnapshot } from '../types/diagnostics';
import {
  Cpu,
  Layers,
  Activity,
  Zap,
  Server,
  TrendingUp,
  Search,
  CheckCircle2,
  HardDrive,
  ListFilter,
  Flame,
} from 'lucide-react';

interface CpuMemoryViewProps {
  cpu?: CpuMetrics;
  memory?: MemoryMetrics;
  processes: ProcessSnapshot[];
}

export const CpuMemoryView: React.FC<CpuMemoryViewProps> = ({
  cpu,
  memory,
  processes,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!cpu || !memory) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
        Loading CPU & Memory Metrics...
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  const filteredProcesses = processes.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              CPU & System Memory Architecture
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-core execution telemetry & unified system memory allocation
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700/60 text-xs font-mono font-bold text-slate-200">
            {cpu.physical_cores} Physical / {cpu.logical_cores} Logical Cores
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
            Full Speed (Unthrottled)
          </div>
        </div>
      </div>

      {/* Main CPU & Memory Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Processor Utilization Card */}
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Processor Core Matrix
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-300">
              Avg Clock: {(cpu.current_frequency_mhz / 1000).toFixed(2)} GHz
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">{cpu.model}</div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Architecture: {cpu.vendor} (4 Performance + 4 Efficiency Cores)
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black font-mono text-indigo-400">
                {cpu.global_usage_percent}%
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">Total Load</span>
            </div>
          </div>

          {/* Per-Core Multi-Thread Heatmap Matrix */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 font-mono mb-3">
              <span>Core Activity Heatmap</span>
              <span>8 Threads Active</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {cpu.per_core_usage.map((usage, idx) => {
                const freq = cpu.per_core_frequencies[idx] || cpu.current_frequency_mhz;
                const isPCore = idx < 4;
                const heatColor =
                  usage > 80
                    ? 'bg-rose-500/25 text-rose-300 border-rose-500/50'
                    : usage > 50
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : usage > 15
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-950/80 text-slate-400 border-slate-800/80';

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all duration-300 ${heatColor}`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="font-bold">{isPCore ? `P-Core ${idx}` : `E-Core ${idx - 4}`}</span>
                      <span className="opacity-75">{(freq / 1000).toFixed(2)}G</span>
                    </div>

                    <div className="my-2 text-xl font-bold font-mono text-white">
                      {usage.toFixed(0)}%
                    </div>

                    <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${usage > 70 ? 'bg-rose-400' : isPCore ? 'bg-indigo-400' : 'bg-cyan-400'}`}
                        style={{ width: `${Math.max(5, usage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* System Memory & Swap Allocation */}
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Unified System Memory
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-300">
                {formatBytes(memory.total_bytes)} Total RAM
              </span>
            </div>

            {/* RAM Progress Bar */}
            <div className="mt-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-white">Active Unified Memory</span>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {formatBytes(memory.used_bytes)} / {formatBytes(memory.total_bytes)} ({memory.usage_percent}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${memory.usage_percent}%` }}
                />
              </div>
              <div className="grid grid-cols-2 text-xs font-mono text-slate-400 pt-1">
                <div>Available: <strong className="text-slate-200">{formatBytes(memory.available_bytes)}</strong></div>
                <div className="text-right">Free: <strong className="text-slate-200">{formatBytes(memory.free_bytes)}</strong></div>
              </div>
            </div>

            {/* Swap / Virtual Memory */}
            <div className="mt-3 p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-white">Swap / Virtual Memory</span>
                <span className="text-xs font-mono font-bold text-indigo-300">
                  {formatBytes(memory.swap_used_bytes)} / {formatBytes(memory.swap_total_bytes)} ({memory.swap_usage_percent}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5">
                <div
                  className="bg-indigo-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${memory.swap_usage_percent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 pt-3 border-t border-slate-800/60 flex items-center justify-between font-mono">
            <span>Memory Topology:</span>
            <span className="text-cyan-300 font-bold">128-bit Unified LPDDR5 Memory Bus</span>
          </div>
        </div>
      </div>

      {/* Top Consuming Processes Table with Instant Filter */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ListFilter className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Process Resource Telemetry ({processes.length} Processes)
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter processes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/60 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">PID</th>
                <th className="px-5 py-3">Process Name</th>
                <th className="px-5 py-3 text-right">CPU Utilization</th>
                <th className="px-5 py-3 text-right">Memory Footprint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {filteredProcesses.map((p) => (
                <tr key={p.pid} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3 text-slate-400">{p.pid}</td>
                  <td className="px-5 py-3 font-sans font-semibold text-white">{p.name}</td>
                  <td className="px-5 py-3 text-right font-bold text-indigo-300">{p.cpu_usage.toFixed(1)}%</td>
                  <td className="px-5 py-3 text-right font-bold text-cyan-300">{p.memory_formatted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
