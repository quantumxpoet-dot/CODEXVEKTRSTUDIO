import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music2, Plus, Search, Filter, Play, Pause, Disc, CheckCircle2, 
  Upload, FileAudio, LayoutTemplate, Activity, Settings2, Download, 
  Image as ImageIcon, X, Trash2, ChevronLeft, ChevronRight, Video 
} from '../lib/icons';
import { useNavigate } from '../lib/router';
import { cn } from '../lib/utils';
import { useProfile } from '../lib/ProfileContext';
import type { MediaItem } from '../types';

// Native Zero-Dependency WAV Encoder (16-bit PCM)
function encodeAudioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  let result;
  if (numChannels === 2) {
    const channel0 = buffer.getChannelData(0);
    const channel1 = buffer.getChannelData(1);
    result = new Float32Array(channel0.length * 2);
    for (let i = 0; i < channel0.length; i++) {
      result[i * 2] = channel0[i];
      result[i * 2 + 1] = channel1[i];
    }
  } else {
    result = buffer.getChannelData(0);
  }

  const dataLength = result.length * (bitDepth / 8);
  const bufferArray = new ArrayBuffer(44 + dataLength);
  const view = new DataView(bufferArray);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) { view.setUint8(offset + i, string.charCodeAt(i)); }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < result.length; i++) {
    const sample = Math.max(-1, Math.min(1, result[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

export default function ContentLibrary() {
  const navigate = useNavigate();
  const { vault, uploadMedia, updateMedia, deleteMedia, activeMediaId, setActiveMediaId, shareableItems, addShareableItem, isPlaying, togglePlay } = useProfile();
  
  const [filter, setFilter] = useState('All');
  const [stemFilter, setStemFilter] = useState('All Stems');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stemScrollRef = useRef<HTMLDivElement>(null);

  // Asset Manager Modal State
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const editingItem = vault.find(t => t.id === editingItemId);
  const [activeTab, setActiveTab] = useState<'metadata' | 'media' | 'converter'>('metadata');
  
  // Media Info State
  const [mediaInfo, setMediaInfo] = useState<{ duration: string, sampleRate: number, channels: number, format: string, peak: string } | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  // Auto-Analyze Media Info when modal opens
  useEffect(() => {
    if (!editingItem?.fileUrl || activeTab !== 'media' || editingItem.type !== 'audio') return;
    
    setMediaInfo(null);
    const analyze = async () => {
      try {
        if (!editingItem.fileUrl) return;
        const res = await fetch(editingItem.fileUrl);
        const arrayBuffer = await res.arrayBuffer();
        
        // Basic Blob info
        const formatStr = res.headers.get('content-type') || 'audio/unknown';
        
        const offlineCtx = new window.OfflineAudioContext(2, 44100, 44100);
        const buffer = await offlineCtx.decodeAudioData(arrayBuffer);
        
        const channelData = buffer.getChannelData(0);
        let maxPeak = 0;
        for(let i=0; i<channelData.length; i+=100) {
          const abs = Math.abs(channelData[i]);
          if(abs > maxPeak) maxPeak = abs;
        }
        const peakDb = maxPeak > 0 ? (20 * Math.log10(maxPeak)).toFixed(1) : '-inf';

        const mins = Math.floor(buffer.duration / 60);
        const secs = Math.floor(buffer.duration % 60);

        setMediaInfo({
          duration: `${mins}:${secs.toString().padStart(2, '0')}`,
          sampleRate: buffer.sampleRate,
          channels: buffer.numberOfChannels,
          format: formatStr,
          peak: `${peakDb} dBFS`
        });
      } catch(e) { console.error(e); }
    };
    analyze();
  }, [editingItem?.fileUrl, activeTab]);

  const categories = ['All', 'Single', 'EP', 'Album', 'Stems', 'Vektr Creations', 'Videos', 'Photos'];
  const stemCategories = ['All Stems', 'Instrumental', 'Vocals', 'Backing Vocals', 'Drums', 'Percussion', 'Bass', 'Guitar', 'Synth', 'Keys', 'Piano', 'Strings', 'Brass', 'Woodwinds', 'FX', 'Others'];
  
  let filteredVault = filter === 'All' ? vault : vault.filter(t => t.category === filter);
  if (filter === 'Stems' && stemFilter !== 'All Stems') {
    filteredVault = filteredVault.filter(t => (t as any).subcategory === stemFilter);
  }
  
  const isInProfile = (id: string) => shareableItems.some(i => i.sourceId === id);

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadMedia(file);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleItemClick = (item: MediaItem) => {
    if (item.type === 'audio') {
      if (activeMediaId === item.id) togglePlay();
      else setActiveMediaId(item.id);
    } else {
      setEditingItemId(item.id);
    }
  };

  const handleAddBio = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    addShareableItem({ 
      type: item.type === 'audio' ? 'track' : item.type === 'video' ? 'visual' : 'external_link', 
      title: item.title, 
      subtitle: item.category ? `Vektr ${item.category} • ${item.artist}` : item.artist,
      thumbnail: item.thumbnailUrl, 
      sourceId: item.id, 
      isVisible: true, 
      sortOrder: 0 
    });
  };

  const handleExportWAV = async () => {
    if (!editingItem?.fileUrl) return;
    setIsConverting(true);
    try {
      const res = await fetch(editingItem.fileUrl);
      const arrayBuffer = await res.arrayBuffer();
      const offlineCtx = new window.OfflineAudioContext(2, 44100, 44100);
      const buffer = await offlineCtx.decodeAudioData(arrayBuffer);
      
      const wavBlob = encodeAudioBufferToWav(buffer);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${editingItem.title || 'Master'}_Lossless.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error("Converter error:", e); }
    setIsConverting(false);
  };

  const handleMetadataUpdate = (key: string, value: string) => {
    if (!editingItemId) return;
    updateMedia(editingItemId, { [key]: value });
  };

  return (
    <div className="flex-1 overflow-y-auto h-full">
    <div className="space-y-8 pb-24 md:pb-8 p-4 md:p-8 relative">
      <input type="file" ref={fileInputRef} accept="audio/*,video/*,image/*" className="hidden" onChange={handleFileChange} />

      <header className="flex justify-between items-center bg-white p-6 rounded-3xl border border-line shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1 uppercase italic text-black">Content Vault</h1>
          <p className="text-muted text-xs font-medium">Manage your sovereign media assets.</p>
        </div>
        <button disabled={isUploading} onClick={handleUploadClick} className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-black/10 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
          {isUploading ? <><Activity className="w-4 h-4 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4" />Import Asset</>}
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-2 rounded-2xl border border-line shadow-sm">
        <div className="flex gap-1 w-full md:w-auto overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={cn('px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                filter === cat ? 'bg-black text-white shadow-md' : 'text-muted hover:text-black hover:bg-gray-50')}>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input type="text" placeholder="Search vault..." className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-line focus:border-black outline-none text-xs transition-all" />
          </div>
          <button className="p-2 rounded-xl border border-line hover:bg-gray-50 transition-all cursor-pointer">
            <Filter className="w-4 h-4 text-muted" />
          </button>
        </div>
      </div>

      {filter === 'Stems' && (
        <div className="relative group w-full mb-8">
          <button 
            onClick={() => stemScrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full border border-line shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:text-white cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <motion.div 
            ref={stemScrollRef}
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex gap-2 w-full overflow-x-auto px-12 no-scrollbar scroll-smooth relative z-10 py-1"
          >
            {stemCategories.map(cat => (
              <button key={cat} onClick={() => setStemFilter(cat)}
                className={cn('px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap border shrink-0',
                  stemFilter === cat ? 'bg-amber-400 text-black border-amber-400 shadow-sm' : 'bg-white/50 backdrop-blur-sm border-line text-muted hover:text-black hover:border-black')}>
                {cat}
              </button>
            ))}
          </motion.div>

          <button 
            onClick={() => stemScrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full border border-line shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:text-white cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVault.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}
            onClick={() => handleItemClick(item)}
            className={cn("bg-white p-6 rounded-[2rem] border transition-all group cursor-pointer shadow-sm hover:shadow-xl",
              activeMediaId === item.id ? "border-black ring-4 ring-black/5" : "border-line hover:border-black")}>
            
            <div className="aspect-square bg-gray-50 rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden shadow-inner">
              <img src={item.thumbnailUrl} alt={item.title}
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-all z-10", 
                 (activeMediaId === item.id && item.type === 'audio') ? "bg-black border-2 border-white scale-110 opacity-100" : "bg-white/10 border border-white/20 opacity-0 group-hover:opacity-100")}>
                {item.type === 'audio' ? (
                   activeMediaId === item.id && isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />
                ) : item.type === 'video' ? (
                   <Video className="w-8 h-8 text-white" />
                ) : (
                   <ImageIcon className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button onClick={e => { e.stopPropagation(); setEditingItemId(item.id); setActiveTab('metadata'); }} 
                  className="p-2 rounded-xl bg-white/10 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 hover:scale-105 cursor-pointer backdrop-blur-md">
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-xl truncate pr-4">{item.title}</h3>
                {activeMediaId === item.id && item.type === 'audio' && (
                  <span className="text-[10px] bg-black text-white font-bold uppercase tracking-widest px-2 py-1 rounded-md shadow-sm">Live</span>
                )}
              </div>
              <p className="text-xs text-muted font-bold uppercase tracking-widest">{item.artist} {item.category ? `• ${item.category}` : ''} {item.bpm ? `• ${item.bpm} BPM` : ''}</p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-line flex justify-between items-center">
              <div className="flex items-center gap-1 text-[10px] font-bold text-muted uppercase tracking-widest">
                {item.type === 'audio' ? <Music2 className="w-3 h-3" /> : item.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                {item.type.toUpperCase()} ASSET
              </div>
              {isInProfile(item.id) ? (
                <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />In Bio
                </div>
              ) : (
                <button onClick={e => handleAddBio(e, item)}
                  className="flex items-center gap-1 text-xs font-bold text-black bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                  <Plus className="w-4 h-4" />Add to Bio
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ASSET MANAGER / UTILITIES MODAL */}
      <AnimatePresence>
        {editingItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} 
              className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
              
              {/* Left Column: Cover & Identity */}
              <div className="w-full md:w-2/5 bg-gray-50 p-8 border-r border-line flex flex-col relative">
                <button onClick={() => setEditingItemId(null)} className="absolute top-4 left-4 p-2 bg-white rounded-full border border-line shadow-sm hover:scale-105 transition-all text-muted hover:text-black cursor-pointer md:hidden z-20">
                  <X className="w-4 h-4" />
                </button>

                <div className="w-full aspect-square bg-gray-100 rounded-[2rem] border-2 border-dashed border-gray-200 mb-8 relative group overflow-hidden flex flex-col items-center justify-center transition-colors">
                  {editingItem.type === 'video' ? (
                     <video src={editingItem.fileUrl} controls autoPlay muted className="absolute inset-0 w-full h-full object-contain bg-black z-10" />
                  ) : editingItem.type === 'image' ? (
                     <img src={editingItem.fileUrl || editingItem.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover z-10" />
                  ) : (
                     <>
                       {editingItem.thumbnailUrl ? (
                         <img src={editingItem.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover group-hover:opacity-30 transition-opacity z-10" />
                       ) : (
                         <ImageIcon className="w-12 h-12 text-muted/30 z-10" />
                       )}
                       <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20">
                         <div className="p-3 bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-line flex flex-col items-center text-black">
                           <Upload className="w-6 h-6 mb-1" />
                           <span className="text-[10px] font-bold tracking-widest uppercase">Update Cover</span>
                         </div>
                       </div>
                     </>
                  )}
                </div>
                
                <h2 className="text-2xl font-black tracking-tight mb-2 truncate text-black">{editingItem.title}</h2>
                <p className="text-muted tracking-widest uppercase text-[10px] font-bold mb-6 truncate">{editingItem.artist}</p>
                
                {editingItem.type === 'audio' && (
                  <audio src={editingItem.fileUrl} controls className="w-full h-8 mb-6 outline-none" />
                )}

                <div className="mt-auto space-y-3">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest">
                     <Settings2 className="w-3.5 h-3.5" /> Asset ID: {editingItem.id.split('-')[1]}
                   </div>
                </div>
              </div>

              {/* Right Column: Utilities Panel */}
              <div className="w-full md:w-3/5 flex flex-col bg-white">
                <header className="flex items-center justify-between p-6 border-b border-line">
                  <div className="flex gap-4">
                    {[
                      { id: 'metadata', label: 'ID3 Metadata', icon: LayoutTemplate },
                      { id: 'media', label: 'Media Info', icon: Activity },
                      { id: 'converter', label: 'Lossless Converter', icon: FileAudio }
                    ].map(t => (
                      <button key={t.id} onClick={() => setActiveTab(t.id as any)}
                        className={cn("flex flex-col items-center gap-1 transition-all cursor-pointer relative", activeTab === t.id ? "text-black" : "text-muted hover:text-black")}>
                        <t.icon className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{t.label}</span>
                        {activeTab === t.id && <motion.div layoutId="activetab" className="absolute -bottom-6 left-0 right-0 h-0.5 bg-black" />}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setEditingItemId(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors cursor-pointer hidden md:block">
                    <X className="w-4 h-4 text-black" />
                  </button>
                </header>

                <div className="flex-1 p-8 overflow-y-auto">
                  {/* METADATA EDITOR TAB */}
                  {activeTab === 'metadata' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold tracking-widest uppercase text-muted">Master Title</label>
                        <input type="text" value={editingItem.title} onChange={e => handleMetadataUpdate('title', e.target.value)} 
                          className="w-full p-4 bg-gray-50 border border-line rounded-2xl font-bold focus:border-black outline-none transition-all" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold tracking-widest uppercase text-muted">Artist / Performer</label>
                          <input type="text" value={editingItem.artist} onChange={e => handleMetadataUpdate('artist', e.target.value)} 
                            className="w-full p-4 bg-gray-50 border border-line rounded-2xl font-bold focus:border-black outline-none transition-all" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold tracking-widest uppercase text-muted">Vault Category</label>
                          <select value={editingItem.category || 'Single'} onChange={e => handleMetadataUpdate('category', e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-line rounded-2xl font-bold focus:border-black outline-none transition-all cursor-pointer appearance-none">
                            {categories.filter(c => c !== 'All').map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        {editingItem.category === 'Stems' && (
                          <div className="space-y-1 col-span-2">
                            <label className="text-[10px] font-bold tracking-widest uppercase text-muted">Stem Type</label>
                            <select value={(editingItem as any).subcategory || 'Drums'} onChange={e => handleMetadataUpdate('subcategory' as any, e.target.value)}
                              className="w-full p-4 bg-gray-50 border border-line rounded-2xl font-bold focus:border-black outline-none transition-all cursor-pointer appearance-none">
                              {stemCategories.filter(c => c !== 'All Stems').map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {editingItem.type === 'audio' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold tracking-widest uppercase text-muted">Tempo (BPM)</label>
                            <input type="number" value={editingItem.bpm || ''} placeholder="e.g. 120" onChange={e => handleMetadataUpdate('bpm', e.target.value)} 
                              className="w-full p-4 bg-gray-50 border border-line rounded-2xl font-bold focus:border-black outline-none transition-all" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold tracking-widest uppercase text-muted">Musical Key</label>
                            <input type="text" value={editingItem.key || ''} placeholder="e.g. 8A (Am)" onChange={e => handleMetadataUpdate('key', e.target.value)} 
                              className="w-full p-4 bg-gray-50 border border-line rounded-2xl font-bold focus:border-black outline-none transition-all" />
                          </div>
                        </div>
                      )}

                      <div className="pt-6 mt-6 border-t border-red-500/10">
                         <button onClick={() => { deleteMedia(editingItem.id); setEditingItemId(null); }}
                           className="w-full py-4 rounded-2xl border border-red-500/20 text-red-500 font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                           <Trash2 className="w-4 h-4" /> Delete Asset Permanently
                         </button>
                      </div>
                    </div>
                  )}

                  {/* MEDIA INFO TAB */}
                  {activeTab === 'media' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                      <div className="bg-black text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                        <div className="absolute -top-[50%] -right-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_50%)] animate-[spin_60s_linear_infinite]" />
                        
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-amber-500 relative z-10">
                          <Activity className="w-5 h-5" /> Decoder Insights
                        </h3>
                        
                        {(editingItem.type !== 'audio') ? (
                          <div className="text-center py-8 relative z-10 text-white/50 uppercase tracking-widest text-xs font-bold">
                            Advanced metrics available for Audio assets only.
                          </div>
                        ) : !mediaInfo ? (
                          <div className="text-center py-8 relative z-10 animate-pulse text-amber-500/50 uppercase tracking-widest text-xs font-bold">
                            Extracting PCM Buffer...
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-y-6 gap-x-4 relative z-10">
                            <div>
                              <p className="text-[10px] font-bold text-white/50 tracking-widest uppercase mb-1">MIME Format Matrix</p>
                              <p className="font-mono text-sm uppercase text-amber-400">{mediaInfo.format}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-white/50 tracking-widest uppercase mb-1">Duration</p>
                              <p className="font-mono text-sm text-white">{mediaInfo.duration}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-white/50 tracking-widest uppercase mb-1">Sample Rate</p>
                              <p className="font-mono text-sm text-white">{mediaInfo.sampleRate} Hz</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-white/50 tracking-widest uppercase mb-1">Audio Channels</p>
                              <p className="font-mono text-sm text-white">{mediaInfo.channels === 2 ? 'Stereo (2)' : 'Mono (1)'}</p>
                            </div>
                            <div className="col-span-2 pt-4 border-t border-white/10">
                              <p className="text-[10px] font-bold text-white/50 tracking-widest uppercase mb-1">Absolute Peak Amplitude</p>
                              <p className="font-mono text-lg font-black text-red-400">{mediaInfo.peak}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* FORMAT CONVERTER TAB */}
                  {activeTab === 'converter' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                      
                      <div className="bg-gray-50 border border-line rounded-[2rem] p-8">
                        <h3 className="text-lg font-bold mb-2">Download High-Quality Audio</h3>
                        <p className="text-muted text-sm mb-8 leading-relaxed">
                          Download your track in standard high-quality WAV format, ready for distribution to Spotify, Apple Music, and other streaming platforms.
                        </p>

                        <button onClick={handleExportWAV} disabled={isConverting || editingItem.type !== 'audio'}
                          className="w-full py-4 bg-black text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-1 hover:scale-[1.02] transition-all cursor-pointer shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group">
                          <span className="flex items-center gap-2"><Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> {isConverting ? 'Preparing Download...' : 'Download WAV File'}</span>
                          <span className="text-[10px] text-white/50 tracking-widest uppercase font-mono mt-1">Studio Quality format</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}
