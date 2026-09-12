import React, { useState } from 'react';
import { StressTestResult } from '../types/diagnostics';
import {
  Zap,
  Flame,
  Play,
  RotateCw,
  Award,
  Cpu,
  Sparkles,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StressTestViewProps {
  isRunning: boolean;
  result?: StressTestResult;
  onRunTest: (durationSecs: number) => void;
}

export const StressTestView: React.FC<StressTestViewProps> = ({
  isRunning,
  result,
  onRunTest,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(10);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-amber-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              Hardware Stress & Throttling Benchmark
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multithreaded AVX & floating-point computation stress worker with frequency saturation analysis
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700/60 text-xs font-mono font-bold text-slate-200">
            Workload: Parallel Matrix FMA
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
        {/* Active Compute Reactor Glow during Stress Test */}
        {isRunning && (
          <div className="absolute inset-0 bg-amber-500/5 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-4 border-t-amber-400 border-r-transparent border-b-transparent border-l-transparent animate-reactor-spin" />
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/40 animate-pulse">
                  <Flame className="w-8 h-8 text-slate-950 fill-current" />
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-base font-black text-amber-300 font-mono tracking-tight">
                  HEAVY MULTI-CORE WORKLOAD ACTIVE
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 font-mono">
                  Saturating all 8 CPU execution threads ({selectedDuration}s)...
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">Select Benchmark Duration</h3>
            <p className="text-xs text-slate-400 mt-1">
              Choose stress duration to measure thermal headroom, clock stability, and GFLOPS throughput.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            {[5, 10, 15, 30].map((dur) => (
              <button
                key={dur}
                disabled={isRunning}
                onClick={() => setSelectedDuration(dur)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer disabled:opacity-50 ${
                  selectedDuration === dur
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {dur}s
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center space-x-2.5">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Safety thermal limiter monitoring enabled across all execution threads.</span>
          </div>

          <button
            onClick={() => onRunTest(selectedDuration)}
            disabled={isRunning}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:opacity-95 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center space-x-2.5 cursor-pointer transition shadow-xl shadow-amber-500/25 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin text-slate-950 font-bold" />
                <span>Benchmarking All Cores ({selectedDuration}s)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-slate-950" />
                <span>Execute Stress Benchmark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Stress Benchmark Stability Telemetry
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* GFLOPS Score */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
              <div className="text-[11px] text-slate-400 uppercase font-bold font-mono">Compute Performance</div>
              <div className="my-3 text-3xl font-black font-mono text-cyan-300">
                {result.gflops_score} GFLOPS
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {result.total_iterations.toLocaleString()} ops ({result.threads_used} parallel threads)
              </p>
            </div>

            {/* Thermal Delta */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
              <div className="text-[11px] text-slate-400 uppercase font-bold font-mono">Peak Temperature</div>
              <div className="my-3 text-3xl font-black font-mono text-rose-400">
                {result.peak_temp_celsius.toFixed(1)}°C
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                +{(result.peak_temp_celsius - result.initial_temp_celsius).toFixed(1)}°C delta from {result.initial_temp_celsius.toFixed(0)}°C
              </p>
            </div>

            {/* Clock Stability */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
              <div className="text-[11px] text-slate-400 uppercase font-bold font-mono">Frequency Drop</div>
              <div className="my-3 text-3xl font-black font-mono text-emerald-400">
                {result.clock_drop_percent}% Drop
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {result.thermal_throttling_detected ? 'Thermal Throttling' : 'Zero Clock Throttling'}
              </p>
            </div>

            {/* Stability Score */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
              <div className="text-[11px] text-slate-400 uppercase font-bold font-mono">Stability Rating</div>
              <div className="my-3 text-3xl font-black font-mono text-amber-300">
                {result.stability_score} / 100
              </div>
              <p className="text-[11px] font-bold text-emerald-400 font-mono">
                {result.status}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
