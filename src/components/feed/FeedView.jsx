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
  }, [activeFilter, searchQuery]);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      let url = `/api/artworks?type=${encodeURIComponent(activeFilter)}`;
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
    if (!currentUser) return;
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
            ? { ...a, react_count: data.reacted ? a.react_count + 1 : Math.max(0, a.react_count - 1) }
            : a
        )
      );
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Top Banner & Search Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-gray-950 via-[#101524] to-gray-950 p-6 rounded-3xl border border-gray-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Welcome to the Community
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Bangladeshi Artist Hive
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl leading-relaxed">
            Welcome to Bangladesh's premier creative collective! Discover captivating digital illustrations, traditional artwork, and expressive visual storytelling crafted with passion by talented artists across the nation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search artworks or artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/90 border border-gray-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Upload Button */}
          {currentUser?.is_artist && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-2xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-gray-950 hover:opacity-95 shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Art</span>
            </button>
          )}
        </div>
      </div>

      {/* Medium Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 pr-2 border-r border-gray-800">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <span>Medium:</span>
        </div>
        {filterTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === tab
                ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20'
                : 'bg-gray-900/80 text-gray-400 hover:text-white border border-gray-800/80 hover:bg-gray-800'
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
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800/80 group/card shadow-lg hover:border-gray-700 transition-all duration-300">
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
                  className="p-2 rounded-full bg-black/60 text-white hover:text-rose-400 hover:bg-black/80 transition-colors backdrop-blur-md"
                >
                  <Heart className="w-4 h-4 fill-transparent hover:fill-rose-400" />
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
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400" />
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

      {/* Artwork Detail Modal (Pure showcase - no pricing, with author edit/delete) */}
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
          onReactionChange={(artId, reacted) => {
            setArtworks(prev =>
              prev.map(a =>
                a.art_id === artId
                  ? { ...a, react_count: reacted ? a.react_count + 1 : Math.max(0, a.react_count - 1) }
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
