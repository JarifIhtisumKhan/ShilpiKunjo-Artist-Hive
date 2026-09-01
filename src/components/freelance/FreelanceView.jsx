import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, DollarSign, Clock, User, Plus, Search, Filter, CheckCircle2, ArrowRight, X, Sparkles, Check, AlertCircle, Palette, Trash2, Send, ExternalLink, RefreshCw, ShieldCheck, CheckCircle } from 'lucide-react';

export default function FreelanceView({ currentUser }) {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Form state for posting new commission brief
  const [formReq, setFormReq] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formMediaUrl, setFormMediaUrl] = useState('');
  const [postError, setPostError] = useState('');
  const [postLoading, setPostLoading] = useState(false);

  // Deliverable submission state
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [manualStatus, setManualStatus] = useState('');

  useEffect(() => {
    fetchCommissions();
  }, [activeStatus, searchQuery, currentUser]);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const userIdParam = currentUser?.user_id ? `&user_id=${currentUser.user_id}` : '';
      let url = `/api/commissions?status=${encodeURIComponent(activeStatus)}${userIdParam}`;
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setCommissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching commissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostBrief = async (e) => {
    e.preventDefault();
    if (!currentUser || !formReq.trim() || !formPrice || !formDeadline) return;
    setPostLoading(true);
    setPostError('');

    try {
      const res = await fetch('/api/commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: currentUser.user_id,
          requirements: formReq.trim(),
          description: formDesc.trim(),
          price_offered: parseFloat(formPrice),
          deadline: formDeadline,
          media_url: formMediaUrl.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post commission brief');

      setFormReq('');
      setFormDesc('');
      setFormPrice('');
      setFormDeadline('');
      setFormMediaUrl('');
      setIsPostModalOpen(false);
      fetchCommissions();
    } catch (err) {
      setPostError(err.message);
    } finally {
      setPostLoading(false);
    }
  };

  const handleApply = async (task) => {
    if (!currentUser?.is_artist) {
      alert('Only registered artists can accept commission briefs.');
      return;
    }
    if (Number(task.client_id) === Number(currentUser.user_id)) {
      alert('You cannot accept your own commission brief.');
      return;
    }

    try {
      const res = await fetch(`/api/commissions/${task.task_id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_status: 'Accepted',
          artist_id: currentUser.user_id,
          user_id: currentUser.user_id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to accept commission');

      fetchCommissions();
      setSelectedTask(prev => prev ? { ...prev, current_status: 'Accepted', artist_id: currentUser.user_id, artist_name: currentUser.name } : null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (newStatus, deliverable = '') => {
    if (!selectedTask || !currentUser) return;
    setIsUpdatingStatus(true);

    try {
      const res = await fetch(`/api/commissions/${selectedTask.task_id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_status: newStatus,
          user_id: currentUser.user_id,
          deliverable_url: deliverable || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      setSelectedTask(prev => prev ? { ...prev, current_status: newStatus, media_url: deliverable || prev.media_url } : null);
      setDeliverableUrl('');
      fetchCommissions();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!currentUser) return;
    const confirm = window.confirm('Are you sure you want to cancel and delete this commission brief?');
    if (!confirm) return;

    try {
      const res = await fetch(`/api/commissions/${taskId}?user_id=${currentUser.user_id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete task');

      setSelectedTask(null);
      fetchCommissions();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Requested':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'Accepted':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'In Progress':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'Review':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      case 'Completed':
        return 'bg-teal-400/25 text-teal-200 border-teal-400/40';
      default:
        return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 relative z-10">

      {/* Top Banner (Reduced Opacity) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0c2428]/40 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-emerald-400/20 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <Briefcase className="w-4 h-4 text-pink-300" />
            <span className="text-[11px] font-black uppercase tracking-wider text-pink-300 px-2.5 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30">
              Freelance Board 🌸
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Artist Commission Opportunities</span>
            <span className="text-xl">🎏</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1.5 max-w-xl">
            Connect clients with specialized visual artists for custom artwork, illustration contracts, and character designs.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto relative z-10">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-emerald-300/60 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search contract briefs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#061613]/90 border border-emerald-500/30 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-emerald-300/40 focus:outline-none focus:border-pink-400"
            />
          </div>

          <button
            onClick={() => setIsPostModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 hover:opacity-95 shadow-md shadow-pink-500/20 flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Post Commission Brief 🌸</span>
          </button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs text-emerald-300/80 pr-2 border-r border-emerald-500/30 flex-shrink-0">
          <Filter className="w-3.5 h-3.5 text-pink-300" />
          <span>Status:</span>
        </div>
        {['All', 'My Tasks', 'Requested', 'Accepted', 'In Progress', 'Review', 'Completed'].map(status => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${activeStatus === status
                ? 'bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 shadow-md shadow-pink-500/25'
                : 'bg-[#091f1b]/80 text-emerald-200/80 hover:text-white border border-emerald-500/25 hover:border-pink-300/40 hover:bg-[#0e2c26]'
              }`}
          >
            {status === 'My Tasks' ? 'My Linked Tasks 👑' : status}
          </button>
        ))}
      </div>

      {/* Job Board Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-pink-400/30 border-t-pink-400 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-teal-300">Loading commission opportunities...</p>
        </div>
      ) : commissions.length === 0 ? (
        <div className="text-center py-16 bg-[#0c2428]/30 rounded-3xl border border-emerald-500/20 p-8">
          <Briefcase className="w-12 h-12 text-pink-300/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Commission Tasks Found</h3>
          <p className="text-xs text-teal-200/70 max-w-sm mx-auto mb-4">
            There are currently no tasks matching the selected filter. Post a new brief or check back later!
          </p>
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 shadow-md"
          >
            Post a Brief Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commissions.map(task => {
            const isClient = currentUser && Number(task.client_id) === Number(currentUser.user_id);
            const isAssigned = currentUser && Number(task.artist_id) === Number(currentUser.user_id);

            return (
              <div
                key={task.task_id}
                onClick={() => {
                  setSelectedTask(task);
                  setManualStatus(task.current_status);
                }}
                className={`group cursor-pointer rounded-3xl glass-card hover:border-pink-400/50 transition-all duration-300 p-6 flex flex-col justify-between shadow-xl space-y-4 relative ${
                  isClient
                    ? 'border-teal-400/40 bg-[#0d2a26]/90'
                    : isAssigned
                    ? 'border-pink-400/40 bg-[#0d252a]/90'
                    : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(task.current_status)}`}>
                      {task.current_status}
                    </span>

                    <div className="flex items-center gap-2">
                      {isClient && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-400/20 text-teal-200 border border-teal-400/30">
                          Your Brief
                        </span>
                      )}
                      {isAssigned && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30">
                          Assigned to You
                        </span>
                      )}
                      <span className="text-sm font-black text-amber-300 font-mono">
                        ${parseFloat(task.price_offered).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors leading-snug">
                    {task.requirements}
                  </h3>

                  {task.description && (
                    <p className="text-xs text-emerald-200/70 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="border-t border-emerald-500/15 pt-3 space-y-1.5 text-xs text-emerald-300/70">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-pink-300 flex-shrink-0" />
                      <span className="truncate">Client: <strong className="text-white">{task.client_name}</strong></span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-amber-300" />
                      <span>{new Date(task.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {task.artist_name && (
                    <div className="flex items-center gap-1.5 text-[11px] text-teal-300/90 pt-1 border-t border-emerald-500/10">
                      <Palette className="w-3 h-3 text-amber-300" />
                      <span>Artist: <strong>{task.artist_name}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Brief Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg glass-panel-cute rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-300/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-pink-500/15 text-pink-300">
                  <Briefcase className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">Post Freelance Art Brief</h3>
                  <p className="text-xs text-teal-200/70">Commission specialized artwork from Bangladeshi creators</p>
                </div>
              </div>
              <button onClick={() => setIsPostModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {postError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{postError}</span>
              </div>
            )}

            <form onSubmit={handlePostBrief} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-teal-100 mb-1">Task Requirements *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2D Fantasy Character Illustration (Print Ready)"
                  value={formReq}
                  onChange={(e) => setFormReq(e.target.value)}
                  className="w-full bg-[#061613]/90 border border-emerald-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-emerald-300/40 focus:outline-none focus:border-pink-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-teal-100 mb-1">Offered Budget ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="e.g. 200.00"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full bg-[#061613]/90 border border-emerald-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-emerald-300/40 focus:outline-none focus:border-pink-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-teal-100 mb-1">Deadline *</label>
                  <input
                    type="date"
                    required
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full bg-[#061613]/90 border border-emerald-500/30 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-teal-100 mb-1">Description & Reference Notes</label>
                <textarea
                  rows={3}
                  placeholder="Detail colors, dimensions, reference links, and deliverable format..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-[#061613]/90 border border-emerald-500/30 rounded-xl p-3 text-xs text-white placeholder-emerald-300/40 focus:outline-none focus:border-pink-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-teal-100 mb-1">Reference Image Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or image link"
                  value={formMediaUrl}
                  onChange={(e) => setFormMediaUrl(e.target.value)}
                  className="w-full bg-[#061613]/90 border border-emerald-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-emerald-300/40 focus:outline-none focus:border-pink-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-emerald-500/20">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-900/80 text-gray-400 hover:text-white border border-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 hover:opacity-95 shadow-md shadow-pink-500/25 flex items-center gap-1.5"
                >
                  <Briefcase className="w-3.5 h-3.5 fill-gray-950" />
                  <span>{postLoading ? 'Posting...' : 'Publish Brief 🌸'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail & Status Marking Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl glass-panel-cute rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-300/40 space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full border ${getStatusBadge(selectedTask.current_status)}`}>
                  {selectedTask.current_status}
                </span>
                {Number(selectedTask.client_id) === Number(currentUser?.user_id) && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-400/20 text-teal-200 border border-teal-400/30">
                    You are the Client
                  </span>
                )}
                {Number(selectedTask.artist_id) === Number(currentUser?.user_id) && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    You are the Assigned Artist
                  </span>
                )}
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Task Title & Description */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">{selectedTask.requirements}</h2>
              {selectedTask.description && (
                <p className="text-xs text-teal-100/80 leading-relaxed bg-[#061613]/80 p-4 rounded-2xl border border-emerald-500/20 mt-3 whitespace-pre-line">
                  {selectedTask.description}
                </p>
              )}
            </div>

            {/* Contract Key Figures */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3 rounded-2xl bg-[#061412]/80 border border-emerald-500/20">
                <p className="text-[11px] text-emerald-300/70">Agreed Budget</p>
                <p className="text-base font-black text-amber-300 font-mono">${parseFloat(selectedTask.price_offered).toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#061412]/80 border border-emerald-500/20">
                <p className="text-[11px] text-emerald-300/70">Contract Deadline</p>
                <p className="text-xs font-bold text-white mt-1">{new Date(selectedTask.deadline).toLocaleDateString()}</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#061412]/80 border border-emerald-500/20 col-span-2 sm:col-span-1">
                <p className="text-[11px] text-emerald-300/70">Client</p>
                <p className="text-xs font-bold text-pink-300 truncate mt-1">@{selectedTask.client_username || selectedTask.client_name}</p>
              </div>
            </div>

            {/* Assigned Artist */}
            {selectedTask.artist_name ? (
              <div className="p-3.5 rounded-2xl bg-[#08221e]/80 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-400 to-amber-300 flex items-center justify-center font-bold text-gray-950 text-xs">
                    {selectedTask.artist_name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[11px] text-emerald-300/70 block">Contracted Visual Artist</span>
                    <strong className="text-xs text-white">@{selectedTask.artist_username || selectedTask.artist_name}</strong>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200">
                  Active
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-[#061412]/60 border border-dashed border-emerald-500/30 text-xs text-teal-300/70 text-center">
                Currently open for artist application & acceptance.
              </div>
            )}

            {/* Deliverable Image Preview if attached */}
            {selectedTask.media_url && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-teal-200">Delivered Artwork Asset:</span>
                <div className="rounded-2xl overflow-hidden border border-emerald-500/30 max-h-48 bg-black/40 flex items-center justify-center">
                  <img src={selectedTask.media_url} alt="Deliverable" className="max-h-48 w-auto object-contain" />
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                STATUS MARKING & TRANSITION CONTROLS
               ---------------------------------------------------- */}
            <div className="pt-3 border-t border-emerald-500/20 space-y-3">
              
              {/* Option A: Accept Commission (For other verified artists when status is 'Requested') */}
              {selectedTask.current_status === 'Requested' && currentUser?.is_artist && Number(selectedTask.client_id) !== Number(currentUser?.user_id) && (
                <button
                  onClick={() => handleApply(selectedTask)}
                  className="w-full py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 hover:scale-105 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept Commission Contract 🌸</span>
                </button>
              )}

              {/* Option B: Workflow step-by-step buttons for Client or Assigned Artist */}
              {(Number(selectedTask.client_id) === Number(currentUser?.user_id) || Number(selectedTask.artist_id) === Number(currentUser?.user_id) || currentUser?.is_admin) && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-[#061412]/90 border border-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 text-pink-300" />
                      <span>Contract Status Management</span>
                    </span>
                    <span className="text-[10px] text-teal-300/70">Authorized Role: {Number(selectedTask.client_id) === Number(currentUser?.user_id) ? 'Client' : 'Artist'}</span>
                  </div>

                  {/* Fast Action Buttons depending on status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedTask.current_status === 'Accepted' && (
                      <button
                        onClick={() => handleUpdateStatus('In Progress')}
                        disabled={isUpdatingStatus}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-500/25 text-purple-200 border border-purple-400/40 hover:bg-purple-500 hover:text-white transition-all shadow"
                      >
                        Start Working ➔ Mark "In Progress"
                      </button>
                    )}

                    {selectedTask.current_status === 'In Progress' && (
                      <div className="w-full space-y-2">
                        <input
                          type="url"
                          placeholder="Optional deliverable Google Drive link / image URL..."
                          value={deliverableUrl}
                          onChange={(e) => setDeliverableUrl(e.target.value)}
                          className="w-full bg-[#082025] border border-emerald-500/30 rounded-xl px-3 py-1.5 text-xs text-white placeholder-emerald-300/40 focus:outline-none focus:border-pink-400"
                        />
                        <button
                          onClick={() => handleUpdateStatus('Review', deliverableUrl)}
                          disabled={isUpdatingStatus}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/25 text-amber-200 border border-amber-400/40 hover:bg-amber-500 hover:text-gray-950 transition-all shadow flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Deliverable ➔ Mark "Review"</span>
                        </button>
                      </div>
                    )}

                    {selectedTask.current_status === 'Review' && (
                      <div className="flex items-center gap-2 flex-wrap w-full">
                        <button
                          onClick={() => handleUpdateStatus('Completed')}
                          disabled={isUpdatingStatus}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold bg-teal-400 text-gray-950 hover:bg-teal-300 transition-all shadow flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve & Complete Contract ✓</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus('In Progress')}
                          disabled={isUpdatingStatus}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-900 text-gray-300 hover:text-white border border-gray-700 transition-all"
                        >
                          Request Revision
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Manual Status Selector (Comprehensive) */}
                  <div className="pt-2 border-t border-emerald-500/15 flex items-center gap-2">
                    <span className="text-[11px] text-teal-200/80">Set Status:</span>
                    <select
                      value={manualStatus}
                      onChange={(e) => setManualStatus(e.target.value)}
                      className="bg-[#082025] border border-emerald-500/30 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-pink-400"
                    >
                      <option value="Requested">Requested</option>
                      <option value="Accepted">Accepted</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Completed">Completed</option>
                    </select>

                    <button
                      onClick={() => handleUpdateStatus(manualStatus)}
                      disabled={isUpdatingStatus || manualStatus === selectedTask.current_status}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-400 to-amber-300 text-gray-950 hover:opacity-90 disabled:opacity-40 transition-all"
                    >
                      Update
                    </button>
                  </div>

                </div>
              )}

              {/* Option C: Delete / Cancel button for Client or Admin */}
              {(Number(selectedTask.client_id) === Number(currentUser?.user_id) || currentUser?.is_admin) && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleDeleteTask(selectedTask.task_id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all flex items-center gap-1.5 shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancel / Delete Brief</span>
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
