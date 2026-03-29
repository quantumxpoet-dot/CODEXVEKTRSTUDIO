import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Plus, Music, ChevronRight, Quote, Star } from '../lib/icons';
import { cn } from '../lib/utils';
import { useProfile } from '../lib/ProfileContext';

export default function LyricBook() {
  const { tracks, lyricBooks, activeTrackId, setActiveTrackId, saveLyricBook, addShareableItem } = useProfile();

  const activeTrack = tracks.find(t => t.id === activeTrackId);

  // If no track is selected, default to a global "Scratchpad"
  const currentBook = lyricBooks.find(b => b.trackId === (activeTrackId || 'global')) || {
    id: `lyrics-${activeTrackId || 'global'}`,
    trackId: activeTrackId || 'global',
    title: activeTrack?.title || 'Global Scratchpad',
    content: '',
    updatedAt: Date.now()
  };

  const [selectedText, setSelectedText] = useState('');
  const [localContent, setLocalContent] = useState(currentBook.content || '');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Sync Content to Local State when track switches
  useEffect(() => {
    setLocalContent(currentBook.content || '');
  }, [activeTrackId, currentBook.content]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
    saveLyricBook({
      ...currentBook,
      content: e.target.value,
      updatedAt: Date.now()
    });
  };

  const handleTextSelection = () => {
    if (textAreaRef.current) {
      const s = textAreaRef.current.value.substring(textAreaRef.current.selectionStart, textAreaRef.current.selectionEnd);
      if (s.trim().length > 0) setSelectedText(s.trim());
    }
  };

  const handleAddQuote = () => {
    if (!selectedText) return;

    addShareableItem({
      type: 'lyric',
      title: `"${selectedText}"`,
      subtitle: `${activeTrack?.title || 'Track'} • Lyric Snippet`,
      sourceId: activeTrackId || 'global',
      isVisible: true,
      sortOrder: 0
    });
    setSelectedText('');
  };

  // Allow deselecting the active track to return to global scratchpad
  const toggleTrack = (id: string) => {
    if (activeTrackId === id) setActiveTrackId(null);
    else setActiveTrackId(id);
  };

  return (
    <div className="flex-1 overflow-y-auto h-full">
    <div className="flex flex-col lg:flex-row gap-8 h-full p-4 md:p-8 pb-24 md:pb-8">
      {/* Sidebar: Tracks Navigation */}
      <div className="w-full lg:w-80 flex flex-col space-y-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-line shadow-sm overflow-y-auto flex-1 max-h-[50dvh]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Music className="w-5 h-5" /> Link To Track
            </h2>
          </div>
          <div className="space-y-2">
            {tracks.length === 0 ? (
              <p className="text-xs text-muted p-4 text-center border border-dashed rounded-xl border-line">
                No tracks loaded. You are writing in the global scratchpad.
              </p>
            ) : tracks.map(track => (
              <button key={track.id} onClick={() => toggleTrack(track.id)}
                className={cn('w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between group cursor-pointer',
                  activeTrackId === track.id ? 'border-black bg-black text-white shadow-lg' : 'border-transparent hover:bg-gray-50')}>
                <div className="overflow-hidden">
                  <p className="font-bold text-sm truncate">{track.title}</p>
                </div>
                <ChevronRight className={cn('w-4 h-4 transition-transform shrink-0', activeTrackId === track.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100')} />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-2xl shrink-0">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Star className="w-4 h-4" />Pro Tip</h3>
          <p className="text-sm text-white/60 leading-relaxed mb-6">
            Highlight any lyrics in the editor to quickly extract an interactive quote directly to your Link Vault.
          </p>
        </div>
      </div>

      {/* Main Lyric Editor */}
      <div className="flex-1 bg-white rounded-[2.5rem] border border-line shadow-sm flex flex-col overflow-hidden relative">
        <header className="p-8 border-b border-line flex flex-col justify-center bg-gray-50/30 shrink-0">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted mb-1">
            <BookOpen className="w-3 h-3" /> Lyric Book / {activeTrackId ? 'Track Lyrics' : 'Global Scratchpad'}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {activeTrackId ? activeTrack?.title : 'Brain Dump'}
          </h1>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
          
          {/* Text Editor */}
          <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-white relative">
            <div className="max-w-2xl mx-auto h-full">
              <textarea
                ref={textAreaRef}
                onSelect={handleTextSelection}
                onChange={handleTextChange}
                value={localContent}
                className="w-full h-full min-h-[600px] text-xl font-serif italic leading-relaxed outline-none resize-none transition-all text-black/80"
                placeholder={activeTrackId ? "Type the lyrics for this track..." : "Write anything... A concept, a verse, or a full song..."}
              />
            </div>
          </div>

          {/* Right Panel: Tools */}
          <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-line p-6 space-y-8 bg-gray-50/30 overflow-y-auto">
            
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-4 flex items-center gap-2">
                <Quote className="w-3.5 h-3.5" />Extract Snippets
              </h3>
              <div className="p-4 rounded-2xl bg-white border border-line shadow-sm space-y-4">
                {selectedText ? (
                  <div className="p-3 bg-gray-50 rounded-xl border border-line">
                    <p className="text-sm font-serif italic text-black/80 line-clamp-3">"{selectedText}"</p>
                  </div>
                ) : (
                  <p className="text-[10px] text-muted leading-relaxed font-bold">Highlight text in the editor to extract it.</p>
                )}
                <button onClick={handleAddQuote} disabled={!selectedText}
                  className="w-full py-2.5 rounded-xl bg-black disabled:bg-gray-300 text-white text-[10px] uppercase font-bold tracking-widest hover:bg-zinc-800 cursor-pointer flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />Extract to Link Vault
                </button>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
