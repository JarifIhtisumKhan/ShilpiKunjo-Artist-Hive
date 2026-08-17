import React from 'react';
import { Palette, Sparkles, GraduationCap, Briefcase, Trophy, User, LogOut, ShieldAlert } from 'lucide-react';

export default function Navbar({ activeTab, onTabChange, currentUser, onLogout, onOpenUploadModal }) {
  const navTabs = [
    { id: 'feed', label: 'Feed', icon: Sparkles, badge: 'Showcase' },
    { id: 'courses', label: 'Courses', icon: GraduationCap },
    { id: 'freelance', label: 'Freelance 🔨', icon: Briefcase, isUnderConstruction: true },
    { id: 'contests', label: 'Contests 🔨', icon: Trophy, isUnderConstruction: true },
    { id: 'dashboard', label: 'Dashboard', icon: User }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-800/80 bg-[#0B0F19]/90 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div
            onClick={() => onTabChange('feed')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Palette className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-black tracking-tight text-white">
                ShilpiKunjo
              </span>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-gray-950/60 p-1 rounded-2xl border border-gray-800/70 shadow-inner">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-gray-950 shadow-md shadow-amber-500/20 font-bold'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gray-950' : 'text-gray-400'}`} />
                  <span className="hidden md:inline">{tab.label}</span>
                  {tab.isUnderConstruction && (
                    <span className="md:hidden text-[10px]" title="Under Construction">🔨</span>
                  )}
                  {tab.badge && !isActive && (
                    <span className="hidden lg:inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
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
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-900 border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Upload Art</span>
              </button>
            )}

            <div
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-gray-900/60 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-gray-950 shadow">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-gray-200 leading-tight truncate max-w-[100px]">
                  {currentUser?.name}
                </span>
                <span className="text-[10px] text-amber-400 font-medium">
                  {currentUser?.is_artist ? 'Verified Artist' : currentUser?.is_admin ? 'Admin' : 'Collector'}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Log Out"
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
