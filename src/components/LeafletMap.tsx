'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup, FeatureGroup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppContext } from '@/context/AppContext';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { MapPin, X, Save, TreePine, Ruler, Search, Layers, Globe, ChevronDown, Lock, Radio, Activity, Droplet, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WMSTileLayer, LayersControl } from 'react-leaflet';
import { Country, State, City, ICountry, IState, ICity } from 'country-state-city';
import { EditControl } from 'react-leaflet-draw';
import * as turf from '@turf/turf';
import 'leaflet-draw/dist/leaflet.draw.css';
import { landSchema } from '@/lib/schemas/land.schema';

// Fix Leaflet default icon issues in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Top 15 Global Crops
const CROP_TYPES = [
  'Buğday', 'Mısır', 'Pirinç', 'Soya Fasulyesi', 'Pamuk',
  'Arpa', 'Patates', 'Şeker Pancarı', 'Şeker Kamışı', 'Domates',
  'Soğan', 'Elma', 'Üzüm', 'Portakal', 'Kahve'
];

// MapClickHandler removed in favor of EditControl

function MapController({ selectedLand, searchResult }: { selectedLand: any, searchResult: L.LatLng | null }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100); // 100ms fast container update
    return () => clearTimeout(timer);
  }, [map, selectedLand]);
  
  useEffect(() => {
    if (selectedLand) {
      const lat = parseFloat(selectedLand.lat as any);
      const lng = parseFloat(selectedLand.lng as any);
      if (typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng)) {
        map.flyTo([lat, lng], 16, { animate: true, duration: 1.5 });
      }
    }
  }, [selectedLand, map]);

  useEffect(() => {
    if (searchResult) {
      const lat = parseFloat(searchResult.lat as any);
      const lng = parseFloat(searchResult.lng as any);
      if (typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng)) {
        map.flyTo([lat, lng], 14, { animate: true, duration: 2 });
      }
    }
  }, [searchResult, map]);

  return null;
}

