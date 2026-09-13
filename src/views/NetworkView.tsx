import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { NetworkDiagnosticsResult } from '../types/diagnostics';
import {
  Wifi,
  Globe,
  Activity,
  RotateCw,
  Zap,
  Gamepad2,
  Tv,
  CheckCircle2,
  ShieldCheck,
  Server,
  ArrowDownUp,
  Sparkles,
  Layers,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const NetworkView: React.FC = () => {
  const [data, setData] = useState<NetworkDiagnosticsResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pingHistory, setPingHistory] = useState<number[]>([]);

  const fetchNetwork = async () => {
    try {
      setIsLoading(true);
      const res = await invoke<NetworkDiagnosticsResult>('get_network_diagnostics');
      setData(res);
      setPingHistory((prev) => [...prev.slice(-30), res.ping_ms]);
    } catch (err) {
      console.error('Failed to get network diagnostics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNetwork();
  }, []);

  const getGradeBadge = (grade: string) => {
    if (grade.startsWith('A+')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20';
    if (grade.startsWith('A')) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-500/20';
    if (grade.startsWith('B')) return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/20';
    return 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/20';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Title Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-sky-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <Globe className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">
              Network Quality, DNS & Jitter Diagnostics
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ping latency, packet jitter deviation, multi-DNS speed ranking & esports connection grading
          </p>
        </div>

        <button
          onClick={fetchNetwork}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-sky-400 hover:opacity-95 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 cursor-pointer transition shadow-xl shadow-sky-500/25 disabled:opacity-50"
        >
          <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Testing Network...' : 'Retest Network Latency'}</span>
        </button>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Average Ping (RTT)</span>
          <div className="my-3 text-3xl font-black font-mono text-cyan-300">
            {data?.ping_ms ?? 0} <span className="text-xs text-slate-400 font-sans font-normal">ms</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Min: {data?.min_latency_ms ?? 0}ms | Max: {data?.max_latency_ms ?? 0}ms</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Packet Jitter</span>
          <div className="my-3 text-3xl font-black font-mono text-emerald-400">
            ±{data?.jitter_ms ?? 0} <span className="text-xs text-slate-400 font-sans font-normal">ms</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Deviation across probe cycles</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Packet Loss</span>
          <div className="my-3 text-3xl font-black font-mono text-white">
            {data?.packet_loss_pct ?? 0}%
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Zero drops across primary gateway</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Gaming & Esport Grade</span>
          <div className="my-3">
            <span className={`text-sm font-black font-mono px-2.5 py-1 rounded-xl border shadow-sm ${getGradeBadge(data?.gaming_grade || 'A+')}`}>
              {data?.gaming_grade.split(' ')[0] ?? 'A+'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono truncate">{data?.gaming_grade.substring(3) || 'Flawless Connection'}</p>
        </div>
      </div>

      {/* DNS Speed Leaderboard Table */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Server className="w-5 h-5 text-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Public DNS Speed Benchmark & Latency Leaderboard
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            Best: {data?.recommended_dns}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/40 text-slate-400 border-b border-slate-800/60 text-[11px]">
              <tr>
                <th className="py-3 px-5">Rank & Provider</th>
                <th className="py-3 px-5">IP Address</th>
                <th className="py-3 px-5 text-cyan-300">Round-Trip Latency</th>
                <th className="py-3 px-5 text-right">Performance Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-200">
              {data?.dns_results.map((dns, idx) => (
                <tr key={dns.ip} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-5 font-bold text-white flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300 font-mono">
                      #{idx + 1}
                    </span>
                    <span>{dns.provider}</span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-400">{dns.ip}</td>
                  <td className="py-3.5 px-5 font-black text-cyan-300 text-sm">{dns.latency_ms} ms</td>
                  <td className="py-3.5 px-5 text-right font-bold text-emerald-400">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {dns.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
