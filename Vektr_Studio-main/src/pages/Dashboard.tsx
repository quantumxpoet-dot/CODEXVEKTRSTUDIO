import React from 'react';
import { Music, BookOpen, Video, Link2, Plus, ArrowRight, Play, TrendingUp, Clock, Star, Layers, Diamond, Zap } from '../lib/icons';
import { motion } from 'motion/react';
import { useNavigate } from '../lib/router';
import { cn } from '../lib/utils';
import { useProfile } from '../lib/ProfileContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { vault, lyricBooks, shareableItems, setActiveMediaId } = useProfile();

  const linksCount = shareableItems.filter(i => i.type === 'external_link').length;
  const visualsCount = shareableItems.filter(i => i.type === 'visual').length;

  const stats = [
    { label: 'Vault Assets', value: vault.length, icon: Layers, to: '/library' },
    { label: 'Lyric Sheets', value: lyricBooks.length, icon: BookOpen, to: '/lyrics' },
    { label: 'Visualizers', value: visualsCount, icon: Video, to: '/visualizer' },
    { label: 'Active Links', value: linksCount, icon: Link2, to: '/links' },
  ];

  const handleMediaClick = (id: string, type: string) => {
    if (type === 'audio') {
      setActiveMediaId(id);
      navigate('/visualizer');
    } else {
      navigate(`/library/${id}`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto scroll-smooth h-full">
    <div className="space-y-16 pb-28 md:pb-12 px-4 md:px-8 py-8 max-w-7xl mx-auto">
      {/* HERO SECTION: ARTISTIC & OPEN */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-black text-white p-8 lg:p-0 shadow-2xl border border-white/5 h-[400px] flex items-center">
        {/* Background Visuals */}
        <div className="absolute inset-0 opacity-40 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]" />
          <motion.div 
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute top-[-50%] right-[-10%] w-[600px] h-[600px] border border-white/[0.03] rounded-full"
          />
          <motion.div 
            animate={{ 
              rotate: [360, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-[-40%] left-[-10%] w-[500px] h-[500px] border border-white/[0.03] rounded-full"
          />
        </div>

        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:px-20">
          <div className="text-center lg:text-left space-y-6">
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="w-10 h-10 bg-white shadow-2xl shadow-white/20 rounded-lg flex items-center justify-center"
              >
                <Diamond className="w-6 h-6 text-black" />
              </motion.div>
              <div className="h-px w-8 bg-white/20 hidden lg:block" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Studio Alpha v4</span>
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-6xl font-light tracking-tighter leading-[0.9] text-white"
            >
              CREATE <span className="italic font-bold text-white shadow-sm">BEYOND</span> <br />
              <span className="text-white/40">THE VAULT.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xs lg:text-sm text-white/50 max-w-sm mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              The sovereign media engine is live. Commit your audio, video, and photos to the immutable Vektr blockchain of creation.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center lg:justify-start gap-4 pt-4"
            >
              <button 
                onClick={() => navigate('/library')}
                className="px-8 py-3 bg-white text-black rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center gap-2 active:scale-95 group"
              >
                <Plus className="w-4 h-4" />
                Import Asset
              </button>
              <button 
                onClick={() => navigate('/visualizer')}
                className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg font-bold text-xs uppercase tracking-widest transition-all"
              >
                Launch Visualizer
              </button>
            </motion.div>
          </div>

          {/* Abstract Centerpiece */}
          <div className="hidden lg:flex justify-center relative">
             <div className="relative w-64 h-64">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                 className="absolute inset-0 border border-white/5 rounded-[3rem]" 
               />
               <motion.div 
                 animate={{ rotate: -360 }}
                 transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                 className="absolute inset-4 border border-white/10 rounded-[2.5rem]" 
               />
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-32 h-32 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-[2rem] flex items-center justify-center group hover:bg-white/10 transition-colors duration-500">
                   <Zap className="w-12 h-12 text-white/20 group-hover:text-amber-500/40 transition-colors" />
                   <div className="absolute inset-0 animate-pulse bg-white/5 rounded-[2rem]" />
                 </div>
               </div>
               
               {/* Floating elements */}
               <motion.div 
                 animate={{ y: [0, -10, 0] }}
                 transition={{ duration: 4, repeat: Infinity }}
                 className="absolute -top-4 -right-4 w-12 h-12 bg-black border border-white/20 rounded-xl flex items-center justify-center shadow-2xl"
               >
                 <Music className="w-5 h-5 text-white/60" />
               </motion.div>
               <motion.div 
                 animate={{ y: [0, 10, 0] }}
                 transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                 className="absolute -bottom-4 -left-4 w-12 h-12 bg-black border border-white/20 rounded-xl flex items-center justify-center shadow-2xl"
               >
                 <Video className="w-5 h-5 text-white/60" />
               </motion.div>
             </div>
          </div>
        </div>
      </section>

      {/* STATS: SPACIOUS & REFINED */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }} onClick={() => navigate(stat.to)}
            className="p-6 lg:p-8 rounded-3xl bg-white border border-line hover:border-black/20 transition-all group cursor-pointer shadow-sm hover:shadow-md">
            <div className="flex justify-between items-start mb-8">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-black/40 group-hover:bg-black group-hover:text-white transition-all overflow-hidden relative">
                <stat.icon className="w-5 h-5 z-10" />
                <div className="absolute inset-0 bg-black scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
              </div>
            </div>
            <div className="text-3xl font-light tracking-tight mb-1 text-black group-hover:translate-x-1 transition-transform">{stat.value}</div>
            <div className="text-[10px] text-muted uppercase tracking-[0.1em] font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        {/* ASSETS: OPEN LIST */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-black/80">
              <Layers className="w-5 h-5" />
              Recent Assets
            </h2>
            <button onClick={() => navigate('/library')}
              className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-black transition-colors flex items-center gap-2 cursor-pointer group">
              View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vault.length === 0 ? (
              <div className="col-span-2 p-12 text-center bg-gray-50/50 rounded-3xl border border-dashed border-line">
                <p className="text-xs text-muted font-bold uppercase tracking-widest">No assets in the vault.</p>
              </div>
            ) : vault.slice(0, 4).map((item) => (
              <motion.div key={item.id} whileHover={{ y: -2 }} onClick={() => handleMediaClick(item.id, item.type)}
                className="p-4 rounded-2xl bg-white border border-line hover:border-black/10 transition-all cursor-pointer group flex items-center gap-4 shadow-sm hover:shadow-md">
                <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden relative flex-shrink-0 shadow-sm border border-line">
                  <img src={item.thumbnailUrl} alt="Cover" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {item.type === 'audio' ? <Play className="w-6 h-6 text-white" /> : <Layers className="w-6 h-6 text-white" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold tracking-tight text-sm truncate text-black/90 group-hover:text-black transition-colors">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-gray-100 rounded text-muted group-hover:bg-black group-hover:text-white transition-colors border border-line/50">
                      {item.type}
                    </span>
                    <p className="text-[8px] text-muted font-medium uppercase tracking-widest truncate">
                      {item.category || 'Vektr'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ACTIVITY: MINIMAL TIMELINE */}
        <div className="space-y-8">
          <h2 className="text-xl font-bold tracking-tight px-2 flex items-center gap-2 text-black/80">
            <Clock className="w-5 h-5" />
            Activity
          </h2>
          <div className="bg-white rounded-3xl border border-line p-8 space-y-10 shadow-sm">
            {shareableItems.length === 0 ? (
              <div className="text-center py-6 opacity-30">
                <p className="text-[9px] font-bold uppercase tracking-widest">No recent activity.</p>
              </div>
            ) : shareableItems.slice(0, 3).map((item, i) => (
              <div key={item.id} className="flex gap-6 relative">
                {i !== Math.min(shareableItems.length - 1, 2) && <div className="absolute left-[3px] top-4 bottom-[-2.5rem] w-[1px] bg-line" />}
                <div className="w-1.5 h-1.5 rounded-full bg-black mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.2)]" />
                <div>
                  <div className="flex justify-between items-center gap-4 mb-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wide text-black/90">Asset Published</h4>
                    <span className="text-[8px] font-medium text-muted uppercase">Recent</span>
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed max-w-xs">{item.title} has been committed to your sovereign profile.</p>
                </div>
              </div>
            ))}
           </div>
         </div>
       </div>
     </div>
    </div>
  );
}
