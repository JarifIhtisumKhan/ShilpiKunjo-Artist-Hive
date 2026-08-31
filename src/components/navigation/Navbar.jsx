import React from 'react';
import { Palette, Sparkles, GraduationCap, Briefcase, Trophy, User, LogOut, ShieldAlert, Heart } from 'lucide-react';

export default function Navbar({ activeTab, onTabChange, currentUser, onLogout, onOpenUploadModal }) {
  const navTabs = [
    { id: 'feed', label: 'Feed', icon: Sparkles, badge: 'Showcase' },
    { id: 'courses', label: 'Courses', icon: GraduationCap },
    { id: 'freelance', label: 'Freelance 🔨', icon: Briefcase, isUnderConstruction: true },
    { id: 'contests', label: 'Contests 🔨', icon: Trophy, isUnderConstruction: true },
    { id: 'dashboard', label: 'Dashboard', icon: User }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-500/20 bg-[#091a17]/85 backdrop-blur-xl transition-all shadow-lg shadow-emerald-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div
            onClick={() => onTabChange('feed')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-400 via-teal-300 to-amber-300 p-0.5 shadow-md shadow-pink-500/25 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300">
              <div className="w-full h-full bg-[#082025] rounded-[14px] flex items-center justify-center">
                <Palette className="w-5 h-5 text-pink-300" />
              </div>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-2xl font-rustic font-normal tracking-wide text-white flex items-center gap-1">
                <span>ShilpiKunjo</span>
                <span className="text-xs">✨</span>
              </span>
              <span className="text-[10px] text-teal-300/80 font-comic -mt-1">Artist Sanctuary & Studio</span>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-[#061412]/80 p-1 rounded-2xl border border-emerald-500/30 shadow-inner">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-400 via-orange-300 to-amber-300 text-gray-950 shadow-md shadow-pink-500/25'
                      : 'text-emerald-200/80 hover:text-white hover:bg-emerald-800/30'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gray-950' : 'text-emerald-300'}`} />
                  <span className="hidden md:inline">{tab.label}</span>
                  {tab.isUnderConstruction && (
                    <span className="md:hidden text-[10px]" title="Under Construction">🔨</span>
                  )}
                  {tab.badge && !isActive && (
                    <span className="hidden lg:inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            {currentUser?.is_artist && (
              <button
                onClick={onOpenUploadModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0d2823] border border-pink-400/40 text-pink-200 hover:bg-pink-500/20 hover:border-pink-400 transition-all shadow-sm group"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-300 group-hover:rotate-12 transition-transform" />
                <span>Upload Art 🌸</span>
              </button>
            )}

            <div
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-emerald-900/40 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-400 to-amber-400 flex items-center justify-center text-xs font-extrabold text-gray-950 shadow">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-emerald-100 leading-tight truncate max-w-[100px]">
                  {currentUser?.name}
                </span>
                <span className="text-[10px] text-pink-300 font-medium">
                  {currentUser?.is_artist ? 'Verified Artist' : currentUser?.is_admin ? 'Admin' : 'Collector'}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Log Out"
              className="p-2 text-emerald-300/70 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}

