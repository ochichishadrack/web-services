'use client';

import { ChangeEvent } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  images: File[];
  previews: string[];
  setImages: (files: File[]) => void;
  setPreviews: (urls: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  previews,
  setImages,
  setPreviews,
  maxImages = 3,
}: ImageUploaderProps) {
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;

    if (images.length + files.length > maxImages) {
      alert(`You can upload a maximum of ${maxImages} images.`);
      return;
    }

    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setImages([...images, ...files]);
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    const newImages = [...images];
    const newPreviews = [...previews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setPreviews(newPreviews);
  };

  return (
    <div className="space-y-2">
      {previews.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {previews.map((url, i) => (
            <div key={i} className="relative w-24 h-24 border rounded overflow-hidden">
              <Image src={url} alt="Preview" fill className="object-cover" unoptimized />
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <label htmlFor="img-upload" className="cursor-pointer">
        <input
          id="img-upload"
          type="file"
          accept="image/*"
          hidden
          multiple
          onChange={onFileChange}
        />
        <span className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded border">+ Add Images</span>
      </label>
    </div>
  );
}
