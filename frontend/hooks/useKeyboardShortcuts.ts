'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface ShortcutConfig {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    action: () => void;
    description: string;
    global?: boolean;
}

interface UseKeyboardShortcutsOptions {
    shortcuts?: ShortcutConfig[];
    enableNavigation?: boolean;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
    const { shortcuts = [], enableNavigation = true } = options;
    const router = useRouter();

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            const isInputField =
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.contentEditable === 'true' ||
                target.closest('[role="textbox"]');

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
