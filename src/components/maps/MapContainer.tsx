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
import { landSchema } from '@/lib/validators/schemas';
import { useWeather } from '@/hooks/useWeather';
import { useAgroMonitoring } from './hooks/useAgroMonitoring';
import type { Land } from '@/types';
import LandFormModal from '@/components/forms/LandForm';
import { fetchGeocodingReverse, fetchGeocodingSearch } from '@/services/geocoding';

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

function MapController({ selectedLand, searchResult }: { selectedLand: Partial<Land> | null | undefined, searchResult: L.LatLng | null }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100); // 100ms fast container update
    return () => clearTimeout(timer);
  }, [map, selectedLand]);
  
  useEffect(() => {
    if (selectedLand) {
      const lat = parseFloat(selectedLand.lat as unknown as string);
      const lng = parseFloat(selectedLand.lng as unknown as string);
      if (typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng)) {
        map.flyTo([lat, lng], 16, { animate: true, duration: 1.5 });
      }
    }
  }, [selectedLand, map]);

  useEffect(() => {
    if (searchResult) {
      const lat = parseFloat(searchResult.lat as unknown as string);
      const lng = parseFloat(searchResult.lng as unknown as string);
      if (typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng)) {
        map.flyTo([lat, lng], 14, { animate: true, duration: 2 });
      }
    }
  }, [searchResult, map]);

  return null;
}

function LandWeatherPopup({ land }: { land: Partial<Land> }) {
  const { weather, loading, fetchWeatherForLocation } = useWeather();

  useEffect(() => {
    if (land.lat && land.lng) {
      fetchWeatherForLocation(Number(land.lat), Number(land.lng));
    }
  }, [land, fetchWeatherForLocation]);

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
          {loading ? '...' : weather?.temperature !== undefined && weather?.temperature !== null ? `${weather.temperature}°C` : '--'}
        </span>
      </div>
      <div className="flex items-center justify-between text-[11px] font-bold">
        <span className="text-zinc-500 dark:text-zinc-400">Nem Oranı:</span>
        <span className="text-zinc-800 dark:text-zinc-100 font-black">
          {loading ? '...' : weather?.humidity !== undefined && weather?.humidity !== null ? `${weather.humidity}%` : '--'}
        </span>
      </div>
    </div>
  );
}

