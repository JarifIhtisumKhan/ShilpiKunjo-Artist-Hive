import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, ArrowLeft, Plus, CheckCircle, Flame, Medal, Sparkles, Heart } from 'lucide-react';
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
    try {
      const res = await fetch(`/api/challenges/${challenge.challenge_id}/submissions`);
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error('Error loading submissions:', err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleVote = async (e, sub) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/challenges/submissions/${sub.submission_id}/vote`, { method: 'POST' });
      if (res.ok) {
        setSubmissions(prev =>
          prev.map(s => s.submission_id === sub.submission_id ? { ...s, vote_count: s.vote_count + 1 } : s)
            .sort((a, b) => b.vote_count - a.vote_count)
        );
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

  // Inside a Single Contest: View Details & Masonry Submissions
  if (selectedChallenge) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Back Button */}
        <button
          onClick={() => setSelectedChallenge(null)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Contests</span>
        </button>

        {/* Contest Header Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-gray-800 bg-[#0F1422] p-6 sm:p-10 shadow-2xl">
          {selectedChallenge.banner_url && (
            <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${selectedChallenge.banner_url})` }}></div>
          )}
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex items-center gap-2.5">
              <span className={`text-[11px] font-extrabold uppercase px-3 py-1 rounded-full ${
                selectedChallenge.status === 'Active'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}>
                {selectedChallenge.status} Contest
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Deadline: {new Date(selectedChallenge.deadline).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {selectedChallenge.title}
            </h1>
            <p className="text-sm text-gray-300 leading-relaxed">
              {selectedChallenge.description}
            </p>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Users className="w-4 h-4 text-amber-400" />
                <span>{submissions.length} Submissions entered</span>
              </div>

              {selectedChallenge.status === 'Active' && currentUser?.is_artist && (
                <button
                  onClick={openSubmitModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-gray-950 hover:opacity-95 shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Submit Artwork Entry</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Gallery Submissions Header */}
        <div className="flex items-center justify-between pt-2 border-b border-gray-800/80 pb-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Contest Artwork Submissions
            </h2>
            <p className="text-xs text-gray-400">Masonry gallery with live community voting and dynamic leaderboard</p>
          </div>
        </div>

        {/* REUSING THE MASONRY ENGINE for Contest Submissions */}
        <MasonryEngine
          items={submissions}
          isLoading={submissionsLoading}
          emptyMessage="No artworks submitted to this contest yet. Be the first to enter!"
          renderItem={(sub, index) => {
            const rank = index + 1;
            return (
              <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 group shadow-lg hover:border-amber-500/50 transition-all duration-300">
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
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500 text-gray-950 font-black text-xs shadow-lg">
                      <Medal className="w-3.5 h-3.5" /> #1 Rank
                    </span>
                  )}
                  {rank === 2 && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-300 text-gray-950 font-black text-xs shadow-lg">
                      <Medal className="w-3.5 h-3.5" /> #2 Rank
                    </span>
                  )}
                  {rank === 3 && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-800 text-amber-100 font-black text-xs shadow-lg">
                      <Medal className="w-3.5 h-3.5" /> #3 Rank
                    </span>
                  )}
                </div>

                {/* Overlay Metadata & Vote Button */}
                <div className="p-3.5 bg-gradient-to-t from-gray-950 via-gray-900/90 to-transparent flex flex-col gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white truncate">{sub.artwork_title}</h4>
                    <p className="text-[11px] text-gray-400">By {sub.artist_name}</p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-gray-800/80">
                    <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" />
                      {sub.vote_count} Votes
                    </span>

                    {selectedChallenge.status === 'Active' && (
                      <button
                        onClick={(e) => handleVote(e, sub)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-gray-950 transition-colors border border-amber-500/30"
                      >
                        + Vote
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }}
        />

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-950 via-[#101524] to-gray-950 p-6 sm:p-8 rounded-3xl border border-gray-800/80 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black uppercase tracking-wider text-amber-400">Creative Arena</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Art Challenges & Competitions
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
          Participate in themed creative competitions, submit your artwork entries, and vote on community leaderboard rankings.
        </p>
      </div>

      {/* Contest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map(ch => (
          <div
            key={ch.challenge_id}
            onClick={() => openChallengeDetails(ch)}
            className="group cursor-pointer rounded-3xl overflow-hidden bg-gray-900/90 border border-gray-800 hover:border-amber-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between"
          >
            <div>
              {/* Banner */}
              <div className="h-44 w-full relative overflow-hidden bg-black/60">
                <img
                  src={ch.banner_url}
                  alt={ch.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full backdrop-blur-md ${
                    ch.status === 'Active'
                      ? 'bg-amber-500 text-gray-950 shadow-md'
                      : 'bg-gray-900/90 text-gray-400 border border-gray-700'
                  }`}>
                    {ch.status}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                  {ch.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                  {ch.description}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 pt-0 flex items-center justify-between border-t border-gray-800/60 mt-3 pt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Ends: {new Date(ch.deadline).toLocaleDateString()}
              </span>
              <span className="font-bold text-gray-300 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                {ch.entry_count || 0} Entries
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
