import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useProfile } from '../lib/ProfileContext';
import { motion, AnimatePresence } from 'motion/react';
import { Disc3, Play, Square, Upload, Circle, Settings2, Trash2, Layers, Download, Plus, Zap, Music2 } from '../lib/icons';
import { cn } from '../lib/utils';
import { useNavigate } from '../lib/router';

// 4x4 MPC Mapping
const KEY_MAP = [
  '1', '2', '3', '4',
  'q', 'w', 'e', 'r',
  'a', 's', 'd', 'f',
  'z', 'x', 'c', 'v'
];

// Vibrant pad color palette — each pad gets a unique gradient identity
const PAD_GRADIENTS = [
  'from-amber-500 to-orange-600',
  'from-violet-500 to-purple-700',
  'from-cyan-400 to-blue-600',
  'from-rose-500 to-pink-700',
  'from-emerald-400 to-teal-600',
  'from-yellow-400 to-amber-600',
  'from-indigo-500 to-blue-700',
  'from-fuchsia-500 to-pink-600',
  'from-lime-400 to-green-600',
  'from-red-500 to-rose-700',
  'from-sky-400 to-cyan-600',
  'from-orange-400 to-red-600',
  'from-teal-400 to-emerald-600',
  'from-purple-500 to-violet-700',
  'from-pink-400 to-fuchsia-600',
  'from-blue-400 to-indigo-600',
];

const PAD_GLOW_COLORS = [
  'rgba(245,158,11,0.6)', 'rgba(139,92,246,0.6)', 'rgba(34,211,238,0.6)', 'rgba(244,63,94,0.6)',
  'rgba(52,211,153,0.6)', 'rgba(250,204,21,0.6)', 'rgba(99,102,241,0.6)', 'rgba(217,70,239,0.6)',
  'rgba(163,230,53,0.6)', 'rgba(239,68,68,0.6)', 'rgba(56,189,248,0.6)', 'rgba(251,146,60,0.6)',
  'rgba(45,212,191,0.6)', 'rgba(168,85,247,0.6)', 'rgba(244,114,182,0.6)', 'rgba(96,165,250,0.6)',
];

interface PadState {
  id: number;
  buffer: AudioBuffer | null;
  name: string;
  isTriggered: boolean;
  volume: number;
}

