// zoku/frontend/types/invoice.ts
export interface Invoice {
    id: string;
    filename: string;
    fileUrl: string;
    fileType: 'pdf' | 'image';
    uploadDate: string;
    supplier: string | null;
    status: 'Pending' | 'Processed' | 'Failed';
    extractedData?: ExtractionField[]; // ✅ Add this line
    userId: string;
  }

  export interface InvoiceListParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    search?: string;
  }

  export interface ExtractionField {
    id: string;
    name: string;
    value: string;
    confidence: number;
  }

  export interface ExtractionResult {
    invoiceId: string;
    fields: ExtractionField[];
    timestamp: string;
  }

  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
  }
