import axios from 'axios';

const API_KEY = '1d037767eef5447cb2a7557463c55d41';
const PROVIDER_KEY = 'e62a4ec8-6b97-41c3-a4cf-af39015b0c3c';
const BASE_URL = 'https://api.smartmoving.com/api/leads/from-provider/v2';

const smartMovingApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  params: {
    providerKey: PROVIDER_KEY
  }
});

interface SmartMovingApiResponse {
  id: string;
  [key: string]: any;
}

export interface SmartMovingLead {
  id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phoneNumber?: string;
  extension?: string;
  userOptIn?: boolean;
  email?: string;
  moveDate?: string;
  leadCost?: number;
  originStreet?: string;
  originCity?: string;
  originState?: string;
  originZip?: string;
  destinationStreet?: string;
  destinationCity?: string;
  destinationState?: string;
  destinationZip?: string;
  bedrooms?: string;
  moveSize?: string;
  notes?: string;
  referralSource?: string;
  branchId?: string;
  serviceType?: 'Moving' | 'Packing' | 'MovingAndPacking' | 'LoadOnly' | 'UnloadOnly' | 'Commercial' | 'StorageInBound' | 'StorageOutBound' | 'InnerHouse' | 'JunkRemoval' | 'LaborOnly';
  // For our UI tracking
  status?: string;
  moveType?: string;
  customerName?: string;
  branch?: string;
  opportunityType?: string;
  pickupAddress?: string;
  leadSource?: string;
  createdAt?: string;
  quoteAmount?: number;
}

export const smartMovingService = {
  async getLeads(): Promise<SmartMovingLead[]> {
    try {
      // Note: The API doesn't seem to have a GET endpoint in the docs
      // We'll store leads locally for now
      return [];
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  },

  async createLead(leadData: Partial<SmartMovingLead>): Promise<SmartMovingLead> {
    try {
      // Format the data according to SmartMoving's requirements
      const formattedData = {
        firstName: leadData.firstName || leadData.customerName?.split(' ')[0] || 'New',
        lastName: leadData.lastName || leadData.customerName?.split(' ')[1] || 'Customer',
        phoneNumber: leadData.phoneNumber || '',
        email: leadData.email || '',
        moveDate: leadData.moveDate ? new Date(leadData.moveDate).toLocaleDateString('en-US') : new Date().toLocaleDateString('en-US'),
        leadCost: leadData.quoteAmount || 0,
        originStreet: leadData.originStreet || leadData.pickupAddress?.split(',')[0] || '',
        originCity: leadData.originCity || leadData.branch || '',
        originState: leadData.originState || '',
        originZip: leadData.originZip || '',
        destinationStreet: leadData.destinationStreet || '',
        destinationCity: leadData.destinationCity || '',
        destinationState: leadData.destinationState || '',
        destinationZip: leadData.destinationZip || '',
        moveSize: leadData.moveSize || '',
        notes: `${leadData.notes || ''}\nQuote Amount: $${leadData.quoteAmount || 0}`,
        referralSource: leadData.referralSource || 'Quote Calculator',
        serviceType: leadData.serviceType || 'Moving'
      };

      const response = await smartMovingApi.post<SmartMovingApiResponse>('', formattedData);
      
      // Store the lead locally since we don't have a GET endpoint
      const createdLead: SmartMovingLead = {
        ...leadData,
        id: response.data.id,
        firstName: formattedData.firstName,
        lastName: formattedData.lastName,
        createdAt: new Date().toISOString()
      };

      return createdLead;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  },

  async updateLead(id: string, leadData: Partial<SmartMovingLead>): Promise<SmartMovingLead> {
    try {
      // The API doesn't seem to have an update endpoint in the docs
      // We'll just return the updated data
      const updatedLead: SmartMovingLead = {
        ...leadData,
        id,
        createdAt: new Date().toISOString()
      };
      return updatedLead;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  },

  async deleteLead(id: string): Promise<void> {
    try {
      // The API doesn't seem to have a delete endpoint in the docs
      // We'll just handle this client-side
      return;
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }
}; 