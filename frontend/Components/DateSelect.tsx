"use client"

import { useEffect, useRef } from "react";
import Pikaday from "pikaday";
import { CalendarDays } from "lucide-react";

export default function DateSelect() {
  const myDatepicker = useRef(null);
  useEffect(() => {
    const picker = new Pikaday({
      field: myDatepicker.current
    });
    return () => picker.destroy();
  }, []);
  return (
    <div className="relative w-45   ">
        <input type="text" className="input outline-0 pika-single" defaultValue="Pick a date" ref={myDatepicker} />
        <CalendarDays
                className="absolute right-2 top-1/2 -translate-y-1/2 z-100 pointer-events-none"
            />
    </div>
    
  );
}