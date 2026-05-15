import { z } from 'zod';

export const operationSchema = z.object({
  land_id: z.string().uuid("Geçersiz arazi kimliği"),
  type: z.enum(['su', 'gubre', 'ilac', 'harvest', 'planting', 'fertilizer', 'pesticide']),
  date: z.string().min(1, "Lütfen bir tarih seçiniz"),
  amount: z.number().min(0.01, "Miktar 0'dan büyük olmalıdır"),
  unit: z.enum(['lt', 'm3', 'saat', 'mm', 'kg', 'paket', 'cuval', 'adet']).or(z.string().min(1, "Lütfen bir birim seçiniz")),
  method: z.string().min(1, "Lütfen bir uygulama yöntemi seçiniz"),
  notes: z.string().optional(),
  inventory_id: z.string().uuid().optional().nullable(),
});

export type OperationFormData = z.infer<typeof operationSchema>;
