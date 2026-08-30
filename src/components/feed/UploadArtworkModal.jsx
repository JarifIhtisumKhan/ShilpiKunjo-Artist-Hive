import React, { useState } from 'react';
import { X, Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import { formatDriveImageUrl } from '../../utils/imageUtils.js';

export { formatDriveImageUrl };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#c6ae82] border border-[#ab946a] rounded-3xl p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#b8a074] text-gray-800 hover:text-gray-950"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-[#aca04d]/20 border border-[#315812]/30 text-[#315812]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-950">Publish Artwork to Feed</h3>
            <p className="text-xs text-gray-800">Showcase your visual creation to the Bangladeshi art community</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs font-semibold">
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
              className="peer w-full bg-[#b8a074] border border-[#9d865c] rounded-2xl px-4 pt-5 pb-2 text-xs text-gray-950 focus:outline-none focus:border-[#315812] focus:ring-1 focus:ring-[#315812]/50 transition-all duration-300"
            />
            <label
              htmlFor="artwork-title"
              className="absolute left-4 top-3.5 text-xs text-gray-700 pointer-events-none transition-all duration-200 ease-out origin-[0_0] peer-focus:-translate-y-2.5 peer-focus:scale-[0.75] peer-focus:text-[#315812] font-medium peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-[0.75] peer-[:not(:placeholder-shown)]:text-gray-800"
            >
              Artwork Title *
            </label>
          </div>

          {/* Type Select & Image URL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#b8a074] border border-[#9d865c] rounded-2xl px-3 py-3 text-xs text-gray-950 focus:outline-none focus:border-[#315812]"
              >
                <option value="Digital">Digital Art</option>
                <option value="Hand-drawn">Hand-drawn</option>
                <option value="Animation">3D / Animation</option>
              </select>
            </div>
            <div className="sm:col-span-2 relative group">
              <input
                type="url"
                id="media-url"
                required
                placeholder=" "
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="peer w-full bg-[#b8a074] border border-[#9d865c] rounded-2xl px-4 pt-5 pb-2 text-xs text-gray-950 focus:outline-none focus:border-[#315812] transition-all"
              />
              <label
                htmlFor="media-url"
                className="absolute left-4 top-3.5 text-xs text-gray-700 pointer-events-none transition-all duration-200 ease-out origin-[0_0] peer-focus:-translate-y-2.5 peer-focus:scale-[0.75] peer-focus:text-[#315812] font-medium peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-[0.75] peer-[:not(:placeholder-shown)]:text-gray-800"
              >
                Media Image URL *
              </label>
            </div>
          </div>

          {/* Floating Input: Description */}
          <div className="relative group">
            <textarea
              id="artwork-desc"
              rows={3}
              placeholder=" "
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="peer w-full bg-[#b8a074] border border-[#9d865c] rounded-2xl px-4 pt-5 pb-2 text-xs text-gray-950 focus:outline-none focus:border-[#315812] transition-all resize-none"
            />
            <label
              htmlFor="artwork-desc"
              className="absolute left-4 top-3.5 text-xs text-gray-700 pointer-events-none transition-all duration-200 ease-out origin-[0_0] peer-focus:-translate-y-2.5 peer-focus:scale-[0.75] peer-focus:text-[#315812] font-medium peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-[0.75] peer-[:not(:placeholder-shown)]:text-gray-800"
            >
              Description & Inspiration
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#b8a074] text-gray-800 hover:bg-[#a89064]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#aca04d] to-[#315812] text-white hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5 shadow-md"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{loading ? 'Publishing...' : 'Publish to Feed'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
