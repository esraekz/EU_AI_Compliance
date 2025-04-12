// zoku/frontend/components/Invoices/InvoiceList.tsx
import React, { useEffect, useState } from 'react';
import { FileText, Check, Clock, AlertTriangle } from 'lucide-react';
import { invoiceApi } from '../../services/api';
import { useRouter } from 'next/router';

interface Invoice {
  id: string;
  filename: string;
  uploadDate: string;
  status: 'uploaded' | 'processed' | 'error';
  // Add other fields as needed
}

interface InvoiceListProps {
  filterStatus?: 'uploaded' | 'processed' | 'error';
}

const InvoiceList: React.FC<InvoiceListProps> = ({ filterStatus }) => {
const [invoices, setInvoices] = useState<Invoice[]>([]);
const [isLoading, setIsLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);

const router = useRouter();


  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // In a real app, you would use a real API call
        // const response = await invoiceApi.getInvoices(filterStatus);

        // Mock data for demonstration
        const mockInvoices: Invoice[] = [
          {
            id: '1',
            filename: 'invoice-001.pdf',
            uploadDate: '2025-04-10T14:30:00Z',
            status: 'uploaded'
          },
          {
            id: '2',
            filename: 'bill-march.pdf',
            uploadDate: '2025-04-05T09:45:00Z',
            status: 'processed'
          },
          {
            id: '3',
            filename: 'supplier-invoice.pdf',
            uploadDate: '2025-04-01T16:20:00Z',
            status: 'error'
          }
        ];

        // Filter invoices if a status filter is provided
        const filteredInvoices = filterStatus
          ? mockInvoices.filter(invoice => invoice.status === filterStatus)
          : mockInvoices;

        setInvoices(filteredInvoices);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError('Failed to load invoices. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [filterStatus]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'processed':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading invoices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">No invoices found</h3>
        <p className="text-gray-500">
          {filterStatus === 'uploaded' && 'Upload an invoice to get started.'}
          {filterStatus === 'processed' && 'No processed invoices yet.'}
          {!filterStatus && 'No invoices available.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Filename
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Upload Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="text-sm font-medium text-gray-900">{invoice.filename}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{formatDate(invoice.uploadDate)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {getStatusIcon(invoice.status)}
                  <span className="ml-1.5 text-sm text-gray-700 capitalize">{invoice.status}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                    className="text-blue-600 hover:text-blue-900"
                    onClick={() => router.push(`/invoices/${invoice.id}`)}
                    >
                    View
                </button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceList;
