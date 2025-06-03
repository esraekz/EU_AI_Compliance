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
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
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

// Prompt Optimizer Types
export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  original_prompt: string;
  optimized_prompt?: string;
  status: 'draft' | 'optimized' | 'archived';
  tags?: string[];
  created_at: string;
  updated_at: string;
  optimization_results?: OptimizationResult[];
}

export interface PromptCreate {
  title?: string;
  original_prompt: string;
  tags?: string[];
}

export interface PromptUpdate {
  title?: string;
  original_prompt?: string;
  optimized_prompt?: string;
  tags?: string[];
  status?: 'draft' | 'optimized' | 'archived';
}

export interface OptimizationResult {
  id: string;
  prompt_id: string;
  analysis_type: 'clarity' | 'security' | 'performance' | 'structure';
  score: number;
  suggestions: Array<{
    improvement?: string;
    suggestion?: string;
    fix?: string;
    example?: string;
    reason?: string;
    benefit?: string;
  }>;
  issues_found: Array<{
    type: string;
    description: string;
    location?: string;
    severity?: string;
    impact?: string;
  }>;
  token_count_original: number;
  token_count_optimized: number;
  created_at: string;
}

export interface PromptVersion {
  id: string;
  prompt_id: string;
  version_number: number;
  prompt_text: string;
  optimization_notes?: string;
  created_at: string;
}

export interface OptimizationAnalysis {
  original_prompt: string;
  optimized_prompt: string;
  token_count_original: number;
  token_count_optimized: number;
  overall_score: number;
  analyses: {
    clarity: any;
    security: any;
    performance: any;
    structure: any;
  };
  token_savings: number;
}

export interface PromptListParams {
  limit?: number;
  offset?: number;
  search?: string;
}

export interface ApiPromptResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
  limit?: number;
  offset?: number;
}

// Prompt Optimizer API
export const promptOptimizerApi = {
  // Create a new prompt
  createPrompt: async (promptData: PromptCreate): Promise<ApiPromptResponse<Prompt>> => {
    try {
      const response = await api.post('/prompt-optimizer/prompts', promptData);
      return response.data;
    } catch (error) {
      console.error('Error creating prompt:', error);
      throw error;
    }
  },

  // Get all prompts for the user
  getPrompts: async (params: PromptListParams = {}): Promise<ApiPromptResponse<Prompt[]>> => {
    try {
      const response = await api.get('/prompt-optimizer/prompts', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching prompts:', error);
      throw error;
    }
  },

  // Get a specific prompt by ID
  getPrompt: async (promptId: string): Promise<ApiPromptResponse<Prompt>> => {
    try {
      const response = await api.get(`/prompt-optimizer/prompts/${promptId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching prompt ${promptId}:`, error);
      throw error;
    }
  },

  // Update an existing prompt
  updatePrompt: async (promptId: string, updates: PromptUpdate): Promise<ApiPromptResponse<Prompt>> => {
    try {
      const response = await api.put(`/prompt-optimizer/prompts/${promptId}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Error updating prompt ${promptId}:`, error);
      throw error;
    }
  },

  // Delete a prompt
  deletePrompt: async (promptId: string): Promise<ApiPromptResponse> => {
    try {
      const response = await api.delete(`/prompt-optimizer/prompts/${promptId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting prompt ${promptId}:`, error);
      throw error;
    }
  },

  // Optimize a prompt using AI
  optimizePrompt: async (promptId: string): Promise<ApiPromptResponse<OptimizationAnalysis>> => {
    try {
      const response = await api.post(`/prompt-optimizer/prompts/${promptId}/optimize`);
      return response.data;
    } catch (error) {
      console.error(`Error optimizing prompt ${promptId}:`, error);
      throw error;
    }
  },

  // Quick analysis without saving
  analyzePrompt: async (promptText: string): Promise<ApiPromptResponse<OptimizationAnalysis>> => {
    try {
      const response = await api.post('/prompt-optimizer/analyze', null, {
        params: { prompt_text: promptText }
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing prompt:', error);
      throw error;
    }
  },

  // Get version history for a prompt
  getPromptVersions: async (promptId: string): Promise<ApiPromptResponse<PromptVersion[]>> => {
    try {
      const response = await api.get(`/prompt-optimizer/prompts/${promptId}/versions`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching versions for prompt ${promptId}:`, error);
      throw error;
    }
  },

  // Export optimization results
  exportOptimization: async (promptId: string, format: 'json' | 'txt' = 'json'): Promise<boolean> => {
    try {
      const promptResponse = await promptOptimizerApi.getPrompt(promptId);
      const prompt = promptResponse.data;

      if (!prompt) {
        throw new Error('Prompt not found');
      }

      const exportData = {
        prompt: {
          title: prompt.title,
          original_prompt: prompt.original_prompt,
          optimized_prompt: prompt.optimized_prompt,
          created_at: prompt.created_at
        },
        optimization_results: prompt.optimization_results || []
      };

      // Create and download file
      const dataStr = format === 'json'
        ? JSON.stringify(exportData, null, 2)
        : `Title: ${prompt.title}\n\nOriginal Prompt:\n${prompt.original_prompt}\n\nOptimized Prompt:\n${prompt.optimized_prompt}`;

      const dataBlob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/plain' });
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prompt-optimization-${promptId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error(`Error exporting optimization for prompt ${promptId}:`, error);
      throw error;
    }
  }
};

// Add this to your existing export at the bottom of api.ts
// export { promptOptimizerApi };
export default api;
