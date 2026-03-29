import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ShareableItem, PublicProfile, MediaItem, LyricBook } from '../types';
import { saveAudioFile, getAudioFile, deleteAudioFile, SyncEngine } from './storage';
import { useOmniRack, DEFAULT_RACK_PARAMS, type OmniRackParams } from './useOmniRack';
import { ART_CanvasHash } from '../components/Modules/modules/graphics/ART_CanvasHasher';

interface ProfileContextType {
  // Profile & Socials
  profile: PublicProfile;
  updateProfile: (updates: Partial<PublicProfile>) => void;
  
  // Shareable LinkVault / Bio Stack
  shareableItems: ShareableItem[];
  addShareableItem: (item: Omit<ShareableItem, 'id' | 'ownerId' | 'createdAt'>) => void;
  updateShareableItem: (id: string, updates: Partial<ShareableItem>) => void;
  removeShareableItem: (id: string) => void;
  reorderShareableItems: (items: ShareableItem[]) => void;

  // Media Vault: The Sovereign Repository
  activeMediaId: string | null;
  setActiveMediaId: (id: string | null) => void;
  
  vault: MediaItem[];
  addMedia: (item: Omit<MediaItem, 'id' | 'createdAt'>) => void;
  uploadMedia: (file: File, category?: MediaItem['category']) => Promise<void>;
  updateMedia: (id: string, updates: Partial<MediaItem>) => void;
  deleteMedia: (id: string) => void;

  lyricBooks: LyricBook[];
  saveLyricBook: (lyricBook: LyricBook) => void;

  // Backward Compatibility (Legacy Handlers)
  tracks: MediaItem[];
  addTrack: (item: any) => void;
  uploadTrack: (file: File) => Promise<void>;
  updateTrack: (id: string, updates: any) => void;
  deleteTrack: (id: string) => void;
  activeTrackId: string | null;
  setActiveTrackId: (id: string | null) => void;

  // Global Audio Engine & DSP
  globalAudioRef: React.RefObject<HTMLAudioElement | null>;
  globalAnalyserRef: React.RefObject<AnalyserNode | null>;
  isPlaying: boolean;
  togglePlay: () => void;
  rackParams: OmniRackParams;
  updateRackParams: (updates: Partial<OmniRackParams>) => void;
}

const defaultProfile: PublicProfile = {
  ownerId: 'new-identity',
  displayName: '',
  bio: 'Creating sounds and visuals.',
  avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=200',
  theme: 'obs-1',
  ambientMode: 'flow',
  cardStyle: 'solid',
  font: 'font-sans',
  slug: '',
  socials: [],
  initialized: false
};

