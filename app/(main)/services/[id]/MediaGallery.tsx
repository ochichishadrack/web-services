"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";

interface Media {
  id: string;
  image_url?: string;
  video_url?: string;
}

export default function MediaGallery({
  media,
  startIndex,
  onClose,
}: {
  media: Media[];
  startIndex: number;
  onClose: () => void;
}) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const goTo = useCallback(
    (index: number, smooth = true) => {
      const el = galleryRef.current;
      if (!el) return;
      const next = Math.max(0, Math.min(media.length - 1, index));
      el.scrollTo({
        left: next * el.clientWidth,
        behavior: smooth ? "smooth" : "auto",
      });
    },
    [media.length],
  );

  // Jump to the clicked item without animation
  useEffect(() => {
    goTo(startIndex, false);
    setCurrentIndex(startIndex);
  }, [startIndex, goTo]);

  // Lock page scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Keyboard: Esc / arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goTo(currentIndex + 1);
      if (e.key === "ArrowLeft") goTo(currentIndex - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentIndex, goTo, onClose]);

  const handleScroll = () => {
    const el = galleryRef.current;
    if (!el || !el.clientWidth) return;
    setCurrentIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  const navBtn =
    "hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur transition-colors disabled:opacity-30 disabled:hover:bg-white/10";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Media gallery"
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
    >
      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-3 md:p-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {currentIndex + 1} / {media.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <button
        type="button"
        aria-label="Previous"
        disabled={currentIndex === 0}
        onClick={() => goTo(currentIndex - 1)}
        className={`${navBtn} left-4`}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        type="button"
        aria-label="Next"
        disabled={currentIndex === media.length - 1}
        onClick={() => goTo(currentIndex + 1)}
        className={`${navBtn} right-4`}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div
        ref={galleryRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory flex-1 items-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {media.map((m, i) => (
          <div
            key={m.id}
            className="shrink-0 snap-center flex items-center justify-center w-full h-full px-3 py-16 md:px-20"
          >
            {m.image_url && (
              <div className="relative w-full h-full">
                <Image
                  src={m.image_url}
                  alt={`Media ${i + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain rounded-xl"
                />
              </div>
            )}

            {m.video_url && (
              <video
                src={m.video_url}
                controls
                muted
                playsInline
                autoPlay={i === currentIndex}
                className="max-h-full max-w-full object-contain rounded-xl"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
