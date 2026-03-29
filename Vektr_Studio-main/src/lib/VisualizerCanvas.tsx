import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { AudioAnalyzerData } from './useAudioAnalyzer';

export interface SessionContext {
  profileId: string;
  username: string;
  trackTitle: string;
  lyrics: string;
  mastering: {
    saturation: number;
    clarity: number;
  };
  logoUrl?: string;
  syncLines?: Array<{text: string; startTime: number; endTime: number}>;
}

type VisualizerMode = 'Waveform' | 'Spectrum' | 'Particles' | 'Matrix' | 'Cosmic' | 'Glitch';
type VisualizerStyle = 'Minimal' | 'Glow' | 'VHS' | 'Retro' | 'Modern' | 'Abstract';

interface Props {
  mode: VisualizerMode;
  style: VisualizerStyle;
  audioData: AudioAnalyzerData;
  lyrics?: string;
  currentTime?: number;
  context?: SessionContext;
  showIntegrityGhost?: boolean;
  isDemo?: boolean;
  className?: string;
}

// Drastically enhanced high-fidelity CSS color themes
const STYLE_COLORS: Record<VisualizerStyle, { primary: string; secondary: string; bg: string }> = {
  Minimal:  { primary: '#ffffff', secondary: 'rgba(255,255,255,0.1)', bg: '#000000' },
  Glow:     { primary: '#00e5ff', secondary: 'rgba(0,229,255,0.05)',   bg: '#020617' },
  VHS:      { primary: '#ff00ff', secondary: 'rgba(255,0,255,0.1)',   bg: '#120012' },
  Retro:    { primary: '#ffaa00', secondary: 'rgba(255,170,0,0.1)',   bg: '#0a0500' },
  Modern:   { primary: '#3b82f6', secondary: 'rgba(59,130,246,0.1)', bg: '#000814' },
  Abstract: { primary: '#a855f7', secondary: 'rgba(168,85,247,0.05)', bg: '#0a000f' },
};

/**
 * Immaculate VisualizerCanvas (ART_EuclideanRenderer)
 */
