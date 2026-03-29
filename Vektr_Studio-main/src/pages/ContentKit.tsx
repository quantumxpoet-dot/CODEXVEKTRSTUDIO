import React, { useState } from 'react';
import { LayoutTemplate, Plus, Eye, Download, Share2, Copy, Sparkles, User, BookOpen, Smartphone, Square, Zap, Music, Quote, CheckCircle2 } from '../lib/icons';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useProfile } from '../lib/ProfileContext';
import { exportElementAsPNG } from '../lib/htmlExport';

export default function ContentKit() {
  const { activeTrackId, setActiveTrackId, tracks, profile, addShareableItem, shareableItems, lyricBooks } = useProfile();
  const activeTrack = tracks.find(t => t.id === activeTrackId);
  const activeLyrics = lyricBooks.find(b => b.trackId === activeTrackId);
  const parsedLyrics = activeLyrics?.content?.split('\n').filter(l => l.trim().length > 0) || [];
  
  const displayQuote = parsedLyrics.length > 0 ? `"${parsedLyrics[0].toUpperCase()}"` : '"THE VIBRATION\nIS IMMORTAL"';
  const displayLyricSplit = parsedLyrics.length > 1 ? [`"${parsedLyrics[0]},`, `${parsedLyrics[1]}."`] : ['"We built this in the shadows,', 'Now we own the light."'];
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState('Release Card');
  const [isExporting, setIsExporting] = useState(false);

  const categories = ['All', 'Social', 'Release', 'Lyric', 'Identity'];
  const templates = [
    { id: '1', title: 'Bio Card', category: 'Identity', icon: User, desc: 'Aesthetic artist profile snapshot.' },
    { id: '2', title: 'Release Card', category: 'Release', icon: Square, desc: 'High-end streaming announcement.' },
    { id: '3', title: 'Lyric Poster', category: 'Lyric', icon: BookOpen, desc: 'Cinematic typography for your verses.' },
    { id: '4', title: 'Quote Card', category: 'Lyric', icon: Zap, desc: 'Punchy, glowing Instagram story hooks.' },
    { id: '5', title: 'Tour Poster', category: 'Social', icon: LayoutTemplate, desc: 'Visceral tour and show announcements.' },
  ];

  const filtered = activeCategory === 'All' ? templates : templates.filter(t => t.category === activeCategory);

  const handleAddToBio = () => {
    addShareableItem({
      type: 'visual', 
      title: `${activeTrack?.title || 'Generative'} - ${selectedTemplate}`,
      subtitle: `Content Kit • ${selectedTemplate}`,
      thumbnail: activeTrack?.thumbnailUrl || '',
      sourceId: activeTrack?.id || `content-${Date.now()}`, 
      isVisible: true, 
      sortOrder: 0
    });
  };

  const handleExport = async () => {
    const el = document.getElementById('export-canvas-target');
    if (!el) return;
    setIsExporting(true);
    try {
      await exportElementAsPNG(el, `VEKTR_${selectedTemplate.replace(/\s+/g, '_')}_4K.png`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  // Render Dynamic HTML Asset Templates
  const renderDynamicAsset = () => {
    switch (selectedTemplate) {
      case 'Release Card':
        // Link Resolution: Release links override artist-level links!
        const releaseLinks = shareableItems.filter(i => i.isVisible && i.sourceId === activeTrack?.id).slice(0, 2);
        const displayLinks = releaseLinks.length > 0 ? releaseLinks : [
          { title: 'Listen on Spotify', url: '#', isPrimary: true },
          { title: 'Apple Music', url: '#', isPrimary: false }
        ];

        return (
          <div className="absolute inset-0 bg-black flex flex-col justify-end p-8 overflow-hidden group/canvas">
            <img src={activeTrack?.thumbnailUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-80 scale-105 group-hover/canvas:scale-100 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="relative z-10 w-full">
              <div className="flex justify-between items-end w-full mb-6">
                <div>
                  <h2 className="text-4xl font-bold tracking-tighter text-white mb-1 uppercase drop-shadow-lg">{activeTrack ? activeTrack.title : 'NO TRACK'}</h2>
                  <p className="text-[10px] text-white/70 font-bold uppercase tracking-[0.2em]">{profile.displayName} • OUT NOW</p>
                </div>
                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-2xl border border-white/20 shrink-0">
                  <img src={activeTrack?.thumbnailUrl} alt="Mini Cover" className="w-full h-full object-cover" />
                </div>
              </div>
              
              <div className="flex gap-2 w-full">
                {displayLinks.map((link, idx) => (
                   <div key={idx} className={cn("flex-1 py-3 text-center rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl line-clamp-1 px-2", 
                      idx === 0 || (link as any).isPrimary ? "bg-white text-black" : "bg-black/40 backdrop-blur-md text-white/90 border border-white/20"
                   )}>
                     {link.title}
                   </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'Bio Card':
        // Filter purely generic artist links, ordered
        const bioLinks = shareableItems.filter(i => i.isVisible && i.type === 'external_link').slice(0, 3);
        
        return (
          <div className="absolute inset-0 bg-[#020617] flex flex-col items-center justify-center p-8 overflow-hidden">
             <div className="absolute -top-[50%] -right-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_50%)] animate-[spin_60s_linear_infinite]" />
             
             <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-white/20 to-white/5 shadow-2xl mb-8 relative z-10">
               <img src={profile.avatarUrl} alt="Bio" className="w-full h-full rounded-full object-cover grayscale" />
             </div>
             
             <h2 className="text-3xl font-black tracking-tight text-white mb-2 relative z-10">{profile.displayName}</h2>
             <p className="text-sm text-center font-medium text-white/50 leading-relaxed max-w-[80%] relative z-10">{profile.bio || 'Vektr Studio Creator Profile. Sovereign Identity.'}</p>
             
             <div className="mt-8 flex gap-3 relative z-10">
               <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-[9px] font-bold tracking-widest uppercase shadow-sm">Artist</div>
               <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-[9px] font-bold tracking-widest uppercase shadow-sm">Producer</div>
             </div>

             <div className="mt-6 flex flex-col gap-2 w-full px-8 relative z-10">
               {bioLinks.map(link => (
                 <div key={link.id} className="w-full py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest text-center rounded-xl shadow-lg truncate px-4">
                   {link.title}
                 </div>
               ))}
               {bioLinks.length === 0 && (
                 <div className="w-full py-2.5 bg-white/5 border border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-widest text-center rounded-xl border-dashed">
                   Configure Links in Vault
                 </div>
               )}
             </div>
          </div>
        );

      case 'Quote Card':
        return (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-12 overflow-hidden border-8 border-black">
            <Quote className="w-10 h-10 text-black/20 absolute top-8 left-8" />
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-[0.9] text-black text-center mb-8 relative z-10 mix-blend-difference whitespace-pre-wrap break-words w-full">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-black">{displayQuote}</span>
            </h2>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-black shrink-0">
                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/60">{profile.displayName}</p>
            </div>
            
            <div className="absolute bottom-4 right-4 text-[8px] font-bold tracking-widest uppercase text-black/40">VEKTR • STUDIO</div>
          </div>
        );

      case 'Tour Poster':
        return (
          <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col justify-between p-8 overflow-hidden">
             <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
             
             <div className="relative z-10 mt-8">
               <h3 className="text-red-500 text-xs font-bold uppercase tracking-[0.3em] mb-2">{profile.displayName} Presents</h3>
               <h2 className="text-5xl font-black tracking-tighter text-white leading-none uppercase mix-blend-exclusion">WORLD<br/>TOUR<br/>2026</h2>
             </div>
             
             <div className="relative z-10 space-y-3 pb-8">
               {['LOS ANGELES - MAY 12', 'NEW YORK - MAY 18', 'LONDON - JUN 02', 'TOKYO - JUN 15'].map((d, i) => (
                 <div key={i} className="flex justify-between items-end border-b border-white/10 pb-2">
                   <span className="text-white font-bold text-sm tracking-widest">{d.split(' - ')[0]}</span>
                   <span className="text-white/50 text-[10px] uppercase font-bold tracking-widest">{d.split(' - ')[1]}</span>
                 </div>
               ))}
               <div className="pt-4 flex items-center justify-between w-full">
                 <button className="px-6 py-2.5 bg-red-600 text-white rounded-md text-[10px] font-bold uppercase tracking-widest shadow-xl">Tickets Available Now</button>
               </div>
             </div>
          </div>
        );

      case 'Lyric Poster':
        return (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-8 overflow-hidden">
            <img src={activeTrack?.thumbnailUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xl scale-110" />
            <div className="relative z-10 w-full h-full border border-white/20 p-8 flex flex-col justify-center">
              <p className="text-2xl font-medium italic text-white/90 leading-relaxed text-center drop-shadow-xl mb-4">
                {displayLyricSplit[0]}<br/>{displayLyricSplit[1]}
              </p>
              <p className="text-center text-[10px] text-white/40 uppercase font-bold tracking-[0.3em]">— {activeTrack ? activeTrack.title : 'VEKTR'}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-12 h-screen">
      
      {/* Dynamic Template Selector */}
      <div className="w-full lg:w-96 space-y-6 flex flex-col h-full">
        <div className="bg-white p-8 rounded-[2.5rem] border border-line shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-8 shrink-0">
            <h2 className="text-2xl font-bold flex items-center gap-2"><LayoutTemplate className="w-6 h-6" />Templates</h2>
          </div>
          <div className="flex gap-1 bg-gray-50 p-1 rounded-xl mb-6 overflow-x-auto shrink-0 scrollbar-hide">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={cn('px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap',
                  activeCategory === cat ? 'bg-black text-white shadow-md' : 'text-muted hover:text-black hover:bg-white')}>
                {cat}
              </button>
            ))}
          </div>
          <div className="space-y-3 overflow-y-auto flex-1 pr-2">
            {filtered.map(template => (
              <button key={template.id} onClick={() => setSelectedTemplate(template.title)}
                className={cn('w-full p-4 rounded-2xl border transition-all text-left flex items-start gap-4 group cursor-pointer shadow-sm',
                  selectedTemplate === template.title ? 'border-black bg-black text-white shadow-xl scale-[1.02]' : 'border-line hover:border-black hover:bg-gray-50')}>
                <div className={cn('p-3 rounded-xl transition-colors', selectedTemplate === template.title ? 'bg-white/10 text-white' : 'bg-gray-100 text-black group-hover:bg-white')}>
                  <template.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{template.title}</p>
                  <p className={cn('text-[10px] mt-1 pr-2', selectedTemplate === template.title ? 'text-white/70' : 'text-muted')}>{template.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Extreme HTML-Canvas Pro Render Engine */}
      <div className="flex-1 bg-[#f0f0f0] rounded-[2.5rem] border border-line shadow-inner flex flex-col overflow-hidden relative">
        <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-50 pointer-events-none">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm text-black mb-2">
              <Sparkles className="w-3 h-3 text-purple-500" /> PRO RENDER ENGINE
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-black tracking-tight drop-shadow-md mix-blend-overlay opacity-80">{selectedTemplate}</h1>
              {activeTrack && (
                <select 
                  value={activeTrackId || ''} 
                  onChange={(e) => setActiveTrackId(e.target.value)}
                  className="p-2 bg-white/50 backdrop-blur-md border border-black/10 rounded-xl font-bold text-sm outline-none transition-all cursor-pointer truncate max-w-[150px] shadow-sm pointer-events-auto hover:bg-white"
                >
                  {tracks.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="flex gap-2 pointer-events-auto items-center mt-6">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl mr-2">
               <CheckCircle2 className="w-3.5 h-3.5" />
               <span className="text-[9px] font-bold uppercase tracking-widest">Axiometric 4K Verified</span>
            </div>
            <button onClick={handleExport} disabled={isExporting} className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 rounded-xl text-sm font-bold shadow-lg transition-transform hover:scale-105 cursor-pointer disabled:opacity-50">
              <Download className={cn("w-4 h-4", isExporting && "animate-bounce")} /> {isExporting ? 'Rendering...' : 'Download 4K'}
            </button>
            <button onClick={handleAddToBio} className="flex items-center gap-2 px-4 py-3 bg-black text-white hover:bg-zinc-800 rounded-xl text-sm font-bold shadow-lg transition-transform hover:scale-105 cursor-pointer">
              <Plus className="w-4 h-4" /> Publish to Bio
            </button>
          </div>
        </header>
        
        <div className="flex-1 flex items-center justify-center p-8 mt-20">
          <AnimatePresence mode="wait">
            <motion.div 
              id="export-canvas-target"
              key={selectedTemplate}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="w-full max-w-[380px] aspect-[4/5] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative group"
            >
              {renderDynamicAsset()}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Track Guard */}
        {!activeTrack && selectedTemplate !== 'Bio Card' && selectedTemplate !== 'Tour Poster' && (
          <div className="absolute inset-0 z-40 bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center transition-opacity">
             <LayoutTemplate className="w-12 h-12 text-black mb-6 drop-shadow-lg opacity-80" />
             <h2 className="text-2xl font-bold tracking-tight mb-2">Track Alignment Required</h2>
             <p className="text-sm text-muted font-medium max-w-sm mb-8">
               This generative template requires synchronized track metadata to render accurately.
             </p>
             <div className="w-full max-w-xs">
                <select 
                  value={activeTrackId || ''} 
                  onChange={(e) => setActiveTrackId(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-line rounded-2xl font-bold focus:border-black outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="" disabled>Select a track source</option>
                  {tracks.map(t => (
                    <option key={t.id} value={t.id}>{t.title} ({t.category})</option>
                  ))}
                </select>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
