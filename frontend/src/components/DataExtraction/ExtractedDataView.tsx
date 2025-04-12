// zoku/frontend/components/DataExtraction/ExtractedDataView.tsx
import React, { useState } from 'react';
import { ExtractionField } from '../../types/invoice';
import ConfidenceIndicator from '../DataExtraction/ConfidenceIndicator';

interface ExtractedDataViewProps {
  fields: ExtractionField[];
  isEditing: boolean;
  onUpdateField: (id: string, property: keyof ExtractionField, value: string | number) => void;
  onAddField: (fieldName: string) => void;
}

const ExtractedDataView: React.FC<ExtractedDataViewProps> = ({
  fields,
  isEditing,
  onUpdateField,
  onAddField
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
      {/* Extracted Data View */}
      <ul className="space-y-3">
        {fields.map((field) => (
          <li key={field.id} className="border rounded p-3">
            <div className="flex justify-between items-start">
              <div className="w-3/4">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {field.name}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="w-full p-1 border rounded text-sm"
                    value={field.value}
                    onChange={(e) =>
                      onUpdateField(field.id, 'value', e.target.value)
                    }
                  />
                ) : (
                  <p className="text-sm font-medium">{field.value || "—"}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">Confidence</div>
                <ConfidenceIndicator confidence={field.confidence} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {isEditing && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Add Custom Field</h3>
          <div className="flex">
            <input
              type="text"
              placeholder="Field name"
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
        </div>
      )}
    </div>
  );
};

export default ExtractedDataView;
