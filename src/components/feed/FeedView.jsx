import React, { useState, useEffect } from 'react';
import { Search, Heart, MessageSquare, Sparkles, Filter, Plus, Eye } from 'lucide-react';
import MasonryEngine from '../common/MasonryEngine.jsx';
import ArtworkDetailModal from './ArtworkDetailModal.jsx';
import UploadArtworkModal from './UploadArtworkModal.jsx';

export default function FeedView({ currentUser }) {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const filterTabs = ['All', 'Digital', 'Hand-drawn', 'Animation'];

  useEffect(() => {
    fetchArtworks();
  }, [activeFilter, searchQuery, currentUser]);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      let url = `/api/artworks?type=${encodeURIComponent(activeFilter)}`;
      if (currentUser?.user_id) {
        url += `&user_id=${encodeURIComponent(currentUser.user_id)}`;
      }
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setArtworks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading artworks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLike = async (e, art) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('Please sign in to react to artworks.');
      return;
    }
    try {
      const res = await fetch(`/api/artworks/${art.art_id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.user_id })
      });
      const data = await res.json();
      setArtworks(prev =>
        prev.map(a =>
          a.art_id === art.art_id
            ? {
                ...a,
                react_count: data.react_count !== undefined ? data.react_count : (data.reacted ? a.react_count + 1 : Math.max(0, a.react_count - 1)),
                user_reacted: data.reacted ? 1 : 0
              }
            : a
        )
      );
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Top Banner & Search Controls (Reduced Opacity Box) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0c2428]/40 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-emerald-400/20 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-400/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-pink-300 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 font-comic">
              <Sparkles className="w-3 h-3 text-pink-300" />
              Artist Community & Sanctuary ✨
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-rustic font-normal tracking-wide text-white flex items-center gap-2 drop-shadow-md">
            <span>Bangladeshi Artist Hive</span>
            <span className="text-2xl">🎨</span>
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/80 mt-1.5 max-w-xl leading-relaxed font-comic">
            Welcome to Bangladesh's premier creative collective! Discover captivating digital illustrations, traditional artwork, and expressive visual storytelling crafted with passion by talented artists across the nation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto relative z-10">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-emerald-300/60 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search artworks or artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#061613]/90 border border-emerald-500/30 rounded-2xl pl-10 pr-4 py-2 text-xs text-emerald-50 placeholder-emerald-300/40 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400/30 transition-all"
            />
          </div>

          {/* Upload Button */}
          {currentUser?.is_artist && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 hover:opacity-95 shadow-md shadow-pink-500/20 flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Art 🌸</span>
            </button>
          )}
        </div>
      </div>

      {/* Medium Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs text-emerald-300/80 pr-2 border-r border-emerald-500/30">
          <Filter className="w-3.5 h-3.5 text-pink-300" />
          <span>Medium:</span>
        </div>
        {filterTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === tab
                ? 'bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 shadow-md shadow-pink-500/25'
                : 'bg-[#091f1b]/80 text-emerald-200/80 hover:text-white border border-emerald-500/25 hover:border-pink-300/40 hover:bg-[#0e2c26]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Reusable Pinterest-Style Masonry Feed */}
      <MasonryEngine
        items={artworks}
        isLoading={loading}
        onItemClick={(art) => setSelectedArtwork(art)}
        emptyMessage="No artworks found in this category."
        renderItem={(art) => (
          <div className="relative rounded-2xl overflow-hidden glass-card group/card shadow-lg hover:border-pink-400/50 transition-all duration-300">
            {/* Artwork Image with Natural Aspect Ratio */}
            <img
              src={art.media_url}
              alt={art.title}
              loading="lazy"
              onError={(e) => {
                if (art.media_url?.includes('16VDnfv6VbfXHMZ-ONnMsdL1EU3oM1F6U')) {
                  e.target.src = '/artworks/art_9.jpg';
                }
              }}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover/card:scale-105"
            />

            {/* Hover / Tap Overlay (Pinterest-style) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between pointer-events-none">
              
              {/* Top Type Tag */}
              <div className="flex justify-between items-start pointer-events-auto">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/60 text-amber-400 border border-amber-500/30 backdrop-blur-md">
                  {art.type}
                </span>
                <button
                  onClick={(e) => handleQuickLike(e, art)}
                  title={art.user_reacted ? 'Unlike' : 'Like'}
                  className="p-2 rounded-full bg-black/60 text-white hover:text-rose-400 hover:bg-black/80 transition-colors backdrop-blur-md"
                >
                  <Heart className={`w-4 h-4 transition-colors ${art.user_reacted ? 'fill-rose-400 text-rose-400' : 'fill-transparent text-white hover:fill-rose-400 hover:text-rose-400'}`} />
                </button>
              </div>

              {/* Bottom Metadata & Artist */}
              <div className="space-y-2 pointer-events-auto">
                <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 drop-shadow-md">
                  {art.title}
                </h3>
                
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-gray-950 text-[10px] font-bold flex items-center justify-center">
                      {art.artist_name?.charAt(0) || 'A'}
                    </div>
                    <span className="font-semibold text-xs text-gray-200 line-clamp-1">{art.artist_name}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-[11px] text-gray-400">
                    <span className={`flex items-center gap-1 font-semibold ${art.user_reacted ? 'text-rose-400' : 'text-gray-300'}`}>
                      <Heart className={`w-3 h-3 ${art.user_reacted ? 'fill-rose-400 text-rose-400' : 'text-rose-400'}`} />
                      {art.react_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-amber-400" />
                      {art.comments_count || 0}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      />

      {/* Artwork Detailed Modal */}
      {selectedArtwork && (
        <ArtworkDetailModal
          artwork={selectedArtwork}
          currentUser={currentUser}
          onClose={() => setSelectedArtwork(null)}
          onArtworkUpdated={(updated) => {
            setSelectedArtwork(updated);
            setArtworks(prev => prev.map(a => a.art_id === updated.art_id ? updated : a));
          }}
          onArtworkDeleted={(artId) => {
            setSelectedArtwork(null);
            setArtworks(prev => prev.filter(a => a.art_id !== artId));
          }}
          onReactionChange={(artId, reacted, newCount) => {
            setArtworks(prev =>
              prev.map(a =>
                a.art_id === artId
                  ? {
                      ...a,
                      react_count: newCount !== undefined ? newCount : (reacted ? a.react_count + 1 : Math.max(0, a.react_count - 1)),
                      user_reacted: reacted ? 1 : 0
                    }
                  : a
              )
            );
          }}
        />
      )}

      {/* Upload Artwork Modal */}
      {isUploadModalOpen && (
        <UploadArtworkModal
          currentUser={currentUser}
          onClose={() => setIsUploadModalOpen(false)}
          onUploadSuccess={fetchArtworks}
        />
      )}

    </div>
  );
}
