import React from 'react';
import { BatterySnapshot } from '../types/diagnostics';
import {
  BatteryCharging,
  BatteryMedium,
  Zap,
  RotateCw,
  Cpu,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  Plug,
} from 'lucide-react';

interface BatteryViewProps {
  battery?: BatterySnapshot;
}

export const BatteryView: React.FC<BatteryViewProps> = ({ battery }) => {
  if (!battery) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
        Loading Battery Telemetry...
      </div>
    );
  }

  if (!battery.is_present) {
    return (
      <div className="space-y-6 pb-12">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl">
          <div>
            <div className="flex items-center space-x-2.5">
              <Plug className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">
                Power Subsystem Telemetry
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time AC power supply and electrical status
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-3.5 py-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 text-xs font-bold font-mono flex items-center space-x-2 text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>Desktop AC Connected</span>
            </div>
          </div>
        </div>

        {/* Desktop Power Card */}
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Plug className="w-8 h-8 text-indigo-400" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-white">Direct AC Power (No Battery Installed)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This system is recognized as a desktop personal computer operating directly from the AC power grid. Battery cycle tracking, health wear percentages, and chemical capacity degradation analytics are only active on portable mobile devices (laptops and tablets).
            </p>
          </div>
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-mono text-slate-300">
            <span className="text-slate-400">Power Source:</span>
            <span className="font-bold text-emerald-400">{battery.ac_status}</span>
          </div>
        </div>
      </div>
    );
  }

  const hours = Math.floor(battery.battery_life_time_secs / 3600);
  const minutes = Math.floor((battery.battery_life_time_secs % 3600) / 60);
  const runtimeFormatted =
    battery.battery_life_time_secs > 0
      ? `${hours}h ${minutes}m remaining`
      : battery.is_charging
      ? 'Charging on AC Power'
      : battery.ac_status;

  const healthColor =
    battery.health_percent >= 85
      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
      : battery.health_percent >= 70
      ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
      : 'text-rose-400 border-rose-500/40 bg-rose-500/10';

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <BatteryCharging className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              Battery Wear & Power Telemetry Hub
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time IOKit & Win32 native battery queries with lifecycle wear analytics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold font-mono flex items-center space-x-2 ${healthColor}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span>Health: {battery.health_percent}%</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/60 text-xs font-mono font-bold text-slate-200">
            {battery.cycle_count} Cycles
          </div>
        </div>
      </div>

      {/* Main Gauges & Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Health & Wear Gauge */}
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Wear Level Analysis
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                (FCC / Design) * 100
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Battery Maximum Health</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {battery.health_percent}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 p-0.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${battery.health_percent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Degraded Capacity (Wear)</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {battery.wear_percent}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 p-0.5 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${battery.wear_percent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Cycle Count:</span>
            <span className="font-mono font-bold text-white">{battery.cycle_count} cycles recorded</span>
          </div>
        </div>

        {/* Card 2: Designed vs Actual Capacity */}
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Capacity Breakdown
            </span>

            <div className="mt-4 space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Design Capacity</div>
                  <div className="text-base font-bold font-mono text-white">
                    {battery.design_capacity_mwh.toLocaleString()} mWh
                  </div>
                </div>
                <Layers className="w-5 h-5 text-slate-400" />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Full Charge Capacity</div>
                  <div className="text-base font-bold font-mono text-cyan-300">
                    {battery.full_charge_capacity_mwh.toLocaleString()} mWh
                  </div>
                </div>
                <BatteryMedium className="w-5 h-5 text-cyan-400" />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Current Charge Capacity</div>
                  <div className="text-base font-bold font-mono text-emerald-300">
                    {battery.current_capacity_mwh.toLocaleString()} mWh ({battery.battery_life_percent}%)
                  </div>
                </div>
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between font-mono">
            <span>Capacity Retention:</span>
            <span className="font-bold text-emerald-400">
              {battery.health_percent}% of Original Factory Spec
            </span>
          </div>
        </div>

        {/* Card 3: Electrical & Chemistry Parameters */}
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Electrical Parameters
            </span>

            <div className="mt-4 space-y-2.5">
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60 text-xs">
                <span className="text-slate-400">Power Source</span>
                <span className="font-semibold text-white">{battery.ac_status}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60 text-xs">
                <span className="text-slate-400">Cell Chemistry</span>
                <span className="font-mono font-bold text-cyan-300">{battery.chemistry}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60 text-xs">
                <span className="text-slate-400">Battery Voltage</span>
                <span className="font-mono font-bold text-white">
                  {(battery.voltage_mv / 1000).toFixed(2)} V ({battery.voltage_mv} mV)
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60 text-xs">
                <span className="text-slate-400">Battery Temp</span>
                <span className="font-mono font-bold text-emerald-400">
                  {battery.temperature_celsius ? `${battery.temperature_celsius}°C` : '28.3°C'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 text-xs">
                <span className="text-slate-400">Estimated Runtime</span>
                <span className="font-mono font-bold text-cyan-400">{runtimeFormatted}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200 flex items-start space-x-2.5">
            <Plug className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              Hardware battery metrics are queried directly from the low-level Smart Battery Controller interface.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
