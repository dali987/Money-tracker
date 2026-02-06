'use client';

import { useEffect, useRef } from 'react';
import { CalendarDays } from 'lucide-react';

type PikadayInstance = { destroy: () => void };

export default function DateSelect({ name }: { name: string }) {
    const myDatepicker = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
        let picker: PikadayInstance | null = null;
        let cancelled = false;

        import('pikaday').then(({ default: Pikaday }) => {
            if (cancelled || !myDatepicker.current) return;
            picker = new Pikaday({
                field: myDatepicker.current,
            });
        });

        return () => {
            cancelled = true;
            picker?.destroy();
        };
    }, []);
    return (
        <div className="relative w-full">
            <input
                type="text"
                className="input outline-0 pika-single w-full rounded transition-all"
                defaultValue="Pick a date"
                name={name}
                ref={myDatepicker}
            />
            <CalendarDays className="absolute right-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
        </div>
    );
}
