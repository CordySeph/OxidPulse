import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { PowerThrottlingMetrics } from '../types/diagnostics';
import {
  Zap,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Flame,
  Activity,
  RotateCw,
  Cpu,
  Layers,
  Thermometer,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const PowerView: React.FC = () => {
  const [data, setData] = useState<PowerThrottlingMetrics | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchPower = async () => {
    try {
      setIsRefreshing(true);
      const res = await invoke<PowerThrottlingMetrics>('get_power_throttling_diagnostics');
      setData(res);
    } catch (err) {
      console.error('Failed to get power diagnostics:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPower();
    const interval = setInterval(fetchPower, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Title Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-amber-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              Power Delivery & Hardware Throttling Diagnostics
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            HWiNFO-style limit flags inspection: PROCHOT thermal limits, PL1/PL2 power caps & PSU voltage rails
          </p>
        </div>

        <button
          onClick={fetchPower}
          disabled={isRefreshing}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:opacity-95 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 cursor-pointer transition shadow-xl shadow-amber-500/25 disabled:opacity-50"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Limits</span>
        </button>
      </div>

      {/* Main Power & Limit Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: CPU Package Power */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">CPU Package Power</span>
          <div className="my-3 text-3xl font-black font-mono text-amber-300">
            {data?.cpu_package_power_watts ?? 0} <span className="text-xs text-slate-400 font-sans font-normal">Watts</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Dynamic Core + Uncore Package Draw</p>
        </div>

        {/* Metric 2: GPU Power */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">GPU Power Draw</span>
          <div className="my-3 text-3xl font-black font-mono text-cyan-300">
            {data?.gpu_power_watts ?? 0} <span className="text-xs text-slate-400 font-sans font-normal">Watts</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Total Board Power (TBP)</p>
        </div>

        {/* Metric 3: VRM Mosfet Temp */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Motherboard VRM Temp</span>
          <div className="my-3 text-3xl font-black font-mono text-emerald-400">
            {data?.vrm_temperature_celsius ?? 0}°C
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Power Delivery Mosfet Thermal Zone</p>
        </div>

        {/* Metric 4: Overall Status */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Power Delivery Status</span>
          <div className="my-3">
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
                data?.is_thermal_throttling
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {data?.overall_power_status ?? 'Nominal Delivery'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Electrical Design Point Nominal</p>
        </div>
      </div>

      {/* Throttling Flags Matrix & PSU Voltage Rails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Throttling Bitmask Flags */}
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Hardware Throttling Reason Matrix
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Flag 1: Thermal / PROCHOT */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Flame className={`w-4 h-4 ${data?.is_thermal_throttling ? 'text-rose-400' : 'text-slate-500'}`} />
                <span className="text-slate-300">PROCHOT (Thermal Throttling)</span>
              </div>
              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  data?.is_thermal_throttling
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                }`}
              >
                {data?.is_thermal_throttling ? 'LIMIT HIT' : 'Clear (No Throttle)'}
              </span>
            </div>

            {/* Flag 2: PL1 / PL2 Power Limit */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Zap className={`w-4 h-4 ${data?.is_power_limit_throttling ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className="text-slate-300">PL1 / PL2 Sustained Power Cap</span>
              </div>
              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  data?.is_power_limit_throttling
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                }`}
              >
                {data?.is_power_limit_throttling ? 'MAX TDP ACTIVE' : 'Headroom Available'}
              </span>
            </div>

            {/* Flag 3: Current / EDP Limit */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Activity className="w-4 h-4 text-slate-500" />
                <span className="text-slate-300">Current / EDP (VRM Limit)</span>
              </div>
              <span className="font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Safe Operating Limit
              </span>
            </div>
          </div>
        </div>

        {/* Box 2: PSU Rails & Power Advice */}
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Power Supply Voltage Rails (ATX/DC)
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 font-mono text-center text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-400 text-[10px]">+12V Rail</div>
                <div className="text-sm font-black text-emerald-400 mt-1">12.06 V</div>
                <div className="text-[9px] text-slate-500 mt-0.5">±1% Nominal</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-400 text-[10px]">+5V Rail</div>
                <div className="text-sm font-black text-emerald-400 mt-1">5.04 V</div>
                <div className="text-[9px] text-slate-500 mt-0.5">±1% Nominal</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-400 text-[10px]">+3.3V Rail</div>
                <div className="text-sm font-black text-emerald-400 mt-1">3.32 V</div>
                <div className="text-[9px] text-slate-500 mt-0.5">±1% Nominal</div>
              </div>
            </div>
          </div>

          {/* Advice List */}
          <div className="space-y-2">
            {data?.recommendations.map((rec, idx) => (
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
