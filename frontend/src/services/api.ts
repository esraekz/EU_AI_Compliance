// src/services/api.ts
import axios from 'axios';
import { ApiResponse, ExtractionField, Invoice, InvoiceListParams } from '../types/invoice';

// QA Types - UPDATED with session support
export interface QuestionRequest {
  question: string;
  document_ids?: string[];
  session_id?: string;  // NEW: Add session ID support
}

export interface QuestionResponse {
  answer: string;
  sources: Record<string, any>;
  session_id?: string;  // NEW: Include session ID in response
}

// Chat Session Types - NEW
export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  selected_documents: string[];
  document_names: string[];
  message_count: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  // From backend joins:
  history_message_count?: number;
  chat_message_count?: number;
  total_message_count?: number;
}

export interface ChatSessionCreate {
  title?: string;
  selected_documents?: string[];
  document_names?: string[];
}

export interface ChatSessionUpdate {
  title?: string;
  selected_documents?: string[];
  document_names?: string[];
}

export interface ChatSessionResponse {
  status: string;
  session_id?: string;
  data?: ChatSession;
  message?: string;
}

export interface ChatSessionsListResponse {
  status: string;
  sessions?: ChatSession[];
  message?: string;
}

export interface ChatSessionWithMessages {
  status: string;
  session?: ChatSession & {
    messages: Array<{
      id: string;
      type: 'user' | 'system' | 'error';
      text: string;
      timestamp: string;
      source: 'history' | 'messages';
    }>;
  };
  message?: string;
}

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
      // Use this URL path for invoice endpoints
      const response = await axios.get('http://localhost:8000/invoices', { params });
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

      const response = await axios.post('http://localhost:8000/invoices', formData, {
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

// QA API - UPDATED with session support
export const qaApi = {
  // Ask a question about documents - UPDATED to include session_id
  askQuestion: async (question: string, documentIds?: string[], sessionId?: string): Promise<QuestionResponse> => {
    try {
      const requestData: QuestionRequest = {
        question,
        document_ids: documentIds,
        session_id: sessionId  // NEW: Include session ID
      };

      // Note the different endpoint path - this goes directly to /qa rather than /api/qa
      const response = await axios.post<QuestionResponse>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/qa`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error asking question:', error);
      throw error;
    }
  }
};

// Chat Sessions API - NEW
export const chatSessionsApi = {
  // Create a new chat session
  createSession: async (sessionData: ChatSessionCreate): Promise<ChatSessionResponse> => {
    try {
      const response = await axios.post<ChatSessionResponse>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat-sessions`,
        sessionData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  },

  // Get all chat sessions
  getSessions: async (limit: number = 50, offset: number = 0): Promise<ChatSessionsListResponse> => {
    try {
      const response = await axios.get<ChatSessionsListResponse>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat-sessions`,
        {
          params: { limit, offset },
          headers: {
            'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      throw error;
    }
  },

  // Get a specific session with messages
  getSession: async (sessionId: string): Promise<ChatSessionWithMessages> => {
    try {
      const response = await axios.get<ChatSessionWithMessages>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat-sessions/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching chat session:', error);
      throw error;
    }
  },

  // Update a chat session
  updateSession: async (sessionId: string, updates: ChatSessionUpdate): Promise<ChatSessionResponse> => {
    try {
      const response = await axios.put<ChatSessionResponse>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat-sessions/${sessionId}`,
        updates,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating chat session:', error);
      throw error;
    }
  },

  // Delete a chat session
  deleteSession: async (sessionId: string): Promise<{ status: string; message: string }> => {
    try {
      const response = await axios.delete<{ status: string; message: string }>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat-sessions/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting chat session:', error);
      throw error;
    }
  }
};

export default api;
