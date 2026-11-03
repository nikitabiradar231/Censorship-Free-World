import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  Radio,
  KeyRound,
  FileEdit,
  LayoutDashboard,
  BookOpen,
  Settings as SettingsIcon,
  Menu,
  X,
  RadioTower,
  Lock,
} from 'lucide-react';
import { HealthStatus } from '../types/swarm';
import { shortenHash } from '../utils/formatters';

interface NavbarProps {
  health: HealthStatus;
  apiUrl: string;
  activeAddress: string | null;
  onOpenKeyModal: () => void;
  onLockKey: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  apiUrl,
  activeAddress,
  onOpenKeyModal,
  onLockKey,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isOk = health.isReachable && health.status === 'ok';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Publish', path: '/publish', icon: FileEdit },
    { label: 'Reader', path: '/read', icon: BookOpen },
    { label: 'Threat Model', path: '/security', icon: ShieldAlert },
    { label: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 group-hover:border-cyan-400 transition-all">
              <RadioTower className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  FreePress
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                  Swarm
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">
                Censorship-Resistant Publishing
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800/80 text-cyan-400 border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Swarm Bee & Identity Badges */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Bee Node Pill */}
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
              title={`Bee API endpoint: ${apiUrl}`}
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span
                className={`w-2 h-2 rounded-full ${
                  isOk ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <span className="font-mono text-slate-400 text-[11px] truncate max-w-[120px]">
                {apiUrl.replace(/^https?:\/\//, '')}
              </span>
            </Link>

            {/* Publisher Identity Pill */}
            {activeAddress ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-emerald-900/80 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-mono text-cyan-300 text-[11px]" title={activeAddress}>
                  {shortenHash(activeAddress, 6, 4)}
                </span>
                <button
                  onClick={onLockKey}
                  className="text-slate-400 hover:text-rose-400 transition-colors ml-1 cursor-pointer"
                  title="Lock & unload private key from memory"
                >
                  <Lock className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenKeyModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/80 text-xs text-cyan-300 font-medium transition-colors cursor-pointer"
              >
                <KeyRound className="w-3 h-3 text-cyan-400" />
                <span>Signer Key</span>
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs px-2 py-1 text-slate-400">
              <span>Bee Node:</span>
              <span className={isOk ? 'text-emerald-400' : 'text-rose-400'}>
                {isOk ? 'Online' : 'Offline'} ({apiUrl})
              </span>
            </div>

            {activeAddress ? (
              <div className="flex items-center justify-between text-xs px-2 py-1 text-slate-400">
                <span>Identity:</span>
                <span className="font-mono text-cyan-300">{shortenHash(activeAddress, 6, 4)}</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenKeyModal();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-semibold"
              >
                <KeyRound className="w-3.5 h-3.5" /> Connect / Generate Key
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
