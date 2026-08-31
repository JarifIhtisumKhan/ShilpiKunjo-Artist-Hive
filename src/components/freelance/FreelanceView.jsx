import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, DollarSign, Clock, User, Plus, Search, Filter, CheckCircle2, ArrowRight, X } from 'lucide-react';

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
  const [postError, setPostError] = useState('');
  const [postLoading, setPostLoading] = useState(false);

  useEffect(() => {
    fetchCommissions();
  }, [activeStatus, searchQuery]);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      let url = `/api/commissions?status=${encodeURIComponent(activeStatus)}`;
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
    if (!currentUser || !formReq || !formPrice || !formDeadline) return;
    setPostLoading(true);
    setPostError('');

    try {
      const res = await fetch('/api/commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: currentUser.user_id,
          requirements: formReq,
          description: formDesc,
          price_offered: parseFloat(formPrice),
          deadline: formDeadline
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post commission brief');

      setFormReq('');
      setFormDesc('');
      setFormPrice('');
      setFormDeadline('');
      setIsPostModalOpen(false);
      fetchCommissions();
    } catch (err) {
      setPostError(err.message);
    } finally {
      setPostLoading(false);
    }
  };

  const handleApply = async (task) => {
    if (!currentUser?.is_artist) return;
    try {
      const res = await fetch(`/api/commissions/${task.task_id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_status: 'Accepted',
          artist_id: currentUser.user_id
        })
      });
      if (res.ok) {
        fetchCommissions();
        setSelectedTask(null);
      }
    } catch (err) {
      console.error('Error accepting commission:', err);
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

      {/* Status Filters (Deterministic) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs text-emerald-300/80 pr-2 border-r border-emerald-500/30">
          <Filter className="w-3.5 h-3.5 text-pink-300" />
          <span>Status:</span>
        </div>
        {['All', 'Requested', 'Accepted', 'In Progress', 'Review', 'Completed'].map(status => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${activeStatus === status
                ? 'bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 shadow-md shadow-pink-500/25'
                : 'bg-[#091f1b]/80 text-emerald-200/80 hover:text-white border border-emerald-500/25 hover:border-pink-300/40 hover:bg-[#0e2c26]'
              }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Deterministic Job Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {commissions.map(task => (
          <div
            key={task.task_id}
            onClick={() => setSelectedTask(task)}
            className="group cursor-pointer rounded-3xl glass-card hover:border-pink-400/50 transition-all duration-300 p-6 flex flex-col justify-between shadow-xl space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${task.current_status === 'Requested'
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                    : task.current_status === 'In Progress'
                      ? 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
                      : 'bg-[#0d2823] text-emerald-300/70 border border-emerald-500/20'
                  }`}>
                  {task.current_status}
                </span>
                <span className="text-xs font-black text-pink-300">
                  ${parseFloat(task.price_offered).toFixed(2)}
                </span>
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

            <div className="border-t border-emerald-500/15 pt-3 flex items-center justify-between text-xs text-emerald-300/70">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-pink-300" />
                <span>{task.client_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                <span>{new Date(task.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Post Brief Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0F1422] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Post Freelance Art Brief</h3>
              <button onClick={() => setIsPostModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {postError && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                {postError}
              </div>
            )}

            <form onSubmit={handlePostBrief} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase">Task Requirements *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2D Fantasy Character Illustration (Print Ready)"
                  value={formReq}
                  onChange={(e) => setFormReq(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase">Offered Budget ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 200.00"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase">Deadline *</label>
                  <input
                    type="date"
                    required
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase">Description & Reference Notes</label>
                <textarea
                  rows={3}
                  placeholder="Detail colors, dimensions, reference links, and deliverable format..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs bg-gray-900 text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-gray-950 hover:bg-amber-400"
                >
                  {postLoading ? 'Posting...' : 'Publish Brief'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0F1422] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {selectedTask.current_status}
              </span>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-xl font-bold text-white">{selectedTask.requirements}</h2>

            {selectedTask.description && (
              <p className="text-xs text-gray-300 leading-relaxed bg-gray-950/60 p-4 rounded-2xl border border-gray-800">
                {selectedTask.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                <p className="text-gray-400">Offered Budget</p>
                <p className="text-base font-black text-amber-400">${parseFloat(selectedTask.price_offered).toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                <p className="text-gray-400">Deadline</p>
                <p className="text-sm font-bold text-gray-200">{new Date(selectedTask.deadline).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
              <div className="text-xs text-gray-400">
                Posted by <span className="font-bold text-gray-200">{selectedTask.client_name}</span>
              </div>

              {selectedTask.current_status === 'Requested' && currentUser?.is_artist && (
                <button
                  onClick={() => handleApply(selectedTask)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-gray-950 hover:bg-amber-400"
                >
                  Accept Commission
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
