'use client';

import { SmartMovingLead } from '@/types/dashboard';

interface LeadsTableProps {
  leads: SmartMovingLead[];
  loadingLeads: boolean;
  error: string | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  leadsPerPage: number;
  setLeadsPerPage: (perPage: number) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onImportLead: (lead: SmartMovingLead) => void;
}

export function LeadsTable({
  leads,
  loadingLeads,
  error,
  currentPage,
  setCurrentPage,
  leadsPerPage,
  setLeadsPerPage,
  searchTerm,
  setSearchTerm,
  onImportLead,
}: LeadsTableProps) {
  // Filter leads based on search term
  const filteredLeads = leads.filter(lead => 
    lead.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (!searchTerm.trim())
  );

  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * leadsPerPage,
    currentPage * leadsPerPage
  );

  return (
    <div className="bg-white p-4 rounded-md shadow flex flex-col h-full">
      {/* header: title + search only */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-black">Leads</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by customer name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-400 rounded-lg text-sm text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {loadingLeads ? (
        <p className="text-black">Loading leads…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="shadow ring-1 ring-gray-200 md:rounded-lg">
            
            {/* table */}
            <table className="min-w-full table-fixed divide-y divide-gray-200 text-sm">
              <colgroup>
                <col className="w-40" />
                <col className="w-60" />
                <col className="w-60" />
                <col className="w-28" />
              </colgroup>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Origin</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Destination</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{lead.customerName ?? 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-700">{lead.originAddressFull ?? 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-700">{lead.destinationAddressFull ?? 'N/A'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onImportLead(lead)}
                        className="inline-flex items-center rounded-md bg-gradient-to-r from-gray-400 to-gray-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Import
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredLeads.length > 0 && paginatedLeads.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                      No leads on this page
                    </td>
                  </tr>
                )}

                {leads.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                      No leads found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* pagination + page-size selector */}
            <div className="flex items-center justify-between py-4">
              {/* Prev / Next */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 text-black rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm text-black">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 text-black rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              {/* Leads per page */}
              <label className="flex items-center space-x-2 text-sm text-black">
                <span>Leads per page:</span>
                <select
                  value={leadsPerPage}
                  onChange={e => {
                    setLeadsPerPage(+e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border rounded px-2 py-1 text-black"
                >
                  {[10, 25, 50, 100].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 