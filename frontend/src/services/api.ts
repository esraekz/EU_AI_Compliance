// src/services/api.ts
import axios from 'axios';
import { ExtractionField, Invoice, ApiResponse, InvoiceListParams } from '../types/invoice';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response);
    return Promise.reject(error);
  }
);

// Add auth interceptor for JWT token
api.interceptors.request.use((config) => {
  // Get token from localStorage or session
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Invoice API functions
export const invoiceApi = {
  // Get all invoices with optional filtering
  getInvoices: async (params: InvoiceListParams = {}): Promise<ApiResponse<{ invoices: Invoice[]; total: number }>> => {
    try {
      const response = await api.get('/invoices', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  // Get single invoice by ID
  getInvoice: async (id: string): Promise<ApiResponse<Invoice>> => {
    try {
      const response = await api.get(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching invoice ${id}:`, error);
      throw error;
    }
  },

  // Upload new invoice
  uploadInvoice: async (file: File): Promise<ApiResponse<Invoice>> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/invoices', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading invoice:', error);
      throw error;
    }
  },

  // Extract data from invoice
  extractData: async (
    invoiceId: string,
    _fields: Array<{ id: string; name: string }>
  ): Promise<{ success: boolean; data: ExtractionField[] }> => {
    try {
      const response = await api.post(`/invoices/${invoiceId}/extract-ai`, {
        fields: _fields,
      });
      return response.data;
    } catch (error) {
      console.error(`Error extracting with AI for invoice ${invoiceId}:`, error);
      throw error;
    }
  },


  // Export data as JSON
  exportJson: async (invoiceId: string, fields: ExtractionField[]): Promise<boolean> => {
    try {
      const response = await api.post(`/invoices/${invoiceId}/export/json`, { fields }, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}-data.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    } catch (error) {
      console.error(`Error exporting JSON for invoice ${invoiceId}:`, error);
      throw error;
    }
  },

  // Export data as XML
  exportXml: async (invoiceId: string, fields: ExtractionField[]): Promise<boolean> => {
    try {
      const response = await api.post(`/invoices/${invoiceId}/export/xml`, { fields }, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}-data.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    } catch (error) {
      console.error(`Error exporting XML for invoice ${invoiceId}:`, error);
      throw error;
    }
  },

  exportData: async (
    invoiceId: string,
    fields: ExtractionField[],
    format: 'json' | 'xml'
  ): Promise<boolean> => {
    if (format === 'json') {
      return invoiceApi.exportJson(invoiceId, fields);
    } else {
      return invoiceApi.exportXml(invoiceId, fields);
    }
  }

};

export default api;
