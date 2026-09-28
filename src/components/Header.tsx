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
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState<boolean>(false);

  const handleRoleSwitch = (role: UserRole) => {
    store.switchUserByRole(role);
    setRoleMenuOpen(false);

    // Auto-navigate to appropriate view
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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('landing')}
            className="focus:outline-none flex items-center text-left"
          >
            <Logo size="md" showTagline={false} />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-bold text-neutral-600">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeView === 'landing' ? 'bg-neutral-100 text-neutral-900' : 'hover:bg-neutral-50'
              }`}
            >
              Home
            </button>

            {!isOpsRole && !isDriverRole && (
              <button
                onClick={() => onNavigate('customer')}
                className={`px-3 py-2 rounded-xl transition-all ${
                  activeView === 'customer' ? 'bg-neutral-100 text-neutral-900' : 'hover:bg-neutral-50'
                }`}
              >
                Customer Hub
              </button>
            )}

            {isDriverRole && (
              <button
                onClick={() => onNavigate('driver')}
                className={`px-3 py-2 rounded-xl transition-all text-amber-800 ${
                  activeView === 'driver' ? 'bg-amber-100 font-black' : 'hover:bg-amber-50'
                }`}
              >
                Rider Dashboard
              </button>
            )}

            {isOpsRole && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-2 rounded-xl transition-all text-neutral-900 ${
                  activeView === 'admin' ? 'bg-neutral-900 text-white font-black' : 'hover:bg-neutral-100'
                }`}
              >
                Admin Governance
              </button>
            )}

            <button
              onClick={() => onNavigate('history')}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeView === 'history' ? 'bg-neutral-100 text-neutral-900' : 'hover:bg-neutral-50'
              }`}
            >
              Order History
            </button>

            <button
              onClick={onOpenAiAssistant}
              className="px-3 py-2 rounded-xl hover:bg-neutral-50 flex items-center gap-1 text-emerald-700"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Tutorial</span>
            </button>

            <button
              onClick={onOpenSafetyCenter}
              className="px-3 py-2 rounded-xl hover:bg-neutral-50 flex items-center gap-1 text-rose-700"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Safety Center</span>
            </button>
          </nav>
        </div>

        {/* Right Actions: Order CTA, Notifications, Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Order CTA (hidden if driver) */}
          {!isDriverRole && (
            <button
              onClick={onOpenOrderModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Fuel className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Order Fuel</span>
            </button>
          )}

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            title="In-app notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Quick Role Switcher Dropdown (Allows evaluating Customer, Driver, and Admin flows seamlessly) */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-xs font-bold transition-all text-neutral-800"
            >
              <div className="w-6 h-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-[10px]">
                {currentUser.role === 'Driver' ? '🏍️' : currentUser.role === 'Customer' ? '👤' : '🛡️'}
              </div>
              <div className="text-left hidden md:block">
                <p className="leading-none text-[11px] truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</p>
                <p className="text-[9px] font-mono text-neutral-500 mt-0.5">{currentUser.role}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-neutral-200 py-2 text-xs z-50 animate-fadeIn">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  Switch Active Role (Demo)
                </div>
                {SYSTEM_USERS.map((usr) => (
                  <button
                    key={usr.id}
                    onClick={() => handleRoleSwitch(usr.role)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-neutral-50 transition-colors ${
                      currentUser.id === usr.id ? 'bg-emerald-50 font-bold text-emerald-900' : 'text-neutral-700'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{usr.name}</p>
                      <p className="text-[10px] text-neutral-400 font-mono">{usr.role}</p>
                    </div>
                    {currentUser.id === usr.id && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-neutral-600 hover:bg-neutral-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-200 px-4 py-3 space-y-2 text-xs font-bold text-neutral-700 animate-fadeIn">
          <button
            onClick={() => {
              onNavigate('landing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-50"
          >
            Home Landing
          </button>
          <button
            onClick={() => {
              onNavigate('customer');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-50"
          >
            Customer Hub
          </button>
          <button
            onClick={() => {
              onNavigate('driver');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-50"
          >
            Rider Dashboard
          </button>
          <button
            onClick={() => {
              onNavigate('admin');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-50"
          >
            Admin Governance
          </button>
          <button
            onClick={() => {
              onNavigate('history');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-50"
          >
            Order History
          </button>
          <button
            onClick={() => {
              onOpenAiAssistant();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-emerald-700 hover:bg-emerald-50"
          >
            AI Fuel Tutorial
          </button>
          <button
            onClick={() => {
              onOpenSafetyCenter();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-rose-700 hover:bg-rose-50"
          >
            Safety Center
          </button>
        </div>
      )}
    </header>
  );
};
