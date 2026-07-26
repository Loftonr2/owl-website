"use client";

/**
 * WhyOwlModal
 * ───────────
 * Reusable accessible dialog for the "Why OWL Exists" cards.
 *
 * Accessibility (WCAG 2.1 AA):
 *  - role="dialog" + aria-modal="true"
 *  - aria-labelledby bound to heading inside the dialog
 *  - Focus moves to the dialog panel on open
 *  - Focus trapped inside while open (Tab / Shift+Tab cycle)
 *  - Escape key closes and restores focus to the trigger
 *  - Backdrop click closes; content click does NOT close
 *  - Body scroll locked while open; restored on close
 *  - AnimatePresence entrance / exit (prefers-reduced-motion safe)
 *  - Internal scroll for short viewports
 */

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";

export type WhyOwlItem = {
  id: string;
  title: string;
  paragraphs: [string, string];
};

interface WhyOwlModalProps {
  item: WhyOwlItem | null;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function WhyOwlModal({ item, onClose, triggerRef }: WhyOwlModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isOpen = item !== null;

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => closeRef.current?.focus(), 50);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Escape key closes and returns focus
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        triggerRef?.current?.focus();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [isOpen, onClose, triggerRef]);

  // Focus trap inside dialog
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    const el = panelRef.current;
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    el.addEventListener("keydown", trap);
    return () => el.removeEventListener("keydown", trap);
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    triggerRef?.current?.focus();
  };

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const labelId = `why-owl-label-${item?.id ?? "none"}`;

  return (
    <AnimatePresence>
      {isOpen && item && (
        <>
          {/* Backdrop */}
          <motion.div
            key="why-owl-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-owl-ink/55 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Centering wrapper — click here closes */}
          <div
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
            onClick={handleBackdrop}
          >
            {/* Dialog panel */}
            <motion.div
              key="why-owl-panel"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={labelId}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "relative w-full max-w-lg max-h-[88vh] overflow-y-auto",
                "rounded-3xl bg-owl-cream shadow-owl-3",
                "outline-none"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Teal top accent bar */}
              <div className="h-1.5 w-full rounded-t-3xl bg-owl-teal" aria-hidden />

              {/* Close button */}
              <button
                ref={closeRef}
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className={cn(
                  "absolute right-4 top-4 z-10",
                  "flex h-9 w-9 items-center justify-center rounded-full",
                  "bg-owl-ink/8 text-owl-ink transition-colors duration-150",
                  "hover:bg-owl-ink/15",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-owl-teal focus-visible:ring-offset-2"
                )}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>

              {/* Content */}
              <div className="px-8 py-8 pt-6">
                {/* Heading */}
                <h2
                  id={labelId}
                  className="pr-10 font-display text-xl font-extrabold text-owl-ink"
                >
                  {item.title}
                </h2>

                {/* Teal rule */}
                <div className="mt-3 h-px w-12 bg-owl-teal" aria-hidden />

                {/* Two-paragraph body */}
                <div className="mt-5 space-y-4 text-sm leading-relaxed text-owl-ink/80">
                  <p>{item.paragraphs[0]}</p>
                  <p>{item.paragraphs[1]}</p>
                </div>

                {/* Close CTA */}
                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    className={cn(
                      "rounded-full border-2 border-owl-teal px-6 py-2",
                      "font-display text-sm font-bold text-owl-teal",
                      "transition-all duration-150 hover:bg-owl-teal hover:text-white",
                      "focus-visible:outline-none focus-visible:ring-2",
                      "focus-visible:ring-owl-teal focus-visible:ring-offset-2"
                    )}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
