// zoku/frontend/components/DataExtraction/ExtractionPanel.tsx
import React, { useState } from 'react';
import { FileText, Edit, Download, X, Save } from 'lucide-react';
import FieldConfiguration from '../DataExtraction/FieldConfiguration';
import ExtractedDataView from '../DataExtraction/ExtractedDataView';
import { ExtractionField } from '../../types/invoice';
import { v4 as uuidv4 } from 'uuid';

// Default extraction fields
const DEFAULT_FIELDS = [
  { id: uuidv4(), name: 'Supplier', value: '', confidence: 0 },
  { id: uuidv4(), name: 'PO Number', value: '', confidence: 0 },
  { id: uuidv4(), name: 'Amount', value: '', confidence: 0 },
  { id: uuidv4(), name: 'Date', value: '', confidence: 0 },
  { id: uuidv4(), name: 'Invoice Number', value: '', confidence: 0 },
];

interface ExtractionPanelProps {
  invoiceId: string;
  showExtractedData: boolean;
  extractedFields: ExtractionField[];
  isExtracting: boolean;
  onExtract: (fields: { id: string; name: string }[]) => Promise<ExtractionField[]>;
  onExport: (format: 'json' | 'xml') => Promise<void>;
}

const ExtractionPanel: React.FC<ExtractionPanelProps> = ({
  invoiceId: _invoiceId, // 👈 suppress unused warning
  showExtractedData,
  extractedFields,
  isExtracting,
  onExtract,
  onExport
}) => {
  const [editingFields, setEditingFields] = useState<boolean>(false);
  const [customFields, setCustomFields] = useState(DEFAULT_FIELDS);
  const [showExportOptions, setShowExportOptions] = useState<boolean>(false);
  const [localExtractedFields, setLocalExtractedFields] = useState<ExtractionField[]>(extractedFields);

  // Handle extract data
  const handleExtract = async () => {
    try {
      const result = await onExtract(customFields.map(field => ({ id: field.id, name: field.name })));
      setLocalExtractedFields(result);
    } catch (error) {
      console.error('Extraction failed:', error);
      console.log('Extracting fields for invoice:', _invoiceId);
      // Handle error (show notification, etc.)
    }
  };

  // Handle export
  const handleExport = async (format: 'json' | 'xml') => {
    try {
      await onExport(format);
      setShowExportOptions(false);
    } catch (error) {
      console.error(`Error exporting as ${format}:`, error);
      // Handle error (show notification, etc.)
    }
  };

  // Add new field to customFields
  const handleAddField = (fieldName: string) => {
    if (fieldName.trim()) {
      setCustomFields([
        ...customFields,
        { id: uuidv4(), name: fieldName, value: '', confidence: 0 }
      ]);
    }
  };

  // Remove field
  const handleRemoveField = (id: string) => {
    setCustomFields(customFields.filter(field => field.id !== id));
  };

  // Update field
  const handleUpdateField = (id: string, property: keyof ExtractionField, value: string | number) => {
    setLocalExtractedFields(
      localExtractedFields.map(field =>
        field.id === id ? { ...field, [property]: value } : field
      )
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {showExtractedData ? "Extracted Data" : "Data Extraction"}
        </h2>
        <div>
          {!showExtractedData && (
            <button
              className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded text-sm"
              onClick={handleExtract}
              disabled={isExtracting}
            >
              {isExtracting ? (
                <>Extracting...</>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-1" />
                  Extract Data
                </>
              )}
            </button>
          )}
          {showExtractedData && !editingFields && (
            <div className="flex space-x-2">
              <button
                className="flex items-center px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm"
                onClick={() => setEditingFields(true)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit Fields
              </button>
              <button
                className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded text-sm"
                onClick={() => setShowExportOptions(!showExportOptions)}
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
              {showExportOptions && (
                <div className="absolute mt-8 right-4 bg-white shadow-lg rounded border p-2 z-10">
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => handleExport('json')}
                  >
                    Export as JSON
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => handleExport('xml')}
                  >
                    Export as XML
                  </button>
                </div>
              )}
            </div>
          )}
          {showExtractedData && editingFields && (
            <div className="flex space-x-2">
              <button
                className="flex items-center px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm"
                onClick={() => setEditingFields(false)}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </button>
              <button
                className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded text-sm"
                onClick={() => setEditingFields(false)}
              >
                <Save className="w-4 h-4 mr-1" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        {!showExtractedData ? (
          <FieldConfiguration
            fields={customFields}
            onAddField={handleAddField}
            onRemoveField={handleRemoveField}
          />
        ) : (
          <ExtractedDataView
            fields={localExtractedFields}
            isEditing={editingFields}
            onUpdateField={handleUpdateField}
            onAddField={handleAddField}
          />
        )}
      </div>
    </div>
  );
};

export default ExtractionPanel;
