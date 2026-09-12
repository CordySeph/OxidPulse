import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
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
  FileText,
  Download,
  Printer,
  Copy,
  CheckCircle2,
  FolderOpen,
  X,
  Check,
  Award,
  ExternalLink,
} from 'lucide-react';

interface ReportViewProps {
  report?: SystemHealthReport;
  battery?: BatterySnapshot;
  storage: StorageDriveMetrics[];
  cpu?: CpuMetrics;
  memory?: MemoryMetrics;
  thermals?: ThermalSensorMetrics;
  crashDump?: CrashDumpInfo;
  onExportJson?: () => Promise<string>;
}

export const ReportView: React.FC<ReportViewProps> = ({
  report,
  battery,
  storage,
  cpu,
  thermals,
  crashDump,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'json' | 'pdf';
    message: string;
    filePath: string;
  } | null>(null);

  const handleCopyJson = async () => {
    try {
      const jsonStr = await invoke<string>('export_full_report_json');
      await navigator.clipboard.writeText(jsonStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  const handleExportJsonNative = async () => {
    try {
      setIsExportingJson(true);
      const savedPath = await invoke<string>('save_json_report_file');
      setNotification({
        type: 'json',
        message: 'Comprehensive JSON Diagnostic Report saved successfully to your Downloads folder!',
        filePath: savedPath,
      });
    } catch (err) {
      console.error('Failed to export JSON:', err);
      alert('Failed to save JSON report: ' + String(err));
    } finally {
      setIsExportingJson(false);
    }
  };

  const handlePrintPdfNative = async () => {
    try {
      setIsExportingPdf(true);
      const savedPath = await invoke<string>('save_printable_report_html');
      setNotification({
        type: 'pdf',
        message: 'Printable Audit Certificate saved to Downloads and opened in your browser. Select "Save as PDF" in the browser print window!',
        filePath: savedPath,
      });
    } catch (err) {
      console.error('Failed to generate printable report:', err);
      alert('Failed to generate printable certificate: ' + String(err));
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleOpenFolder = async (path: string) => {
    try {
      await invoke('open_file_folder', { path });
    } catch (err) {
      console.error('Failed to open folder:', err);
    }
  };

  const summary = report?.summary;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-cyan-950/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              Hardware Diagnostic Audit & Certificate
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standardized technical diagnostic report for hardware verification, asset audits, and maintenance
          </p>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          <button
            onClick={handleCopyJson}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold flex items-center space-x-2 transition cursor-pointer border border-slate-700 shadow-md"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
          </button>

          <button
            onClick={handleExportJsonNative}
            disabled={isExportingJson}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:opacity-95 active:scale-95 text-white text-xs font-bold flex items-center space-x-2 transition cursor-pointer shadow-lg shadow-cyan-600/25 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingJson ? 'Saving JSON...' : 'Export JSON'}</span>
          </button>

          <button
            onClick={handlePrintPdfNative}
            disabled={isExportingPdf}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 active:scale-95 text-white text-xs font-bold flex items-center space-x-2 transition cursor-pointer shadow-lg shadow-emerald-600/25 disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>{isExportingPdf ? 'Generating PDF...' : 'Print / Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {notification && (
        <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-emerald-950/30 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white">{notification.message}</p>
              <p className="text-[11px] font-mono text-emerald-300/80 mt-1 break-all bg-slate-950/60 px-2 py-1 rounded border border-emerald-500/20">
                {notification.filePath}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => handleOpenFolder(notification.filePath)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-sm"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Reveal File</span>
            </button>

            <button
              onClick={() => setNotification(null)}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Printable Report Document Card */}
      <div className="p-8 md:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-8 text-slate-200 shadow-2xl">
        {/* Document Header */}
        <div className="flex justify-between items-start pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <Award className="w-6 h-6 text-cyan-400" />
              <h1 className="text-2xl font-black text-white tracking-tight">
                OxidPulse Diagnostic Audit Certificate
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1.5">
              Generated: {report?.generated_at} • Host: {summary?.hostname} • Engine: OxidPulse v2.0
            </p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-black font-mono text-cyan-400">
              {report?.overall_score || 96} / 100
            </div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide font-mono">
              Grade: {report?.status_level || 'Excellent'}
            </div>
          </div>
        </div>

        {/* Section 1: System Identification */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            1. System & Architecture Identity
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Operating System</span>
              <span className="font-bold text-white text-sm mt-0.5 block">{summary?.os_name} {summary?.os_version}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Kernel Core</span>
              <span className="font-mono text-slate-200 text-sm mt-0.5 block">{summary?.kernel_version}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">SoC Processor</span>
              <span className="font-bold text-white text-sm mt-0.5 block">{cpu?.model}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Unified Memory</span>
              <span className="font-mono text-cyan-300 font-bold text-sm mt-0.5 block">{summary?.total_memory_formatted}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Storage S.M.A.R.T. Audit */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            2. Storage & NVMe Health Assessment
          </h4>
          <div className="space-y-2.5">
            {storage.map((d, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-white text-sm">{d.model}</span>
                  <span className="text-slate-400 font-mono ml-2">({d.bus_type}, S/N: {d.serial_number})</span>
                </div>
                <div className="flex items-center space-x-4 font-mono text-xs">
                  <span>Capacity: <strong className="text-emerald-400">{d.size_formatted}</strong></span>
                  <span>Endurance Used: <strong className="text-white">{d.percentage_used}%</strong></span>
                  <span>Available Spare: <strong className="text-emerald-400">{d.available_spare}%</strong></span>
                  <span className="text-emerald-400 font-bold">{d.health_status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Battery & Power (if laptop) */}
        {battery?.is_present && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              3. Battery Capacity & Degradation
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Design Capacity</span>
                <span className="font-mono text-white font-bold text-sm mt-0.5 block">{battery.design_capacity_mwh.toLocaleString()} mWh</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Full Charge Capacity</span>
                <span className="font-mono text-cyan-300 font-bold text-sm mt-0.5 block">{battery.full_charge_capacity_mwh.toLocaleString()} mWh</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Maximum Health</span>
                <span className="font-mono text-emerald-400 font-bold text-sm mt-0.5 block">{battery.health_percent}% ({battery.wear_percent}% Wear)</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Cycle Count</span>
                <span className="font-mono text-white font-bold text-sm mt-0.5 block">{battery.cycle_count} Cycles</span>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Stability & Recommendations */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            4. Diagnostic Findings & Engineering Recommendations
          </h4>
          <div className="space-y-2.5">
            {report?.recommendations.map((rec, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-xs flex items-center space-x-3"
              >
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className="text-slate-300 leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
