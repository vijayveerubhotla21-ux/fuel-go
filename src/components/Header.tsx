import React, { useState } from 'react';
import {
  Bell,
  Menu,
  X,
  ChevronDown,
  UserCheck,
  Shield,
  Car,
  User as UserIcon,
  Bot,
  ShieldAlert,
  Clock,
  Navigation,
  Fuel,
  Building2,
  Video,
} from 'lucide-react';
import { Logo } from './Logo';
import { User, UserRole } from '../types';
import { store, SYSTEM_USERS } from '../services/store';

interface HeaderProps {
  currentUser: User;
  onNavigate: (view: 'landing' | 'customer' | 'driver' | 'admin' | 'history' | 'tracking') => void;
  activeView: string;
  onOpenOrderModal: () => void;
  onOpenAiAssistant: () => void;
  onOpenSafetyCenter: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  onOpenGovtSanction?: () => void;
  onOpenDeliveryVideo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onNavigate,
  activeView,
  onOpenOrderModal,
  onOpenAiAssistant,
  onOpenSafetyCenter,
  onOpenNotifications,
  unreadCount,
  onOpenGovtSanction,
  onOpenDeliveryVideo,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState<boolean>(false);

  const handleRoleSwitch = (role: UserRole) => {
    store.switchUserByRole(role);
    setRoleMenuOpen(false);

    if (role === 'Driver') {
      onNavigate('driver');
    } else if (['Super Admin', 'Admin', 'Operations Manager', 'Finance/Admin'].includes(role)) {
      onNavigate('admin');
    } else {
      onNavigate('customer');
    }
  };

