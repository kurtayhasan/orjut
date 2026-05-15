import { WeatherData } from './weatherService';

export interface LandContext {
  id: string;
  cropName: string;         // "Pamuk", "Mısır", "Buğday"
  sowingDate: string;       // "2025-04-15"
  currentDay: number;       // ekim tarihinden bu yana gün sayısı
  totalArea: number;        // dönüm
  lastOperations: string[]; // Son 3 işlem özeti
  scoutingNotes: string[];  // Son 3 gözlem/sağlık durumu özeti
}

export interface AIActionPrompt {
  weather: WeatherData;
  lands: LandContext[];     // sadece aktif araziler
  inventoryStatus: string[]; // Kritik veya azalan stoklar
  date: string;             // bugünün tarihi
}

export function buildAIPrompt(data: AIActionPrompt): string {
  const landsText = data.lands.length > 0 
    ? data.lands.map(l => {
        const opsText = l.lastOperations.length > 0 ? l.lastOperations.join(', ') : "Son zamanlarda işlem yapılmamış";
        const scsText = l.scoutingNotes.length > 0 ? l.scoutingNotes.join(', ') : "Gözlem kaydı bulunmuyor";
        return `- ${l.totalArea} dönüm ${l.cropName}: Ekimin üzerinden ${l.currentDay} gün geçmiş. \n  * Son İşlemler: ${opsText} \n  * Sağlık Durumu: ${scsText}`;
      }).join('\n\n')
    : "Kayıtlı aktif arazi bulunmamaktadır.";

  const inventoryText = data.inventoryStatus.length > 0 
    ? `KRİTİK STOKLAR: ${data.inventoryStatus.join(', ')}`
    : "Stok seviyeleri yeterli.";

  return `Sen kıdemli bir ziraat danışmanısın. Kullanıcının şu anki arazi ve işletme durumu:

${landsText}

${inventoryText}

ANLIK HAVA DURUMU:
- Sıcaklık: ${data.weather.temperature}°C
- Rüzgar Hızı: ${data.weather.windSpeed}km/h
- Nem: ${data.weather.humidity}%

GÖREVİN:
Hava durumu, bitki yaşam döngüsü, geçmiş işlemler ve depo stok durumuna göre; verimi artıracak ve finansal kayıpları önleyecek, SADECE bugün veya önümüzdeki 2-3 gün içinde yapılması gereken 1-3 somut ve spesifik işi söyle. 

Eğer bir ilaçlama veya gübreleme öneriyorsan ve stoklarda o ürün azsa (KRİTİK STOKLAR kısmına bak), mutlaka "Tedarik etmeniz gerekiyor" diye belirt.

FORMAT:
SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir metin ekleme:
{
  "insight": "Bugün yapılması gereken aksiyonlar (maddeler halinde, oldukça profesyonel ve teknik bir dil kullan)",
  "critical_alert": "Varsa kritik don, fırtına, hastalık riski veya stok bitme uyarısı; yoksa null"
}`;
}
