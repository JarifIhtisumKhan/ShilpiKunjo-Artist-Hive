import React, { useState } from 'react';
import { X, Upload, Sparkles, Image as ImageIcon } from 'lucide-react';

export function formatDriveImageUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  const driveMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  return trimmed;
}

export default function UploadArtworkModal({ onClose, currentUser, onUploadSuccess }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Digital');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sampleImages = [
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=850&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=900&auto=format&fit=crop'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalUrl = formatDriveImageUrl(mediaUrl);
    if (!title.trim() || !finalUrl.trim()) {
      setError('Please provide artwork title and image URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist_id: currentUser.user_id,
          title,
          type,
          description,
          media_url: finalUrl
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish artwork');

      onUploadSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
      <div className="relative w-full max-w-lg glass-panel-cute border border-pink-300/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#061613]/90 text-pink-200 hover:bg-[#0d2823] border border-emerald-500/30 transition-all hover:scale-105"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-pink-500/15 border border-pink-500/30 text-pink-300 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span>Publish Artwork</span>
              <span className="text-sm">🌸</span>
            </h3>
            <p className="text-xs text-emerald-200/70">Showcase your visual creation to the sanctuary community</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Floating Input: Title */}
          <div className="relative group">
            <input
              type="text"
              id="artwork-title"
              required
              placeholder=" "
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="peer w-full bg-[#061613]/90 border border-emerald-500/30 focus:border-pink-400 rounded-2xl px-4 pt-5 pb-2 text-xs text-emerald-50 focus:outline-none focus:ring-1 focus:ring-pink-400/30 transition-all duration-300"
            />
            <label
              htmlFor="artwork-title"
              className="absolute left-4 top-3.5 text-xs text-emerald-300/60 pointer-events-none transition-all duration-200 ease-out origin-[0_0] peer-focus:-translate-y-2.5 peer-focus:scale-[0.75] peer-focus:text-pink-300 font-medium peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-[0.75] peer-[:not(:placeholder-shown)]:text-emerald-200"
            >
              Artwork Title *
            </label>
          </div>

          {/* Floating Select: Medium */}
          <div className="relative group">
            <select
              id="artwork-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="peer w-full bg-[#061613]/90 border border-emerald-500/30 focus:border-pink-400 rounded-2xl px-4 pt-5 pb-2 text-xs text-emerald-50 focus:outline-none focus:ring-1 focus:ring-pink-400/30 transition-all duration-300 cursor-pointer"
            >
              <option value="Digital">Digital Painting & Concept Art</option>
              <option value="Hand-drawn">Hand-drawn, Ink & Watercolor</option>
              <option value="Animation">3D Animation & Environment</option>
            </select>
            <label
              htmlFor="artwork-type"
              className="absolute left-4 top-1.5 text-[10px] text-pink-300 font-semibold pointer-events-none origin-[0_0]"
            >
              Art Form / Medium *
            </label>
          </div>

          {/* Floating Input: Image / Media URL */}
          <div>
            <div className="relative group">
              <input
                type="url"
                id="artwork-url"
                required
                placeholder=" "
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="peer w-full bg-[#061613]/90 border border-emerald-500/30 focus:border-pink-400 rounded-2xl px-4 pt-5 pb-2 text-xs text-emerald-50 focus:outline-none focus:ring-1 focus:ring-pink-400/30 transition-all duration-300"
              />
              <label
                htmlFor="artwork-url"
                className="absolute left-4 top-3.5 text-xs text-emerald-300/60 pointer-events-none transition-all duration-200 ease-out origin-[0_0] peer-focus:-translate-y-2.5 peer-focus:scale-[0.75] peer-focus:text-pink-300 font-medium peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-[0.75] peer-[:not(:placeholder-shown)]:text-emerald-200"
              >
                Image or Media URL *
              </label>
            </div>
            
            {/* Sample Image selector */}
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[10px] text-emerald-300/60 flex-shrink-0">Presets:</span>
              {sampleImages.map((url, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setMediaUrl(url)}
                  className="text-[10px] px-2.5 py-0.5 rounded-lg bg-[#0a201b] border border-emerald-500/25 hover:border-pink-400/50 text-emerald-200 hover:text-pink-300 flex-shrink-0 transition-colors"
                >
                  Preset {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Floating Textarea: Description */}
          <div className="relative group">
            <textarea
              id="artwork-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder=" "
              className="peer w-full bg-[#061613]/90 border border-emerald-500/30 focus:border-pink-400 rounded-2xl px-4 pt-5 pb-2 text-xs text-emerald-50 focus:outline-none focus:ring-1 focus:ring-pink-400/30 transition-all duration-300 resize-none"
            />
            <label
              htmlFor="artwork-desc"
              className="absolute left-4 top-3.5 text-xs text-emerald-300/60 pointer-events-none transition-all duration-200 ease-out origin-[0_0] peer-focus:-translate-y-2.5 peer-focus:scale-[0.75] peer-focus:text-pink-300 font-medium peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-[0.75] peer-[:not(:placeholder-shown)]:text-emerald-200"
            >
              Description & Inspiration
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#091f1b] text-emerald-300 hover:bg-[#0e2d27] border border-emerald-500/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{loading ? 'Publishing...' : 'Publish to Feed 🌸'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
