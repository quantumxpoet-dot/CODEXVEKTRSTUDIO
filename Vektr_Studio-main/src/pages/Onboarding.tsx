import React, { useState } from 'react';
import { useNavigate } from '../lib/router';
import { Music, ArrowRight, Zap, Shield, Globe } from '../lib/icons';
import { motion, AnimatePresence } from 'motion/react';
import { useProfile } from '../lib/ProfileContext';
import { cn } from '../lib/utils';

export default function Onboarding() {
  const { updateProfile } = useProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  const finishOnboarding = () => {
    if (!name) return;
    
    // GENERATE SOVEREIGN IDENTITY
    const randomHex = Array.from({length: 8}, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
    const identityId = `VEKTR-${randomHex}`;
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    updateProfile({
      ownerId: identityId,
      displayName: name,
      bio: bio || 'Sovereign Artist / Creator',
      slug,
      initialized: true,
      socials: [
        { id: 'ig', url: '', active: false },
        { id: 'tw', url: '', active: false },
        { id: 'yt', url: '', active: false }
      ]
    });

    navigate('/');
  };

  return (
    <div className="fixed inset-0 bg-[#000510] text-white z-[9999] flex items-center justify-center p-6 font-['Outfit']">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-xl w-full relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12 text-center"
            >
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-white/10 mb-8">
                  <Music className="w-10 h-10 text-black" />
                </div>
                <h1 className="text-5xl font-black tracking-tighter italic">VEKTR STUDIO</h1>
                <p className="mt-4 text-white/50 text-base uppercase tracking-[0.2em] font-bold">The Sovereign Standard</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: Shield, label: 'Un-forgeable', sub: 'Non-Random' },
                  { icon: Zap, label: 'Deterministic', sub: 'Logic-Driven' },
                  { icon: Globe, label: 'Sovereign', sub: 'Local-First' },
                ].map(item => (
                  <div key={item.label} className="p-6 rounded-3xl bg-white/5 border border-white/10">
                    <item.icon className="w-6 h-6 mx-auto mb-4 text-blue-400" />
                    <h3 className="text-sm font-bold">{item.label}</h3>
                    <p className="text-[10px] opacity-40 mt-1 uppercase font-bold tracking-widest">{item.sub}</p>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full py-5 bg-white text-black rounded-3xl text-lg font-black uppercase flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-white/5 cursor-pointer"
              >
                Establish Identity <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Set your Artist name</h2>
                <p className="text-white/40 text-sm">This is the unique seed for your Proof-of-Creation visuals.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Display Name</label>
                  <input 
                    autoFocus
                    placeholder="E.g. NOISE KILLER"
                    value={name}
                    onChange={(e) => setName(e.target.value.toUpperCase())}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-xl font-bold outline-none focus:border-white/40 transition-all"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Artist Bio (Public)</label>
                  <textarea 
                    placeholder="Tell your story..."
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-base outline-none focus:border-white/40 transition-all resize-none"
                  />
                </div>
              </div>

              <button 
                onClick={finishOnboarding}
                disabled={!name}
                className={cn(
                  "w-full py-5 rounded-3xl text-lg font-black uppercase flex items-center justify-center gap-3 transition-all cursor-pointer",
                  name ? "bg-white text-black shadow-xl" : "bg-white/10 text-white/30"
                )}
              >
                Manifest Studio <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
