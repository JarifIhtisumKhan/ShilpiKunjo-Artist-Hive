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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#c6ae82] p-6 sm:p-8 rounded-3xl border border-[#ab946a] shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-4 h-4 text-[#315812]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#315812]">Freelance Board</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Artist Commission Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-gray-800 mt-1 max-w-xl">
            Connect clients with specialized visual artists for custom artwork, illustration contracts, and character designs.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-700 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search contract briefs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#b8a074] border border-[#9d865c] rounded-2xl pl-10 pr-4 py-2 text-xs text-gray-950 placeholder-gray-700 focus:outline-none focus:border-[#315812]"
            />
          </div>

          <button
            onClick={() => setIsPostModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 rounded-2xl text-xs font-bold bg-gradient-to-r from-[#aca04d] to-[#315812] text-white hover:opacity-95 shadow-md shadow-[#315812]/20 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Post Contract Brief</span>
          </button>
        </div>
      </div>

      {/* Status Filters (Deterministic) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs text-gray-700 pr-2 border-r border-[#ab946a]">
          <Filter className="w-3.5 h-3.5 text-[#315812]" />
          <span>Status:</span>
        </div>
        {['All', 'Requested', 'Accepted', 'In Progress', 'Review', 'Completed'].map(status => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeStatus === status
                ? 'bg-gradient-to-r from-[#aca04d] to-[#315812] text-white shadow-md shadow-[#315812]/20'
                : 'bg-[#d8c5a0] text-gray-800 hover:text-gray-950 border border-[#bfa980] hover:bg-[#aca04d]/30'
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
            className="group cursor-pointer rounded-3xl bg-gray-900/90 border border-gray-800 hover:border-amber-500/50 transition-all duration-300 p-6 flex flex-col justify-between shadow-xl space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  task.current_status === 'Requested'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : task.current_status === 'In Progress'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}>
                  {task.current_status}
                </span>
                <span className="text-xs font-black text-amber-400">
                  ${parseFloat(task.price_offered).toFixed(2)}
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                {task.requirements}
              </h3>

              {task.description && (
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              )}
            </div>

            <div className="border-t border-gray-800/60 pt-3 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>{task.client_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{new Date(task.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Post Brief Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#c6ae82] border border-[#ab946a] rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-950">Post Freelance Art Brief</h3>
              <button onClick={() => setIsPostModalOpen(false)} className="text-gray-700 hover:text-gray-950">
                <X className="w-4 h-4" />
              </button>
            </div>

            {postError && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs font-semibold">
                {postError}
              </div>
            )}

            <form onSubmit={handlePostBrief} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase">Task Requirements *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2D Fantasy Character Illustration (Print Ready)"
                  value={formReq}
                  onChange={(e) => setFormReq(e.target.value)}
                  className="w-full bg-[#b8a074] border border-[#9d865c] rounded-xl p-2.5 text-xs text-gray-950 focus:border-[#315812]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase">Offered Budget ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 200.00"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full bg-[#b8a074] border border-[#9d865c] rounded-xl p-2.5 text-xs text-gray-950 focus:border-[#315812]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase">Deadline *</label>
                  <input
                    type="date"
                    required
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full bg-[#b8a074] border border-[#9d865c] rounded-xl p-2.5 text-xs text-gray-950 focus:border-[#315812]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase">Description & Reference Notes</label>
                <textarea
                  rows={3}
                  placeholder="Detail colors, dimensions, reference links, and deliverable format..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-[#b8a074] border border-[#9d865c] rounded-xl p-2.5 text-xs text-gray-950 focus:border-[#315812] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs bg-[#b8a074] text-gray-800 hover:bg-[#a89064]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#aca04d] to-[#315812] text-white hover:opacity-95"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#c6ae82] border border-[#ab946a] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
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
