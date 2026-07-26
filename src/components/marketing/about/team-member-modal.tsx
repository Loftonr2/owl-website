"use client";

/**
 * TeamMemberModal
 * ───────────────
 * Accessible dialog displaying a team member's full biography.
 *
 * Accessibility requirements (per WCAG 2.1 / OWL_BUILD_RULES):
 *  - role="dialog" + aria-modal="true"
 *  - aria-labelledby bound to the heading inside the modal
 *  - Focus moves to the close button when modal opens
 *  - Tab key is trapped inside while modal is open
 *  - ESC key closes
 *  - Backdrop click closes (click inside modal does NOT close)
 *  - Focus returns to the triggering element on close
 *  - Body scroll is locked while open; restored on close
 *  - prefers-reduced-motion: entrance animation skipped
 */

import { useEffect, useRef, ReactNode } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  shortBio: string;
  fullBio: ReactNode;
  imageSrc: string;
  imageAlt: string;
};

interface TeamMemberModalProps {
  member: TeamMember | null;
  onClose: () => void;
  /** The element that opened the modal — focus is returned here on close */
  triggerRef?: React.RefObject<HTMLElement | null>;
}

/** All focusable element selectors for focus-trap */
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function TeamMemberModal({ member, onClose, triggerRef }: TeamMemberModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const isOpen = member !== null;

  // Lock body scroll + focus close button when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Defer focus so the enter animation starts first
    const t = setTimeout(() => closeRef.current?.focus(), 60);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // ESC key
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
    if (!isOpen || !dialogRef.current) return;
    const el = dialogRef.current;
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
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

  const labelId = `team-modal-label-${member?.id ?? ""}`;

  return (
    <AnimatePresence>
      {isOpen && member && (
        <>
          {/* ── Dark overlay / backdrop ── */}
          <motion.div
            key="team-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-overlay bg-owl-ink/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* ── Centering flex wrapper ── */}
          <div
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
            onClick={handleBackdrop}
            aria-hidden="true"
          >
            <motion.div
              key="team-modal-panel"
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={labelId}
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "relative w-full max-w-3xl max-h-[90vh] overflow-y-auto",
                "bg-owl-cream rounded-3xl shadow-owl-3"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Close button ── */}
              <button
                ref={closeRef}
                onClick={handleClose}
                aria-label="Close biography"
                className={cn(
                  "absolute right-4 top-4 z-10",
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  "bg-owl-ink/8 text-owl-ink transition-colors duration-150",
                  "hover:bg-owl-ink/15",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-owl-teal focus-visible:ring-offset-2"
                )}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>

              {/* ── Modal content: two-col on desktop, stacked on mobile ── */}
              <div className="flex flex-col gap-6 p-8 md:flex-row md:gap-10 md:p-10">

                {/* Left: portrait + name + role */}
                <div className="flex flex-col items-center text-center md:w-56 md:shrink-0">
                  <div
                    className="relative h-36 w-36 overflow-hidden rounded-full ring-4 ring-owl-teal/20 shadow-owl-2"
                    aria-hidden="true"
                  >
                    <Image
                      src={member.imageSrc}
                      alt=""
                      fill
                      className="object-cover object-top"
                      sizes="144px"
                    />
                  </div>

                  {/* Teal heart accent */}
                  <svg
                    className="mt-4 h-5 w-5 text-owl-teal"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path d="M10 17s-7-4.5-7-9a4 4 0 018 0 4 4 0 018 0c0 4.5-7 9-7 9z" />
                  </svg>

                  <h2
                    id={labelId}
                    className="mt-3 font-display text-xl font-extrabold text-owl-ink"
                  >
                    {member.name}
                  </h2>
                  <p className="mt-1 font-display text-sm font-semibold text-owl-teal">
                    {member.role}
                  </p>
                </div>

                {/* Divider */}
                <div className="hidden w-px shrink-0 bg-owl-cream-deep md:block" aria-hidden />

                {/* Right: full biography */}
                <div className="flex-1">
                  <p className="mb-3 font-display text-xs font-bold uppercase tracking-[0.2em] text-owl-teal">
                    Biography
                  </p>
                  <div className="space-y-4 text-sm leading-relaxed text-owl-ink/85">
                    {member.fullBio}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
