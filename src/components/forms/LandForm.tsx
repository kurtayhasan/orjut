'use client';

import React, { useMemo } from 'react';
import { X, Globe, ChevronDown, MapPin, Ruler, TreePine } from 'lucide-react';
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';

const CROP_TYPES = [
  'Buğday', 'Mısır', 'Pirinç', 'Soya Fasulyesi', 'Pamuk',
  'Arpa', 'Patates', 'Şeker Pancarı', 'Şeker Kamışı', 'Domates',
  'Soğan', 'Elma', 'Üzüm', 'Portakal', 'Kahve'
];

const selectClass = "w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-bold text-sm text-zinc-900 dark:text-zinc-100 appearance-none";

interface LandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingLandId: string | null;
  environmentType: 'acik_tarla' | 'sera';
  setEnvironmentType: (val: 'acik_tarla' | 'sera') => void;
  selectedCountryCode: string;
  setSelectedCountryCode: (val: string) => void;
  selectedStateCode: string;
  setSelectedStateCode: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  district: string;
  setDistrict: (val: string) => void;
  neighborhood: string;
  setNeighborhood: (val: string) => void;
  blockNo: string;
  setBlockNo: (val: string) => void;
  parcelNo: string;
  setParcelNo: (val: string) => void;
  plotSize: string;
  sizeSqm: number;
  selectedCrop: string;
  setSelectedCrop: (val: string) => void;
  plantingDate: string;
  setPlantingDate: (val: string) => void;
  soilType: string;
  setSoilType: (val: string) => void;
  isIrrigated: boolean;
  setIsIrrigated: (val: boolean) => void;
}

export default function LandFormModal({
  isOpen, onClose, onSave, editingLandId,
  environmentType, setEnvironmentType,
  selectedCountryCode, setSelectedCountryCode,
  selectedStateCode, setSelectedStateCode,
  city, setCity,
  district, setDistrict,
  neighborhood, setNeighborhood,
  blockNo, setBlockNo,
  parcelNo, setParcelNo,
  plotSize, sizeSqm,
  selectedCrop, setSelectedCrop,
  plantingDate, setPlantingDate,
  soilType, setSoilType,
  isIrrigated, setIsIrrigated
}: LandFormModalProps) {
  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(() => State.getStatesOfCountry(selectedCountryCode), [selectedCountryCode]);
  const cities = useMemo(() => selectedStateCode ? City.getCitiesOfState(selectedCountryCode, selectedStateCode) : [], [selectedCountryCode, selectedStateCode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[5000] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col border border-zinc-100 dark:border-zinc-800 my-auto relative overflow-hidden">
        {/* Header - Sticky */}
        <div className="p-6 border-b border-zinc-50 dark:border-zinc-800">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                {editingLandId ? 'Araziyi Düzenle' : 'Yeni Arazi Tanımla'}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium uppercase tracking-wider mt-1">Tapu ve Ürün Bilgileri</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
              <X size={20} className="text-zinc-400 dark:text-zinc-500" />
            </button>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
          {/* Environment Type Toggle */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Arazi Tipi</label>
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
              <button 
                type="button"
                onClick={() => setEnvironmentType('acik_tarla')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${environmentType === 'acik_tarla' ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                Açık Tarla
              </button>
              <button 
                type="button"
                onClick={() => setEnvironmentType('sera')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${environmentType === 'sera' ? 'bg-white dark:bg-zinc-700 shadow-sm text-primary' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                Sera
              </button>
            </div>
          </div>

          {/* Country Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Ülke</label>
            <div className="relative">
              <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <select 
                className={`${selectClass} pl-10`}
                value={selectedCountryCode} 
                onChange={(e) => {
                  setSelectedCountryCode(e.target.value);
                  setSelectedStateCode('');
                  setCity('');
                  setDistrict('');
                }}
              >
                {countries.map((c: ICountry) => (
                  <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none" />
            </div>
          </div>

          {/* State/City Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">İl / Eyalet</label>
              <div className="relative">
                <select 
                  className={selectClass}
                  value={selectedStateCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setSelectedStateCode(code);
                    const stateObj = states.find((s: IState) => s.isoCode === code);
                    setCity(stateObj?.name || '');
                    setDistrict('');
                  }}
                >
                  <option value="">İl seçin...</option>
                  {states.map((s: IState) => (
                    <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">İlçe</label>
              <div className="relative">
                {cities.length > 0 ? (
                  <>
                    <select 
                      className={selectClass}
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    >
                      <option value="">İlçe seçin...</option>
                      {cities.map((c: ICity, i: number) => (
                        <option key={`${c.name}-${i}`} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none" />
                  </>
                ) : (
                  <input 
                    type="text" 
                    className={selectClass}
                    placeholder="İlçe yazın..." 
                    value={district} 
                    onChange={(e) => setDistrict(e.target.value)} 
                  />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Mahalle/Köy</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input type="text" className={`${selectClass} pl-10`} placeholder="Cumhuriyet Mah." value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Ada</label>
              <input type="text" className={selectClass} placeholder="101" value={blockNo} onChange={(e) => setBlockNo(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Parsel</label>
              <input type="text" className={selectClass} placeholder="42" value={parcelNo} onChange={(e) => setParcelNo(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                {environmentType === 'sera' ? 'Metrekare' : 'Dönüm'}
              </label>
              <div className="relative">
                <Ruler size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-300" />
                <input 
                  type="text" 
                  className={`${selectClass} bg-zinc-100`} 
                  placeholder="50" 
                  value={environmentType === 'sera' ? `${Math.round(sizeSqm)} m²` : `${plotSize} Dn`} 
                  readOnly 
                  title="Haritadaki çizime göre otomatik hesaplanır" 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Ekili Ürün</label>
              <div className="relative">
                <TreePine size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <select className={`${selectClass} pl-10`} value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}>
                  <option value="" disabled>Ürün seçin...</option>
                  {CROP_TYPES.map(crop => <option key={crop} value={crop}>{crop}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Ekim Tarihi</label>
              <input 
                type="date" 
                className={selectClass}
                value={plantingDate} 
                onChange={(e) => setPlantingDate(e.target.value)} 
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Toprak Tipi (Opsiyonel)</label>
              <div className="relative">
                <select className={selectClass} value={soilType} onChange={(e) => setSoilType(e.target.value)}>
                  <option value="">Seçiniz...</option>
                  <option value="Kumlu">Kumlu</option>
                  <option value="Killi">Killi</option>
                  <option value="Tınlı">Tınlı</option>
                  <option value="Kireçli">Kireçli</option>
                  <option value="Humuslu">Humuslu</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1 flex flex-col justify-end">
              <label className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-zinc-700 hover:border-primary transition-all select-none">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-primary rounded border-zinc-300 dark:border-zinc-600 focus:ring-primary" 
                  checked={isIrrigated} 
                  onChange={(e) => setIsIrrigated(e.target.checked)} 
                />
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Sulu Tarım</span>
              </label>
            </div>
          </div>
          
          {/* Extra padding to ensure scroll reaches bottom for Save button */}
          <div className="h-12"></div>
        </div>

        {/* Footer - Sticky */}
        <div className="p-6 border-t border-zinc-50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-[2rem]">
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3.5 text-zinc-500 dark:text-zinc-400 font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-all active:scale-[0.98]">İptal</button>
            <button 
              onClick={onSave} 
              className="flex-1 py-3.5 text-white font-bold bg-primary hover:bg-primary-hover shadow-lg hover:shadow-primary/30 rounded-xl transition-all active:scale-[0.98]"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
