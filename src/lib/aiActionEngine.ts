import { WeatherData } from './weatherService';

export interface LandContext {
  id: string;
  cropName: string;         // "Pamuk", "Mısır", "Buğday"
  sowingDate: string;       // "2025-04-15"
  currentDay: number;       // ekim tarihinden bu yana gün sayısı
  totalArea: number;        // dönüm
  soilType?: string;        // "Kumlu", "Killi" vs.
  lat: number;              // Centroid latitude
  lng: number;              // Centroid longitude
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
        const soilText = l.soilType ? `Toprak Tipi: ${l.soilType}, ` : "";
        return `- ${l.totalArea} dönüm ${l.cropName} (${soilText}Konum: ${l.lat}, ${l.lng}): Ekimin üzerinden ${l.currentDay} gün geçmiş. \n  * Son İşlemler: ${opsText} \n  * Sağlık Durumu: ${scsText}`;
      }).join('\n\n')
    : "Kayıtlı aktif arazi bulunmamaktadır.";

  const inventoryText = data.inventoryStatus.length > 0 
    ? `KRİTİK STOKLAR: ${data.inventoryStatus.join(', ')}`
    : "Stok seviyeleri yeterli.";

  return `Sen Orjut Proaktif Zirai Danışmanısın. Kullanıcının işletme verilerini ve hava durumunu analiz ederek SADECE günübirlik veya 2-3 günlük AKSİYON PLANLARI hazırlarsın.

KULLANICI VERİLERİ:
${landsText}

${inventoryText}

HAVA DURUMU:
- Sıcaklık: ${data.weather.temperature}°C
- Rüzgar Hızı: ${data.weather.windSpeed}km/h
- Nem: ${data.weather.humidity}%

TALİMATLAR:
1. PROAKTİF OL: Sadece durumu söyleme, ne yapılması gerektiğini söyle. Örn: "Rüzgar çok sert, ilaçlama yapmayın" veya "Hava aşırı sıcak, akşam mısırları sulayın".
2. BİTKİ EVRESİNE BAK: Ekim tarihinden bu yana geçen süreyi (currentDay) kullanarak bitkinin kritik evresinde (çiçeklenme vb.) olup olmadığını tahmin et ve buna göre uyarı ver.
3. STOK KONTROLÜ: Önerdiğin işlem için gerekli ürün stoklarda azsa (KRİTİK STOKLAR kısmında varsa), mutlaka "Tedarik etmeniz gerekiyor" uyarısını ekle.
4. DİL: Profesyonel, çözüm odaklı ve teknik ziraat dili kullan.

FORMAT:
SADECE aşağıdaki JSON formatında yanıt ver:
{
  "insight": "Nokta atışı, aksiyon odaklı öneriler (maddeler halinde)",
  "critical_alert": "🚨 KRİTİK: Don, fırtına, hastalık riski veya stok uyarısı; yoksa null"
}`;
}
