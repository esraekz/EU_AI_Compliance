// zoku/frontend/components/DataExtraction/FieldConfiguration.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ExtractionField } from '../../types/invoice';

interface FieldConfigurationProps {
  fields: ExtractionField[];
  onAddField: (fieldName: string) => void;
  onRemoveField: (id: string) => void;
}

const FieldConfiguration: React.FC<FieldConfigurationProps> = ({
  fields,
  onAddField,
  onRemoveField
}) => {
  const [newFieldName, setNewFieldName] = useState<string>('');

  const handleAddField = () => {
    if (newFieldName.trim()) {
      onAddField(newFieldName);
      setNewFieldName('');
    }
  };

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Configure the fields to extract from this invoice:
      </p>

      {/* Field Configuration */}
      <ul className="space-y-2">
        {fields.map((field) => (
          <li
            key={field.id}
            className="flex justify-between items-center p-2 bg-gray-50 rounded"
          >
            <span>{field.name}</span>
            <button
              onClick={() => onRemoveField(field.id)}
              className="text-red-500 hover:text-red-700"
              aria-label={`Remove ${field.name} field`}
            >
              <X className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>

      {/* Add New Field */}
      <div className="mt-4 flex">
        <input
          type="text"
          placeholder="New field name"
          className="flex-grow border rounded-l px-3 py-2 text-sm"
          value={newFieldName}
          onChange={(e) => setNewFieldName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddField()}
        />
        <button
          className="bg-blue-600 text-white px-3 py-2 rounded-r text-sm"
          onClick={handleAddField}
        >
          Add
        </button>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        {`Click "Extract Data" to process the invoice.`}
      </p>

    </div>
  );
};

export default FieldConfiguration;
