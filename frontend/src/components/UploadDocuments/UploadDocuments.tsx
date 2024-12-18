import React from "react";
import styles from "./UploadDocuments.module.css";

const UploadDocuments: React.FC = () => {
  return (
    <div className={styles.uploadPage}>
      {/* Header */}
      <header className={styles.header}>
        <h1>Document Upload</h1>
      </header>

      {/* Upload Box */}
      <div className={styles.uploadBox}>
        <div className={styles.uploadIcon}>
          <div className={styles.arrow}></div>
        </div>
        <p>Drag and drop files here</p>
        <p>or</p>
        <button className={styles.browseButton}>Browse Files</button>
      </div>

      {/* Upload List */}
      <div className={styles.uploadList}>
        <p className={styles.uploadedFilesTitle}>Uploaded Files:</p>
        <p className={styles.noFiles}>No files uploaded yet</p>
      </div>
    </div>
  );
};

export default UploadDocuments;