const defaultItems: ShareableItem[] = [];
const defaultVault: MediaItem[] = [];
const defaultLyricBooks: LyricBook[] = [];

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<PublicProfile>(() => SyncEngine.load('', defaultProfile));
  const [shareableItems, setShareableItems] = useState<ShareableItem[]>(() => SyncEngine.load('_items', defaultItems));
  const [vault, setVault] = useState<MediaItem[]>([]);
  const [activeMediaId, setActiveMediaId] = useState<string | null>(null);

  // Mount Effect: Rehydrate Sovereign Vault Blobs from IndexedDB & Migration
  useEffect(() => {
    const initVault = async () => {
      let parsed = SyncEngine.load('_vault', defaultVault);
      
      // LEGACY MIGRATION: Check for old _tracks key from previous session
      const legacyTracks = SyncEngine.load('_tracks', []);
      if (legacyTracks.length > 0) {
        const migrated: MediaItem[] = legacyTracks.map((t: any) => ({
          id: t.id,
          title: t.title,
          artist: t.artist || profile.displayName || 'Vektr Artist',
          type: 'audio',
          category: t.category || 'Single',
          duration: 0,
          fileUrl: t.audioUrl,
          thumbnailUrl: t.coverUrl || t.thumbnailUrl,
          createdAt: t.createdAt || Date.now()
        }));
        parsed = [...migrated, ...parsed];
        SyncEngine.save('_tracks', []); // Clear legacy store
      }

      if (!parsed || parsed.length === 0) return;
      
      try {
        const hydrated = await Promise.all(parsed.map(async t => {
          const blob = await getAudioFile(t.id);
          if (blob) return { ...t, fileUrl: URL.createObjectURL(blob) };
          return t;
        }));
        setVault(hydrated);
      } catch { }
    };
    initVault();
  }, []);
  
  const [lyricBooks, setLyricBooks] = useState<LyricBook[]>(() => SyncEngine.load('_lyrics', defaultLyricBooks));
  const [rackParams, setRackParams] = useState<OmniRackParams>(() => SyncEngine.load('_dsp', DEFAULT_RACK_PARAMS));

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const { analyserRef, ctxRef } = useOmniRack(audioRef, rackParams, isPlaying);

  // Autonomous Injection: Auto-buffer & play globally when active track shifts
  useEffect(() => {
    const item = vault.find(t => t.id === activeMediaId);
    if (!item || !item.fileUrl || item.type !== 'audio') return;

    if (audioRef.current && audioRef.current.src !== item.fileUrl) {
      audioRef.current.src = item.fileUrl;
      audioRef.current.load();
      // Resume context if possibly suspended by autoplay policies
      if (ctxRef.current?.state === 'suspended') {
        ctxRef.current.resume();
      }
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [activeMediaId, vault]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    
    // CRUCIAL: Resume AudioContext upon direct user interaction to unlock DSP pipeline
    if (ctxRef.current && ctxRef.current.state === 'suspended') {
      await ctxRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  // Persistence Effects (Abstracted via SyncEngine)
  useEffect(() => { SyncEngine.save('', profile); }, [profile]);
  useEffect(() => { SyncEngine.save('_items', shareableItems); }, [shareableItems]);
  useEffect(() => { SyncEngine.save('_vault', vault); }, [vault]);
  useEffect(() => { SyncEngine.save('_lyrics', lyricBooks); }, [lyricBooks]);
  useEffect(() => { SyncEngine.save('_dsp', rackParams); }, [rackParams]);

  const updateProfile = (updates: Partial<PublicProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const updateRackParams = (updates: Partial<OmniRackParams>) => {
    setRackParams(prev => ({ ...prev, ...updates }));
  };

  const addShareableItem = (item: Omit<ShareableItem, 'id' | 'ownerId' | 'createdAt'>) => {
    const newItem: ShareableItem = {
      ...item,
      id: `item-${Date.now()}`,
      ownerId: profile.ownerId,
      createdAt: Date.now(),
    };
    setShareableItems(prev => [newItem, ...prev].map((it, idx) => ({ ...it, sortOrder: idx })));
  };

  const updateShareableItem = (id: string, updates: Partial<ShareableItem>) => {
    setShareableItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeShareableItem = (id: string) => {
    setShareableItems(prev => prev.filter(item => item.id !== id));
  };

  const reorderShareableItems = (items: ShareableItem[]) => {
    setShareableItems(items.map((item, idx) => ({ ...item, sortOrder: idx })));
  };

  const addMedia = (itemData: Omit<MediaItem, 'id' | 'createdAt'>) => {
    const newItem: MediaItem = {
      ...itemData,
      id: `media-${Date.now()}`,
      createdAt: Date.now()
    };
    setVault(prev => [newItem, ...prev]);
    if (newItem.type === 'audio') setActiveMediaId(newItem.id);
  };

  const uploadMedia = async (file: File, category?: MediaItem['category']) => {
    const id = `media-${Date.now()}`;
    const title = file.name.replace(/\.[^/.]+$/, "");
    await saveAudioFile(id, file); // Save raw binary offline (generic storage)
    
    let type: MediaItem['type'] = 'other';
    let autoCategory: MediaItem['category'] = category || 'Single';

    if (file.type.startsWith('audio/')) { type = 'audio'; }
    else if (file.type.startsWith('video/')) { type = 'video'; autoCategory = category || 'Videos'; }
    else if (file.type.startsWith('image/')) { type = 'image'; autoCategory = category || 'Photos'; }

    const thumbnailUrl = ART_CanvasHash({
       profileId: profile.ownerId,
       username: profile.displayName || 'VEKTR',
       trackTitle: title,
       lyrics: '',
       mastering: { saturation: rackParams.saturation, clarity: 50 },
       logoUrl: profile.avatarUrl
    });
    
    const newItem: MediaItem = {
      id,
      title,
      artist: profile.displayName || 'Vektr Elite',
      type,
      category: autoCategory,
      duration: 0,
      fileUrl: URL.createObjectURL(file),
      thumbnailUrl,
      createdAt: Date.now()
    };
    setVault(prev => [newItem, ...prev]);
    if (type === 'audio') setActiveMediaId(id);
  };

  const updateMedia = (id: string, updates: Partial<MediaItem>) => {
    setVault(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteMedia = async (id: string) => {
    setVault(prev => prev.filter(t => t.id !== id));
    if (activeMediaId === id) setActiveMediaId(null);
    await deleteAudioFile(id);
  };

  const saveLyricBook = (updatedBook: LyricBook) => {
    setLyricBooks(prev => {
      const exists = prev.find(b => b.trackId === updatedBook.trackId);
      if (exists) {
        return prev.map(b => b.trackId === updatedBook.trackId ? updatedBook : b);
      }
      return [...prev, updatedBook];
    });
  };

  return (
    <ProfileContext.Provider value={{
      profile, updateProfile,
      shareableItems, addShareableItem, updateShareableItem, removeShareableItem, reorderShareableItems,
      activeMediaId, setActiveMediaId,
      vault, addMedia, uploadMedia, updateMedia, deleteMedia,
      // Backward compatibility aliases
      tracks: vault,
      addTrack: addMedia as any,
      uploadTrack: uploadMedia as any,
      updateTrack: updateMedia as any,
      deleteTrack: deleteMedia as any,
      activeTrackId: activeMediaId,
      setActiveTrackId: setActiveMediaId,
      lyricBooks, saveLyricBook,
      globalAudioRef: audioRef, globalAnalyserRef: analyserRef, isPlaying, togglePlay,
      rackParams, updateRackParams
    }}>
      <audio 
        ref={audioRef}  
        onEnded={() => setIsPlaying(false)} 
        onPause={() => setIsPlaying(false)} 
        onPlay={() => setIsPlaying(true)} 
        className="hidden" 
      />
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
