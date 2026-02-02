'use client';

import React from 'react';
import {
    Bell,
    Check,
    Trash2,
    Info,
    AlertTriangle,
    CheckCircle,
    XCircle,
    ExternalLink,
} from 'lucide-react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const typeStyles = {
    info: { icon: Info, color: 'text-info', bg: 'bg-info/10' },
    success: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
    warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
    error: { icon: XCircle, color: 'text-error', bg: 'bg-error/10' },
};

export const NotificationCenter = () => {
    const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } =
        useNotificationStore();

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle relative group">
                <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                {unreadCount > 0 && (
                    <span className="badge badge-error badge-xs absolute top-2 right-2 animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </div>

            <div
                tabIndex={0}
                className="dropdown-content z-50 card card-compact w-80 md:w-96 p-2 shadow-2xl bg-base-100 border border-base-300 mt-4 rounded-3xl">
                <div className="card-body p-0">
                    <div className="flex items-center justify-between p-4 border-b border-base-200">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="text-xs font-normal text-base-content/50">
                                    ({unreadCount} unread)
                                </span>
                            )}
                        </h3>
                        <div className="flex gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllAsRead()}
                                    className="btn btn-ghost btn-xs tooltip tooltip-bottom"
                                    data-tip="Mark all as read">
                                    <Check size={14} />
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={() => clearAll()}
                                    className="btn btn-ghost btn-xs text-error tooltip tooltip-bottom"
                                    data-tip="Clear all">
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                        <AnimatePresence initial={false} mode="popLayout">
                            {notifications.length > 0 ? (
                                notifications.map((n) => (
                                    <motion.div
                                        key={n.id}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={`p-4 flex gap-3 hover:bg-base-200 transition-colors relative border-b border-base-200/50 last:border-0 ${!n.read ? 'bg-primary/5' : ''}`}>
                                        <div
                                            className={`p-2 rounded-xl h-fit shrink-0 ${typeStyles[n.type].bg} ${typeStyles[n.type].color}`}>
                                            {React.createElement(typeStyles[n.type].icon, {
                                                size: 18,
                                            })}
                                        </div>

                                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4
                                                    className={`text-sm font-bold truncate ${!n.read ? 'text-primary' : ''}`}>
                                                    {n.title}
                                                </h4>
                                                <span className="text-[10px] text-base-content/40 whitespace-nowrap mt-0.5">
                                                    {formatDistanceToNow(n.timestamp, {
                                                        addSuffix: true,
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-base-content/70 line-clamp-2 leading-relaxed">
                                                {n.message}
                                            </p>

                                            <div className="flex gap-3 mt-2">
                                                {!n.read && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(n.id);
                                                        }}
                                                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                                                        Mark as read
                                                    </button>
                                                )}
                                                {n.actionUrl && (
                                                    <Link
                                                        href={n.actionUrl}
                                                        className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1"
                                                        onClick={() => markAsRead(n.id)}>
                                                        View <ExternalLink size={10} />
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(n.id);
                                                    }}
                                                    className="text-[10px] font-bold text-error/50 hover:text-error hover:underline ml-auto">
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-12 flex flex-col items-center justify-center text-center opacity-40 grayscale">
                                    <Bell size={48} className="mb-4" />
                                    <p className="font-semibold text-sm">All caught up!</p>
                                    <p className="text-xs">No new notifications.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};
