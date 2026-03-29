import React, { useState } from 'react';
import { useParams, useNavigate } from '../lib/router';
import { motion } from 'motion/react';
import { 
  Music2, Download, MoreVertical, Play, Zap, Edit3, ArrowLeft, ChevronRight, Save, X, Plus, Video, Image as ImageIcon, Disc
} from '../lib/icons';
import { cn } from '../lib/utils';
import { useProfile } from '../lib/ProfileContext';

export default function ContentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vault, updateMedia, setActiveMediaId } = useProfile();
  const activeItem = vault.find(t => t.id === id);
  const [isEditing, setIsEditing] = useState(false);

  if (!activeItem) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Disc className="w-16 h-16 text-muted mb-4 animate-spin-slow" />
        <h2 className="text-2xl font-bold">Asset not found</h2>
        <button onClick={() => navigate('/library')} className="mt-4 text-black font-bold flex items-center gap-2 hover:underline cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Return to Vault
        </button>
      </div>
    );
  }

  const handleUpdate = (updates: any) => {
    if (id) updateMedia(id, updates);
  };

  const categories = ['Single', 'EP', 'Album', 'Stems', 'Vektr Creations', 'Videos', 'Photos'];

  return (
    <div className="pb-12">
      <button onClick={() => navigate('/library')}
        className="flex items-center gap-2 text-muted hover:text-black transition-colors mb-8 group cursor-pointer font-bold uppercase tracking-widest text-[10px]">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Content Vault
      </button>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-8">
          <div className="flex items-start gap-8">
            <div className="w-48 h-48 bg-gray-100 rounded-[2.5rem] border border-line flex flex-col items-center justify-center relative overflow-hidden group shadow-xl shadow-black/5">
              {activeItem.type === 'video' ? (
                <video src={activeItem.fileUrl} controls autoPlay muted className="absolute inset-0 w-full h-full object-contain bg-black z-10" />
              ) : activeItem.type === 'image' ? (
                <img src={activeItem.fileUrl || activeItem.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover z-10" />
              ) : (
                <>
                  <img src={activeItem.thumbnailUrl} alt="Cover"
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700 z-10" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                  <Play className="w-12 h-12 text-white relative z-20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </div>
            <div className="flex-1 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-black text-white rounded">
                  {activeItem.type.toUpperCase()}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-gray-100 text-muted rounded">
                  {activeItem.category || 'ASSET'}
                </span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter mb-2 italic uppercase">{activeItem.title}</h1>
              <p className="text-xl text-muted font-bold tracking-tight">{activeItem.artist} {activeItem.bpm ? `• ${activeItem.bpm} BPM` : ''} {activeItem.key ? `• ${activeItem.key}` : ''}</p>
              <div className="flex gap-4 mt-8">
                {activeItem.type === 'audio' && (
                  <button onClick={() => setActiveMediaId(activeItem.id)} className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer shadow-xl">
                    <Play className="w-4 h-4 ml-1" />Play Session
                  </button>
                )}
                <button onClick={() => setIsEditing(!isEditing)} 
                  className={cn("px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer border shadow-sm",
                    isEditing ? "bg-amber-400 text-black border-amber-500" : "bg-white border-line hover:border-black text-black")}>
                  {isEditing ? <><X className="w-4 h-4" />Cancel Edit</> : <><Edit3 className="w-4 h-4" />Metadata Editor</>}
                </button>
              </div>
            </div>
          </div>

          {isEditing && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 p-8 rounded-[2.5rem] space-y-8 shadow-inner mb-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-amber-900/60">Global Metadata Editor</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-amber-800/60 block">Item Title</label>
                  <input 
                    type="text" 
                    value={activeItem.title} 
                    onChange={e => handleUpdate({ title: e.target.value })}
                    className="w-full p-4 bg-white border border-amber-200 rounded-2xl font-bold focus:border-amber-500 outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-amber-800/60 block">Artist Name</label>
                  <input 
                    type="text" 
                    value={activeItem.artist} 
                    onChange={e => handleUpdate({ artist: e.target.value })}
                    className="w-full p-4 bg-white border border-amber-200 rounded-2xl font-bold focus:border-amber-500 outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-amber-800/60 block">Vektr Category</label>
                  <select 
                    value={activeItem.category || 'Single'} 
                    onChange={e => handleUpdate({ category: e.target.value as any })}
                    className="w-full p-4 bg-white border border-amber-200 rounded-2xl font-bold focus:border-amber-500 outline-none transition-all appearance-none cursor-pointer shadow-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                {activeItem.type === 'audio' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold tracking-widest uppercase text-amber-800/60 block">Tempo (BPM)</label>
                      <input 
                        type="number" 
                        value={activeItem.bpm || ''} 
                        onChange={e => handleUpdate({ bpm: Number(e.target.value) })}
                        className="w-full p-4 bg-white border border-amber-200 rounded-2xl font-bold focus:border-amber-500 outline-none transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold tracking-widest uppercase text-amber-800/60 block">Key</label>
                      <input 
                        type="text" 
                        value={activeItem.key || ''} 
                        onChange={e => handleUpdate({ key: e.target.value })}
                        placeholder="e.g. C Minor"
                        className="w-full p-4 bg-white border border-amber-200 rounded-2xl font-bold focus:border-amber-500 outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <button onClick={() => setIsEditing(false)}
                className="w-full py-4 bg-black text-amber-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.01] transition-all shadow-xl shadow-black/20 italic">
                Commit Changes to Vault
              </button>
            </motion.div>
          )}

          {activeItem.type === 'audio' && activeItem.stems && activeItem.stems.length > 0 && (
            <div className="bg-white p-8 rounded-3xl border border-line shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Stems</h2>
                <button className="text-sm font-bold flex items-center gap-2 hover:underline cursor-pointer">
                  <Plus className="w-4 h-4" />Add Stem
                </button>
              </div>
              <div className="space-y-2">
                {activeItem.stems.map((stem, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-muted">
                      <Music2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{stem.name}</h3>
                      <p className="text-xs text-muted font-mono uppercase">{stem.type.toUpperCase()}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg hover:bg-gray-100 text-muted hover:text-black cursor-pointer"><Download className="w-4 h-4" /></button>
                      <button className="p-2 rounded-lg hover:bg-gray-100 text-muted hover:text-black cursor-pointer"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="font-black italic uppercase text-lg mb-4 flex items-center gap-2 relative z-10">
              <Zap className="w-5 h-5 text-amber-400" /> Vektr Lab
            </h3>
            <p className="text-sm text-white/60 mb-6 relative z-10">Apply premium mastering chains to this asset instantly.</p>
            <button className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-[10px] hover:scale-[1.05] transition-transform cursor-pointer relative z-10">
              Process Master v4
            </button>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-line shadow-sm">
            <h3 className="font-bold text-lg mb-6 uppercase tracking-tighter italic">Release Info</h3>
            <div className="space-y-6">
              {[
                ['Mime Type', activeItem.type],
                ['Vault ID', activeItem.id.split('-')[1]],
                ['Created', new Date(activeItem.createdAt).toLocaleDateString()]
              ].map(([label, value]) => (
                <div key={label}>
                  <label className="text-[10px] uppercase tracking-widest text-muted font-black block mb-1">{label}</label>
                  <p className="font-mono text-sm uppercase">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
