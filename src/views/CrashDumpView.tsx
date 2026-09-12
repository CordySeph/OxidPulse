import React from 'react';
import { CrashDumpInfo } from '../types/diagnostics';
import {
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';

interface CrashDumpViewProps {
  crashInfo?: CrashDumpInfo;
}

export const CrashDumpView: React.FC<CrashDumpViewProps> = ({ crashInfo }) => {
  if (!crashInfo) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
        Inspecting kernel crash dump directory...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-rose-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-white">
              Kernel Crash Logs & Stability Audit
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Diagnostic scan of <code className="text-rose-300 font-mono text-[11px]">{crashInfo.minidump_directory}</code> for crash reports
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700/60 text-xs font-mono font-bold text-slate-200">
            {crashInfo.total_dumps_found} Crash Incident{crashInfo.total_dumps_found === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* Clean System Notice or Dumps List */}
      {crashInfo.total_dumps_found === 0 ? (
        <div className="p-10 rounded-3xl bg-slate-900/70 border border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Zero Kernel Crashes Detected</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              No BSOD minidumps or kernel panic logs were found in <code className="font-mono text-cyan-300">{crashInfo.minidump_directory}</code>. System kernel and driver stability are 100% clean.
            </p>
          </div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Stability Score: 100/100</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Detected Crash Incidents
          </div>

          <div className="grid grid-cols-1 gap-4">
            {crashInfo.recent_crashes.map((crash, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-900/80 border border-rose-500/30 space-y-4 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white font-mono">{crash.dump_file_name}</span>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                          {crash.bugcheck_symbol}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Crash Timestamp: {crash.crash_time}
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs text-slate-300">
                    BugCheck Code: <span className="text-rose-400 font-bold">{crash.bugcheck_code}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-400 block mb-1">Faulting Driver / Subsystem:</span>
                    <span className="font-mono font-bold text-amber-300 text-sm">
                      {crash.faulting_driver}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-400 block mb-1">Log Location:</span>
                    <span className="font-mono text-slate-300 truncate block">
                      {crash.dump_path}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60 leading-relaxed">
                  <span className="text-slate-400 font-bold">Root Cause Analysis:</span> {crash.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
