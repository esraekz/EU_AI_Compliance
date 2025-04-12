// zoku/frontend/components/InvoiceViewer/DocumentPreview.tsx
import React, { useState } from 'react';
import { FileText, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { Invoice } from '../../types/invoice';
import styles from './DocumentPreview.module.css';
import Image from 'next/image';

interface DocumentPreviewProps {
  invoice: Invoice;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ invoice }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2.0));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleDownload = () => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = invoice.fileUrl;
    link.download = invoice.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <h2 className={styles.title}>Invoice Preview</h2>
        <div className={styles.actions}>
          <button
            onClick={handleZoomOut}
            className={styles.toolbarButton}
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className={styles.zoomLevel}>{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className={styles.toolbarButton}
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className={styles.toolbarButton}
            title="Download original"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={styles.previewArea}>
        {invoice.fileUrl ? (
          <div
            className={styles.documentContainer}
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {invoice.fileType === 'pdf' ? (
              <iframe
                src={`${invoice.fileUrl}#toolbar=0`}
                className={styles.pdfViewer}
                title={invoice.filename}
              />
            ) : (
                <Image
                src={invoice.fileUrl}
                alt={invoice.filename}
                className={styles.imageViewer}
                width={800} // Set appropriate width
                height={600} // Set appropriate height
                unoptimized // Optional: skip Next.js optimization for external URLs
              />

            )}
          </div>
        ) : (
          <div className={styles.placeholderContainer}>
            <FileText className="w-16 h-16 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">{invoice.filename}</p>
            <p className="text-xs text-gray-400">Preview not available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentPreview;
