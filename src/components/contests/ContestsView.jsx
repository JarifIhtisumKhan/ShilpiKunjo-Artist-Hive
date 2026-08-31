import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, ArrowLeft, Plus, CheckCircle, Flame, Medal, Sparkles, Heart, Crown, LayoutGrid, ListOrdered, Eye, X, Image as ImageIcon, StopCircle, Trash2, ShieldCheck, AlertTriangle, Clock } from 'lucide-react';
import MasonryEngine from '../common/MasonryEngine.jsx';

export default function ContestsView({ currentUser }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [userArtworks, setUserArtworks] = useState([]);
  const [selectedArtId, setSelectedArtId] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [contestViewMode, setContestViewMode] = useState('leaderboard'); // 'leaderboard' or 'gallery'
  const [previewArtwork, setPreviewArtwork] = useState(null);
  const [userVotes, setUserVotes] = useState([]);

  // Admin Contest Creation & Termination States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createDeadline, setCreateDeadline] = useState('');
  const [createStartDate, setCreateStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [createBannerUrl, setCreateBannerUrl] = useState('');
  const [createLimit, setCreateLimit] = useState('');
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/challenges');
      const data = await res.json();
      setChallenges(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const openChallengeDetails = async (challenge) => {
    setSelectedChallenge(challenge);
    setSubmissionsLoading(true);
    setContestViewMode('leaderboard');
    try {
      const url = currentUser?.user_id
        ? `/api/challenges/${challenge.challenge_id}/submissions?user_id=${currentUser.user_id}`
        : `/api/challenges/${challenge.challenge_id}/submissions`;
      const res = await fetch(url);
      const data = await res.json();
      setSubmissions(data.submissions || []);
      setUserVotes(Array.isArray(data.user_votes) ? data.user_votes : []);
    } catch (err) {
      console.error('Error loading submissions:', err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleVote = async (e, sub) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('Please log in to vote for contest entries.');
      return;
    }
    if (Number(sub.artist_id) === Number(currentUser.user_id)) {
      alert('Contestants cannot vote for their own submissions.');
      return;
    }
    if (userVotes.includes(sub.submission_id)) {
      alert('You have already cast your vote for this contest entry.');
      return;
    }

    try {
      const res = await fetch(`/api/challenges/submissions/${sub.submission_id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.user_id })
      });
      const data = await res.json();
      if (res.ok) {
        setUserVotes(prev => [...prev, sub.submission_id]);
        setSubmissions(prev =>
          prev.map(s => s.submission_id === sub.submission_id ? { ...s, vote_count: data.vote_count || s.vote_count + 1 } : s)
            .sort((a, b) => b.vote_count - a.vote_count)
        );
      } else {
        alert(data.error || 'Failed to record vote');
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const openSubmitModal = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/artworks?artist_id=${currentUser.user_id}`);
      const data = await res.json();
      setUserArtworks(Array.isArray(data) ? data : []);
      if (data.length > 0) setSelectedArtId(data[0].art_id);
      setIsSubmitModalOpen(true);
    } catch (err) {
      console.error('Error loading user art:', err);
    }
  };

  const handleSubmitEntry = async (e) => {
    e.preventDefault();
    if (!selectedArtId || !selectedChallenge) return;
    setSubmitError('');

    try {
      const res = await fetch(`/api/challenges/${selectedChallenge.challenge_id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          art_id: selectedArtId,
          artist_id: currentUser.user_id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit entry');

      setIsSubmitModalOpen(false);
      openChallengeDetails(selectedChallenge);
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  // Admin Handler: Create Contest
  const handleCreateContest = async (e) => {
    e.preventDefault();
    if (!createTitle.trim() || !createDescription.trim() || !createDeadline) {
      setCreateError('Please fill in title, description, and deadline date.');
      return;
    }
    setCreateError('');
    setIsCreating(true);

    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.user_id,
          title: createTitle.trim(),
          description: createDescription.trim(),
          start_date: createStartDate,
          deadline: createDeadline,
          banner_url: createBannerUrl.trim(),
          participation_limit: createLimit ? Number(createLimit) : null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create contest');

      setIsCreateModalOpen(false);
      setCreateTitle('');
      setCreateDescription('');
      setCreateDeadline('');
      setCreateBannerUrl('');
      setCreateLimit('');
      fetchChallenges();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  // Admin Handler: Terminate Contest (Locks submissions and finalizes official standings)
  const handleTerminateContest = async () => {
    if (!currentUser?.is_admin || !selectedChallenge) return;
    const confirm = window.confirm(`Are you sure you want to terminate "${selectedChallenge.title}"? This will officially lock submissions, close voting, and finalize the leaderboard standings.`);
    if (!confirm) return;

    setIsTerminating(true);
    try {
      const res = await fetch(`/api/challenges/${selectedChallenge.challenge_id}/terminate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.user_id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to terminate contest');

      setSelectedChallenge(prev => prev ? { ...prev, status: 'Completed' } : null);
      fetchChallenges();
      if (selectedChallenge) {
        openChallengeDetails({ ...selectedChallenge, status: 'Completed' });
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsTerminating(false);
    }
  };

  // Admin Handler: Delete Contest
  const handleDeleteContest = async () => {
    if (!currentUser?.is_admin || !selectedChallenge) return;
    const confirm = window.confirm(`Permanently delete contest "${selectedChallenge.title}" and all associated entries? This action is irreversible.`);
    if (!confirm) return;

    try {
      const res = await fetch(`/api/challenges/${selectedChallenge.challenge_id}?user_id=${currentUser.user_id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete contest');

      setSelectedChallenge(null);
      fetchChallenges();
    } catch (err) {
      alert(err.message);
    }
  };

  // Inside a Single Contest: View Details, Separate Leaderboard & Masonry Submissions
  if (selectedChallenge) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 relative z-10">

        {/* Back Button */}
        <button
          onClick={() => setSelectedChallenge(null)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#091f1b]/80 border border-emerald-500/30 text-emerald-200 hover:text-white hover:border-pink-400 transition-colors text-xs font-semibold backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Contests</span>
        </button>

        {/* Contest Header Banner (Reduced Opacity) */}
        <div className="relative rounded-3xl overflow-hidden border border-emerald-400/20 bg-[#0c2428]/40 backdrop-blur-md p-6 sm:p-10 shadow-2xl">
          {selectedChallenge.banner_url && (
            <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${selectedChallenge.banner_url})` }}></div>
          )}
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex items-center gap-2.5">
              <span className={`text-[11px] font-extrabold uppercase px-3 py-1 rounded-full ${
                selectedChallenge.status === 'Active'
                  ? 'bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 font-bold shadow-sm'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}>
                {selectedChallenge.status} Contest
              </span>
              <span className="text-xs text-teal-200/80 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-pink-300" />
                Deadline: {new Date(selectedChallenge.deadline).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              {selectedChallenge.title}
            </h1>
            <p className="text-sm text-teal-100/80 leading-relaxed">
              {selectedChallenge.description}
            </p>

            <div className="flex items-center gap-4 pt-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-emerald-300">
                <Users className="w-4 h-4 text-pink-300" />
                <span>{submissions.length} Submissions entered</span>
              </div>

              {selectedChallenge.status === 'Active' && currentUser?.is_artist && (
                <button
                  onClick={openSubmitModal}
                  className="px-4 py-2 rounded-2xl text-xs font-bold bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 hover:opacity-95 shadow-lg shadow-pink-500/25 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Submit Artwork Entry 🌸</span>
                </button>
              )}
            </div>

            {/* Admin Management Actions */}
            {currentUser?.is_admin && (
              <div className="flex items-center gap-2.5 pt-3 border-t border-emerald-500/20 flex-wrap">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/25">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  Admin Controls
                </span>

                {selectedChallenge.status === 'Active' && (
                  <button
                    onClick={handleTerminateContest}
                    disabled={isTerminating}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500 hover:text-white transition-all flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95"
                  >
                    <StopCircle className="w-3.5 h-3.5" />
                    <span>{isTerminating ? 'Terminating...' : 'Terminate Contest (Admin)'}</span>
                  </button>
                )}

                <button
                  onClick={handleDeleteContest}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-900/80 text-gray-400 border border-gray-700 hover:bg-red-900/40 hover:text-red-300 hover:border-red-500/40 transition-all flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Contest</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section View Mode Selector & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 pb-3 border-b border-emerald-500/20">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-300" />
              <span>Contest Standings & Submissions</span>
            </h2>
            <p className="text-xs text-teal-200/70 mt-0.5">
              Live community ranked leaderboard and visual artwork showcase
            </p>
          </div>

          {/* View Mode Toggle: Leaderboard vs Gallery */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#061412]/80 border border-emerald-500/30 backdrop-blur-md">
            <button
              onClick={() => setContestViewMode('leaderboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                contestViewMode === 'leaderboard'
                  ? 'bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 shadow-md'
                  : 'text-emerald-200/80 hover:text-white'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Ranked Leaderboard</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">
                {submissions.length}
              </span>
            </button>

            <button
              onClick={() => setContestViewMode('gallery')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                contestViewMode === 'gallery'
                  ? 'bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 shadow-md'
                  : 'text-emerald-200/80 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Masonry Gallery</span>
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------
            SEPARATE LEADERBOARD SECTION (SINGLE ROW PER ARTIST)
           ---------------------------------------------------- */}
        {contestViewMode === 'leaderboard' && (
          <div className="space-y-3">
            {submissionsLoading ? (
              <div className="text-center py-16">
                <div className="w-10 h-10 border-4 border-pink-400/30 border-t-pink-400 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-teal-300">Calculating real-time contest rankings...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12 bg-[#0c2428]/30 rounded-3xl border border-emerald-500/20 p-8">
                <Trophy className="w-12 h-12 text-pink-300/40 mx-auto mb-3 animate-pulse" />
                <h3 className="text-base font-bold text-white mb-1">No Entries Submitted Yet</h3>
                <p className="text-xs text-teal-200/70 max-w-sm mx-auto">
                  Be the first artist to submit your artwork to this challenge and claim the #1 spot on the leaderboard!
                </p>
                {selectedChallenge.status === 'Active' && currentUser?.is_artist && (
                  <button
                    onClick={openSubmitModal}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 shadow-md"
                  >
                    Submit First Entry
                  </button>
                )}
              </div>
            ) : (
              submissions.map((sub, index) => {
                const rank = index + 1;
                const isSelf = currentUser && Number(sub.artist_id) === Number(currentUser.user_id);

                return (
                  <div
                    key={sub.submission_id}
                    className={`group relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl transition-all duration-300 border backdrop-blur-md shadow-lg ${
                      rank === 1
                        ? 'bg-gradient-to-r from-amber-500/20 via-[#0d2a26]/90 to-[#071916]/90 border-amber-400/50 shadow-amber-500/10 hover:border-amber-300'
                        : rank === 2
                        ? 'bg-gradient-to-r from-slate-400/15 via-[#0d2a26]/90 to-[#071916]/90 border-slate-300/40 hover:border-slate-200'
                        : rank === 3
                        ? 'bg-gradient-to-r from-amber-700/15 via-[#0d2a26]/90 to-[#071916]/90 border-amber-600/35 hover:border-amber-500'
                        : 'glass-card border-emerald-500/20 hover:border-pink-300/40'
                    }`}
                  >
                    {/* Left Column: Rank Badge + Artist Identity */}
                    <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
                      
                      {/* Rank Indicator Badge */}
                      <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl shadow-md">
                        {rank === 1 ? (
                          <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-gray-950 flex flex-col items-center justify-center ring-2 ring-amber-300/70 shadow-lg shadow-amber-500/20">
                            <Crown className="w-4 h-4 fill-gray-950 text-gray-950" />
                            <span className="text-[11px] leading-none font-black mt-0.5">#1</span>
                          </div>
                        ) : rank === 2 ? (
                          <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-slate-200 to-gray-400 text-gray-950 flex flex-col items-center justify-center ring-1 ring-slate-200/60 shadow-md">
                            <Medal className="w-4 h-4 fill-gray-950 text-gray-950" />
                            <span className="text-[11px] leading-none font-black mt-0.5">#2</span>
                          </div>
                        ) : rank === 3 ? (
                          <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-900 text-amber-100 flex flex-col items-center justify-center ring-1 ring-amber-600/50 shadow-md">
                            <Medal className="w-4 h-4 fill-amber-200 text-amber-200" />
                            <span className="text-[11px] leading-none font-black mt-0.5">#3</span>
                          </div>
                        ) : (
                          <div className="w-full h-full rounded-2xl bg-[#061412]/80 border border-emerald-500/30 text-emerald-300 flex items-center justify-center text-xs font-bold font-mono">
                            #{rank}
                          </div>
                        )}
                      </div>

                      {/* Artist Details (Prioritized) */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-pink-400 via-teal-300 to-amber-300 p-0.5 flex-shrink-0 shadow-md">
                          <div className="w-full h-full bg-[#082025] rounded-[10px] flex items-center justify-center font-bold text-pink-300 text-xs sm:text-sm">
                            {sub.artist_name?.charAt(0) || 'A'}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-pink-300 transition-colors">
                              {sub.artist_name}
                            </h3>
                            {isSelf && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-400/20 text-teal-200 border border-teal-400/30">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-teal-300/80 truncate">
                            @{sub.artist_username || 'artist'} • <span className="text-emerald-200/60">{sub.artist_bio || 'Featured Creator'}</span>
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Middle Column: Thumbnail-Sized Artwork in a Single Row */}
                    <div 
                      onClick={() => setPreviewArtwork(sub)}
                      title="Click to view full artwork"
                      className="flex items-center gap-3 p-2 rounded-2xl bg-[#061412]/70 border border-emerald-500/20 hover:border-pink-400/50 cursor-pointer transition-all flex-shrink-0 w-full md:w-auto min-w-[240px] sm:min-w-[280px]"
                    >
                      {/* Compact Thumbnail Image */}
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 border border-emerald-400/30 shadow-md group/thumb">
                        <img
                          src={sub.media_url}
                          alt={sub.artwork_title}
                          className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      </div>

                      {/* Artwork Metadata Beside Thumbnail */}
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-pink-500/15 text-pink-300 border border-pink-500/30">
                          {sub.artwork_type || 'Digital'}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-1">
                          {sub.artwork_title}
                        </h4>
                        <p className="text-[10px] text-teal-300/60">
                          Submitted: {new Date(sub.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Right Column: Votes Count & Interactive Action */}
                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-emerald-500/15">
                      <div className="flex flex-col items-start md:items-end">
                        <span className="flex items-center gap-1 text-base sm:text-lg font-black text-pink-300 font-mono">
                          <Flame className="w-4 h-4 fill-pink-400 text-pink-400 animate-pulse" />
                          {sub.vote_count}
                        </span>
                        <span className="text-[10px] text-teal-200/70 font-semibold uppercase tracking-wider">
                          Votes
                        </span>
                      </div>

                      {selectedChallenge.status === 'Active' && (
                        isSelf ? (
                          <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-950/70 text-teal-200 border border-teal-400/30">
                            Your Entry
                          </span>
                        ) : userVotes.includes(sub.submission_id) ? (
                          <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-pink-300" />
                            <span>Voted ✓</span>
                          </span>
                        ) : (
                          <button
                            onClick={(e) => handleVote(e, sub)}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 hover:scale-105 active:scale-95 shadow-md shadow-pink-500/25 transition-all flex items-center gap-1.5"
                          >
                            <Flame className="w-3.5 h-3.5 fill-gray-950" />
                            <span>+ Vote</span>
                          </button>
                        )
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ----------------------------------------------------
            MASONRY ART GALLERY VIEW (ALTERNATIVE SHOWCASE)
           ---------------------------------------------------- */}
        {contestViewMode === 'gallery' && (
          <MasonryEngine
            items={submissions}
            isLoading={submissionsLoading}
            emptyMessage="No artworks submitted to this contest yet. Be the first to enter!"
            renderItem={(sub, index) => {
              const rank = index + 1;
              const isSubSelf = currentUser && Number(sub.artist_id) === Number(currentUser.user_id);
              const isSubVoted = userVotes.includes(sub.submission_id);

              return (
                <div 
                  onClick={() => setPreviewArtwork(sub)}
                  className="relative rounded-2xl overflow-hidden glass-card group shadow-lg hover:border-pink-400/50 transition-all duration-300 cursor-pointer"
                >
                  {/* Artwork Image */}
                  <img
                    src={sub.media_url}
                    alt={sub.artwork_title}
                    loading="lazy"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Rank Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    {rank === 1 && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-300 text-gray-950 font-black text-xs shadow-lg">
                        <Crown className="w-3.5 h-3.5 fill-gray-950" /> #1 Rank
                      </span>
                    )}
                    {rank === 2 && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-300 text-gray-950 font-black text-xs shadow-lg">
                        <Medal className="w-3.5 h-3.5 fill-gray-950" /> #2 Rank
                      </span>
                    )}
                    {rank === 3 && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-800 text-amber-100 font-black text-xs shadow-lg">
                        <Medal className="w-3.5 h-3.5 fill-amber-200" /> #3 Rank
                      </span>
                    )}
                  </div>

                  {/* Overlay Metadata & Vote Button */}
                  <div className="p-3.5 bg-gradient-to-t from-gray-950 via-gray-900/95 to-transparent flex flex-col gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white truncate">{sub.artwork_title}</h4>
                      <p className="text-[11px] text-teal-300/80">By {sub.artist_name}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-emerald-500/20">
                      <span className="text-xs font-extrabold text-pink-300 flex items-center gap-1 font-mono">
                        <Flame className="w-3.5 h-3.5 fill-pink-400" />
                        {sub.vote_count} Votes
                      </span>

                      {selectedChallenge.status === 'Active' && (
                        isSubSelf ? (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-teal-950/70 text-teal-200 border border-teal-400/30">
                            Your Entry
                          </span>
                        ) : isSubVoted ? (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-pink-300" />
                            <span>Voted</span>
                          </span>
                        ) : (
                          <button
                            onClick={(e) => handleVote(e, sub)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 shadow-sm hover:scale-105 transition-all"
                          >
                            + Vote
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            }}
          />
        )}

        {/* Artwork Thumbnail Full Preview Lightbox Modal */}
        {previewArtwork && (
          <div 
            onClick={() => setPreviewArtwork(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full glass-panel-cute rounded-3xl overflow-hidden border border-pink-300/40 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30">
                    {previewArtwork.artwork_type || 'Digital'}
                  </span>
                  <h3 className="text-lg font-bold text-white">{previewArtwork.artwork_title}</h3>
                </div>
                <button 
                  onClick={() => setPreviewArtwork(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[60vh] rounded-2xl overflow-hidden bg-black/50 flex items-center justify-center border border-emerald-500/20">
                <img 
                  src={previewArtwork.media_url} 
                  alt={previewArtwork.artwork_title}
                  className="max-h-[60vh] w-auto object-contain"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-400 to-teal-300 p-0.5">
                    <div className="w-full h-full bg-[#082025] rounded-[8px] flex items-center justify-center font-bold text-pink-300 text-xs">
                      {previewArtwork.artist_name?.charAt(0) || 'A'}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{previewArtwork.artist_name}</h4>
                    <p className="text-[11px] text-teal-300/80">Submitted entry • {new Date(previewArtwork.submitted_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-sm font-bold text-pink-300 font-mono">
                    <Flame className="w-4 h-4 fill-pink-400 text-pink-400" />
                    {previewArtwork.vote_count} Votes
                  </span>
                  {selectedChallenge.status === 'Active' && (
                    (currentUser && Number(previewArtwork.artist_id) === Number(currentUser.user_id)) ? (
                      <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-950/70 text-teal-200 border border-teal-400/30">
                        Your Entry
                      </span>
                    ) : userVotes.includes(previewArtwork.submission_id) ? (
                      <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-pink-300" />
                        <span>Voted ✓</span>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          handleVote(e, previewArtwork);
                        }}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 shadow-md hover:scale-105 transition-all"
                      >
                        + Vote
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Artwork to Contest Modal */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-md bg-[#0F1422] border border-gray-800 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-2">Submit to Contest</h3>
              <p className="text-xs text-gray-400 mb-4">Select one of your existing published artworks to submit as your official entry.</p>

              {submitError && (
                <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                  {submitError}
                </div>
              )}

              {userArtworks.length === 0 ? (
                <p className="text-xs text-amber-400 italic mb-4">You have not published any artworks yet. Publish an artwork on the Feed first!</p>
              ) : (
                <form onSubmit={handleSubmitEntry} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">Select Artwork</label>
                    <select
                      value={selectedArtId}
                      onChange={(e) => setSelectedArtId(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500"
                    >
                      {userArtworks.map(art => (
                        <option key={art.art_id} value={art.art_id}>{art.title} ({art.type})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSubmitModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs bg-gray-900 text-gray-400 hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-gray-950 hover:bg-amber-400"
                    >
                      Confirm Submission
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    );
  }

  // Contest Listing Grid (Status-Aware)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 relative z-10">

      {/* Header Banner (Reduced Opacity) */}
      <div className="bg-[#0c2428]/40 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-emerald-400/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <Trophy className="w-4 h-4 text-pink-300" />
            <span className="text-[11px] font-black uppercase tracking-wider text-pink-300 px-2.5 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30">
              Creative Arena 🌸
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Art Challenges & Competitions</span>
            <span className="text-xl">🎏</span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1.5">
            Participate in themed creative competitions, submit your artwork entries, and vote on community leaderboard rankings.
          </p>
        </div>

        {/* Admin Create Contest Button */}
        {currentUser?.is_admin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="relative z-10 px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 hover:opacity-95 shadow-lg shadow-pink-500/25 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Contest (Admin) 👑</span>
          </button>
        )}
      </div>

      {/* Contest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map(ch => (
          <div
            key={ch.challenge_id}
            onClick={() => openChallengeDetails(ch)}
            className="group cursor-pointer rounded-3xl overflow-hidden glass-card hover:border-pink-400/50 transition-all duration-300 shadow-xl flex flex-col justify-between"
          >
            <div>
              {/* Banner */}
              <div className="h-44 w-full relative overflow-hidden bg-black/50">
                <img
                  src={ch.banner_url}
                  alt={ch.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full backdrop-blur-md ${ch.status === 'Active'
                      ? 'bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 shadow-md'
                      : 'bg-[#091f1b]/90 text-emerald-200 border border-emerald-500/20'
                    }`}>
                    {ch.status}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-bold text-white group-hover:text-pink-300 transition-colors leading-snug">
                  {ch.title}
                </h3>
                <p className="text-xs text-emerald-200/70 line-clamp-2 leading-relaxed">
                  {ch.description}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 pt-0 flex items-center justify-between border-t border-emerald-500/15 mt-3 pt-3 text-xs text-emerald-300/70">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-pink-300" />
                Ends: {new Date(ch.deadline).toLocaleDateString()}
              </span>
              <span className="font-bold text-emerald-200 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-300" />
                {ch.entry_count || 0} Entries
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Create Contest Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg glass-panel-cute rounded-3xl p-6 sm:p-7 shadow-2xl border border-pink-300/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-400/15 text-amber-300">
                  <Trophy className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">Create New Art Contest</h3>
                  <p className="text-xs text-teal-200/70">Admin configuration for themed community competitions</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateContest} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-teal-100 mb-1">Contest Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monsoon Reverie 2026: Rainscapes of Bengal"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="w-full bg-[#061613]/90 border border-emerald-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-emerald-300/40 focus:outline-none focus:border-pink-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-teal-100 mb-1">Theme Description & Guidelines *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the creative brief, acceptable visual styles, themes, and awards..."
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  className="w-full bg-[#061613]/90 border border-emerald-500/30 rounded-xl p-3 text-xs text-white placeholder-emerald-300/40 focus:outline-none focus:border-pink-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-teal-100 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={createStartDate}
                    onChange={(e) => setCreateStartDate(e.target.value)}
                    className="w-full bg-[#061613]/90 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-teal-100 mb-1">Submission Deadline *</label>
                  <input
                    type="date"
                    required
                    value={createDeadline}
                    onChange={(e) => setCreateDeadline(e.target.value)}
                    className="w-full bg-[#061613]/90 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-teal-100 mb-1">Banner Image URL (Google Drive or Web link)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or Google Drive share link"
                  value={createBannerUrl}
                  onChange={(e) => setCreateBannerUrl(e.target.value)}
                  className="w-full bg-[#061613]/90 border border-emerald-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-emerald-300/40 focus:outline-none focus:border-pink-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-teal-100 mb-1">Max Entries Limit (Optional)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 50"
                  value={createLimit}
                  onChange={(e) => setCreateLimit(e.target.value)}
                  className="w-full bg-[#061613]/90 border border-emerald-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-emerald-300/40 focus:outline-none focus:border-pink-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-emerald-500/20">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-900/80 text-gray-400 hover:text-white border border-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 hover:opacity-95 shadow-md shadow-pink-500/25 flex items-center gap-1.5"
                >
                  <Trophy className="w-3.5 h-3.5 fill-gray-950" />
                  <span>{isCreating ? 'Publishing...' : 'Launch Contest (Admin)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
