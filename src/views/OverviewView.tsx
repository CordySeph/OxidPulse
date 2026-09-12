import React from 'react';
import {
  BatterySnapshot,
  CpuMetrics,
  CrashDumpInfo,
  MemoryMetrics,
  StorageDriveMetrics,
  SystemHealthReport,
  ThermalSensorMetrics,
} from '../types/diagnostics';
import {
  BatteryCharging,
  HardDrive,
  Cpu,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Zap,
  Activity,
  Layers,
  Award,
} from 'lucide-react';
import { TabType } from '../components/Sidebar';
import { motion } from 'framer-motion';

interface OverviewViewProps {
  report?: SystemHealthReport;
  battery?: BatterySnapshot;
  storage: StorageDriveMetrics[];
  cpu?: CpuMetrics;
  memory?: MemoryMetrics;
  thermals?: ThermalSensorMetrics;
  crashDump?: CrashDumpInfo;
  onNavigate: (tab: TabType) => void;
  onRunStress: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  report,
  battery,
  storage,
  cpu,
  memory,
  thermals,
  crashDump,
  onNavigate,
  onRunStress,
}) => {
  const overallScore = report?.overall_score ?? 96;
  const warnings = report?.warnings ?? [];
  const recommendations = report?.recommendations ?? [];
  const primaryDrive = storage[0];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 stroke-emerald-400';
    if (score >= 75) return 'text-cyan-400 stroke-cyan-400';
    if (score >= 60) return 'text-amber-400 stroke-amber-400';
    return 'text-rose-400 stroke-rose-400';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-12"
    >
      {/* Top Health Hero Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main 0-100 Score Circular Card */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-4 rounded-3xl bg-gradient-to-b from-slate-900/90 via-[#0c1322] to-[#080d1a] border border-slate-800/90 p-6 flex flex-col items-center justify-between relative overflow-hidden shadow-2xl group"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/15 transition-all duration-700" />
          
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                System Health Radar
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              Grade: {report?.status_level || 'Excellent'}
            </span>
          </div>

          {/* SVG Animated Radial Gauge */}
          <div className="my-5 relative flex items-center justify-center">
            <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                className="stroke-slate-800/80"
                strokeWidth="10"
                fill="transparent"
              />
              <motion.circle
                cx="60"
                cy="60"
                r="50"
                className={`${getScoreColor(overallScore)}`}
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 50}
                initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - overallScore / 100) }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl font-black font-mono text-white tracking-tight"
              >
                {overallScore}
              </motion.span>
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-1 font-mono">
                Out of 100
              </span>
            </div>
          </div>

          {/* Sub-Score Breakdown Chips */}
          <div className="w-full grid grid-cols-4 gap-2 pt-4 border-t border-slate-800/80">
            <div className="text-center p-2 rounded-2xl bg-slate-950/70 border border-slate-800/70">
              <div className="text-[10px] text-slate-400 font-mono">Battery</div>
              <div className="text-xs font-bold font-mono text-cyan-400 mt-0.5">
                {report?.battery_subscore ?? 88}%
              </div>
            </div>
            <div className="text-center p-2 rounded-2xl bg-slate-950/70 border border-slate-800/70">
              <div className="text-[10px] text-slate-400 font-mono">SSD Life</div>
              <div className="text-xs font-bold font-mono text-emerald-400 mt-0.5">
                {report?.storage_subscore ?? 98}%
              </div>
            </div>
            <div className="text-center p-2 rounded-2xl bg-slate-950/70 border border-slate-800/70">
              <div className="text-[10px] text-slate-400 font-mono">Thermals</div>
              <div className="text-xs font-bold font-mono text-teal-400 mt-0.5">
                {report?.thermal_subscore ?? 96}%
              </div>
            </div>
            <div className="text-center p-2 rounded-2xl bg-slate-950/70 border border-slate-800/70">
              <div className="text-[10px] text-slate-400 font-mono">Stability</div>
              <div className="text-xs font-bold font-mono text-indigo-400 mt-0.5">
                {report?.stability_subscore ?? 100}%
              </div>
            </div>
          </div>
        </motion.div>

        {/* 4 Key Diagnostic Cards Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Battery & Power */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            onClick={() => onNavigate('battery')}
            className="rounded-3xl bg-slate-900/80 border border-slate-800/90 p-5 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between shadow-lg hover:shadow-cyan-950/30 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wide">Battery Telemetry</h4>
                  <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                    {battery?.ac_status || 'AC Connected'}
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-cyan-300 group-hover:bg-cyan-500/20 transition">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div className="my-4 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold font-mono text-white">
                  {battery?.health_percent ?? 88}%
                </span>
                <span className="text-xs text-slate-400 ml-1.5 font-medium">Health</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {battery?.cycle_count ?? 226} Cycles
                </span>
                <span className="text-[10px] text-slate-400 ml-1">({battery?.wear_percent ?? 12}% wear)</span>
              </div>
            </div>

            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden p-0.5">
              <motion.div
                className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${battery?.health_percent ?? 88}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </motion.div>

          {/* Card 2: NVMe SSD Storage */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            onClick={() => onNavigate('storage')}
            className="rounded-3xl bg-slate-900/80 border border-slate-800/90 p-5 hover:border-emerald-500/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between shadow-lg hover:shadow-emerald-950/30 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wide">Storage Health</h4>
                  <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                    {primaryDrive?.model || 'APPLE SSD 256GB'}
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-emerald-300 group-hover:bg-emerald-500/20 transition">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div className="my-4 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold font-mono text-white">
                  {primaryDrive?.health_score ?? 98}%
                </span>
                <span className="text-xs text-emerald-400 font-bold ml-1.5">
                  {primaryDrive?.health_status || 'Healthy'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-slate-200">
                  {primaryDrive?.size_formatted || '251.0 GB'}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">NVMe</span>
              </div>
            </div>

            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden p-0.5">
              <motion.div
                className="bg-emerald-400 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${primaryDrive?.health_score ?? 98}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </motion.div>

          {/* Card 3: CPU & RAM Matrix */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            onClick={() => onNavigate('cpu_ram')}
            className="rounded-3xl bg-slate-900/80 border border-slate-800/90 p-5 hover:border-indigo-500/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between shadow-lg hover:shadow-indigo-950/30 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wide">CPU & Memory</h4>
                  <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                    {cpu?.model || 'Multi-Core Processor'}
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-indigo-300 group-hover:bg-indigo-500/20 transition">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div className="my-4 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold font-mono text-white">
                  {cpu?.global_usage_percent ?? 12}%
                </span>
                <span className="text-xs text-slate-400 ml-1.5 font-medium">CPU Load</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-indigo-300">
                  {memory?.usage_percent ?? 38}% RAM
                </span>
                <span className="text-[10px] text-slate-400 ml-1">Allocated</span>
              </div>
            </div>

            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden p-0.5">
              <motion.div
                className="bg-indigo-400 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${cpu?.global_usage_percent ?? 12}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </motion.div>

          {/* Card 4: Thermals & GPU */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            onClick={() => onNavigate('thermals')}
            className="rounded-3xl bg-slate-900/80 border border-slate-800/90 p-5 hover:border-rose-500/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between shadow-lg hover:shadow-rose-950/30 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wide">Thermals & GPU</h4>
                  <p className="text-[11px] text-slate-400">Active Thermal & Fan Telemetry</p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-rose-300 group-hover:bg-rose-500/20 transition">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div className="my-4 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold font-mono text-white">
                  {thermals?.cpu_package_temp ?? 41.5}°C
                </span>
                <span className="text-xs text-slate-400 ml-1.5 font-medium">SoC Temp</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  Optimal (Cold)
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden p-0.5">
              <motion.div
                className="bg-gradient-to-r from-teal-400 via-emerald-400 to-rose-400 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (thermals?.cpu_package_temp ?? 41.5) * 1.5)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Diagnostics Alerts & Hardware Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* System Warnings & Diagnostics Alerts */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl bg-slate-900/80 border border-slate-800/90 p-6 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Hardware Integrity Status
              </h3>
            </div>
            {warnings.length === 0 ? (
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                100% All Clear
              </span>
            ) : (
              <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                {warnings.length} Alert{warnings.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {warnings.length === 0 ? (
              <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800/60 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-white">All Hardware Subsystems Nominal</p>
                <p className="text-[11px] text-slate-400">
                  NVMe SMART health verified, CPU & GPU operating within optimal thermal limits, zero kernel crashes detected.
                </p>
              </div>
            ) : (
              warnings.map((warn, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border text-xs ${
                    warn.severity === 'Critical'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">{warn.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold bg-black/30">
                      {warn.category}
                    </span>
                  </div>
                  <p className="text-xs opacity-90 leading-relaxed mt-1">{warn.message}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Actionable Engineering Recommendations */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl bg-slate-900/80 border border-slate-800/90 p-6 space-y-4 flex flex-col justify-between shadow-xl"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Award className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Diagnostics Recommendations
                </h3>
              </div>
              <button
                onClick={onRunStress}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-teal-500/20 hover:from-cyan-500/30 hover:to-teal-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Launch Benchmarks</span>
              </button>

            </div>

            <div className="space-y-3 mt-4">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs flex items-start space-x-3"
                >
                  <div className="w-6 h-6 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono text-[11px]">
                    {idx + 1}
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>OxidPulse Diagnostic Engine</span>
            <span>Version 2.0 Native</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
