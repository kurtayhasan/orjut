export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  password?: string;
}

export interface Season {
  id: string;
  name: string;
  year: number;
  is_active: boolean;
  status: 'active' | 'completed';
}

export interface Land {
  id: string;
  org_id: string;
  city: string;
  district: string;
  block_no?: string;
  parcel_no?: string;
  size_decare: number; // Hectares -> Decare (Dönüm)
  crop_type: string;
  lat: number;
  lng: number;
  planting_date: string;
  expected_yield_per_decare?: number;
  expected_sell_price_unit?: number;
  status: 'active' | 'completed';
}

export interface Transaction {
  id: string;
  org_id: string;
  amount: number;
  description: string;
  date: string;
  type: 'expense' | 'income';
  category: string;
  land_id: string;
  lands?: { block_no: string; parcel_no: string };
}

export interface CategoryTotals {
  [category: string]: {
    total: number;
    count: number;
  } | any;
  grandTotal?: number;
}