export default function SamplerStudio() {
  const { tracks, uploadTrack } = useProfile();
  const navigate = useNavigate();

  const [pads, setPads] = useState<PadState[]>(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      buffer: null,
      name: 'Empty',
      isTriggered: false,
      volume: 1,
    }))
  );

  const [activePadId, setActivePadId] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [lastTriggered, setLastTriggered] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const destRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const ctx = new window.AudioContext();
      audioCtxRef.current = ctx;
      destRef.current = ctx.createMediaStreamDestination();
    }
  };

  const triggerPad = useCallback((padId: number) => {
    initAudio();
    const pad = pads[padId];
    if (!pad || !pad.buffer || !audioCtxRef.current || !destRef.current) {
      // Flash even empty pads for feedback
      setPads(prev => prev.map(p => p.id === padId ? { ...p, isTriggered: true } : p));
      setTimeout(() => setPads(prev => prev.map(p => p.id === padId ? { ...p, isTriggered: false } : p)), 80);
      return;
    }

    setLastTriggered(padId);
    setPads(prev => prev.map(p => p.id === padId ? { ...p, isTriggered: true } : p));
    setTimeout(() => setPads(prev => prev.map(p => p.id === padId ? { ...p, isTriggered: false } : p)), 120);

    const source = audioCtxRef.current.createBufferSource();
    source.buffer = pad.buffer;
    const gain = audioCtxRef.current.createGain();
    gain.gain.value = pad.volume;
    source.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    gain.connect(destRef.current);
    source.start(0);
  }, [pads]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      const key = e.key.toLowerCase();
      const padIndex = KEY_MAP.indexOf(key);
      if (padIndex !== -1 && !e.repeat) triggerPad(padIndex);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerPad]);

  const loadTrackToPad = async (track: typeof tracks[0]) => {
    if (activePadId === null) return;
    initAudio();
    if (!audioCtxRef.current || !track.fileUrl) return;
    try {
      const res = await fetch(track.fileUrl);
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);
      setPads(prev => prev.map(p => p.id === activePadId ? {
        ...p, buffer: audioBuffer, name: track.title,
      } : p));
      setActivePadId(null);
    } catch(e) { console.error("Could not load pad audio:", e); }
  };

  const clearPad = (padId: number) => {
    setPads(prev => prev.map(p => p.id === padId ? { ...p, buffer: null, name: 'Empty' } : p));
  };

  const toggleRecording = () => {
    initAudio();
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      if (!destRef.current) return;
      const mimeTypes = ['audio/webm', 'audio/webm;codecs=opus', 'audio/mp4'];
      const mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
      const recorder = new MediaRecorder(destRef.current.stream, { mimeType, audioBitsPerSecond: 256000 });
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) };
      recorder.onstop = () => setRecordedBlob(new Blob(chunksRef.current, { type: mimeType }));
      recorder.start();
      setIsRecording(true);
      mediaRecorderRef.current = recorder;
    }
  };

  const saveToVault = async () => {
    if (!recordedBlob) return;
    try {
      const title = `Beat Loop ${new Date().toLocaleTimeString()}`;
      const file = new File([recordedBlob], `${title}.webm`, { type: recordedBlob.type });
      await uploadTrack(file);
      navigate('/library');
    } catch(e) { console.error(e); }
  };

  const loadedCount = pads.filter(p => p.buffer).length;

  return (
    <div className="flex-1 overflow-y-auto h-full p-4 md:p-8 relative">
      <div className="flex flex-col lg:flex-row gap-6 h-full pb-24 md:pb-8">
      
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      {/* ═══════════════ LEFT PANEL: PAD GRID ═══════════════ */}
      <div className="flex-1 flex flex-col bg-white border border-line shadow-sm rounded-[2.5rem] p-6 lg:p-10 relative z-10 overflow-hidden">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8 shrink-0">
          <div>
            <h1 className="text-2xl font-black tracking-tighter flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Disc3 className="w-5 h-5 text-white" />
              </div>
              <span>Sampler Studio</span>
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted mt-1 ml-12">
              Zero-Latency WebAudio · {loadedCount}/16 Pads Loaded
            </p>
          </div>
          <button
            onClick={toggleRecording}
            className={cn(
              "px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer shadow-sm border",
              isRecording
                ? "bg-red-500/10 text-red-500 border-red-500/30 animate-pulse shadow-red-500/20"
                : "bg-gray-50 text-muted border-line hover:bg-gray-100 hover:text-black"
            )}
          >
            {isRecording
              ? <><Square className="w-3.5 h-3.5 fill-current" /> Stop Loop</>
              : <><Circle className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Record Loop</>
            }
          </button>
        </header>

        {/* ── 4×4 MPC PAD GRID ── */}
        <div className="grid grid-cols-4 gap-3 w-full max-w-xl mx-auto lg:mx-0 aspect-square">
          {pads.map((pad, i) => (
            <motion.div
              key={pad.id}
              className="relative group"
              whileTap={{ scale: 0.92 }}
            >
              <button
                onMouseDown={() => triggerPad(pad.id)}
                onClick={() => { if (!pad.buffer) setActivePadId(pad.id); }}
                onContextMenu={(e) => { e.preventDefault(); if(pad.buffer) setActivePadId(pad.id); }}
                className="w-full h-full relative overflow-hidden cursor-pointer focus:outline-none"
                style={{ aspectRatio: '1' }}
              >
                {/* Pad background */}
                <div className={cn(
                  "absolute inset-0 rounded-2xl transition-all duration-150",
                  pad.buffer
                    ? `bg-gradient-to-br ${PAD_GRADIENTS[i]} shadow-md`
                    : "bg-gray-50 border border-line",
                  pad.isTriggered && "scale-[0.97]"
                )} />

                {/* Trigger flash overlay */}
                <AnimatePresence>
                  {pad.isTriggered && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-white/60"
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>

                {/* Glow when triggered */}
                {pad.isTriggered && pad.buffer && (
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{ boxShadow: `0 0 40px 10px ${PAD_GLOW_COLORS[i]}` }}
                  />
                )}

                {/* Inner content */}
                <div className="absolute inset-0 rounded-2xl flex flex-col justify-between p-3 z-10">
                  {/* Key badge */}
                  <div className={cn(
                    "w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black uppercase self-start",
                    pad.buffer ? "bg-black/30 text-white/90" : "bg-gray-200 text-muted"
                  )}>
                    {KEY_MAP[i]}
                  </div>

                  {/* Track name or + icon */}
                  {pad.buffer ? (
                    <div className="flex flex-col gap-0.5">
                      <div className="h-px w-full bg-black/20 rounded mb-1.5 focus:outline-none">
                        <div className="h-full bg-white/90 rounded" style={{ width: `${70 + (i * 13) % 30}%` }} />
                      </div>
                      <p className="text-[8px] font-bold truncate text-white leading-tight">{pad.name}</p>
                    </div>
                  ) : (
                    <div className="self-center opacity-40 group-hover:opacity-100 transition-opacity text-muted">
                      <Plus className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Hover delete button when loaded */}
                {pad.buffer && (
                  <button
                    onClick={(e) => { e.stopPropagation(); clearPad(pad.id); }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500 z-20 text-white"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Status bar */}
        <div className="mt-6 flex items-center justify-between px-1 shrink-0">
          <div className="flex items-center gap-4">
            {[...Array(4)].map((_, row) => (
              <div key={row} className="flex items-center gap-1">
                {[...Array(4)].map((_, col) => {
                  const padIdx = row * 4 + col;
                  return (
                    <div
                      key={col}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-colors",
                        pads[padIdx]?.buffer ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-gray-200"
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted">
            Keyboard Mapped · Click to Load
          </p>
        </div>

        {/* Recorded loop card */}
        <AnimatePresence>
          {recordedBlob && !isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 p-5 rounded-2xl bg-gray-50 border border-line shrink-0"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-bold">Loop Captured</p>
                  <p className="text-[9px] text-muted font-bold uppercase tracking-widest">{(recordedBlob.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <audio src={URL.createObjectURL(recordedBlob)} controls className="w-full mb-4 h-8 rounded-lg outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setRecordedBlob(null)} className="py-2.5 rounded-xl border border-line text-[10px] font-bold uppercase tracking-widest text-muted hover:bg-gray-100 hover:text-black transition-colors cursor-pointer">Discard</button>
                <button onClick={saveToVault} className="py-2.5 rounded-xl bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black/80 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md">
                  Save to Vault <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════ RIGHT PANEL: PAD INSPECTOR / VAULT ═══════════════ */}
      <div className="w-full lg:w-80 xl:w-96 flex flex-col h-full relative z-10 space-y-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activePadId !== null ? (
            /* ── VAULT BROWSER (select asset for pad) ── */
            <motion.div
              key="vault"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col h-full bg-white border border-line shadow-sm rounded-[2.5rem] overflow-hidden">
              <div className="p-6 border-b border-line shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mb-3",
                      `bg-gradient-to-r ${PAD_GRADIENTS[activePadId]} text-white shadow-sm`
                    )}>
                      <Layers className="w-3 h-3" />
                      Pad {KEY_MAP[activePadId].toUpperCase()}
                    </div>
                    <h3 className="text-lg font-bold tracking-tight text-black">Load Asset</h3>
                    <p className="text-[9px] text-muted font-bold uppercase tracking-widest mt-0.5">Choose from Vault</p>
                  </div>
                  <button
                    onClick={() => setActivePadId(null)}
                    className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors border border-line"
                  >
                    <Square className="w-3.5 h-3.5 text-muted" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {tracks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12 opacity-50">
                    <Music2 className="w-12 h-12 mb-4 text-muted" />
                    <p className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Vault Empty</p>
                    <button
                      onClick={() => navigate('/library')}
                      className="px-4 py-2 bg-gray-100 rounded-xl text-[9px] font-bold hover:bg-gray-200 uppercase tracking-widest text-black cursor-pointer"
                    >
                      Upload Assets
                    </button>
                  </div>
                ) : (
                  tracks.map(t => (
                    <button
                      key={t.id}
                      onClick={() => loadTrackToPad(t)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-line hover:bg-gray-100 transition-all text-left group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-200 overflow-hidden shrink-0 relative flex items-center justify-center border border-line">
                        {(t as any).thumbnailUrl
                          ? <img src={(t as any).thumbnailUrl} className="w-full h-full object-cover" />
                          : <Disc3 className="w-5 h-5 text-muted" />
                        }
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-black">{t.title}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted truncate">{(t as any).category || 'Audio'}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>

          ) : (
            /* ── IDLE STATE — show pad overview ── */
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full p-6 bg-white border border-line shadow-sm rounded-[2.5rem] overflow-hidden"
            >
              <div className="mb-6">
                <h3 className="text-sm font-bold tracking-tight text-black">Pad Overview</h3>
                <p className="text-[9px] text-muted font-bold uppercase tracking-widest mt-0.5">Click any pad to bind an asset</p>
              </div>

              {/* Mini pad grid overview */}
              <div className="grid grid-cols-4 gap-2 mb-8">
                {pads.map((pad, i) => (
                  <button
                    key={pad.id}
                    onClick={() => setActivePadId(pad.id)}
                    className="aspect-square rounded-xl cursor-pointer transition-all hover:scale-105 relative overflow-hidden shadow-sm"
                  >
                    <div className={cn(
                      "absolute inset-0 rounded-xl",
                      pad.buffer ? `bg-gradient-to-br ${PAD_GRADIENTS[i]}` : "bg-gray-50 border border-line"
                    )} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={cn("text-[8px] font-black uppercase", pad.buffer ? "text-white" : "text-muted")}>
                        {KEY_MAP[i]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 rounded-2xl bg-gray-50 border border-line">
                  <p className="text-2xl font-black text-black">{loadedCount}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted mt-1">Pads Loaded</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-line">
                  <p className="text-2xl font-black text-black">{16 - loadedCount}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted mt-1">Available</p>
                </div>
              </div>

              {/* Keyboard guide */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-line space-y-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted">Keyboard Map</p>
                {[
                  { row: '1 2 3 4', label: 'Row 1' },
                  { row: 'Q W E R', label: 'Row 2' },
                  { row: 'A S D F', label: 'Row 3' },
                  { row: 'Z X C V', label: 'Row 4' },
                ].map(r => (
                  <div key={r.row} className="flex items-center gap-3">
                    <p className="text-[9px] text-muted font-bold uppercase tracking-widest w-12">{r.label}</p>
                    <div className="flex gap-1">
                      {r.row.split(' ').map(k => (
                        <kbd key={k} className="w-5 h-5 rounded-md bg-white border border-line flex items-center justify-center text-[8px] font-black text-black shadow-sm">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-4">
                <button
                  onClick={() => navigate('/library')}
                  className="w-full py-3 rounded-xl border border-line text-[9px] font-bold uppercase tracking-widest text-muted hover:bg-gray-100 hover:text-black transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Import More Assets
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </div>
  );
}
