import React, { useState, useEffect } from 'react';
import { X, Heart, MessageSquare, Send, User, Calendar, Sparkles, Tag, ShieldCheck, Pencil, Trash2, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { formatDriveImageUrl } from './UploadArtworkModal';

export default function ArtworkDetailModal({
  artwork,
  onClose,
  currentUser,
  onReactionChange,
  onArtworkUpdated,
  onArtworkDeleted
}) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reactCount, setReactCount] = useState(artwork?.react_count || 0);
  const [hasReacted, setHasReacted] = useState(false);
  const [moreFromArtist, setMoreFromArtist] = useState([]);

  // Edit / Delete states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(artwork?.title || '');
  const [editType, setEditType] = useState(artwork?.type || 'Digital');
  const [editDescription, setEditDescription] = useState(artwork?.description || '');
  const [editMediaUrl, setEditMediaUrl] = useState(artwork?.media_url || '');
  const [editError, setEditError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if current user is author or admin
  const isAuthorOrAdmin = currentUser && (
    Number(currentUser.user_id) === Number(artwork?.artist_id) ||
    Boolean(currentUser.is_admin)
  );

  useEffect(() => {
    if (!artwork) return;
    setReactCount(artwork.react_count || 0);
    setEditTitle(artwork.title || '');
    setEditType(artwork.type || 'Digital');
    setEditDescription(artwork.description || '');
    setEditMediaUrl(artwork.media_url || '');
    setIsEditing(false);
    setShowDeleteConfirm(false);
    setEditError('');
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

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editMediaUrl.trim()) {
      setEditError('Title and media image URL are required.');
      return;
    }

    setIsSaving(true);
    setEditError('');

    try {
      const formattedUrl = formatDriveImageUrl(editMediaUrl);
      const res = await fetch(`/api/artworks/${artwork.art_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.user_id,
          title: editTitle.trim(),
          type: editType,
          description: editDescription.trim(),
          media_url: formattedUrl
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update artwork');

      setIsEditing(false);
      if (onArtworkUpdated) {
        onArtworkUpdated(data.artwork);
      }
    } catch (err) {
      setEditError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/artworks/${artwork.art_id}?user_id=${currentUser.user_id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete artwork');

      if (onArtworkDeleted) {
        onArtworkDeleted(artwork.art_id);
      }
      onClose();
    } catch (err) {
      setEditError(err.message);
      setIsDeleting(false);
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
            src={isEditing ? editMediaUrl : artwork.media_url}
            alt={artwork.title}
            onError={(e) => {
              if (artwork.media_url?.includes('16VDnfv6VbfXHMZ-ONnMsdL1EU3oM1F6U')) {
                e.target.src = '/artworks/art_9.jpg';
              }
            }}
            className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl transition-transform duration-500 hover:scale-[1.01]"
          />
        </div>

        {/* Right: Artwork Metadata & MariaDB Discussion Thread / Edit Mode */}
        <div className="lg:w-2/5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-800/80 bg-[#0F1422] p-6 overflow-y-auto">
          
          {isEditing ? (
            /* --- EDIT POST MODE --- */
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-amber-400" />
                  Edit Artwork Post
                </h3>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Author Control
                </span>
              </div>

              {editError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                  {editError}
                </div>
              )}

              {/* Floating Input: Title */}
              <div className="relative group">
                <input
                  type="text"
                  id="edit-title"
                  required
                  placeholder=" "
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="peer w-full bg-gray-950/80 border border-gray-800 rounded-2xl px-4 pt-5 pb-2 text-xs text-gray-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300"
                />
                <label
                  htmlFor="edit-title"
                  className="absolute left-4 top-3.5 text-xs text-gray-400 pointer-events-none transition-all duration-200 ease-out origin-[0_0] peer-focus:-translate-y-2.5 peer-focus:scale-[0.75] peer-focus:text-amber-400 font-medium peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-[0.75] peer-[:not(:placeholder-shown)]:text-gray-300"
                >
                  Artwork Title *
                </label>
              </div>

              {/* Floating Select: Type */}
              <div className="relative group">
                <select
                  id="edit-type"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="peer w-full bg-gray-950/80 border border-gray-800 rounded-2xl px-4 pt-5 pb-2 text-xs text-gray-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300 cursor-pointer"
                >
                  <option value="Digital">Digital Painting & Concept Art</option>
                  <option value="Hand-drawn">Hand-drawn, Ink & Watercolor</option>
                  <option value="Animation">3D Animation & Environment</option>
                </select>
                <label
                  htmlFor="edit-type"
                  className="absolute left-4 top-1.5 text-[10px] text-amber-400 font-semibold pointer-events-none origin-[0_0]"
                >
                  Art Form / Medium *
                </label>
              </div>

              {/* Floating Input: Media URL */}
              <div className="relative group">
                <input
                  type="url"
                  id="edit-url"
                  required
                  placeholder=" "
                  value={editMediaUrl}
                  onChange={(e) => setEditMediaUrl(formatDriveImageUrl(e.target.value))}
                  className="peer w-full bg-gray-950/80 border border-gray-800 rounded-2xl px-4 pt-5 pb-2 text-xs text-gray-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300"
                />
                <label
                  htmlFor="edit-url"
                  className="absolute left-4 top-3.5 text-xs text-gray-400 pointer-events-none transition-all duration-200 ease-out origin-[0_0] peer-focus:-translate-y-2.5 peer-focus:scale-[0.75] peer-focus:text-amber-400 font-medium peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-[0.75] peer-[:not(:placeholder-shown)]:text-gray-300"
                >
                  Image or Media URL *
                </label>
              </div>

              {/* Floating Textarea: Description */}
              <div className="relative group">
                <textarea
                  id="edit-desc"
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder=" "
                  className="peer w-full bg-gray-950/80 border border-gray-800 rounded-2xl px-4 pt-5 pb-2 text-xs text-gray-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300 resize-none"
                />
                <label
                  htmlFor="edit-desc"
                  className="absolute left-4 top-3.5 text-xs text-gray-400 pointer-events-none transition-all duration-200 ease-out origin-[0_0] peer-focus:-translate-y-2.5 peer-focus:scale-[0.75] peer-focus:text-amber-400 font-medium peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:scale-[0.75] peer-[:not(:placeholder-shown)]:text-gray-300"
                >
                  Description & Cultural Inspiration
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-900 text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-gray-950 hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* --- NORMAL VIEW MODE --- */
            <div className="space-y-5">
              
              {/* Delete Confirmation Banner */}
              {showDeleteConfirm && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Delete this artwork permanently?</span>
                  </div>
                  <p className="text-gray-300 text-[11px] leading-relaxed">
                    This will remove the artwork from the feed, database, and delete all associated community comments and reactions.
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30"
                    >
                      {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Header: Title & Medium Badge & Author Controls */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {artwork.type || 'Digital Art'}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(artwork.created_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Edit / Delete Buttons for Creator or Admin */}
                  {isAuthorOrAdmin && !showDeleteConfirm && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-amber-500/40 text-gray-400 hover:text-amber-400 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                        title="Edit Artwork"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-rose-500/40 text-gray-400 hover:text-rose-400 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                        title="Delete Artwork"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
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

            {/* Add Comment Input (Only when viewing) */}
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
        )}

      </div>

      </div>
    </div>
  );
}
