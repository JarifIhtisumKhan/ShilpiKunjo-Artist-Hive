import React, { useState } from 'react';
import LoginModal from './components/LoginModal.jsx';
import Navbar from './components/navigation/Navbar.jsx';
import FeedView from './components/feed/FeedView.jsx';
import CoursesView from './components/courses/CoursesView.jsx';
import FreelanceView from './components/freelance/FreelanceView.jsx';
import ContestsView from './components/contests/ContestsView.jsx';
import DashboardView from './components/dashboard/DashboardView.jsx';
import UploadArtworkModal from './components/feed/UploadArtworkModal.jsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-gray-100 font-sans antialiased">
        <LoginModal onLoginSuccess={(user) => setCurrentUser(user)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 font-sans antialiased flex flex-col justify-between selection:bg-amber-500 selection:text-gray-950">
      
      {/* Top Sticky Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
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
      <footer className="border-t border-gray-800/60 bg-[#070A10] py-6 text-center text-xs text-gray-500">
        <p className="italic">"Have no fear of perfection — you'll never reach it." — Salvador Dalí</p>
      </footer>

    </div>
  );
}
