import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from '../lib/router';
import { 
  Music, BookOpen, Video, Link2, Settings, LayoutDashboard,
  Zap, LayoutTemplate, ChevronDown, Monitor, Sparkles, X,
  Mic, Layers, Activity, Diamond
} from '../lib/icons';
import { cn } from '../lib/utils';
import { useProfile } from '../lib/ProfileContext';
import { AnimatePresence, motion } from 'motion/react';

const PASSIVE_HINTS = [
  "Select an asset in the Vault to activate the Global Processing Engine.",
  "Your Lyric Book auto-syncs. Open it while playing audio to see the magic.",
  "Check the Visualizer to see your Vektr Identity rendered in 3D-Realtime.",
  "Import your videos and photos for social-ready drop kits.",
  "Direct-to-Artist links in the Link Vault are now fully sovereign."
];

export const Sidebar: React.FC = () => {
  const { profile } = useProfile();
  const isFocus = profile.ambientMode === 'focus';
  const isFlow = profile.ambientMode === 'flow';
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
    { icon: Layers, label: 'Content Vault', to: '/library' },
    { icon: Mic, label: 'Vektr Labs', to: '/mobile' },
    { icon: Activity, label: 'Sampler Studio', to: '/sampler' },
    { icon: BookOpen, label: 'Lyric Book', to: '/lyrics' },
    { icon: Video, label: 'Visuals', to: '/visualizer' },
    { icon: LayoutTemplate, label: 'Content Kit', to: '/content' },
    { icon: Link2, label: 'Link Vault', to: '/links' },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className={cn("hidden md:flex flex-col w-64 border-r h-full shrink-0 transition-colors duration-500 backdrop-blur-3xl z-10", 
        isFocus ? 'bg-[#050505] border-white/10 text-white' : profile.ambientMode === 'flow' ? 'bg-white/40 border-black/5 text-black' : 'bg-white border-line text-black'
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-colors shadow-lg", isFocus ? "bg-white text-black" : "bg-black text-white")}>
            <Diamond className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black italic tracking-tighter uppercase">Vektr Studio</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                isActive 
                  ? (isFocus ? "bg-white text-black shadow-lg" : "bg-black text-white shadow-lg")
                  : (isFocus ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-muted hover:text-black hover:bg-gray-50")
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={cn("p-6 border-t", isFocus ? "border-white/10" : "border-line")}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{profile.displayName}</p>
              <p className="text-[10px] text-muted truncate">@{profile.slug || 'vektr'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV — HORIZONTALLY SCROLLABLE, NO MORE BUTTON */}
      <div className={cn("md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-3xl border-t z-50 transition-colors duration-500", 
        isFocus ? "bg-black/95 border-white/10 text-white" : isFlow ? "bg-white/40 border-black/5 text-black" : "bg-white/95 border-line text-black"
      )} style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))', paddingTop: '0.25rem' }}>
        <nav className="flex overflow-x-auto hide-scrollbar h-14 px-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center flex-shrink-0 w-[72px] h-full gap-0.5 transition-all",
                isActive ? (isFocus ? "text-white" : "text-black") : "text-muted"
              )}
            >
              {({ isActive }) => (
                <div className="flex flex-col items-center justify-center w-full">
                  <item.icon className={cn("w-5 h-5 mb-1", isActive && "text-amber-500")} />
                  <span className="text-[7.5px] font-bold tracking-tight uppercase leading-[1.1] text-center w-full truncate px-0.5">
                    {item.label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export const Layout: React.FC = () => {
  const { profile, updateProfile } = useProfile();
  const [hintIndex, setHintIndex] = useState(0);
  const [hintVisible, setHintVisible] = useState(true);
  const isFocus = profile.ambientMode === 'focus';

  const cycleAmbient = () => {
    const modes = ['flow', 'focus', 'reset'] as const;
    const curr = profile.ambientMode || 'flow';
    const nextIdx = (modes.indexOf(curr) + 1) % modes.length;
    updateProfile({ ambientMode: modes[nextIdx] });
  };

  useEffect(() => {
    const interval = setInterval(() => setHintIndex(prev => (prev + 1) % PASSIVE_HINTS.length), 15000);
    return () => clearInterval(interval);
  }, []);

  const isFlow = profile.ambientMode === 'flow';
  
  return (
    <div className={cn("flex h-[100dvh] overflow-hidden relative transition-colors duration-1000", 
      isFocus ? 'bg-[#0a0a0a] text-white' : isFlow ? 'bg-[#f8fafc] text-black' : 'bg-white text-black'
    )}>
      
      {/* ──── AMBIENT FLOW: GENERATIVE BACKDROP ──── */}
      <AnimatePresence>
        {isFlow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
          >
            {/* Mesh gradient orbs */}
            <motion.div 
              animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vh] rounded-full bg-violet-400/20 blur-[120px]" 
            />
            <motion.div 
              animate={{ rotate: -360, scale: [1, 1.2, 1] }} 
              transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
              className="absolute top-[40%] -right-[10%] w-[50vw] h-[50vh] rounded-full bg-amber-400/15 blur-[120px]" 
            />
            <motion.div 
              animate={{ rotate: 180, scale: [1, 0.9, 1] }} 
              transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-[20%] left-[20%] w-[70vw] h-[40vh] rounded-full bg-sky-300/20 blur-[130px]" 
            />
            {/* Subtle overlay texture to make it feel premium */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-[0.03] mix-blend-overlay" />
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
        <header className={cn("h-14 border-b px-4 md:px-6 flex items-center justify-between shrink-0 transition-colors duration-500 backdrop-blur-3xl", 
          isFocus ? 'bg-black/50 border-white/10' : isFlow ? 'bg-white/40 border-black/5' : 'bg-white/95 border-line'
        )}>
          <div className="flex-1 max-w-[60%] hidden sm:block">
            <AnimatePresence mode="popLayout">
              {hintVisible && (
                <motion.div key={hintIndex} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest bg-gray-50/80 px-3 py-1.5 rounded-full border border-line w-fit relative pr-8 max-w-full">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{PASSIVE_HINTS[hintIndex]}</span>
                  <button onClick={() => setHintVisible(false)} className="absolute right-1 rounded-full p-1 hover:bg-gray-200 cursor-pointer"><X className="w-3 h-3" /></button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex-1 sm:hidden flex items-center gap-2 text-[11px] font-bold text-black uppercase tracking-wider">VEKTR STUDIO</div>

          <div className="flex items-center gap-4">
            <button onClick={cycleAmbient} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer shadow-sm backdrop-blur-md",
               isFocus ? 'bg-white/10 border-white/20 text-white' : isFlow ? 'bg-white/60 border-black/5 text-black hover:bg-white/80' : 'bg-white border-line text-black'
            )}>
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Ambient: {profile.ambientMode || 'Flow'}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col overflow-hidden h-full">
            <Outlet />
        </main>
      </div>
    </div>
  );
};
