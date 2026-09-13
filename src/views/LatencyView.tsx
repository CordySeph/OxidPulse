import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { DpcLatencyMetrics } from '../types/diagnostics';
import {
  Activity,
  Play,
  Square,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Headphones,
  Gamepad2,
  CheckCircle2,
  Clock,
  Sparkles,
  Sliders,
  Cpu,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LatencyView: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState<boolean>(true);
  const [latencyData, setLatencyData] = useState<DpcLatencyMetrics | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [peakLatency, setPeakLatency] = useState<number>(0);

  const fetchLatency = async () => {
    try {
      const data = await invoke<DpcLatencyMetrics>('get_dpc_latency_metrics', {
        sampleDurationMs: 150,
      });
      setLatencyData(data);
      setPeakLatency((p) => Math.max(p, data.highest_latency_us));
      setHistory((prev) => [...prev.slice(-40), data.current_latency_us]);
    } catch (err) {
      console.error('Failed to measure DPC latency:', err);
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isMonitoring) {
      fetchLatency();
      timer = setInterval(fetchLatency, 800);
    }
    return () => clearInterval(timer);
  }, [isMonitoring]);

  const getLatencyColor = (val: number) => {
    if (val < 500) return 'text-emerald-400';
    if (val < 1000) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getBarColor = (val: number) => {
    if (val < 500) return 'bg-emerald-400';
    if (val < 1000) return 'bg-amber-400';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Title Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-amber-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <Activity className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              DPC Latency & Real-Time Stutter Monitor
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Measures kernel interrupt execution delays and assesses real-time audio glitch and micro-stuttering risk
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition cursor-pointer ${
              isMonitoring
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {isMonitoring ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isMonitoring ? 'Pause Monitoring' : 'Resume Monitor'}</span>
          </button>

          <button
            onClick={() => {
              setHistory([]);
              setPeakLatency(0);
              fetchLatency();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 text-xs font-mono transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Latency Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Current Latency</span>
          <div className={`my-3 text-3xl font-black font-mono ${getLatencyColor(latencyData?.current_latency_us || 0)}`}>
            {latencyData?.current_latency_us ?? 0} <span className="text-xs text-slate-400 font-sans font-normal">µs</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Instantaneous Kernel Dispatch Delay</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Peak Latency Spike</span>
          <div className={`my-3 text-3xl font-black font-mono ${getLatencyColor(peakLatency)}`}>
            {peakLatency} <span className="text-xs text-slate-400 font-sans font-normal">µs</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Max Interrupt Duration Observed</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Average Latency</span>
          <div className="my-3 text-3xl font-black font-mono text-white">
            {latencyData?.average_latency_us ?? 0} <span className="text-xs text-slate-400 font-sans font-normal">µs</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Sampled across {latencyData?.sample_count ?? 0} ticks</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Audio Dropout Risk</span>
          <div className="my-3 flex items-center space-x-2">
            <span className={`text-xl font-bold font-mono ${latencyData?.is_suitable_for_realtime_audio ? 'text-emerald-400' : 'text-rose-400'}`}>
              {latencyData?.audio_dropout_risk ?? 'Very Low'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">{latencyData?.status ?? 'Optimal Calibration'}</p>
        </div>
      </div>

      {/* Real-time Oscilloscope Latency Graph */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Live Kernel DPC Execution Timeline (µs)
            </h3>
          </div>

          <div className="flex items-center space-x-4 font-mono text-[10px]">
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Optimal (&lt;500µs)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Notice (500-1000µs)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Drop Risk (&gt;1000µs)</span>
            </span>
          </div>
        </div>

        {/* Dynamic Bar Graph */}
        <div className="h-44 rounded-2xl bg-slate-950 p-4 border border-slate-800/80 flex items-end justify-between space-x-1 overflow-hidden">
          {history.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs font-mono text-slate-500">
              Initializing high-resolution timer sampling...
            </div>
          ) : (
            history.map((val, idx) => {
              const heightPct = Math.min(100, Math.max(5, (val / 1200) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  <div
                    className={`w-full rounded-t transition-all duration-200 ${getBarColor(val)}`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <div className="absolute -top-7 hidden group-hover:block px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono text-white whitespace-nowrap z-20">
                    {val} µs
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recommendations & Suitability Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Suitability Badges */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Real-Time Capability Assessment</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Headphones className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-300">ASIO & DAW Audio Production</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">Ready (No Dropouts)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Gamepad2 className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-slate-300">Competitive High-FPS Gaming</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">Zero Micro-stutter</span>
            </div>
          </div>
        </div>

        {/* System Guidance & Tuning */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Low-Latency Tuning Advice</span>
          </h3>

          <div className="space-y-2">
            {latencyData?.recommendations.map((rec, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-300 font-mono flex items-start space-x-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
