import React, { useState, useEffect } from 'react';
import { X, Heart, MessageSquare, Send, User, Calendar, Sparkles, Tag, ShieldCheck } from 'lucide-react';

export default function ArtworkDetailModal({ artwork, onClose, currentUser, onReactionChange }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reactCount, setReactCount] = useState(artwork?.react_count || 0);
  const [hasReacted, setHasReacted] = useState(false);
  const [moreFromArtist, setMoreFromArtist] = useState([]);

  useEffect(() => {
    if (!artwork) return;
    setReactCount(artwork.react_count || 0);
    fetchComments();
    fetchMoreArt();
  }, [artwork]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/artworks/${artwork.art_id}/comments`);
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const fetchMoreArt = async () => {
    try {
      const res = await fetch(`/api/artworks?artist_id=${artwork.artist_id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMoreFromArtist(data.filter(a => a.art_id !== artwork.art_id).slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching more art:', err);
    }
  };

  const handleReact = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/artworks/${artwork.art_id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.user_id })
      });
      const data = await res.json();
      setHasReacted(data.reacted);
      setReactCount(prev => data.reacted ? prev + 1 : Math.max(0, prev - 1));
      if (onReactionChange) onReactionChange(artwork.art_id, data.reacted);
    } catch (err) {
      console.error('Error toggling reaction:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/artworks/${artwork.art_id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.user_id,
          comment_text: newComment.trim()
        })
      });
      if (res.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!artwork) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0F1422] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col lg:flex-row max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gray-950/80 hover:bg-gray-800 text-gray-300 transition-colors shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: High-Res Artwork Display (Natural Aspect Ratio) */}
        <div className="lg:w-3/5 bg-black/60 flex items-center justify-center p-4 sm:p-8 min-h-[300px] overflow-hidden">
          <img
            src={artwork.media_url}
            alt={artwork.title}
            onError={(e) => {
              if (artwork.media_url?.includes('16VDnfv6VbfXHMZ-ONnMsdL1EU3oM1F6U')) {
                e.target.src = '/artworks/art_9.jpg';
              }
            }}
            className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl transition-transform duration-500 hover:scale-[1.01]"
          />
        </div>

        {/* Right: Artwork Metadata & MariaDB Discussion Thread (Showcase Isolated) */}
        <div className="lg:w-2/5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-800/80 bg-[#0F1422] p-6 overflow-y-auto">
          
          <div className="space-y-5">
            {/* Header: Title & Medium Badge */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {artwork.type || 'Digital Art'}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(artwork.created_at || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white leading-tight">
                {artwork.title}
              </h2>
            </div>

            {/* Artist Attribution */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-900/60 border border-gray-800">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-sm font-bold text-gray-950 shadow">
                {artwork.artist_name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-gray-200">{artwork.artist_name}</h4>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-xs text-gray-400 line-clamp-1">@{artwork.artist_username || 'artist'}</p>
              </div>
              <button
                onClick={handleReact}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  hasReacted
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                    : 'bg-gray-800 text-gray-300 hover:text-rose-400 hover:bg-gray-800/80 border border-gray-700'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${hasReacted ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{reactCount}</span>
              </button>
            </div>

            {/* Description */}
            {artwork.description && (
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-gray-950/40 p-3.5 rounded-2xl border border-gray-800/50">
                {artwork.description}
              </p>
            )}

            {/* More from this artist (Showcase isolated - no cross links) */}
            {moreFromArtist.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  More from {artwork.artist_name}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {moreFromArtist.map(art => (
                    <img
                      key={art.art_id}
                      src={art.media_url}
                      alt={art.title}
                      className="h-16 w-full object-cover rounded-xl border border-gray-800 hover:opacity-90 transition-opacity cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Community Comments Thread */}
            <div className="pt-2 border-t border-gray-800/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                Community Critique & Feedback ({comments.length})
              </h4>
              
              <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No comments yet. Share your artistic critique!</p>
                ) : (
                  comments.map(c => (
                    <div key={c.comment_id} className="p-2.5 rounded-xl bg-gray-900/50 border border-gray-800/70 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-amber-300">{c.user_name}</span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-gray-300">{c.comment_text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="mt-4 pt-3 border-t border-gray-800/80 flex gap-2">
            <input
              type="text"
              placeholder="Write constructive art feedback..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-gray-950 font-bold text-xs flex items-center justify-center hover:opacity-95 disabled:opacity-50 transition-opacity"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
