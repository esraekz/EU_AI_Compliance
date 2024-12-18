import React, { useState } from "react";
import { useDropzone } from "react-dropzone";

const UploadPage: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>("");

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
  const onDrop = (acceptedFiles: File[]) => {
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

    // Automatically upload valid files
    if (validFiles.length > 0) {
      handleUpload(validFiles);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png"], "application/pdf": [".pdf"] },
    multiple: true,
  });

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Upload files to FastAPI
  const handleUpload = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file", file); // Add each file to the form data
    });

    try {
      setUploadStatus("Uploading...");
      const response = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Error: ${errorMessage}`);
      }

      const data = await response.json();
      setUploadStatus(`Upload successful: ${data.file_path || "Files processed"}`);
    } catch (error) {
      if (error instanceof Error) {
        setUploadStatus(`Upload failed: ${error.message}`);
      } else {
        setUploadStatus("Upload failed: An unknown error occurred.");
      }
    }
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

      {uploadStatus && (
        <div style={{ marginTop: "20px", color: uploadStatus.startsWith("Upload failed") ? "red" : "green" }}>
          {uploadStatus}
        </div>
      )}
    </div>
  );
};

export default UploadPage;
