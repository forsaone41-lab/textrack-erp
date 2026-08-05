const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/AISpace.tsx');
let content = fs.readFileSync(filePath, 'utf8');

let returnStartIdx = content.indexOf('  const activePiece = analysisResult?.pieces');
if (returnStartIdx === -1) {
  returnStartIdx = content.indexOf('  return (');
}
if (returnStartIdx === -1) {
  console.error("Could not find start of return block");
  process.exit(1);
}

const lastBraceIdx = content.lastIndexOf('}');
if (lastBraceIdx === -1 || lastBraceIdx <= returnStartIdx) {
  console.error("Could not find end of function");
  process.exit(1);
}

const newReturnBlock = `  const activePiece = analysisResult?.pieces?.[activePieceIdx] || null;
  const currentFabricSuggested = activePiece?.fabricSuggested || analysisResult?.fabricSuggested || '';
  const fabInfo = getFabricInfo(currentFabricSuggested);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-7xl mx-auto px-4 pb-4 overflow-hidden select-none">
      {/* Compact Header Bar */}
      <div className={\`flex items-center justify-between gap-4 py-2 border-b border-slate-100 flex-shrink-0 \${isAr ? 'flex-row-reverse' : ''}\`}>
        <div className={\`flex items-center gap-3 \${isAr ? 'flex-row-reverse text-right' : ''}\`}>
          {onClose && (
            <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className={\`flex items-center gap-2 \${isAr ? 'flex-row-reverse' : ''}\`}>
              <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">BEYA <span className="text-indigo-600 not-italic">TACTICAL HUD</span></h1>
              <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-widest">v2.1 Zero-Scroll</span>
            </div>
            <p className="text-[11px] text-slate-500 font-bold">{isAr ? 'المستشار الذكي لتحليل وتفصيل ومقاسات الموديل (شاشة موحدة بدون تمرير)' : 'Cockpit d\\'Analyse Textile & Confection (Zéro Scroll)'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLeadsModal(true)}
            className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3.5 py-2 rounded-xl font-black text-xs uppercase hover:bg-indigo-100 transition-all shadow-sm"
          >
            <Package className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{isAr ? 'اختيار من الطلبات' : 'Demandes Prospects'}</span>
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 bg-indigo-600 text-white px-3.5 py-2 rounded-xl font-black text-xs uppercase hover:bg-indigo-700 transition-all shadow-sm">
            <Upload className="w-3.5 h-3.5" /> <span>{isAr ? 'رفع صورة' : 'Uploader Image'}</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
        </div>
      </div>

      {/* Main 2-Column Cockpit Grid (Zero-Scroll) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-hidden mt-3">
        
        {/* LEFT COLUMN: Photo Cockpit & One-Click Dispatch Engine (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-4 overflow-hidden h-full">
          {/* Photo Cockpit Box */}
          <div className="flex-1 bg-slate-900 rounded-3xl overflow-hidden relative flex flex-col min-h-0 shadow-lg border border-slate-800 group">
            {!image ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-700 rounded-3xl hover:border-indigo-400 hover:text-indigo-300 transition-all cursor-pointer p-6 text-center" onClick={() => fileInputRef.current?.click()}>
                <Camera className="w-12 h-12 mb-3 text-indigo-400" />
                <p className="font-black text-xs uppercase tracking-wider">{isAr ? 'اضغط لرفع صورة الموديل أو التصميم' : 'Cliquez pour uploader le modèle'}</p>
                <p className="text-[10px] text-slate-500 mt-1">{isAr ? 'يدعم الصور عالية الدقة (JPG, PNG)' : 'JPG, PNG haute résolution'}</p>
              </div>
            ) : (
              <div className="flex-1 relative rounded-3xl overflow-hidden bg-slate-950/80 flex items-center justify-center">
                <img src={image} className="w-full h-full object-contain max-h-[320px]" alt="Model" />
                <button onClick={() => setShowFullImage(true)} className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-xl text-slate-700 hover:bg-white hover:scale-105 transition-all shadow-md border border-slate-100" title={isAr ? 'تكبير الصورة' : 'Agrandir'}>
                  <Eye className="w-4 h-4" />
                </button>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => setImage(null)} className="bg-white/90 p-3 rounded-xl text-rose-600 hover:bg-white transition-all shadow-xl" title="حذف الصورة"><RefreshCw className="w-5 h-5" /></button>
                  {!analysisResult && <button onClick={startAnalysis} className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-black text-xs uppercase shadow-xl flex items-center gap-2 hover:bg-indigo-700"><Sparkles className="w-4 h-4" /> {isAr ? 'بدء التحليل الفوري' : 'Lancer l\\'analyse'}</button>}
                </div>
                {analyzing && (
                  <div className="absolute inset-0 bg-indigo-900/80 backdrop-blur-md flex flex-col items-center justify-center text-white z-20">
                    <RefreshCw className="w-10 h-10 animate-spin mb-3" />
                    <p className="font-black text-sm uppercase tracking-tight animate-pulse">{isAr ? 'جاري تحليل الأثواب والمقاسات...' : 'Analyse des tissus...'}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ONE-CLICK DISPATCH ENGINE (محرك التوزيع الفوري) */}
          <div className="flex-shrink-0 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className={\`flex items-center justify-between \${isAr ? 'flex-row-reverse' : ''}\`}>
              <div className={\`flex items-center gap-2 \${isAr ? 'flex-row-reverse text-right' : ''}\`}>
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-xs text-slate-800">{isAr ? 'توزيع بيانات التحليل فورا (One-Click Dispatch)' : 'Engine de Distribution Rapide'}</h4>
                  <p className="text-[10px] text-slate-400 font-bold">{isAr ? 'أرسل المقاسات والثوب للأدوات بضغطة زر واحدة' : 'Export direct vers les modules de production'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (analysisResult) {
                    sendToDevis(analysisResult.rawAnalysis || JSON.stringify(analysisResult));
                  } else {
                    alert(isAr ? 'يرجى تحليل موديل أولاً!' : 'Veuillez analyser un modèle d\\'abord !');
                  }
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/60 text-emerald-700 rounded-xl font-black text-xs transition-all shadow-sm group"
              >
                <DollarSign className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>{isAr ? 'تسعير Devis PRO' : 'Devis PRO'}</span>
              </button>

              <button
                onClick={() => {
                  if (analysisResult) {
                    exportToFicheTechnique();
                  } else {
                    alert(isAr ? 'يرجى تحليل موديل أولاً!' : 'Veuillez analyser un modèle d\\'abord !');
                  }
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/60 text-indigo-700 rounded-xl font-black text-xs transition-all shadow-sm group"
              >
                <FileText className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>{isAr ? 'البطاقة التقنية' : 'Fiche Technique'}</span>
              </button>

              <button
                onClick={() => {
                  if (analysisResult) {
                    const atelierData = {
                      modelName: analysisResult.category || 'Moudel',
                      tissuMetrage: analysisResult.consumption || '2.0m',
                      complexity: analysisResult.complexity || 'Moyenne',
                      prixEstimation: analysisResult.costEstimate || '150 MAD',
                      timestamp: Date.now()
                    };
                    localStorage.setItem('beya_atelier_import', JSON.stringify(atelierData));
                    alert(isAr ? '✅ تم إرسال البيانات إلى الورشة (Atelier)' : '✅ Envoyé à l\\'Atelier');
                  } else {
                    alert(isAr ? 'يرجى تحليل موديل أولاً!' : 'Veuillez analyser un modèle d\\'abord !');
                  }
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/60 text-amber-800 rounded-xl font-black text-xs transition-all shadow-sm group"
              >
                <Scissors className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>{isAr ? 'إرسال للورشة Atelier' : 'Atelier Production'}</span>
              </button>

              <button
                onClick={() => {
                  if (analysisResult) {
                    const achData = {
                      tissuSuggested: currentFabricSuggested || analysisResult.fabricSuggested || '',
                      consumption: analysisResult.consumption || '',
                      timestamp: Date.now()
                    };
                    localStorage.setItem('beya_achats_import', JSON.stringify(achData));
                    alert(isAr ? '✅ تم إرسال معلومات الثوب إلى المشتريات (Achats)' : '✅ Envoyé aux Achats');
                  } else {
                    alert(isAr ? 'يرجى تحليل موديل أولاً!' : 'Veuillez analyser un modèle d\\'abord !');
                  }
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-50 hover:bg-purple-100/80 border border-purple-200/60 text-purple-700 rounded-xl font-black text-xs transition-all shadow-sm group"
              >
                <Package className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>{isAr ? 'المشتريات والأثواب' : 'Achats Tissus'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tabbed HUD Cockpit (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden h-full">
          {/* Tab Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 bg-slate-50/70 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('fiche')}
                className={\`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 \${
                  activeTab === 'fiche'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }\`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isAr ? '📊 البطاقة التقنية و الأثمنة' : 'Fiche & Prix IA'}</span>
              </button>

              <button
                onClick={() => setActiveTab('mesures')}
                className={\`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 \${
                  activeTab === 'mesures'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }\`}
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>{isAr ? '📏 جدول المقاسات S-XXL' : 'Tableau Mesures'}</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={\`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 \${
                  activeTab === 'chat'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }\`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{isAr ? '💬 المستشار الذكي' : 'Chat IA'}</span>
              </button>
            </div>

            {analysisResult && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-100">
                <Check className="w-3 h-3" /> {isAr ? 'تحليل مكتمل' : 'Analysé'}
              </span>
            )}
          </div>

          {/* TAB 1: FICHE TECHNIQUE & PRIX (activeTab === 'fiche') */}
          {activeTab === 'fiche' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
              {analysisResult ? (
                <>
                  {/* Piece selector tabs if multiple pieces */}
                  {analysisResult.pieces && analysisResult.pieces.length > 1 && (
                    <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-slate-100">
                      <span className="text-xs font-black text-slate-400 uppercase">{isAr ? 'القطع المحللة:' : 'Pièces :'}</span>
                      {analysisResult.pieces.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActivePieceIdx(idx);
                            if (p.mesures?.length) setCustomMesures(p.mesures);
                          }}
                          className={\`px-3 py-1 rounded-xl text-xs font-black transition-all \${
                            activePieceIdx === idx
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }\`}
                        >
                          📦 {p.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Moroccan Fabric & Sourcing Card (كتالوج الأثواب المغربي) */}
                  <div className="bg-gradient-to-br from-indigo-950/5 to-slate-50 rounded-3xl p-5 border border-indigo-100/60 shadow-sm space-y-4">
                    <div className={\`flex items-center justify-between \${isAr ? 'flex-row-reverse' : ''}\`}>
                      <div className={\`flex items-center gap-3 \${isAr ? 'flex-row-reverse text-right' : ''}\`}>
                        <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-sm">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-black text-sm text-slate-900">{isAr ? 'كتالوج الأثواب المغربي و أماكن الشراء' : 'Catalogue Tissus & Marchés Marocains'}</h3>
                          <p className="text-[10px] text-slate-500 font-bold">{isAr ? 'توصيات الثوب المثالي + أثمنة أسواق الجملة (درب عمر / القريعة)' : 'Prix gros au mètre et sourcing au Maroc'}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-black rounded-full">
                        {isAr ? 'سوق المغرب' : 'Marché MA'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase">{isAr ? 'الثوب المقترح للموديل:' : 'Tissu Suggéré :'}</span>
                        <p className="text-base font-black text-slate-900">{fabInfo.arName}</p>
                        <p className="text-xs font-bold text-indigo-600">{fabInfo.frName}</p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase">{isAr ? 'ثمن الجملة التقديري:' : 'Prix Gros au Mètre :'}</span>
                        <p className="text-base font-black text-emerald-600">{fabInfo.pricePerMeterMAD}</p>
                        <p className="text-[10px] font-bold text-slate-500">{fabInfo.markets}</p>
                      </div>
                    </div>

                    <div className="bg-white/80 p-4 rounded-2xl border border-slate-200/60 space-y-2 text-xs">
                      <div className={\`flex items-start gap-2 \${isAr ? 'flex-row-reverse text-right' : ''}\`}>
                        <span className="text-emerald-600 font-black">✔</span>
                        <p className="text-slate-700 font-medium"><strong className="text-emerald-700 font-bold">{isAr ? 'المزايا: ' : 'Avantages : '}</strong>{fabInfo.pros}</p>
                      </div>
                      <div className={\`flex items-start gap-2 \${isAr ? 'flex-row-reverse text-right' : ''}\`}>
                        <span className="text-rose-600 font-black">✖</span>
                        <p className="text-slate-700 font-medium"><strong className="text-rose-700 font-bold">{isAr ? 'العيوب: ' : 'Inconvénients : '}</strong>{fabInfo.cons}</p>
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown & Complexity Card */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">{isAr ? 'استهلاك الثوب (المتراج)' : 'Consommation'}</span>
                      <p className="text-sm font-black text-slate-900">{activePiece?.consumption || analysisResult.consumption || '2.00 - 2.50m'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">{isAr ? 'نوع القصة (Fit)' : 'Coupe & Fit'}</span>
                      <p className="text-sm font-black text-slate-900">{activePiece?.fit || analysisResult.fit || 'Regular / عادي'}</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                      <span className="text-[10px] font-black text-emerald-600 uppercase block mb-1">{isAr ? 'التكلفة التقديرية للقطعة' : 'Coût Estimé'}</span>
                      <p className="text-base font-black text-emerald-700">{activePiece?.costEstimate || analysisResult.costEstimate || '—'}</p>
                    </div>
                  </div>

                  {/* Components List */}
                  {((activePiece?.components && activePiece.components.length > 0) || (analysisResult.components && analysisResult.components.length > 0)) && (
                    <div className="bg-white p-4 rounded-2xl border border-slate-200">
                      <span className="text-xs font-black text-slate-500 uppercase block mb-2">{isAr ? 'مكونات وأجزاء البياسة:' : 'Composants :'}</span>
                      <div className="flex flex-wrap gap-2">
                        {(activePiece?.components || analysisResult.components).map((comp, ci) => (
                          <span key={ci} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/60">
                            ✂️ {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Print / Export Report Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => printRapportIA(analysisResult, image, isAr)}
                      className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase hover:bg-slate-800 transition-all shadow-sm"
                    >
                      <Printer className="w-4 h-4" /> <span>{isAr ? 'طباعة تقرير التحليل الكامل A4' : 'Imprimer Rapport A4'}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <FileText className="w-16 h-16 mb-4 text-slate-300" />
                  <h4 className="text-lg font-black text-slate-700 mb-1">{isAr ? 'البطاقة التقنية فارغة' : 'Fiche Technique Vide'}</h4>
                  <p className="text-xs max-w-sm mb-6">{isAr ? 'ارفع صورة الموديل واضغط على "بدء التحليل الفوري" للحصول على جدول الثمن، كتالوج الأثواب، وتفاصيل الخياطة.' : 'Uploadez une image et lancez l\\'analyse pour générer la fiche technique.'}</p>
                  <button onClick={() => fileInputRef.current?.click()} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase hover:bg-indigo-700 transition-all shadow-md">
                    {isAr ? 'رفع صورة الموديل الآن' : 'Uploader une photo'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TABLEAU DE MESURES S-XXL (activeTab === 'mesures') */}
          {activeTab === 'mesures' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
              <div className={\`flex items-center justify-between \${isAr ? 'flex-row-reverse' : ''}\`}>
                <div>
                  <h3 className="font-black text-base text-slate-900">{isAr ? 'جدول المقاسات الكامل (S - XXL)' : 'Tableau de Mesures Complet (S - XXL)'}</h3>
                  <p className="text-xs text-slate-500 font-bold">{isAr ? 'يمكنك تعديل أي قياس لتخصيص الباترون لورشتك' : 'Modifiez les valeurs selon votre patronage'}</p>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="p-3 text-xs font-black text-slate-700 uppercase tracking-wider">{isAr ? 'القياس' : 'Mesure'}</th>
                      {selectedTailles.map(size => (
                        <th key={size} className="p-3 text-xs font-black text-slate-700 uppercase tracking-wider text-center">{size}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {customMesures.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-xs font-black text-slate-800">{row.nom}</td>
                        {selectedTailles.map(size => (
                          <td key={size} className="p-3 text-center">
                            <input
                              type="number"
                              value={row.valeurs[size] || ''}
                              onChange={e => handleCellChange(rowIndex, size, Number(e.target.value))}
                              className="w-16 p-1.5 text-center text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-600 focus:outline-none"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CHAT IA (activeTab === 'chat') */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
              {/* Chat Messages */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                {chat.map((c, i) => (
                  <div key={i} className={\`flex w-full \${c.role === 'user' ? (isAr ? 'justify-start' : 'justify-end') : (isAr ? 'justify-end' : 'justify-start')}\`}>
                    <div dir={isAr ? 'rtl' : 'ltr'} className={\`max-w-[80%] p-4 text-xs font-medium leading-relaxed whitespace-pre-line shadow-sm rounded-2xl \${
                      c.role === 'user'
                        ? 'bg-slate-800 text-white rounded-br-none'
                        : 'bg-white text-slate-700 border border-slate-200/80 rounded-bl-none'
                    } \${isAr ? 'text-right' : 'text-left'}\`}>
                      {c.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 bg-white border-t border-slate-200/80 flex-shrink-0">
                <form onSubmit={(e) => { e.preventDefault(); sendMsg(); }} className="flex gap-2">
                  <input
                    type="text"
                    value={msg}
                    onChange={e => setMsg(e.target.value)}
                    placeholder={isAr ? 'اسأل عن ثمن الخياطة، نوع الثوب، أو المقاسات...' : 'Posez une question technique...'}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" /> <span className="hidden sm:inline">{isAr ? 'إرسال' : 'Envoyer'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full image overlay modal */}
      {showFullImage && image && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={() => setShowFullImage(false)}>
          <button onClick={() => setShowFullImage(false)} className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all z-10 border border-white/10">
            <X className="w-6 h-6" />
          </button>
          <img src={image} className="max-w-[95vw] max-h-[90vh] object-contain rounded-3xl shadow-2xl" alt="Model Full" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Custom Alert Modal */}
      {customAlert && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] border border-slate-200 w-full max-w-md p-6 shadow-2xl relative flex flex-col items-center text-center">
            <div className={\`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-md \${
              customAlert.isError 
                ? 'bg-rose-50 border border-rose-100 text-rose-600' 
                : 'bg-emerald-50 border border-emerald-100 text-emerald-600'
            }\`}>
              {customAlert.isError ? <X className="w-6 h-6" /> : <Check className="w-6 h-6" />}
            </div>
            <h3 className="text-base font-black text-slate-900 mb-2">{customAlert.title}</h3>
            <p className="text-xs font-semibold leading-relaxed text-slate-600 mb-6">{customAlert.message}</p>
            <button
              onClick={() => {
                const onConf = customAlert.onConfirm;
                setCustomAlert(null);
                if (onConf) onConf();
              }}
              className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
            >
              {isAr ? 'موافق' : 'D\\'accord'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}`;

const beforeReturn = content.substring(0, returnStartIdx);
const newContent = beforeReturn + newReturnBlock + '\n';

fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Successfully replaced AISpace return block cleanly!");
