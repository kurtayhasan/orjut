'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup, FeatureGroup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppContext } from '@/context/AppContext';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { MapPin, X, Save, TreePine, Ruler, Search, Layers, Globe, ChevronDown, Lock, Radio } from 'lucide-react';
import { WMSTileLayer, LayersControl } from 'react-leaflet';
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';
import { EditControl } from 'react-leaflet-draw';
import * as turf from '@turf/turf';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix Leaflet default icon issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Top 15 Global Crops
const CROP_TYPES = [
  'Buğday', 'Mısır', 'Pirinç', 'Soya Fasulyesi', 'Pamuk',
  'Arpa', 'Patates', 'Şeker Pancarı', 'Şeker Kamışı', 'Domates',
  'Soğan', 'Elma', 'Üzüm', 'Portakal', 'Kahve'
];

// MapClickHandler removed in favor of EditControl

function MapController({ selectedLand }: { selectedLand: any }) {
  const map = useMap();
  useEffect(() => {
    if (selectedLand && selectedLand.lat && selectedLand.lng) {
      map.flyTo([selectedLand.lat, selectedLand.lng], 15, { animate: true });
    }
  }, [selectedLand, map]);
  return null;
}

export default function LeafletMap({ focusLand, editLand }: { focusLand?: any, editLand?: any }) {
  const { addLand, updateLand, lands, userProfile, isDarkMode } = useAppContext();
  const [isNDVIActive, setIsNDVIActive] = useState(false);
  const isPremium = userProfile?.is_premium;
  const [markerPosition, setMarkerPosition] = useState<L.LatLng | null>(null);
  const [showCropSelector, setShowCropSelector] = useState(false);
  const [editingLandId, setEditingLandId] = useState<string | null>(null);
  const [boundaries, setBoundaries] = useState<any>(null);
  const drawGroupRef = useRef<L.FeatureGroup>(null);
  
  // Location dropdown states
  const [selectedCountryCode, setSelectedCountryCode] = useState('TR');
  const [selectedStateCode, setSelectedStateCode] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [blockNo, setBlockNo] = useState('');
  const [parcelNo, setParcelNo] = useState('');
  const [plotSize, setPlotSize] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [plantingDate, setPlantingDate] = useState('');
  const [soilType, setSoilType] = useState('');
  const [isIrrigated, setIsIrrigated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [environmentType, setEnvironmentType] = useState<'acik_tarla' | 'sera'>('acik_tarla');
  const [sizeSqm, setSizeSqm] = useState<number>(0);

  // Country/State/City data from country-state-city
  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(() => State.getStatesOfCountry(selectedCountryCode), [selectedCountryCode]);
  const cities = useMemo(() => selectedStateCode ? City.getCitiesOfState(selectedCountryCode, selectedStateCode) : [], [selectedCountryCode, selectedStateCode]);

  // Effect to handle external edit request (from Edit button)
  useEffect(() => {
    if (editLand) {
      handleEditPlot(editLand);
    }
  }, [editLand]);

  const onCreated = async (e: any) => {
    const { layerType, layer } = e;
    if (layerType === 'polygon') {
      const geojson = layer.toGeoJSON();
      const areaSqm = turf.area(geojson);
      const decares = (areaSqm / 1000).toFixed(2);
      
      const centroid = turf.centroid(geojson);
      const lng = centroid.geometry.coordinates[0];
      const lat = centroid.geometry.coordinates[1];

      setEditingLandId(null);
      resetForm();
      setMarkerPosition(new L.LatLng(lat, lng));
      setPlotSize(decares);
      setSizeSqm(areaSqm);
      setBoundaries(geojson);
      setShowCropSelector(true);
      
      if (drawGroupRef.current) {
         drawGroupRef.current.clearLayers();
      }

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await res.json();
        if (data && data.address) {
          const addr = data.address;
          const countryCode = addr.country_code ? addr.country_code.toUpperCase() : 'TR';
          setSelectedCountryCode(countryCode);
          
          const detectedState = addr.province || addr.state;
          if (detectedState) {
            const allStates = State.getStatesOfCountry(countryCode);
            const cleanState = detectedState.toLowerCase().replace(' province', '').replace(' ili', '');
            const matchedState = allStates.find(s => s.name.toLowerCase().includes(cleanState) || cleanState.includes(s.name.toLowerCase()));
            if (matchedState) {
              setSelectedStateCode(matchedState.isoCode);
              setCity(matchedState.name);
            } else {
              setCity(detectedState);
            }
          }
          
          const detectedDistrict = addr.town || addr.county || addr.city || addr.district;
          if (detectedDistrict) {
            setDistrict(detectedDistrict);
          }
          
          const detectedNeighborhood = addr.neighbourhood || addr.village || addr.quarter || addr.suburb;
          if (detectedNeighborhood) {
            setNeighborhood(detectedNeighborhood);
          }
          
          toast.success("Konum bilgileri haritadan otomatik dolduruldu!");
        }
      } catch (err) {
        console.error("Reverse geocoding failed", err);
      }
    }
  };

  const handleEditPlot = (land: any) => {
    setEditingLandId(land.id);
    setCity(land.city || '');
    setDistrict(land.district || '');
    setNeighborhood(land.neighborhood || '');
    setBlockNo(land.block_no || '');
    setParcelNo(land.parcel_no || '');
    setPlotSize(String(land.size_decare || land.size || ''));
    setSelectedCrop(land.crop_type || '');
    setPlantingDate(land.planting_date || '');
    setSoilType(land.soil_type || '');
    setIsIrrigated(land.is_irrigated || false);
    setEnvironmentType(land.environment_type || 'acik_tarla');
    setSizeSqm(land.size_sqm || 0);
    setBoundaries(land.boundaries || null);
    if (land.lat && land.lng) {
      setMarkerPosition(new L.LatLng(land.lat, land.lng));
    }
    setShowCropSelector(true);
  };

  const resetForm = () => {
    setSelectedCountryCode('TR');
    setSelectedStateCode('');
    setCity('');
    setDistrict('');
    setNeighborhood('');
    setBlockNo('');
    setParcelNo('');
    setPlotSize('');
    setSelectedCrop('');
    setPlantingDate('');
    setSoilType('');
    setIsIrrigated(false);
    setEnvironmentType('acik_tarla');
    setSizeSqm(0);
    setBoundaries(null);
  };

  const handleSavePlot = async () => {
    if (!selectedCrop || !plotSize || !city || !plantingDate) {
      toast.error("Lütfen tüm zorunlu alanları (İl, Dönüm, Ürün ve Ekim Tarihi) doldurun.");
      return;
    }
    
    const landData: any = {
      city, district, neighborhood, block_no: blockNo, parcel_no: parcelNo, 
      size: plotSize, size_decare: Number(plotSize), crop_type: selectedCrop, 
      planting_date: plantingDate,
      soil_type: soilType, is_irrigated: isIrrigated,
      environment_type: environmentType,
      size_sqm: sizeSqm,
      lat: markerPosition?.lat, lng: markerPosition?.lng,
      boundaries: boundaries
    };

    if (editingLandId) {
      landData.id = editingLandId;
      await updateLand(landData);
    } else {
      // Duplicate check (Ada/Parsel)
      const isDuplicate = lands.find(l => l.block_no === blockNo && l.parcel_no === parcelNo && l.city === city);
      if (isDuplicate && blockNo && parcelNo) {
        toast.error("Bu ada/parsel zaten kayıtlı!");
        return;
      }
      await addLand(landData);
    }

    setShowCropSelector(false);
    setEditingLandId(null);
    setMarkerPosition(null);
  };

  const handleCancelPlot = () => {
    setMarkerPosition(null);
    setShowCropSelector(false);
    setEditingLandId(null);
    setBoundaries(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMarkerPosition(new L.LatLng(parseFloat(lat), parseFloat(lon)));
        setShowCropSelector(true);
      } else {
        toast.error("Konum bulunamadı.");
      }
    } catch (err) {
      toast.error("Arama sırasında bir hata oluştu.");
    } finally {
      setIsSearching(false);
    }
  };

  const mapCenter: [number, number] = useMemo(() => {
    if (focusLand?.lat && focusLand?.lng) return [focusLand.lat, focusLand.lng];
    if (lands.length > 0 && lands[0].lat && lands[0].lng) return [lands[0].lat, lands[0].lng];
    return [37.3122, 40.7339]; // Mardin
  }, [focusLand, lands]);

  // select class helper
  const selectClass = "w-full px-3 py-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-xl outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-700 transition-all text-sm font-semibold appearance-none cursor-pointer text-zinc-900 dark:text-zinc-100";

  const handleNDVIToggle = () => {
    if (!isPremium) {
      toast.error("NDVI Uydu Analizi sadece Premium üyeler içindir.", {
        description: "Hemen yükseltin ve tarlanızı uzaydan izleyin!",
        action: {
          label: "Yükselt",
          onClick: () => window.location.href = '/settings/billing'
        }
      });
      return;
    }
    setIsNDVIActive(!isNDVIActive);
  };

  return (
    <div className="relative w-full h-full group">
      {/* NDVI Toggle Overlay */}
      <div className="absolute top-20 left-4 z-[1000] flex flex-col gap-2">
        <button 
          onClick={handleNDVIToggle}
          className={`p-3 rounded-2xl shadow-xl backdrop-blur-md transition-all border flex items-center gap-2 ${isNDVIActive ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/90 dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-white'}`}
        >
          {isPremium ? <Radio size={18} className={isNDVIActive ? 'animate-pulse' : ''} /> : <Lock size={18} className="text-amber-500" />}
          <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">🛰️ NDVI Isı Haritası</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2 pointer-events-none">
        <form onSubmit={handleSearch} className="flex-1 max-w-md pointer-events-auto">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Şehir, ilçe veya mevki ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm text-zinc-900 dark:text-zinc-100"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </form>
      </div>

      <MapContainer 
        center={mapCenter}
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        className="rounded-3xl overflow-hidden shadow-inner"
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url={isDarkMode 
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Uydu Görünümü">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          {isNDVIActive && focusLand && 
            <LayersControl.Overlay checked name="NDVI Analizi">
              <TileLayer
                url={`https://api.agromonitoring.com/tile/1.0/{z}/{x}/{y}/NDVI/{id}?appid=${process.env.NEXT_PUBLIC_AGROMONITORING_API_KEY}`}
                opacity={0.7}
              />
            </LayersControl.Overlay>
          }
        </LayersControl>

        <FeatureGroup ref={drawGroupRef}>
          <EditControl
            position='topright'
            onCreated={onCreated}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
              polygon: true
            }}
          />
        </FeatureGroup>
        
        <MapController selectedLand={focusLand} />
        
        {/* Render markers for all saved lands */}
        {lands.map((land: any) => (
          <React.Fragment key={land.id}>
            {land.boundaries ? (
              <GeoJSON 
                data={land.boundaries} 
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e as any);
                    handleEditPlot(land);
                  }
                }}
              />
            ) : (
              land.lat && land.lng && (
                <Marker 
                  position={[land.lat, land.lng]}
                  eventHandlers={{
                    click: (e) => {
                      L.DomEvent.stopPropagation(e as any);
                      handleEditPlot(land);
                    }
                  }}
                />
              )
            )}
          </React.Fragment>
        ))}

        {markerPosition && !editingLandId && <Marker position={markerPosition} />}
      </MapContainer>

      {/* TKGM Crop & Size Selector */}
      {showCropSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
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
                <button onClick={handleCancelPlot} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
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
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${environmentType === 'acik_tarla' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-700'}`}
                  >
                    Açık Tarla
                  </button>
                  <button 
                    type="button"
                    onClick={() => setEnvironmentType('sera')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${environmentType === 'sera' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-700'}`}
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
                  <label className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-zinc-700 hover:border-indigo-500 transition-all select-none">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-indigo-600 rounded border-zinc-300 dark:border-zinc-600 focus:ring-indigo-500" 
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
                <button onClick={handleCancelPlot} className="flex-1 py-3.5 text-zinc-500 dark:text-zinc-400 font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-all active:scale-[0.98]">İptal</button>
                <button 
                  onClick={handleSavePlot} 
                  disabled={!selectedCrop || !plotSize || !city || !plantingDate} 
                  className="flex-[2] py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {editingLandId ? 'Güncelle' : 'Araziyi Oluştur'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
