'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Keyboard } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import CustomModal from '@/Components/Custom/CustomModal';

interface KeyboardShortcutsContextType {
    showHelp: () => void;
    hideHelp: () => void;
    isHelpOpen: boolean;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | null>(null);

export function useShortcutsHelp() {
    const context = useContext(KeyboardShortcutsContext);
    if (!context) {
        throw new Error('useShortcutsHelp must be used within KeyboardShortcutsProvider');
    }
    return context;
}

const shortcuts = [
    {
        category: 'Navigation',
        items: [
            { keys: 'Alt + D', description: 'Go to Dashboard' },
            { keys: 'Alt + T', description: 'Go to Transactions' },
            { keys: 'Alt + V', description: 'Go to Recurring Transactions' },
            { keys: 'Alt + A', description: 'Go to Accounts' },
            { keys: 'Alt + B', description: 'Go to Budget' },
            { keys: 'Alt + G', description: 'Go to Reports' },
            { keys: 'Alt + S', description: 'Go to Settings' },
        ],
    },
    {
        category: 'Actions',
        items: [{ keys: 'N', description: 'New Transaction' }],
    },
    {
        category: 'General',
        items: [
            { keys: 'Shift + ?', description: 'Show keyboard shortcuts' },
            { keys: 'Esc', description: 'Close dialogs/modals' },
        ],
    },
];

function ShortcutsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return (
        <CustomModal
            isOpen={isOpen}
            onClose={onClose}
            title="Keyboard Shortcuts"
            Icon={Keyboard}
            closeButton={true}
            autoClose={true}>
            {/* Content */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
                {shortcuts.map((group, groupIndex) => (
                    <motion.div
                        key={group.category}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: groupIndex * 0.1 }}
                        className="mb-4 last:mb-0">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2">
                            {group.category}
                        </h4>
                        <div className="space-y-2">
                            {group.items.map((shortcut, index) => (
                                <motion.div
                                    key={shortcut.keys}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        delay: groupIndex * 0.1 + index * 0.05,
                                    }}
                                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors">
                                    <span className="text-sm text-base-content/80">
                                        {shortcut.description}
                                    </span>
                                    <kbd className="kbd kbd-sm bg-base-300 font-mono">
                                        {shortcut.keys}
                                    </kbd>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-base-200 bg-base-200/30">
                <p className="text-xs text-base-content/50 text-center">
                    Press <kbd className="kbd kbd-xs">Shift +?</kbd> anytime to show this help
                </p>
            </div>
        </CustomModal>
    );
}

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const router = useRouter();

    const showHelp = useCallback(() => setIsHelpOpen(true), []);
    const hideHelp = useCallback(() => setIsHelpOpen(false), []);

    const handleNewTransaction = useCallback(() => {
        // Dashboard: Open collapse
        const dashboardCollapse = document.getElementById('new-transaction-collapse');
        if (dashboardCollapse) {
            dashboardCollapse.click();
            dashboardCollapse.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // Transactions page: Click the "New" button
        const newBtn = document.querySelector(
            'button.btn-outline.flex.text-base.gap-2.items-center',
        );
        if (newBtn && window.location.pathname.includes('/transactions')) {
            (newBtn as HTMLButtonElement).click();
            return;
        }

        // If not on these pages, go to dashboard and then we'd need a way to open it.
        // For now, let's just go to dashboard if nowhere else.
        if (!window.location.pathname.includes('/dashboard')) {
            router.push('/dashboard');
            // We can't easily open the collapse after navigation without complex state,
            // so just navigating is a good first step.
        }
    }, [router]);

    // Initialize keyboard shortcuts
    useKeyboardShortcuts({
        shortcuts: [
            {
                key: '?',
                shift: true,
                action: showHelp,
                description: 'Show keyboard shortcuts',
                global: true,
            },
            {
                key: 'n',
                action: handleNewTransaction,
                description: 'New Transaction',
            },
        ],
    });

    return (
        <KeyboardShortcutsContext.Provider value={{ showHelp, hideHelp, isHelpOpen }}>
            {children}
            <ShortcutsModal isOpen={isHelpOpen} onClose={hideHelp} />
        </KeyboardShortcutsContext.Provider>
    );
}
