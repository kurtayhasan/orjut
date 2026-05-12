import type { LucideIcon } from 'lucide-react';

// ─── Domain Models ────────────────────────────────────────────────────────────

export interface Profile {
  id:          string;
  phone:       string;
  first_name:  string;
  last_name:   string;
  is_premium:  boolean;
  avatar_url?: string;
}

export interface Land {
  id:                        string;
  org_id:                    string;
  city:                      string;
  district:                  string;
  block_no:                  string;
  parcel_no:                 string;
  size_decare:               number;
  crop_type:                 string;
  environment_type:          'acik_tarla' | 'sera';
  is_irrigated:              boolean;
  lat:                       number;
  lng:                       number;
  boundaries?:               GeoJSON.Geometry;
  planting_date?:            string;
  expected_yield_per_decare?:number;
  expected_sell_price_unit?: number;
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
  lands?: { block_no: string; parcel_no: string };
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
  land_id:      string;
  date:         string;
  notes:        string;
  health_score: number;
  image_url?:   string;
}

export interface FieldOperation {
  id:             string;
  org_id:         string;
  land_id:        string;
  date:           string;
  type:           'fertilizer' | 'pesticide' | 'harvest' | 'planting';
  method:         string;
  amount:         number;
  inventory_id?:  string;
}

export interface IrrigationLog {
  id:               string;
  org_id:           string;
  land_id:          string;
  date:             string;
  duration_minutes: number;
  water_amount_m3?: number;
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
  message:    string;
  buttonText?: string;
  onAction?:  () => void;
  icon?:      LucideIcon;
}
