'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppContext } from '@/context/AppContext';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { MapPin, X, Save, TreePine, Ruler, Search, Layers, Globe } from 'lucide-react';
import { WMSTileLayer, LayersControl } from 'react-leaflet';

// Fix Leaflet default icon issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CROP_TYPES = ['Buğday', 'Arpa', 'Mısır', 'Pamuk', 'Şeker Pancarı'];

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (latlng: L.LatLng) => void }) {
  const map = useMapEvents({
    click(e) {
      // Prevent click if clicking on a marker or other element
      if ((e.originalEvent.target as HTMLElement).classList.contains('leaflet-container')) {
        onLocationSelect(e.latlng);
      }
    },
  });
  return null;
}

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
  const { addLand, updateLand, lands } = useAppContext();
  const [markerPosition, setMarkerPosition] = useState<L.LatLng | null>(null);
  const [showCropSelector, setShowCropSelector] = useState(false);
  const [editingLandId, setEditingLandId] = useState<string | null>(null);
  
  // TKGM Fields
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [blockNo, setBlockNo] = useState('');
  const [parcelNo, setParcelNo] = useState('');
  const [plotSize, setPlotSize] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Effect to handle external edit request (from Edit button)
  useEffect(() => {
    if (editLand) {
      handleEditPlot(editLand);
    }
  }, [editLand]);

  const handleLocationSelect = (latlng: L.LatLng) => {
    // Check if clicking near an existing land (simple heuristic)
    // For now, assume a click on empty space is a NEW land.
    setEditingLandId(null);
    resetForm();
    setMarkerPosition(latlng);
    setShowCropSelector(true);
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
    if (land.lat && land.lng) {
      setMarkerPosition(new L.LatLng(land.lat, land.lng));
    }
    setShowCropSelector(true);
  };

  const resetForm = () => {
    setCity('');
    setDistrict('');
    setNeighborhood('');
    setBlockNo('');
    setParcelNo('');
    setPlotSize('');
    setSelectedCrop('');
  };

  const handleSavePlot = async () => {
    if (!selectedCrop || !plotSize || !city || !district) {
      toast.error("Lütfen tüm zorunlu alanları (İl, İlçe, Dönüm ve Ürün) doldurun.");
      return;
    }
    
    const landData: any = {
      city, district, neighborhood, block_no: blockNo, parcel_no: parcelNo, 
      size: plotSize, size_decare: Number(plotSize), crop_type: selectedCrop, 
      lat: markerPosition?.lat, lng: markerPosition?.lng
    };

    if (editingLandId) {
      landData.id = editingLandId;
      await updateLand(landData);
    } else {
      // Duplicate check (Ada/Parsel)
      const isDuplicate = lands.find(l => l.block_no === blockNo && l.parcel_no === parcelNo && l.city === city);
      if (isDuplicate) {
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

  return (
    <div className="relative w-full h-full group">
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
              className="w-full pl-11 pr-4 py-3 bg-white/90 backdrop-blur-md border border-zinc-200 rounded-2xl shadow-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm"
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
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Uydu Görünümü">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="Tapu Kadastro (Parsel)">
            <WMSTileLayer
              url="https://parselsorgu.tkgm.gov.tr/mapserver/services/WMS?"
              layers="parsel"
              format="image/png"
              transparent={true}
              attribution="&copy; TKGM"
            />
          </LayersControl.Overlay>
        </LayersControl>

        <MapClickHandler onLocationSelect={handleLocationSelect} />
        <MapController selectedLand={focusLand} />
        
        {/* Render markers for all saved lands */}
        {lands.map((land: any) => (
          land.lat && land.lng && (
            <Marker 
              key={land.id} 
              position={[land.lat, land.lng]}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e as any);
                  handleEditPlot(land);
                }
              }}
            />
          )
        ))}

        {markerPosition && !editingLandId && <Marker position={markerPosition} />}
      </MapContainer>

      {/* TKGM Crop & Size Selector */}
      {showCropSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[5000] flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col border border-zinc-100">
            {/* Header - Sticky */}
            <div className="p-6 border-b border-zinc-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-zinc-900 tracking-tight">
                    {editingLandId ? 'Araziyi Düzenle' : 'Yeni Arazi Tanımla'}
                  </h3>
                  <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mt-1">Tapu ve Ürün Bilgileri</p>
                </div>
                <button onClick={handleCancelPlot} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X size={20} className="text-zinc-400" />
                </button>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">İl</label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input type="text" className="w-full pl-10 pr-3 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-semibold" placeholder="Mardin" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">İlçe</label>
                  <input type="text" className="w-full px-3 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-semibold" placeholder="Kızıltepe" value={district} onChange={(e) => setDistrict(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Mahalle/Köy</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input type="text" className="w-full pl-10 pr-3 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-semibold" placeholder="Cumhuriyet Mah." value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Ada</label>
                  <input type="text" className="w-full px-3 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-semibold" placeholder="101" value={blockNo} onChange={(e) => setBlockNo(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Parsel</label>
                  <input type="text" className="w-full px-3 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-semibold" placeholder="42" value={parcelNo} onChange={(e) => setParcelNo(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Dönüm</label>
                  <div className="relative">
                    <Ruler size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-300" />
                    <input type="number" className="w-full px-3 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-semibold" placeholder="50" value={plotSize} onChange={(e) => setPlotSize(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Ekili Ürün</label>
                <div className="relative">
                  <TreePine size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <select className="w-full pl-10 pr-3 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-semibold appearance-none cursor-pointer" value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}>
                    <option value="" disabled>Ürün seçin...</option>
                    {CROP_TYPES.map(crop => <option key={crop} value={crop}>{crop}</option>)}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Layers size={14} className="text-zinc-300" />
                  </div>
                </div>
              </div>
              
              {/* Extra padding to ensure scroll reaches bottom for Save button */}
              <div className="h-12"></div>
            </div>

            {/* Footer - Sticky */}
            <div className="p-6 border-t border-zinc-50 bg-zinc-50/50 rounded-b-[2rem]">
              <div className="flex gap-3">
                <button onClick={handleCancelPlot} className="flex-1 py-3.5 text-zinc-500 font-bold bg-white border border-zinc-200 hover:bg-zinc-100 rounded-xl transition-all active:scale-[0.98]">İptal</button>
                <button 
                  onClick={handleSavePlot} 
                  disabled={!selectedCrop || !plotSize || !city || !district} 
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
