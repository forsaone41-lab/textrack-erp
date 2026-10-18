import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Upload, Image as ImageIcon, Download, Scissors, RefreshCw, 
  ZoomIn, ZoomOut, Maximize2, Check, Copy, Sliders, Layers, Eye, 
  FileText, Wand2, Info, ArrowRight, Settings, CheckCircle, AlertCircle,
  Move, ChevronRight
} from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import { 
  GarmentType, 
  SizingCategory, 
  GarmentMeasurements, 
  PatternPiece, 
  AiVisionAnalysisResult,
  STANDARD_MEASUREMENTS,
  generatePatternPieces,
  exportToIllustratorSVG,
  exportToDXF,
  analyzeGarmentImageWithAI,
  getHeuristicAnalysis
} from '../lib/patronageAiEngine';
import { jsPDF } from 'jspdf';

// Sample demonstration garments
const DEMO_GARMENTS: { type: GarmentType; labelAr: string; labelFr: string; image: string }[] = [
  {
    type: 'abaya',
    labelAr: 'عباية خليجية عصرية',
    labelFr: 'Abaya Moderne',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80'
  },
  {
    type: 'chemise',
    labelAr: 'قميص كلاسيكي قطني',
    labelFr: 'Chemise Regular',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80'
  },
  {
    type: 'tshirt',
    labelAr: 'تيشورت كاجوال ياقة دائرية',
    labelFr: 'T-Shirt Coton',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80'
  },
  {
    type: 'robe',
    labelAr: 'فستان صيفي إفازي',
    labelFr: 'Robe Évasée',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80'
  },
  {
    type: 'pantalon',
    labelAr: 'سروال شينو كلاسيك',
    labelFr: 'Pantalon Chino',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80'
  },
  {
    type: 'hoodie',
    labelAr: 'كابوتشو أوفرسايز',
    labelFr: 'Hoodie Streetwear',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80'
  },
  {
    type: 'caftan',
    labelAr: 'قفطان مغربي أنيق',
    labelFr: 'Caftan Marocain',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&auto=format&fit=crop&q=80'
  }
];

