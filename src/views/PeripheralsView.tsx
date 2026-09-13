import React, { useState, useEffect, useRef } from 'react';
import {
  Monitor,
  Keyboard,
  MousePointer,
  Mic,
  Volume2,
  Maximize,
  Minimize,
  RotateCcw,
  Play,
  Square,
  CheckCircle2,
  Sparkles,
  VolumeX,
  Radio,
  Sliders,
  Activity,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type PeripheralSubTab = 'display' | 'keyboard' | 'mouse' | 'audio';

const DISPLAY_COLORS = [
  { name: 'Pure Red', hex: '#FF0000', text: 'white' },
  { name: 'Pure Green', hex: '#00FF00', text: 'black' },
  { name: 'Pure Blue', hex: '#0000FF', text: 'white' },
  { name: 'Pure White', hex: '#FFFFFF', text: 'black' },
  { name: 'Pure Black', hex: '#000000', text: 'white' },
  { name: 'Cyan', hex: '#00FFFF', text: 'black' },
  { name: 'Magenta', hex: '#FF00FF', text: 'white' },
  { name: 'Yellow', hex: '#FFFF00', text: 'black' },
];

export const PeripheralsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PeripheralSubTab>('display');

  // --- Display Checker State ---
  const [colorIdx, setColorIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displayPattern, setDisplayPattern] = useState<'solid' | 'checker' | 'stripes' | 'gradient'>('solid');

  // --- Keyboard Tester State ---
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [testedKeys, setTestedKeys] = useState<Set<string>>(new Set());
  const [lastKey, setLastKey] = useState<string>('None');
  const [maxRollover, setMaxRollover] = useState<number>(0);

  // --- Mouse Tester State ---
  const [pollingRates, setPollingRates] = useState<number[]>([]);
  const [currentHz, setCurrentHz] = useState<number>(0);
  const [peakHz, setPeakHz] = useState<number>(0);
  const [avgHz, setAvgHz] = useState<number>(0);
  const [cpsClicks, setCpsClicks] = useState<number>(0);
  const [cpsActive, setCpsActive] = useState<boolean>(false);
  const [cpsTimeLeft, setCpsTimeLeft] = useState<number>(5);
  const [cpsScore, setCpsScore] = useState<number | null>(null);
  const [scrollDelta, setScrollDelta] = useState<number>(0);
  const [mouseButtons, setMouseButtons] = useState<{ left: boolean; middle: boolean; right: boolean }>({
    left: false,
    middle: false,
    right: false,
  });

  // --- Audio & Mic State ---
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [playingChannel, setPlayingChannel] = useState<'left' | 'right' | 'both' | 'sweep' | null>(null);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micAnimRef = useRef<number | null>(null);
  const micCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const toneOscRef = useRef<OscillatorNode | null>(null);

  // Keyboard Global Event Listeners
  useEffect(() => {
    if (activeTab !== 'keyboard') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      const code = e.code;
      setLastKey(e.key + ` (${code})`);
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.add(code);
        if (next.size > maxRollover) setMaxRollover(next.size);
        return next;
      });
      setTestedKeys((prev) => {
        const next = new Set(prev);
        next.add(code);
        return next;
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      const code = e.code;
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(code);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeTab, maxRollover]);

  // Mouse Polling Rate Tracker
  const lastMouseTime = useRef<number>(0);
  const handleMouseMove = (e: React.MouseEvent) => {
    const now = performance.now();
    if (lastMouseTime.current > 0) {
      const delta = now - lastMouseTime.current;
      if (delta > 0 && delta < 50) {
        const hz = Math.round(1000 / delta);
        if (hz > 40 && hz < 10000) {
          setCurrentHz(hz);
          setPeakHz((p) => Math.max(p, hz));
          setPollingRates((prev) => {
            const next = [...prev.slice(-30), hz];
            const avg = Math.round(next.reduce((a, b) => a + b, 0) / next.length);
            setAvgHz(avg);
            return next;
          });
        }
      }
    }
    lastMouseTime.current = now;
  };

  // CPS Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (cpsActive && cpsTimeLeft > 0) {
      interval = setInterval(() => {
        setCpsTimeLeft((t) => t - 1);
      }, 1000);
    } else if (cpsTimeLeft === 0 && cpsActive) {
      setCpsActive(false);
      setCpsScore(Math.round((cpsClicks / 5) * 10) / 10);
    }
    return () => clearInterval(interval);
  }, [cpsActive, cpsTimeLeft, cpsClicks]);

  const handleCpsClick = () => {
    if (!cpsActive && cpsTimeLeft === 5) {
      setCpsActive(true);
      setCpsClicks(1);
    } else if (cpsActive) {
      setCpsClicks((c) => c + 1);
    }
  };

  const resetCps = () => {
    setCpsActive(false);
    setCpsTimeLeft(5);
    setCpsClicks(0);
    setCpsScore(null);
  };

  // Web Audio Tone Player
  const playTone = (channel: 'left' | 'right' | 'both') => {
    stopTone();
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioCtx(ctx);

    const osc = ctx.createOscillator();
    const panner = ctx.createStereoPanner();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);

    if (channel === 'left') panner.pan.setValueAtTime(-1, ctx.currentTime);
    else if (channel === 'right') panner.pan.setValueAtTime(1, ctx.currentTime);
    else panner.pan.setValueAtTime(0, ctx.currentTime);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);

    osc.connect(panner);
    panner.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    toneOscRef.current = osc;
    setPlayingChannel(channel);
  };

  const stopTone = () => {
    if (toneOscRef.current) {
      try {
        toneOscRef.current.stop();
        toneOscRef.current.disconnect();
      } catch (_) {}
      toneOscRef.current = null;
    }
    if (audioCtx) {
      try {
        audioCtx.close();
      } catch (_) {}
      setAudioCtx(null);
    }
    setPlayingChannel(null);
  };

  // Microphone Live Input Visualizer
  const toggleMic = async () => {
    if (micActive) {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      if (micAnimRef.current) cancelAnimationFrame(micAnimRef.current);
      setMicActive(false);
      setMicVolume(0);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setMicActive(true);

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const avg = sum / bufferLength;
        setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));

        const canvas = micCanvasRef.current;
        if (canvas) {
          const cCtx = canvas.getContext('2d');
          if (cCtx) {
            cCtx.clearRect(0, 0, canvas.width, canvas.height);
            const barWidth = (canvas.width / bufferLength) * 2;
            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
              const barHeight = (dataArray[i] / 255) * canvas.height;
              cCtx.fillStyle = `rgb(${dataArray[i] + 50}, 210, 180)`;
              cCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
              x += barWidth + 1;
            }
          }
        }
        micAnimRef.current = requestAnimationFrame(draw);
      };
      draw();
    } catch (err) {
      alert('Could not access microphone: ' + err);
    }
  };

  useEffect(() => {
    return () => {
      stopTone();
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach((t) => t.stop());
      if (micAnimRef.current) cancelAnimationFrame(micAnimRef.current);
    };
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Title Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <Monitor className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Hardware Peripherals & Display Suite</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Zero-latency screen dead-pixel detection, keyboard matrix rollover, mouse polling rate & audio loopback
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('display')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 cursor-pointer transition ${
              activeTab === 'display'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Display Test</span>
          </button>

          <button
            onClick={() => setActiveTab('keyboard')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 cursor-pointer transition ${
              activeTab === 'keyboard'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Keyboard Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('mouse')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 cursor-pointer transition ${
              activeTab === 'mouse'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Mouse & Polling</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 cursor-pointer transition ${
              activeTab === 'audio'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Audio & Mic</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: DISPLAY & DEAD PIXEL CHECKER --- */}
      {activeTab === 'display' && (
        <div className="space-y-6">
          {/* Fullscreen Modal View */}
          {isFullscreen && (
            <div
              onClick={() => setColorIdx((c) => (c + 1) % DISPLAY_COLORS.length)}
              className="fixed inset-0 z-50 cursor-pointer flex flex-col justify-between p-8 select-none"
              style={{
                backgroundColor: DISPLAY_COLORS[colorIdx].hex,
                backgroundImage:
                  displayPattern === 'checker'
                    ? 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%)'
                    : displayPattern === 'stripes'
                    ? 'repeating-linear-gradient(45deg, #222, #222 10px, #444 10px, #444 20px)'
                    : undefined,
                backgroundSize: displayPattern === 'checker' ? '30px 30px' : undefined,
              }}
            >
              <div className="flex justify-between items-center opacity-80 hover:opacity-100 transition">
                <span
                  className="px-3 py-1.5 rounded-xl bg-black/60 text-white font-mono text-xs backdrop-blur-md"
                >
                  Color {colorIdx + 1}/{DISPLAY_COLORS.length}: {DISPLAY_COLORS[colorIdx].name} (Click screen to cycle)
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFullscreen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-black/80 text-white text-xs font-mono font-bold hover:bg-black transition cursor-pointer flex items-center space-x-1.5"
                >
                  <Minimize className="w-4 h-4" />
                  <span>Exit Test (Esc)</span>
                </button>
              </div>
              <div className="text-center opacity-40 hover:opacity-100 transition">
                <p className="text-xs font-mono px-4 py-2 rounded-xl bg-black/60 text-white inline-block">
                  Inspect screen carefully for stuck colored subpixels or dark dead spots.
                </p>
              </div>
            </div>
          )}

          <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Dead / Stuck Pixel & Screen Uniformity Inspector</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                    Fullscreen 8-Phase RGBW
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Cycles pure solid colors and pattern grids to expose stuck transistors, IPS glow, and backlight bleeding.
                </p>
              </div>

              <button
                onClick={() => setIsFullscreen(true)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 hover:opacity-95 active:scale-95 text-white font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer transition shadow-xl shadow-indigo-500/25"
              >
                <Maximize className="w-4 h-4" />
                <span>Launch Fullscreen Test</span>
              </button>
            </div>

            {/* Color Palette Grid Preview */}
            <div className="space-y-3">
              <label className="text-xs font-bold font-mono text-slate-300 uppercase">Test Colors Preview</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {DISPLAY_COLORS.map((col, idx) => (
                  <button
                    key={col.name}
                    onClick={() => {
                      setColorIdx(idx);
                      setIsFullscreen(true);
                    }}
                    className="h-20 rounded-2xl border border-slate-700 p-2 flex flex-col justify-end text-left transition hover:scale-105 cursor-pointer shadow-md"
                    style={{ backgroundColor: col.hex }}
                  >
                    <span
                      className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/60 text-white`}
                    >
                      {col.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern Selectors */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400 font-mono">Screen Pattern Mode:</span>
              <div className="flex space-x-2">
                {(['solid', 'checker', 'stripes'] as const).map((pat) => (
                  <button
                    key={pat}
                    onClick={() => setDisplayPattern(pat)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono capitalize transition cursor-pointer ${
                      displayPattern === pat
                        ? 'bg-indigo-500 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pat} Pattern
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: KEYBOARD MATRIX TESTER --- */}
      {activeTab === 'keyboard' && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Interactive Keyboard Matrix & Anti-Ghosting Tester</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                    N-Key Rollover
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Press any keys on your physical keyboard to test key bounce, stuck keys, and simultaneous key rollover.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right font-mono text-xs">
                  <span className="text-slate-400">Peak Rollover: </span>
                  <strong className="text-emerald-400 text-sm">{maxRollover} Keys</strong>
                </div>
                <button
                  onClick={() => {
                    setTestedKeys(new Set());
                    setPressedKeys(new Set());
                    setMaxRollover(0);
                    setLastKey('None');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Matrix</span>
                </button>
              </div>
            </div>

            {/* Active Matrix Stats Header */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Last Key Pressed</span>
                <div className="text-base font-bold text-cyan-300 mt-1 truncate">{lastKey}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Currently Held Down</span>
                <div className="text-base font-bold text-emerald-400 mt-1">{pressedKeys.size} keys active</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Total Unique Keys Verified</span>
                <div className="text-base font-bold text-purple-300 mt-1">{testedKeys.size} verified</div>
              </div>
            </div>

            {/* Visual ANSI Keyboard Matrix Layout */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 overflow-x-auto">
              <div className="min-w-[700px] space-y-1.5 font-mono text-[11px] font-bold select-none">
                {/* Row 1: Function Keys */}
                <div className="flex space-x-1">
                  {['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'].map((k) => {
                    const isDown = pressedKeys.has(k);
                    const isTested = testedKeys.has(k);
                    return (
                      <div
                        key={k}
                        className={`px-2.5 py-1.5 rounded-lg border transition-all duration-75 text-center flex-1 ${
                          isDown
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-95 shadow-lg shadow-emerald-500/30'
                            : isTested
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/60'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {k}
                      </div>
                    );
                  })}
                </div>

                {/* Row 2: Number Row */}
                <div className="flex space-x-1">
                  {[
                    ['Backquote', '`'],
                    ['Digit1', '1'],
                    ['Digit2', '2'],
                    ['Digit3', '3'],
                    ['Digit4', '4'],
                    ['Digit5', '5'],
                    ['Digit6', '6'],
                    ['Digit7', '7'],
                    ['Digit8', '8'],
                    ['Digit9', '9'],
                    ['Digit0', '0'],
                    ['Minus', '-'],
                    ['Equal', '='],
                    ['Backspace', 'Backspace'],
                  ].map(([code, label]) => {
                    const isDown = pressedKeys.has(code);
                    const isTested = testedKeys.has(code);
                    return (
                      <div
                        key={code}
                        className={`py-2 px-2 rounded-lg border transition-all duration-75 text-center ${
                          code === 'Backspace' ? 'w-24' : 'flex-1'
                        } ${
                          isDown
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-95 shadow-lg shadow-emerald-500/30'
                            : isTested
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/60'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>

                {/* Row 3: QWERTY */}
                <div className="flex space-x-1">
                  {[
                    ['Tab', 'Tab', 'w-16'],
                    ['KeyQ', 'Q', 'flex-1'],
                    ['KeyW', 'W', 'flex-1'],
                    ['KeyE', 'E', 'flex-1'],
                    ['KeyR', 'R', 'flex-1'],
                    ['KeyT', 'T', 'flex-1'],
                    ['KeyY', 'Y', 'flex-1'],
                    ['KeyU', 'U', 'flex-1'],
                    ['KeyI', 'I', 'flex-1'],
                    ['KeyO', 'O', 'flex-1'],
                    ['KeyP', 'P', 'flex-1'],
                    ['BracketLeft', '[', 'flex-1'],
                    ['BracketRight', ']', 'flex-1'],
                    ['Backslash', '\\', 'flex-1'],
                  ].map(([code, label, width]) => {
                    const isDown = pressedKeys.has(code);
                    const isTested = testedKeys.has(code);
                    return (
                      <div
                        key={code}
                        className={`py-2 px-2 rounded-lg border transition-all duration-75 text-center ${width} ${
                          isDown
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-95 shadow-lg shadow-emerald-500/30'
                            : isTested
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/60'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>

                {/* Row 4: ASDF */}
                <div className="flex space-x-1">
                  {[
                    ['CapsLock', 'Caps', 'w-20'],
                    ['KeyA', 'A', 'flex-1'],
                    ['KeyS', 'S', 'flex-1'],
                    ['KeyD', 'D', 'flex-1'],
                    ['KeyF', 'F', 'flex-1'],
                    ['KeyG', 'G', 'flex-1'],
                    ['KeyH', 'H', 'flex-1'],
                    ['KeyJ', 'J', 'flex-1'],
                    ['KeyK', 'K', 'flex-1'],
                    ['KeyL', 'L', 'flex-1'],
                    ['Semicolon', ';', 'flex-1'],
                    ['Quote', "'", 'flex-1'],
                    ['Enter', 'Enter', 'w-24'],
                  ].map(([code, label, width]) => {
                    const isDown = pressedKeys.has(code);
                    const isTested = testedKeys.has(code);
                    return (
                      <div
                        key={code}
                        className={`py-2 px-2 rounded-lg border transition-all duration-75 text-center ${width} ${
                          isDown
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-95 shadow-lg shadow-emerald-500/30'
                            : isTested
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/60'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>

                {/* Row 5: ZXCV */}
                <div className="flex space-x-1">
                  {[
                    ['ShiftLeft', 'Shift', 'w-24'],
                    ['KeyZ', 'Z', 'flex-1'],
                    ['KeyX', 'X', 'flex-1'],
                    ['KeyC', 'C', 'flex-1'],
                    ['KeyV', 'V', 'flex-1'],
                    ['KeyB', 'B', 'flex-1'],
                    ['KeyN', 'N', 'flex-1'],
                    ['KeyM', 'M', 'flex-1'],
                    ['Comma', ',', 'flex-1'],
                    ['Period', '.', 'flex-1'],
                    ['Slash', '/', 'flex-1'],
                    ['ShiftRight', 'Shift', 'w-28'],
                  ].map(([code, label, width]) => {
                    const isDown = pressedKeys.has(code);
                    const isTested = testedKeys.has(code);
                    return (
                      <div
                        key={code}
                        className={`py-2 px-2 rounded-lg border transition-all duration-75 text-center ${width} ${
                          isDown
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-95 shadow-lg shadow-emerald-500/30'
                            : isTested
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/60'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>

                {/* Row 6: Space Row */}
                <div className="flex space-x-1">
                  {[
                    ['ControlLeft', 'Ctrl', 'w-16'],
                    ['MetaLeft', 'Win', 'w-14'],
                    ['AltLeft', 'Alt', 'w-14'],
                    ['Space', 'Spacebar', 'flex-1'],
                    ['AltRight', 'Alt', 'w-14'],
                    ['ControlRight', 'Ctrl', 'w-16'],
                  ].map(([code, label, width]) => {
                    const isDown = pressedKeys.has(code);
                    const isTested = testedKeys.has(code);
                    return (
                      <div
                        key={code}
                        className={`py-2 px-2 rounded-lg border transition-all duration-75 text-center ${width} ${
                          isDown
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-95 shadow-lg shadow-emerald-500/30'
                            : isTested
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/60'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: MOUSE & POLLING RATE TESTER --- */}
      {activeTab === 'mouse' && (
        <div className="space-y-6" onMouseMove={handleMouseMove}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box 1: Mouse Polling Rate Sensor */}
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Mouse Polling Rate (Hz) Tracker</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                    High-Precision
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Move your mouse rapidly within this window to sample USB report rate.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono text-center">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Current Hz</div>
                  <div className="text-2xl font-black text-cyan-300 mt-1">{currentHz} Hz</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Average Hz</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">{avgHz} Hz</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Peak Hz</div>
                  <div className="text-2xl font-black text-purple-400 mt-1">{peakHz} Hz</div>
                </div>
              </div>

              {/* Interactive Movement Canvas Pad */}
              <div
                onMouseMove={handleMouseMove}
                className="h-32 rounded-2xl border border-dashed border-cyan-500/40 bg-cyan-950/20 flex flex-col items-center justify-center text-center p-4 cursor-crosshair select-none"
              >
                <MousePointer className="w-8 h-8 text-cyan-400 animate-bounce" />
                <span className="text-xs font-mono font-bold text-cyan-200 mt-2">
                  SWIRL MOUSE HERE TO TEST REPORT RATE
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Standard USB: 125Hz / 500Hz / 1000Hz / 4000Hz / 8000Hz
                </span>
              </div>
            </div>

            {/* Box 2: Clicks Per Second (CPS) & Button Tester */}
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Clicks Per Second (CPS) & Buttons Test</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Test click speed in a 5-second sprint or verify left, middle, right click switches.
                </p>
              </div>

              <div
                onClick={handleCpsClick}
                onMouseDown={(e) => {
                  if (e.button === 0) setMouseButtons((b) => ({ ...b, left: true }));
                  if (e.button === 1) setMouseButtons((b) => ({ ...b, middle: true }));
                  if (e.button === 2) setMouseButtons((b) => ({ ...b, right: true }));
                }}
                onMouseUp={(e) => {
                  if (e.button === 0) setMouseButtons((b) => ({ ...b, left: false }));
                  if (e.button === 1) setMouseButtons((b) => ({ ...b, middle: false }));
                  if (e.button === 2) setMouseButtons((b) => ({ ...b, right: false }));
                }}
                onContextMenu={(e) => e.preventDefault()}
                onWheel={(e) => setScrollDelta((s) => s + e.deltaY)}
                className="h-36 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/40 flex flex-col items-center justify-center text-center cursor-pointer select-none active:scale-95 transition"
              >
                {cpsScore !== null ? (
                  <div>
                    <div className="text-xs font-mono text-emerald-400 font-bold uppercase">Final Score</div>
                    <div className="text-4xl font-black text-white font-mono mt-1">{cpsScore} CPS</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">Total {cpsClicks} clicks in 5s</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl font-black text-white font-mono">
                      {cpsActive ? `${cpsClicks} Clicks` : 'CLICK TO START'}
                    </div>
                    <div className="text-xs font-mono text-indigo-300 mt-1">
                      {cpsActive ? `Time Left: ${cpsTimeLeft}s` : '5-Second CPS Sprint Test'}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between font-mono text-xs">
                <div className="flex space-x-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg border ${
                      mouseButtons.left ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    L-Click
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg border ${
                      mouseButtons.middle ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    M-Click
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg border ${
                      mouseButtons.right ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    R-Click
                  </span>
                </div>

                <button
                  onClick={resetCps}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer font-bold"
                >
                  Reset CPS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: AUDIO STEREO & MIC LOOPBACK TESTER --- */}
      {activeTab === 'audio' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box 1: Stereo Channel Panner */}
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Stereo L / R Audio Channel Isolation</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Plays 440Hz reference tone to verify left/right speaker and headphone channel balance.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <button
                  onClick={() => playTone('left')}
                  className={`p-4 rounded-2xl border transition flex flex-col items-center justify-center space-y-2 cursor-pointer ${
                    playingChannel === 'left'
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-lg shadow-amber-500/25'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-500/50'
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                  <span>Left Channel</span>
                </button>

                <button
                  onClick={() => playTone('both')}
                  className={`p-4 rounded-2xl border transition flex flex-col items-center justify-center space-y-2 cursor-pointer ${
                    playingChannel === 'both'
                      ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-lg shadow-emerald-500/25'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-emerald-500/50'
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                  <span>Center / Both</span>
                </button>

                <button
                  onClick={() => playTone('right')}
                  className={`p-4 rounded-2xl border transition flex flex-col items-center justify-center space-y-2 cursor-pointer ${
                    playingChannel === 'right'
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-lg shadow-cyan-500/25'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-cyan-500/50'
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                  <span>Right Channel</span>
                </button>
              </div>

              {playingChannel && (
                <button
                  onClick={stopTone}
                  className="w-full py-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-xs font-mono font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <VolumeX className="w-4 h-4" />
                  <span>Stop Tone Output</span>
                </button>
              )}
            </div>

            {/* Box 2: Microphone Live Spectrum Visualizer */}
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Microphone Real-Time Input Meter</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                    Live FFT
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Measures microphone input signal, clarity, and frequency spectrum.
                </p>
              </div>

              {/* Live Spectrum Canvas */}
              <div className="h-28 rounded-2xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center overflow-hidden">
                {micActive ? (
                  <canvas ref={micCanvasRef} width={380} height={100} className="w-full h-full" />
                ) : (
                  <div className="text-center font-mono text-xs text-slate-500">
                    Microphone is currently idle. Click below to start recording loopback.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="font-mono text-xs">
                  <span className="text-slate-400">Input Level: </span>
                  <strong className="text-emerald-400">{micVolume}%</strong>
                </div>

                <button
                  onClick={toggleMic}
                  className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 transition cursor-pointer ${
                    micActive
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black shadow-lg shadow-emerald-500/25'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>{micActive ? 'Stop Microphone' : 'Start Mic Test'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
