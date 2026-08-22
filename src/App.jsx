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
      <div className="min-h-screen bg-[#F3E3C5] text-gray-900 font-sans antialiased">
        <LoginModal onLoginSuccess={(user) => setCurrentUser(user)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3E3C5] text-gray-900 font-sans antialiased flex flex-col justify-between selection:bg-[#aca04d] selection:text-white">
      
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
      <footer className="border-t border-[#ab946a] bg-[#d8c5a0] py-6 text-center text-xs text-gray-800">
        <p className="italic">"Have no fear of perfection — you'll never reach it." — Salvador Dalí</p>
      </footer>

    </div>
  );
}
