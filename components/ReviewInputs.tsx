"use client";

import React from "react";
import Image from "next/image";

type ReviewInput = {
  comment: string;
  rating: string;
  images: File[];
  videos: File[];
};

type Props = {
  reviewInputs: ReviewInput[];
  onReviewChange: (
    index: number,
    field: keyof ReviewInput,
    value: string | File[]
  ) => void;
  onFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    type: "image" | "video"
  ) => void;
  addReview: () => void;
  removeReview: (index: number) => void;
};

const getPreviewUrl = (file: File | null) =>
  file ? URL.createObjectURL(file) : "";

export default function ReviewInputs({
  reviewInputs,
  onReviewChange,
  onFileChange,
  addReview,
  removeReview,
}: Props) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Add Reviews</h2>
      {reviewInputs.map((review, index) => (
        <div key={index} className="border p-4 rounded-md mb-4 space-y-2">
          <textarea
            placeholder="Comment"
            value={review.comment}
            onChange={(e) => onReviewChange(index, "comment", e.target.value)}
            className="w-full text-gray-600 border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Rating (1-5)"
            value={review.rating}
            min={1}
            max={5}
            onChange={(e) => onReviewChange(index, "rating", e.target.value)}
            className="w-full text-gray-600 border p-2 rounded"
          />

          {/* Images for reviews */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label
                htmlFor={`image-${index}`}
                className="text-sm text-gray-800"
              >
                Choose Images
              </label>
              <input
                id={`image-${index}`}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onFileChange(e, index, "image")}
                className="p-2 text-gray-600 rounded border"
              />
              {review.images.length > 0 && (
                <div className="text-gray-600 my-2">
                  <p>Image Previews:</p>
                  <div className="flex gap-2">
                    {review.images.map((image, imgIndex) => (
                      <div
                        key={imgIndex}
                        className="relative w-24 h-24 mt-2 rounded overflow-hidden"
                      >
                        <Image
                          src={getPreviewUrl(image)}
                          alt={`Review Image Preview ${index + 1}-${
                            imgIndex + 1
                          }`}
                          fill
                          style={{ objectFit: "cover" }}
                          unoptimized
                          priority={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Videos for reviews */}
            <div className="flex flex-col">
              <label
                htmlFor={`video-${index}`}
                className="text-sm text-gray-800"
              >
                Choose Videos
              </label>
              <input
                id={`video-${index}`}
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => onFileChange(e, index, "video")}
                className="p-2 text-gray-600 rounded border"
              />
              {review.videos.length > 0 && (
                <div className="text-gray-600 my-2">
                  <p>Video Previews:</p>
                  <div className="flex gap-2">
                    {review.videos.map((video, vidIndex) => (
                      <video
                        key={vidIndex}
                        src={getPreviewUrl(video)}
                        controls
                        className="w-48 h-48 mt-2"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {reviewInputs.length > 1 && (
            <button
              type="button"
              onClick={() => removeReview(index)}
              className="text-red-600 text-sm"
            >
              Remove Review
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addReview}
        className="text-blue-600 text-sm"
      >
        + Add Another Review
      </button>
    </div>
  );
}
