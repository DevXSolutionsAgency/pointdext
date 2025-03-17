'use client';

import { useState, useEffect } from 'react';
import MovingCalculator from './MovingCalculator';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  pickupAddress: string;
  deliveryAddress: string;
  estimate?: number;
  status: string;
}

interface LeadCalculatorProps {
  lead: Lead;
  onClose: () => void;
}

export default function LeadCalculator({ lead, onClose }: LeadCalculatorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleApprove = async (costBreakdown: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/update-smartmoving-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          estimate: costBreakdown.totalCost,
          costBreakdown
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update estimate');
      }

      setSuccess(true);
      // Close the calculator after successful update
      setTimeout(onClose, 2000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Calculate Estimate for {lead.name}</h2>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4">
              <AlertDescription>Estimate successfully updated in SmartMoving!</AlertDescription>
            </Alert>
          )}

          <MovingCalculator
            initialAddresses={{
              warehouse: '', // You might want to get this from your settings
              pickup: lead.pickupAddress,
              delivery: lead.deliveryAddress,
              returnWarehouse: '',
              nearestAirport: '',
            }}
            onCalculate={(costBreakdown) => {
              if (confirm(`Would you like to approve and update the estimate of $${costBreakdown.totalCost.toFixed(2)} in SmartMoving?`)) {
                handleApprove(costBreakdown);
              }
            }}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
} 