'use client';

import { useState } from 'react';
import LeadCalculator from './LeadCalculator';

interface Lead {
  id: string;
  name: string;
  pickupAddress: string;
  deliveryAddress: string;
  estimate?: number;
  status: string;
}

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  return (
    <div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimate</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td className="px-6 py-4 whitespace-nowrap">{lead.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{lead.pickupAddress}</td>
              <td className="px-6 py-4 whitespace-nowrap">{lead.deliveryAddress}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {lead.estimate ? `$${lead.estimate.toFixed(2)}` : 'Not set'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{lead.status}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => setSelectedLead(lead)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Calculate Estimate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedLead && (
        <LeadCalculator
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
} 