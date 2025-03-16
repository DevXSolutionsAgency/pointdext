import axios from 'axios';

/* 1) CONFIG */
const SUBSCRIPTION_KEY = '1d037767eef5447cb2a7557463c55d41'; 
const BASE_URL = 'https://api-public.smartmoving.com/v1/api';

/* 2) AXIOS CLIENT */
const smartMovingApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': SUBSCRIPTION_KEY,
  },
});

/* 3) INTERFACES */
interface PageViewModel<T> {
  pageNumber: number;
  pageSize: number;
  lastPage: boolean;
  totalPages: number;
  totalResults: number;
  totalThisPage: number;
  pageResults: T[];
}

interface LeadViewModel {
  id: string;
  customerName?: string;
  emailAddress?: string;
  phoneNumber?: string;
  createdAtUtc?: string;
  status?: number;
  branchName?: string;
  originStreet?: string;
  originCity?: string;
  originState?: string;
  originZip?: string;
  destinationStreet?: string;
  destinationCity?: string;
  destinationState?: string;
  destinationZip?: string;
  referralSource?: string;
  moveSizeName?: string;
}

/* 4) SHAPE FOR YOUR UI */
export interface SmartMovingLead {
  id: string;
  customerName?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  status?: string;
  branch?: string;
  originStreet?: string;
  originCity?: string;
  originState?: string;
  originZip?: string;
  destinationStreet?: string;
  destinationCity?: string;
  destinationState?: string;
  destinationZip?: string;
  leadSource?: string;
  moveSize?: string;
}

/* 5) SERVICE */
export const smartMovingService = {
  async getLeads(page = 1, pageSize = 25): Promise<SmartMovingLead[]> {
    try {
      const response = await smartMovingApi.get<PageViewModel<LeadViewModel>>('/leads', {
        params: { Page: page, PageSize: pageSize },
      });

      return response.data.pageResults.map((raw) => ({
        id: raw.id,
        customerName: raw.customerName,
        email: raw.emailAddress,
        phone: raw.phoneNumber,
        createdAt: raw.createdAtUtc,
        status: mapOpportunityStatus(raw.status),
        branch: raw.branchName,
        originStreet: raw.originStreet,
        originCity: raw.originCity,
        originState: raw.originState,
        originZip: raw.originZip,
        destinationStreet: raw.destinationStreet,
        destinationCity: raw.destinationCity,
        destinationState: raw.destinationState,
        destinationZip: raw.destinationZip,
        leadSource: raw.referralSource,
        moveSize: raw.moveSizeName,
      }));
    } catch (error) {
      console.error('Error fetching leads from SmartMoving:', error);
      throw error;
    }
  },
};

function mapOpportunityStatus(code?: number): string {
  switch (code) {
    case 0: return 'NewLead';
    case 1: return 'LeadInProgress';
    case 3: return 'Opportunity';
    case 4: return 'Booked';
    case 10: return 'Completed';
    case 11: return 'Closed';
    case 20: return 'Cancelled';
    case 30: return 'Lost';
    case 50: return 'BadLead';
    default: return 'Unknown';
  }
}
