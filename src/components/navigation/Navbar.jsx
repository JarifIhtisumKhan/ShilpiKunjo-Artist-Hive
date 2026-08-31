import React from 'react';
import { Palette, Sparkles, GraduationCap, Briefcase, Trophy, User, LogOut, ShieldAlert } from 'lucide-react';

export default function Navbar({ activeTab, onTabChange, currentUser, onLogout, onOpenUploadModal }) {
  const navTabs = [
    { id: 'feed', label: 'Feed', icon: Sparkles, badge: 'Showcase' },
    { id: 'courses', label: 'Courses', icon: GraduationCap },
    { id: 'freelance', label: 'Freelance', icon: Briefcase },
    { id: 'contests', label: 'Contests', icon: Trophy },
    { id: 'dashboard', label: 'Dashboard', icon: User }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-amber-900/15 bg-[#F3E3C5]/90 backdrop-blur-xl transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div
            onClick={() => onTabChange('feed')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#aca04d] via-[#748729] to-[#315812] p-0.5 shadow-lg shadow-[#315812]/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#F3E3C5] rounded-[10px] flex items-center justify-center">
                <Palette className="w-5 h-5 text-[#315812]" />
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-black tracking-tight text-gray-900">
                ShilpiKunjo
              </span>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-[#E5D4B4]/80 p-1 rounded-2xl border border-amber-900/20 shadow-inner">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#aca04d] to-[#315812] text-white shadow-md shadow-[#315812]/20 font-bold'
                      : 'text-gray-700 hover:text-gray-950 hover:bg-[#315812]/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                  <span className="hidden md:inline">{tab.label}</span>
                  {tab.badge && !isActive && (
                    <span className="hidden lg:inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#aca04d]/20 text-[#315812] border border-[#315812]/30">
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
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#E5D4B4] border border-[#315812]/40 text-[#315812] hover:bg-[#aca04d]/20 transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#315812]" />
                <span>Upload Art</span>
              </button>
            )}

            <div
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-[#315812]/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#aca04d] to-[#315812] flex items-center justify-center text-xs font-bold text-white shadow">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[100px]">
                  {currentUser?.name}
                </span>
                <span className="text-[10px] text-[#315812] font-bold">
                  {currentUser?.is_artist ? 'Verified Artist' : currentUser?.is_admin ? 'Admin' : 'Collector'}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Log Out"
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
