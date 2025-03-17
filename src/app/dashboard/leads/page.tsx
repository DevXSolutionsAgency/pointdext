'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Lead {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  branchId: string;
  createdAt: string;
  // Add other relevant fields
}

interface Branch {
  id: string;
  name: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch leads from SmartMoving API
    const fetchLeads = async () => {
      try {
        console.log('Fetching leads...');
        const response = await axios.get<{ data: Lead[] }>('/api/leads');
        console.log('Leads response:', response.data);
        setLeads(response.data.data);
      } catch (error) {
        console.error('Error fetching leads:', error);
        setError('Failed to fetch leads');
      }
    };

    // Fetch branches from SmartMoving API
    const fetchBranches = async () => {
      try {
        console.log('Fetching branches...');
        const response = await axios.get<{ data: Branch[] }>('/api/branches');
        console.log('Branches response:', response.data);
        setBranches(response.data.data);
      } catch (error) {
        console.error('Error fetching branches:', error);
        setError('Failed to fetch branches');
      }
    };

    Promise.all([fetchLeads(), fetchBranches()])
      .finally(() => setLoading(false));
  }, []);

  const filteredLeads = selectedBranch === 'all'
    ? leads
    : leads.filter(lead => lead.branchId === selectedBranch);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Leads Management</h1>
      
      {/* Branch Filter */}
      <div className="mb-6">
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All Branches</option>
          {branches.map(branch => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      {/* Leads Table */}
      <div className="overflow-x-auto">
        {filteredLeads.length === 0 ? (
          <p className="text-gray-500">No leads found.</p>
        ) : (
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="p-3 border">Customer Name</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Phone</th>
                <th className="p-3 border">Branch</th>
                <th className="p-3 border">Created At</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => (
                <tr key={lead.id}>
                  <td className="p-3 border">{lead.customerName}</td>
                  <td className="p-3 border">{lead.email}</td>
                  <td className="p-3 border">{lead.phone}</td>
                  <td className="p-3 border">
                    {branches.find(b => b.id === lead.branchId)?.name || 'Unknown'}
                  </td>
                  <td className="p-3 border">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 border">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 