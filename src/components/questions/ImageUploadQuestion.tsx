"use client";

import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";

import type { QuestionComponentProps } from "./registry";

interface ImageUploadQuestionProps extends QuestionComponentProps {
  onUpload?: (file: File) => Promise<{ mediaId: string; previewUrl: string }>;
}

/** Generic image upload question (distinct from the dedicated Palmistry capture flow). */
export function ImageUploadQuestion({ value, onChange, onUpload }: ImageUploadQuestionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file || !onUpload) return;
    setUploading(true);
    try {
      const result = await onUpload(file);
      setPreview(result.previewUrl);
      onChange({ type: "image_upload", mediaId: result.mediaId });
    } finally {
      setUploading(false);
    }
  }

  const hasValue = value?.type === "image_upload";

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {preview ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Uploaded" className="max-h-64 rounded-xl2 border border-ink-600" />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              inputRef.current?.click();
            }}
            className="focus-ring absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink-800 text-paper-100 shadow-panel"
            aria-label="Replace image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="focus-ring flex h-40 w-full max-w-sm flex-col items-center justify-center gap-2 rounded-xl2 border border-dashed border-ink-500 bg-ink-800/40 text-paper-100/70 transition-colors hover:border-signal-cyan/60"
        >
          <UploadCloud className="h-6 w-6" />
          <span className="text-sm">{uploading ? "Uploading…" : hasValue ? "Uploaded — tap to replace" : "Tap to upload a photo"}</span>
        </button>
      )}
    </div>
  );
}
