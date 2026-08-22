import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Sparkles, Briefcase, Trophy, Image, CheckCircle, Save, Plus, X, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import ArtworkDetailModal from '../feed/ArtworkDetailModal';

export default function DashboardView({ currentUser, onProfileUpdated }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('artworks');
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  // Form editable states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState('');
  const [availability, setAvailability] = useState('Available');
  const [expertise, setExpertise] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (currentUser) fetchProfile();
  }, [currentUser]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${currentUser.user_id}/profile`);
      const data = await res.json();
      if (data.user) {
        setProfileData(data.user);
        setName(data.user.name || '');
        setPhone(data.user.phone_number || '');
        setAddress(data.user.address || '');
        setBio(data.user.bio || 'Creative Visual Artist');
        setPortfolioLinks(data.user.portfolio_links || '');
        setAvailability(data.user.availability_status || 'Available');
        setExpertise(data.user.expertise || ['Digital Painting']);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpertise = () => {
    if (newTag.trim() && !expertise.includes(newTag.trim())) {
      setExpertise([...expertise, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveExpertise = (tag) => {
    setExpertise(expertise.filter(t => t !== tag));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users/${currentUser.user_id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone_number: phone,
          address,
          bio,
          portfolio_links: portfolioLinks,
          availability_status: availability,
          expertise
        })
      });
      if (res.ok) {
        setSaveMsg('Artist profile & skills saved to MariaDB successfully!');
        if (onProfileUpdated) {
          onProfileUpdated({
            ...currentUser,
            name,
            artist_bio: bio,
            availability_status: availability,
            expertise
          });
        }
        setTimeout(() => setSaveMsg(''), 3500);
      }
    } catch (err) {
      setSaveMsg('Failed to update profile.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading artist profile details from MariaDB...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      
      {/* Top Profile Header */}
      <div className="rounded-3xl border border-[#ab946a] bg-[#c6ae82] p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#aca04d] via-[#748729] to-[#315812] p-1 shadow-lg shadow-[#315812]/20">
            <div className="w-full h-full bg-[#b8a074] rounded-[14px] flex items-center justify-center font-black text-2xl text-[#315812]">
              {profileData?.name?.charAt(0) || 'A'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-950">{profileData?.name}</h1>
              <ShieldCheck className="w-5 h-5 text-[#315812]" />
            </div>
            <p className="text-xs text-gray-800">@{profileData?.username} • {profileData?.email}</p>
            <div className="flex items-center gap-2 pt-1">
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                availability === 'Available'
                  ? 'bg-emerald-500/20 text-emerald-800 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-800 border border-rose-500/30'
              }`}>
                Commissions: {availability}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#aca04d]/20 text-[#315812] border border-[#315812]/30">
                Verified Artist Profile
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="p-3.5 rounded-2xl bg-[#b8a074] border border-[#9d865c] text-center min-w-[95px]">
            <span className="block text-xl font-black text-gray-950">{profileData?.artworks?.length || 0}</span>
            <span className="text-[10px] uppercase font-bold text-gray-800">Artworks</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#b8a074] border border-[#9d865c] text-center min-w-[95px]">
            <span className="block text-xl font-black text-gray-950">{profileData?.commissions?.length || 0}</span>
            <span className="text-[10px] uppercase font-bold text-gray-800">Contracts</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#b8a074] border border-[#9d865c] text-center min-w-[95px]">
            <span className="block text-xl font-black text-gray-950">{profileData?.submissions?.length || 0}</span>
            <span className="text-[10px] uppercase font-bold text-gray-800">Contests</span>
          </div>
        </div>
      </div>

      {saveMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4" />
          {saveMsg}
        </div>
      )}

      {/* Main Grid: Profile Settings & Activity Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Consistent Artist Settings */}
        <div className="lg:col-span-1 rounded-3xl border border-[#ab946a] bg-[#c6ae82] p-6 space-y-5 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-[#ab946a]">
            <User className="w-4 h-4 text-[#315812]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-950">Artist Profile Settings</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+8801..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">Location / Address</label>
              <input
                type="text"
                placeholder="e.g. Dhaka, Bangladesh"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">Artist Bio & Statement</label>
              <textarea
                rows={3}
                placeholder="Describe your art style, tools, and inspirations..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 resize-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">Commission Availability</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 transition-colors"
              >
                <option value="Available">Available for Freelance Contracts</option>
                <option value="Busy">Currently Busy / Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">Expertise Tags (ArtistExpertise)</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {expertise.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    {tag}
                    <button type="button" onClick={() => handleRemoveExpertise(tag)} className="hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Add skill tag (e.g. Ink, 3D)..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddExpertise}
                  className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-white transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-gray-950 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 shadow-md shadow-amber-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Artist Profile</span>
            </button>
          </form>
        </div>

        {/* Right Column: Personal Activity Summaries */}
        <div className="lg:col-span-2 rounded-3xl border border-[#ab946a] bg-[#c6ae82] p-6 space-y-6 shadow-xl">
          
          {/* Subtab Buttons */}
          <div className="flex items-center gap-2 border-b border-[#ab946a] pb-3">
            {[
              { id: 'artworks', label: 'My Published Artworks', icon: Image, count: profileData?.artworks?.length },
              { id: 'commissions', label: 'My Commission Tasks', icon: Briefcase, count: profileData?.commissions?.length },
              { id: 'submissions', label: 'My Contest Entries', icon: Trophy, count: profileData?.submissions?.length }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#aca04d] to-[#315812] text-white shadow-md shadow-[#315812]/20'
                      : 'text-gray-800 hover:text-gray-950 bg-[#b8a074] border border-[#9d865c]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black/20 text-white' : 'bg-[#a89064] text-gray-950'}`}>
                    {tab.count || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Artworks */}
          {activeSubTab === 'artworks' && (
            <div className="space-y-4">
              {profileData?.artworks?.length === 0 ? (
                <div className="py-12 text-center rounded-2xl bg-gray-950/40 border border-gray-800/60 p-6 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center mx-auto">
                    <Image className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-200">No Artworks Published Yet</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Share your creations with the Bangladeshi art community. Your published artworks will appear in the Feed.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {profileData?.artworks?.map(art => (
                    <div
                      key={art.art_id}
                      onClick={() => setSelectedArtwork(art)}
                      className="rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 shadow-md group cursor-pointer hover:border-amber-500/50 transition-all"
                    >
                      <img src={art.media_url} alt={art.title} className="h-32 w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="p-3">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition-colors">{art.title}</h4>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400">
                          <span className="text-amber-400 font-semibold">{art.type}</span>
                          <span>{art.react_count || 0} Likes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Commissions */}
          {activeSubTab === 'commissions' && (
            <div className="space-y-4">
              {profileData?.commissions?.length === 0 ? (
                <div className="py-12 text-center rounded-2xl bg-gray-950/40 border border-gray-800/60 p-6 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center mx-auto">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-200">No Freelance Tasks Linked</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Accept open job briefs on the Freelance Board or post new client briefs to get started.
                  </p>
                </div>
              ) : (
                profileData?.commissions?.map(cm => (
                  <div key={cm.task_id} className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">{cm.requirements}</h4>
                      <p className="text-xs text-gray-400">
                        Client: <span className="text-gray-200 font-semibold">{cm.client_name}</span>
                        {cm.artist_name && (
                          <> • Assigned Artist: <span className="text-amber-400 font-semibold">{cm.artist_name}</span></>
                        )}
                      </p>
                      <p className="text-[11px] text-gray-500">Deadline: {new Date(cm.deadline).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-black text-amber-400">${parseFloat(cm.price_offered).toFixed(2)}</span>
                      <span className="block text-[10px] uppercase font-extrabold text-emerald-400 mt-0.5">{cm.current_status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Contests */}
          {activeSubTab === 'submissions' && (
            <div className="space-y-4">
              {profileData?.submissions?.length === 0 ? (
                <div className="py-12 text-center rounded-2xl bg-gray-950/40 border border-gray-800/60 p-6 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-900 text-amber-400 flex items-center justify-center mx-auto">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-200">No Contest Submissions Yet</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Participate in active creative competitions on the Contests page to enter your artworks.
                  </p>
                </div>
              ) : (
                profileData?.submissions?.map(sub => (
                  <div key={sub.submission_id} className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {sub.media_url && (
                        <img src={sub.media_url} alt={sub.art_title} className="w-12 h-12 rounded-xl object-cover border border-gray-700" />
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-white">{sub.art_title}</h4>
                        <p className="text-xs text-amber-400">Contest: {sub.challenge_title}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-black text-white flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        {sub.vote_count} Votes
                      </span>
                      <span className="block text-[10px] text-gray-400">Rank: #{sub.rank || 'N/A'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>

      {/* Artwork Detail Modal */}
      {selectedArtwork && (
        <ArtworkDetailModal
          artwork={selectedArtwork}
          currentUser={currentUser}
          onClose={() => setSelectedArtwork(null)}
          onArtworkUpdated={(updated) => {
            setSelectedArtwork(updated);
            fetchProfile();
          }}
          onArtworkDeleted={() => {
            setSelectedArtwork(null);
            fetchProfile();
          }}
        />
      )}

    </div>
  );
}
