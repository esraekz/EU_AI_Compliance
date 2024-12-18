import React, { useState } from "react";
import { useDropzone } from "react-dropzone";

const UploadPage: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Validation function for files
  const validateFile = (file: File): string | null => {
    const maxFileSize = 5 * 1024 * 1024; // 5 MB
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (file.size > maxFileSize) {
      return `File ${file.name} exceeds the 5MB size limit.`;
    }

    if (!allowedTypes.includes(file.type)) {
      return `File ${file.name} is not a supported format.`;
    }

    return null;
  };

  // Handle dropped files
  const onDrop = (acceptedFiles: File[], rejectedFiles: File[]) => {
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    acceptedFiles.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    setErrors([...errors, ...newErrors]);
    setUploadedFiles([...uploadedFiles, ...validFiles]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png"], "application/pdf": [".pdf"] },
    multiple: true,
  });

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h1>Upload Documents</h1>
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #666",
          borderRadius: "10px",
          padding: "20px",
          cursor: "pointer",
          textAlign: "center",
        }}
      >
        <input {...getInputProps()} />
        <p>Drag and drop files here</p>
        <p>or</p>
        <button
          type="button"
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "5px",
            border: "none",
          }}
        >
          Browse Files
        </button>
      </div>

      {errors.length > 0 && (
        <div style={{ color: "red", marginTop: "10px" }}>
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>Uploaded Files</h2>
          <ul>
            {uploadedFiles.map((file, index) => (
              <li key={index} style={{ marginBottom: "10px" }}>
                {file.name} - {(file.size / 1024 / 1024).toFixed(2)} MB
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  style={{
                    marginLeft: "10px",
                    backgroundColor: "red",
                    color: "#fff",
                    padding: "5px 10px",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
