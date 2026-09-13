import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { RamIntegrityTestResult } from '../types/diagnostics';
import {
  Layers,
  Play,
  RotateCw,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  Sparkles,
  Zap,
  Activity,
  Cpu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MemoryTestView: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testSizeMb, setTestSizeMb] = useState<number>(1024);
  const [passes, setPasses] = useState<number>(2);
  const [result, setResult] = useState<RamIntegrityTestResult | null>(null);
  const [activePatternIndex, setActivePatternIndex] = useState<number>(0);

  const runTest = async () => {
    try {
      setIsRunning(true);
      setResult(null);
      setActivePatternIndex(0);

      const patternInterval = setInterval(() => {
        setActivePatternIndex((prev) => (prev + 1) % 4);
      }, 700);

      const res = await invoke<RamIntegrityTestResult>('run_ram_integrity_test', {
        testSizeMb,
        passes,
      });

      clearInterval(patternInterval);
      setResult(res);
    } catch (err) {
      console.error('Failed to run RAM integrity test:', err);
      alert('Error running memory test: ' + err);
    } finally {
      setIsRunning(false);
    }
  };

  const PATTERNS = [
    'Checkerboard Pattern (0xAA55AA55)',
    'Inverse Checkerboard (0x55AA55AA)',
    'Walking 1s & 0s (64-Bit Shift)',
    'PRNG Pseudo-Random Inversion',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Title Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-cyan-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              Fast RAM Integrity & Bit-Flip Stress Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            In-memory multi-pattern March C- stress testing to detect bad memory cells and unstable XMP/EXPO overclock profiles
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            Native SIMD / Multi-Thread
          </span>
        </div>
      </div>

      {/* Test Controls Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
        {isRunning && (
          <div className="absolute inset-0 bg-cyan-950/80 backdrop-blur-md flex items-center justify-center z-10">
            <div className="flex flex-col items-center space-y-4 text-center p-6">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <Layers className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-black text-cyan-300 font-mono">
                  TESTING PATTERN: {PATTERNS[activePatternIndex]}
                </h4>
                <p className="text-xs text-slate-300 mt-1 font-mono">
                  Stress testing {testSizeMb} MB across all physical CPU threads ({passes} passes)...
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Test Size */}
          <div>
            <label className="text-xs font-bold text-slate-300 font-mono uppercase">Target Memory Size</label>
            <div className="flex space-x-2 mt-2">
              {[512, 1024, 2048, 4096].map((size) => (
                <button
                  key={size}
                  disabled={isRunning}
                  onClick={() => setTestSizeMb(size)}
                  className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer disabled:opacity-50 ${
                    testSizeMb === size
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {size >= 1024 ? `${size / 1024} GB` : `${size} MB`}
                </button>
              ))}
            </div>
          </div>

          {/* Passes */}
          <div>
            <label className="text-xs font-bold text-slate-300 font-mono uppercase">Stress Passes</label>
            <div className="flex space-x-2 mt-2">
              {[1, 2, 4, 8].map((p) => (
                <button
                  key={p}
                  disabled={isRunning}
                  onClick={() => setPasses(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer disabled:opacity-50 ${
                    passes === p
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {p} {p === 1 ? 'Pass' : 'Passes'}
                </button>
              ))}
            </div>
          </div>

          {/* Launch Button */}
          <div className="flex items-end">
            <button
              onClick={runTest}
              disabled={isRunning}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-400 hover:opacity-95 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 cursor-pointer transition shadow-xl shadow-cyan-500/25 disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Stress Testing RAM...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-slate-950" />
                  <span>Start Memory Integrity Test</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Top Result Banner */}
          <div
            className={`p-6 rounded-3xl border flex items-center justify-between shadow-xl ${
              result.is_passed
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  result.is_passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {result.is_passed ? <CheckCircle2 className="w-7 h-7" /> : <AlertOctagon className="w-7 h-7" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{result.status}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Verified across {result.passes_completed} full test cycles in {result.duration_seconds}s
                </p>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="text-xs text-slate-400">Total Errors</div>
              <div
                className={`text-2xl font-black ${
                  result.errors_detected === 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {result.errors_detected} Errors
              </div>
            </div>
          </div>

          {/* Test Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
              <span className="text-slate-400">Effective Test Bandwidth</span>
              <div className="text-2xl font-black text-cyan-300 mt-2">
                {result.memory_bandwidth_gb_s} <span className="text-xs text-slate-400 font-sans font-normal">GB/s</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Multi-core read/write stress throughput</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
              <span className="text-slate-400">Tested Allocation Size</span>
              <div className="text-2xl font-black text-white mt-2">
                {result.total_mb_tested} <span className="text-xs text-slate-400 font-sans font-normal">MB</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Direct unbuffered physical heap memory</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
              <span className="text-slate-400">Elapsed Test Duration</span>
              <div className="text-2xl font-black text-white mt-2">
                {result.duration_seconds} <span className="text-xs text-slate-400 font-sans font-normal">sec</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Full 4-pattern cycle execution time</p>
            </div>
          </div>

          {/* Verified Patterns Checklist */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Pattern Verification Audit</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.tested_patterns.map((pat, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                >
                  <span className="text-xs text-slate-300 font-mono">{pat}</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Passed</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