export default function PatronageAIStudio() {
  const { isAr } = useLang();

  // State
  const [selectedGarmentType, setSelectedGarmentType] = useState<GarmentType>('abaya');
  const [selectedSize, setSelectedSize] = useState<SizingCategory>('M');
  const [measurements, setMeasurements] = useState<GarmentMeasurements>(STANDARD_MEASUREMENTS['M']);
  const [patternPieces, setPatternPieces] = useState<PatternPiece[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AiVisionAnalysisResult | null>(null);

  const [uploadedImage, setUploadedImage] = useState<string | null>(DEMO_GARMENTS[0].image);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Canvas Studio view controls
  const [zoomLevel, setZoomLevel] = useState<number>(0.7);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedPieceId, setSelectedPieceId] = useState<string | 'all'>('all');
  const [showGrid, setShowGrid] = useState(true);
  const [showGrainLine, setShowGrainLine] = useState(true);
  const [showAnnotations, setShowAnnotations] = useState(true);

  // API Key management
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    const savedKey = localStorage.getItem('beya_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
    setApiKey(savedKey);

    // Initial load
    const initialAnalysis = getHeuristicAnalysis('abaya', 'M');
    setAnalysisResult(initialAnalysis);
    setMeasurements(initialAnalysis.measurements);
    setPatternPieces(initialAnalysis.patternPieces);
  }, []);

  // Recalculate pieces whenever measurements or garment type changes
  useEffect(() => {
    const pieces = generatePatternPieces(selectedGarmentType, measurements);
    setPatternPieces(pieces);
  }, [selectedGarmentType, measurements]);

  // Handle Size selection
  const handleSizeChange = (newSize: SizingCategory) => {
    setSelectedSize(newSize);
    if (newSize !== 'custom') {
      const base = STANDARD_MEASUREMENTS[newSize];
      setMeasurements({ ...base });
    }
  };

  // Handle measurement input
  const handleMeasurementChange = (field: keyof GarmentMeasurements, value: number) => {
    setSelectedSize('custom');
    setMeasurements(prev => ({
      ...prev,
      [field]: Math.max(0, value)
    }));
  };

  // Process uploaded image with AI Vision
  const processImage = async (dataUrl: string) => {
    setUploadedImage(dataUrl);
    setIsAnalyzing(true);

    try {
      if (apiKey && dataUrl.startsWith('data:')) {
        const mimeType = dataUrl.split(';')[0].split(':')[1];
        const base64Data = dataUrl.split(',')[1];
        const result = await analyzeGarmentImageWithAI(base64Data, mimeType, apiKey);
        setAnalysisResult(result);
        setSelectedGarmentType(result.garmentType);
        setSelectedSize(result.suggestedSize);
        setMeasurements(result.measurements);
        setPatternPieces(result.patternPieces);
      } else {
        // Fallback intelligent heuristic
        await new Promise(r => setTimeout(r, 600)); // smooth experience
        const result = getHeuristicAnalysis(selectedGarmentType, selectedSize);
        setAnalysisResult(result);
        setMeasurements(result.measurements);
        setPatternPieces(result.patternPieces);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      const fallback = getHeuristicAnalysis(selectedGarmentType, selectedSize);
      setAnalysisResult(fallback);
      setMeasurements(fallback.measurements);
      setPatternPieces(fallback.patternPieces);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      processImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Select demo garment
  const handleSelectDemo = (demo: typeof DEMO_GARMENTS[0]) => {
    setSelectedGarmentType(demo.type);
    setUploadedImage(demo.image);
    const result = getHeuristicAnalysis(demo.type, selectedSize);
    setAnalysisResult(result);
    setMeasurements(result.measurements);
    setPatternPieces(result.patternPieces);
  };

  // Export to Adobe Illustrator SVG
  const handleExportIllustrator = () => {
    const title = analysisResult?.titleFr || selectedGarmentType;
    const svgContent = exportToIllustratorSVG(patternPieces, title, measurements, selectedSize);

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `patron_${selectedGarmentType}_${selectedSize}_illustrator.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(isAr ? 'تم تحميل ملف SVG متوافق 100% مع Adobe Illustrator!' : 'Fichier SVG pour Illustrator téléchargé avec succès !');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  // Export to CAD DXF
  const handleExportDXF = () => {
    const title = analysisResult?.titleFr || selectedGarmentType;
    const dxfContent = exportToDXF(patternPieces, title);

    const blob = new Blob([dxfContent], { type: 'application/dxf;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `patron_${selectedGarmentType}_${selectedSize}_cad.dxf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(isAr ? 'تم تحميل ملف DXF متوافق مع برامج الكاد والمطلوة (Lectra / Gerber)!' : 'Fichier DXF pour CAO / Plotter téléchargé avec succès !');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  // Export to PDF Technical Sheet
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 297, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text(`BEYA CREATIVE - FICHE TECHNIQUE PATRONAGE & COUPE`, 15, 12);
      doc.setFontSize(10);
      doc.text(`Modèle: ${(analysisResult?.titleFr || selectedGarmentType).toUpperCase()} | Taille: ${selectedSize} | Date: ${new Date().toLocaleDateString('fr-FR')}`, 15, 19);

      // Measurements Summary
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.text(`1. TABLEAU DES MESURES (Barème en cm)`, 15, 35);

      const rows = [
        ['Tour de Poitrine', `${measurements.poitrine} cm`, 'Longueur Vêtement', `${measurements.longueurCorps} cm`],
        ['Tour de Taille', `${measurements.taille} cm`, 'Longueur Manche', `${measurements.longueurManche} cm`],
        ['Tour de Bassin', `${measurements.bassin} cm`, 'Tour de Bras', `${measurements.tourBras} cm`],
        ['Carrure / Épaules', `${measurements.carrure} cm`, 'Marge de Couture', `${measurements.valeurCouture} cm`]
      ];

      let yPos = 42;
      rows.forEach(r => {
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(`${r[0]}: `, 15, yPos);
        doc.setTextColor(15, 23, 42);
        doc.text(r[1], 55, yPos);
        doc.setTextColor(71, 85, 105);
        doc.text(`${r[2]}: `, 90, yPos);
        doc.setTextColor(15, 23, 42);
        doc.text(r[3], 135, yPos);
        yPos += 7;
      });

      // Pieces Summary
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(`2. NOMENCLATURE DES PIÈCES DU PATRON (${patternPieces.length} pièces)`, 15, yPos + 6);
      yPos += 14;

      patternPieces.forEach((p, idx) => {
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        doc.text(`${idx + 1}. ${p.nameFr} (${p.nameAr}) - Coupe: ${p.quantityFr} - Dim: ${p.widthCm} x ${p.heightCm} cm`, 15, yPos);
        yPos += 6;
      });

      // Notice for Illustrator
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(15, yPos + 5, 267, 30, 3, 3, 'F');
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.text(`Note Technique Atelier & CAO:`, 20, yPos + 13);
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Le fichier vectoriel .SVG correspondant est généré à l'échelle 1:1 pour ouverture et retouche directe dans Adobe Illustrator.`, 20, yPos + 20);
      doc.text(`Les calques sont séparés par pièce (Devant, Dos, Manches, Droit-fil) avec points d'ancrage et poignées de Bézier modifiables.`, 20, yPos + 26);

      doc.save(`fiche_technique_patron_${selectedGarmentType}_${selectedSize}.pdf`);
      setDownloadSuccess(isAr ? 'تم تحميل الفيش تكنيك بصيغة PDF بنجاح!' : 'Fiche technique PDF générée avec succès !');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  // Copy SVG Code
  const handleCopySVG = () => {
    const title = analysisResult?.titleFr || selectedGarmentType;
    const svgContent = exportToIllustratorSVG(patternPieces, title, measurements, selectedSize);
    navigator.clipboard.writeText(svgContent);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  // Save API key
  const handleSaveApiKey = () => {
    localStorage.setItem('beya_gemini_api_key', apiKey.trim());
    setShowApiKeyModal(false);
  };

  // Canvas Mouse Pan Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Filter pieces if single piece is selected
  const displayedPieces = selectedPieceId === 'all'
    ? patternPieces
    : patternPieces.filter(p => p.id === selectedPieceId);

  return (
    <div className={`min-h-screen bg-slate-950 text-white ${isAr ? 'rtl' : 'ltr'} pb-20`}>
      
      {/* ── Top Header Banner ── */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border-b border-indigo-500/20 px-6 py-6 sticky top-0 z-30 shadow-2xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                    {isAr ? 'استوديو الباترون بالذكاء الاصطناعي (AI)' : 'Patronage Studio AI'}
                  </h1>
                  <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-indigo-500/30 tracking-wider">
                    Illustrator ✦ CAD
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr 
                    ? 'حول صورة أي موديل لباطرون متكامل بالمقاييس مع إمكانية التعديل والتصدير لـ Adobe Illustrator'
                    : "Transformez n'importe quelle photo de vêtement en patron 2D vectoriel prêt à retoucher dans Adobe Illustrator"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition"
              title="Configurer Gemini API Key"
            >
              <Settings className="w-4 h-4 text-indigo-400" />
              <span>{apiKey ? 'API Configurée ✓' : 'Clé API Gemini'}</span>
            </button>

            <button
              onClick={handleExportIllustrator}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition-all duration-200 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تصدير لـ Adobe Illustrator (.SVG)' : 'Exporter pour Illustrator (.SVG)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success alert message */}
      {downloadSuccess && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-2xl flex items-center justify-between shadow-lg animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-sm font-semibold">{downloadSuccess}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left Column: Input Photo & AI Diagnostics (4 cols) ── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Upload & Photo Card */}
          <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <span>{isAr ? '1. صورة الموديل (Input)' : '1. Modèle Photo'}</span>
              </h2>
              {isAnalyzing && (
                <span className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {isAr ? 'جاري التحليل...' : 'Analyse en cours...'}
                </span>
              )}
            </div>

            {/* Image Preview Box */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-white/10 aspect-[4/3] group">
              {uploadedImage ? (
                <img
                  src={uploadedImage}
                  alt="Garment Preview"
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
                  <Upload className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-xs">{isAr ? 'قم برفع صورة الموديل هنا' : 'Déposez une photo de vêtement ici'}</p>
                </div>
              )}

              {/* Overlay Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition backdrop-blur-sm cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-white bg-slate-900/80 px-3 py-1 rounded-full">
                  {isAr ? 'تغيير الصورة' : 'Changer la photo'}
                </span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Quick Demo Models */}
            <div className="mt-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                {isAr ? 'أو اختر موديل تجريبي سريع:' : 'Ou choisissez un modèle exemple :'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {DEMO_GARMENTS.slice(0, 4).map(demo => (
                  <button
                    key={demo.type}
                    onClick={() => handleSelectDemo(demo)}
                    className={`p-1.5 rounded-xl border text-center transition ${
                      selectedGarmentType === demo.type
                        ? 'border-indigo-500 bg-indigo-500/20 text-white'
                        : 'border-white/5 bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-[10px] font-bold truncate">
                      {isAr ? demo.labelAr.split(' ')[0] : demo.labelFr.split(' ')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Analysis Diagnosis Card */}
          {analysisResult && (
            <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-fuchsia-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                    {isAr ? 'تشخيص الذكاء الاصطناعي' : 'Analyse IA & Stylisme'}
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {isAr ? 'نموذج جاهز' : 'Prêt à couper'}
                </span>
              </div>

              <div>
                <h4 className="text-base font-black text-white">
                  {isAr ? analysisResult.titleAr : analysisResult.titleFr}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {isAr ? analysisResult.descriptionAr : analysisResult.descriptionFr}
                </p>
              </div>

              {/* Detected Stylistic Features */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{isAr ? 'القصة:' : 'Coupe :'}</span>
                  <span className="font-bold text-indigo-300">{analysisResult.detectedFeatures.coupe}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{isAr ? 'الكول:' : 'Col :'}</span>
                  <span className="font-bold text-slate-200">{analysisResult.detectedFeatures.col}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{isAr ? 'الكمام:' : 'Manches :'}</span>
                  <span className="font-bold text-slate-200">{analysisResult.detectedFeatures.manches}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{isAr ? 'الثوب المنصوح به:' : 'Tissu conseillé :'}</span>
                  <span className="font-bold text-amber-300">
                    {isAr ? analysisResult.recommendedFabric.typeAr : analysisResult.recommendedFabric.typeFr}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{isAr ? 'استهلاك القماش:' : 'Consommation tissu :'}</span>
                  <span className="font-bold text-emerald-400">
                    {analysisResult.recommendedFabric.metrage}m (Laize 1.50m)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Illustrator Tips Card */}
          <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 font-black text-sm">
                Ai
              </div>
              <div className="text-xs space-y-1.5">
                <h4 className="font-black text-amber-300 uppercase tracking-wide">
                  {isAr ? 'كيفاش تعدل فـ Adobe Illustrator' : 'Modification dans Adobe Illustrator'}
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  {isAr
                    ? 'كتحمل ملف SVG، كتحلو مباشرة فـ Illustrator. غتلقى كل بياسة فـ Layer خاص بها، وكتستعمل أداة Plume (P) أولا السهم الأبيض Direct Selection (A) باش تحرك لي بوان كيف بغيتي.'
                    : "Téléchargez le fichier .SVG et ouvrez-le dans Illustrator : chaque pièce possède son propre calque modifiable avec l'outil Plume (P) ou Flèche Blanche (A)."}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ── Right Column: Interactive Pattern Studio & Canvas (8 cols) ── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Sizing & Measurement Tuner Bar */}
          <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
            
            {/* Standard Sizes Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>{isAr ? '2. المقاييس وجدول المقاسات' : '2. Barème & Mensurations'}</span>
                </h3>
              </div>

              {/* Sizes Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as SizingCategory[]).map(sz => (
                  <button
                    key={sz}
                    onClick={() => handleSizeChange(sz)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                      selectedSize === sz
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${selectedSize === 'custom' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-500'}`}>
                  {isAr ? 'مخصص' : 'Custom'}
                </span>
              </div>
            </div>

            {/* Measurement Tuning Inputs (Real-time live parametric recalculation) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  {isAr ? 'الصدر (Poitrine)' : 'Poitrine'} (cm)
                </label>
                <input
                  type="number"
                  value={measurements.poitrine}
                  onChange={e => handleMeasurementChange('poitrine', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  {isAr ? 'الخصر (Taille)' : 'Taille'} (cm)
                </label>
                <input
                  type="number"
                  value={measurements.taille}
                  onChange={e => handleMeasurementChange('taille', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  {isAr ? 'الورك (Bassin)' : 'Bassin'} (cm)
                </label>
                <input
                  type="number"
                  value={measurements.bassin}
                  onChange={e => handleMeasurementChange('bassin', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  {isAr ? 'الطول الإجمالي' : 'Longueur'} (cm)
                </label>
                <input
                  type="number"
                  value={measurements.longueurCorps}
                  onChange={e => handleMeasurementChange('longueurCorps', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  {isAr ? 'طول الكم' : 'Long. Manche'} (cm)
                </label>
                <input
                  type="number"
                  value={measurements.longueurManche}
                  onChange={e => handleMeasurementChange('longueurManche', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  {isAr ? 'الكتف / Carrure' : 'Carrure'} (cm)
                </label>
                <input
                  type="number"
                  value={measurements.carrure}
                  onChange={e => handleMeasurementChange('carrure', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  {isAr ? 'الاتساع (Aisance)' : 'Aisance'} (cm)
                </label>
                <input
                  type="number"
                  value={measurements.aisance}
                  onChange={e => handleMeasurementChange('aisance', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  {isAr ? 'حق الخياطة (Couture)' : 'Marge couture'} (cm)
                </label>
                <select
                  value={measurements.valeurCouture}
                  onChange={e => handleMeasurementChange('valeurCouture', parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:border-indigo-500 outline-none"
                >
                  <option value={0}>0 cm (Sans marge)</option>
                  <option value={1}>1.0 cm (Standard)</option>
                  <option value={1.5}>1.5 cm (Confort)</option>
                  <option value={2}>2.0 cm (Ourlet large)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interactive Pattern Studio Canvas Card */}
          <div className="bg-slate-900/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Canvas Toolbar */}
            <div className="bg-slate-950 border-b border-white/10 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
              
              {/* Piece Selector Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
                <button
                  onClick={() => setSelectedPieceId('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    selectedPieceId === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {isAr ? 'كل القطع (Planche Complète)' : 'Toutes les pièces'}
                </button>
                {patternPieces.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPieceId(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                      selectedPieceId === p.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span>{isAr ? p.nameAr.split(' ')[0] : p.nameFr.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Zoom & View Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-2 rounded-xl border text-xs transition ${showGrid ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'border-white/10 text-slate-400 hover:bg-slate-800'}`}
                  title={isAr ? 'إظهار / إخفاء الشبكة' : 'Grille'}
                >
                  #
                </button>
                <button
                  onClick={() => setShowGrainLine(!showGrainLine)}
                  className={`p-2 rounded-xl border text-xs transition ${showGrainLine ? 'bg-red-500/20 border-red-500 text-red-300' : 'border-white/10 text-slate-400 hover:bg-slate-800'}`}
                  title={isAr ? 'إظهار خط اتجاه النسيج (Droit-fil)' : 'Droit-fil'}
                >
                  ⭥
                </button>
                <button
                  onClick={() => setZoomLevel(z => Math.max(0.3, z - 0.1))}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-slate-400 px-1">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel(z => Math.min(2.5, z + 0.1))}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setZoomLevel(0.7); setPanOffset({ x: 20, y: 20 }); }}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
                  title="Reset Canvas"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive SVG Pattern Canvas */}
            <div
              ref={svgContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="relative w-full h-[520px] bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing select-none"
            >
              {/* Pan & Drag instructions badge */}
              <div className="absolute bottom-3 left-3 z-10 bg-slate-900/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-[11px] text-slate-400 flex items-center gap-2 pointer-events-none">
                <Move className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isAr ? 'اسحب بالماوس لتحريك الباترون، واستعمل الزوم للتكبير' : 'Cliquez et glissez pour déplacer la planche'}</span>
              </div>

              {/* The SVG Canvas Element */}
              <svg
                width="100%"
                height="100%"
                className="w-full h-full"
              >
                <defs>
                  {/* Grid pattern */}
                  <pattern id="canvas-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                  </pattern>
                </defs>

                {/* Background Grid */}
                {showGrid && <rect width="100%" height="100%" fill="url(#canvas-grid)" />}

                {/* Transformed Pattern Elements */}
                <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
                  
                  {/* Fabric Sheet Boundary (Simulates 1.50m laize roll) */}
                  <rect
                    x="0"
                    y="0"
                    width="1800"
                    height="1600"
                    fill="none"
                    stroke="rgba(99, 102, 241, 0.25)"
                    strokeWidth="2"
                    strokeDasharray="8 8"
                    rx="10"
                  />
                  <text x="10" y="-10" fill="rgba(99, 102, 241, 0.6)" fontSize="14" fontWeight="bold">
                    LAIZE DU TISSU: 150 CM (ÉCHELLE 1:1)
                  </text>

                  {/* Render Pattern Pieces */}
                  {displayedPieces.map(piece => (
                    <g
                      key={piece.id}
                      transform={`translate(${piece.x * 10}, ${piece.y * 10})`}
                      className="transition-opacity duration-200"
                    >
                      {/* Piece Body / Cutting Path */}
                      <path
                        d={piece.cutPath.split(' ').map(token => {
                          const n = parseFloat(token);
                          return isNaN(n) ? token : (n * 10).toFixed(1);
                        }).join(' ')}
                        fill="rgba(30, 41, 59, 0.7)"
                        stroke={piece.color}
                        strokeWidth="3"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        className="hover:fill-slate-800/90 transition-colors"
                      />

                      {/* Grainline (Droit fil ⭥) */}
                      {showGrainLine && (
                        <g stroke="#ef4444" strokeWidth="2">
                          <line
                            x1={piece.grainLine.x1 * 10}
                            y1={piece.grainLine.y1 * 10}
                            x2={piece.grainLine.x2 * 10}
                            y2={piece.grainLine.y2 * 10}
                          />
                          <circle cx={piece.grainLine.x1 * 10} cy={piece.grainLine.y1 * 10} r="4" fill="#ef4444" />
                          <circle cx={piece.grainLine.x2 * 10} cy={piece.grainLine.y2 * 10} r="4" fill="#ef4444" />
                          <text
                            x={piece.grainLine.x1 * 10 + 10}
                            y={(piece.grainLine.y1 + piece.grainLine.y2) * 5}
                            fill="#ef4444"
                            fontSize="12"
                            fontWeight="bold"
                          >
                            DROIT FIL ⭥
                          </text>
                        </g>
                      )}

                      {/* Notches */}
                      {piece.notches.map((notch, idx) => (
                        <g key={idx}>
                          <circle cx={notch.x * 10} cy={notch.y * 10} r="4" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
                          <text x={notch.x * 10 + 8} y={notch.y * 10 + 4} fill="#fda4af" fontSize="11" fontWeight="bold">
                            {notch.label}
                          </text>
                        </g>
                      ))}

                      {/* Piece Title & Cutting Instructions Badge */}
                      <g transform="translate(20, 35)">
                        <rect x="0" y="0" width="220" height="70" rx="8" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                        <text x="12" y="24" fill="#ffffff" fontSize="15" fontWeight="bold">
                          {piece.nameFr}
                        </text>
                        <text x="12" y="44" fill={piece.color} fontSize="12" fontWeight="bold">
                          {piece.nameAr} - {piece.quantityFr}
                        </text>
                        <text x="12" y="60" fill="#94a3b8" fontSize="10">
                          {piece.widthCm}cm x {piece.heightCm}cm | VC: {measurements.valeurCouture}cm
                        </text>
                      </g>

                      {/* Dimension labels */}
                      {showAnnotations && piece.annotations.map((ann, idx) => (
                        <text
                          key={idx}
                          x={ann.x * 10}
                          y={ann.y * 10}
                          fill="#ffffff"
                          fontSize={ann.size ? ann.size + 2 : 13}
                          fontWeight="bold"
                        >
                          {ann.text}
                        </text>
                      ))}
                    </g>
                  ))}
                </g>
              </svg>
            </div>

            {/* Bottom Export Actions Footer */}
            <div className="bg-slate-950 border-t border-white/10 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                <span className="font-bold text-white">{patternPieces.length} pièces</span> générées | 
                Format vectoriel SVG calqué pour <strong className="text-amber-400">Adobe Illustrator</strong> et traceurs de coupe.
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Copy SVG code */}
                <button
                  onClick={handleCopySVG}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  title="Copier le code SVG"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? (isAr ? 'تم النسخ!' : 'Copié !') : (isAr ? 'نسخ كود SVG' : 'Copier SVG')}</span>
                </button>

                {/* PDF Fiche Technique */}
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  <FileText className="w-4 h-4 text-rose-400" />
                  <span>{isAr ? 'فيش تكنيك (PDF)' : 'Fiche Tech (PDF)'}</span>
                </button>

                {/* CAD DXF */}
                <button
                  onClick={handleExportDXF}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  <Scissors className="w-4 h-4 text-cyan-400" />
                  <span>DXF (CAD / Plotter)</span>
                </button>

                {/* Main Illustrator SVG */}
                <button
                  onClick={handleExportIllustrator}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black shadow-xl shadow-amber-500/20 transition active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>{isAr ? 'تحميل لـ Adobe Illustrator (.SVG)' : 'Télécharger (.SVG Illustrator)'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ── Modal Gemini API Key Configuration ── */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <span>{isAr ? 'إعداد مفتاح Gemini API' : 'Clé API Gemini Vision'}</span>
              </h3>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isAr
                ? 'أدخل مفتاح Google Gemini API لتشغيل التحليل التلقائي الحقيقي لأي صورة موديل يتم رفعها.'
                : "Entrez votre clé API Google Gemini pour activer l'analyse visuelle IA en direct des photos importées."}
            </p>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Gemini API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
              >
                {isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30"
              >
                {isAr ? 'حفظ وتفعيل' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
