import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Save, Sliders, Activity, ShieldCheck, Volume2, Wand2, Disc, Radio, Ghost, Sparkles, Building2, Zap, Layers, Music, Play, Speaker } from '../lib/icons';
import { cn } from '../lib/utils';
import { useProfile } from '../lib/ProfileContext';
import { useNavigate } from '../lib/router';
import { motion } from 'motion/react';
import { DEFAULT_RACK_PARAMS } from '../lib/useOmniRack';
import type { OmniRackParams } from '../lib/useOmniRack';

// ──── TUNER MATH ────
function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  let rms = 0;
  for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / buf.length);
  if (rms < 0.01) return -1;
  let r1 = 0, r2 = buf.length - 1;
  const thres = 0.2;
  for (let i = 0; i < buf.length / 2; i++) if (Math.abs(buf[i]) < thres) { r1 = i; break; }
  for (let i = 1; i < buf.length / 2; i++) if (Math.abs(buf[buf.length - i]) < thres) { r2 = buf.length - i; break; }
  const data = buf.slice(r1, r2);
  const c = new Array(data.length).fill(0);
  for (let i = 0; i < data.length; i++) for (let j = 0; j < data.length - i; j++) c[i] += data[j] * data[j+i];
  let d = 0; while (c[d] > c[d+1]) d++;
  let maxval = -1, maxpos = -1;
  for (let i = d; i < data.length; i++) if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
  let t0 = maxpos;
  const x1 = c[t0-1], x2 = c[t0], x3 = c[t0+1];
  const a = (x1 + x3 - 2*x2)/2; const b = (x3 - x1)/2;
  if (a) t0 = t0 - b/(2*a);
  return sampleRate / t0;
}
const NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
function noteFromPitch(f: number) { return Math.round(12*(Math.log(f/440)/Math.log(2)))+69; }
function freqFromNote(n: number) { return 440*Math.pow(2,(n-69)/12); }
function centsOff(f: number, n: number) { return Math.floor(1200*Math.log(f/freqFromNote(n))/Math.log(2)); }

// ──── DSP HELPERS ────
function makeTapeSaturationCurve(amount = 20) {
  const k = amount, n = 44100, curve = new Float32Array(n), deg = Math.PI / 180;
  for (let i = 0; i < n; ++i) { const x = (i * 2) / n - 1; curve[i] = ((3+k)*x*20*deg)/(Math.PI+k*Math.abs(x)); }
  return curve;
}
function generateImpulseResponse(ctx: AudioContext, dur = 2, decay = 2) {
  const len = ctx.sampleRate * dur, buf = ctx.createBuffer(2, len, ctx.sampleRate);
  const l = buf.getChannelData(0), r = buf.getChannelData(1);
  for (let i = 0; i < len; i++) { const m = Math.pow(1-i/len, decay); l[i] = (Math.random()*2-1)*m; r[i] = (Math.random()*2-1)*m; }
  return buf;
}

// ──── FX CHAIN PRESETS ────
const FX_PRESETS = [
  { id: 'cyberpunk', name: 'Cyberpunk Crunch', color: 'text-amber-500 border-amber-500/30', params: {...DEFAULT_RACK_PARAMS, dynamicsActive: true, saturation: 80, compression: -30, bitcrush: 8, lpfCutoff: 3000, filtersActive: true} },
  { id: 'vinyl', name: 'Vintage Vinyl', color: 'text-orange-500 border-orange-500/30', params: {...DEFAULT_RACK_PARAMS, transportActive: true, vinylPitch: 85, filtersActive: true, lpfCutoff: 4000, lpfRes: 2, spaceActive: true, reverbMix: 15} },
  { id: '8d', name: '8D Immersion', color: 'text-purple-500 border-purple-500/30', params: {...DEFAULT_RACK_PARAMS, audio8dActive: true, spaceActive: true, reverbMix: 30} },
  { id: 'lofi', name: 'Lo-Fi Chill', color: 'text-pink-500 border-pink-500/30', params: {...DEFAULT_RACK_PARAMS, filtersActive: true, lpfCutoff: 2000, lpfRes: 3, dynamicsActive: true, saturation: 40, spaceActive: true, reverbMix: 20} },
  { id: 'cathedral', name: 'Cathedral Space', color: 'text-blue-500 border-blue-500/30', params: {...DEFAULT_RACK_PARAMS, spaceActive: true, reverbMix: 60, echoTime: 40, echoFbk: 30, echoMix: 20} },
  { id: 'telephone', name: 'Telephone', color: 'text-emerald-500 border-emerald-500/30', params: {...DEFAULT_RACK_PARAMS, filtersActive: true, hpfCutoff: 300, lpfCutoff: 3400, dynamicsActive: true, compression: -20, saturation: 30} },
  { id: 'reset', name: 'Master Reset', color: 'text-white/50 border-white/10', params: DEFAULT_RACK_PARAMS },
];

