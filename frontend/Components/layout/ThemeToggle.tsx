'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-10 h-10" />;
    }

    return (
        <button
            onClick={() => setTheme(theme === 'darkmode' ? 'mostlyextreme' : 'darkmode')}
            className="btn btn-ghost btn-circle text-inherit"
            aria-label="Toggle theme">
            {theme === 'darkmode' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}
