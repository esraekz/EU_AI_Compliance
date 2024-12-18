import React from "react";

const UploadPage: React.FC = () => {
  return (
    <div>
      <h1>Upload Documents</h1>
      <div style={{ border: "2px dashed #666", borderRadius: "10px", padding: "20px" }}>
        <p>Drag and drop files here</p>
        <p>or</p>
        <button style={{ backgroundColor: "#007bff", color: "#fff", padding: "10px 20px", borderRadius: "5px" }}>
          Browse Files
        </button>
      </div>
    </div>
  );
};

export default UploadPage;
