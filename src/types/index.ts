import type { LucideIcon } from 'lucide-react';

// ─── Domain Models ────────────────────────────────────────────────────────────

export type PaymentStatus =
  | 'free'
  | 'pending_approval'
  | 'approved'
  | 'expired'
  | 'cancelled'
  | 'suspended'
  | 'refunded';

export interface Profile {
  id:             string;
  phone:          string;
  first_name:     string;
  last_name:      string;
  is_premium:     boolean;
  payment_status?: PaymentStatus;
  avatar_url?:    string;
  role?:          'farmer' | 'engineer' | 'admin';
  created_at?:    string;
  updated_at?:    string;
}

export interface Land {
  id:                        string;
  org_id:                    string;
  profile_id?:               string;
  name?:                     string;
  geometry?:                 any;
  city:                      string;
  district:                  string;
  neighborhood?:             string;
  block_no:                  string;
  parcel_no:                 string;
  size?:                     number;
  size_decare:               number;
  size_sqm?:                 number;  // Area in square meters, used for API guardrails
  crop_type:                 string;
  environment_type:          'acik_tarla' | 'sera';
  is_irrigated:              boolean;
  soil_type?:                string;
  lat:                       number;
  lng:                       number;
  boundaries?:               GeoJSON.GeoJsonObject;
  planting_date?:            string;
  expected_yield?:           number;
  expected_price?:           number;
  expected_yield_per_decare?:number;
  expected_sell_price_unit?: number;
  agromonitoring_polygon_id?: string;
  created_at?:               string;
  updated_at?:               string;
  /** Optimistic UI — offline queue, not sent to DB */
  isPending?:                boolean;
}

export interface Transaction {
  id:                      string;
  org_id:                  string;
  land_id:                 string;
  amount:                  number;
  description:             string;
  category:                string;
  date:                    string;
  type:                    'expense' | 'income';
  receipt_url?:            string;
  receipt_thumbnail_url?:  string;
  quantity?:               number;
  unit?:                   string;
  season_id?:              string;
  /** Join result — read-only, never sent to DB */
  lands?: { block_no: string; parcel_no: string; district?: string; city?: string };
  /** Optimistic UI flag */
  isPending?: boolean;
}

export interface InventoryItem {
  id:                  string;
  org_id:              string;
  item_name:           string;
  type:                'fertilizer' | 'seed' | 'pesticide' | 'fuel' | 'other';
  quantity:            number;
  unit:                string;
  unit_cost?:          number;
  last_purchase_date?: string;
}

export interface ScoutingLog {
  id:           string;
  org_id:       string;
  profile_id?:  string;
  land_id:      string;
  date:         string;
  notes:        string;
  health_score?:number; // Legacy or calculated
  health_status?: 'saglikli' | 'hastalik' | 'zararli'; // New UI field
  growth_stage?: 'cimlenme' | 'ciceklenme' | 'meyve_tutumu' | 'hasat'; // New UI field
  image_url?:   string;
  // Phase 3: Diagnosis & Prescription Loop
  prescription_action?: string;
  prescription_notes?:  string;
  prescription_text?:   string;
  is_prescription_applied?: boolean;
  /** Optimistic UI — offline queue, not sent to DB */
  isPending?:       boolean;
}

export interface FieldOperation {
  id:             string;
  org_id:         string;
  land_id:        string;
  date:           string;
  type:           'fertilizer' | 'pesticide' | 'harvest' | 'planting' | 'su' | 'gubre' | 'ilac'; // Extended types for UI compatibility
  method:         string;
  amount:         number;
  unit?:          string; // Added for UI compatibility
  notes?:         string; // Added for UI compatibility
  inventory_id?:  string;
  /** Optimistic UI — offline queue, not sent to DB */
  isPending?:     boolean;
}

export interface IrrigationLog {
  id:               string;
  org_id:           string;
  land_id:          string;
  date:             string;
  duration_minutes?:number; // Legacy
  water_amount_m3?: number; // Legacy
  amount:           number; // New UI field (can map to duration or m3)
  unit:             'lt' | 'm3' | 'saat' | 'mm'; // Strict union type for SaaS hardening
  method:           string; // New UI field
  notes?:           string; // New UI field
  /** Optimistic UI — offline queue, not sent to DB */
  isPending?:       boolean;
}

export interface Season {
  id:         string;
  org_id:     string;
  name:       string;
  year:       number;
  start_date: string;
  end_date:   string;
  is_active:  boolean;
}

export interface DailySummary {
  id:      string;
  user_id: string | null; // UUID or Null for shared insights
  date:    string;
  content: string;
  metadata?: any;
}

// ─── Aggregate / Computed Types ───────────────────────────────────────────────

export interface CategoryTotal {
  total: number;
  count: number;
  percentage?: number;
}
export interface CategoryTotals {
  mazot: CategoryTotal;
  gubre: CategoryTotal;
  ilac: CategoryTotal;
  isci: CategoryTotal;
  diger: CategoryTotal;
  grandTotal: number;
  [key: string]: CategoryTotal | number;
}

// ─── UI Component Props ───────────────────────────────────────────────────────

export interface ModalProps {
  isOpen:  boolean;
  onClose: () => void;
}

export interface BaseModalProps extends ModalProps {
  title?:           string;
  children:         React.ReactNode;
  className?:       string;
  showCloseButton?: boolean;
}

export interface ExpenseModalProps extends ModalProps {
  defaultCategory: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?:      'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  label?:     string;
  error?:     string;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
  as?:        'input' | 'select' | 'textarea';
}

export interface CardProps {
  children:   React.ReactNode;
  className?: string;
  padding?:   'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  onClick?:   () => void;
}

export interface EmptyStateProps {
  title:        string;
  description?: string;
  emoji?:       string;
  actionLabel?: string;
  onAction?:    () => void;
  icon?:        LucideIcon;
}
