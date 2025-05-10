import axios from 'axios';

/* configuration */
const SUBSCRIPTION_KEY  = '1d037767eef5447cb2a7557463c55d41';
const BASE_URL          = 'https://api-public.smartmoving.com/v1/api';
const DEFAULT_TARIFF_ID = 'd5e1d04b-fbc6-4af4-8c7a-af390151fdbf';   

const smartMovingApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-api-key': SUBSCRIPTION_KEY,
    'Content-Type': 'application/json'
  }
});

/*  shared types */
interface PageViewModel<T> { pageResults: T[] }

interface LeadViewModel {
  id: string;
  customerName?: string;
  emailAddress?: string;
  phoneNumber?: string;
  phoneType?: number;
  referralSource: string;
  referralSourceName?: string;
  moveSizeId?: string;
  salesPersonId?: string;
  type?: number;
  branchId: string;
  branchName: string;
  originAddressFull?: string;
  destinationAddressFull?: string;
  originStreet?: string; originCity?: string; originState?: string; originZip?: string;
  destinationStreet?: string; destinationCity?: string; destinationState?: string; destinationZip?: string;
  customerId?: string;                 // present only after customer created
}

export interface SmartMovingLead {
  id: string;
  customerName?: string;
  emailAddress?: string;
  phoneNumber?: string;
  phoneType?: number;

  branchId: string;
  branchName: string;

  referralSourceId: string;
  referralSourceName?: string;

  originAddressFull?: string;
  destinationAddressFull?: string;

  originStreet?: string; originCity?: string; originState?: string; originZip?: string;
  destinationStreet?: string; destinationCity?: string; destinationState?: string; destinationZip?: string;

  moveSizeId?: string;
  salesPersonId?: string;
  type?: number;

  customerId?: string;                 // populated later
  tariffId?: string;                   // constant
}

/* response models  */
export interface CreateOpportunityResponse { opportunityId?: string }
export interface AddNoteResponse          { noteId?: string }

/* helpers */
const REFERRAL_SOURCES: Record<string, string> = {
  'Anthony Referral Source' : 'b07edcb6-a81a-4149-8135-afa9016c4988',
  'Bing'                    : '5b135242-3ddc-4397-a16b-afbf015f0a2d',
  'Email/Texting Number'    : 'eeead3cd-7a11-4573-a0c1-af6d01013e45',
  'Facebook'                : '5e914b9d-482f-4124-9477-af390151fb5e',
  'Go Gilbert'              : '22647910-4a43-42e8-803c-b1340132f037',
  'Google'                  : '8be56ab1-46c1-4b55-9a2f-afbf015eff26',
  'Google Ads'              : 'f9ecbc26-140c-42cc-a516-af6d0100772f',
  'Google Guarantee'        : '9d8d69d2-56fd-43e0-b132-af6d0100dd5f',
  'Google My Business'      : '3133f333-f2eb-4aba-8ba5-af6d010051f4',
  'Life Storage'            : '6971b02e-a042-48e1-832c-af3f01493560',
  'MailChimp'               : 'e228e626-625b-4b03-a934-af7801227ec2',
  'Nick Robertson Security Title' : '29045d67-ef93-4ff6-b30b-b12b011ecbec',
  'Postcard'                : '5c0e9144-4522-4189-8fae-af3f01490a83',
  'Potential Employee'      : 'cd91169f-67dd-4ccd-9678-af550111518a',
  'Reddit'                  : '517002db-6bca-4944-9de6-b1020121be6a',
  'Repeat'                  : '6147e53f-e304-453e-99e2-af4d0154dc7b',
  'Truck'                   : '0bd0e0bf-9f19-4f16-8c4f-af3f0148f57f',
  'Yelp'                    : '5997514b-8d2c-493c-87f7-af39015b444e'
};

const DEFAULT_REFERRAL_SOURCE_ID = '8be56ab1-46c1-4b55-9a2f-afbf015eff26';

const isValidGuid = (v = '') =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

const buildNotes = (total: number) =>
  `PointDex calculator total: $${total.toFixed(2)}`;

/*  smartMovingService */

