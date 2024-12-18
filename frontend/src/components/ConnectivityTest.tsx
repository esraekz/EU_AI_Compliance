import { useState } from 'react';

const API_BASE_URL = 'http://localhost:8000';

const ConnectivityTest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const testConnection = async (endpoint: 'health-check' | 'test-error') => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      console.log('🚀 Request:', {
        method: 'GET',
        url: `${API_BASE_URL}/api/${endpoint}`,
      });

      const res = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      console.log('✅ Response:', {
        status: res.status,
        data: data,
      });

      if (!res.ok) {
        throw new Error(data.detail || 'An error occurred');
      }

      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold mb-4">Backend Connectivity Test</h2>

      <div className="space-x-4">
        <button
          onClick={() => testConnection('health-check')}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Success
        </button>

        <button
          onClick={() => testConnection('test-error')}
          disabled={loading}
          className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Error
        </button>
      </div>

      {loading && (
        <div className="text-gray-600">Loading...</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {response && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {response}
        </pre>
      )}
    </div>
  );
};

export default ConnectivityTest;
