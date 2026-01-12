
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Settings from './components/Settings';
import Navigation from './components/Navigation';
import AnalyticsView from './components/AnalyticsView'

const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-background-dark text-slate-400">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p>该功能正在开发中...</p>
    <Navigation />
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background-dark overflow-x-hidden selection:bg-primary/30">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/stats" element={<AnalyticsView />} />
        </Routes>
        
        {/* Navigation is only hidden on specific pages if needed, but standard mobile apps usually keep it */}
        <Navigation />
      </div>
    </Router>
  );
};

export default App;
