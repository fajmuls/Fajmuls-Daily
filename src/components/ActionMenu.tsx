import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { useAudio } from "../hooks/useAudio";

interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface ActionMenuProps {
  items: ActionItem[];
  className?: string;
  headerTitle?: string;
}

export function ActionMenu({ items, className, headerTitle = "Opsi Halaman" }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { playClick } = useAudio();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={menuRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          playClick();
        }}
        className="p-2.5 bg-paper rounded-xl border border-stone-200 hover:bg-stone-50 transition-all text-stone-600 shadow-sm"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute top-full right-0 mt-3 w-56 bg-white border border-stone-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-2 border-b border-stone-50 bg-stone-50/50 flex items-center gap-2 px-4 py-2">
               <Settings className="w-3 h-3 text-stone-400" />
               <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{headerTitle}</span>
            </div>
            <div className="p-1.5">
              {items.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                    item.variant === "danger"
                      ? "text-red-500 hover:bg-red-50"
                      : "text-stone-700 hover:bg-stone-50"
                  )}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
