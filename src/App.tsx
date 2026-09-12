import React, { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  BatterySnapshot,
  CpuMetrics,
  CrashDumpInfo,
  MemoryMetrics,
  ProcessSnapshot,
  StorageDriveMetrics,
  StressTestResult,
  SystemHealthReport,
  SystemSummary,
  ThermalSensorMetrics,
} from './types/diagnostics';
import { Sidebar, TabType } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './views/OverviewView';
import { BatteryView } from './views/BatteryView';
import { StorageView } from './views/StorageView';
import { CpuMemoryView } from './views/CpuMemoryView';
import { ThermalGpuView } from './views/ThermalGpuView';
import { StressTestView } from './views/StressTestView';
import { CrashDumpView } from './views/CrashDumpView';
import { ReportView } from './views/ReportView';

import { AnimatePresence, motion } from 'framer-motion';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Diagnostic Data States
  const [report, setReport] = useState<SystemHealthReport>();
  const [battery, setBattery] = useState<BatterySnapshot>();
  const [storage, setStorage] = useState<StorageDriveMetrics[]>([]);
  const [cpu, setCpu] = useState<CpuMetrics>();
  const [memory, setMemory] = useState<MemoryMetrics>();
  const [processes, setProcesses] = useState<ProcessSnapshot[]>([]);
  const [thermals, setThermals] = useState<ThermalSensorMetrics>();
  const [crashDump, setCrashDump] = useState<CrashDumpInfo>();
  const [summary, setSummary] = useState<SystemSummary>();

  // Stress Test States
  const [isStressRunning, setIsStressRunning] = useState(false);
  const [stressResult, setStressResult] = useState<StressTestResult>();

  // Fetch full system diagnostics
  const fetchAllDiagnostics = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [
        reportRes,
        batteryRes,
        storageRes,
        cpuRes,
        memoryRes,
        procRes,
        thermalRes,
        crashRes,
        summaryRes,
      ] = await Promise.all([
        invoke<SystemHealthReport>('get_overall_health_report'),
        invoke<BatterySnapshot>('get_battery_metrics').catch(() => undefined),
        invoke<StorageDriveMetrics[]>('get_storage_drives'),
        invoke<CpuMetrics>('get_cpu_metrics'),
        invoke<MemoryMetrics>('get_memory_metrics'),
        invoke<ProcessSnapshot[]>('get_top_processes', { limit: 12 }),
        invoke<ThermalSensorMetrics>('get_thermal_metrics'),
        invoke<CrashDumpInfo>('get_crash_dump_info'),
        invoke<SystemSummary>('get_system_summary'),
      ]);

      setReport(reportRes);
      if (batteryRes) setBattery(batteryRes);
      setStorage(storageRes);
      setCpu(cpuRes);
      setMemory(memoryRes);
      setProcesses(procRes);
      setThermals(thermalRes);
      setCrashDump(crashRes);
      setSummary(summaryRes);

      const now = new Date();
      setLastUpdated(now.toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load diagnostics from OxidPulse Rust core:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Periodic fast refresh for live CPU & RAM metrics
  useEffect(() => {
    fetchAllDiagnostics();

    const interval = setInterval(async () => {
      try {
        const [cpuRes, memoryRes] = await Promise.all([
          invoke<CpuMetrics>('get_cpu_metrics'),
          invoke<MemoryMetrics>('get_memory_metrics'),
        ]);
        setCpu(cpuRes);
        setMemory(memoryRes);
      } catch (err) {
        console.error('Fast polling error:', err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [fetchAllDiagnostics]);

  // Handler for Stress Benchmark
  const handleRunStress = async (durationSecs: number) => {
    try {
      setIsStressRunning(true);
      const res = await invoke<StressTestResult>('run_stress_test', {
        durationSecs,
      });
      setStressResult(res);
      fetchAllDiagnostics();
    } catch (err) {
      console.error('Stress test failure:', err);
    } finally {
      setIsStressRunning(false);
    }
  };

  // Handler for Exporting JSON
  const handleExportJson = async (): Promise<string> => {
    return await invoke<string>('export_full_report_json');
  };

  return (
    <div className="flex h-screen bg-[#060911] text-slate-100 font-sans overflow-hidden select-none">
      {/* Sleek Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        healthScore={report?.overall_score}
        warningsCount={report?.warnings.length || 0}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Bar */}
        <Header
          summary={summary}
          overallScore={report?.overall_score}
          statusLevel={report?.status_level}
          isRefreshing={isRefreshing}
          onRefresh={fetchAllDiagnostics}
          lastUpdated={lastUpdated}
        />

        {/* View Router with Fluid Transitions */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#060911]/90 relative">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ duration: 0.2, ease: 'easeOut' as const }}
              >
                {activeTab === 'overview' && (
                  <OverviewView
                    report={report}
                    battery={battery}
                    storage={storage}
                    cpu={cpu}
                    memory={memory}
                    thermals={thermals}
                    crashDump={crashDump}
                    onNavigate={setActiveTab}
                    onRunStress={() => {
                      setActiveTab('stress');
                    }}
                  />
                )}

                {activeTab === 'battery' && <BatteryView battery={battery} />}

                {activeTab === 'storage' && <StorageView drives={storage} />}

                {activeTab === 'cpu_ram' && (
                  <CpuMemoryView cpu={cpu} memory={memory} processes={processes} />
                )}

                {activeTab === 'thermals' && (
                  <ThermalGpuView thermals={thermals} />
                )}

                {activeTab === 'stress' && (
                  <StressTestView
                    isRunning={isStressRunning}
                    result={stressResult}
                    onRunTest={handleRunStress}
                  />
                )}

                {activeTab === 'crash_logs' && (
                  <CrashDumpView crashInfo={crashDump} />
                )}

                {activeTab === 'report' && (
                  <ReportView
                    report={report}
                    battery={battery}
                    storage={storage}
                    cpu={cpu}
                    memory={memory}
                    thermals={thermals}
                    crashDump={crashDump}
                    onExportJson={handleExportJson}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
