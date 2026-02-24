export interface LocationCity {
  id: number;
  name: string;
  is_code: string;
}

export interface LocationProvince {
  id: number;
  name: string;
  is_code: string;
  cities: LocationCity[];
}

export interface LocationCountry {
  id: number;
  name: string;
  is_code: string;
  provinces: LocationProvince[];
}

export interface LocationsCompleteResponse {
  success: boolean;
  data: LocationCountry[];
  count: number;
  timestamp: string;
}
