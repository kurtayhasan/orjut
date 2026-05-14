import { z } from 'zod';
import { VM } from '@/lib/validation-messages';

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
