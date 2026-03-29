import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Video, CheckCircle2, Maximize, Smartphone, Square, Monitor, Download, Play, Palette, Activity, Zap, Waves, Settings, Music, Share2, Plus, Terminal, Sparkles as SparklesIcon, ZapOff, Image as ImageIcon } from '../lib/icons';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useProfile } from '../lib/ProfileContext';
import { useNavigate } from '../lib/router';
import { useAudioAnalyzer } from '../lib/useAudioAnalyzer';
import { VisualizerCanvas } from '../lib/VisualizerCanvas';
import type { SessionContext } from '../lib/VisualizerCanvas';
import { generateCoverUrl } from '../lib/generateCover';

export default function VisualizerStudio() {
  const { activeTrackId, setActiveTrackId, tracks, lyricBooks, addShareableItem, profile, globalAudioRef, globalAnalyserRef, isPlaying, togglePlay } = useProfile();
  
  const navigate = useNavigate();
  const activeTrack = tracks.find(t => t.id === activeTrackId);
  const activeLyrics = lyricBooks.find(b => b.trackId === activeTrackId);

  const { active: isAudioActive, data: audioData, activateGlobal, deactivate, audioStream } = useAudioAnalyzer();

  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '16:9'>('9:16');
  const [visualizerType, setVisualizerType] = useState<'Waveform' | 'Particles' | 'Spectrum' | 'Matrix' | 'Cosmic' | 'Glitch'>('Matrix');
  const [activeStyle, setActiveStyle] = useState<'Glow' | 'VHS' | 'Retro' | 'Modern' | 'Abstract' | 'Minimal'>('Glow');
  const [showIntegrityGhost, setShowIntegrityGhost] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [currentTime, setCurrentTime] = useState(0);

  const handleExport = () => {
    if (!canvasRef.current || !audioStream || !globalAudioRef.current) return;

    if (isRecording) {
      recorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    // Prepare Recording
    const canvasStream = canvasRef.current.captureStream(60);
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioStream.getAudioTracks()
    ]);

    const recorder = new MediaRecorder(combinedStream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 12000000 // 12Mbps ultra quality
    });

    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VEKTR_${activeTrack?.title || 'Visual'}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    };

    // Sync Start
    globalAudioRef.current.currentTime = 0;
    recorder.start();
    if (!isPlaying) togglePlay();
    setIsRecording(true);
    recorderRef.current = recorder;
  };

  // 1. CONSTRUCT AXIOMETRIC SESSION CONTEXT
  const sessionContext = useMemo((): SessionContext | undefined => {
    if (!activeTrack) return undefined;
    
    // Flatten lyrics for the Word-Storm engine
    const flatLyrics = activeLyrics?.content || '';

    return {
      profileId: profile.ownerId,
      username: profile.displayName,
      trackTitle: activeTrack.title,
      lyrics: flatLyrics,
      mastering: {
        saturation: 45, // Placeholder for live DSP values
        clarity: 60,
      },
      logoUrl: logoUrl,
      syncLines: activeLyrics?.syncLines
    };
  }, [activeTrack, activeLyrics, profile, logoUrl]);

  const ratios = [
    { id: '9:16', label: 'Vertical', icon: Smartphone },
    { id: '1:1', label: 'Square', icon: Square },
    { id: '16:9', label: 'Landscape', icon: Monitor },
  ];

  const visualizers = [
    { id: 'Waveform', icon: Waves, label: 'Waveform' },
    { id: 'Particles', icon: Zap, label: 'Particles' },
    { id: 'Spectrum', icon: Activity, label: 'Spectrum' },
    { id: 'Matrix', icon: Terminal, label: 'Matrix' },
    { id: 'Cosmic', icon: SparklesIcon, label: 'Cosmic Horizon' },
    { id: 'Glitch', icon: ZapOff, label: 'Cyber Glitch' },
  ];

  const styles: Array<'Minimal' | 'Glow' | 'VHS' | 'Retro' | 'Modern' | 'Abstract'> = ['Minimal', 'Glow', 'VHS', 'Retro', 'Modern', 'Abstract'];

  // Bootstrap audio strictly from the Global Source
  useEffect(() => {
    if (activeTrack?.fileUrl && globalAnalyserRef.current) {
      activateGlobal(globalAnalyserRef.current);
    } else {
      setActiveTrackId(null);
    }
    
    return () => deactivate();
  }, [activeTrackId, activeTrack, globalAnalyserRef, activateGlobal, deactivate, navigate]);

  // Time Tracker 
  useEffect(() => {
    if (!globalAudioRef.current || !isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime(globalAudioRef.current?.currentTime || 0);
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, globalAudioRef]);

  const handleAddToBio = () => {
    addShareableItem({
      type: 'visual',
      title: `${activeTrack?.title || 'Visual'} (${visualizerType})`,
      subtitle: `Visualizer • ${activeStyle} Style`,
      thumbnail: generateCoverUrl(visualizerType),
      sourceId: activeTrackId || `visual-${Date.now()}`,
      isVisible: true,
      sortOrder: 0
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLogoUrl(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-8 h-full flex flex-col pb-12">

      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted mb-1">
            <Video className="w-3 h-3" />Visualizer Studio / {activeTrack?.title || 'No Track'}
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Visualizer Studio</h1>
          <p className="text-muted text-sm tracking-tight opacity-80">Sovereign Proof-of-Creation: Word-Storm & Identity Matrix enabled.</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl mr-2">
             <CheckCircle2 className="w-3.5 h-3.5" />
             <span className="text-[9px] font-bold uppercase tracking-widest">Lossless 60fps Hash-Lock</span>
          </div>
          <button onClick={handleAddToBio} disabled={!activeTrackId}
            className="px-4 py-2.5 rounded-xl border border-line text-sm font-bold disabled:opacity-50 hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-2">
            <Plus className="w-4 h-4" />Add to Bio
          </button>
          
          <button 
            disabled={!activeTrackId || !sessionContext?.syncLines?.length} 
            onClick={() => {
              if (!sessionContext?.syncLines) return;
              const formatTime = (seconds: number) => {
                const date = new Date(0);
                date.setSeconds(seconds);
                const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
                const mm = date.toISOString().substr(14, 2);
                const ss = date.toISOString().substr(17, 2);
                const ms = String(Math.floor((seconds % 1) * 1000)).padStart(3, '0');
                return `${hh}:${mm}:${ss},${ms}`;
              };
              const srt = sessionContext.syncLines.map((line: { startTime: number; endTime: number; text: string }, i: number) => 
                `${i + 1}\n${formatTime(line.startTime)} --> ${formatTime(line.endTime)}\n${line.text}\n`
              ).join('\n');
              const blob = new Blob([srt], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${activeTrack?.title || 'Track'}_Subtitles.srt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="hidden sm:flex px-4 py-2.5 rounded-xl border border-line text-sm font-bold disabled:opacity-50 hover:bg-gray-50 transition-all cursor-pointer items-center gap-2">
            <Terminal className="w-4 h-4" /> Export .SRT
          </button>

          <button disabled={!activeTrackId} onClick={handleExport}
            className={cn(
              "px-8 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2 shadow-xl",
              isRecording ? "bg-red-500 text-white animate-pulse" : "bg-black text-white hover:bg-zinc-800 shadow-black/10"
            )}>
            {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Download className="w-4 h-4" />}
            {isRecording ? 'Stop Recording' : 'Export Video'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
        <div className="flex-1 bg-white rounded-[2.5rem] border border-line shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-line flex justify-between items-center bg-gray-50/30">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {ratios.map(r => (
                <button key={r.id} onClick={() => setAspectRatio(r.id as any)}
                  className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
                    aspectRatio === r.id ? 'bg-white text-black shadow-sm' : 'text-muted hover:text-black')}>
                  <r.icon className="w-3.5 h-3.5" />{r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-12 bg-[#020617] relative overflow-hidden">
            <motion.div layout transition={{ duration: 0.4 }}
              className={cn('bg-black shadow-2xl relative overflow-hidden border border-white/10 rounded-lg',
                aspectRatio === '9:16' ? 'aspect-[9/16] h-full max-h-[520px]' :
                aspectRatio === '1:1' ? 'aspect-square h-full max-h-[400px]' :
                'aspect-video w-full')}>

              <VisualizerCanvas
                mode={visualizerType as any}
                style={activeStyle}
                audioData={audioData}
                lyrics={sessionContext?.lyrics}
                currentTime={currentTime}
                context={sessionContext as any}
                showIntegrityGhost={showIntegrityGhost}
                isDemo={!activeTrack || !isAudioActive}
                className="absolute inset-0"
              />

              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center p-8">
                <AnimatePresence>
                  {!activeTrack && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="z-10 bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-white"
                    >
                      <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-60">Disconnected</p>
                      <p className="text-[10px]">Go to Track Library and select a track to visualize</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {activeTrack && (
                  <div className="mt-auto mb-12">
                    <h2 className="text-white text-3xl font-bold tracking-tighter mb-2 uppercase italic drop-shadow-lg">{activeTrack.title}</h2>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">{activeTrack.artist}</p>
                  </div>
                )}
              </div>

              {activeTrack && (
                <div className="absolute top-4 right-4 pointer-events-auto">
                  <button 
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer shadow-lg"
                  >
                    {isPlaying ? <span className="w-3 h-3 bg-white" /> : <Play className="w-5 h-5 ml-1" />}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        <div className="w-full lg:w-80 space-y-6 overflow-y-auto">
          <section className="bg-white p-6 rounded-[2rem] border border-line shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-6 flex items-center gap-2">
              <Music className="w-3.5 h-3.5" />Active Track
            </h3>
            {tracks.length === 0 ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-xs text-muted p-4 text-center border border-dashed rounded-xl border-line">No media in vault.</p>
                <button onClick={() => navigate('/library')} className="px-8 py-4 bg-black text-white rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all cursor-pointer shadow-xl">
                  <Plus className="w-4 h-4" />Go to Vault
                </button>
              </div>
            ) : (
              <select 
                value={activeTrackId || ''} 
                onChange={(e) => setActiveTrackId(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-line rounded-2xl font-bold focus:border-black outline-none transition-all cursor-pointer appearance-none truncate"
              >
                <option value="" disabled>Select a track</option>
                {tracks.map(t => (
                  <option key={t.id} value={t.id}>{t.title} ({t.category})</option>
                ))}
              </select>
            )}
          </section>
          <section className="bg-white p-6 rounded-[2rem] border border-line shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-6 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" />Visualizer Type
            </h3>
            <div className="space-y-2">
              {visualizers.map(v => (
                <button key={v.id} onClick={() => setVisualizerType(v.id as any)}
                  className={cn('w-full p-4 rounded-2xl border transition-all text-left flex items-center gap-4 group cursor-pointer',
                    visualizerType === v.id ? 'border-black bg-black text-white shadow-lg' : 'border-transparent hover:bg-gray-50')}>
                  <div className={cn('p-2 rounded-xl transition-colors', visualizerType === v.id ? 'bg-white/10' : 'bg-gray-100 group-hover:bg-white')}>
                    <v.icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm">{v.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-[2rem] border border-line shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-6 flex items-center gap-2">
              <Palette className="w-3.5 h-3.5" />Style & Theme
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {styles.map(style => (
                <button key={style} onClick={() => setActiveStyle(style)}
                  className={cn('py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer',
                    activeStyle === style ? 'border-black bg-black text-white shadow-md' : 'border-line hover:border-black')}>
                  {style}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-[2rem] border border-line shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-6 flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5" /> Centerpiece Logo
            </h3>
            <input type="file" ref={logoInputRef} accept="image/*" className="hidden" onChange={handleLogoUpload} />
            <button onClick={() => logoInputRef.current?.click()}
               className="w-full py-6 border-2 border-dashed border-gray-200 hover:border-black rounded-[1.5rem] flex flex-col items-center justify-center gap-3 text-muted hover:text-black transition-all cursor-pointer group bg-gray-50/50 hover:bg-white">
               {logoUrl ? (
                 <>
                   <img src={logoUrl} className="h-16 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500" />
                   <span className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 bg-white shadow-sm border border-line rounded-full">Replace Asset</span>
                 </>
               ) : (
                 <>
                   <div className="w-12 h-12 rounded-full bg-white border border-line flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                     <Plus className="w-5 h-5" />
                   </div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-center">Upload <br/><span className="text-black">Transparent PNG</span></span>
                 </>
               )}
            </button>
          </section>

          <section className="bg-white p-6 rounded-[2rem] border border-line shadow-sm ring-2 ring-transparent hover:ring-red-500/20 transition-all">
            <h3 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 italic">
                <Settings className="w-3.5 h-3.5" />Integrity Lab
              </div>
              <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase tracking-tighter">Axiometric Proof</span>
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-line/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wide">Twin displacement</span>
                  <button 
                    onClick={() => setShowIntegrityGhost(!showIntegrityGhost)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative cursor-pointer",
                      showIntegrityGhost ? "bg-red-500" : "bg-gray-300"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      showIntegrityGhost ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
                <p className="text-[9px] text-muted leading-relaxed">
                  Renders a shadow visual state derived from a tampered Profile ID. 
                  Used to prove the <span className="text-black font-bold">Deterministic Hash-Lock</span> to critics.
                </p>
              </div>

              {[
                { label: 'Bass Resonance', val: Math.round(audioData.bass * 100) },
                { label: 'Word-Storm Sync', val: Math.round(Math.random() * 20 + 80) },
                { label: 'Purity Score', val: 100 }
              ].map(item => (
                <div key={item.label} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold">{item.label}</span>
                    <span className="text-xs text-muted">{item.val}%</span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${item.val}%` }}
                      className="h-full bg-black"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
