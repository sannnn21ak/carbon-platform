import React, { useState } from 'react';
import { Leaf, BarChart2, MessageSquare, PlusCircle, CheckCircle, HelpCircle } from 'lucide-react';
import Calculator from './components/Calculator';
import Dashboard from './components/Dashboard';
import AIInsights from './components/AIInsights';

function App() {
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showNotification, setShowNotification] = useState(false);

  const handleCalculate = (data) => {
    setResult(data);
    setActiveTab('dashboard');
  };

  const handleReset = () => {
    setResult(null);
    setActiveTab('calculator');
  };

  const handleTabClick = (tab) => {
    if ((tab === 'dashboard' || tab === 'insights') && !result) {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className="navbar">
        <a href="#" className="logo-container" onClick={() => setActiveTab('home')}>
          <Leaf className="logo-icon" size={26} aria-hidden="true" />
          <span>Carbon<span style={{ color: 'var(--accent-mint)' }}>Aware</span></span>
        </a>
        
        <nav className="nav-links">
          <button
            onClick={() => handleTabClick('home')}
            className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Home
          </button>
            <button
            onClick={() => handleTabClick('calculator')}
            className={`nav-link ${activeTab === 'calculator' ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <PlusCircle size={16} aria-hidden="true" /> Calculator
          </button>
            <button
            onClick={() => handleTabClick('dashboard')}
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''} ${!result ? 'nav-disabled' : ''}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: result ? 'pointer' : 'not-allowed',
              opacity: result ? 1 : 0.5
            }}
          >
            <BarChart2 size={16} aria-hidden="true" /> Dashboard
          </button>
            <button
            onClick={() => handleTabClick('insights')}
            className={`nav-link ${activeTab === 'insights' ? 'active' : ''} ${!result ? 'nav-disabled' : ''}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: result ? 'pointer' : 'not-allowed',
              opacity: result ? 1 : 0.5
            }}
          >
            <MessageSquare size={16} aria-hidden="true" /> AI Coach
          </button>
        </nav>
      </header>

      {/* Floating Notification */}
      {showNotification && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          background: 'rgba(239, 68, 68, 0.95)',
          color: '#fff',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-md)',
          zIndex: 1000,
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <HelpCircle size={16} /> Please run the Calculator first to unlock this view!
        </div>
      )}

      {/* Main Workspace Area */}
      <main className="main-content">
        {activeTab === 'home' && (
          <div className="animate-slide-up" style={{ textAlign: 'center', padding: '3rem 0 1rem 0' }}>
            {/* Hero Section */}
            <div style={{ maxWidth: '800px', margin: '0 auto 4rem auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(52, 211, 153, 0.1)', color: 'var(--accent-mint)', padding: '0.4rem 1rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                <Leaf size={14} /> PROMPTWARS CHALLENGE
              </div>
              <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.15', marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
                Track, Understand, and <span className="text-gradient">Reduce Your Carbon Footprint</span>
              </h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                Join the green movement. Calculate your carbon impact based on real lifestyle data, visualize category-specific breakdowns, and chat with an interactive AI Carbon Coach to plan your reductions.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="glow-btn" onClick={() => setActiveTab('calculator')}>
                        Start Assessment <ArrowRightIcon size={18} />
                      </button>
                {result && (
                  <button className="glow-btn-secondary" onClick={() => setActiveTab('dashboard')}>
                    View Results
                  </button>
                )}
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid-cols-3" style={{ maxWidth: '1100px', margin: '0 auto', gap: '2rem' }}>
              <div className="glass-card" style={{ textAlign: 'left' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-mint)', display: 'flex', alignItems: 'center', justifySelf: 'start', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <PlusCircle size={20} aria-hidden="true" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>1. Step-by-Step Calculator</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Enter your diet, energy usage, and transit habits in a quick stepper wizard driven by statistical regression.
                </p>
              </div>

              <div className="glass-card" style={{ textAlign: 'left' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifySelf: 'start', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <BarChart2 size={20} aria-hidden="true" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>2. Analytics Dashboard</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  See your footprint visualised against global standards (USA, Germany, India) and track equivalent tree planting goals.
                </p>
              </div>

              <div className="glass-card" style={{ textAlign: 'left' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifySelf: 'start', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <MessageSquare size={20} aria-hidden="true" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>3. AI Carbon Coach</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Interact with Sparky, your personalized AI advisor powered by Hugging Face, to get concrete carbon-reduction plans.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <Calculator onCalculate={handleCalculate} />
        )}

        {activeTab === 'dashboard' && result && (
          <Dashboard result={result} onReset={handleReset} />
        )}

        {activeTab === 'insights' && result && (
          <AIInsights result={result} />
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 CarbonAware. Prepared for the PromptWars Coding Challenge.</p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
          Database statistics derived from standard carbon coefficients. Designed with custom Vanilla CSS.
        </p>
      </footer>
    </div>
  );
}

// Simple local ArrowRightIcon
const ArrowRightIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export default App;
