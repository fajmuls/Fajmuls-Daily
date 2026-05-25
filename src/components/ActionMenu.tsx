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
  position?: "bottom" | "top";
}

export function ActionMenu({ items, className, headerTitle = "Opsi Halaman", position: initialPropPosition }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [calculatedPosition, setCalculatedPosition] = useState<"bottom" | "top">(initialPropPosition || "bottom");
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
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

  const handleToggle = () => {
    if (!isOpen && buttonRef.current && !initialPropPosition) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // Provide ~200px space for the menu
      if (spaceBelow < 250) {
        setCalculatedPosition("top");
      } else {
        setCalculatedPosition("bottom");
      }
    }
    setIsOpen(!isOpen);
    playClick();
  };

  return (
    <div className={cn("relative z-50", className)} ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-2.5 bg-paper rounded-xl border border-stone-200 hover:bg-stone-50 transition-all text-stone-600 shadow-sm"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: calculatedPosition === "top" ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: calculatedPosition === "top" ? -10 : 10 }}
            className={cn(
              "absolute right-0 w-56 bg-white border-2 border-obsidian rounded-2xl shadow-brutal-lg z-[100] overflow-hidden",
              calculatedPosition === "top" ? "bottom-full mb-3 origin-bottom-right" : "top-full mt-3 origin-top-right"
            )}
          >
            <div className="p-2 border-b-2 border-obsidian bg-stone-50 flex items-center gap-2 px-4 py-2">
               <Settings className="w-4 h-4 text-obsidian" />
               <span className="text-[10px] font-bold text-obsidian uppercase tracking-widest">{headerTitle}</span>
            </div>
            <div className="p-1">
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
                      ? "text-red-600 hover:bg-red-50"
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
