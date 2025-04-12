// zoku/frontend/components/DataExtraction/ConfidenceIndicator.tsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfidenceIndicatorProps {
  confidence: number;
}

const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({ confidence }) => {
  // Determine color and indicator based on confidence level
  const getConfidenceClass = (conf: number): string => {
    if (conf > 0.9) {
      return 'bg-green-100 text-green-800';
    } else if (conf > 0.75) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  };

  const needsWarning = confidence < 0.8;
  const confidencePercentage = Math.round(confidence * 100);
  const confidenceClass = getConfidenceClass(confidence);

  return (
    <div className={`text-sm font-medium rounded px-2 py-1 inline-block ${confidenceClass}`}>
      {confidencePercentage}%
      {needsWarning && (
        <AlertCircle className="inline w-3 h-3 ml-1" />
      )}
    </div>
  );
};

export default ConfidenceIndicator;
