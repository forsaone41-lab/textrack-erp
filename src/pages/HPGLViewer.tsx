import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, ZoomIn, ZoomOut, Maximize, Scissors, Expand, Shrink } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { PageLoader } from '../components/PageLoader';

export default function HPGLViewer() {
  const { isAr } = useLang();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [parsedData, setParsedData] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const parseHPGL = (text: string) => {
    let currentX = 0, currentY = 0;
    let isPenDown = false, isAbsolute = true;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const paths: {x: number, y: number}[][] = [];
    let currentPath: {x: number, y: number}[] = [];

    const updateBounds = (x: number, y: number) => {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    };

    const parseCoords = (str: string) => {
      return str.split(/[\s,]+/).map(s => parseFloat(s)).filter(n => !isNaN(n));
    };

    // Use regex to find all 2-letter commands and their arguments
    const regex = /([A-Z]{2})([^A-Za-z]*)/g;
    let match;
    const upperText = text.toUpperCase();

    while ((match = regex.exec(upperText)) !== null) {
      const cmd = match[1];
      const argsStr = match[2].trim().replace(/;+$/, '');
      const coords = parseCoords(argsStr);

      if (cmd === 'IN') {
         isAbsolute = true; isPenDown = false;
      } else if (cmd === 'PU') {
         isPenDown = false;
         if (currentPath.length > 0) { paths.push(currentPath); currentPath = []; }
         for (let i = 0; i < coords.length; i += 2) {
           currentX = isAbsolute ? coords[i] : currentX + coords[i];
           currentY = isAbsolute ? coords[i+1] : currentY + coords[i+1];
           updateBounds(currentX, currentY);
         }
      } else if (cmd === 'PD') {
         isPenDown = true;
         if (currentPath.length === 0) currentPath.push({x: currentX, y: currentY});
         for (let i = 0; i < coords.length; i += 2) {
             currentX = isAbsolute ? coords[i] : currentX + coords[i];
             currentY = isAbsolute ? coords[i+1] : currentY + coords[i+1];
             updateBounds(currentX, currentY);
             currentPath.push({x: currentX, y: currentY});
         }
      } else if (cmd === 'PA') {
         isAbsolute = true;
         for (let i = 0; i < coords.length; i += 2) {
             const prevX = currentX, prevY = currentY;
             currentX = coords[i]; currentY = coords[i+1];
             updateBounds(currentX, currentY);
             if (isPenDown) {
                 if (currentPath.length === 0) currentPath.push({x: prevX, y: prevY});
                 currentPath.push({x: currentX, y: currentY});
             } else {
                 if (currentPath.length > 0) { paths.push(currentPath); currentPath = []; }
             }
         }
      } else if (cmd === 'PR') {
         isAbsolute = false;
         for (let i = 0; i < coords.length; i += 2) {
             const prevX = currentX, prevY = currentY;
             currentX += coords[i]; currentY += coords[i+1];
             updateBounds(currentX, currentY);
             if (isPenDown) {
                 if (currentPath.length === 0) currentPath.push({x: prevX, y: prevY});
                 currentPath.push({x: currentX, y: currentY});
             } else {
                 if (currentPath.length > 0) { paths.push(currentPath); currentPath = []; }
             }
         }
      }
    }
    if (currentPath.length > 0) paths.push(currentPath);
    return { paths, minX, minY, maxX, maxY };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const data = parseHPGL(text);
      setParsedData(data);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setLoading(false);
    };
    reader.readAsText(f);
  };

  useEffect(() => {
    if (!parsedData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const { paths, minX, minY, maxX, maxY } = parsedData;
    if (paths.length === 0) return;

    // Calculate scale to fit
    const padding = 40;
    const modelWidth = maxX - minX || 1;
    const modelHeight = maxY - minY || 1;
    
    // HPGL origin is usually bottom-left, canvas is top-left
    const scaleX = (canvas.width - padding * 2) / modelWidth;
    const scaleY = (canvas.height - padding * 2) / modelHeight;
    const baseScale = Math.min(scaleX, scaleY);
    const scale = baseScale * zoom;

    ctx.save();
    
    // Center it + apply drag offset
    const cx = (canvas.width - modelWidth * scale) / 2 + offset.x;
    const cy = (canvas.height - modelHeight * scale) / 2 + offset.y;
    
    ctx.translate(cx, cy);
    
    ctx.beginPath();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5; // Stroke is in canvas pixels because coordinates are manually scaled
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    for (const path of paths) {
      if (path.length === 0) continue;
      // y is inverted in HPGL vs canvas typically
      ctx.moveTo((path[0].x - minX) * scale, (maxY - path[0].y) * scale);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo((path[i].x - minX) * scale, (maxY - path[i].y) * scale);
      }
    }
    ctx.stroke();
    ctx.restore();
    
  }, [parsedData, zoom, offset]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); };
  const handleMouseMove = (e: React.MouseEvent) => { if (isDragging) setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="space-y-6">
      <div className={`flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className={isAr ? 'text-right' : ''}>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
            {isAr ? "قارئ ملفات الفصالة (HPGL)" : "Visionneuse de Tracés (HPGL)"}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {isAr ? "افتح وعاين ملفات الباتروناج ومقاطع الفصالة مباشرة هنا" : "Visualisez vos fichiers de patronage et de placement directement ici"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] p-6 shadow-sm border-2 border-slate-50 flex flex-col items-center">
        {!parsedData ? (
          <div className="w-full max-w-xl py-20 px-8 border-2 border-dashed border-indigo-200 rounded-[24px] bg-indigo-50/30 text-center flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 mb-6">
               <Scissors className="w-8 h-8 text-indigo-600" />
             </div>
             <h3 className="text-xl font-black text-slate-900 mb-2">{isAr ? "قم برفع ملف الباتروناج" : "Importez votre fichier de tracé"}</h3>
             <p className="text-sm text-slate-500 font-medium mb-8">
               {isAr ? "يدعم صيغة .hpgl أو .plt الخاصة بآلات القص والطباعة" : "Supporte les formats .hpgl ou .plt pour traceurs"}
             </p>
             
             <label className="cursor-pointer bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all">
               {isAr ? "اختيار ملف" : "Choisir un fichier"}
               <input type="file" accept=".hpgl,.plt,.txt" className="hidden" onChange={handleFileUpload} />
             </label>
          </div>
        ) : (
          <div className={`w-full relative overflow-hidden bg-slate-50 transition-all ${isFullscreen ? 'fixed inset-0 z-[500] m-0 border-0 rounded-none' : 'rounded-[24px] border border-slate-200'}`}>
            {/* Toolbar */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
              <div className="bg-white/90 backdrop-blur pointer-events-auto px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">{file?.name}</span>
                </div>
                <div className="w-px h-4 bg-slate-200" />
                <span className="text-[11px] font-black text-indigo-600 tracking-wider">
                  {(((parsedData.maxX - parsedData.minX) * 0.025) / 1000).toFixed(2)}m × {(((parsedData.maxY - parsedData.minY) * 0.025) / 1000).toFixed(2)}m
                </span>
              </div>
              <div className="bg-white/90 backdrop-blur pointer-events-auto p-1.5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-1">
                <button onClick={() => setZoom(z => z * 1.2)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><ZoomIn className="w-4 h-4" /></button>
                <button onClick={() => setZoom(z => Math.max(0.1, z / 1.2))} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><ZoomOut className="w-4 h-4" /></button>
                <button onClick={() => { setZoom(1); setOffset({x:0, y:0}); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><Maximize className="w-4 h-4" /></button>
                <div className="w-px h-6 bg-slate-200 mx-1" />
                <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 hover:bg-slate-100 rounded-lg text-indigo-600">
                  {isFullscreen ? <Shrink className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
                </button>
                <label className="p-2 hover:bg-slate-100 rounded-lg text-indigo-600 cursor-pointer font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept=".hpgl,.plt" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>

            {/* Canvas Area */}
            <canvas 
              ref={canvasRef}
              width={1600}
              height={1000}
              className={`w-full cursor-move touch-none bg-white ${isFullscreen ? 'h-screen' : 'h-[70vh]'}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={(e) => {
                setZoom(z => Math.max(0.1, z - e.deltaY * 0.001));
              }}
            />
          </div>
        )}
        
        {loading && <PageLoader />}
      </div>
    </div>
  );
}
