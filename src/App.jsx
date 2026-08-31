import React, { useState } from 'react';
import LoginModal from './components/LoginModal.jsx';
import Navbar from './components/navigation/Navbar.jsx';
import FeedView from './components/feed/FeedView.jsx';
import CoursesView from './components/courses/CoursesView.jsx';
import FreelanceView from './components/freelance/FreelanceView.jsx';
import ContestsView from './components/contests/ContestsView.jsx';
import DashboardView from './components/dashboard/DashboardView.jsx';
import UploadArtworkModal from './components/feed/UploadArtworkModal.jsx';
import CuteBackground from './components/common/CuteBackground.jsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  if (!currentUser) {
    return (
      <div className="min-h-screen relative text-gray-100 font-sans antialiased selection:bg-pink-400 selection:text-emerald-950 flex flex-col justify-center">
        <CuteBackground opacity={0.45} blur={1} />
        <LoginModal onLoginSuccess={(user) => setCurrentUser(user)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-gray-100 font-sans antialiased flex flex-col justify-between selection:bg-pink-400 selection:text-emerald-950">
      <CuteBackground opacity={0.65} blur={3} />

      {/* Top Sticky Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 pb-12">
        {activeTab === 'feed' && <FeedView currentUser={currentUser} />}
        {activeTab === 'courses' && <CoursesView currentUser={currentUser} />}
        {activeTab === 'freelance' && <FreelanceView currentUser={currentUser} />}
        {activeTab === 'contests' && <ContestsView currentUser={currentUser} />}
        {activeTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            onProfileUpdated={(updatedUser) => setCurrentUser(updatedUser)}
          />
        )}
      </main>

      {/* Upload Artwork Modal (Global Shortcut) */}
      {isUploadModalOpen && (
        <UploadArtworkModal
          currentUser={currentUser}
          onClose={() => setIsUploadModalOpen(false)}
          onUploadSuccess={() => {
            setIsUploadModalOpen(false);
            setActiveTab('feed');
          }}
        />
      )}

      {/* Bottom Footer */}
      <footer className="border-t border-emerald-500/20 bg-[#071613d9] backdrop-blur-md py-6 text-center text-xs text-emerald-300/60 relative z-10">
        <p className="flex items-center justify-center gap-1.5 font-medium">
          <span>🌸</span>
          <span className="italic">"Art washes away from the soul the dust of everyday life." — Pablo Picasso</span>
          <span>🎏</span>
        </p>
      </footer>

    </div>
  );
}
