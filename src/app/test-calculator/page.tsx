'use client';

import { useState } from 'react';
import LeadCalculator from '@/components/LeadCalculator';

// Test lead data
const testLead = {
  id: 'test-lead-1',
  name: 'John Doe',
  pickupAddress: '123 Main St, New York, NY 10001',
  deliveryAddress: '456 Oak Ave, Los Angeles, CA 90001',
  estimate: 0,
  status: 'New'
};

export default function TestCalculatorPage() {
  const [showCalculator, setShowCalculator] = useState(false);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Calculator Test Page</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="text-xl font-semibold mb-2">Test Lead Details</h2>
        <div className="space-y-2">
          <p><strong>Name:</strong> {testLead.name}</p>
          <p><strong>Pickup:</strong> {testLead.pickupAddress}</p>
          <p><strong>Delivery:</strong> {testLead.deliveryAddress}</p>
          <p><strong>Status:</strong> {testLead.status}</p>
        </div>
      </div>

      <button
        onClick={() => setShowCalculator(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Open Calculator
      </button>

      {showCalculator && (
        <LeadCalculator
          lead={testLead}
          onClose={() => setShowCalculator(false)}
        />
      )}
    </div>
  );
} 