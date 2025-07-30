import {useState, ChangeEvent, useEffect} from "react";

interface ImageUploaderProps {
    imageUrl: string | null;
    onImageChange: (file: File | null) => void;
}

const ImageUploader = ({ imageUrl, onImageChange } : ImageUploaderProps) => {
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
        <div style={{ width: "33%", minWidth: "150px" }}>
            <label
                htmlFor="image-upload"
                style={{
                    display: "block",
                    border: "2px dashed #ccc",
                    borderRadius: "8px",
                    padding: "10px",
                    cursor: "pointer",
                    textAlign: "center",
                }}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Preview"
                        style={{ width: "100%", height: "auto", borderRadius: "6px" }}
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