export const smartMovingService = {
  
  /* 1) Lead list  */

  async getLeads(page = 1, pageSize = 25): Promise<SmartMovingLead[]> {
    const { data } = await smartMovingApi.get<PageViewModel<LeadViewModel>>(
      '/leads',
      { params: { Page: page, PageSize: pageSize } }
    );

    return data.pageResults.map(raw => ({
      id               : raw.id,
      customerName     : raw.customerName,
      emailAddress     : raw.emailAddress,
      phoneNumber      : raw.phoneNumber,
      phoneType        : raw.phoneType,
      branchId         : raw.branchId,
      branchName       : raw.branchName,
      referralSourceId : raw.referralSource,
      referralSourceName : raw.referralSourceName,
      originAddressFull   : raw.originAddressFull,
      destinationAddressFull : raw.destinationAddressFull,
      originStreet     : raw.originStreet,   originCity : raw.originCity,
      originState      : raw.originState,    originZip  : raw.originZip,
      destinationStreet : raw.destinationStreet, destinationCity : raw.destinationCity,
      destinationState  : raw.destinationState,  destinationZip  : raw.destinationZip,
      moveSizeId       : raw.moveSizeId,
      salesPersonId    : raw.salesPersonId,
      type             : raw.type,
      customerId       : raw.customerId,      
      tariffId         : DEFAULT_TARIFF_ID
    }));
  },

  /* 2)  Fetch missing details for a single lead */
  async fetchLeadDetail(id: string): Promise<Partial<SmartMovingLead>> {
    try {
      const { data } = await smartMovingApi.get<LeadViewModel>(`/leads/${id}`);
      return {
        customerId    : data.customerId,
        moveSizeId    : data.moveSizeId,
        salesPersonId : data.salesPersonId,
        type          : data.type,
        emailAddress  : data.emailAddress,
        phoneNumber   : data.phoneNumber,
        phoneType     : data.phoneType
      };
    } catch (err) {
      console.warn(`Could not fetch details for lead ${id}`, err);
      return {};
    }
  },

  /* 3)  Create a customer  */
  async createCustomer(lead: SmartMovingLead): Promise<string> {
    const body = {
      name        : lead.customerName ?? 'PointDex Customer',
      phoneNumber : lead.phoneNumber ?? undefined,
      phoneType   : lead.phoneType ?? 0,
      emailAddress: lead.emailAddress ?? undefined,
      address     : lead.originAddressFull ?? undefined
    };

    const { data: customerId } = await smartMovingApi.post<string>(
      '/premium/customers',
      body
    );

    if (!isValidGuid(customerId))
      throw new Error('SmartMoving did not return a customerId');

    return customerId;
  },

  /* 4)  Convert ➜ add note */
  async convertLeadAndAddNote(
    lead: SmartMovingLead,
    total: number
  ): Promise<{ opportunityId: string; noteId: string }> {

    /* ensure we have everything */
    let enriched: SmartMovingLead = lead;

    if (!lead.customerId || !lead.moveSizeId || !lead.salesPersonId) {
      const extra = await this.fetchLeadDetail(lead.id);
      enriched = { ...lead, ...extra };
    }

    /* if still no customer → create one */
    if (!enriched.customerId) {
      enriched.customerId = await this.createCustomer(enriched);
    }

    /* sanity‑check mandatory fields */
    if (!enriched.moveSizeId)
      throw new Error('Lead is missing moveSizeId – cannot convert.');
    if (!enriched.salesPersonId)
      throw new Error('Lead is missing salesPersonId – cannot convert.');

    /* build convert payload */
    const convertBody = {
      customerId      : enriched.customerId,
      referralSourceId: isValidGuid(enriched.referralSourceId)
        ? enriched.referralSourceId
        : (REFERRAL_SOURCES[enriched.referralSourceName ?? ''] ??
           DEFAULT_REFERRAL_SOURCE_ID),
      tariffId        : DEFAULT_TARIFF_ID,
      branchId        : enriched.branchId,
      moveDate        : new Date().toISOString().slice(0, 10), // yyyy‑MM‑dd
      moveSizeId      : enriched.moveSizeId,
      salesPersonId   : enriched.salesPersonId,
      serviceTypeId   : enriched.type ?? 1                      // 1 = Moving
    };

    /* step A: convert lead */
    const { data: conv } =
      await smartMovingApi.put<CreateOpportunityResponse>(
        `/premium/lead/${enriched.id}/convert`,
        convertBody
      );

    if (!conv.opportunityId)
      throw new Error('SmartMoving did not return an opportunityId');

    /* step B: add calculator note */
    const { data: note } =
      await smartMovingApi.post<AddNoteResponse>(
        `/premium/opportunities/${conv.opportunityId}/communication/notes`,
        { notes: buildNotes(total) }
      );

    if (!note.noteId)
      throw new Error('SmartMoving did not return a noteId');

    return { opportunityId: conv.opportunityId, noteId: note.noteId };
  }
};
