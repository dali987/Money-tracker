'use client';

import { useEffect, useRef } from 'react';
import { CalendarDays } from 'lucide-react';

export default function DateSelect({ name } : { name: string }) {
    const myDatepicker = useRef(null);
    useEffect(() => {
        // Import Pikaday dynamically on client side
        import('pikaday').then(({ default: Pikaday }) => {
            const picker = new Pikaday({
                field: myDatepicker.current!,
            });

            return () => picker.destroy();
        });
    }, []);
    return (
        <div className="relative w-full">
            <input
                type="text"
                className="input outline-0 pika-single w-full rounded"
                defaultValue="Pick a date"
                name={name}
                ref={myDatepicker}
            />
            <CalendarDays className="absolute right-2 top-1/2 -translate-y-1/2 z-1000 pointer-events-none" />
        </div>
    );
}
