import React, { useState, useEffect, useRef } from 'react';
import { Activity, Mic, Square, ShieldCheck, Music } from '../lib/icons';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

// --- ZERO-DEPENDENCY AUTO-CORRELATION PITCH DETECTION ---
function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  let rms = 0;
  for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / buf.length);
  if (rms < 0.01) return -1; // Not enough signal energy

  let r1 = 0, r2 = buf.length - 1;
  const thres = 0.2;
  for (let i = 0; i < buf.length / 2; i++) {
    if (Math.abs(buf[i]) < thres) { r1 = i; break; }
  }
  for (let i = 1; i < buf.length / 2; i++) {
    if (Math.abs(buf[buf.length - i]) < thres) { r2 = buf.length - i; break; }
  }

  const data = buf.slice(r1, r2);
  const c = new Array(data.length).fill(0);
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data.length - i; j++) {
      c[i] = c[i] + data[j] * data[j+i];
    }
  }

  let d = 0;
  while (c[d] > c[d+1]) d++;
  let maxval = -1, maxpos = -1;
  for (let i = d; i < data.length; i++) {
    if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
  }

  let t0 = maxpos;
  const x1 = c[t0-1], x2 = c[t0], x3 = c[t0+1];
  const a = (x1 + x3 - 2*x2)/2;
  const b = (x3 - x1)/2;
  if (a) t0 = t0 - b/(2*a); // Parabolic interpolation
  
  return sampleRate / t0;
}

const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function noteFromPitch(frequency: number) {
  const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
  return Math.round(noteNum) + 69;
}

function frequencyFromNoteNumber(note: number) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function centsOffFromPitch(frequency: number, note: number) {
  return Math.floor(1200 * Math.log(frequency / frequencyFromNoteNumber(note)) / Math.log(2));
}

// Target Tuning Types
const TUNINGS = {
  chromatic: { name: 'Chromatic', notes: [] }, // Free mode
  standard: { name: 'Standard E', notes: [40, 45, 50, 55, 59, 64] }, // E2, A2, D3, G3, B3, E4
  dropD: { name: 'Drop D', notes: [38, 45, 50, 55, 59, 64] },       // D2, A2...
  dropC: { name: 'Drop C', notes: [36, 43, 48, 53, 57, 62] },       // C2, G2, C3, F3, A3, D4
  dStandard: { name: 'D Standard', notes: [38, 43, 48, 53, 57, 62] },
  bassStd: { name: 'Bass Standard', notes: [28, 33, 38, 43] },      // E1, A1, D2, G2
};

type TuningKey = keyof typeof TUNINGS;

