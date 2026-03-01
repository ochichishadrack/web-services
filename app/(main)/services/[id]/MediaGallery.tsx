'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

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

  useEffect(() => {
    if (galleryRef.current) {
      const child = galleryRef.current.children[startIndex] as HTMLElement;
      child?.scrollIntoView({ inline: 'center' });
    }
    setCurrentIndex(startIndex);
  }, [startIndex]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="absolute top-4 right-4 z-20">
        <button onClick={onClose} className="p-2 rounded hover:bg-white/20 transition">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div
        ref={galleryRef}
        className="flex overflow-x-auto snap-x snap-mandatory flex-1 items-center"
      >
        {media.map((m) => (
          <div
            key={m.id}
            className="shrink-0 snap-center flex items-center justify-center w-screen h-screen p-4"
          >
            {m.image_url && (
              <div className="relative w-full h-full">
                <Image src={m.image_url} alt="media" fill className="object-contain rounded-lg" />
              </div>
            )}

            {m.video_url && (
              <video
                src={m.video_url}
                controls
                autoPlay
                muted
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
