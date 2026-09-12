import React from 'react';
import { ThermalSensorMetrics } from '../types/diagnostics';
import {
  Thermometer,
  Flame,
  Fan,
  ShieldCheck,
  Zap,
  Activity,
  Cpu,
  Monitor,
  CheckCircle2,
  Wind,
  Layers,
} from 'lucide-react';

interface ThermalGpuViewProps {
  thermals?: ThermalSensorMetrics;
}

export const ThermalGpuView: React.FC<ThermalGpuViewProps> = ({ thermals }) => {
  if (!thermals) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
        Loading Thermal & Sensor Telemetry...
      </div>
    );
  }

  const gpu = thermals.gpu_devices[0];
  const maxFanRpm = Math.max(0, ...thermals.fan_speeds_rpm.map(([_, rpm]) => rpm), gpu?.fan_speed_rpm ?? 0);
  const hasActiveFans = maxFanRpm > 0;
  const coolingMethod = gpu?.fan_speed_rpm
    ? `${gpu.fan_speed_rpm} RPM (Active PWM)`
    : hasActiveFans
    ? 'Active Air Cooling (PWM)'
    : 'Fanless Passive Dissipation';
  const estDb = maxFanRpm === 0 ? 0 : Math.round(18 + (maxFanRpm / 2000) * 18);
  const acousticText = maxFanRpm === 0 ? '0 dBA (Silent Passive)' : `~${estDb} dBA (Low Acoustic Profile)`;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-rose-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <Thermometer className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-white">
              Thermals, GPU Sensors & Cooling Profile
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Low-level hardware telemetry via <code className="text-rose-300 font-mono text-[11px]">{thermals.driver_info}</code>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <ShieldCheck className="w-4 h-4" />
            <span>Live Stream (1.5s)</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700/60 text-xs font-mono text-slate-200">
            Peak Recorded: {thermals.max_temp_recorded}°C
          </div>
        </div>
      </div>

      {/* Main Thermals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CPU Package & Core Temperatures */}
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-rose-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                CPU SoC Die & Core Sensors
              </h3>
            </div>
            <span className="text-sm font-mono font-bold text-rose-400 transition-all duration-300">
              {thermals.cpu_package_temp.toFixed(1)}°C Package
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white">Thermal Throttling Headroom</div>
              <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                {(100 - thermals.cpu_package_temp).toFixed(1)}°C Safe Margin before 100°C Limit
              </div>
            </div>
            <div className="w-28 bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-teal-400 via-emerald-400 to-rose-400 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, thermals.cpu_package_temp)}%` }}
              />
            </div>
          </div>

          {/* Per Core Temp Grid */}
          <div>
            <div className="text-xs text-slate-400 font-mono mb-2.5">
              {thermals.cpu_core_temps.length} Core Thermal Breakdown
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {thermals.cpu_core_temps.map((temp, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center flex flex-col items-center justify-center transition-all duration-300"
                >
                  <span className="text-[9px] font-mono text-slate-400 font-bold">C#{idx + 1}</span>
                  <span className="text-xs font-black font-mono text-white mt-1 transition-all duration-300">{temp.toFixed(1)}°C</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GPU Telemetry */}
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                GPU Engine ({gpu?.vendor || 'DirectX'})
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 transition-all duration-300">
              {gpu ? `${gpu.temperature_celsius}°C` : 'N/A'}
            </span>
          </div>

          {gpu ? (
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-white">{gpu.name}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">Graphics API: {gpu.driver_version}</div>
                </div>
                <div className="text-right font-mono text-xs font-bold text-cyan-300">
                  {gpu.core_clock_mhz} MHz Clock
                </div>
              </div>

              {/* VRAM Allocation */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Video / Graphics Memory</span>
                  <span className="font-mono font-bold text-white">
                    {(gpu.memory_used_mb / 1024).toFixed(1)} / {(gpu.memory_total_mb / 1024).toFixed(0)} GB ({gpu.memory_usage_percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${gpu.memory_usage_percent}%` }}
                  />
                </div>
              </div>

              {/* Power Draw */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex justify-between items-center">
                  <span className="text-slate-400">Cooling Method</span>
                  <span className="font-mono font-bold text-white truncate max-w-[120px]">{coolingMethod}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex justify-between items-center">
                  <span className="text-slate-400">GPU Power Draw</span>
                  <span className="font-mono font-bold text-emerald-400">{gpu.power_usage_watts} W</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-950/40 text-center text-xs text-slate-400">
              No discrete GPU detected.
            </div>
          )}
        </div>
      </div>

      {/* Motherboard Thermal Zones & Fan Speeds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Thermal Zones */}
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-3.5 shadow-xl">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Chassis Thermal Zones
            </h3>
          </div>
          <div className="space-y-2.5">
            {thermals.thermal_zones.map(([name, temp], idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <span className="text-slate-300 font-medium">{name}</span>
                <span className="font-mono font-bold text-cyan-300 transition-all duration-300">{temp.toFixed(1)}°C</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fan Status */}
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-3.5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Wind className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Acoustic & Fan Profile
              </h3>
            </div>
            <div className="space-y-2.5 mt-3.5">
              {thermals.fan_speeds_rpm.map(([name, rpm], idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <span className="text-slate-300 font-medium">{name}</span>
                  <span className="font-mono font-bold text-emerald-400 transition-all duration-300">
                    {rpm === 0 ? '0 RPM (Silent)' : `${rpm} RPM`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono pt-3 border-t border-slate-800/60 flex items-center justify-between">
            <span>Acoustic Output:</span>
            <span className="text-emerald-400 font-bold">{acousticText}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
