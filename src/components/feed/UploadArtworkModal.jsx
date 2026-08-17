import React, { useState } from 'react';
import { X, Upload, Sparkles, Image as ImageIcon } from 'lucide-react';

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
    if (!title.trim() || !mediaUrl.trim()) {
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
          media_url: mediaUrl
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0F1422] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-900 text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Publish Artwork to Feed</h3>
            <p className="text-xs text-gray-400">Showcase your visual creation to the Bangladeshi art community</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">Artwork Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Baishakhi Carnival Mask"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">Art Form / Medium *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Digital">Digital Painting & Concept Art</option>
              <option value="Hand-drawn">Hand-drawn, Ink & Watercolor</option>
              <option value="Animation">3D Animation & Environment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">Image / Media URL *</label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/..."
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
            
            {/* Sample Image selector */}
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[10px] text-gray-500 flex-shrink-0">Presets:</span>
              {sampleImages.map((url, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setMediaUrl(url)}
                  className="text-[10px] px-2 py-0.5 rounded bg-gray-900 border border-gray-800 hover:border-amber-500/50 text-gray-400 hover:text-amber-300 flex-shrink-0"
                >
                  Preset {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea
              rows={3}
              placeholder="Describe inspiration, cultural motifs, or technical toolset..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-900 text-gray-400 hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-gray-950 hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5"
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
