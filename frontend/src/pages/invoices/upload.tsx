// src/pages/invoices/upload.tsx
import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import InvoicesLayout from '../../components/Layout/InvoicesLayout';
import styles from '../../styles/invoices.module.css';
import { Upload } from 'lucide-react';
import { invoiceApi } from '../../services/api';

const UploadInvoicePage: React.FC = () => {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      // Check file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Invalid file type. Please upload a PDF, JPEG, or PNG file.');
        return;
      }

      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Check file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Invalid file type. Please upload a PDF, JPEG, or PNG file.');
        return;
      }

      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      const response = await invoiceApi.uploadInvoice(selectedFile);

      if (response.success) {
        // Redirect to uploaded invoices page
        router.push('/invoices/uploaded');
      } else {
        setUploadError(response.message || 'Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('An unexpected error occurred. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Upload Invoice | Zoku</title>
        <meta name="description" content="Upload a new invoice" />
      </Head>

      <InvoicesLayout>
        {uploadError && (
          <div className={styles.errorMessage}>
            {uploadError}
          </div>
        )}

        <div className={styles.uploadContainer}>
          <div
            className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className={styles.dropzoneContent}>
              <Upload className={styles.uploadIcon} />

              {selectedFile ? (
                <div className={styles.fileInfo}>
                  <p className={styles.fileName}>{selectedFile.name}</p>
                  <p className={styles.fileSize}>
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <>
                  <p className={styles.dropzoneText}>
                    Drag and drop your invoice here
                  </p>
                  <p className={styles.dropzoneSubtext}>
                    or
                  </p>
                </>
              )}

              {!selectedFile ? (
                <label className={styles.browseButton}>
                  Browse Files
                  <input
                    type="file"
                    className={styles.fileInput}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className={styles.actionButtons}>
                  <button
                    className={styles.removeButton}
                    onClick={() => setSelectedFile(null)}
                    disabled={isUploading}
                  >
                    Remove
                  </button>
                  <button
                    className={`${styles.uploadActionButton} ${isUploading ? styles.loading : ''}`}
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Invoice'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.acceptedFiles}>
            <h3>Accepted File Types</h3>
            <ul>
              <li>PDF documents (.pdf)</li>
              <li>JPEG images (.jpg, .jpeg)</li>
              <li>PNG images (.png)</li>
            </ul>
          </div>
        </div>
      </InvoicesLayout>
    </>
  );
};

export default UploadInvoicePage;
