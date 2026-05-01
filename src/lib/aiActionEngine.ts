import { WeatherData } from './weatherService';

export interface LandContext {
  cropName: string;         // "Pamuk", "Mısır", "Buğday"
  sowingDate: string;       // "2025-04-15"
  currentDay: number;       // ekim tarihinden bu yana gün sayısı
  totalArea: number;        // dönüm
}

export interface AIActionPrompt {
  weather: WeatherData;
  lands: LandContext[];     // sadece aktif araziler
  date: string;             // bugünün tarihi
}

export function buildAIPrompt(data: AIActionPrompt): string {
  const landsText = data.lands.length > 0 
    ? data.lands.map(l => `- ${l.totalArea} dönüm ${l.cropName}: Ekimin üzerinden ${l.currentDay} gün geçmiş.`).join('\n')
    : "Kayıtlı aktif arazi bulunmamaktadır.";

  return `Sen kıdemli bir ziraat danışmanısın. Kullanıcının şu anki arazi durumu:
${landsText}

ANLIK HAVA DURUMU:
- Sıcaklık: ${data.weather.temperature}°C
- Rüzgar Hızı: ${data.weather.windSpeed}km/h
- Nem: ${data.weather.humidity}%

GÖREVİN:
Hava durumu ve bitki yaşam döngüsüne (gün sayısı) göre finansal kayıpları önleyecek, SADECE bugün yapılması gereken 1-3 somut ve spesifik işi söyle.

KURALLAR:
- Her madde maksimum 1 cümle olsun.
- "Sulama önemlidir" gibi genel değil, teknik konuş.
- Yanıtı Türkçe ver.

FORMAT:
⚠️ [Varsa kritik uyarı]
✅ [Aksiyon 1]
✅ [Aksiyon 2]`;
}
