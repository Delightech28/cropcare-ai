import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Scan } from './pages/Scan';
import { Result } from './pages/Result';
import { Nearby } from './pages/Nearby';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { Page, DiagnosisResult } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [history, setHistory] = useState<DiagnosisResult[]>([]);
  const [currentResult, setCurrentResult] = useState<DiagnosisResult | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('cropcare_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cropcare_history', JSON.stringify(history));
  }, [history]);

  const handleDiagnosisComplete = (result: DiagnosisResult) => {
    setCurrentResult(result);
    setHistory((prev) => [result, ...prev]);
    setCurrentPage('result');
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('cropcare_history');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home 
            onPageChange={setCurrentPage} 
            lastScan={history.length > 0 ? history[0] : undefined}
            onViewResult={(res) => {
              setCurrentResult(res);
              setCurrentPage('result');
            }}
          />
        );
      case 'scan':
        return (
          <Scan 
            onDiagnosisComplete={handleDiagnosisComplete} 
            onCancel={() => setCurrentPage('home')} 
          />
        );
      case 'result':
        return currentResult ? (
          <Result 
            result={currentResult} 
            onBack={() => {
              setCurrentResult(null);
              setCurrentPage('home');
            }}
            onPageChange={setCurrentPage}
          />
        ) : (
          <Home 
            onPageChange={setCurrentPage} 
            lastScan={history.length > 0 ? history[0] : undefined} 
          />
        );
      case 'nearby':
        return <Nearby />;
      case 'history':
        return (
          <History 
            history={history} 
            onViewResult={(res) => {
              setCurrentResult(res);
              setCurrentPage('result');
            }} 
            onClearHistory={handleClearHistory}
          />
        );
      case 'profile':
        return <Profile />;
      default:
        return <Home onPageChange={setCurrentPage} />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen relative shadow-2xl shadow-black/10">
      <main className="min-h-[calc(100vh-72px)] overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Navigation - hidden on scan and result pages for immersive experience */}
      {currentPage !== 'scan' && (
        <Navigation 
          currentPage={currentPage} 
          onPageChange={(page) => {
            if (page === 'scan') {
              setCurrentPage('scan');
            } else {
              setCurrentPage(page);
              setCurrentResult(null);
            }
          }} 
        />
      )}
    </div>
  );
}
