import React from 'react';
import { RefreshCw, ShieldCheck, ShieldAlert, Cpu, HardDrive, CheckCircle2 } from 'lucide-react';
import { SystemSummary } from '../types/diagnostics';

interface HeaderProps {
  summary?: SystemSummary;
  overallScore?: number;
  statusLevel?: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  lastUpdated?: string;
}

export const Header: React.FC<HeaderProps> = ({
  summary,
  overallScore = 95,
  statusLevel = 'Excellent',
  isRefreshing,
  onRefresh,
  lastUpdated,
}) => {
  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/40';
    if (score >= 75) return 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/40';
    if (score >= 60) return 'from-amber-500/20 to-yellow-500/10 text-amber-400 border-amber-500/40';
    return 'from-rose-500/20 to-red-500/10 text-rose-400 border-rose-500/40';
  };

  return (
    <header className="h-16 px-6 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between z-10 select-none">
      {/* System Host / OS Info */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-mono font-medium flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>{summary?.hostname || 'WORKSTATION'}</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {summary?.os_name} {summary?.os_version}
          </span>
        </div>

        {summary?.is_admin ? (
          <div className="flex items-center space-x-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin IOCTL Privileges</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>User Mode (Limited)</span>
          </div>
        )}
      </div>

      {/* Right Controls: Score Badge + Refresh Action */}
      <div className="flex items-center space-x-4">
        {lastUpdated && (
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
            Updated: {lastUpdated.split(' ')[1] || lastUpdated}
          </span>
        )}

        <div className={`px-3 py-1 rounded-lg border bg-gradient-to-r ${getScoreBadgeColor(overallScore)} flex items-center space-x-2`}>
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Health</div>
          <div className="text-sm font-extrabold font-mono">{overallScore}%</div>
          <div className="text-[11px] font-semibold">({statusLevel})</div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 active:scale-95 text-slate-200 hover:text-white border border-slate-700 transition flex items-center space-x-1.5 text-xs font-medium cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{isRefreshing ? 'Polling...' : 'Refresh'}</span>
        </button>
      </div>
    </header>
  );
};
