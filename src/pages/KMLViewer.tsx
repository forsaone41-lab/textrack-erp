import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, FileText, ZoomIn, ZoomOut, Maximize, Globe, MapPin, 
  Layers, Download, Search, CheckSquare, Square, Eye, EyeOff, 
  Expand, Shrink, Compass, Info, CheckCircle, AlertCircle 
} from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { PageLoader } from '../components/PageLoader';

interface PlacemarkItem {
  id: string;
  name: string;
  description: string;
  type: 'Point' | 'LineString' | 'Polygon' | 'MultiGeometry';
  coordinates: { x: number; y: number; z?: number }[];
  visible: boolean;
  color?: string;
}

export default function KMLViewer() {
  const { isAr } = useLang();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [placemarks, setPlacemarks] = useState<PlacemarkItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<PlacemarkItem | null>(null);
  const [bounds, setBounds] = useState<{ minX: number; minY: number; maxX: number; maxY: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const colors = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#06b6d4', '#ec4899', '#3b82f6', '#14b8a6', '#f97316'
  ];

  const parseKML = (text: string) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const items: PlacemarkItem[] = [];

    const placemarkNodes = xmlDoc.getElementsByTagName('Placemark');
    
    const updateBounds = (x: number, y: number) => {
      if (!isNaN(x) && !isNaN(y)) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    };

    const parseCoordinatesString = (str: string): { x: number; y: number; z?: number }[] => {
      if (!str) return [];
      const tuples = str.trim().split(/[\s\n\r]+/);
      const coords: { x: number; y: number; z?: number }[] = [];
      for (const tuple of tuples) {
        const parts = tuple.split(',').map(s => parseFloat(s.trim()));
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          coords.push({
            x: parts[0], // Longitude / X
            y: parts[1], // Latitude / Y
            z: parts[2]
          });
          updateBounds(parts[0], parts[1]);
        }
      }
      return coords;
    };

    for (let i = 0; i < placemarkNodes.length; i++) {
      const node = placemarkNodes[i];
      const nameNode = node.getElementsByTagName('name')[0];
      const descNode = node.getElementsByTagName('description')[0];
      const name = nameNode ? nameNode.textContent || `Placemark ${i + 1}` : `Placemark ${i + 1}`;
      const description = descNode ? descNode.textContent || '' : '';

      // Check geometry type
      let type: PlacemarkItem['type'] = 'Point';
      let coords: { x: number; y: number; z?: number }[] = [];

      const pointNode = node.getElementsByTagName('Point')[0];
      const lineNode = node.getElementsByTagName('LineString')[0];
      const polyNode = node.getElementsByTagName('Polygon')[0];

      if (pointNode) {
        type = 'Point';
        const cNode = pointNode.getElementsByTagName('coordinates')[0];
        if (cNode && cNode.textContent) coords = parseCoordinatesString(cNode.textContent);
      } else if (lineNode) {
        type = 'LineString';
        const cNode = lineNode.getElementsByTagName('coordinates')[0];
        if (cNode && cNode.textContent) coords = parseCoordinatesString(cNode.textContent);
      } else if (polyNode) {
        type = 'Polygon';
        const cNode = polyNode.getElementsByTagName('coordinates')[0];
        if (cNode && cNode.textContent) coords = parseCoordinatesString(cNode.textContent);
      }

      if (coords.length > 0) {
        items.push({
          id: `pm-${i}-${Date.now()}`,
          name,
          description,
          type,
          coordinates: coords,
          visible: true,
          color: colors[i % colors.length]
        });
      }
    }

    if (minX === Infinity || minY === Infinity) {
      // Fallback bounds
      minX = 0; minY = 0; maxX = 100; maxY = 100;
    }

    return { items, minX, minY, maxX, maxY };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const result = parseKML(text);
        setPlacemarks(result.items);
        setBounds({
          minX: result.minX,
          minY: result.minY,
          maxX: result.maxX,
          maxY: result.maxY
        });
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        if (result.items.length > 0) {
          setSelectedItem(result.items[0]);
        }
      } catch (err) {
        console.error('Error parsing KML:', err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(f);
  };

  useEffect(() => {
    if (!bounds || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 50;
    const modelWidth = (bounds.maxX - bounds.minX) || 1;
    const modelHeight = (bounds.maxY - bounds.minY) || 1;

    const scaleX = (canvas.width - padding * 2) / modelWidth;
    const scaleY = (canvas.height - padding * 2) / modelHeight;
    const baseScale = Math.min(scaleX, scaleY);
    const scale = baseScale * zoom;

    ctx.save();
    const cx = (canvas.width - modelWidth * scale) / 2 + offset.x;
    const cy = (canvas.height - modelHeight * scale) / 2 + offset.y;
    ctx.translate(cx, cy);

    // Draw grid lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const gx = i * (modelWidth / 10) * scale;
      const gy = i * (modelHeight / 10) * scale;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, modelHeight * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(modelWidth * scale, gy);
      ctx.stroke();
    }

    // Render placemarks
    for (const item of placemarks) {
      if (!item.visible || item.coordinates.length === 0) continue;

      const isSelected = selectedItem?.id === item.id;
      ctx.strokeStyle = item.color || '#6366f1';
      ctx.fillStyle = (item.color || '#6366f1') + '20';
      ctx.lineWidth = isSelected ? 3 : 2;

      if (item.type === 'Point') {
        const pt = item.coordinates[0];
        const px = (pt.x - bounds.minX) * scale;
        // Invert Y for cartesian / lat display
        const py = (bounds.maxY - pt.y) * scale;

        ctx.beginPath();
        ctx.arc(px, py, isSelected ? 8 : 6, 0, Math.PI * 2);
        ctx.fillStyle = item.color || '#6366f1';
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = '#0f172a';
        ctx.font = isSelected ? 'bold 12px sans-serif' : '10px sans-serif';
        ctx.fillText(item.name, px + 10, py + 4);
      } else if (item.type === 'LineString' || item.type === 'Polygon') {
        ctx.beginPath();
        const start = item.coordinates[0];
        ctx.moveTo((start.x - bounds.minX) * scale, (bounds.maxY - start.y) * scale);
        for (let i = 1; i < item.coordinates.length; i++) {
          const pt = item.coordinates[i];
          ctx.lineTo((pt.x - bounds.minX) * scale, (bounds.maxY - pt.y) * scale);
        }
        if (item.type === 'Polygon') {
          ctx.closePath();
          ctx.fill();
        }
        ctx.stroke();

        // Label at centroid
        if (item.coordinates.length > 0) {
          const avgX = item.coordinates.reduce((acc, c) => acc + c.x, 0) / item.coordinates.length;
          const avgY = item.coordinates.reduce((acc, c) => acc + c.y, 0) / item.coordinates.length;
          const px = (avgX - bounds.minX) * scale;
          const py = (bounds.maxY - avgY) * scale;
          ctx.fillStyle = '#0f172a';
          ctx.font = isSelected ? 'bold 12px sans-serif' : '10px sans-serif';
          ctx.fillText(item.name, px, py);
        }
      }
    }

    ctx.restore();
  }, [placemarks, bounds, zoom, offset, selectedItem]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };
  const handleMouseUp = () => setIsDragging(false);

  const toggleVisibility = (id: string) => {
    setPlacemarks(prev => prev.map(p => p.id === id ? { ...p, visible: !p.visible } : p));
  };

  const toggleAll = (visible: boolean) => {
    setPlacemarks(prev => prev.map(p => ({ ...p, visible })));
  };

  const exportGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: placemarks.map(p => ({
        type: 'Feature',
        properties: {
          name: p.name,
          description: p.description,
          color: p.color
        },
        geometry: {
          type: p.type === 'Point' ? 'Point' : p.type === 'LineString' ? 'LineString' : 'Polygon',
          coordinates: p.type === 'Point' 
            ? [p.coordinates[0].x, p.coordinates[0].y]
            : p.coordinates.map(c => [c.x, c.y])
        }
      }))
    };
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name || 'export'}.geojson`;
    a.click();
  };

  const filteredPlacemarks = placemarks.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className={`flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className={isAr ? 'text-right' : ''}>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
            <Globe className="w-7 h-7 text-indigo-600" />
            {isAr ? "قارئ ملفات KML والخرائط الجغرافية" : "Visionneuse KML & Données Spatiales"}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {isAr ? "قم بتحليل واستعراض ملفات KML، نقاط المواقع، ومقاطع الباتروناج بدقة عالية" : "Analysez et visualisez vos fichiers KML, géolocalisations et polygones de tracé en haute précision"}
          </p>
        </div>
        {placemarks.length > 0 && (
          <button
            onClick={exportGeoJSON}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all text-xs uppercase tracking-wider"
          >
            <Download className="w-4 h-4" />
            {isAr ? "تصدير GeoJSON" : "Exporter GeoJSON"}
          </button>
        )}
      </div>

      <div className="bg-white rounded-[32px] p-6 shadow-sm border-2 border-slate-50">
        {placemarks.length === 0 ? (
          <div className="w-full py-20 px-8 border-2 border-dashed border-indigo-200 rounded-[24px] bg-indigo-50/30 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 mb-6">
              <MapPin className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              {isAr ? "قم برفع ملف KML / XML" : "Importez votre fichier KML / XML"}
            </h3>
            <p className="text-sm text-slate-500 font-medium mb-8">
              {isAr ? "يدعم ملفات Keyhole Markup Language (.kml) وملفات الباترون المتوافقة" : "Prend en charge les formats .kml, données spatiales et polygones"}
            </p>
            <label className="cursor-pointer bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all">
              {isAr ? "اختيار ملف KML" : "Choisir un fichier KML"}
              <input type="file" accept=".kml,.xml,.txt" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        ) : (
          <div className={`grid grid-cols-1 lg:grid-cols-4 gap-6 ${isAr ? 'lg:grid-flow-col-dense' : ''}`}>
            {/* Left Sidebar: Layers / Placemarks List */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-[24px] p-4 flex flex-col h-[650px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  {isAr ? "الطبقات والنقاط" : "Calques & Points"} ({placemarks.length})
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleAll(true)}
                    className="p-1.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold"
                    title={isAr ? "إظهار الكل" : "Tout afficher"}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleAll(false)}
                    className="p-1.5 text-xs text-slate-400 hover:bg-slate-100 rounded-lg font-bold"
                    title={isAr ? "إخفاء الكل" : "Tout masquer"}
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? "بحث في النقاط..." : "Rechercher un point..."}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              {/* Placemarks List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredPlacemarks.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">
                            {item.type} ({item.coordinates.length} pts)
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVisibility(item.id);
                        }}
                        className="text-slate-400 hover:text-indigo-600 p-1 shrink-0"
                      >
                        {item.visible ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Selected Item Details */}
              {selectedItem && (
                <div className="mt-4 pt-4 border-t border-slate-200 text-xs">
                  <h4 className="font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-600" />
                    {isAr ? "تفاصيل العنصر المحدد" : "Détails de l'élément"}
                  </h4>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                    <p className="font-bold text-slate-900">{selectedItem.name}</p>
                    {selectedItem.description && (
                      <p className="text-[11px] text-slate-600 leading-relaxed">{selectedItem.description}</p>
                    )}
                    <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>{isAr ? 'الإحداثيات' : 'Points'}: {selectedItem.coordinates.length}</span>
                      <span>{selectedItem.type}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Canvas: Map / Plotter */}
            <div className="lg:col-span-3 relative overflow-hidden bg-white border border-slate-200 rounded-[24px] flex flex-col h-[650px]">
              {/* Toolbar Overlay */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
                <div className="bg-white/95 backdrop-blur pointer-events-auto px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700 max-w-[180px] truncate">{file?.name}</span>
                  </div>
                  <div className="w-px h-4 bg-slate-200" />
                  {bounds && (
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600">
                      <span>X: {bounds.minX.toFixed(2)} .. {bounds.maxX.toFixed(2)}</span>
                      <span>|</span>
                      <span>Y: {bounds.minY.toFixed(2)} .. {bounds.maxY.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="bg-white/95 backdrop-blur pointer-events-auto p-1.5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-1">
                  <button onClick={() => setZoom(z => z * 1.25)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600" title={isAr ? "تكبير" : "Zoom In"}>
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button onClick={() => setZoom(z => Math.max(0.1, z / 1.25))} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600" title={isAr ? "تصغير" : "Zoom Out"}>
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600" title={isAr ? "إعادة ضبط" : "Reset View"}>
                    <Maximize className="w-4 h-4" />
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-1" />
                  <label className="p-2 hover:bg-slate-100 rounded-lg text-indigo-600 cursor-pointer font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">{isAr ? "ملف آخر" : "Changer"}</span>
                    <input type="file" accept=".kml,.xml,.txt" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>

              {/* Canvas Area */}
              <canvas
                ref={canvasRef}
                width={1600}
                height={1000}
                className="w-full h-full cursor-move touch-none bg-slate-50/50"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={(e) => {
                  setZoom(z => Math.max(0.1, z - e.deltaY * 0.001));
                }}
              />
            </div>
          </div>
        )}

        {loading && <PageLoader />}
      </div>
    </div>
  );
}
