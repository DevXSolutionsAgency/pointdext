'use client';

import { useState } from 'react';
import axios from 'axios';

interface CalculationResult {
  distance: number;
  duration: number;
  planeTicketCost: number;
}

interface ApiResponse {
  success: boolean;
  data: CalculationResult;
}

export default function CalculatorPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<ApiResponse>('/api/calculate-distance', {
        origin,
        destination
      });

      setResult(response.data.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to calculate distance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Distance & Cost Calculator</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Origin Address</label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter origin address"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Destination Address</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter destination address"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Calculating...' : 'Calculate'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <div className="space-y-2">
            <p><strong>Distance:</strong> {result.distance.toFixed(2)} miles</p>
            <p><strong>Duration:</strong> {result.duration.toFixed(0)} minutes</p>
            <p><strong>Plane Ticket Cost:</strong> ${result.planeTicketCost.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
} 