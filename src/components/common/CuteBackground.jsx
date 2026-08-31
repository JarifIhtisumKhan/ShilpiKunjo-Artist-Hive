import React, { useState } from 'react';
import { Sparkles, Eye, Sliders, Heart, Palette } from 'lucide-react';

export default function CuteBackground({ opacity = 0.55, blur = 2 }) {
  const [showControls, setShowControls] = useState(false);
  const [bgDim, setBgDim] = useState(opacity);
  const [bgBlur, setBgBlur] = useState(blur);
  const [particlesEnabled, setParticlesEnabled] = useState(true);

  return (
    <>
      {/* Dream Canvas Background Container */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-700 -z-50"
        style={{
          backgroundImage: `url('/music-dream-background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          filter: `blur(${bgBlur}px)`
        }}
      />

      {/* Cute Translucent Ocean & Dream Gradient Vignette */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-700 -z-40"
        style={{
          background: `radial-gradient(ellipse at 45% 30%, rgba(12, 36, 42, ${bgDim * 0.65}) 0%, rgba(8, 26, 32, ${Math.min(0.92, bgDim * 1.25)}) 65%, rgba(4, 16, 20, ${Math.min(0.97, bgDim * 1.45)}) 100%)`
        }}
      />

      {/* Cute Animated Floating Stars, Sakura & Dream Motes */}
      {particlesEnabled && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-30 select-none">
          <div className="absolute top-[14%] left-[10%] animate-cute-float text-xl opacity-80 filter drop-shadow-[0_0_8px_rgba(255,182,217,0.6)]">
            🌸
          </div>
          <div className="absolute top-[22%] right-[14%] animate-drift-slow text-2xl opacity-75 filter drop-shadow-[0_0_10px_rgba(255,230,109,0.7)]" style={{ animationDelay: '1.2s' }}>
            ⭐
          </div>
          <div className="absolute top-[55%] left-[6%] animate-cute-float text-lg opacity-70 filter drop-shadow-[0_0_8px_rgba(135,235,220,0.6)]" style={{ animationDelay: '2.5s' }}>
            🪼
          </div>
          <div className="absolute top-[48%] right-[8%] animate-drift-slow text-lg opacity-75 filter drop-shadow-[0_0_8px_rgba(255,182,217,0.6)]" style={{ animationDelay: '3.8s' }}>
            💫
          </div>
          <div className="absolute top-[75%] right-[22%] animate-cute-pulse text-base opacity-70 filter drop-shadow-[0_0_8px_rgba(255,230,109,0.6)]" style={{ animationDelay: '1.8s' }}>
            ✨
          </div>
          <div className="absolute top-[82%] left-[15%] animate-cute-float text-sm opacity-70 filter drop-shadow-[0_0_6px_rgba(135,235,220,0.5)]" style={{ animationDelay: '0.9s' }}>
            🐠
          </div>
          <div className="absolute top-[35%] left-[30%] animate-drift-slow text-xs opacity-60 filter drop-shadow-[0_0_6px_rgba(255,182,217,0.5)]" style={{ animationDelay: '4.2s' }}>
            💖
          </div>

          {/* Ambient Dreamy Glowing Orbs */}
          <div className="absolute top-[12%] left-[15%] w-80 h-80 rounded-full bg-pink-400/12 blur-3xl animate-cute-pulse pointer-events-none" />
          <div className="absolute top-[45%] right-[10%] w-96 h-96 rounded-full bg-teal-400/12 blur-3xl animate-cute-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-[10%] left-[25%] w-72 h-72 rounded-full bg-amber-300/10 blur-3xl animate-cute-pulse pointer-events-none" style={{ animationDelay: '3.5s' }} />
        </div>
      )}

      {/* Cute Floating Theme Switcher / Customizer Button in Corner */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 font-comic">
        {showControls && (
          <div className="glass-panel-cute rounded-2xl p-4 shadow-2xl border border-pink-300/35 text-xs w-64 animate-fadeIn backdrop-blur-2xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 font-bold text-pink-200">
              <span className="flex items-center gap-1.5 font-rustic text-base">
                <span>🎨</span> Canvas Atmosphere
              </span>
              <button
                onClick={() => setShowControls(false)}
                className="text-gray-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] text-gray-300 mb-1 font-comic">
                  <span>Artwork Visibility</span>
                  <span className="font-mono text-amber-300">{Math.round((1 - bgDim) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.20"
                  max="0.85"
                  step="0.05"
                  value={bgDim}
                  onChange={(e) => setBgDim(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-950/60 rounded-lg appearance-none cursor-pointer accent-pink-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-gray-300 mb-1 font-comic">
                  <span>Dreamy Blur</span>
                  <span className="font-mono text-teal-300">{bgBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={bgBlur}
                  onChange={(e) => setBgBlur(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-950/60 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-gray-300 font-comic">
                <span>Floating Dream Motes</span>
                <button
                  type="button"
                  onClick={() => setParticlesEnabled(!particlesEnabled)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    particlesEnabled
                      ? 'bg-pink-500/25 text-pink-200 border border-pink-500/40 shadow-sm'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {particlesEnabled ? 'Enabled ✨' : 'Off'}
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowControls(!showControls)}
          title="Adjust Canvas Background Ambience"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0a272dc7] hover:bg-[#10363e] text-pink-200 border border-pink-300/35 shadow-lg shadow-teal-950/50 backdrop-blur-md text-xs font-semibold hover:scale-105 active:scale-95 transition-all group font-comic"
        >
          <span className="group-hover:rotate-12 transition-transform duration-300">🎨</span>
          <span className="hidden sm:inline text-[11px] font-medium text-teal-100">Canvas Ambience</span>
          <Sliders className="w-3 h-3 text-pink-300" />
        </button>
      </div>
    </>
  );
}

