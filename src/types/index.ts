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
  start_date?: string;
  end_date?: string;
  is_active: boolean;
}

export interface Land {
  id: string;
  org_id: string;
  city: string;
  district: string;
  block_no?: string;
  parcel_no?: string;
  size_decare: number;
  size_sqm?: number;
  environment_type?: 'acik_tarla' | 'sera';
  crop_type: string;
  lat: number;
  lng: number;
  planting_date: string;
  expected_yield_per_decare?: number;
  expected_sell_price_unit?: number;
  boundaries?: any;
  soil_type?: string;
  is_irrigated?: boolean;
}

export interface FieldOperation {
  id: string;
  org_id: string;
  land_id: string;
  type: 'su' | 'gubre' | 'ilac';
  date: string;
  amount: number;
  unit: string;
  method: string;
  period_days?: number;
  notes?: string;
}

export interface ScoutingLog {
  id: string;
  org_id: string;
  land_id: string;
  date: string;
  growth_stage: 'cimlenme' | 'ciceklenme' | 'meyve_tutumu' | 'hasat';
  health_status: 'saglikli' | 'hastalik' | 'zararli';
  notes?: string;
}

export interface IrrigationLog {
  id: string;
  org_id: string;
  land_id: string;
  date: string;
  amount: number;
  unit: 'saat' | 'ton' | 'litre';
  method: string;
  notes?: string;
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

