// src/services/api.ts
import axios from 'axios';
import { ApiResponse, ExtractionField, Invoice, InvoiceListParams } from '../types/invoice';

// QA Types - UPDATED with session support
export interface QuestionRequest {
  question: string;
  document_ids?: string[];
  session_id?: string;
}

export interface QuestionResponse {
  answer: string;
  sources: Record<string, any>;
  session_id?: string;
}

// Chat Session Types
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

// AI Risk Assessment Types - UPDATED for Steps 1-10
export interface AISystem {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  development_stage?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id: string;
  ai_system_id: string;
  current_step: number;
  completed_steps: number;

  // Step completion flags
  step_1_completed: boolean;
  step_2_completed: boolean;
  step_3_completed: boolean;
  step_4_completed: boolean;
  step_5_completed: boolean;
  step_6_completed: boolean;
  step_7_completed: boolean;
  step_8_completed: boolean;
  step_9_completed: boolean;
  step_10_completed: boolean;

  // Step 1: Basic Information
  system_name?: string;
  system_description?: string;
  development_stage?: string;
  system_version?: string;
  planned_deployment_timeline?: string;

  // Step 2: Purpose Analysis
  business_domain?: string;
  primary_purpose?: string;
  target_users?: any;
  use_case_description?: string;
  geographic_scope?: any;
  automated_decisions_legal_effects?: string;

  // Step 3: Technical Characteristics
  ai_model_type?: string;
  model_architecture?: string;
  data_processing_type?: string;
  input_data_types?: any;
  output_types?: any;
  decision_autonomy?: string;

  // Step 4: Prohibited Practices
  subliminal_manipulation?: string;
  vulnerable_groups_exploitation?: string;
  social_scoring_public?: string;
  realtime_biometric_public?: string;

  // Step 5: Annex III Assessment
  biometric_categorization?: boolean;
  critical_infrastructure?: boolean;
  education_training?: boolean;
  employment_recruitment?: boolean;
  essential_services?: boolean;
  law_enforcement?: boolean;
  migration_asylum?: boolean;
  justice_democracy?: boolean;
  involves_profiling?: boolean;
  preparatory_task_only?: boolean;

  // Step 6: Safety Components
  safety_component?: string;
  safety_component_sector?: string;
  third_party_conformity?: boolean;
  ce_marking_required?: boolean;
  eu_legislation_applicable?: any;

  // Step 7: Impact and Oversight
  affected_individuals_count?: string;
  vulnerable_groups_affected?: boolean;
  vulnerable_groups_details?: string;
  impact_level?: string;
  impact_details?: string;
  human_oversight_level?: string;
  oversight_mechanisms?: string;
  override_capabilities?: boolean;
  human_review_process?: string;

  // Step 8: Data Governance
  data_sources?: any;
  personal_data_processing?: boolean;
  data_quality_measures?: string;
  bias_mitigation_measures?: string;
  data_governance_framework?: string;
  gdpr_compliance_status?: string;

  // Step 9: Transparency
  transparency_level?: string;
  user_notification_mechanism?: string;
  explainability_features?: string;
  decision_explanation_capability?: boolean;

  // Step 10: Compliance Readiness
  existing_governance_framework?: boolean;
  governance_details?: string;
  documentation_status?: string;
  risk_management_system?: boolean;
  conformity_assessment_ready?: boolean;
}

export interface ClassificationResult {
  id: string;
  ai_system_id: string;
  risk_level: string;
  primary_reason: string;
  confidence_level: string;
  article_5_violation: boolean;
  annex_iii_match: boolean;
  has_exceptions: boolean;
  created_at: string;
}

export interface AISystemCreateRequest {
  name: string;
  description?: string;
  development_stage?: string;
}

