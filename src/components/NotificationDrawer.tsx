import React from 'react';
import {
  X,
  Bell,
  CheckCheck,
  FileCheck2,
  Car,
  Clock,
  ShieldAlert,
  ChevronRight,
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
        return <Car className="w-4 h-4 text-amber-500" />;
      case 'proof':
        return <FileCheck2 className="w-4 h-4 text-emerald-500" />;
      case 'safety':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-neutral-300 hover:text-white flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 text-xs">
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
                className={`p-4 flex items-start gap-3 transition-colors cursor-pointer hover:bg-neutral-50 ${
                  !n.read ? 'bg-emerald-50/40' : 'bg-white'
                }`}
              >
                <div className="p-2 rounded-xl bg-neutral-100 shrink-0 mt-0.5">{getIcon(n.type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className={`font-bold ${!n.read ? 'text-neutral-900' : 'text-neutral-700'}`}>
                      {n.title}
                    </p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                  </div>
                  <p className="text-neutral-600 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-neutral-400 pt-0.5">
                    {new Date(n.timestamp).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-neutral-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto opacity-30" />
              <p className="font-semibold text-neutral-600">No notifications yet</p>
              <p className="text-[11px]">Updates regarding your fuel orders and bunk proofs will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
