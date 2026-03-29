import React, { useState } from 'react';
import { Zap, Play, Layers, Sliders, Activity, Sparkles, Plus, Music, Speaker, CheckCircle2, Disc, Map } from '../lib/icons';
import { cn } from '../lib/utils';
import { useProfile } from '../lib/ProfileContext';
import { motion } from 'motion/react';
import { useOmniRack, DEFAULT_RACK_PARAMS } from '../lib/useOmniRack';
import type { OmniRackParams } from '../lib/useOmniRack';

export default function VektrLab() {
  const { activeTrackId, setActiveTrackId, tracks, isPlaying, togglePlay, rackParams, updateRackParams } = useProfile();
  const activeTrack = tracks.find(t => t.id === activeTrackId);

  type RackTarget = 'transport' | 'dynamics' | 'filters' | 'graphic' | 'space' | 'mod' | 'spatial3d';
  const [activeRack, setActiveRack] = useState<RackTarget>('transport');

  const setParam = (key: keyof OmniRackParams, val: any) => updateRackParams({ [key]: val });

  const handleTogglePlay = () => {
    if (!activeTrack?.fileUrl) return;
    togglePlay();
  };

  if (!activeTrack) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 h-full rounded-[2.5rem] p-8">
        <Music className="w-12 h-12 text-amber-500 mb-6 drop-shadow-lg opacity-80" />
        <h2 className="text-2xl font-bold tracking-tight mb-2">Enter VEKTR Lab</h2>
        <p className="text-muted text-sm font-medium mb-8">Select a track to begin DSP processing operations.</p>
        <div className="w-full max-w-sm">
           <select 
             value={activeTrackId || ''} 
             onChange={(e) => setActiveTrackId(e.target.value)}
             className="w-full p-4 bg-white border border-line rounded-2xl font-bold focus:border-black outline-none transition-all cursor-pointer shadow-sm"
           >
             <option value="" disabled>Select a track from the Vault</option>
             {tracks.map(t => (
               <option key={t.id} value={t.id}>{t.title} ({t.category})</option>
             ))}
           </select>
        </div>
      </div>
    );
  }

  const Knob = ({ val, set, label, min=0, max=100, step=1, unit='%' }: any) => (
    <div className="flex flex-col items-center group">
       <span className="text-[10px] font-bold text-amber-500 mb-2 font-mono">{val > 0 ? `+${val}` : val}{unit}</span>
       <div className="relative h-32 w-8 flex justify-center items-center py-2 mb-3 bg-gray-50 rounded-xl border border-line group-hover:border-amber-500 transition-colors shadow-inner">
         <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(Number(e.target.value))} 
           className="absolute w-28 h-1 appearance-none bg-transparent rounded outline-none -rotate-90 cursor-ns-resize z-10" />
         <div className="absolute bottom-2 w-2 bg-amber-500 rounded-sm pointer-events-none transition-all duration-75 shadow-sm" style={{ height: `calc(${((val-min)/(max-min))*100}% - 4px)` }} />
       </div>
       <span className="text-[9px] font-bold uppercase tracking-widest text-muted text-center">{label}</span>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto h-full p-4 md:p-8 relative">
      <div className="space-y-6 flex flex-col pb-24 md:pb-8">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted mb-1">
            <Sliders className="w-3 h-3 text-amber-500" /> Omni-Rack DSP Console
          </div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold tracking-tight">VEKTR Lab</h1>
            <select 
               value={activeTrackId || ''} 
               onChange={(e) => setActiveTrackId(e.target.value)}
               className="ml-2 p-2 bg-gray-50 border border-line rounded-xl font-bold text-sm focus:border-black outline-none transition-all cursor-pointer truncate max-w-[200px]"
             >
               {tracks.map(t => (
                 <option key={t.id} value={t.id}>{t.title}</option>
               ))}
            </select>
          </div>
          <div className="flex gap-2 mt-4">
             <button onClick={() => updateRackParams({...DEFAULT_RACK_PARAMS, dynamicsActive: true, saturation: 80, compression: -30, bitcrush: 8, lpfCutoff: 3000, filtersActive: true})}
               className="px-3 py-1.5 rounded-lg border border-amber-500/30 text-[10px] font-bold uppercase tracking-widest text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer">
               Cyberpunk Crunch
             </button>
             <button onClick={() => updateRackParams({...DEFAULT_RACK_PARAMS, transportActive: true, vinylPitch: 85, filtersActive: true, lpfCutoff: 4000, lpfRes: 2, spaceActive: true, reverbMix: 15})}
               className="px-3 py-1.5 rounded-lg border border-orange-500/30 text-[10px] font-bold uppercase tracking-widest text-orange-500 hover:bg-orange-500/10 transition-colors cursor-pointer">
               Vintage Vinyl
             </button>
             <button onClick={() => updateRackParams({...DEFAULT_RACK_PARAMS, audio8dActive: true, spaceActive: true, reverbMix: 30})}
               className="px-3 py-1.5 rounded-lg border border-purple-500/30 text-[10px] font-bold uppercase tracking-widest text-purple-500 hover:bg-purple-500/10 transition-colors cursor-pointer">
               8D Immersion
             </button>
             <button onClick={() => updateRackParams(DEFAULT_RACK_PARAMS)}
               className="px-3 py-1.5 rounded-lg border border-line text-[10px] font-bold uppercase tracking-widest text-muted hover:border-black hover:text-black transition-colors cursor-pointer">
               Master Reset
             </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-100 border border-line rounded-xl text-sm font-bold flex items-center gap-2 text-muted cursor-not-allowed opacity-80"><CheckCircle2 className="w-4 h-4"/> Render Chain</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        <div className="col-span-1 lg:col-span-2 bg-white text-black p-6 rounded-[2.5rem] border border-line shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <div onClick={handleTogglePlay} className="w-full aspect-square rounded-3xl bg-gray-50 border border-line flex items-center justify-center mb-6 relative group cursor-pointer overflow-hidden shadow-inner">
             <img src={activeTrack.thumbnailUrl} className={cn("absolute inset-0 w-full h-full object-cover transition-all duration-700", isPlaying ? "opacity-40 blur-sm scale-110" : "opacity-30 grayscale")} />
             
             {rackParams.audio8dActive && isPlaying && (
               <motion.div animate={{ rotate: 360 }} transition={{ duration: (100 - rackParams.speed8d + 10) / 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 flex items-center justify-center">
                 <div className="w-[120%] h-[120%] rounded-full border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]" />
                 <div className="absolute top-0 w-4 h-4 bg-amber-500 rounded-full shadow-[0_0_20px_rgba(245,158,11,1)]" />
               </motion.div>
              )}

             <div className="w-16 h-16 rounded-full bg-white text-black border border-line flex items-center justify-center shadow-lg z-10 group-hover:scale-110 transition-transform">
               {isPlaying ? <span className="w-5 h-5 bg-amber-500 rounded-sm" /> : <Play className="w-6 h-6 ml-1" />}
             </div>
          </div>
          <div className="w-full text-center space-y-1">
             <h3 className="font-bold text-lg truncate text-black">{activeTrack.title}</h3>
             <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">{activeRack.toUpperCase()} CONSOLE ACTIVE</p>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-3 bg-white text-black p-8 rounded-[2.5rem] border border-line shadow-sm flex flex-col">
          
          <div className="flex border-b border-line mb-8 overflow-x-auto hide-scrollbar">
            {[
              { id: 'transport', label: 'Master Transport', icon: Zap, active: rackParams.transportActive },
              { id: 'dynamics', label: 'Dynamics & Crush', icon: Activity, active: rackParams.dynamicsActive },
              { id: 'filters', label: 'Resonant Filters', icon: Sliders, active: rackParams.filtersActive },
              { id: 'graphic', label: '12-Band EQ', icon: Layers, active: rackParams.graphicActive },
              { id: 'space', label: 'Reverb & Echo', icon: Speaker, active: rackParams.spaceActive },
              { id: 'mod', label: 'Modulation', icon: Disc, active: rackParams.modActive },
              { id: 'spatial3d', label: '8D Spatializer', icon: Map, active: rackParams.audio8dActive }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveRack(tab.id as any)}
                 className={cn("px-6 py-4 flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-colors border-b-2 whitespace-nowrap cursor-pointer",
                   activeRack === tab.id ? "border-amber-500 text-amber-500 bg-gray-50/50" : "border-transparent text-muted hover:text-black hover:bg-gray-50"
                 )}>
                 <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1">
            {activeRack === 'transport' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/70">Rack Power</span>
                  <input type="checkbox" checked={rackParams.transportActive} onChange={e => setParam('transportActive', e.target.checked)} className="accent-amber-500 w-4 h-4 cursor-pointer" />
                </div>
                <div className="bg-black/40 p-6 rounded-2xl border border-white/5 mb-8 text-[10px] font-bold uppercase tracking-widest text-white/50 leading-relaxed">
                  VEKTR Studio commands the browser's internal C++ Phase Vocoder to stretch audio natively. Use Tempo for pristine time-stretching. Use Vinyl Mode for analog resampling.
                </div>
                <div className={cn("grid grid-cols-2 gap-12 justify-items-center transition-opacity", !rackParams.transportActive && 'opacity-30 pointer-events-none')}>
                   {rackParams.vinylPitch === 100 ? (
                     <Knob val={rackParams.tempo} set={(v: number) => setParam('tempo', v)} label="Time Stretch" min={50} max={200} />
                   ) : (
                     <div className="flex flex-col items-center justify-center opacity-30 cursor-not-allowed text-center h-32">
                       <span className="text-[10px] font-bold uppercase text-amber-500">Tempo Locked</span>
                     </div>
                   )}
                   {rackParams.tempo === 100 ? (
                     <Knob val={rackParams.vinylPitch} set={(v: number) => setParam('vinylPitch', v)} label="Vinyl PitchShift" min={50} max={200} />
                   ) : (
                     <div className="flex flex-col items-center justify-center opacity-30 cursor-not-allowed text-center h-32">
                       <span className="text-[10px] font-bold uppercase text-amber-500">Pitch Locked</span>
                     </div>
                   )}
                </div>
              </div>
            )}

            {activeRack === 'graphic' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/70">Rack Power</span>
                  <input type="checkbox" checked={rackParams.graphicActive} onChange={e => setParam('graphicActive', e.target.checked)} className="accent-amber-500 w-4 h-4 cursor-pointer" />
                </div>
                <div className={cn("grid grid-cols-4 lg:grid-cols-6 gap-y-8 gap-x-2 justify-items-center transition-opacity", !rackParams.graphicActive && 'opacity-30 pointer-events-none')}>
                   {rackParams.eqBands.map((vol, i) => (
                     <Knob key={i} val={vol} set={(v: number) => {
                       const n = [...rackParams.eqBands]; n[i] = v; setParam('eqBands', n);
                     }} label={['30','60','120','250','500','1k','2k','4k','8k','12k','16k','20k'][i] + ' Hz'} min={-12} max={12} unit="dB" />
                   ))}
                </div>
              </div>
            )}

            {activeRack === 'spatial3d' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-[rgba(245,158,11,0.5)] shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-500 flex items-center gap-2">
                     <Sparkles className="w-4 h-4" /> Enable 8D Orbit
                  </span>
                  <input type="checkbox" checked={rackParams.audio8dActive} onChange={e => setParam('audio8dActive', e.target.checked)} className="accent-amber-500 w-4 h-4 cursor-pointer" />
                </div>
                <div className="bg-black/40 p-6 rounded-2xl border border-white/5 mb-8 text-[10px] font-bold uppercase tracking-widest text-white/50 leading-relaxed">
                  Utilizes HRTF (Head-Related Transfer Function) natively. 8D Mode overrides stereo panning to render an absolute 3D spatial sphere around the listener. Headphones strictly required.
                </div>
                <div className={cn("grid grid-cols-2 gap-12 justify-items-center transition-opacity", !rackParams.audio8dActive && 'opacity-30 pointer-events-none')}>
                   <Knob val={rackParams.speed8d} set={(v: number) => setParam('speed8d', v)} label="Orbital Speed" />
                   <Knob val={rackParams.radius8d} set={(v: number) => setParam('radius8d', v)} label="Orbital Radius" max={50} unit="m" />
                </div>
              </div>
            )}

            {activeRack === 'dynamics' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
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
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
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

            {activeRack === 'space' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
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
            
            {activeRack === 'mod' && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
               <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/70">Rack Power</span>
                  <input type="checkbox" checked={rackParams.modActive} onChange={e => setParam('modActive', e.target.checked)} className="accent-amber-500 w-4 h-4 cursor-pointer" />
                </div>
                <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center transition-opacity", !rackParams.modActive && 'opacity-30 pointer-events-none')}>
                   <Knob val={rackParams.chorusRate} set={(v: number) => setParam('chorusRate', v)} label="Chorus Sweep" />
                   <Knob val={rackParams.chorusMix} set={(v: number) => setParam('chorusMix', v)} label="Chorus Depth" />
                   <Knob val={rackParams.flangerRate} set={(v: number) => setParam('flangerRate', v)} label="Jet-Plane Speed" />
                   <Knob val={rackParams.flangerMix} set={(v: number) => setParam('flangerMix', v)} label="Flanger Mix" />
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
             <p className="text-[8px] font-bold uppercase tracking-widest text-white/30 truncate">
               CHAIN: GATE {'->'} FILTERS {'->'} 12B-EQ {'->'} CRUSH {'->'} COMP {'->'} DIST {'->'} PARALLEL(SPACE & MOD) {'->'} LIMITER {'->'} 8D PANNER {'->'} CLIPPER
             </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
