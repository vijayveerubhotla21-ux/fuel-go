import React from 'react';
import {
  X,
  Bell,
  CheckCheck,
  FileCheck2,
  Car,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { NotificationItem } from '../types';
import { store } from '../services/store';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSelectOrder?: (orderId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  userId,
  onSelectOrder,
}) => {
  if (!isOpen) return null;

  const notifications = store.getNotifications(userId);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    store.markAllNotificationsAsRead(userId);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'driver':
        return <Car className="w-4 h-4 text-amber-400" />;
      case 'proof':
        return <FileCheck2 className="w-4 h-4 text-emerald-400" />;
      case 'safety':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      default:
        return <Clock className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="relative w-full max-w-md bg-[#0d0f17] h-full shadow-2xl flex flex-col border-l border-neutral-800 text-neutral-100">
        {/* Header */}
        <div className="p-4 bg-[#0a0c13] text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm">Notifications & Telematics Alerts</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-neutral-950 font-mono">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mark read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/80 text-xs">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  store.markNotificationAsRead(n.id);
                  if (n.orderId && onSelectOrder) {
                    onSelectOrder(n.orderId);
                    onClose();
                  }
                }}
                className={`p-4 flex items-start gap-3 transition-colors cursor-pointer hover:bg-neutral-900/60 ${
                  !n.read ? 'bg-emerald-950/20' : 'bg-transparent'
                }`}
              >
                <div className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 shrink-0 mt-0.5 shadow">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className={`font-bold ${!n.read ? 'text-white' : 'text-neutral-300'}`}>
                      {n.title}
                    </p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] shrink-0" />}
                  </div>
                  <p className="text-neutral-400 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-neutral-500 font-mono pt-0.5">
                    {new Date(n.timestamp).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-neutral-500 space-y-2">
              <Bell className="w-8 h-8 mx-auto opacity-30 text-neutral-600" />
              <p className="font-semibold text-neutral-400">No notifications yet</p>
              <p className="text-[11px] text-neutral-500">Updates regarding your fuel orders and bunk proofs will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
