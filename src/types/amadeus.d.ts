declare module 'amadeus' {
  interface AmadeusConfig {
    clientId: string;
    clientSecret: string;
  }

  interface AmadeusClient {
    shopping: {
      flightOffersSearch: {
        get(params: {
          originLocationCode: string;
          destinationLocationCode: string;
          departureDate: string;
          adults: string;
        }): Promise<{
          data: Array<{
            price: {
              total: string;
            };
          }>;
        }>;
      };
    };
    referenceData: {
      locations: {
        get(params: {
          subType: string;
          latitude: number;
          longitude: number;
          radius: number;
          sort: string;
        }): Promise<{
          data: Array<{
            address: {
              cityCode: string;
            };
          }>;
        }>;
      };
    };
  }

  export default class Amadeus {
    constructor(config: AmadeusConfig);
    shopping: AmadeusClient['shopping'];
    referenceData: AmadeusClient['referenceData'];
  }
} 