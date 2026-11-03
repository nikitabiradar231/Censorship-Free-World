import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { KeyManagementModal } from './components/KeyManagementModal';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Publish } from './pages/Publish';
import { Reader } from './pages/Reader';
import { Settings } from './pages/Settings';
import { Security } from './pages/Security';
import { useSwarmConfig } from './hooks/useSwarmConfig';
import { useSwarmIdentity } from './hooks/useSwarmIdentity';

export const App: React.FC = () => {
  const { config, health } = useSwarmConfig();
  const { identity, generateNew, importKey, lock } = useSwarmIdentity();
  const [keyModalOpen, setKeyModalOpen] = useState(false);

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar
          health={health}
          apiUrl={config.beeApiUrl}
          activeAddress={identity?.address || null}
          onOpenKeyModal={() => setKeyModalOpen(true)}
          onLockKey={lock}
        />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route
              path="/dashboard"
              element={<Dashboard onOpenKeyModal={() => setKeyModalOpen(true)} />}
            />
            <Route
              path="/publish"
              element={<Publish onOpenKeyModal={() => setKeyModalOpen(true)} />}
            />
            <Route path="/read" element={<Reader />} />
            <Route path="/read/:owner/:topic" element={<Reader />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/security" element={<Security />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />

        <KeyManagementModal
          isOpen={keyModalOpen}
          onClose={() => setKeyModalOpen(false)}
          activeIdentity={identity}
          onGenerateNew={generateNew}
          onImportKey={importKey}
        />
      </div>
    </HashRouter>
  );
};

export default App;
