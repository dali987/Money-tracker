'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface ShortcutConfig {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    action: () => void;
    description: string;
    /** Disable in input fields */
    global?: boolean;
}

interface UseKeyboardShortcutsOptions {
    /** Custom shortcuts to add */
    shortcuts?: ShortcutConfig[];
    /** Enable default navigation shortcuts */
    enableNavigation?: boolean;
}

/**
 * Hook for global keyboard shortcuts
 * Provides power-user features for faster navigation and actions
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
    const { shortcuts = [], enableNavigation = true } = options;
    const router = useRouter();
    const pathname = usePathname();

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            // Skip if user is typing in an input field (unless shortcut is global)
            const target = event.target as HTMLElement;
            const isInputField =
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.contentEditable === 'true' ||
                target.closest('[role="textbox"]');

            // Default navigation shortcuts
            const defaultShortcuts: ShortcutConfig[] = enableNavigation
                ? [
                      {
                          key: 'd',
                          alt: true,
                          action: () => router.push('/dashboard'),
                          description: 'Go to Dashboard',
                      },
                      {
                          key: 't',
                          alt: true,
                          action: () => router.push('/transactions'),
                          description: 'Go to Transactions',
                      },
                      {
                          key: 'v',
                          alt: true,
                          action: () => router.push('/recurring'),
                          description: 'Go to Recurring Transactions',
                      },
                      {
                          key: 'a',
                          alt: true,
                          action: () => router.push('/accounts'),
                          description: 'Go to Accounts',
                      },
                      {
                          key: 'b',
                          alt: true,
                          action: () => router.push('/budget'),
                          description: 'Go to Budget',
                      },
                      {
                          key: 'g',
                          alt: true,
                          action: () => router.push('/reports'),
                          description: 'Go to Reports',
                      },
                      {
                          key: 's',
                          alt: true,
                          action: () => router.push('/settings'),
                          description: 'Go to Settings',
                      },
                  ]
                : [];

            const allShortcuts = [...defaultShortcuts, ...shortcuts];

            for (const shortcut of allShortcuts) {
                const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
                const ctrlMatch = shortcut.ctrl
                    ? event.ctrlKey || event.metaKey
                    : !event.ctrlKey && !event.metaKey;
                const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
                const altMatch = shortcut.alt ? event.altKey : !event.altKey;

                if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
                    // Skip if in input field and shortcut is not global
                    if (isInputField && !shortcut.global) continue;

                    event.preventDefault();
                    shortcut.action();
                    return;
                }
            }
        },
        [router, shortcuts, enableNavigation],
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Return available shortcuts for displaying in UI
    const getShortcutList = useCallback(() => {
        const defaultShortcuts: ShortcutConfig[] = enableNavigation
            ? [
                  { key: 'D', alt: true, action: () => {}, description: 'Dashboard' },
                  { key: 'T', alt: true, action: () => {}, description: 'Transactions' },
                  { key: 'V', alt: true, action: () => {}, description: 'Recurring' },
                  { key: 'A', alt: true, action: () => {}, description: 'Accounts' },
                  { key: 'B', alt: true, action: () => {}, description: 'Budget' },
                  { key: 'G', alt: true, action: () => {}, description: 'Reports' },
                  { key: 'S', alt: true, action: () => {}, description: 'Settings' },
              ]
            : [];
        return [...defaultShortcuts, ...shortcuts];
    }, [shortcuts, enableNavigation]);

    return { getShortcutList };
}

/**
 * Format a shortcut for display
 */
export function formatShortcut(
    shortcut: Pick<ShortcutConfig, 'key' | 'ctrl' | 'shift' | 'alt'>,
): string {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.shift) parts.push('Shift');
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
}
