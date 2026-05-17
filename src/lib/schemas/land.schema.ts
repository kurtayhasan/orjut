import { z } from 'zod';

export const landSchema = z.object({
  city: z.string().min(1, "Lütfen bir il seçiniz"),
  district: z.string().optional(),
  neighborhood: z.string().optional(),
  block_no: z.string().optional(),
  parcel_no: z.string().optional(),
  size_decare: z.number().min(0.01, "Alan 0'dan büyük olmalıdır").max(5000, "Bir arazi maksimum 5000 dekar olabilir"),
  crop_type: z.string().min(1, "Lütfen bir ürün tipi seçiniz"),
  environment_type: z.enum(['acik_tarla', 'sera']),
  is_irrigated: z.boolean(),
  planting_date: z.string().min(1, "Lütfen ekim tarihini giriniz"),
  soil_type: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  boundaries: z.any().optional(),
});

export type LandFormData = z.infer<typeof landSchema>;
