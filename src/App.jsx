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

  return (
    <div className="min-h-screen text-gray-950 antialiased flex flex-col justify-between selection:bg-[#44403c] selection:text-white relative">
      
      {/* Site-wide Fixed Koi Pond Background */}
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
        <img
          src="/koi_pond_bg.jpg"
          alt="Koi Pond Background"
          className="w-full h-full object-cover object-center"
        />
        {/* Atmospheric translucency layer for aesthetic depth & high readability */}
        <div className="absolute inset-0 bg-[#e8d7b5]/75 backdrop-blur-[3px]"></div>
      </div>

      {!currentUser ? (
        <div className="flex-1 flex items-center justify-center">
          <LoginModal onLoginSuccess={(user) => setCurrentUser(user)} />
        </div>
      ) : (
        <>
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
          <footer className="border-t border-[#ab946a]/60 bg-[#c6ae82]/80 backdrop-blur-md py-6 text-center text-xs text-gray-900 font-bold">
            <p className="italic">"Have no fear of perfection — you'll never reach it." — Salvador Dalí</p>
          </footer>
        </>
      )}

    </div>
  );
}
