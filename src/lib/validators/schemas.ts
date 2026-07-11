import { z } from 'zod';
import { VM } from '@/lib/validation-messages';

// ─── Auth ───────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  phone: z.string().min(10, VM.phone),
  password: z.string().min(6, VM.minLength(6)),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, VM.required('İsim')),
  lastName: z.string().min(2, VM.required('Soyisim')),
  phone: z.string().min(10, VM.phone),
  password: z.string().min(6, VM.minLength(6)),
  confirmPassword: z.string().min(6, VM.minLength(6)),
  captcha: z.string().length(4, VM.required('Güvenlik kodu')),
}).refine((data) => data.password === data.confirmPassword, {
  message: VM.passwordMatch,
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Land ───────────────────────────────────────────────────────────────────

export const landSchema = z.object({
  city: z.string().min(1, 'Lütfen bir il seçiniz'),
  district: z.string().optional(),
  neighborhood: z.string().optional(),
  block_no: z.string().optional(),
  parcel_no: z.string().optional(),
  size_decare: z
    .number()
    .min(0.01, "Alan 0'dan büyük olmalıdır")
    .max(5000, 'Bir arazi maksimum 5000 dekar olabilir'),
  crop_type: z.string().min(1, 'Lütfen bir ürün tipi seçiniz'),
  environment_type: z.enum(['acik_tarla', 'sera']),
  is_irrigated: z.boolean(),
  planting_date: z.string().min(1, 'Lütfen ekim tarihini giriniz'),
  soil_type: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  boundaries: z.any().optional(),
});

export type LandFormData = z.infer<typeof landSchema>;

// ─── Field operation ────────────────────────────────────────────────────────

export const operationSchema = z.object({
  land_id: z.string().uuid('Geçersiz arazi kimliği'),
  type: z.enum([
    'su',
    'gubre',
    'ilac',
    'harvest',
    'planting',
    'fertilizer',
    'pesticide',
  ]),
  date: z.string().min(1, 'Lütfen bir tarih seçiniz'),
  amount: z.number().min(0.01, "Miktar 0'dan büyük olmalıdır"),
  unit: z
    .enum(['lt', 'm3', 'saat', 'mm', 'kg', 'paket', 'cuval', 'adet'])
    .or(z.string().min(1, 'Lütfen bir birim seçiniz')),
  method: z.string().min(1, 'Lütfen bir uygulama yöntemi seçiniz'),
  notes: z.string().optional(),
  inventory_id: z.string().uuid().optional().nullable(),
});

export type OperationFormData = z.infer<typeof operationSchema>;