export const VisualizerCanvas = forwardRef<HTMLCanvasElement, Props>((props, ref) => {
  const { mode, style, audioData, lyrics = '', currentTime = 0, context, showIntegrityGhost = false, isDemo = false, className } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const logoImgRef = useRef<HTMLImageElement | null>(null);

  useImperativeHandle(ref, () => canvasRef.current!);

  // Engine Physics States
  const wordsRef = useRef<Array<{text: string; x: number; y: number; z: number; vx: number; vy: number; vz: number;}>>([]);
  const shadowWordsRef = useRef<Array<{text: string; x: number; y: number; z: number; vx: number; vy: number; vz: number;}>>([]);
  
  const matrixDropsRef = useRef<number[]>([]);
  const starsRef = useRef<Array<{x: number; y: number; z: number; pz: number}>>([]);

  useEffect(() => {
    if (context?.logoUrl) {
       const img = new window.Image();
       img.src = context.logoUrl;
       img.onload = () => { logoImgRef.current = img; };
    } else {
       logoImgRef.current = null;
    }
  }, [context?.logoUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialization: Word Storm
    if (lyrics && (wordsRef.current.length === 0 || shadowWordsRef.current.length === 0)) {
      const tokens = lyrics.split(/\s+/).filter(t => t.length > 2);
      const initWords = (idSalt: string) => tokens.map((text) => {
        let seed = 0;
        const seedStr = text + idSalt;
        for (let j = 0; j < seedStr.length; j++) seed += seedStr.charCodeAt(j);
        return {
          text, x: (Math.sin(seed) * 800), y: (Math.cos(seed) * 600), z: (Math.sin(seed * 2) * 400),
          vx: Math.cos(seed) * 0.15, vy: Math.sin(seed) * 0.15, vz: Math.cos(seed * 1.5) * 0.08,
        };
      });
      wordsRef.current = initWords(context?.profileId || 'default');
      shadowWordsRef.current = initWords((context?.profileId || 'default') + '_TAMPERED');
    }

    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width = canvas.offsetWidth * 2; // Retina scaling for immaculation
      const h = canvas.height = canvas.offsetHeight * 2;
      const colors = STYLE_COLORS[style];
      const t = (timeRef.current += Math.max(0.005, audioData.amplitude * 0.05));
      const amp = isDemo ? Math.sin(t * 2) * 0.1 + 0.1 : audioData.amplitude;

      // Initialization: Matrix & Cosmic (Depend on retina canvas width `w`)
      if (matrixDropsRef.current.length === 0) {
         const cols = Math.floor(4000 / 20); // Overscan width
         for(let i=0; i<cols; i++) matrixDropsRef.current[i] = Math.random() * -100;
      }
      if (starsRef.current.length === 0) {
         for(let i=0; i<600; i++) {
            starsRef.current.push({ x: (Math.random() - 0.5) * 4000, y: (Math.random() - 0.5) * 4000, z: Math.random() * 2000, pz: 0 });
         }
      }

      // VISCERAL BASS IMPACT - CAMERA SHAKE (DO MORE THAN COMPETITION)
      ctx.save();
      const shakeIntensity = amp > 0.85 ? Math.pow(amp - 0.85, 2) * 200 : 0;
      if (shakeIntensity > 0 && mode !== 'Waveform' && mode !== 'Spectrum') {
        ctx.translate((Math.random() - 0.5) * shakeIntensity, (Math.random() - 0.5) * shakeIntensity);
      }

      // Base Clearing (Trails for specific modes)
      ctx.fillStyle = colors.bg;
      ctx.globalAlpha = (mode === 'Particles' || mode === 'Matrix') ? 0.2 : 1.0; 
      ctx.fillRect(-50, -50, w + 100, h + 100); 
      ctx.globalAlpha = 1.0;

      // Impeccable Background Glow
      const bgGrad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
      bgGrad.addColorStop(0, colors.secondary);
      bgGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(-50, -50, w+100, h+100);

      // CYBER GLITCH: Layer offset preprocessing
      if (mode === 'Glitch') {
        if (amp > 0.8 && Math.random() > 0.6) {
           ctx.translate((Math.random() - 0.5) * 100, 0); // Hardware tracking error
        }
      }

      // Monumental Identity Text (Background Architecture)
      const cx = w / 2;
      const cy = h / 2;
      if (context) {
        ctx.save();
        const backdropAmp = 1 + amp * 0.2;
        
        if (logoImgRef.current) {
           const img = logoImgRef.current;
           const targetW = 400 * backdropAmp;
           const targetH = (img.height / img.width) * targetW;
           ctx.shadowBlur = 40 * amp;
           ctx.shadowColor = colors.primary;
           ctx.globalAlpha = 0.6 + amp * 0.4;
           ctx.drawImage(img, cx - targetW/2, cy - targetH/2 - 50, targetW, targetH);
        } else {
           ctx.textAlign = 'center';
           ctx.textBaseline = 'middle';
           ctx.shadowBlur = 40 * amp;
           ctx.shadowColor = colors.primary;
           ctx.font = `bold ${w * 0.12 * backdropAmp}px "Outfit", sans-serif`;
           
           if (mode === 'Glitch' && audioData.treble > 0.6) {
              // RGB Split
              ctx.globalCompositeOperation = 'screen';
              ctx.fillStyle = 'rgba(255,0,0,0.3)'; ctx.fillText(context.username.toUpperCase(), w/2 - 10, h/2 - 50);
              ctx.fillStyle = 'rgba(0,0,255,0.3)'; ctx.fillText(context.username.toUpperCase(), w/2 + 10, h/2 - 50);
           }
           
           ctx.fillStyle = `rgba(255,255,255, ${0.03 + amp * 0.05})`;
           ctx.fillText(context.username.toUpperCase(), w / 2, h / 2 - 50);
        }
        ctx.restore();
      }

      // MODE A: PARTICLES & WORD-STORM
      if (mode === 'Particles') {
        const renderStorm = (arr: typeof wordsRef.current, isGhost: boolean) => {
          ctx.lineCap = 'round';
          const bassImpact = Math.pow(audioData.bass, 2) * 12; 
          const trebleAgitation = audioData.treble * 5;
          const midSwirl = audioData.mid * 2;
          
          arr.forEach((p, i) => {
            p.x += p.vx * (1 + bassImpact + trebleAgitation); 
            p.y += p.vy * (1 + bassImpact + trebleAgitation);
            p.z += p.vz * (1 + midSwirl);

            if (Math.abs(p.x) > 1500) p.vx *= -1;
            if (Math.abs(p.y) > 1500) p.vy *= -1;
            if (Math.abs(p.z) > 400) p.vz *= -1;

            const fov = 600 / (600 + p.z);
            const screenX = cx + p.x * fov;
            const screenY = cy + p.y * fov;
            
            // Euclidean Time-Constraint Logic:
            // If syncLines exists, we match the physical playback time.
            // Otherwise, we fallback to the probabilistic index-percentage highlight.
            let isCurrent = false;
            if (context?.syncLines && context.syncLines.length > 0) {
               const activeLine = context.syncLines.find(l => currentTime >= l.startTime && currentTime <= l.endTime);
               if (activeLine && p.text.toLowerCase().includes(activeLine.text.split(' ')[0].toLowerCase().substring(0, 3))) {
                  isCurrent = true; // Heuristic match for "active" word in the cloud
               }
            } else {
               isCurrent = Math.abs((i / arr.length) * 100 - (currentTime % 100)) < 1.0;
            }

            ctx.save();
            ctx.font = `${Math.floor(24 * fov * (isCurrent ? 3.5 : 1.2))}px "Outfit", sans-serif`;
            
            if (isGhost) { ctx.fillStyle = '#ef4444'; ctx.globalAlpha = 0.2 * fov; } 
            else { ctx.fillStyle = isCurrent ? '#ffffff' : colors.primary; ctx.globalAlpha = isCurrent ? 1 : 0.3 * fov; }

            if (isCurrent && !isGhost) {
              ctx.shadowBlur = 30 + bassImpact * 10;
              ctx.shadowColor = colors.primary;
              p.x *= (0.90 - bassImpact * 0.05); p.y *= (0.90 - bassImpact * 0.05);
              if (audioData.treble > 0.6) { ctx.fillStyle = i % 2 === 0 ? '#ff0055' : '#00ffff'; ctx.shadowColor = ctx.fillStyle; }
            }

            ctx.fillText(p.text, screenX, screenY);
            ctx.restore();
          });
        };
        if (showIntegrityGhost) renderStorm(shadowWordsRef.current, true);
        renderStorm(wordsRef.current, false);
      }

      // MODE B: WAVES / SPECTRUM
      if (mode === 'Waveform' || mode === 'Spectrum' || mode === 'Glitch') {
        const data = mode === 'Waveform' ? audioData.waveform : audioData.frequencies;
        ctx.save();
        ctx.beginPath();
        ctx.lineJoin = 'round';
        ctx.lineWidth = 4 + amp * 6;
        ctx.strokeStyle = colors.primary;
        ctx.shadowBlur = 20;
        ctx.shadowColor = colors.primary;

        const sliceW = w / (data.length || 1);
        let x = 0;
        
        if (mode === 'Spectrum') {
          const bars = data.length / 2;
          const radius = w * 0.15 + Math.pow(amp, 2) * 100;
          for(let i = 0; i < bars; i++) {
            const v = data[i] / 255;
            const barH = v * h * 0.3;
            const rads = Math.PI * 2 * (i / bars) + t;
            ctx.moveTo(cx + Math.cos(rads) * radius, cy + Math.sin(rads) * radius);
            ctx.lineTo(cx + Math.cos(rads) * (radius + barH), cy + Math.sin(rads) * (radius + barH));
          }
        } else {
          data.forEach((v, i) => {
            const y = (mode === 'Glitch' && audioData.treble > 0.8 && Math.random()>0.8) 
                ? cy + (Math.random()-0.5)*400 
                : cy + (v / 255 - 0.5) * h * 0.6;
            if (i === 0) ctx.moveTo(x, y); 
            else ctx.bezierCurveTo(x - sliceW/2, y, x - sliceW/2, y, x, y);
            x += sliceW;
          });
        }
        ctx.stroke();
        ctx.restore();
      }

      // MODE C: MATRIX CODE RAIN
      if (mode === 'Matrix') {
         ctx.save();
         ctx.textAlign = 'center';
         const fallSpeed = 5 + (Math.pow(audioData.treble, 2) * 30); // Accelerated by hi-hats
         const matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
         ctx.font = `bold ${w > 1000 ? 20 : 12}px monospace`;
         
         for(let i=0; i < matrixDropsRef.current.length; i++) {
             const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
             const locX = i * (w > 1000 ? 20 : 12);
             const locY = matrixDropsRef.current[i] * (w > 1000 ? 20 : 12);
             
             ctx.globalAlpha = Math.random() > 0.9 ? 1 : 0.5 + (audioData.mid * 0.4);
             if (audioData.bass > 0.8 && Math.random() > 0.8) { ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 20; ctx.shadowColor = '#fff'; }
             else { ctx.fillStyle = colors.primary; ctx.shadowBlur = 0; }
             
             ctx.fillText(char, locX, locY);
             
             if(locY > h && Math.random() > 0.975) matrixDropsRef.current[i] = 0;
             matrixDropsRef.current[i] += (fallSpeed / (w > 1000 ? 20 : 12));
         }
         ctx.restore();
      }

      // MODE D: COSMIC HYPERSPACE
      if (mode === 'Cosmic') {
         const warpSpeed = 4 + (Math.pow(audioData.bass, 3) * 150); // Hyperdrive engaged on kick drums
         ctx.save();
         ctx.translate(cx, cy);
         ctx.lineCap = 'round';
         
         starsRef.current.forEach(s => {
             s.pz = s.z;
             s.z -= warpSpeed;
             
             if (s.z < 1) {
                 s.z = 2000;
                 s.pz = 2000;
                 s.x = (Math.random() - 0.5) * 4000;
                 s.y = (Math.random() - 0.5) * 4000;
             }
             
             const sx = (s.x / s.z) * w;
             const sy = (s.y / s.z) * h;
             const px = (s.x / s.pz) * w;
             const py = (s.y / s.pz) * h;
             
             ctx.beginPath();
             ctx.lineWidth = Math.max(0.5, (2000 - s.z) / 400);
             ctx.strokeStyle = `rgba(255,255,255,${1 - s.z/2000})`;
             
             if (audioData.bass > 0.7 && s.z < 1000) {
                 ctx.strokeStyle = colors.primary;
                 ctx.shadowBlur = 15;
                 ctx.shadowColor = colors.primary;
             }
             
             ctx.moveTo(px, py);
             ctx.lineTo(sx, sy);
             ctx.stroke();
         });
         ctx.restore();
      }

      ctx.restore(); // Restore all top-level transforms
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [mode, style, audioData, lyrics, currentTime, context, showIntegrityGhost, isDemo]);

  return <canvas ref={canvasRef} className={className} style={{ width: '100%', height: '100%', display: 'block' }} />;
});