export interface AssessmentStepUpdate {
  step: number;
  data: Record<string, any>;
}

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response);
    return Promise.reject(error);
  }
);

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Invoice API functions
export const invoiceApi = {
  getInvoices: async (params: InvoiceListParams = {}): Promise<ApiResponse<{ invoices: Invoice[]; total: number }>> => {
    try {
      const response = await axios.get('http://localhost:8000/invoices', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return {
        success: false,
        data: { invoices: [], total: 0 },
        message: 'Failed to load documents'
      };
    }
  },

  getInvoice: async (id: string): Promise<ApiResponse<Invoice>> => {
    try {
      const response = await api.get(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching invoice ${id}:`, error);
      throw error;
    }
  },

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

  exportJson: async (invoiceId: string, fields: ExtractionField[]): Promise<boolean> => {
    try {
      const response = await api.post(`/invoices/${invoiceId}/export/json`, { fields }, {
        responseType: 'blob'
      });

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

  exportXml: async (invoiceId: string, fields: ExtractionField[]): Promise<boolean> => {
    try {
      const response = await api.post(`/invoices/${invoiceId}/export/xml`, { fields }, {
        responseType: 'blob'
      });

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

// QA API
export const qaApi = {
  askQuestion: async (question: string, documentIds?: string[], sessionId?: string): Promise<QuestionResponse> => {
    try {
      const requestData: QuestionRequest = {
        question,
        document_ids: documentIds,
        session_id: sessionId
      };

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

// Chat Sessions API
export const chatSessionsApi = {
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

// Prompt Optimizer API
export const promptOptimizerApi = {
  createPrompt: async (promptData: PromptCreate): Promise<ApiPromptResponse<Prompt>> => {
    try {
      const response = await api.post('/prompt-optimizer/prompts', promptData);
      return response.data;
    } catch (error) {
      console.error('Error creating prompt:', error);
      throw error;
    }
  },

  getPrompts: async (params: PromptListParams = {}): Promise<ApiPromptResponse<Prompt[]>> => {
    try {
      const response = await api.get('/prompt-optimizer/prompts', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching prompts:', error);
      throw error;
    }
  },

  getPrompt: async (promptId: string): Promise<ApiPromptResponse<Prompt>> => {
    try {
      const response = await api.get(`/prompt-optimizer/prompts/${promptId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching prompt ${promptId}:`, error);
      throw error;
    }
  },

  updatePrompt: async (promptId: string, updates: PromptUpdate): Promise<ApiPromptResponse<Prompt>> => {
    try {
      const response = await api.put(`/prompt-optimizer/prompts/${promptId}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Error updating prompt ${promptId}:`, error);
      throw error;
    }
  },

  deletePrompt: async (promptId: string): Promise<ApiPromptResponse> => {
    try {
      const response = await api.delete(`/prompt-optimizer/prompts/${promptId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting prompt ${promptId}:`, error);
      throw error;
    }
  },

  optimizePrompt: async (promptId: string): Promise<ApiPromptResponse<OptimizationAnalysis>> => {
    try {
      const response = await api.post(`/prompt-optimizer/prompts/${promptId}/optimize`);
      return response.data;
    } catch (error) {
      console.error(`Error optimizing prompt ${promptId}:`, error);
      throw error;
    }
  },

  analyzePrompt: async (promptText: string): Promise<ApiPromptResponse<OptimizationAnalysis>> => {
    try {
      const response = await api.post('/prompt-optimizer/analyze', {
        prompt_text: promptText
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing prompt:', error);
      throw error;
    }
  },

  getPromptVersions: async (promptId: string): Promise<ApiPromptResponse<PromptVersion[]>> => {
    try {
      const response = await api.get(`/prompt-optimizer/prompts/${promptId}/versions`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching versions for prompt ${promptId}:`, error);
      throw error;
    }
  },

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

// Template Library API
export const templateLibraryApi = {
  healthCheck: async () => {
    try {
      const response = await api.get('/template-library/health');
      return response.data;
    } catch (error) {
      console.error('Template library health check failed:', error);
      throw error;
    }
  },

  getTemplates: async (params: any = {}) => {
    try {
      const searchParams = new URLSearchParams();

      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());
      if (params.category && params.category !== 'All') searchParams.append('category', params.category);
      if (params.search) searchParams.append('search', params.search);
      if (params.sort_by) searchParams.append('sort_by', params.sort_by);
      if (params.is_featured !== undefined) searchParams.append('is_featured', params.is_featured.toString());

      const url = `/template-library/templates${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Get templates failed:', error);
      throw error;
    }
  },

  getFeaturedTemplates: async (limit: number = 8) => {
    try {
      const response = await api.get(`/template-library/templates/featured?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get featured templates failed:', error);
      throw error;
    }
  },

  getTemplate: async (templateId: string) => {
    try {
      const response = await api.get(`/template-library/templates/${templateId}`);
      return response.data;
    } catch (error) {
      console.error(`Get template ${templateId} failed:`, error);
      throw error;
    }
  },

  createTemplate: async (templateData: {
    title: string;
    description?: string;
    content: string;
    category: string;
    tags?: string[];
    is_public?: boolean;
    is_featured?: boolean;
  }) => {
    try {
      const response = await api.post('/template-library/templates', templateData);
      return response.data;
    } catch (error) {
      console.error('Create template failed:', error);
      throw error;
    }
  },

  updateTemplate: async (templateId: string, templateData: any) => {
    try {
      const response = await api.put(`/template-library/templates/${templateId}`, templateData);
      return response.data;
    } catch (error) {
      console.error(`Update template ${templateId} failed:`, error);
      throw error;
    }
  },

  useTemplate: async (templateId: string) => {
    try {
      const response = await api.post(`/template-library/templates/${templateId}/use`);
      return response.data;
    } catch (error) {
      console.error(`Use template ${templateId} failed:`, error);
      throw error;
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/template-library/categories');
      return response.data;
    } catch (error) {
      console.error('Get categories failed:', error);
      throw error;
    }
  },

  getDashboardStats: async () => {
    try {
      const response = await api.get('/template-library/dashboard');
      return response.data;
    } catch (error) {
      console.error('Get dashboard stats failed:', error);
      throw error;
    }
  },

  searchTemplates: async (searchTerm: string, filters: any = {}) => {
    try {
      const params = {
        search: searchTerm,
        ...filters
      };
      return await templateLibraryApi.getTemplates(params);
    } catch (error) {
      console.error('Search templates failed:', error);
      throw error;
    }
  },

  getTemplatesByCategory: async (category: string, limit: number = 20) => {
    try {
      const params = {
        category: category,
        limit: limit
      };
      return await templateLibraryApi.getTemplates(params);
    } catch (error) {
      console.error(`Get templates by category ${category} failed:`, error);
      throw error;
    }
  }
};

// AI Risk Assessment API - UPDATED for complete 10-step wizard
export const aiSystemsApi = {
  healthCheck: async () => {
    try {
      const response = await api.get('/ai-systems/health');
      return response.data;
    } catch (error) {
      console.error('AI Systems health check failed:', error);
      throw error;
    }
  },

  createAISystem: async (systemData: AISystemCreateRequest) => {
    try {
      const response = await api.post('/ai-systems/', systemData);
      return response.data;
    } catch (error) {
      console.error('Create AI system failed:', error);
      throw error;
    }
  },

  getAISystems: async (params: { limit?: number; offset?: number } = {}) => {
    try {
      console.log('🔄 Fetching AI systems...');
      const response = await api.get('/ai-systems/', { params });
      console.log('✅ AI systems response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get AI systems failed:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  },

  getAISystem: async (systemId: string) => {
    try {
      const response = await api.get(`/ai-systems/${systemId}`);
      return response.data;
    } catch (error) {
      console.error(`Get AI system ${systemId} failed:`, error);
      throw error;
    }
  },

  updateAssessmentStep: async (systemId: string, stepUpdate: AssessmentStepUpdate) => {
    try {
      const response = await api.put(`/ai-systems/${systemId}/assessment`, stepUpdate);
      return response.data;
    } catch (error) {
      console.error(`Update assessment step failed:`, error);
      throw error;
    }
  },

  classifyAISystem: async (systemId: string) => {
    try {
      const response = await api.post(`/ai-systems/${systemId}/classify`);
      return response.data;
    } catch (error) {
      console.error(`Classify AI system ${systemId} failed:`, error);
      throw error;
    }
  }
};

// Test function for Template Library API
export const testTemplateLibraryAPI = async () => {
  console.log('🧪 Testing Template Library API integration...');

  try {
    console.log('1. Testing health check...');
    const health = await templateLibraryApi.healthCheck();
    console.log('✅ Health check:', health);

    console.log('2. Testing get categories...');
    const categories = await templateLibraryApi.getCategories();
    console.log('✅ Categories:', categories);

    console.log('3. Testing get featured templates...');
    const featured = await templateLibraryApi.getFeaturedTemplates();
    console.log('✅ Featured templates:', featured);

    console.log('4. Testing get all templates...');
    const templates = await templateLibraryApi.getTemplates({ limit: 5 });
    console.log('✅ All templates:', templates);

    console.log('🎉 All API tests passed!');
    return true;
  } catch (error) {
    console.error('❌ API test failed:', error);
    return false;
  }
};
