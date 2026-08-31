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
  }, [activeStatus, searchQuery, currentUser]);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      let url = `/api/commissions?status=${encodeURIComponent(activeStatus)}`;
      if (currentUser?.user_id) {
        url += `&userId=${encodeURIComponent(currentUser.user_id)}`;
      }
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

  const canAccessTask = (task) => {
    if (!task) return false;
    if (task.current_status === 'Requested') return true;
    if (!currentUser) return false;
    return (
      Number(task.client_id) === Number(currentUser.user_id) ||
      Number(task.artist_id) === Number(currentUser.user_id)
    );
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

  const handleUpdateStatus = async (task, newStatus) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/commissions/${task.task_id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_status: newStatus,
          artist_id: task.artist_id || currentUser.user_id,
          userId: currentUser.user_id
        })
      });
      if (res.ok) {
        fetchCommissions();
        setSelectedTask(null);
      }
    } catch (err) {
      console.error('Error updating commission status:', err);
    }
  };

  const accessibleCommissions = commissions.filter(canAccessTask);

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
            className="btn-stone w-full sm:w-auto px-4 py-2 rounded-2xl text-xs font-bold text-stone-100 shadow-md flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Post Contract Brief</span>
          </button>
        </div>
      </div>

      {/* Status Filters (Deterministic) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs text-gray-800 font-bold pr-2 border-r border-[#ab946a]">
          <Filter className="w-3.5 h-3.5 text-stone-700" />
          <span>Status:</span>
        </div>
        {['All', 'Requested', 'Accepted', 'In Progress', 'Review', 'Completed'].map(status => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeStatus === status
                ? 'btn-stone text-stone-100 shadow-md'
                : 'bg-stone-700/30 text-stone-900 hover:text-stone-950 border border-stone-600/40 hover:bg-stone-700/50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Deterministic Job Board Grid */}
      {accessibleCommissions.length === 0 ? (
        <div className="text-center py-12 bg-[#c6ae82]/40 rounded-3xl border border-[#ab946a] p-8">
          <Briefcase className="w-10 h-10 text-[#315812] mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-gray-900">No Visible Commissions</h3>
          <p className="text-xs text-gray-700 max-w-md mx-auto mt-1">
            There are no contract briefs matching this filter, or active/completed tasks are private to their client and commissioner.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessibleCommissions.map(task => (
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
                      : task.current_status === 'Review'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : task.current_status === 'Completed'
                      ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
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
                  <span>Client: {task.client_name}</span>
                </div>
                {task.artist_name && (
                  <div className="text-[11px] text-amber-300/80 font-medium">
                    Artist: {task.artist_name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
      {selectedTask && canAccessTask(selectedTask) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#c6ae82] border border-[#ab946a] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {selectedTask.current_status}
              </span>
              <button onClick={() => setSelectedTask(null)} className="text-gray-700 hover:text-gray-950">
                <X className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-xl font-bold text-gray-950">{selectedTask.requirements}</h2>
            
            {selectedTask.description && (
              <p className="text-xs text-gray-900 leading-relaxed bg-[#b8a074] p-4 rounded-2xl border border-[#9d865c]">
                {selectedTask.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-[#b8a074] border border-[#9d865c]">
                <p className="text-gray-800 text-[10px] uppercase font-bold">Offered Budget</p>
                <p className="text-base font-black text-[#315812]">${parseFloat(selectedTask.price_offered).toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#b8a074] border border-[#9d865c]">
                <p className="text-gray-800 text-[10px] uppercase font-bold">Deadline</p>
                <p className="text-sm font-bold text-gray-950">{new Date(selectedTask.deadline).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="text-xs text-gray-800 pt-1 space-y-1">
              <p>Client: <span className="font-bold text-gray-950">{selectedTask.client_name}</span></p>
              {selectedTask.artist_name && (
                <p>Assigned Artist / Commissioner: <span className="font-bold text-[#315812]">{selectedTask.artist_name}</span></p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#ab946a]">
              {selectedTask.current_status === 'Requested' && currentUser?.is_artist && (
                <button
                  onClick={() => handleUpdateStatus(selectedTask, 'Accepted')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#aca04d] to-[#315812] text-white hover:opacity-95"
                >
                  Accept Commission
                </button>
              )}

              {selectedTask.current_status === 'Accepted' && Number(selectedTask.artist_id) === Number(currentUser?.user_id) && (
                <button
                  onClick={() => handleUpdateStatus(selectedTask, 'In Progress')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500"
                >
                  Mark In Progress
                </button>
              )}

              {selectedTask.current_status === 'In Progress' && Number(selectedTask.artist_id) === Number(currentUser?.user_id) && (
                <button
                  onClick={() => handleUpdateStatus(selectedTask, 'Review')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-500"
                >
                  Submit for Review
                </button>
              )}

              {selectedTask.current_status === 'Review' && Number(selectedTask.client_id) === Number(currentUser?.user_id) && (
                <button
                  onClick={() => handleUpdateStatus(selectedTask, 'Completed')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-600"
                >
                  Approve & Complete Task
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