type RackTarget = 'transport' | 'dynamics' | 'filters' | 'graphic' | 'space' | 'mod' | 'spatial3d';
type StudioTab = 'recorder' | 'omnirack' | 'fx' | 'tuner' | 'metronome' | 'eq';

export default function MobileStudio() {
  const { uploadTrack, tracks, activeTrackId, setActiveTrackId, isPlaying, togglePlay, rackParams, updateRackParams, profile } = useProfile();
  const navigate = useNavigate();
  const [tab, setTab] = useState<StudioTab>('recorder');
  const [activeRack, setActiveRack] = useState<RackTarget>('dynamics');

  // ──── RECORDER STATE ────
  const [hasPermission, setHasPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [noiseCancellation, setNoiseCancellation] = useState(true);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const destRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // ──── TUNER STATE ────
  const [tunerActive, setTunerActive] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [tNote, setTNote] = useState('--');
  const [cents, setCents] = useState(0);
  const tunerCtxRef = useRef<AudioContext | null>(null);
  const tunerAnalyserRef = useRef<AnalyserNode | null>(null);
  const tunerStreamRef = useRef<MediaStream | null>(null);
  const tunerRafRef = useRef<number>(0);

  // ──── METRONOME STATE ────
  const [metroBpm, setMetroBpm] = useState(120);
  const [metroActive, setMetroActive] = useState(false);
  const metroRef = useRef<number>(0);
  const metroCtxRef = useRef<AudioContext | null>(null);

  // ──── RECORDER DSP ────
  const requestMicrophone = async (useAEC: boolean) => {
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { autoGainControl: useAEC, echoCancellation: useAEC, noiseSuppression: useAEC, sampleRate: 48000, channelCount: 1 } });
      streamRef.current = stream;
      setHasPermission(true);
      initRecorderDSP(stream);
    } catch (e) { console.error("Mic Error:", e); setHasPermission(false); }
  };

  useEffect(() => { requestMicrophone(noiseCancellation); return () => { cancelAnimationFrame(rafRef.current); streamRef.current?.getTracks().forEach(t => t.stop()); audioCtxRef.current?.close().catch(()=>{}); }; }, []);

  const initRecorderDSP = (stream: MediaStream) => {
    if (!audioCtxRef.current) audioCtxRef.current = new window.AudioContext();
    const ctx = audioCtxRef.current;
    const source = ctx.createMediaStreamSource(stream);
    const destination = ctx.createMediaStreamDestination();
    const analyser = ctx.createAnalyser(); analyser.fftSize = 256;
    const gain = ctx.createGain(); gain.gain.value = 1.5;
    source.connect(gain); gain.connect(destination); gain.connect(analyser);
    destRef.current = destination; analyserRef.current = analyser;
    drawWaveform();
  };

  const drawWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current, ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteTimeDomainData(data);
    const w = canvas.width = canvas.offsetWidth * 2, h = canvas.height = canvas.offsetHeight * 2;
    ctx.clearRect(0, 0, w, h); ctx.lineWidth = 3; ctx.strokeStyle = '#f59e0b'; ctx.lineCap = 'round'; ctx.beginPath();
    const sl = w / data.length; let x = 0;
    for (let i = 0; i < data.length; i++) { const y = (data[i]/128.0)*h/2; if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); x += sl; }
    ctx.stroke();
    rafRef.current = requestAnimationFrame(drawWaveform);
  };

  const toggleRecording = () => {
    if (!hasPermission) { requestMicrophone(noiseCancellation); return; }
    if (isRecording) { mediaRecorderRef.current?.stop(); setIsRecording(false); }
    else {
      if (!destRef.current) return;
      const mimes = ['audio/webm','audio/webm;codecs=opus','audio/mp4'];
      const mime = mimes.find(t => MediaRecorder.isTypeSupported(t)) || '';
      const rec = new MediaRecorder(destRef.current.stream, { mimeType: mime, audioBitsPerSecond: 320000 });
      chunksRef.current = [];
      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => { const b = new Blob(chunksRef.current, { type: mime }); setRecordedBlob(b); setPlaybackUrl(URL.createObjectURL(b)); };
      rec.start(); setIsRecording(true); mediaRecorderRef.current = rec;
    }
  };

  const discardRecording = () => { setRecordedBlob(null); if (playbackUrl) URL.revokeObjectURL(playbackUrl); setPlaybackUrl(null); };
  const saveToVault = async () => {
    if (!recordedBlob) return; setIsProcessing(true);
    try { const f = new File([recordedBlob], `Vektr Memo ${new Date().toLocaleTimeString()}.webm`, { type: recordedBlob.type }); await uploadTrack(f); navigate('/library'); }
    catch { setIsProcessing(false); }
  };

  // ──── TUNER ────
  const startTuner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { autoGainControl: false, echoCancellation: false, noiseSuppression: false } });
      tunerStreamRef.current = stream;
      const ctx = new window.AudioContext(); tunerCtxRef.current = ctx;
      const an = ctx.createAnalyser(); an.fftSize = 2048;
      ctx.createMediaStreamSource(stream).connect(an);
      tunerAnalyserRef.current = an; setTunerActive(true); updatePitch();
    } catch { alert('Microphone access required for tuner.'); }
  };
  const stopTuner = () => { cancelAnimationFrame(tunerRafRef.current); tunerStreamRef.current?.getTracks().forEach(t=>t.stop()); tunerCtxRef.current?.close().catch(()=>{}); setTunerActive(false); setPitch(0); setTNote('--'); setCents(0); };
  useEffect(() => { return stopTuner; }, []);
  const updatePitch = () => {
    if (!tunerAnalyserRef.current || !tunerCtxRef.current) return;
    const buf = new Float32Array(tunerAnalyserRef.current.fftSize);
    tunerAnalyserRef.current.getFloatTimeDomainData(buf);
    const ac = autoCorrelate(buf, tunerCtxRef.current.sampleRate);
    if (ac !== -1) { const p = Math.round(ac); setPitch(p); const nn = noteFromPitch(p); setTNote(NOTES[nn%12]); setCents(centsOff(p, nn)); }
    tunerRafRef.current = requestAnimationFrame(updatePitch);
  };

  // ──── METRONOME ────
  // ──── METRONOME ────
  // (State declared above)

  const Knob = ({ val, set, label, min=0, max=100, step=1, unit='%' }: any) => (
    <div className="flex flex-col items-center group">
       <span className="text-[10px] font-bold text-amber-500/80 mb-2 font-mono">{val > 0 ? `+${val}` : val}{unit}</span>
       <div className="relative h-32 w-8 flex justify-center items-center py-2 mb-3 bg-white/5 rounded-xl border border-white/10 group-hover:border-amber-500/50 transition-colors">
         <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(Number(e.target.value))} 
           className="absolute w-28 h-1 appearance-none bg-transparent rounded outline-none -rotate-90 cursor-ns-resize z-10" />
         <div className="absolute bottom-2 w-2 bg-amber-500 rounded-sm pointer-events-none transition-all duration-75" style={{ height: `calc(${((val-min)/(max-min))*100}% - 4px)` }} />
       </div>
       <span className="text-[9px] font-bold uppercase tracking-widest text-white/50 text-center flex-wrap max-w-[60px] leading-tight">{label}</span>
    </div>
  );

  // ──── FX CHAIN HANDLER ────
  const setParam = (key: keyof OmniRackParams, val: any) => updateRackParams({ [key]: val });
  const activeTrack = tracks.find(t => t.id === activeTrackId);

  const isTuned = Math.abs(cents) < 5 && pitch > 0;
  const clampCents = Math.max(-50, Math.min(50, cents));
  const needleRotation = (clampCents / 50) * 45;

  // ──── TAB DEFINITIONS ────
  const tabs: { id: StudioTab; label: string }[] = [
    { id: 'recorder', label: 'Recorder' },
    { id: 'omnirack', label: 'OmniRack FX' },
    { id: 'fx', label: 'FX Presets' },
    { id: 'eq', label: '12-Band EQ' },
    { id: 'tuner', label: 'Tuner' },
    { id: 'metronome', label: 'Metronome' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#050505] text-white min-h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.03)_0%,_transparent_50%)]" />

      {/* HEADER */}
      <header className="relative z-10 p-6 flex justify-between items-center border-b border-white/5">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-3 uppercase italic">
          <Mic className="w-5 h-5 text-amber-500" /> Vektr Studio
        </h1>
      </header>

      {/* TABS */}
      <div className="relative z-10 flex overflow-x-auto hide-scrollbar border-b border-white/5 px-4">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("px-5 py-4 text-[9px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all border-b-2 cursor-pointer",
              tab === t.id ? "border-amber-500 text-amber-500" : "border-transparent text-white/30 hover:text-white/60"
            )}>{t.label}</button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6 lg:p-10">

        {/* ═══ RECORDER TAB ═══ */}
        {tab === 'recorder' && (
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-10 py-8">
            <div className="w-full h-32 relative flex items-center justify-center rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
              {hasPermission ? <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" /> : <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">Awaiting Hardware Access</p>}
            </div>

            {recordedBlob ? (
              <div className="w-full space-y-6">
                <audio src={playbackUrl || ''} controls className="w-full rounded-xl" />
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={discardRecording} className="py-3.5 border border-white/20 rounded-xl font-bold text-[10px] uppercase tracking-widest text-white cursor-pointer">Discard</button>
                  <button disabled={isProcessing} onClick={saveToVault} className="py-3.5 bg-white text-black rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                    {isProcessing ? 'Encoding...' : 'Save to Vault'} <Save className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button onClick={toggleRecording} className="relative group cursor-pointer">
                  <div className={cn("absolute inset-0 rounded-full blur-2xl transition-all duration-700", isRecording ? "bg-red-500/50 scale-[2] animate-pulse" : "bg-white/5 group-hover:scale-125")} />
                  <div className={cn("w-28 h-28 rounded-full border-2 flex items-center justify-center relative z-10 transition-all duration-500 shadow-2xl",
                    isRecording ? "border-red-500 bg-red-500/20" : "border-white/20 bg-white/5 hover:border-white/50"
                  )}>
                    {isRecording ? <Square className="w-8 h-8 text-red-500 fill-current" /> : <Mic className="w-10 h-10 text-white/70" />}
                  </div>
                </button>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/25">{isRecording ? 'Recording...' : 'Tap to Record'}</p>
              </>
            )}
          </div>
        )}

        {/* ═══ OMNIRACK TAB ═══ */}
        {tab === 'omnirack' && (
          <div className="max-w-4xl mx-auto flex flex-col items-center py-8">
            <div className="flex border-b border-white/10 mb-8 overflow-x-auto hide-scrollbar w-full">
              {[
                { id: 'transport', label: 'Transport', icon: Zap },
                { id: 'dynamics', label: 'Dynamics', icon: Activity },
                { id: 'filters', label: 'Filters', icon: Sliders },
                { id: 'space', label: 'Space', icon: Speaker },
                { id: 'mod', label: 'Modulation', icon: Disc },
                { id: 'spatial3d', label: '8D Audio', icon: Sparkles }
              ].map(r => (
                <button key={r.id} onClick={() => setActiveRack(r.id as any)}
                   className={cn("px-6 py-4 flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-colors border-b-2 whitespace-nowrap cursor-pointer",
                     activeRack === r.id ? "border-amber-500 text-amber-500 bg-white/5" : "border-transparent text-white/40 hover:text-white"
                   )}>
                   <r.icon className="w-4 h-4" /> {r.label}
                </button>
              ))}
            </div>

            <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl">
               {activeRack === 'dynamics' && (
                 <div className="space-y-8 animate-in fade-in">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                      <span className="text-xs font-bold uppercase tracking-widest text-white/70">Rack Power</span>
                      <input type="checkbox" checked={rackParams.dynamicsActive} onChange={e => setParam('dynamicsActive', e.target.checked)} className="accent-amber-500 w-4 h-4 cursor-pointer" />
                    </div>
                    <div className={cn("grid grid-cols-2 md:grid-cols-5 gap-4 justify-items-center transition-opacity", !rackParams.dynamicsActive && 'opacity-30 pointer-events-none')}>
                       <Knob val={rackParams.gateThresh} set={(v: number) => setParam('gateThresh', v)} label="Noise Gate" unit="%" />
                       <Knob val={rackParams.compression} set={(v: number) => setParam('compression', v)} label="Compressor" />
                       <Knob val={rackParams.saturation} set={(v: number) => setParam('saturation', v)} label="Saturation" />
                       <Knob val={rackParams.bitcrush} set={(v: number) => setParam('bitcrush', v)} label="Bit Crusher" min={1} max={16} unit=" Bit" />
                       <Knob val={rackParams.limiter} set={(v: number) => setParam('limiter', v)} label="Brick Limiter" />
                    </div>
                 </div>
               )}
               {activeRack === 'filters' && (
                 <div className="space-y-8 animate-in fade-in">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                      <span className="text-xs font-bold uppercase tracking-widest text-white/70">Rack Power</span>
                      <input type="checkbox" checked={rackParams.filtersActive} onChange={e => setParam('filtersActive', e.target.checked)} className="accent-amber-500 w-4 h-4 cursor-pointer" />
                    </div>
                    <div className={cn("grid grid-cols-2 md:grid-cols-6 gap-2 justify-items-center transition-opacity", !rackParams.filtersActive && 'opacity-30 pointer-events-none')}>
                       <Knob val={rackParams.lpfCutoff} set={(v: number) => setParam('lpfCutoff', v)} label="Lowpass Freq" />
                       <Knob val={rackParams.lpfRes} set={(v: number) => setParam('lpfRes', v)} label="LP Res" max={20} unit=" Q" />
                       <Knob val={rackParams.hpfCutoff} set={(v: number) => setParam('hpfCutoff', v)} label="Highpass Freq" />
                       <Knob val={rackParams.hpfRes} set={(v: number) => setParam('hpfRes', v)} label="HP Res" max={20} unit=" Q" />
                       <Knob val={rackParams.bpfFreq} set={(v: number) => setParam('bpfFreq', v)} label="Bandpass Freq" />
                       <Knob val={rackParams.notchFreq} set={(v: number) => setParam('notchFreq', v)} label="Notch Limit" />
                    </div>
                 </div>
               )}
               {activeRack === 'mod' && (
                 <div className="space-y-8 animate-in fade-in">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                      <span className="text-xs font-bold uppercase tracking-widest text-white/70">Rack Power</span>
                      <input type="checkbox" checked={rackParams.modActive} onChange={e => setParam('modActive', e.target.checked)} className="accent-amber-500 w-4 h-4 cursor-pointer" />
                    </div>
                    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center transition-opacity", !rackParams.modActive && 'opacity-30 pointer-events-none')}>
                       <Knob val={rackParams.chorusMix} set={(v: number) => setParam('chorusMix', v)} label="Chorus Mix" />
                       <Knob val={rackParams.chorusRate} set={(v: number) => setParam('chorusRate', v)} label="Chorus Rate" />
                       <Knob val={rackParams.flangerMix} set={(v: number) => setParam('flangerMix', v)} label="Flanger Mix" />
                       <Knob val={rackParams.flangerRate} set={(v: number) => setParam('flangerRate', v)} label="Flanger Rate" />
                    </div>
                 </div>
               )}
               {activeRack === 'space' && (
                 <div className="space-y-8 animate-in fade-in">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                      <span className="text-xs font-bold uppercase tracking-widest text-white/70">Rack Power</span>
                      <input type="checkbox" checked={rackParams.spaceActive} onChange={e => setParam('spaceActive', e.target.checked)} className="accent-amber-500 w-4 h-4 cursor-pointer" />
                    </div>
                    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center transition-opacity", !rackParams.spaceActive && 'opacity-30 pointer-events-none')}>
                       <Knob val={rackParams.reverbMix} set={(v: number) => setParam('reverbMix', v)} label="Convolver Reverb" />
                       <Knob val={rackParams.echoTime} set={(v: number) => setParam('echoTime', v)} label="Echo Time" />
                       <Knob val={rackParams.echoFbk} set={(v: number) => setParam('echoFbk', v)} label="Echo Feedback" />
                       <Knob val={rackParams.echoMix} set={(v: number) => setParam('echoMix', v)} label="Delay Mix" />
                    </div>
                 </div>
               )}
               {activeRack === 'spatial3d' && (
                 <div className="space-y-8 animate-in fade-in">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                      <span className="text-xs font-bold uppercase tracking-widest text-white/70">8D Spatial Audio</span>
                      <input type="checkbox" checked={rackParams.audio8dActive} onChange={e => setParam('audio8dActive', e.target.checked)} className="accent-amber-500 w-4 h-4 cursor-pointer" />
                    </div>
                    <div className={cn("grid grid-cols-2 gap-12 justify-items-center transition-opacity", !rackParams.audio8dActive && 'opacity-30 pointer-events-none')}>
                       <Knob val={rackParams.speed8d} set={(v: number) => setParam('speed8d', v)} label="Orbital Speed" />
                       <Knob val={rackParams.radius8d} set={(v: number) => setParam('radius8d', v)} label="Orbital Radius" max={50} unit="m" />
                    </div>
                 </div>
               )}
               {activeRack === 'transport' && (
                 <div className="space-y-8 animate-in fade-in">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                      <span className="text-xs font-bold uppercase tracking-widest text-white/70">Transport Pitch/Time</span>
                      <input type="checkbox" checked={rackParams.transportActive} onChange={e => setParam('transportActive', e.target.checked)} className="accent-amber-500 w-4 h-4 cursor-pointer" />
                    </div>
                    <div className={cn("grid grid-cols-2 gap-12 justify-items-center transition-opacity", !rackParams.transportActive && 'opacity-30 pointer-events-none')}>
                       {rackParams.vinylPitch === 100 ? (
                         <Knob val={rackParams.tempo} set={(v: number) => setParam('tempo', v)} label="Time Stretch" min={50} max={200} />
                       ) : <div className="h-32 flex items-center"><span className="text-[10px] font-bold text-amber-500 uppercase">Tempo Locked</span></div>}
                       {rackParams.tempo === 100 ? (
                         <Knob val={rackParams.vinylPitch} set={(v: number) => setParam('vinylPitch', v)} label="Vinyl PitchShift" min={50} max={200} />
                       ) : <div className="h-32 flex items-center"><span className="text-[10px] font-bold text-amber-500 uppercase">Pitch Locked</span></div>}
                    </div>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* ═══ FX CHAINS TAB ═══ */}
        {tab === 'fx' && (
          <div className="max-w-3xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">One-Click FX Chains</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Select an active track, then apply a chain instantly</p>
            </div>

            {activeTrack && (
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-12 h-12 rounded-lg bg-white/10 overflow-hidden"><img src={(activeTrack as any).thumbnailUrl || (activeTrack as any).coverUrl} className="w-full h-full object-cover" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold truncate">{activeTrack.title}</h3>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Active Target</p>
                </div>
                <button onClick={togglePlay} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-lg">
                  {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FX_PRESETS.map(fx => (
                <button key={fx.id} onClick={() => updateRackParams(fx.params)}
                  className={cn("p-5 rounded-2xl border text-left transition-all group cursor-pointer hover:bg-white/5", fx.color)}>
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-bold uppercase tracking-widest">{fx.name}</span>
                  </div>
                </button>
              ))}
            </div>

            {!activeTrack && (
              <div className="text-center py-8 opacity-30">
                <Music className="w-8 h-8 mx-auto mb-3" />
                <p className="text-[9px] font-bold uppercase tracking-widest">Select a track from the Vault to apply FX</p>
              </div>
            )}
          </div>
        )}

        {/* ═══ 12-BAND EQ TAB ═══ */}
        {tab === 'eq' && (
          <div className="max-w-3xl mx-auto space-y-10">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-tight uppercase">12-Band Graphic EQ</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Power</span>
                <input type="checkbox" checked={rackParams.graphicActive} onChange={e => setParam('graphicActive', e.target.checked)} className="accent-amber-500 w-4 h-4 cursor-pointer" />
              </label>
            </div>
            <div className={cn("grid grid-cols-6 lg:grid-cols-12 gap-3 transition-opacity", !rackParams.graphicActive && 'opacity-20 pointer-events-none')}>
              {rackParams.eqBands.map((vol: number, i: number) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-500/80 font-mono">{vol > 0 ? `+${vol}` : vol}</span>
                  <div className="relative h-28 w-6 flex justify-center items-center bg-white/5 rounded-lg border border-white/10">
                    <input type="range" min={-12} max={12} value={vol} onChange={e => { const n = [...rackParams.eqBands]; n[i] = Number(e.target.value); setParam('eqBands', n); }}
                      className="absolute w-24 h-1 appearance-none bg-transparent -rotate-90 cursor-ns-resize z-10" />
                    <div className="absolute bottom-1 w-1.5 bg-amber-500 rounded-sm pointer-events-none transition-all" style={{ height: `${((vol+12)/24)*100}%` }} />
                  </div>
                  <span className="text-[7px] font-bold uppercase tracking-widest text-white/30">{['30','60','120','250','500','1k','2k','4k','8k','12k','16k','20k'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ TUNER TAB ═══ */}
        {tab === 'tuner' && (
          <div className="max-w-xl mx-auto flex flex-col items-center gap-10 py-8">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <div className={cn("absolute inset-0 rounded-full border-[8px] transition-all duration-300",
                isTuned ? "border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.4)] bg-emerald-500/5" : pitch > 0 ? "border-amber-500/40 bg-black" : "border-white/5 bg-black"
              )} />
              <div className="flex flex-col items-center z-10">
                <span className="text-7xl font-black tracking-tighter">{tNote}</span>
                <span className="text-base font-bold text-white/40 mt-1">{pitch > 0 ? `${pitch} Hz` : '--- Hz'}</span>
                {pitch > 0 && <span className={cn("text-[10px] font-bold uppercase tracking-widest mt-2 px-3 py-1 rounded", isTuned ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10")}>{cents > 0 ? `+${cents}` : cents} Cents</span>}
              </div>
              {pitch > 0 && (
                <motion.div animate={{ rotate: needleRotation }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute -top-4 left-1/2 w-1.5 h-14 bg-white rounded-full shadow-[0_0_15px_white] origin-bottom z-20" style={{ x: "-50%" }} />
              )}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-5 bg-emerald-500 rounded-full z-10" />
            </div>

            <button onClick={tunerActive ? stopTuner : startTuner}
              className={cn("px-10 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer",
                tunerActive ? "bg-red-500/20 text-red-500 border border-red-500/30" : "bg-white text-black"
              )}>{tunerActive ? 'Stop Tuner' : 'Start Tuner'}</button>
          </div>
        )}

        {/* ═══ METRONOME TAB ═══ */}
        {tab === 'metronome' && (
          <div className="max-w-md mx-auto flex flex-col items-center gap-12 py-12">
            <div className="text-center space-y-2">
              <span className="text-8xl font-black tracking-tighter">{metroBpm}</span>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">BPM</p>
            </div>

            <input type="range" min={40} max={240} value={metroBpm} onChange={e => setMetroBpm(Number(e.target.value))}
              className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-amber-500" />

            <div className="flex gap-3">
              {[60, 80, 100, 120, 140, 160].map(bpm => (
                <button key={bpm} onClick={() => setMetroBpm(bpm)}
                  className={cn("px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all cursor-pointer",
                    metroBpm === bpm ? "border-amber-500 text-amber-500 bg-amber-500/10" : "border-white/10 text-white/30 hover:text-white"
                  )}>{bpm}</button>
              ))}
            </div>

            <button onClick={() => setMetroActive(!metroActive)}
              className={cn("w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer shadow-2xl",
                metroActive ? "border-red-500 bg-red-500/20" : "border-white/20 bg-white/5 hover:border-white/50"
              )}>
              {metroActive ? <Square className="w-8 h-8 text-red-500 fill-current" /> : <Play className="w-8 h-8 text-white/70 ml-1" />}
            </button>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/25">{metroActive ? 'Running' : 'Tap to Start'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