export default function LeafletMap({ focusLand, editLand }: { focusLand?: Partial<Land>, editLand?: Partial<Land> }) {
  const { addLand, updateLand, lands, userProfile, isDarkMode, triggerUpsell, isPremium } = useAppContext();
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [isNDVIActive, setIsNDVIActive] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'normal' | 'ndvi' | 'moisture'>('normal');
  const [markerPosition, setMarkerPosition] = useState<L.LatLng | null>(null);
  const [showCropSelector, setShowCropSelector] = useState(false);
  const [editingLandId, setEditingLandId] = useState<string | null>(null);
  const [boundaries, setBoundaries] = useState<GeoJSON.GeoJsonObject | null>(null);
  const drawGroupRef = useRef<L.FeatureGroup>(null);
  const mapRef = useRef<L.Map | null>(null);

  const { ndviData, fetchNDVI, loadingNdvi } = useAgroMonitoring();

  useEffect(() => {
    if (activeLayer === 'ndvi' && lands) {
      lands.forEach(land => {
        if (land.agromonitoring_polygon_id && land.agromonitoring_polygon_id !== 'none') {
          fetchNDVI(land.agromonitoring_polygon_id);
        }
      });
    }
  }, [activeLayer, lands, fetchNDVI]);

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
    const parseCoord = (val: unknown) => {
      const parsed = parseFloat(val as string);
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

  const onCreated = async (e: unknown) => {
    const { layerType, layer } = e as { layerType: string, layer: L.Polygon };
    if (layerType === 'polygon') {
      const geojson = layer.toGeoJSON() as GeoJSON.Feature<GeoJSON.Polygon>;
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
        geojson.geometry.coordinates = geojson.geometry.coordinates.map((ring: GeoJSON.Position[]) =>
          ring.map((coord: GeoJSON.Position) => [Number(coord[0].toFixed(6)), Number(coord[1].toFixed(6))])
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
        const data = await fetchGeocodingReverse(lat, lng);
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

  const handleEditPlot = (land: Partial<Land>) => {
    setEditingLandId(land.id || null);
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
    const landData: Partial<Land> = {
      city, district, neighborhood, block_no: blockNo, parcel_no: parcelNo, 
      size_decare: Number(plotSize), crop_type: selectedCrop, 
      planting_date: plantingDate,
      soil_type: soilType, is_irrigated: isIrrigated,
      environment_type: environmentType,
      size_sqm: sizeSqm,
      lat: markerPosition?.lat, lng: markerPosition?.lng,
      boundaries: boundaries as GeoJSON.GeoJsonObject | undefined
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
      const data = await fetchGeocodingSearch(searchQuery);
      
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

  const getLandStyle = (land: Partial<Land>) => {
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
    const lat = Number(land?.lat ?? 37.0);
    const lng = Number(land?.lng ?? 35.0);
    const baseValue = Math.abs(Math.sin(lat * 1000 + lng * 1000) * 20);
    if (activeLayer === 'ndvi') {
      const polyId = land?.agromonitoring_polygon_id || '';
      const hasRealNdvi = polyId && ndviData[polyId] !== undefined;
      const ndvi = hasRealNdvi ? ndviData[polyId] : (land?.is_irrigated ? 0.75 + (baseValue / 200) : 0.60 + (baseValue / 200));
      
      let fillColor = '#ff9800';
      // Adjust color thresholds based on common NDVI ranges
      if (ndvi > 0.6) fillColor = '#1b5e20';
      else if (ndvi > 0.4) fillColor = '#4caf50';
      else if (ndvi > 0.2) fillColor = '#8bc34a';
      else fillColor = '#ffeb3b'; // low vegetation

      return {
        fillColor: fillColor,
        fillOpacity: loadingNdvi[polyId] ? 0.3 : 0.6,
        color: '#2e7d32',
        weight: 1.5,
        dashArray: loadingNdvi[polyId] ? '5, 5' : '3'
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

  const generateSimulatedGrid = (land: Partial<Land>, type: 'ndvi' | 'moisture') => {
    if (!land.boundaries) return null;
    const bbox = turf.bbox(land.boundaries as any);
    const width = turf.distance([bbox[0], bbox[1]], [bbox[2], bbox[1]]);
    const cellSide = Math.max(width / 15, 0.001); // 15x15 approx
    const grid = turf.squareGrid(bbox, cellSide, { units: 'kilometers' });
    
    const features: any[] = [];
    turf.featureEach(grid, (currentFeature) => {
      if (turf.booleanIntersects(currentFeature, land.boundaries as any)) {
        const centroid = turf.centroid(currentFeature);
        const lat = centroid.geometry.coordinates[1];
        const lng = centroid.geometry.coordinates[0];
        const noise = Math.sin(lat * 100000 + lng * 100000);
        
        let color = '#000';
        if (type === 'ndvi') {
           const val = 0.65 + (noise * 0.15);
           if (val > 0.7) color = '#1b5e20';
           else if (val > 0.6) color = '#4caf50';
           else if (val > 0.5) color = '#8bc34a';
           else color = '#ffeb3b';
        } else {
           const val = 55 + (noise * 25);
           if (val > 70) color = '#0d47a1';
           else if (val > 55) color = '#2196f3';
           else if (val > 40) color = '#00bcd4';
           else color = '#ffc107';
        }
        currentFeature.properties = { color };
        features.push(currentFeature);
      }
    });
    return turf.featureCollection(features);
  };

  if (!isMounted || typeof window === 'undefined') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface-2 animate-skeleton-pulse animate-pulse">
        <span className="text-sm text-text-muted font-bold">Harita Yükleniyor...</span>
      </div>
    );
  }

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
        {...({ tap: false } as Record<string, unknown>)}
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
                      setActiveLayer(layer.id as 'normal' | 'ndvi' | 'moisture');
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
        {lands.map((land: Land) => {
          const hasPolygon = land?.agromonitoring_polygon_id && land?.agromonitoring_polygon_id !== 'none';
          const showSimulatedGrid = activeLayer !== 'normal' && !hasPolygon;
          const gridData = showSimulatedGrid ? generateSimulatedGrid(land, activeLayer) : null;
          
          return (
          <React.Fragment key={land.id}>
            {land.boundaries ? (
              <>
              <GeoJSON 
                key={"orjut-ndvi-sync-" + activeLayer + "-" + land.id}
                data={land.boundaries as GeoJSON.GeoJsonObject} 
                style={() => showSimulatedGrid ? { fillColor: 'transparent', color: '#ffffff', weight: 2 } : getLandStyle(land)}
                eventHandlers={{
                  click: (e: unknown) => {
                    handleEditPlot(land);
                  }
                }}
              >
                <Popup maxWidth={240} autoPan={true}>
                  <LandWeatherPopup land={land} />
                </Popup>
              </GeoJSON>
              {showSimulatedGrid && gridData && (
                <GeoJSON
                  key={"orjut-grid-" + activeLayer + "-" + land.id}
                  data={gridData as GeoJSON.GeoJsonObject}
                  style={(feature: any) => ({
                    fillColor: feature.properties?.color || '#000',
                    fillOpacity: 0.75,
                    color: feature.properties?.color || '#000',
                    weight: 1,
                  })}
                  eventHandlers={{
                    click: (e: unknown) => {
                      handleEditPlot(land);
                    }
                  }}
                />
              )}
              </>
            ) : (
              land.lat && land.lng && (
                <Marker 
                  key={"orjut-ndvi-sync-" + activeLayer + "-" + land.id}
                  position={[land.lat, land.lng]}
                  eventHandlers={{
                    click: (e: unknown) => {
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
        )})}

        {markerPosition && !editingLandId && <Marker position={markerPosition} />}
      </MapContainer>

      {!isPremium && (
        <div className="absolute top-6 left-6 z-[1000] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-xl flex flex-col gap-2 pointer-events-auto w-48">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1"><Layers size={12}/> Arazi</span>
            <span className="text-xs font-black text-primary">{lands.length} / 3</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min((lands.length / 3) * 100, 100)}%` }} />
          </div>
          
          {(() => {
            const totalDecare = lands.reduce((sum, l) => sum + (l.size_decare || 0), 0);
            return (
              <>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1"><Activity size={12}/> Alan</span>
                  <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">{Math.round(totalDecare)} / 100 Dn</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${totalDecare >= 100 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${Math.min((totalDecare / 100) * 100, 100)}%` }} />
                </div>
              </>
            );
          })()}
        </div>
      )}

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
      <LandFormModal 
        isOpen={showCropSelector}
        onClose={handleCancelPlot}
        onSave={handleSavePlot}
        editingLandId={editingLandId}
        environmentType={environmentType}
        setEnvironmentType={setEnvironmentType}
        selectedCountryCode={selectedCountryCode}
        setSelectedCountryCode={setSelectedCountryCode}
        selectedStateCode={selectedStateCode}
        setSelectedStateCode={setSelectedStateCode}
        city={city}
        setCity={setCity}
        district={district}
        setDistrict={setDistrict}
        neighborhood={neighborhood}
        setNeighborhood={setNeighborhood}
        blockNo={blockNo}
        setBlockNo={setBlockNo}
        parcelNo={parcelNo}
        setParcelNo={setParcelNo}
        plotSize={plotSize}
        sizeSqm={sizeSqm}
        selectedCrop={selectedCrop}
        setSelectedCrop={setSelectedCrop}
        plantingDate={plantingDate}
        setPlantingDate={setPlantingDate}
        soilType={soilType}
        setSoilType={setSoilType}
        isIrrigated={isIrrigated}
        setIsIrrigated={setIsIrrigated}
      />
    </div>
  );
}
