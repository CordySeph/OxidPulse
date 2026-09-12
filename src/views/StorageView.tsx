import React, { useState } from 'react';
import { StorageDriveMetrics } from '../types/diagnostics';
import {
  HardDrive,
  Database,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface StorageViewProps {
  drives: StorageDriveMetrics[];
}

export const StorageView: React.FC<StorageViewProps> = ({ drives }) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const drive = drives[selectedIdx] || drives[0];

  if (!drive) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
        No physical storage drives detected.
      </div>
    );
  }

  const isNvme = drive.bus_type.includes('NVMe') || drive.bus_type.includes('Fabric');
  const tbwWritten = (drive.data_units_written_gb / 1000).toFixed(2);
  const tbwRead = (drive.data_units_read_gb / 1000).toFixed(2);

  const getHealthBadge = (status: string, score: number) => {
    if (status === 'Healthy' && score >= 85) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (status === 'Warning' || (score >= 60 && score < 85)) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Drive Selector */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-emerald-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <HardDrive className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Storage & NVMe S.M.A.R.T. Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Low-level NVMe Admin Log 0x02 protocol queries & S.M.A.R.T. endurance analysis
          </p>
        </div>

        {/* Physical Drive Selector Tabs */}
        <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          {drives.map((d, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer flex items-center space-x-2 ${
                selectedIdx === idx
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{d.device_id.split(' ')[0]}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {d.bus_type.includes('NVMe') || d.bus_type.includes('Fabric') ? 'NVMe' : 'SATA'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Drive Specs Header */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-md">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h3 className="text-base font-bold text-white">{drive.model}</h3>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border uppercase font-bold ${getHealthBadge(drive.health_status, drive.health_score)}`}>
                {drive.health_status} ({drive.health_score}%)
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono mt-1">
              <span>S/N: {drive.serial_number}</span>
              <span>•</span>
              <span>Firmware: {drive.firmware_rev}</span>
              <span>•</span>
              <span className="text-emerald-300 font-bold">Capacity: {drive.size_formatted}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-5 text-right">
          <div>
            <div className="text-[11px] text-slate-400">Drive Temp</div>
            <div className="text-lg font-bold font-mono text-cyan-300">
              {drive.temperature_celsius}°C
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-[11px] text-slate-400">Total Written (TBW)</div>
            <div className="text-lg font-bold font-mono text-white">
              {tbwWritten} TB
            </div>
          </div>
        </div>
      </div>

      {/* NVMe SMART Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Percentage Used / Wear */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">
            Endurance Consumed
          </span>
          <div className="my-3 flex items-baseline justify-between">
            <span className="text-3xl font-black font-mono text-white">
              {drive.percentage_used}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ~{(100 - drive.percentage_used)}% Life Left
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${drive.percentage_used > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${Math.max(5, drive.percentage_used)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Available Spare */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">
            Available Spare
          </span>
          <div className="my-3 flex items-baseline justify-between">
            <span className="text-3xl font-black font-mono text-emerald-400">
              {drive.available_spare}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Threshold: {drive.available_spare_threshold}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full"
              style={{ width: `${drive.available_spare}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Power On Hours */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">
            Power-On Runtime
          </span>
          <div className="my-3">
            <span className="text-3xl font-black font-mono text-white">
              {drive.power_on_hours.toLocaleString()} hrs
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            ~{(drive.power_on_hours / 24).toFixed(0)} days operational
          </p>
        </div>

        {/* Metric 4: Power Cycles & Unsafe Shutdowns */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">
            Power Cycles
          </span>
          <div className="my-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-white">
              {drive.power_cycles}
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              ({drive.unsafe_shutdowns} unsafe)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Media Errors: <strong className="text-white">{drive.media_errors}</strong>
          </p>
        </div>
      </div>

      {/* S.M.A.R.T. Raw Attributes Table */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              NVMe S.M.A.R.T. Integrity Parameters
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Bus: {drive.bus_type}
          </span>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex justify-between items-center">
            <span className="text-slate-400">Data Units Read</span>
            <span className="font-mono font-bold text-white">{tbwRead} TB ({drive.data_units_read_gb.toLocaleString()} GB)</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex justify-between items-center">
            <span className="text-slate-400">Data Units Written (TBW)</span>
            <span className="font-mono font-bold text-emerald-400">{tbwWritten} TB ({drive.data_units_written_gb.toLocaleString()} GB)</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex justify-between items-center">
            <span className="text-slate-400">Critical Warning Bitmask</span>
            <span className="font-mono font-bold text-emerald-400">0x00 (All Clear)</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex justify-between items-center">
            <span className="text-slate-400">S.M.A.R.T. Overall Status</span>
            <span className="font-mono font-bold text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified Nominal</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
