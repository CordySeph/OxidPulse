import React, { useState } from 'react';
import { CrashDumpInfo } from '../types/diagnostics';
import { invoke } from '@tauri-apps/api/core';
import {
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  HardDrive,
  Activity,
  Terminal,
  ExternalLink,
  Wrench,
  Zap,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CrashDumpViewProps {
  crashInfo?: CrashDumpInfo;
}

export const CrashDumpView: React.FC<CrashDumpViewProps> = ({ crashInfo }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState<string | null>(null);

  if (!crashInfo) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
        Inspecting hardware sensors, event logs & kernel crash directory...
      </div>
    );
  }

  const handleLaunchTool = async (tool: string, name: string) => {
    try {
      setIsLaunching(tool);
      const res = await invoke<string>('launch_windows_tool', { tool });
      setToastMessage(res || `Launched ${name}`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      setToastMessage(`Failed to launch: ${err}`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsLaunching(null);
    }
  };

  const hwStatus = crashInfo.hardware_status;
  const osStatus = crashInfo.os_status;

  const getStatusBadge = (status: string) => {
    if (status === 'Healthy') {
      return (
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>100% Clean / Healthy</span>
        </span>
      );
    }
    if (status === 'Warning') {
      return (
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Attention Needed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold">
        <AlertOctagon className="w-3.5 h-3.5" />
        <span>Critical Issue</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 px-4 py-3 rounded-2xl bg-slate-900 border border-cyan-500/40 text-cyan-300 shadow-2xl flex items-center space-x-2 text-xs font-mono"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Verdict Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/95 via-[#0d1527] to-indigo-950/40 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Hardware vs Windows OS Diagnostic Center</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated root cause audit across physical silicon, kernel event logs, and driver watchdogs
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {getStatusBadge(hwStatus?.status === 'Critical' || osStatus?.status === 'Critical' ? 'Critical' : (hwStatus?.status === 'Warning' || osStatus?.status === 'Warning' ? 'Warning' : 'Healthy'))}
          </div>
        </div>

        {/* Diagnosis Summary Box */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-start space-x-3">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Diagnostic Verdict
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {crashInfo.diagnosis_verdict}
            </p>
          </div>
        </div>
      </div>

      {/* Dual Subsystem Integrity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Hardware Subsystem */}
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Hardware Subsystem Integrity
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                Score: {hwStatus?.score ?? 100}/100
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">WHEA Hardware Errors</span>
                <span className={`font-mono font-bold text-sm ${hwStatus?.whea_error_count === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {hwStatus?.whea_error_count === 0 ? '0 (Clean Parity)' : `${hwStatus?.whea_error_count} Errors`}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">Device Manager Faults</span>
                <span className={`font-mono font-bold text-sm ${hwStatus?.problem_device_count === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {hwStatus?.problem_device_count === 0 ? '0 Problem Devices' : `${hwStatus?.problem_device_count} Code Error(s)`}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {hwStatus?.details?.map((detail, idx) => (
                <div key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Physical Silicon / PCIe Bus:</span>
            <span className="text-emerald-400 font-bold">{hwStatus?.status === 'Healthy' ? 'Operating Within Spec' : 'Check Hardware'}</span>
          </div>
        </div>

        {/* Windows OS & Driver Subsystem */}
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Activity className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Windows OS & Driver Subsystem
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">
                Score: {osStatus?.score ?? 100}/100
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">Kernel Minidumps (BSOD)</span>
                <span className={`font-mono font-bold text-sm ${osStatus?.minidump_count === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {osStatus?.minidump_count === 0 ? '0 Dumps (No BSOD)' : `${osStatus?.minidump_count} Crash(es)`}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">Sudden Power Cuts (KP 41)</span>
                <span className={`font-mono font-bold text-sm ${osStatus?.sudden_shutdown_count === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {osStatus?.sudden_shutdown_count === 0 ? '0 Events' : `${osStatus?.sudden_shutdown_count} Event(s)`}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {osStatus?.details?.map((detail, idx) => (
                <div key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                  <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Kernel Stability State:</span>
            <span className="text-cyan-400 font-bold">{osStatus?.status || 'Clean'}</span>
          </div>
        </div>
      </div>

      {/* One-Click Windows Diagnostic Toolkit */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Wrench className="w-5 h-5 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              One-Click Windows Diagnostic & Repair Toolkit
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Built-in Windows Utilities</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <button
            onClick={() => handleLaunchTool('reliability', 'Reliability Monitor')}
            disabled={isLaunching !== null}
            className="p-4 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <Activity className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition">Reliability Monitor</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">perfmon /rel</div>
            </div>
          </button>

          <button
            onClick={() => handleLaunchTool('devmgmt', 'Device Manager')}
            disabled={isLaunching !== null}
            className="p-4 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <Cpu className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition">Device Manager</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">devmgmt.msc</div>
            </div>
          </button>

          <button
            onClick={() => handleLaunchTool('eventvwr', 'Event Viewer')}
            disabled={isLaunching !== null}
            className="p-4 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <Clock className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition">Event Viewer</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">eventvwr.msc</div>
            </div>
          </button>

          <button
            onClick={() => handleLaunchTool('mdsched', 'Memory Diagnostic')}
            disabled={isLaunching !== null}
            className="p-4 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 text-left transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <Zap className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-300 transition">RAM Diagnostic</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">mdsched.exe</div>
            </div>
          </button>

          <button
            onClick={() => handleLaunchTool('sfc', 'SFC Scan')}
            disabled={isLaunching !== null}
            className="p-4 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-rose-500/40 text-left transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <Terminal className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 transition-colors" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-rose-300 transition">SFC System Scan</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">sfc /scannow (Admin)</div>
            </div>
          </button>
        </div>
      </div>

      {/* Actionable Recommendations */}
      {crashInfo.recommendations?.length > 0 && (
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-3 shadow-xl">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Actionable Fix Recommendations
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {crashInfo.recommendations.map((rec, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start space-x-2.5 text-xs text-slate-300 leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stability & Hardware Event History Table */}
      {crashInfo.stability_events?.length > 0 && (
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Recent Critical Windows Events & Hardware Logs
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {crashInfo.stability_events.length} Event(s) Captured
            </span>
          </div>

          <div className="space-y-3">
            {crashInfo.stability_events.map((evt, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${evt.category === 'Power' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : evt.category === 'Hardware' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}`}>
                      {evt.category} • Event {evt.event_id}
                    </span>
                    <span className="font-bold text-white">{evt.title}</span>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">{evt.timestamp}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-1">
                  {evt.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detected BSOD Minidumps List (if any) */}
      {crashInfo.recent_crashes?.length > 0 && (
        <div className="rounded-3xl bg-slate-900/70 border border-rose-500/30 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertOctagon className="w-5 h-5 text-rose-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300 font-mono">
                Detected BSOD Kernel Minidumps ({crashInfo.recent_crashes.length})
              </h3>
            </div>
            <span className="text-xs text-rose-400 font-mono">C:\Windows\Minidump</span>
          </div>

          <div className="space-y-3">
            {crashInfo.recent_crashes.map((crash, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-950/80 border border-rose-500/20 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold font-mono text-white">{crash.dump_file_name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                      {crash.bugcheck_symbol}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{crash.crash_time}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Faulting Driver:</span>
                    <span className="font-mono font-bold text-amber-300">{crash.faulting_driver}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">BugCheck Code:</span>
                    <span className="font-mono font-bold text-rose-400">{crash.bugcheck_code}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                  <span className="text-slate-400 font-bold">Root Cause:</span> {crash.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
