// zoku/frontend/components/Invoices/InvoiceListItem.tsx
import React from 'react';
import { Eye, Download } from 'lucide-react';
import { useRouter } from 'next/router';
import { Invoice } from '../../types/invoice';

interface InvoiceListItemProps {
  invoice: Invoice;
}

const InvoiceListItem: React.FC<InvoiceListItemProps> = ({ invoice }) => {
  const router = useRouter();

  const handleViewInvoice = () => {
    router.push(`/invoices/${invoice.id}`);
  };

  const handleDownloadInvoice = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = invoice.fileUrl;
    link.download = invoice.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {invoice.filename}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(invoice.uploadDate).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {invoice.supplier || 'Unknown'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          invoice.status === 'Processed'
            ? 'bg-green-100 text-green-800'
            : invoice.status === 'Failed'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
        }`}>
          {invoice.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={handleViewInvoice}
          className="text-blue-600 hover:text-blue-900 mr-3"
          aria-label="View invoice"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={handleDownloadInvoice}
          className="text-gray-600 hover:text-gray-900"
          aria-label="Download invoice"
        >
          <Download className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

export default InvoiceListItem;
