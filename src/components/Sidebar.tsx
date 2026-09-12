import React from 'react';
import {
  LayoutDashboard,
  BatteryCharging,
  HardDrive,
  Cpu,
  Thermometer,
  Zap,
  AlertOctagon,
  FileText,
  Activity,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export type TabType =
  | 'overview'
  | 'battery'
  | 'storage'
  | 'cpu_ram'
  | 'thermals'
  | 'stress'
  | 'crash_logs'
  | 'report';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  healthScore?: number;
  warningsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  healthScore = 95,
  warningsCount,
}) => {
  const menuItems: {
    id: TabType;
    label: string;
    description: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    {
      id: 'overview',
      label: 'System Overview',
      description: 'Overall Health & Radar',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'battery',
      label: 'Battery & Power',
      description: 'Wear, Cycles & Watts',
      icon: <BatteryCharging className="w-4 h-4" />,
    },
    {
      id: 'storage',
      label: 'NVMe & Storage',
      description: 'SMART, TBW & Spare',
      icon: <HardDrive className="w-4 h-4" />,
    },
    {
      id: 'cpu_ram',
      label: 'CPU & Memory',
      description: 'Cores, Threads & RAM Matrix',
      icon: <Cpu className="w-4 h-4" />,
    },
    {
      id: 'thermals',
      label: 'Thermals & GPU',
      description: 'Hardware Sensors & GPU',
      icon: <Thermometer className="w-4 h-4" />,
    },
    {
      id: 'stress',
      label: 'Stress Benchmark',
      description: 'AVX FP & Throttling',
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: 'crash_logs',
      label: 'Stability & Integrity',
      description: 'Hardware vs OS Audit',
      icon: <AlertOctagon className="w-4 h-4" />,
      badge: warningsCount > 0 ? warningsCount : '0',
      badgeColor:
        warningsCount > 0
          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },
    {
      id: 'report',
      label: 'Diagnostic Audit',
      description: 'Printable Certificate',
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 75) return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <aside className="w-68 h-screen bg-slate-950/95 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col justify-between select-none shrink-0 z-20">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-amber-500 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
              <img src="/icon.png" alt="OxidPulse Logo" className="w-full h-full object-cover rounded-[10px]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-white font-sans">
                  OxidPulse
                </span>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Native
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Diagnostic Engine</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Telemetry Modules
          </div>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 via-teal-500/10 to-slate-900 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-900 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-semibold leading-tight">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-tight group-hover:text-slate-300">
                      {item.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Health Score Pill in Bottom Sidebar */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
        <div className="rounded-xl p-3 bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="text-xs font-bold text-white leading-tight">System Status</div>
              <div className="text-[10px] text-slate-400 font-mono">Hardware Healthy</div>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-xs ${getScoreColor(healthScore)}`}>
            {healthScore}%
          </div>
        </div>
      </div>
    </aside>
  );
};
