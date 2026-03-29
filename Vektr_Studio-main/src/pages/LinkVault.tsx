import React, { useState, useRef, useMemo } from 'react';
import {
  Plus, Copy, Palette, List, Globe, User, Share2, Music, Video, Quote,
  Settings, ChevronLeft, Check, Trash2, GripVertical, Zap, Square,
  Spotify, AppleMusic, SoundCloud, Instagram, Twitter, Youtube, ShoppingCart
} from '../lib/icons';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useProfile } from '../lib/ProfileContext';
import { THEMES, THEME_CATEGORIES, type ThemeDefinition } from '../lib/themes';
import { ART_CanvasHash } from '../components/Modules/modules/graphics/ART_CanvasHasher';

const CARD_STYLES = ['glass', 'solid', 'outline', 'brutalist'];

// ─── Sovereign Theme Swatch Component ──────────────────────────────────────
// Uses ART_CanvasHash to generate a unique deterministic canvas art background
// for each theme — no more flat black boxes for dark/glitch themes.
function ThemeSwatchGrid({ themes, currentThemeId, onSelect }: {
  themes: ThemeDefinition[];
  currentThemeId: string;
  onSelect: (id: string) => void;
}) {
  const canvasBgs = useMemo(() => {
    const map: Record<string, string> = {};
    themes.forEach(t => {
      // Extract a numeric hue from the theme's primary text/card colors
      const hexToNum = (s: string) => {
        const cleaned = s.replace(/[^0-9a-fA-F]/g, '').slice(0, 6).padEnd(6, '0');
        return parseInt(cleaned, 16) || 0;
      };
      const sat = (hexToNum(t.textColor) % 100) + 10;
      const clarity = (hexToNum(t.cardBorder) % 80) + 20;

      map[t.id] = ART_CanvasHash({
        profileId: t.id,
        username: t.name,
        trackTitle: t.textColor + t.id,
        lyrics: t.cardBg + t.cardBorder + t.bgClass,
        mastering: { saturation: sat, clarity },
      }, 600, 280);
    });
    return map;
  }, [themes]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {themes.map(t => (
        <button key={t.id} onClick={() => onSelect(t.id)}
          className={cn(
            'h-36 rounded-2xl border-[3px] transition-all relative overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:scale-[1.02]',
            currentThemeId === t.id ? 'border-black shadow-lg scale-[1.02]' : 'border-transparent hover:border-gray-300'
          )}>

          {/* ART_CanvasHash generated base */}
          <img
            src={canvasBgs[t.id]}
            alt={t.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          />

          {/* Theme color overlay — sits on top of canvas art to establish color identity */}
          <div
            className="absolute inset-0 opacity-55"
            style={{
              background: t.customStyle?.background ||
                (t.bgClass.match(/#[0-9a-fA-F]{3,8}/)?.[0] ?? '#111111'),
            }}
          />

          {/* Glassmorphic mini UI preview */}
          <div className="absolute inset-0 flex flex-col justify-center px-4 gap-2 z-10">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full shadow-lg" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }} />
              <div className="h-1.5 w-12 rounded-full" style={{ background: t.textColor, opacity: 0.7 }} />
            </div>
            {[0.9, 0.55].map((op, i) => (
              <div key={i}
                className="w-full h-5 rounded-lg flex items-center px-2 gap-1.5"
                style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, opacity: op }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.textColor }} />
                <div className="h-0.5 rounded-full flex-1" style={{ background: t.textColor, opacity: 0.5 }} />
              </div>
            ))}
          </div>

          {/* Bottom fade + Label */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-20 pointer-events-none" />
          <span className="absolute bottom-2.5 left-2.5 z-30 px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase shadow-xl"
            style={{ background: t.cardBg, color: t.textColor, border: `1px solid ${t.cardBorder}`, backdropFilter: 'blur(8px)' }}>
            {t.name}
          </span>

          {currentThemeId === t.id && (
            <div className="absolute top-2.5 right-2.5 z-30 w-6 h-6 rounded-full flex items-center justify-center shadow-xl"
              style={{ background: t.textColor }}>
              <span style={{ color: '#000', display: 'flex' }}>
                <Check className="w-3.5 h-3.5" />
              </span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}


export default function LinkVault() {
  const { profile, updateProfile, shareableItems, addShareableItem, updateShareableItem, removeShareableItem, reorderShareableItems } = useProfile();
  const [activeTab, setActiveTab] = useState<'links' | 'appearance' | 'profile'>('links');
  const [themeCat, setThemeCat] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'links' | 'studio'>('links');
  const [copied, setCopied] = useState(false);

  const links = shareableItems.filter(i => i.type === 'external_link').sort((a, b) => a.sortOrder - b.sortOrder);
  const contents = shareableItems.filter(i => i.type !== 'external_link').sort((a, b) => a.sortOrder - b.sortOrder);
  const cardStyle = profile.cardStyle || 'glass';

  const currentTheme = Object.values(THEMES).flat().find(t => t.id === profile.theme) || THEMES.obsidian[0];

  const getPlatformIcon = (url: string = '', fallbackClass = 'w-5 h-5') => {
    const lg = url.toLowerCase();
    if (lg.includes('spotify.com')) return <Spotify className={`${fallbackClass} text-green-500`} />;
    if (lg.includes('apple.com')) return <AppleMusic className={`${fallbackClass} text-red-500`} />;
    if (lg.includes('soundcloud.com')) return <SoundCloud className={`${fallbackClass} text-orange-500`} />;
    if (lg.includes('instagram.com')) return <Instagram className={`${fallbackClass} text-pink-500`} />;
    if (lg.includes('twitter.com') || lg.includes('x.com')) return <Twitter className={`${fallbackClass} text-blue-500`} />;
    if (lg.includes('youtube.com')) return <Youtube className={`${fallbackClass} text-red-500`} />;
    if (lg.includes('shopify.com') || lg.includes('bigcartel.com') || lg.includes('shop') || lg.includes('store')) return <ShoppingCart className={`${fallbackClass} text-amber-400`} />;
    return <Globe className={fallbackClass} />;
  };

  const tabs = [
    { id: 'links', icon: List, label: 'Links & Content' },
    { id: 'appearance', icon: Palette, label: 'Appearance' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(`https://vektr.studio/${profile.slug || profile.displayName.replace(/\s+/g,'-').toLowerCase()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto h-full">
    <div className="flex flex-col lg:flex-row gap-8 p-6 lg:p-8 pb-24 md:pb-8 min-h-full">
      {/* Editor */}
      <div className="flex-1 bg-white rounded-3xl border border-line shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-8 border-b border-line flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-bold">Link Vault</h2>
            <p className="text-sm text-muted">Build your professional dual-page Link-in-Bio system.</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-xl border border-line hover:bg-gray-50 cursor-pointer"><Share2 className="w-5 h-5" /></button>
            <button onClick={handleCopyShareLink}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-zinc-800 cursor-pointer transition-all active:scale-95 shadow-xl shadow-black/10">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied URL!' : 'Copy Share Link'}
            </button>
          </div>
        </div>

        <div className="p-2 bg-gray-50/50 flex gap-1 border-b border-line shrink-0">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer',
                activeTab === tab.id ? 'bg-white shadow-sm text-black border border-line shadow-[0_2px_4px_rgba(0,0,0,0.02)]' : 'text-muted hover:text-black')}>
              <tab.icon className="w-4 h-4" />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'links' && (
              <motion.div key="links" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex gap-2 w-full">
                  <button onClick={() => addShareableItem({ type: 'external_link', title: 'New Link', url: 'https://', isVisible: true, sortOrder: links.length })}
                    className="flex-1 py-4 border-2 border-dashed border-line rounded-2xl text-muted font-bold hover:border-black hover:text-black transition-all flex items-center justify-center gap-2 cursor-pointer bg-gray-50/50 hover:bg-white group">
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />Add Standard Link
                  </button>
                  <button onClick={() => {
                     const text = links.filter(l => l.isVisible).map(l => `${l.title}: ${l.url}`).join('\n\n');
                     navigator.clipboard.writeText(`My Links:\n\n${text}`);
                     setCopied(true);
                     setTimeout(() => setCopied(false), 2000);
                  }}
                    className="px-6 py-4 border-2 border-line rounded-2xl text-black font-bold hover:bg-black hover:text-white transition-all flex flex-col items-center justify-center gap-1 cursor-pointer shadow-sm group">
                    <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] uppercase tracking-widest hidden md:block">Batch Copy</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {[...links, ...contents].sort((a, b) => a.sortOrder - b.sortOrder).map((link, idx) => (
                    <div key={link.id} draggable
                      onDragStart={e => { e.dataTransfer.setData('idx', String(idx)); }}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.preventDefault(); const from = parseInt(e.dataTransfer.getData('idx')); if (from !== idx) { const r = [...shareableItems].sort((a, b) => a.sortOrder - b.sortOrder); const [d] = r.splice(from, 1); r.splice(idx, 0, d); reorderShareableItems(r); }}}
                      className="p-4 rounded-2xl border border-line bg-white hover:border-black transition-all flex items-center gap-4 group shadow-sm hover:shadow-md">
                      <div className="cursor-grab p-2 -ml-2 text-muted hover:text-black"><GripVertical className="w-4 h-4" /></div>
                      
                      {/* Icon based on Type */}
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-muted shrink-0">
                        {link.type === 'external_link' ? getPlatformIcon(link.url || '') :
                         link.type === 'track' ? <Music className="w-5 h-5 text-blue-500" /> :
                         link.type === 'visual' ? <Video className="w-5 h-5 text-purple-500" /> :
                         link.type === 'audio' ? <Zap className="w-5 h-5 text-amber-500" /> :
                         <Quote className="w-5 h-5 text-fuchsia-500" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <input disabled={link.type !== 'external_link'} value={link.title} onChange={e => updateShareableItem(link.id, { title: e.target.value })} className="font-bold text-sm bg-transparent outline-none w-full truncate placeholder:text-muted disabled:opacity-80" placeholder="Link Title" />
                        <input disabled={link.type !== 'external_link'} value={link.url || link.subtitle || ''} onChange={e => updateShareableItem(link.id, { url: e.target.value })} className="text-xs text-muted bg-transparent outline-none w-full truncate placeholder:text-gray-300 disabled:opacity-60" placeholder="https://" />
                      </div>
                      
                      <div className="px-3 py-1 bg-gray-100 text-[9px] font-bold uppercase tracking-widest text-muted rounded-md shrink-0">
                        {link.type === 'external_link' ? 'Link' : 'Studio'}
                      </div>

                      <div onClick={() => updateShareableItem(link.id, { isVisible: !link.isVisible })}
                        className={cn('w-10 h-5 rounded-full relative cursor-pointer transition-colors shadow-inner shrink-0', link.isVisible ? 'bg-black' : 'bg-gray-200')}>
                        <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm', link.isVisible ? 'right-0.5' : 'left-0.5')} />
                      </div>
                      <button onClick={() => removeShareableItem(link.id)} className="p-2 text-muted hover:text-red-500 cursor-pointer bg-red-50 hover:bg-red-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div key="appearance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <AnimatePresence mode="wait">
                  {!themeCat ? (
                    <motion.div key="cats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {THEME_CATEGORIES.map(cat => (
                        <button key={cat.id} onClick={() => setThemeCat(cat.id)}
                          className="p-6 rounded-2xl border border-line bg-white hover:border-black hover:shadow-lg transition-all text-left flex flex-col cursor-pointer group">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-white transition-colors">
                            <Palette className="w-6 h-6" />
                          </div>
                          <h4 className="font-bold text-lg mb-1 tracking-tight">{cat.name}</h4>
                          <p className="text-xs text-muted leading-relaxed">{cat.description}</p>
                        </button>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div key="themes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                      <button onClick={() => setThemeCat(null)} className="flex items-center gap-2 text-xs font-bold text-muted hover:text-black cursor-pointer bg-gray-50 px-4 py-2 rounded-xl w-fit">
                        <ChevronLeft className="w-4 h-4" />Back to Categories
                      </button>
                      <ThemeSwatchGrid themes={THEMES[themeCat] || []} currentThemeId={currentTheme.id} onSelect={(id) => updateProfile({ theme: id })} />
                      
                      {currentTheme.isCustom && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-6 bg-gray-50 rounded-2xl border border-line space-y-4 relative overflow-hidden group">
                           <h4 className="font-bold text-sm tracking-widest uppercase flex items-center gap-2"><Palette className="w-4 h-4"/> Sovereign Custom Engine</h4>
                           <div className="grid grid-cols-2 gap-4 relative z-10">
                             <div className="flex flex-col gap-1">
                               <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Global BG</label>
                               <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-line">
                                 <input type="color" value={profile.customThemeConfig?.bg || '#000000'} onChange={(e) => updateProfile({customThemeConfig: {...(profile.customThemeConfig||{bg:'#000000',text:'#ffffff',cardBg:'rgba(255,255,255,0.05)',border:'rgba(255,255,255,0.1)'}), bg: e.target.value}})} className="w-8 h-8 rounded shrink-0 cursor-pointer appearance-none bg-transparent" />
                                 <input type="text" value={profile.customThemeConfig?.bg || '#000000'} onChange={(e) => updateProfile({customThemeConfig: {...(profile.customThemeConfig||{bg:'#000000',text:'#ffffff',cardBg:'rgba(255,255,255,0.05)',border:'rgba(255,255,255,0.1)'}), bg: e.target.value}})} className="w-full bg-transparent text-xs font-mono outline-none" />
                               </div>
                             </div>
                             
                             <div className="flex flex-col gap-1">
                               <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Text Hex</label>
                               <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-line">
                                 <input type="color" value={profile.customThemeConfig?.text || '#ffffff'} onChange={(e) => updateProfile({customThemeConfig: {...(profile.customThemeConfig||{bg:'#000000',text:'#ffffff',cardBg:'rgba(255,255,255,0.05)',border:'rgba(255,255,255,0.1)'}), text: e.target.value}})} className="w-8 h-8 rounded shrink-0 cursor-pointer appearance-none bg-transparent" />
                                 <input type="text" value={profile.customThemeConfig?.text || '#ffffff'} onChange={(e) => updateProfile({customThemeConfig: {...(profile.customThemeConfig||{bg:'#000000',text:'#ffffff',cardBg:'rgba(255,255,255,0.05)',border:'rgba(255,255,255,0.1)'}), text: e.target.value}})} className="w-full bg-transparent text-xs font-mono outline-none" />
                               </div>
                             </div>

                             <div className="flex flex-col gap-1 col-span-2">
                               <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Card Face (RGBA/Hex)</label>
                               <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-line">
                                 <input type="text" value={profile.customThemeConfig?.cardBg || 'rgba(255,255,255,0.05)'} onChange={(e) => updateProfile({customThemeConfig: {...(profile.customThemeConfig||{bg:'#000000',text:'#ffffff',cardBg:'rgba(255,255,255,0.05)',border:'rgba(255,255,255,0.1)'}), cardBg: e.target.value}})} className="w-full bg-transparent text-xs font-mono outline-none px-2 py-1" />
                               </div>
                             </div>

                             <div className="flex flex-col gap-1 col-span-2">
                               <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Card Border</label>
                               <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-line">
                                 <input type="text" value={profile.customThemeConfig?.border || 'rgba(255,255,255,0.1)'} onChange={(e) => updateProfile({customThemeConfig: {...(profile.customThemeConfig||{bg:'#000000',text:'#ffffff',cardBg:'rgba(255,255,255,0.05)',border:'rgba(255,255,255,0.1)'}), border: e.target.value}})} className="w-full bg-transparent text-xs font-mono outline-none px-2 py-1" />
                               </div>
                             </div>
                           </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-2xl border border-line">
                  <img src={profile.avatarUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl" />
                  <div>
                    <button className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold shadow-lg hover:scale-105 transition-transform cursor-pointer">Change Avatar</button>
                    <p className="text-[10px] text-muted mt-2 font-bold uppercase tracking-widest">JPG, PNG, GIF Max 5MB</p>
                  </div>
                </div>
                <div className="space-y-6 bg-white p-6 rounded-2xl border border-line">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Artist / Display Name</label>
                    <input value={profile.displayName} onChange={e => updateProfile({ displayName: e.target.value })}
                      className="w-full p-4 rounded-xl border border-line focus:border-black outline-none font-bold text-lg bg-gray-50 focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted mb-2 block">Artist Bio</label>
                    <textarea rows={4} value={profile.bio} onChange={e => updateProfile({ bio: e.target.value })}
                      className="w-full p-4 rounded-xl border border-line focus:border-black outline-none font-medium resize-none bg-gray-50 focus:bg-white transition-all leading-relaxed" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Preview Phone */}
      <div className="hidden lg:flex w-[400px] flex-col items-center justify-center p-8 bg-gray-50 rounded-3xl border border-line sticky top-8 h-full">
        <div className="w-[320px] h-[650px] bg-black rounded-[3rem] p-3 shadow-2xl border-[4px] border-gray-800 relative overflow-hidden group">
          
          <div className={cn('w-full h-full rounded-[2.2rem] relative overflow-hidden flex flex-col transition-colors duration-700', currentTheme.bgClass)} style={currentTheme.isCustom ? { background: profile.customThemeConfig?.bg || '#000000', ...currentTheme.customStyle } : currentTheme.customStyle}>
            {/* Dynamic Abstract Overlay (E.g. grain or gradients) */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
            
            <div className="flex-1 overflow-y-auto relative z-10 scrollbar-hide pb-20">
              <div className="px-6 pt-16 flex flex-col items-center text-center">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-24 h-24 rounded-full p-1 shadow-2xl mb-6 border border-white/20 backdrop-blur-md"
                  style={{ background: currentTheme.isCustom ? profile.customThemeConfig?.cardBg : currentTheme.cardBg }}
                >
                  <img src={profile.avatarUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                </motion.div>
                
                <h1 className="text-xl font-black mb-2 tracking-tight drop-shadow-md" style={{ color: currentTheme.isCustom ? profile.customThemeConfig?.text : currentTheme.textColor, ...(currentTheme.customStyle || {}) }}>
                  {profile.displayName || 'Set Display Name'}
                </h1>
                <p className="text-sm mb-6 leading-relaxed max-w-[240px] drop-shadow-sm font-medium" style={{ color: currentTheme.isCustom ? profile.customThemeConfig?.text : currentTheme.textColor, opacity: 0.8 }}>
                  {profile.bio || 'Write a short bio...'}
                </p>

                {/* Dual Page Toggle */}
                <div className="flex bg-black/20 backdrop-blur-md rounded-xl p-1 mb-6 border border-white/10 w-full max-w-[200px]">
                  <button onClick={() => setPreviewTab('links')}
                    className={cn('flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer', previewTab === 'links' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white')}>Links</button>
                  <button onClick={() => setPreviewTab('studio')}
                    className={cn('flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer', previewTab === 'studio' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white')}>Studio</button>
                </div>
                
                <div className="w-full space-y-4 px-2 pb-12">
                  <AnimatePresence mode="popLayout">
                    {(previewTab === 'links' ? links : contents).filter(l => l.isVisible).map((link, i) => (
                      <motion.a 
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        key={link.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                          "w-full relative flex items-center p-4 group/link transition-all hover:scale-[1.02] cursor-default overflow-hidden",
                          (link.url?.includes('shop') || link.url?.includes('store')) ? "ring-2 ring-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.2)] animate-pulse hover:animate-none" : "",
                          profile.cardStyle === 'solid' ? "rounded-2xl shadow-md" : 
                          profile.cardStyle === 'brutalist' ? "rounded-none border-[3px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : 
                          profile.cardStyle === 'outline' ? "rounded-2xl bg-transparent border-2 shadow-none" : 
                          "rounded-2xl backdrop-blur-xl shadow-lg" // default glass
                        )}
                        style={{ 
                          background: profile.cardStyle === 'outline' ? 'transparent' : (currentTheme.isCustom ? profile.customThemeConfig?.cardBg || 'rgba(255,255,255,0.05)' : currentTheme.cardBg), 
                          borderColor: profile.cardStyle === 'brutalist' ? (currentTheme.isCustom ? profile.customThemeConfig?.text : currentTheme.textColor) : (currentTheme.isCustom ? profile.customThemeConfig?.border || 'rgba(255,255,255,0.1)' : currentTheme.cardBorder),
                          borderWidth: profile.cardStyle === 'outline' || profile.cardStyle === 'brutalist' ? '3px' : '1px',
                          color: currentTheme.isCustom ? profile.customThemeConfig?.text || '#ffffff' : currentTheme.textColor,
                          ...(profile.cardStyle === 'brutalist' ? { boxShadow: `4px 4px 0px 0px ${currentTheme.isCustom ? profile.customThemeConfig?.text : currentTheme.textColor}` } : {}),
                          ...(currentTheme.customStyle || {})
                        }}
                      >
                        {(link.url?.includes('shop') || link.url?.includes('store')) && (
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-transparent pointer-events-none" />
                        )}
                        {previewTab === 'links' ? getPlatformIcon(link.url || '', "w-5 h-5 absolute left-4 opacity-70") : 
                          link.type === 'track' ? <Music className="w-5 h-5 absolute left-4 opacity-70 text-blue-400" /> :
                          link.type === 'visual' ? <Video className="w-5 h-5 absolute left-4 opacity-70 text-purple-400" /> :
                          link.type === 'audio' ? <Zap className="w-5 h-5 absolute left-4 opacity-70 text-amber-400" /> :
                          <Quote className="w-5 h-5 absolute left-4 opacity-70 text-fuchsia-400" />
                        }
                        
                        <div className="flex-1 flex flex-col justify-center pl-8 text-left">
                          <span className="text-sm font-bold tracking-tight truncate w-40">
                            {link.title || 'Untitled'}
                          </span>
                          {previewTab === 'studio' && link.subtitle && (
                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-60 truncate w-40">
                              {link.subtitle}
                            </span>
                          )}
                        </div>
                      </motion.a>
                    ))}
                    
                    {(previewTab === 'links' ? links : contents).filter(l => l.isVisible).length === 0 && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center text-xs uppercase tracking-widest font-bold opacity-40" style={{ color: currentTheme.textColor }}>
                         Nothing Shared Yet
                       </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            
            {/* Watermark */}
            <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
               <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center justify-center gap-1" style={{ color: currentTheme.textColor }}>
                 <Zap className="w-3 h-3" /> VEKTR Studio
               </span>
            </div>
          </div>
          
          {/* Dynamic Island Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-20" />
        </div>
      </div>
    </div>
    </div>
  );
}
