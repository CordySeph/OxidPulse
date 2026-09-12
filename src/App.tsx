import React, { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  BatterySnapshot,
  CpuBenchmarkResult,
  CpuMetrics,
  CrashDumpInfo,
  DiskSpeedTestResult,
  GpuAiBenchmarkResult,
  LogicalVolumeInfo,
  MemoryMetrics,
  ProcessSnapshot,
  RamBenchmarkResult,
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
import { BenchmarkView } from './views/BenchmarkView';
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
  const [logicalVolumes, setLogicalVolumes] = useState<LogicalVolumeInfo[]>([]);
  const [cpu, setCpu] = useState<CpuMetrics>();
  const [memory, setMemory] = useState<MemoryMetrics>();
  const [processes, setProcesses] = useState<ProcessSnapshot[]>([]);
  const [thermals, setThermals] = useState<ThermalSensorMetrics>();
  const [crashDump, setCrashDump] = useState<CrashDumpInfo>();
  const [summary, setSummary] = useState<SystemSummary>();

  // Benchmark & Stress Test States
  const [isCpuBenchRunning, setIsCpuBenchRunning] = useState(false);
  const [cpuBenchResult, setCpuBenchResult] = useState<CpuBenchmarkResult>();

  const [isDiskBenchRunning, setIsDiskBenchRunning] = useState(false);
  const [diskBenchResult, setDiskBenchResult] = useState<DiskSpeedTestResult>();

  const [isRamBenchRunning, setIsRamBenchRunning] = useState(false);
  const [ramBenchResult, setRamBenchResult] = useState<RamBenchmarkResult>();

  const [isGpuAiBenchRunning, setIsGpuAiBenchRunning] = useState(false);
  const [gpuAiBenchResult, setGpuAiBenchResult] = useState<GpuAiBenchmarkResult>();

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
        volumesRes,
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
        invoke<LogicalVolumeInfo[]>('get_logical_volumes').catch(() => []),
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
      setLogicalVolumes(volumesRes);
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

  // Periodic fast refresh for live CPU, RAM & Thermal/GPU metrics
  useEffect(() => {
    fetchAllDiagnostics();

    const interval = setInterval(async () => {
      try {
        const [cpuRes, memoryRes, thermalRes] = await Promise.all([
          invoke<CpuMetrics>('get_cpu_metrics'),
          invoke<MemoryMetrics>('get_memory_metrics'),
          invoke<ThermalSensorMetrics>('get_thermal_metrics'),
        ]);
        setCpu(cpuRes);
        setMemory(memoryRes);
        setThermals(thermalRes);
      } catch (err) {
        console.error('Fast telemetry polling error:', err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [fetchAllDiagnostics]);

  // Handler for CPU Benchmark
  const handleRunCpuBench = async () => {
    try {
      setIsCpuBenchRunning(true);
      const res = await invoke<CpuBenchmarkResult>('run_cpu_benchmark');
      setCpuBenchResult(res);
      fetchAllDiagnostics();
    } catch (err) {
      console.error('CPU benchmark failure:', err);
    } finally {
      setIsCpuBenchRunning(false);
    }
  };

  // Handler for Storage Disk Speed Test
  const handleRunDiskBench = async (drivePath: string, testSizeMb: number) => {
    try {
      setIsDiskBenchRunning(true);
      const res = await invoke<DiskSpeedTestResult>('run_disk_speed_test', {
        drivePath,
        testSizeMb,
      });
      setDiskBenchResult(res);
      fetchAllDiagnostics();
    } catch (err) {
      console.error('Disk benchmark failure:', err);
    } finally {
      setIsDiskBenchRunning(false);
    }
  };

  // Handler for RAM Benchmark
  const handleRunRamBench = async () => {
    try {
      setIsRamBenchRunning(true);
      const res = await invoke<RamBenchmarkResult>('run_ram_benchmark');
      setRamBenchResult(res);
      fetchAllDiagnostics();
    } catch (err) {
      console.error('RAM benchmark failure:', err);
    } finally {
      setIsRamBenchRunning(false);
    }
  };

  // Handler for GPU AI & Neural Inference Benchmark
  const handleRunGpuAiBench = async (durationSecs: number = 5) => {
    try {
      setIsGpuAiBenchRunning(true);
      const res = await invoke<GpuAiBenchmarkResult>('run_gpu_ai_benchmark', {
        durationSecs,
      });
      setGpuAiBenchResult(res);
      fetchAllDiagnostics();
    } catch (err) {
      console.error('GPU AI benchmark failure:', err);
    } finally {
      setIsGpuAiBenchRunning(false);
    }
  };

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
                  <BenchmarkView
                    storageDrives={storage}
                    logicalVolumes={logicalVolumes}
                    isCpuBenchRunning={isCpuBenchRunning}
                    cpuResult={cpuBenchResult}
                    onRunCpuBench={handleRunCpuBench}
                    isDiskBenchRunning={isDiskBenchRunning}
                    diskResult={diskBenchResult}
                    onRunDiskBench={handleRunDiskBench}
                    isRamBenchRunning={isRamBenchRunning}
                    ramResult={ramBenchResult}
                    onRunRamBench={handleRunRamBench}
                    isGpuAiBenchRunning={isGpuAiBenchRunning}
                    gpuAiResult={gpuAiBenchResult}
                    onRunGpuAiBench={handleRunGpuAiBench}
                    isStressRunning={isStressRunning}
                    stressResult={stressResult}
                    onRunStress={handleRunStress}
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
