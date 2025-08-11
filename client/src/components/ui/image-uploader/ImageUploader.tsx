import React, { useState, ChangeEvent, useEffect } from "react";

interface ImageUploaderProps {
  imageUrl: string | null;
  onImageChange: (file: File | null) => void;
  style?: React.CSSProperties;
  className?: string;
  previewClassName?: string;
}

const ImageUploader = ({
  imageUrl,
  onImageChange,
  style,
  className,
  previewClassName,
}: ImageUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(imageUrl);

  useEffect(() => {
    setPreview(imageUrl);
  }, [imageUrl]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onImageChange(file);
    } else {
      setPreview(null);
      onImageChange(null);
    }
  };

  return (
    <div
      style={{ width: "33%", minWidth: "150px", ...style }}
      className={className}
    >
      <label
        htmlFor="image-upload"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px dashed #ccc",
          borderRadius: "8px",
          padding: "10px",
          cursor: "pointer",
          textAlign: "center",
          minHeight: "150px",
        }}
        className={previewClassName}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              borderRadius: "6px",
            }}
          />
        ) : (
          <p>Click or drag image here to upload</p>
        )}
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};

export default ImageUploader;
