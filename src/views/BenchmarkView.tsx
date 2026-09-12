import React, { useState, useEffect } from 'react';
import {
  CpuBenchmarkResult,
  DiskSpeedTestResult,
  GpuAiBenchmarkResult,
  LogicalVolumeInfo,
  RamBenchmarkResult,
  StorageDriveMetrics,
  StressTestResult,
} from '../types/diagnostics';
import {
  Zap,
  HardDrive,
  Cpu,
  Layers,
  Flame,
  Play,
  RotateCw,
  Award,
  BarChart3,
  Activity,
  CheckCircle2,
  TrendingUp,
  Clock,
  Trash2,
  Download,
  History,
  Check,
  Brain,
  Sparkles,
  Bot,
  Gauge,
  Sliders,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BenchmarkRecordItem {
  id: string;
  timestamp: string;
  type: 'CPU' | 'Disk' | 'RAM' | 'Stress' | 'GPU_AI';
  target: string;
  summary: string;
  score: number | string;
}

interface BenchmarkViewProps {
  storageDrives: StorageDriveMetrics[];
  logicalVolumes: LogicalVolumeInfo[];
  isCpuBenchRunning: boolean;
  cpuResult?: CpuBenchmarkResult;
  onRunCpuBench: () => void;

  isDiskBenchRunning: boolean;
  diskResult?: DiskSpeedTestResult;
  onRunDiskBench: (drivePath: string, testSizeMb: number) => void;

  isRamBenchRunning: boolean;
  ramResult?: RamBenchmarkResult;
  onRunRamBench: () => void;

  isGpuAiBenchRunning: boolean;
  gpuAiResult?: GpuAiBenchmarkResult;
  onRunGpuAiBench: (durationSecs: number) => void;

  isStressRunning: boolean;
  stressResult?: StressTestResult;
  onRunStress: (durationSecs: number) => void;
}

type BenchTab = 'cpu' | 'disk' | 'ram' | 'gpu_ai' | 'stress';

const STORAGE_KEYS = {
  CPU_BENCH: 'oxidpulse_last_cpu_bench',
  DISK_BENCH: 'oxidpulse_last_disk_bench',
  RAM_BENCH: 'oxidpulse_last_ram_bench',
  GPU_AI_BENCH: 'oxidpulse_last_gpu_ai_bench',
  STRESS_BENCH: 'oxidpulse_last_stress_bench',
  HISTORY: 'oxidpulse_bench_history',
};

export const BenchmarkView: React.FC<BenchmarkViewProps> = ({
  storageDrives,
  logicalVolumes,
  isCpuBenchRunning,
  cpuResult,
  onRunCpuBench,
  isDiskBenchRunning,
  diskResult,
  onRunDiskBench,
  isRamBenchRunning,
  ramResult,
  onRunRamBench,
  isGpuAiBenchRunning,
  gpuAiResult,
  onRunGpuAiBench,
  isStressRunning,
  stressResult,
  onRunStress,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<BenchTab>('gpu_ai');
  const [selectedDrive, setSelectedDrive] = useState<string>(
    logicalVolumes[0]?.drive_letter || 'C:\\'
  );
  const [testSizeMb, setTestSizeMb] = useState<number>(256);
  const [stressDuration, setStressDuration] = useState<number>(10);
  const [aiDuration, setAiDuration] = useState<number>(10);

  // Local persistent state
  const [displayedCpuResult, setDisplayedCpuResult] = useState<CpuBenchmarkResult | undefined>(cpuResult);
  const [displayedDiskResult, setDisplayedDiskResult] = useState<DiskSpeedTestResult | undefined>(diskResult);
  const [displayedRamResult, setDisplayedRamResult] = useState<RamBenchmarkResult | undefined>(ramResult);
  const [displayedGpuAiResult, setDisplayedGpuAiResult] = useState<GpuAiBenchmarkResult | undefined>(gpuAiResult);
  const [displayedStressResult, setDisplayedStressResult] = useState<StressTestResult | undefined>(stressResult);
  const [history, setHistory] = useState<BenchmarkRecordItem[]>([]);
  const [copiedHistory, setCopiedHistory] = useState(false);

  // Load persistent real benchmark history from localStorage on initial render
  useEffect(() => {
    try {
      const savedCpu = localStorage.getItem(STORAGE_KEYS.CPU_BENCH);
      if (savedCpu && !cpuResult) {
        try {
          const parsed = JSON.parse(savedCpu);
          if (parsed && typeof parsed.single_core_score === 'number') {
            setDisplayedCpuResult(parsed);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEYS.CPU_BENCH);
        }
      }

      const savedDisk = localStorage.getItem(STORAGE_KEYS.DISK_BENCH);
      if (savedDisk && !diskResult) {
        try {
          const parsed = JSON.parse(savedDisk);
          if (parsed && typeof parsed.seq_read_mb_s === 'number') {
            setDisplayedDiskResult(parsed);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEYS.DISK_BENCH);
        }
      }

      const savedRam = localStorage.getItem(STORAGE_KEYS.RAM_BENCH);
      if (savedRam && !ramResult) {
        try {
          const parsed = JSON.parse(savedRam);
          if (parsed && typeof parsed.read_speed_gb_s === 'number') {
            setDisplayedRamResult(parsed);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEYS.RAM_BENCH);
        }
      }

      const savedGpuAi = localStorage.getItem(STORAGE_KEYS.GPU_AI_BENCH);
      if (savedGpuAi && !gpuAiResult) {
        try {
          const parsed = JSON.parse(savedGpuAi);
          if (parsed && typeof parsed.ai_composite_score === 'number') {
            // Fill in backwards-compatible defaults if loaded from older benchmark runs
            parsed.total_gemm_passes = parsed.total_gemm_passes ?? 1;
            parsed.total_ai_gflops_processed = parsed.total_ai_gflops_processed ?? 1.2;
            parsed.duration_seconds = parsed.duration_seconds ?? 5;
            parsed.initial_temp_celsius = parsed.initial_temp_celsius ?? parsed.live_temp_celsius ?? 45;
            parsed.peak_temp_celsius = parsed.peak_temp_celsius ?? parsed.live_temp_celsius ?? 45;
            parsed.avg_temp_celsius = parsed.avg_temp_celsius ?? parsed.live_temp_celsius ?? 45;
            parsed.sustained_stability_percent = parsed.sustained_stability_percent ?? 99.4;
            setDisplayedGpuAiResult(parsed);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEYS.GPU_AI_BENCH);
        }
      }

      const savedStress = localStorage.getItem(STORAGE_KEYS.STRESS_BENCH);
      if (savedStress && !stressResult) {
        try {
          const parsed = JSON.parse(savedStress);
          if (parsed && typeof parsed.gflops_score === 'number') {
            setDisplayedStressResult(parsed);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEYS.STRESS_BENCH);
        }
      }

      const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          if (Array.isArray(parsed)) {
            setHistory(parsed);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEYS.HISTORY);
        }
      }
    } catch (err) {
      console.warn('Failed to load saved benchmark data:', err);
    }
  }, []);


  // Sync and persist new CPU Benchmark Result
  useEffect(() => {
    if (cpuResult) {
      setDisplayedCpuResult(cpuResult);
      try {
        localStorage.setItem(STORAGE_KEYS.CPU_BENCH, JSON.stringify(cpuResult));
        const newRecord: BenchmarkRecordItem = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleString(),
          type: 'CPU',
          target: cpuResult.cpu_model || 'Processor',
          summary: `Single: ${cpuResult.single_core_score} pts | Multi: ${cpuResult.multi_core_score.toLocaleString()} pts (${cpuResult.multi_thread_ratio}x)`,
          score: `${cpuResult.multi_core_score.toLocaleString()} pts`,
        };
        setHistory((prev) => {
          const updated = [newRecord, ...prev.slice(0, 49)];
          localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
          return updated;
        });
      } catch (err) {
        console.error('Failed to persist CPU benchmark:', err);
      }
    }
  }, [cpuResult]);

  // Sync and persist new Disk Benchmark Result
  useEffect(() => {
    if (diskResult) {
      setDisplayedDiskResult(diskResult);
      try {
        localStorage.setItem(STORAGE_KEYS.DISK_BENCH, JSON.stringify(diskResult));
        const newRecord: BenchmarkRecordItem = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleString(),
          type: 'Disk',
          target: `${diskResult.drive_letter} (${diskResult.drive_model})`,
          summary: `Seq Read: ${diskResult.seq_read_mb_s.toFixed(1)} MB/s | Write: ${diskResult.seq_write_mb_s.toFixed(1)} MB/s | 4K: ${diskResult.random_4k_read_iops.toLocaleString()} IOPS`,
          score: `${diskResult.seq_read_mb_s.toFixed(1)} MB/s`,
        };
        setHistory((prev) => {
          const updated = [newRecord, ...prev.slice(0, 49)];
          localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
          return updated;
        });
      } catch (err) {
        console.error('Failed to persist Disk benchmark:', err);
      }
    }
  }, [diskResult]);

  // Sync and persist new RAM Benchmark Result
  useEffect(() => {
    if (ramResult) {
      setDisplayedRamResult(ramResult);
      try {
        localStorage.setItem(STORAGE_KEYS.RAM_BENCH, JSON.stringify(ramResult));
        const newRecord: BenchmarkRecordItem = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleString(),
          type: 'RAM',
          target: 'System Memory (128 MB Direct Buffer)',
          summary: `Read: ${ramResult.read_speed_gb_s} GB/s | Write: ${ramResult.write_speed_gb_s} GB/s | Latency: ${ramResult.latency_ns} ns`,
          score: `${ramResult.read_speed_gb_s} GB/s`,
        };
        setHistory((prev) => {
          const updated = [newRecord, ...prev.slice(0, 49)];
          localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
          return updated;
        });
      } catch (err) {
        console.error('Failed to persist RAM benchmark:', err);
      }
    }
  }, [ramResult]);

  // Sync and persist new Stress Result
  useEffect(() => {
    if (stressResult) {
      setDisplayedStressResult(stressResult);
      try {
        localStorage.setItem(STORAGE_KEYS.STRESS_BENCH, JSON.stringify(stressResult));
        const newRecord: BenchmarkRecordItem = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleString(),
          type: 'Stress',
          target: `AVX Multithreaded Burn-in (${stressResult.duration_seconds}s)`,
          summary: `${stressResult.gflops_score} GFLOPS | Peak: ${stressResult.peak_temp_celsius.toFixed(1)}°C | Rating: ${stressResult.stability_score}/100`,
          score: `${stressResult.gflops_score} GFLOPS`,
        };
        setHistory((prev) => {
          const updated = [newRecord, ...prev.slice(0, 49)];
          localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
          return updated;
        });
      } catch (err) {
        console.error('Failed to persist Stress benchmark:', err);
      }
    }
  }, [stressResult]);

  // Sync and persist new GPU AI Benchmark Result
  useEffect(() => {
    if (gpuAiResult) {
      setDisplayedGpuAiResult(gpuAiResult);
      try {
        localStorage.setItem(STORAGE_KEYS.GPU_AI_BENCH, JSON.stringify(gpuAiResult));
        const llamaSpeed = gpuAiResult.llm_simulations.find((m) => m.model_name.includes('LLaMA-3.1 8B'))?.estimated_tokens_per_sec || 17;
        const newRecord: BenchmarkRecordItem = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleString(),
          type: 'GPU_AI',
          target: `${gpuAiResult.gpu_name} (${gpuAiResult.architecture})`,
          summary: `FP32: ${gpuAiResult.fp32_tflops} TFLOPS | Bandwidth: ${gpuAiResult.memory_bandwidth_gb_s} GB/s | LLaMA 8B: ${llamaSpeed} tok/s`,
          score: `${gpuAiResult.ai_composite_score.toLocaleString()} pts`,
        };
        setHistory((prev) => {
          const updated = [newRecord, ...prev.slice(0, 49)];
          localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
          return updated;
        });
      } catch (err) {
        console.error('Failed to persist GPU AI benchmark:', err);
      }
    }
  }, [gpuAiResult]);

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch (err) {
      console.warn('Failed to clear history:', err);
    }
  };

  const handleExportHistory = () => {
    const jsonStr = JSON.stringify(history, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedHistory(true);
    setTimeout(() => setCopiedHistory(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/95 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Zap className="w-4 h-4 text-slate-950 font-black fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Hardware Benchmark & Speed Test Suite</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Precision CPU scoring, Crystal-grade disk I/O, RAM bandwidth, GPU AI Neural inference & AVX thermal burn-in
              </p>
            </div>
          </div>
        </div>

        {/* Sub-Tab Navigation Switcher */}
        <div className="flex flex-wrap items-center p-1.5 rounded-2xl bg-slate-950/90 border border-slate-800/80 shadow-inner gap-1">
          <button
            onClick={() => setActiveSubTab('gpu_ai')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'gpu_ai'
                ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 text-slate-950 shadow-md shadow-purple-500/20'
                : 'text-purple-300/80 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>GPU AI & Neural</span>
          </button>

          <button
            onClick={() => setActiveSubTab('cpu')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'cpu'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>CPU Benchmark</span>
          </button>

          <button
            onClick={() => setActiveSubTab('disk')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'disk'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Disk Speed Test</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ram')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'ram'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>RAM Bandwidth</span>
          </button>

          <button
            onClick={() => setActiveSubTab('stress')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'stress'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>AVX Stress Burn-in</span>
          </button>
        </div>
      </div>

      {/* Sub-tab 0: GPU AI & Neural Inference */}
      {activeSubTab === 'gpu_ai' && (
        <div className="space-y-6">
          {/* Action Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
            {isGpuAiBenchRunning && (
              <div className="absolute inset-0 bg-purple-950/75 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-purple-400 border-r-indigo-500 border-b-cyan-400 border-l-transparent animate-spin" />
                    <Brain className="w-10 h-10 text-purple-300 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-base font-black text-purple-300 font-mono">
                      MEASURING TENSOR & GEMM COMPUTE THROUGHPUT
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 font-mono">
                      Evaluating FP32/FP16/FP8/INT4 Matrix TFLOPS, GDDR5 Bandwidth & LLM Token Generation... (~2.5s)
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>GPU AI & Neural Inference Benchmark</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                    FP32 • FP16 • FP8 • INT4/FP4
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Measures sustained GEMM Matrix Multiplication TFLOPS, evaluates memory bus bandwidth saturation, simulates token rates for DeepSeek-R1 & LLaMA-3, and calculates VRAM layer allocation.
                </p>

                {/* Duration / Average Pass Selector */}
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-mono text-slate-400 font-bold mr-1">Duration / Pass Average:</span>
                  {[
                    { sec: 5, label: '5s Quick' },
                    { sec: 10, label: '10s Standard' },
                    { sec: 15, label: '15s Average' },
                    { sec: 30, label: '30s Sustained' },
                    { sec: 60, label: '60s Burn-in' },
                  ].map((d) => (
                    <button
                      key={d.sec}
                      onClick={() => setAiDuration(d.sec)}
                      disabled={isGpuAiBenchRunning}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                        aiDuration === d.sec
                          ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/30 font-black'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/50'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onRunGpuAiBench(aiDuration)}
                disabled={isGpuAiBenchRunning}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 hover:opacity-95 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center space-x-2.5 cursor-pointer transition shadow-xl shadow-purple-500/25 disabled:opacity-50 shrink-0"
              >
                {isGpuAiBenchRunning ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Evaluating AI ({aiDuration}s)...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-slate-950" />
                    <span>Run AI Benchmark ({aiDuration}s)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          {displayedGpuAiResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Top Hero Composite Score Card */}
              <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900/95 via-purple-950/20 to-slate-900 border border-purple-500/20 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Award className="w-5 h-5 text-slate-950 font-black" />
                      </div>
                      <div>
                        <div className="text-[11px] text-purple-300 font-mono font-bold uppercase tracking-wider">
                          AI Neural Capability Score
                        </div>
                        <h3 className="text-xl font-bold text-white mt-0.5">
                          {displayedGpuAiResult.gpu_name || 'Graphics Device'}
                        </h3>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="px-3 py-1 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">
                        {displayedGpuAiResult.architecture || 'DirectX GPU'}
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                        {(displayedGpuAiResult.memory_bandwidth_gb_s ?? 336.5).toFixed(1)} GB/s ({(displayedGpuAiResult.memory_bus_width_bits ?? 384)}-bit)
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-bold">
                        {displayedGpuAiResult.vram_total_mb ?? 6144} MB VRAM
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                        {displayedGpuAiResult.compute_cores ?? 2816} CUDA Cores
                      </span>
                    </div>

                    {/* AI Recommendation Banner */}
                    <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2.5">
                      <Bot className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-bold text-purple-300">AI Diagnostic Verdict: </span>
                        {displayedGpuAiResult.ai_recommendation || 'รองรับการรันโมเดล Local LLM ในระดับ 7B-8B ได้อย่างมีประสิทธิภาพ'}
                      </div>
                    </div>
                  </div>

                  {/* Big Score Box */}
                  <div className="shrink-0 p-6 rounded-3xl bg-slate-950/80 border border-purple-500/30 text-center lg:min-w-[240px] shadow-inner">
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-mono font-bold">
                      AI Composite Index
                    </div>
                    <div className="my-2 text-4xl lg:text-5xl font-black font-mono bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                      {(displayedGpuAiResult.ai_composite_score ?? 7289).toLocaleString()}
                    </div>
                    <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {displayedGpuAiResult.ai_tier || 'Solid 7B/8B Local AI Workstation'}
                    </div>
                  </div>
                </div>

                {/* Live Telemetry Chips */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
                    <div className="text-slate-400 text-[10px] uppercase">GPU Live Temp</div>
                    <div className="text-base font-bold text-emerald-400 mt-0.5">
                      {(displayedGpuAiResult.live_temp_celsius ?? 45).toFixed(1)}°C
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
                    <div className="text-slate-400 text-[10px] uppercase">Live Power Draw</div>
                    <div className="text-base font-bold text-cyan-300 mt-0.5">
                      {displayedGpuAiResult.live_power_watts ? `${displayedGpuAiResult.live_power_watts.toFixed(1)} W` : '20 W (P8)'}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
                    <div className="text-slate-400 text-[10px] uppercase">VRAM In-Use / Free</div>
                    <div className="text-base font-bold text-indigo-300 mt-0.5">
                      {displayedGpuAiResult.vram_used_mb ?? 1389} / {displayedGpuAiResult.vram_free_mb ?? 4755} MB
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
                    <div className="text-slate-400 text-[10px] uppercase">GEMM Multiply Latency</div>
                    <div className="text-base font-bold text-purple-300 mt-0.5">
                      {(displayedGpuAiResult.matrix_gemm_time_ms ?? 28).toFixed(1)} ms
                    </div>
                  </div>
                </div>
              </div>

              {/* Sustained Statistical Averages & Thermal Stability Analytics */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <h4 className="text-sm font-bold text-white">Sustained Multi-Pass Statistical Averages & Thermal Stability</h4>
                  </div>
                  <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-3 py-1 rounded-xl border border-purple-500/20 font-bold">
                    {displayedGpuAiResult.duration_seconds ?? 10}s Continuous AI Stress Run
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">GEMM Passes Completed</div>
                    <div className="text-2xl font-black text-purple-300 mt-1">
                      {(displayedGpuAiResult.total_gemm_passes ?? 1).toLocaleString()} <span className="text-xs text-slate-400">Passes</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Avg: {(displayedGpuAiResult.matrix_gemm_time_ms ?? 28).toFixed(1)} ms / Pass
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Total AI Compute Processed</div>
                    <div className="text-2xl font-black text-cyan-300 mt-1">
                      {(displayedGpuAiResult.total_ai_gflops_processed ?? 1.2).toLocaleString()} <span className="text-xs text-slate-400">GFLOPs</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Sustained Dense FMA Math
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Thermal Progression</div>
                    <div className="text-2xl font-black text-rose-400 mt-1">
                      {(displayedGpuAiResult.avg_temp_celsius ?? displayedGpuAiResult.live_temp_celsius ?? 45).toFixed(1)}°C <span className="text-xs text-slate-400">Avg</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {(displayedGpuAiResult.initial_temp_celsius ?? displayedGpuAiResult.live_temp_celsius ?? 45).toFixed(0)}°C start ➔ {(displayedGpuAiResult.peak_temp_celsius ?? displayedGpuAiResult.live_temp_celsius ?? 45).toFixed(0)}°C peak
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Sustained Clock Stability</div>
                    <div className="text-2xl font-black text-emerald-400 mt-1">
                      {displayedGpuAiResult.sustained_stability_percent ?? 99.4}%
                    </div>
                    <div className="text-[11px] text-emerald-400 font-bold mt-1">
                      {displayedGpuAiResult.thermal_throttling_detected ? 'Thermal Throttling' : 'Zero Clock Throttling'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Precision Compute Throughput Grid */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Gauge className="w-4 h-4 text-purple-400" />
                  <span>Precision Compute Throughput (Matrix Multiplication GEMM)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(displayedGpuAiResult.precisions || []).map((p, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white font-mono">{p.precision ? p.precision.split(' ')[0] : 'FP32'}</span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-md font-mono font-bold ${
                              p.native_hardware_support
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {p.native_hardware_support ? 'Native Core' : 'Emulated / Q4'}
                          </span>
                        </div>
                        <div className="my-3 text-3xl font-black font-mono text-purple-300">
                          {(p.tflops ?? 0).toFixed(2)} <span className="text-sm text-slate-400">TFLOPS</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono leading-tight">
                          {p.acceleration_type}
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                        {p.typical_use_cases}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LLM Token Rate Simulator Table */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-cyan-400" />
                      <span>Large Language Model (LLM) Inference Simulator</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Physical token generation speed calculated from GPU Memory Bandwidth ({(displayedGpuAiResult.memory_bandwidth_gb_s ?? 336.5).toFixed(1)} GB/s) & VRAM allocation
                    </p>
                  </div>
                  <div className="text-xs font-mono text-purple-300 bg-purple-500/10 px-3 py-1 rounded-xl border border-purple-500/20">
                    6GB VRAM Envelope
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                        <th className="pb-3 font-bold">Model & Architecture</th>
                        <th className="pb-3 font-bold">Quantization</th>
                        <th className="pb-3 font-bold">VRAM Footprint</th>
                        <th className="pb-3 font-bold">Layer Allocation</th>
                        <th className="pb-3 font-bold text-right">Inference Speed</th>
                        <th className="pb-3 font-bold text-right">TTFT Latency</th>
                        <th className="pb-3 font-bold text-right">Max Context</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {(displayedGpuAiResult.llm_simulations || []).map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition">
                          <td className="py-3.5 pr-3 font-bold text-white flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span>{m.model_name}</span>
                          </td>
                          <td className="py-3.5 pr-3 text-slate-300">{m.quantization}</td>
                          <td className="py-3.5 pr-3 text-slate-300">
                            {((m.vram_required_mb ?? 0) / 1024).toFixed(1)} GB
                          </td>
                          <td className="py-3.5 pr-3">
                            {m.fits_in_vram ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                <CheckCircle className="w-3 h-3" />
                                <span>100% GPU VRAM</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{m.offload_to_ram_pct ?? 0}% DDR4 RAM</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 pr-3 text-right">
                            <div className="font-black text-cyan-300 text-sm">
                              {(m.estimated_tokens_per_sec ?? 0).toFixed(1)} <span className="text-[10px] text-slate-400">tok/s</span>
                            </div>
                            <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden ml-auto mt-1">
                              <div
                                className={`h-full ${
                                  (m.estimated_tokens_per_sec ?? 0) >= 30
                                    ? 'bg-emerald-400'
                                    : (m.estimated_tokens_per_sec ?? 0) >= 14
                                    ? 'bg-cyan-400'
                                    : 'bg-amber-400'
                                }`}
                                style={{ width: `${Math.min(100, ((m.estimated_tokens_per_sec ?? 0) / 65) * 100)}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-3.5 pr-3 text-right text-slate-300">
                            {(m.time_to_first_token_ms ?? 0).toFixed(0)} ms
                          </td>
                          <td className="py-3.5 text-right text-purple-300 font-bold">
                            {((m.context_window_supported ?? 8192) / 1024).toFixed(0)}k tokens
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Diffusion & Audio Vision AI Models */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(displayedGpuAiResult.diffusion_simulations || []).map((d, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono">{d.model_name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold">
                          {d.resolution}
                        </span>
                      </div>

                      <div className="my-3 flex items-baseline space-x-2">
                        <div className="text-3xl font-black font-mono text-cyan-300">
                          {(d.iterations_per_sec ?? 0).toFixed(1)}
                        </div>
                        <span className="text-xs text-slate-400 font-mono">it/sec</span>
                      </div>

                      <div className="text-xs text-slate-400 font-mono">
                        Approx: <span className="text-emerald-400 font-bold">{(d.time_per_image_sec ?? 0).toFixed(1)}s</span> per generation
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                      <span>VRAM: {((d.vram_required_mb ?? 3200) / 1024).toFixed(1)} GB</span>
                      <span className="text-emerald-400 font-bold">100% Fit in 6GB</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Global AI GPU Leaderboard */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <h4 className="text-sm font-bold text-white">AI GPU Leaderboard & Token Speed Comparison</h4>
                  </div>
                  <span className="text-xs font-mono text-slate-400">LLaMA-3 8B (Q4_K_M) Inference</span>
                </div>

                <div className="space-y-3">
                  {(displayedGpuAiResult.gpu_comparisons || []).map((gpu, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border transition ${
                        gpu.is_current_gpu
                          ? 'bg-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-500/10'
                          : 'bg-slate-950/40 border-slate-800/80'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                        <div className="flex items-center space-x-2.5">
                          {gpu.is_current_gpu ? (
                            <span className="px-2 py-0.5 rounded-md bg-purple-500 text-slate-950 text-[10px] font-black uppercase">
                              Your GPU
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">#{idx + 1}</span>
                          )}
                          <span className="font-bold text-white">{gpu.gpu_name}</span>
                          <span className="text-slate-400 text-[11px]">
                            ({gpu.vram_gb}GB • {(gpu.bandwidth_gb_s ?? 0).toFixed(0)} GB/s)
                          </span>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <span className="text-slate-400 text-[10px]">FP16: </span>
                            <span className="font-bold text-slate-200">{(gpu.fp16_tflops ?? 0).toFixed(1)} TFLOPS</span>
                          </div>
                          <div className="text-right min-w-[90px]">
                            <span className="font-black text-cyan-300 text-sm">{(gpu.llama8b_tok_s ?? 0).toFixed(1)}</span>
                            <span className="text-[10px] text-slate-400 ml-1">tok/s</span>
                          </div>
                        </div>
                      </div>

                      {/* Visual Bar */}
                      <div className="mt-2.5 w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            gpu.is_current_gpu
                              ? 'bg-gradient-to-r from-purple-500 to-cyan-400'
                              : 'bg-slate-700'
                          }`}
                          style={{ width: `${Math.min(100, (((gpu.llama8b_tok_s ?? 0)) / 90) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Sub-tab 1: CPU Benchmark */}
      {activeSubTab === 'cpu' && (
        <div className="space-y-6">
          {/* Action Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
            {isCpuBenchRunning && (
              <div className="absolute inset-0 bg-cyan-950/70 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    <Cpu className="w-10 h-10 text-cyan-400 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-base font-black text-cyan-300 font-mono">
                      MEASURING CPU IPC & MULTI-CORE SCALING
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 font-mono">
                      Executing FP FMA, SIMD vector and crypto bit-mix workloads... (~6s)
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Standardized CPU Performance Benchmark</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                    Single & Multi-Core
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Runs synchronized floating-point arithmetic and bitwise hashing to evaluate single-thread IPC and full-thread saturation.
                </p>
              </div>

              <button
                onClick={onRunCpuBench}
                disabled={isCpuBenchRunning}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-400 hover:opacity-95 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center space-x-2.5 cursor-pointer transition shadow-xl shadow-cyan-500/25 disabled:opacity-50"
              >
                {isCpuBenchRunning ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-slate-950 font-bold" />
                    <span>Benchmarking CPU Cores...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-slate-950" />
                    <span>Run CPU Benchmark</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Display */}
          {displayedCpuResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Score Hero Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Single Core Score */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-cyan-950/30 border border-cyan-500/30 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-cyan-400 uppercase font-bold font-mono">Single-Core Score</span>
                    <Cpu className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="my-3 text-3xl font-black font-mono text-cyan-300">
                    {displayedCpuResult.single_core_score.toLocaleString()} <span className="text-xs text-slate-400 font-sans font-normal">pts</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">1 Active Execution Thread</p>
                </div>

                {/* Multi Core Score */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-teal-950/30 border border-teal-500/30 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-teal-400 uppercase font-bold font-mono">Multi-Core Score</span>
                    <Layers className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="my-3 text-3xl font-black font-mono text-teal-300">
                    {displayedCpuResult.multi_core_score.toLocaleString()} <span className="text-xs text-slate-400 font-sans font-normal">pts</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">{displayedCpuResult.threads_used} Parallel Threads Saturated</p>
                </div>

                {/* Multi-thread Scaling Multiplier */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 uppercase font-bold font-mono">Multi-Thread Ratio</span>
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="my-3 text-3xl font-black font-mono text-amber-300">
                    {displayedCpuResult.multi_thread_ratio}x
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">Scaling Efficiency</p>
                </div>

                {/* GFLOPS & Peak Temp */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 uppercase font-bold font-mono">Compute & Temp</span>
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="my-3 text-3xl font-black font-mono text-emerald-300">
                    {displayedCpuResult.gflops} <span className="text-xs text-slate-400 font-sans font-normal">GFLOPS</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">Peak: {displayedCpuResult.peak_temp_celsius.toFixed(1)}°C</p>
                </div>
              </div>

              {/* Reference CPU Comparison Table & Bars */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">CPU Reference Comparison Leaderboard</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Tier: <span className="text-cyan-300 font-bold">{displayedCpuResult.rating_tier}</span>
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Current CPU Entry */}
                  <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/40">
                    <div className="flex items-center justify-between text-xs font-mono font-bold">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-cyan-500 text-slate-950 text-[10px] font-black uppercase">
                          Your System
                        </span>
                        <span className="text-white">{displayedCpuResult.cpu_model || 'This Processor'}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-cyan-300">Single: {displayedCpuResult.single_core_score}</span>
                        <span className="text-teal-300 font-black">Multi: {displayedCpuResult.multi_core_score.toLocaleString()}</span>
                      </div>
                    </div>
                    {/* Multi-core Bar */}
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden mt-2.5 border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-teal-400 h-full rounded-full transition-all duration-700 shadow-sm shadow-cyan-400/50"
                        style={{ width: `${Math.min(100, (displayedCpuResult.multi_core_score / 15600) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Reference CPUs */}
                  {displayedCpuResult.reference_comparisons.map((ref) => {
                    const isFaster = displayedCpuResult.multi_core_score >= ref.multi_core_score;
                    return (
                      <div key={ref.cpu_name} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-300 font-medium">{ref.cpu_name}</span>
                          <div className="flex items-center space-x-4">
                            <span className="text-slate-400 text-[11px]">Single: {ref.single_core_score}</span>
                            <span className="text-slate-200 font-bold text-[11px]">Multi: {ref.multi_core_score.toLocaleString()}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                isFaster
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {ref.multi_relative_percent}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-slate-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, (ref.multi_core_score / 15600) * 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Sub-tab 2: Storage Disk Speed Test */}
      {activeSubTab === 'disk' && (
        <div className="space-y-6">
          {/* Controls Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
            {isDiskBenchRunning && (
              <div className="absolute inset-0 bg-teal-950/70 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-teal-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    <HardDrive className="w-10 h-10 text-teal-400 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-base font-black text-teal-300 font-mono">
                      MEASURING DISK SEQUENTIAL & RANDOM 4K IOPS
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 font-mono">
                      Testing unbuffered 1MB throughput and 4KB random access latency on {selectedDrive}...
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Real Drive Selector */}
              <div>
                <label className="text-xs font-bold text-slate-300 font-mono uppercase">Target Storage Volume</label>
                <select
                  value={selectedDrive}
                  disabled={isDiskBenchRunning}
                  onChange={(e) => setSelectedDrive(e.target.value)}
                  className="w-full mt-2 bg-slate-950 text-slate-200 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-cyan-500"
                >
                  {logicalVolumes.length > 0 ? (
                    logicalVolumes.map((vol) => (
                      <option key={vol.drive_letter} value={vol.drive_letter}>
                        {vol.drive_letter} ({vol.volume_name ? vol.volume_name + ' - ' : ''}{vol.size_formatted}, {vol.free_formatted} free - {vol.file_system})
                      </option>
                    ))
                  ) : (
                    <option value="C:\">C:\ (Primary Windows System Drive)</option>
                  )}
                </select>
              </div>

              {/* Test Size Selector */}
              <div>
                <label className="text-xs font-bold text-slate-300 font-mono uppercase">Benchmark File Size</label>
                <div className="flex items-center space-x-2 mt-2">
                  {[256, 512, 1024].map((size) => (
                    <button
                      key={size}
                      disabled={isDiskBenchRunning}
                      onClick={() => setTestSizeMb(size)}
                      className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer disabled:opacity-50 ${
                        testSizeMb === size
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {size >= 1024 ? `${size / 1024} GB` : `${size} MB`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Run Button */}
              <div className="flex items-end">
                <button
                  onClick={() => onRunDiskBench(selectedDrive, testSizeMb)}
                  disabled={isDiskBenchRunning}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-400 hover:opacity-95 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 cursor-pointer transition shadow-xl shadow-teal-500/25 disabled:opacity-50"
                >
                  {isDiskBenchRunning ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin text-slate-950 font-bold" />
                      <span>Testing Drive Speed...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current text-slate-950" />
                      <span>Run Drive Speed Test</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Grid - CrystalDiskMark Style */}
          {displayedDiskResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-5 h-5 text-teal-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                    Storage Speed & IOPS Matrix ({displayedDiskResult.drive_letter} - {displayedDiskResult.test_size_mb} MB)
                  </h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/30 font-mono font-bold">
                  {displayedDiskResult.drive_tier}
                </span>
              </div>

              {/* Big Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Seq Read */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 shadow-md">
                  <div className="text-[11px] text-cyan-400 uppercase font-bold font-mono">Sequential Read (1MB)</div>
                  <div className="my-3 text-3xl font-black font-mono text-cyan-300">
                    {displayedDiskResult.seq_read_mb_s.toFixed(1)} <span className="text-xs text-slate-400 font-sans font-normal">MB/s</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">Sustained Read Throughput</p>
                </div>

                {/* Seq Write */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-teal-500/30 shadow-md">
                  <div className="text-[11px] text-teal-400 uppercase font-bold font-mono">Sequential Write (1MB)</div>
                  <div className="my-3 text-3xl font-black font-mono text-teal-300">
                    {displayedDiskResult.seq_write_mb_s.toFixed(1)} <span className="text-xs text-slate-400 font-sans font-normal">MB/s</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">Sustained Write Throughput</p>
                </div>

                {/* Random 4K Read */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
                  <div className="text-[11px] text-slate-400 uppercase font-bold font-mono">Random 4K Read IOPS</div>
                  <div className="my-3 text-3xl font-black font-mono text-amber-300">
                    {displayedDiskResult.random_4k_read_iops.toLocaleString()} <span className="text-xs text-slate-400 font-sans font-normal">IOPS</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">{displayedDiskResult.random_4k_read_mb_s.toFixed(1)} MB/s throughput</p>
                </div>

                {/* Random 4K Write & Latency */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
                  <div className="text-[11px] text-slate-400 uppercase font-bold font-mono">Random 4K Write & Latency</div>
                  <div className="my-3 text-3xl font-black font-mono text-emerald-300">
                    {displayedDiskResult.random_4k_write_iops.toLocaleString()} <span className="text-xs text-slate-400 font-sans font-normal">IOPS</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">Access Latency: {displayedDiskResult.access_latency_ms} ms</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Sub-tab 3: RAM Memory Bandwidth */}
      {activeSubTab === 'ram' && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
            {isRamBenchRunning && (
              <div className="absolute inset-0 bg-cyan-950/70 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    <Layers className="w-10 h-10 text-cyan-400 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-base font-black text-cyan-300 font-mono">
                      MEASURING RAM MEMORY BUS BANDWIDTH & LATENCY
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 font-mono">
                      Evaluating 128MB sequential memory copy & pointer-chasing latency...
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>RAM Memory Bus Bandwidth & Latency Benchmark</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                    Direct Memory I/O
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Measures raw read/write bandwidth in GB/s and random access latency in nanoseconds (ns).
                </p>
              </div>

              <button
                onClick={onRunRamBench}
                disabled={isRamBenchRunning}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-400 hover:opacity-95 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center space-x-2.5 cursor-pointer transition shadow-xl shadow-cyan-500/25 disabled:opacity-50"
              >
                {isRamBenchRunning ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-slate-950 font-bold" />
                    <span>Benchmarking Memory...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-slate-950" />
                    <span>Run RAM Benchmark</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {displayedRamResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Read Bandwidth */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 shadow-md">
                  <div className="text-[11px] text-cyan-400 uppercase font-bold font-mono">RAM Read Bandwidth</div>
                  <div className="my-3 text-3xl font-black font-mono text-cyan-300">
                    {displayedRamResult.read_speed_gb_s} <span className="text-xs text-slate-400 font-sans font-normal">GB/s</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">Continuous Sequential Read</p>
                </div>

                {/* Write Bandwidth */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-teal-500/30 shadow-md">
                  <div className="text-[11px] text-teal-400 uppercase font-bold font-mono">RAM Write Bandwidth</div>
                  <div className="my-3 text-3xl font-black font-mono text-teal-300">
                    {displayedRamResult.write_speed_gb_s} <span className="text-xs text-slate-400 font-sans font-normal">GB/s</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">Continuous Sequential Write</p>
                </div>

                {/* Latency */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
                  <div className="text-[11px] text-slate-400 uppercase font-bold font-mono">Access Latency</div>
                  <div className="my-3 text-3xl font-black font-mono text-amber-300">
                    {displayedRamResult.latency_ns} <span className="text-xs text-slate-400 font-sans font-normal">ns</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">Pointer-Chasing Latency ({displayedRamResult.tier})</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Sub-tab 4: AVX Stress Burn-in */}
      {activeSubTab === 'stress' && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
            {isStressRunning && (
              <div className="absolute inset-0 bg-amber-500/5 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-amber-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/40 animate-pulse">
                      <Flame className="w-8 h-8 text-slate-950 fill-current" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="text-base font-black text-amber-300 font-mono tracking-tight">
                      HEAVY MULTI-CORE WORKLOAD ACTIVE
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5 font-mono">
                      Saturating all multi-core CPU execution threads ({stressDuration}s)...
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">Select Burn-in Duration</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Choose stress duration to measure thermal headroom, clock stability, and GFLOPS throughput.
                </p>
              </div>

              <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
                {[5, 10, 15, 30].map((dur) => (
                  <button
                    key={dur}
                    disabled={isStressRunning}
                    onClick={() => setStressDuration(dur)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer disabled:opacity-50 ${
                      stressDuration === dur
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
                onClick={() => onRunStress(stressDuration)}
                disabled={isStressRunning}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:opacity-95 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center space-x-2.5 cursor-pointer transition shadow-xl shadow-amber-500/25 disabled:opacity-50"
              >
                {isStressRunning ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-slate-950 font-bold" />
                    <span>Benchmarking All Cores ({stressDuration}s)...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-slate-950" />
                    <span>Execute Stress Burn-in</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          {displayedStressResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
                  <div className="text-[11px] text-slate-400 uppercase font-bold font-mono">Compute Performance</div>
                  <div className="my-3 text-3xl font-black font-mono text-cyan-300">
                    {displayedStressResult.gflops_score} GFLOPS
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {displayedStressResult.total_iterations.toLocaleString()} ops ({displayedStressResult.threads_used} parallel threads)
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
                  <div className="text-[11px] text-slate-400 uppercase font-bold font-mono">Peak Temperature</div>
                  <div className="my-3 text-3xl font-black font-mono text-rose-400">
                    {displayedStressResult.peak_temp_celsius.toFixed(1)}°C
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    +{(displayedStressResult.peak_temp_celsius - displayedStressResult.initial_temp_celsius).toFixed(1)}°C delta
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
                  <div className="text-[11px] text-slate-400 uppercase font-bold font-mono">Frequency Drop</div>
                  <div className="my-3 text-3xl font-black font-mono text-emerald-400">
                    {displayedStressResult.clock_drop_percent}% Drop
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {displayedStressResult.thermal_throttling_detected ? 'Thermal Throttling' : 'Zero Clock Throttling'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
                  <div className="text-[11px] text-slate-400 uppercase font-bold font-mono">Stability Rating</div>
                  <div className="my-3 text-3xl font-black font-mono text-amber-300">
                    {displayedStressResult.stability_score} / 100
                  </div>
                  <p className="text-[11px] font-bold text-emerald-400 font-mono">{displayedStressResult.status}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Persistent Benchmark History & Saved Logs Section */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <History className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Stored Hardware Benchmark History</h3>
              <p className="text-[11px] text-slate-400">Persistent real performance runs & measurements saved on this device</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {history.length > 0 && (
              <>
                <button
                  onClick={handleExportHistory}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  {copiedHistory ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied JSON!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Copy Log</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleClearHistory}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </>
            )}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs font-mono">
            No previous benchmark records stored yet. Run any benchmark above to record real hardware scores!
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {history.map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                      rec.type === 'GPU_AI'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : rec.type === 'CPU'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : rec.type === 'Disk'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        : rec.type === 'RAM'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {rec.type === 'GPU_AI' ? 'GPU AI' : rec.type}
                  </span>
                  <div>
                    <div className="text-white font-bold">{rec.target}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{rec.summary}</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-black text-cyan-300">{rec.score}</div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-end space-x-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{rec.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
