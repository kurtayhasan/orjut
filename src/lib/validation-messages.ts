// src/lib/validation-messages.ts
export const VM = {
  required:    (field: string) => `${field} alanı zorunludur`,
  minLength:   (n: number)     => `En az ${n} karakter girilmelidir`,
  maxLength:   (n: number)     => `En fazla ${n} karakter girilebilir`,
  min:         (n: number)     => `${n}'den küçük olamaz`,
  max:         (n: number)     => `${n}'den büyük olamaz`,
  email:                         'Geçerli bir e-posta adresi giriniz',
  phone:                         'Geçerli bir telefon numarası giriniz',
  positiveNum:                   '0\'dan büyük bir sayı giriniz',
  passwordMatch:                 'Şifreler eşleşmiyor',
  captchaWrong:                  'Güvenlik kodu yanlış, lütfen tekrar deneyin',
  serverError:                   'Bir hata oluştu, lütfen tekrar deneyin',
  networkError:                  'İnternet bağlantınızı kontrol edin',
  loginFailed:                   'Telefon numarası veya şifre hatalı',
  phoneTaken:                    'Bu telefon numarası zaten kayıtlı',
};
