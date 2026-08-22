import React, { useState } from 'react';
import { Palette, Sparkles, Briefcase, Trophy, GraduationCap, ShoppingBag, User, LogOut, ShieldAlert, ArrowRight, CheckCircle2, Database, Layers, X } from 'lucide-react';

export default function Homepage({ currentUser, onLogout }) {
  const [selectedOption, setSelectedOption] = useState(null);

  const modules = [
    {
      id: 'feed',
      title: 'Artwork Showcase Feed',
      subtitle: 'Module 2: User Profile, Portfolio & Community',
      icon: Sparkles,
      color: 'from-amber-500 to-orange-500',
      badge: 'Community Showcase',
      description: 'Explore digital art, hand-drawn sketches, and 3D animations from Bangladeshi visual artists. Interact with likes, reactions, and feedback comments.',
      schemaTables: ['Artworks', 'ArtworkComments', 'ArtworkReactions'],
      features: [
        'Masonry feed sorting by Digital, Hand-drawn, & Animation',
        'Artwork reaction count & comment feedback thread',
        'Artist portfolio upload & media management'
      ]
    },
    {
      id: 'commissions',
      title: 'Freelance Commission Tracker',
      subtitle: 'Module 5: Freelance Commission & Task Tracking',
      icon: Briefcase,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Client & Artist Contracts',
      description: 'Connect clients with specialized visual artists for custom artwork contracts. Track milestone progress from initial request to deliverable review.',
      schemaTables: ['Commissions', 'Artists', 'Users'],
      features: [
        'Client brief submission with offered budget & deadline',
        'Artist application, task accept/reject workflow',
        'Lifecycle status pipeline (Requested -> Accepted -> In Progress -> Review -> Completed)',
        'Final deliverable submission link delivery'
      ]
    },
    {
      id: 'challenges',
      title: 'Art Challenges & Contests',
      subtitle: 'Module 3: Events & Creative Challenges',
      icon: Trophy,
      color: 'from-yellow-500 to-amber-600',
      badge: 'Interactive Competitions',
      description: 'Participate in themed creative competitions, submit portfolio artworks as contest entries, and compete on community leaderboard rankings.',
      schemaTables: ['Challenges', 'ChallengeSubmissions'],
      features: [
        'Active contest schedules & participation limits',
        'Submission of existing published artworks to challenges',
        'Community voting mechanism with dynamic rank computation (#1 Gold, #2 Silver, #3 Bronze)'
      ]
    },
    {
      id: 'courses',
      title: 'Course Learning Hub',
      subtitle: 'Module 4: Educational Learning Platform',
      icon: GraduationCap,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Masterclass Hub',
      description: 'Master 2D illustration, digital lighting, charcoal sketching, and 3D Blender modeling from verified instructor artists.',
      schemaTables: ['Courses', 'CourseContent', 'CourseEnrollments'],
      features: [
        'Filter courses by difficulty (Beginner, Intermediate, Advanced)',
        'Sequential video lesson curriculum and learning materials',
        'Student course enrollment and completion status tracking'
      ]
    },
    {
      id: 'marketplace',
      title: 'Artisan Marketplace',
      subtitle: 'Module 6: E-Commerce & Product Inventory',
      icon: ShoppingBag,
      color: 'from-purple-500 to-pink-600',
      badge: 'E-Commerce Store',
      description: 'Buy and sell physical terracotta handcrafts, museum-grade canvas prints, 3D modular assets, and custom Procreate brush packs.',
      schemaTables: ['MarketplaceProducts', 'Orders', 'OrderItems'],
      features: [
        'Product listing & inventory stock management for sellers',
        'Shopping cart & instant checkout transaction',
        'SQL Orders and OrderItems generation with automated stock deduction'
      ]
    },
    {
      id: 'profiles',
      title: 'User Profiles & Specializations',
      subtitle: 'Module 1: User Account & Profile Management',
      icon: User,
      color: 'from-rose-500 to-red-600',
      badge: 'Account & Portfolio',
      description: 'Manage user credentials, artist biographies, portfolio links, multi-valued skill expertise tags, and commission availability status.',
      schemaTables: ['Users', 'Admins', 'Artists', 'ArtistExpertise'],
      features: [
        'Role-based access control (Client, Artist, Admin)',
        'Multi-valued expertise tags (ArtistExpertise)',
        'Commission availability status toggle (Available vs Busy)'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F3E3C5] text-gray-900 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 glass-panel border-b border-amber-900/15 bg-[#F3E3C5]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="w-full h-full bg-[#F3E3C5] rounded-[10px] flex items-center justify-center">
                  <Palette className="w-5 h-5 text-amber-700" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-extrabold tracking-tight text-white">
                  ShilpiKunjo
                </span>
              </div>
            </div>

            {/* Right User Bar & Logout */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold text-xs">
                  {currentUser.name?.charAt(0)}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{currentUser.name}</span>
                  <span className="text-[10px] text-amber-400 font-semibold block">
                    {currentUser.is_admin ? 'Shield Admin' : currentUser.is_artist ? 'Verified Artist' : 'Client Account'}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-rose-400 hover:border-rose-500/30 transition-all text-xs font-semibold"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Options Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Welcome Banner */}
        <div className="glass-panel rounded-3xl p-8 border border-gray-800 relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -z-10"></div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> CSE370 Database Project • Step 1 Homepage Options
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-100 bg-clip-text text-transparent">
            Welcome back, {currentUser.name}!
          </h1>

          <p className="text-gray-300 text-sm mt-2 max-w-2xl leading-relaxed">
            Select any module below to inspect its functional options and MariaDB schema relationships.
          </p>
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            Platform Options & System Modules
          </h2>
          <span className="text-xs text-gray-400 font-semibold">MariaDB Schema • 16 Relational Tables</span>
        </div>

        {/* Options Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map(mod => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => setSelectedOption(mod)}
                className="glass-card rounded-2xl p-6 border border-gray-800 hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-tr ${mod.color} text-black font-bold shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-gray-900 text-gray-300 border border-gray-800 text-[10px] font-bold">
                      {mod.badge}
                    </span>
                  </div>

                  <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider block mb-1">
                    {mod.subtitle}
                  </span>

                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors mb-2">
                    {mod.title}
                  </h3>

                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-400">
                    <Database className="w-3.5 h-3.5 text-amber-400" />
                    <span>{mod.schemaTables.join(', ')}</span>
                  </div>
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore Option <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Option Details Modal */}
      {selectedOption && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${selectedOption.color} text-black font-bold`}>
                  <selectedOption.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedOption.title}</h3>
                  <span className="text-[11px] text-amber-400 font-semibold">{selectedOption.subtitle}</span>
                </div>
              </div>

              <button onClick={() => setSelectedOption(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed mb-4 bg-gray-950/40 p-3.5 rounded-2xl border border-gray-800">
              {selectedOption.description}
            </p>

            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Core Functional Features
            </h4>

            <ul className="space-y-2 mb-6">
              {selectedOption.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-amber-400" /> Relational MariaDB Schema Tables
            </h4>

            <div className="flex flex-wrap gap-2 mb-6">
              {selectedOption.schemaTables.map((t, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-900 border border-gray-800 text-amber-400 rounded-xl font-mono text-xs font-bold">
                  {t}
                </span>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedOption(null)}
                className="px-5 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400"
              >
                Close Option Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="glass-panel border-t border-gray-800/80 py-6 text-center text-xs text-gray-500">
        <p className="font-medium text-gray-400">ShilpiKunjo (Artist Hive) © CSE370 Database Management System Project</p>
        <p className="mt-1 text-[11px] text-gray-600">Built for Group 04 with MariaDB Relational Database Schema & React UI.</p>
      </footer>
    </div>
  );
}