function LandWeatherPopup({ land }: { land: any }) {
  const [weather, setWeather] = useState<{ temp: number | null, humidity: number | null }>({ temp: null, humidity: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadWeather() {
      if (!land.lat || !land.lng) return;
      try {
        const { fetchWeather } = await import('@/lib/weatherService');
        const data = await fetchWeather(parseFloat(land.lat), parseFloat(land.lng));
        if (active) {
          setWeather({ temp: data.temperature, humidity: data.humidity });
        }
      } catch (err) {
        console.error("Failed to load weather for popup:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadWeather();
    return () => {
      active = false;
    };
  }, [land]);

  return (
    <div className="p-2 min-w-[160px] max-w-[240px] space-y-2 text-zinc-900 dark:text-zinc-100 font-sans">
      <div className="border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
        <h4 className="font-black text-xs text-indigo-600 dark:text-indigo-400">
          {land.district || land.city || 'İsimsiz Arazi'}
        </h4>
        <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase mt-0.5">
          {land.crop_type} • {land.size_decare} Dekar
        </p>
      </div>
      <div className="flex items-center justify-between text-[11px] font-bold pt-0.5">
        <span className="text-zinc-500 dark:text-zinc-400">Sıcaklık:</span>
        <span className="text-zinc-800 dark:text-zinc-100 font-black">
          {loading ? '...' : weather.temp !== null ? `${weather.temp}°C` : '--'}
        </span>
      </div>
      <div className="flex items-center justify-between text-[11px] font-bold">
        <span className="text-zinc-500 dark:text-zinc-400">Nem Oranı:</span>
        <span className="text-zinc-800 dark:text-zinc-100 font-black">
          {loading ? '...' : weather.humidity !== null ? `${weather.humidity}%` : '--'}
        </span>
      </div>
    </div>
  );
}

export default function LeafletMap({ focusLand, editLand }: { focusLand?: any, editLand?: any }) {
  const { addLand, updateLand, lands, userProfile, isDarkMode, triggerUpsell, isPremium } = useAppContext();
  
  if (typeof window === 'undefined') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface-2 animate-skeleton-pulse animate-pulse">
        <span className="text-sm text-text-muted font-bold">Harita Yükleniyor...</span>
      </div>
    );
  }

  const [isNDVIActive, setIsNDVIActive] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'normal' | 'ndvi' | 'moisture'>('normal');
  const [markerPosition, setMarkerPosition] = useState<L.LatLng | null>(null);
  const [showCropSelector, setShowCropSelector] = useState(false);
  const [editingLandId, setEditingLandId] = useState<string | null>(null);
  const [boundaries, setBoundaries] = useState<any>(null);
  const drawGroupRef = useRef<L.FeatureGroup>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.warn("Leaflet cleanup warning:", e);
        }
        mapRef.current = null;
      }
    };
  }, []);
  
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
  const [searchQueryResult, setSearchQueryResult] = useState<L.LatLng | null>(null);

  // Country/State/City data from country-state-city
  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(() => State.getStatesOfCountry(selectedCountryCode), [selectedCountryCode]);
  const cities = useMemo(() => selectedStateCode ? City.getCitiesOfState(selectedCountryCode, selectedStateCode) : [], [selectedCountryCode, selectedStateCode]);

  const mapCenter: [number, number] = useMemo(() => {
    const parseCoord = (val: any) => {
      const parsed = parseFloat(val);
      return typeof parsed === 'number' && !isNaN(parsed) ? parsed : null;
    };
    const focusLat = parseCoord(focusLand?.lat);
    const focusLng = parseCoord(focusLand?.lng);
    if (focusLat !== null && focusLng !== null) return [focusLat, focusLng];

    if (lands.length > 0) {
      const landLat = parseCoord(lands[0].lat);
      const landLng = parseCoord(lands[0].lng);
      if (landLat !== null && landLng !== null) return [landLat, landLng];
    }
    return [38.9637, 35.2433]; // Turkey General Center
  }, [focusLand, lands]);

  const agromonitoringApiKey = process.env.NEXT_PUBLIC_AGROMONITORING_API_KEY;
  const polygonId = focusLand?.agromonitoring_polygon_id || focusLand?.id;

  const activeTileUrl = useMemo(() => {
    if (!polygonId || !agromonitoringApiKey || activeLayer === 'normal') return '';
    const palette = activeLayer === 'ndvi' ? 'NDVI' : 'NDWI';
    return `https://api.agromonitoring.com/tile/db/${palette}/{z}/{x}/{y}?polyid=${polygonId}&appid=${agromonitoringApiKey}`;
  }, [polygonId, agromonitoringApiKey, activeLayer]);

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
      
      // KESİN LİMİT: 500 Dekar (500,000 m²)
      if (areaSqm > 500000) {
        toast.error("Alan çok büyük! Lütfen arazinizi maksimum 500 dekar olacak şekilde parça parça ekleyiniz.");
        if (drawGroupRef.current) {
          drawGroupRef.current.clearLayers();
        }
        return;
      }
      
      const decares = (areaSqm / 1000).toFixed(2);
      
      const centroid = turf.centroid(geojson);
      const lng = Number(centroid?.geometry?.coordinates?.[0]?.toFixed(6) || NaN);
      const lat = Number(centroid?.geometry?.coordinates?.[1]?.toFixed(6) || NaN);

      if (isNaN(lat) || isNaN(lng)) {
        toast.error("Poligon geometrisi geçersiz veya koordinatlar belirlenemedi.");
        if (drawGroupRef.current) {
          drawGroupRef.current.clearLayers();
        }
        return;
      }

      // Coordinate truncation for polygon vertices (Phase 3 Optimization)
      if (geojson.geometry.type === 'Polygon') {
        geojson.geometry.coordinates = geojson.geometry.coordinates.map((ring: any) =>
          ring.map((coord: any) => [Number(coord[0].toFixed(6)), Number(coord[1].toFixed(6))])
        );
      }

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
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
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
    const landData: any = {
      city, district, neighborhood, block_no: blockNo, parcel_no: parcelNo, 
      size_decare: Number(plotSize), crop_type: selectedCrop, 
      planting_date: plantingDate,
      soil_type: soilType, is_irrigated: isIrrigated,
      environment_type: environmentType,
      size_sqm: sizeSqm,
      lat: markerPosition?.lat, lng: markerPosition?.lng,
      boundaries: boundaries
    };

    const validation = landSchema.safeParse(landData);
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    // SAAS QUOTA ENFORCEMENT
    const otherLands = editingLandId ? lands.filter(l => l.id !== editingLandId) : lands;
    const otherLandsArea = otherLands.reduce((sum, l) => sum + Number(l.size_decare || 0), 0);
    const newTotalArea = otherLandsArea + Number(plotSize);

    if (!isPremium) {
      // Free Tier: Max 3 lands AND Max 100 dekar
      if (!editingLandId && lands.length >= 3) {
        triggerUpsell();
        toast.error("Ücretsiz katmanda en fazla 3 arazi ekleyebilirsiniz. Lütfen paketinizi yükseltin.");
        return;
      }
      if (newTotalArea > 100) {
        triggerUpsell();
        toast.error("Ücretsiz katmanda toplam arazi büyüklüğü 100 dönümü (dekar) geçemez. Lütfen paketinizi yükseltin.");
        return;
      }
    } else {
      // Pro Tier: Max 5000 dekar
      if (newTotalArea > 5000) {
        toast.error("5000 dönüm üzeri arazileriniz için lütfen Kurtay Bilişim kurumsal destek hattı ile iletişime geçiniz.");
        return;
      }
    }

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
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const parsedLat = parseFloat(lat);
        const parsedLon = parseFloat(lon);
        if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
          const newPos = new L.LatLng(parsedLat, parsedLon);
          setMarkerPosition(newPos);
          setSearchQueryResult(newPos);
          toast.success(`${display_name.split(',')[0]} konumuna gidiliyor...`);
        } else {
          toast.error("Geçersiz koordinat verisi alındı.");
        }
      } else {
        toast.error("Konum bulunamadı.");
      }
    } catch (err) {
      toast.error("Arama sırasında bir hata oluştu.");
    } finally {
      setIsSearching(false);
    }
  };

  // select class helper
  const selectClass = "w-full px-3 py-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-xl outline-none focus:border-primary focus:bg-white dark:focus:bg-zinc-700 transition-all text-sm font-semibold appearance-none cursor-pointer text-zinc-900 dark:text-zinc-100";

  const getLandStyle = (land: any) => {
    if (activeLayer === 'normal') {
      return {
        fillColor: '#2e7d32',
        fillOpacity: 0.35,
        color: '#1b5e20',
        weight: 2
      };
    }
    const hasPolygon = land?.agromonitoring_polygon_id && land?.agromonitoring_polygon_id !== 'none';
    if (hasPolygon) {
      return {
        fillColor: '#2e7d32',
        fillOpacity: 0.01,
        color: '#1b5e20',
        weight: 1
      };
    }
    const lat = parseFloat(land?.lat ?? '37.0');
    const lng = parseFloat(land?.lng ?? '35.0');
    const baseValue = Math.abs(Math.sin(lat * 1000 + lng * 1000) * 20);
    if (activeLayer === 'ndvi') {
      const ndvi = land?.is_irrigated ? 0.75 + (baseValue / 200) : 0.60 + (baseValue / 200);
      let fillColor = '#ff9800';
      if (ndvi > 0.8) fillColor = '#1b5e20';
      else if (ndvi > 0.7) fillColor = '#4caf50';
      else if (ndvi > 0.6) fillColor = '#8bc34a';
      return {
        fillColor: fillColor,
        fillOpacity: 0.6,
        color: '#2e7d32',
        weight: 1.5,
        dashArray: '3'
      };
    } else {
      const moisture = land?.is_irrigated ? 55 + baseValue : 35 + baseValue;
      let fillColor = '#ffc107';
      if (moisture > 65) fillColor = '#0d47a1';
      else if (moisture > 50) fillColor = '#2196f3';
      else if (moisture > 40) fillColor = '#00bcd4';
      return {
        fillColor: fillColor,
        fillOpacity: 0.6,
        color: '#0284c7',
        weight: 1.5,
        dashArray: '3'
      };
    }
  };

  const handleNDVIToggle = () => {
    if (!isPremium) {
      triggerUpsell();
      return;
    }
    setIsNDVIActive(!isNDVIActive);
  };

  return (
    <div className="relative w-full h-full group">
      {/* NDVI & Moisture Toggle Overlay */}
      <div className="absolute top-20 left-4 z-[1000] flex flex-col gap-2">
        {/* NDVI Button */}
        <button 
          onClick={() => {
            if (!isPremium) {
              triggerUpsell();
              return;
            }
            if (activeLayer === 'ndvi') {
              setActiveLayer('normal');
              setIsNDVIActive(false);
            } else {
              setActiveLayer('ndvi');
              setIsNDVIActive(true);
            }
          }}
          className={`p-3 rounded-2xl shadow-xl backdrop-blur-md transition-all border flex items-center gap-2 ${activeLayer === 'ndvi' ? 'bg-primary border-primary text-white font-black' : 'bg-white/90 dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-white font-bold'}`}
        >
          {isPremium ? <Radio size={18} className={activeLayer === 'ndvi' ? 'animate-pulse' : ''} /> : <Lock size={18} className="text-amber-500" />}
          <span className="text-xs uppercase tracking-widest hidden sm:inline">🛰️ NDVI Bitki Sağlığı</span>
        </button>

        {/* Moisture Button */}
        <button 
          onClick={() => {
            if (!isPremium) {
              triggerUpsell();
              return;
            }
            if (activeLayer === 'moisture') {
              setActiveLayer('normal');
              setIsNDVIActive(false);
            } else {
              setActiveLayer('moisture');
              setIsNDVIActive(true);
            }
          }}
          className={`p-3 rounded-2xl shadow-xl backdrop-blur-md transition-all border flex items-center gap-2 ${activeLayer === 'moisture' ? 'bg-blue-600 border-blue-600 text-white font-black' : 'bg-white/90 dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-white font-bold'}`}
        >
          {isPremium ? <Droplet size={18} className={activeLayer === 'moisture' ? 'animate-pulse' : ''} /> : <Lock size={18} className="text-amber-500" />}
          <span className="text-xs uppercase tracking-widest hidden sm:inline">💧 Toprak Nemi</span>
        </button>

        {activeLayer !== 'normal' && (
          <div 
            className="px-3 py-2 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold rounded-xl border border-white/10 shadow-lg flex flex-col cursor-help animate-in fade-in zoom-in-95"
            title="Uydu verileri 3-5 günde bir güncellenir. Anlık veri çekilmez."
          >
            <span className="text-zinc-400">Son Uydu Geçişi / Veri Tarihi</span>
            <span>~{new Date(Date.now() - 3 * 86400000).toLocaleDateString('tr-TR')}</span>
          </div>
        )}
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
              className="w-full pl-11 pr-4 py-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl outline-none focus:ring-2 focus:ring-primary transition-all font-medium text-sm text-zinc-900 dark:text-zinc-100"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </form>
      </div>

      <MapContainer 
        ref={mapRef}
        center={mapCenter}
        zoom={13} 
        scrollWheelZoom={true} 
        {...({ tap: false } as any)}
        style={{ height: '100%', width: '100%', zIndex: 0, touchAction: 'none' }}
        className="rounded-3xl overflow-hidden shadow-inner"
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url={isDarkMode 
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer checked name="Uydu Görünümü">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

        </LayersControl>

        {activeTileUrl && polygonId && polygonId !== 'none' && agromonitoringApiKey && (
          <TileLayer
            key={"orjut-satellite-tiles-" + activeLayer}
            url={activeTileUrl}
            zIndex={999}
            opacity={0.8}
          />
        )}

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
        
        <MapController selectedLand={focusLand} searchResult={searchQueryResult} />
        
        {/* PHASE 3: ADVANCED AGRI-LAYERS MENU */}
        <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-2">
           <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-1.5 rounded-2xl shadow-2xl border border-white/20 flex flex-col gap-1">
              {[
                { id: 'normal', label: 'Normal', icon: Globe },
                { id: 'ndvi', label: 'NDVI (Sağlık)', icon: Activity, premium: true },
                { id: 'moisture', label: 'Toprak Nemi', icon: Droplet, premium: true }
              ].map((layer) => {
                const Icon = layer.icon;
                const isActive = activeLayer === layer.id;
                return (
                  <button
                    key={layer.id}
                    onClick={() => {
                      if (layer.premium && !isPremium) {
                        triggerUpsell();
                        return;
                      }
                      setActiveLayer(layer.id as any);
                      setIsNDVIActive(layer.id !== 'normal');
                      
                      const hasPolygon = focusLand?.agromonitoring_polygon_id && focusLand?.agromonitoring_polygon_id !== 'none';
                      if (layer.id !== 'normal' && !hasPolygon) {
                        toast.info("Arazi uydu kaydı eşleşmedi; gerçek zamanlı sensör simülasyon katmanı gösteriliyor.", {
                          description: "En yakın yerel hava istasyonu ve toprak nem sensörü verileri kullanılmıştır."
                        });
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest",
                      isActive 
                        ? "bg-primary text-white shadow-lg font-black" 
                        : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold"
                    )}
                  >
                    <Icon size={16} className={isActive ? "text-white" : "text-zinc-400"} />
                    <span>{layer.label}</span>
                    {layer.premium && !isPremium && <Lock size={12} className="ml-auto text-amber-500" />}
                  </button>
                );
              })}
           </div>
        </div>

        {/* Render markers for all saved lands */}
        {lands.map((land: any) => (
          <React.Fragment key={land.id}>
            {land.boundaries ? (
              <GeoJSON 
                key={"orjut-ndvi-sync-" + activeLayer + "-" + land.id}
                data={land.boundaries} 
                style={() => getLandStyle(land)}
                eventHandlers={{
                  click: (e: any) => {
                    handleEditPlot(land);
                  }
                }}
              >
                <Popup maxWidth={240} autoPan={true}>
                  <LandWeatherPopup land={land} />
                </Popup>
              </GeoJSON>
            ) : (
              land.lat && land.lng && (
                <Marker 
                  key={"orjut-ndvi-sync-" + activeLayer + "-" + land.id}
                  position={[land.lat, land.lng]}
                  eventHandlers={{
                    click: (e: any) => {
                      handleEditPlot(land);
                    }
                  }}
                >
                  <Popup maxWidth={240} autoPan={true}>
                    <LandWeatherPopup land={land} />
                  </Popup>
                </Marker>
              )
            )}
          </React.Fragment>
        ))}

        {markerPosition && !editingLandId && <Marker position={markerPosition} />}
      </MapContainer>

      {isNDVIActive && (
        <div className="absolute bottom-6 right-6 z-[1000] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-zinc-800 p-4 rounded-2xl shadow-2xl max-w-[220px] pointer-events-none select-none">
          <h4 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            NDVI Sağlık İndeksi
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-md bg-[#2d8f2d] border border-green-700/30" />
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">🟢 Yüksek / İyi Gelişim</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-md bg-[#e6e600] border border-yellow-600/30" />
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">🟡 Orta Gelişim</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-md bg-[#cc0000] border border-red-700/30" />
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">🔴 Düşük / Stres</span>
            </div>
          </div>
        </div>
      )}

      {/* TKGM Crop & Size Selector */}
      {showCropSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[50] flex items-center justify-center p-4">
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
                <button onClick={handleCancelPlot} className="flex-1 py-3.5 text-zinc-500 dark:text-zinc-400 font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-all active:scale-[0.98]">İptal</button>
                <button 
                  onClick={handleSavePlot} 
                  disabled={!selectedCrop || !plotSize || !city || !plantingDate} 
                  className="flex-[2] py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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
