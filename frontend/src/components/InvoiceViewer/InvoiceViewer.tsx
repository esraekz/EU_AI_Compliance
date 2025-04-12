// zoku/frontend/components/InvoiceViewer/InvoiceViewer.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DocumentPreview from './DocumentPreview';
import ExtractionPanel from '../DataExtraction/ExtractionPanel';
import { ExtractionField, Invoice, ApiResponse } from '../../types/invoice';
import { invoiceApi } from '../../services/api';
import styles from './InvoiceViewer.module.css';

interface InvoiceViewerProps {
  invoiceId: string;
}

const InvoiceViewer: React.FC<InvoiceViewerProps> = ({ invoiceId }) => {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showExtractedData, setShowExtractedData] = useState<boolean>(false);
  const [extractedFields, setExtractedFields] = useState<ExtractionField[]>([]);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  useEffect(() => {
    const fetchInvoice = async () => {
        if (!invoiceId) return;

        try {
          setIsLoading(true);
          setError(null);

          // const response = await invoiceApi.getInvoice(invoiceId);

          // Mock response for demonstration purposes
          const response = {
            success: true,
            data: {
              id: invoiceId,
              filename: 'demo-invoice.pdf',
              fileUrl: '/demo-invoice.pdf', // put a dummy PDF or image in `public/dummy/`
              fileType: 'pdf',
              uploadDate: '2025-04-12',
              supplier: 'Acme Corp',
              status: 'Processed',
              userId: 'dummy-user',
              extractedData: [
                {
                  id: '1',
                  name: 'Supplier',
                  value: 'Acme Corp',
                  confidence: 0.98
                },
                {
                  id: '2',
                  name: 'Invoice Number',
                  value: 'INV-2025-001',
                  confidence: 0.95
                }
              ]
            }
          };

          if (response.success && response.data) {
            const data = response.data;

            const extension = data.filename.split('.').pop()?.toLowerCase();
            const inferredFileType: 'pdf' | 'image' =
              extension === 'pdf' ? 'pdf' : 'image';

            const completeInvoice: Invoice = {
              ...data,
              fileType: inferredFileType, // ✅ inject missing field
            };

            setInvoice(completeInvoice);

            if (data.extractedData && data.extractedData.length > 0) {
              setExtractedFields(data.extractedData);
              setShowExtractedData(true);
            }
          } else {
            setInvoice(null);
            setError(response.message || 'Invoice not found.');
          }
        } catch (err) {
          console.error('Error fetching invoice:', err);
          setInvoice(null);
          setError('Failed to load invoice. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };


    fetchInvoice();
  }, [invoiceId]);


  const handleExtract = async (fields: { id: string; name: string }[]) => {
    try {
      setIsExtracting(true);

      const response = await invoiceApi.extractData(invoiceId, fields);

      if (response.success && response.data) {
        setExtractedFields(response.data); // ✅ only the data (array)
        setShowExtractedData(true);
        return response.data;
      } else {
        throw new Error(response.message || 'Extraction failed');
      }
    } catch (error) {
      console.error('Extraction failed:', error);
      throw error;
    } finally {
      setIsExtracting(false);
    }
  };


  const handleExport = async (format: 'json' | 'xml') => {
    try {
      await invoiceApi.exportData(invoiceId, extractedFields, format);
    } catch (error) {
      console.error(`Error exporting as ${format}:`, error);
      throw error;
    }
  };

  const handleBackToList = () => {
    router.push('/invoices/uploaded');
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading invoice...</div>;
  }

  if (error || !invoice) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-center">
        <p className="text-red-700">{error || 'Invoice not found'}</p>
        <button
          onClick={handleBackToList}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          onClick={handleBackToList}
          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded"
        >
          Back to Invoices
        </button>
        <h1 className={styles.title}>{invoice.filename}</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.documentPanel}>
          <DocumentPreview invoice={invoice} />
        </div>

        <div className={styles.extractionPanel}>
          <ExtractionPanel
            invoiceId={invoiceId}
            showExtractedData={showExtractedData}
            extractedFields={extractedFields}
            isExtracting={isExtracting}
            onExtract={handleExtract}
            onExport={handleExport}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewer;
