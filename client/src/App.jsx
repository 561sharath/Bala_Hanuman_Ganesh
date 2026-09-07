import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { CreateEntry } from './pages/CreateEntry';
import { UpdateEntry } from './pages/UpdateEntry';
import { TrackCollection } from './pages/TrackCollection';
import { TrackSpendings } from './pages/TrackSpendings';
import { UpdateSpendings } from './pages/UpdateSpendings';
import { DownloadSheet } from './pages/DownloadSheet';

export const App = () => {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="relative min-h-screen flex flex-col justify-between text-on-surface bg-surface font-body overflow-x-hidden">
              
              {/* Fixed Lord Vinayaka Background Image */}
              <div
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-100"
                style={{ backgroundImage: `url('/ganesha_bg.jpg')` }}
              >
                <div className="absolute inset-0 bg-black/75 backdrop-blur-[3px]" />
              </div>

              {/* Ambient Background Decorative Glow Orbs */}
              <div className="fixed top-1/4 -left-32 w-96 h-96 rounded-full bg-primary-container/20 blur-[130px] pointer-events-none z-0" />
              <div className="fixed bottom-10 -right-32 w-[30rem] h-[30rem] rounded-full bg-tertiary/15 blur-[140px] pointer-events-none z-0" />

              {/* Fixed Navigation Header */}
              <Header />

              {/* Main Router Views Container */}
              <main className="relative z-10 w-full pt-20 pb-12 flex-1 flex flex-col px-4 lg:px-8 max-w-7xl mx-auto">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/create" element={<CreateEntry />} />
                  <Route path="/update" element={<UpdateEntry />} />
                  <Route path="/track-collection" element={<TrackCollection />} />
                  <Route path="/track-spendings" element={<TrackSpendings />} />
                  <Route path="/update-spendings" element={<UpdateSpendings />} />
                  <Route path="/download" element={<DownloadSheet />} />
                </Routes>
              </main>

              {/* Footer */}
              <footer className="relative z-10 w-full border-t border-outline-variant/20 py-4 bg-[#121412]/90 backdrop-blur-md text-center text-xs text-on-surface-variant">
                <div className="max-w-7xl mx-auto px-4">
                  © {new Date().getFullYear()} Sri Bala Hanuman Vinayaka Seva Samithi. All Rights Reserved.
                </div>
              </footer>
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  );
};

export default App;