export default function TunerStudio() {
  const [isActive, setIsActive] = useState(false);
  const [tuning, setTuning] = useState<TuningKey>('chromatic');
  
  const [pitch, setPitch] = useState<number>(0);
  const [note, setNote] = useState<string>('--');
  const [cents, setCents] = useState<number>(0);
  const [targetString, setTargetString] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const startTuner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { autoGainControl: false, echoCancellation: false, noiseSuppression: false } 
      });
      streamRef.current = stream;

      const ctx = new window.AudioContext();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048; // Required for low frequency auto-correlation
      ctx.createMediaStreamSource(stream).connect(analyser);
      analyserRef.current = analyser;

      setIsActive(true);
      updatePitch();
    } catch (e) {
      console.error(e);
      alert('Microphone access is strictly required for the Zero-Dependency Tuner.');
    }
  };

  const stopTuner = () => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    setIsActive(false);
    setPitch(0);
    setNote('--');
    setCents(0);
    setTargetString(null);
  };

  useEffect(() => {
    return stopTuner;
  }, []);

  const updatePitch = () => {
    if (!analyserRef.current || !audioCtxRef.current) return;

    const buf = new Float32Array(analyserRef.current.fftSize);
    analyserRef.current.getFloatTimeDomainData(buf);
    
    const ac = autoCorrelate(buf, audioCtxRef.current.sampleRate);
    
    if (ac !== -1) {
      const p = Math.round(ac);
      setPitch(p);

      const noteNum = noteFromPitch(p);
      let c = centsOffFromPitch(p, noteNum);
      
      const activeTuning = TUNINGS[tuning];
      
      if (activeTuning.notes.length > 0) {
         // Snap to closest string in the tuning
         let closestString = activeTuning.notes[0];
         let minDiff = Math.abs(noteNum - activeTuning.notes[0]);
         let closestIdx = 0;
         
         activeTuning.notes.forEach((strNote, idx) => {
           const diff = Math.abs(noteNum - strNote);
           if (diff < minDiff) { minDiff = diff; closestString = strNote; closestIdx = idx; }
         });

         // If we are somewhat close to a string (within 2 semitones)
         if (minDiff <= 2) {
            setNote(noteStrings[closestString % 12]);
            c = Math.floor(1200 * Math.log(p / frequencyFromNoteNumber(closestString)) / Math.log(2));
            setTargetString(closestIdx);
         } else {
            setNote(noteStrings[noteNum % 12]);
            setTargetString(null);
         }
         setCents(c);
      } else {
         // Pure Chromatic
         setNote(noteStrings[noteNum % 12]);
         setCents(c);
         setTargetString(null);
      }
    }

    rafRef.current = requestAnimationFrame(updatePitch);
  };

  const isTuned = Math.abs(cents) < 5 && pitch > 0;
  
  // Calculate needle rotation based on cents (-50 to +50)
  const clampCents = Math.max(-50, Math.min(50, cents));
  const rotation = (clampCents / 50) * 45; // 45 degrees max swing

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#050505] text-white h-[100dvh] relative overflow-hidden">
      <div className={cn("absolute inset-0 transition-opacity duration-1000", isTuned ? "bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.1)_0%,_transparent_70%)] opacity-100" : "opacity-0")} />
      <div className={cn("absolute inset-0 transition-opacity duration-1000", !isTuned && pitch > 0 ? "bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.05)_0%,_transparent_70%)] opacity-100" : "opacity-0")} />

      <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-20">
        <div>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-2">
            <Activity className="w-8 h-8 text-amber-500" /> VEKTR Tuner
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mt-1">Mathematical Auto-Correlation Engine</p>
        </div>
        
        {isActive ? (
          <button onClick={stopTuner} className="px-6 py-3 rounded-2xl font-bold flex items-center gap-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-all border border-red-500/30">
            <Square className="w-4 h-4 fill-current" /> Stop Tuner
          </button>
        ) : (
          <button onClick={startTuner} className="px-6 py-3 rounded-2xl font-bold flex items-center gap-2 bg-white/10 text-white hover:bg-white/20 transition-all">
            <Mic className="w-4 h-4" /> Start Tuner
          </button>
        )}
      </header>

      {/* MAJESTIC STROBE GAUGE */}
      <div className="w-full max-w-2xl relative z-10 flex flex-col items-center mt-12">
        
        {/* Tuning Selector */}
        <div className="flex gap-2 mb-16 overflow-x-auto hide-scrollbar max-w-full pb-2 px-4 shadow-xl shadow-black/50">
          {(Object.keys(TUNINGS) as TuningKey[]).map(key => (
             <button key={key} onClick={() => setTuning(key)}
               className={cn("px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border-2",
                 tuning === key ? "border-amber-500 text-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]" : "border-white/10 text-white/50 hover:bg-white/5"
             )}>
               {TUNINGS[key].name}
             </button>
          ))}
        </div>

        <div className="relative w-80 h-80 flex items-center justify-center">
           {/* Center Note Display */}
           <div className={cn("absolute inset-0 rounded-full border-[12px] transition-all duration-300 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]",
             isTuned ? "border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.5)] bg-emerald-500/10" 
             : pitch > 0 ? "border-amber-500/50 bg-black" 
             : "border-white/5 bg-black"
           )}></div>

           <div className="flex flex-col items-center justify-center z-10">
             <motion.span 
               key={note}
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1 }}
               className="text-8xl font-black tracking-tighter drop-shadow-2xl"
             >
               {note}
             </motion.span>
             <span className="text-xl font-bold tracking-widest text-white/50 bg-black/50 px-4 py-1 rounded-full mt-2 backdrop-blur-md">
               {pitch > 0 ? `${pitch} Hz` : '--- Hz'}
             </span>
             {pitch > 0 && (
               <span className={cn("text-[10px] font-bold uppercase tracking-widest mt-2 px-3 py-1 rounded", isTuned ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10")}>
                 {cents > 0 ? `+${cents}` : cents} Cents
               </span>
             )}
           </div>

           {/* Strobe Needle Arc */}
           <div className="absolute top-[-40px] w-full h-full pointer-events-none">
             {/* Strobe guide markers */}
             <div className="absolute top-6 left-1/2 -translate-x-1/2 w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,1)] z-0" />
             <div className="absolute top-10 left-[15%] w-1 h-4 bg-white/20 rounded-full -rotate-45" />
             <div className="absolute top-10 right-[15%] w-1 h-4 bg-white/20 rounded-full rotate-45" />
             
             {/* Dynamic Needle */}
             {pitch > 0 && (
               <motion.div 
                 animate={{ rotate: rotation }}
                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
                 className="absolute top-4 left-1/2 w-1.5 h-16 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)] origin-bottom z-10"
                 style={{ x: "-50%" }}
               />
             )}
           </div>
        </div>

        {/* Selected Tuning Array Visualizer */}
        {tuning !== 'chromatic' && (
          <div className="mt-20 flex gap-4 w-full max-w-lg justify-center border-t border-white/10 pt-8">
            {TUNINGS[tuning].notes.map((n, idx) => (
              <div key={idx} className="flex flex-col items-center gap-3">
                 <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-bold font-mono text-lg transition-all border-2",
                   targetString === idx ? (isTuned ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-110" : "bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-110") 
                   : "bg-white/5 border-white/10 text-white/30"
                 )}>
                   {noteStrings[n % 12]}
                 </div>
                 <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">String {TUNINGS[tuning].notes.length - idx}</span>
              </div>
            ))}
          </div>
        )}

      </div>
      
      {!isActive && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-30 flex items-center justify-center text-center p-8">
           <div className="max-w-md bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-2xl">
             <Activity className="w-16 h-16 text-white/20 mx-auto mb-6" />
             <h2 className="text-2xl font-bold tracking-tight mb-2">Tuner Disengaged</h2>
             <p className="text-xs font-bold uppercase tracking-widest text-white/50 leading-relaxed mb-8">
               VEKTR Tuner utilizes advanced YIN Auto-Correlation mathematics to detect fundamental frequencies. Requires live microphone access via the browser WebRTC pipeline.
             </p>
             <button onClick={startTuner} className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-white text-black hover:scale-105 transition-all shadow-xl">
               <Mic className="w-4 h-4" /> Initialize Engine
             </button>
           </div>
        </div>
      )}
    </div>
  );
}