  const isOpsRole = ['Super Admin', 'Admin', 'Operations Manager', 'Finance/Admin'].includes(currentUser.role);
  const isDriverRole = currentUser.role === 'Driver';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0c12]/95 backdrop-blur-md border-b border-neutral-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo - Sleek dark emblem replacing plain text */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('landing')}
            className="focus:outline-none flex items-center text-left cursor-pointer"
            title="FuelGo — Doorstep Precision Fuel Delivery"
          >
            <Logo variant="header" size="md" />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-neutral-400">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeView === 'landing'
                  ? 'bg-neutral-800/90 text-white shadow-sm border border-neutral-700'
                  : 'hover:bg-neutral-900 hover:text-white'
              }`}
            >
              Home
            </button>

            {!isOpsRole && !isDriverRole && (
              <button
                onClick={() => onNavigate('customer')}
                className={`px-3 py-2 rounded-xl transition-all ${
                  activeView === 'customer'
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : 'hover:bg-neutral-900 hover:text-white'
                }`}
              >
                Customer Hub
              </button>
            )}

            {isDriverRole && (
              <button
                onClick={() => onNavigate('driver')}
                className={`px-3 py-2 rounded-xl transition-all font-black ${
                  activeView === 'driver'
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-amber-400/80 hover:bg-neutral-900 hover:text-amber-300'
                }`}
              >
                Rider Dashboard
              </button>
            )}

            {isOpsRole && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-2 rounded-xl transition-all font-black ${
                  activeView === 'admin'
                    ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : 'hover:bg-neutral-900 hover:text-white'
                }`}
              >
                Admin Governance
              </button>
            )}

            <button
              onClick={() => onNavigate('history')}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeView === 'history'
                  ? 'bg-neutral-800/90 text-white border border-neutral-700 shadow-sm'
                  : 'hover:bg-neutral-900 hover:text-white'
              }`}
            >
              Order History
            </button>

            <button
              onClick={onOpenAiAssistant}
              className="px-3 py-2 rounded-xl hover:bg-neutral-900 hover:text-emerald-300 flex items-center gap-1.5 text-emerald-400 transition-colors"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Tutorial</span>
            </button>

            <button
              onClick={onOpenSafetyCenter}
              className="px-3 py-2 rounded-xl hover:bg-neutral-900 hover:text-rose-300 flex items-center gap-1.5 text-rose-400 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Safety Center</span>
            </button>

            {onOpenGovtSanction && (
              <button
                onClick={onOpenGovtSanction}
                className="px-3 py-2 rounded-xl hover:bg-neutral-900 text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition-colors border border-amber-500/30 bg-amber-500/10 cursor-pointer"
                title="View Official Government PESO Sanction & Relief Form"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Govt Sanction</span>
              </button>
            )}

            {onOpenDeliveryVideo && (
              <button
                onClick={onOpenDeliveryVideo}
                className="px-3 py-2 rounded-xl hover:bg-neutral-900 text-teal-300 hover:text-teal-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Watch Government Emergency Delivery Video Walkthrough"
              >
                <Video className="w-3.5 h-3.5 text-teal-400" />
                <span>Watch Video</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right Actions: Order CTA, Notifications, Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Order CTA (hidden if driver) */}
          {!isDriverRole && (
            <button
              onClick={onOpenOrderModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-neutral-950 font-black text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all active:scale-95"
            >
              <Fuel className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Order Fuel</span>
            </button>
          )}

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors border border-neutral-800 bg-neutral-900/60"
            title="In-app notifications"
          >
            <Bell className="w-4 h-4 text-neutral-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-neutral-950 animate-pulse" />
            )}
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-neutral-700/80 bg-neutral-900 hover:bg-neutral-800 text-xs font-bold transition-all text-neutral-200"
            >
              <div className="w-6 h-6 rounded-lg bg-neutral-800 border border-neutral-700 text-white flex items-center justify-center text-[10px]">
                {currentUser.role === 'Driver' ? '🏍️' : currentUser.role === 'Customer' ? '👤' : '🛡️'}
              </div>
              <div className="text-left hidden md:block">
                <p className="leading-none text-[11px] text-white truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</p>
                <p className="text-[9px] font-mono text-emerald-400 mt-0.5">{currentUser.role}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-neutral-900 text-neutral-100 rounded-2xl shadow-2xl border border-neutral-700 py-2 text-xs z-50 animate-fadeIn">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  Switch Active Role (Demo)
                </div>
                {SYSTEM_USERS.map((usr) => (
                  <button
                    key={usr.id}
                    onClick={() => handleRoleSwitch(usr.role)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-neutral-800 transition-colors ${
                      currentUser.id === usr.id ? 'bg-emerald-950/60 font-bold text-emerald-400' : 'text-neutral-300'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-white">{usr.name}</p>
                      <p className="text-[10px] text-neutral-400 font-mono">{usr.role}</p>
                    </div>
                    {currentUser.id === usr.id && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0d0f17] border-b border-neutral-800 px-4 py-3 space-y-2 text-xs font-bold text-neutral-300 animate-fadeIn">
          <button
            onClick={() => {
              onNavigate('landing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-800 text-white"
          >
            Home Landing
          </button>
          <button
            onClick={() => {
              onNavigate('customer');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-800 text-white"
          >
            Customer Hub
          </button>
          <button
            onClick={() => {
              onNavigate('driver');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-800 text-amber-300"
          >
            Rider Dashboard
          </button>
          <button
            onClick={() => {
              onNavigate('admin');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-800 text-emerald-400"
          >
            Admin Governance
          </button>
          <button
            onClick={() => {
              onNavigate('history');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-800 text-white"
          >
            Order History
          </button>
          <button
            onClick={() => {
              onOpenAiAssistant();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-emerald-400 hover:bg-neutral-800"
          >
            AI Fuel Tutorial
          </button>
          <button
            onClick={() => {
              onOpenSafetyCenter();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-rose-400 hover:bg-neutral-800"
          >
            Safety Center
          </button>
          {onOpenGovtSanction && (
            <button
              onClick={() => {
                onOpenGovtSanction();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-amber-300 hover:bg-neutral-800 flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Govt Sanction & Relief Form</span>
            </button>
          )}
          {onOpenDeliveryVideo && (
            <button
              onClick={() => {
                onOpenDeliveryVideo();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-teal-300 hover:bg-neutral-800 flex items-center gap-2"
            >
              <Video className="w-4 h-4 text-teal-400" />
              <span>Watch Delivery Video</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
