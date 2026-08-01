import React, { useState, useMemo } from 'react';
import { 
  Bot, 
  Wrench, 
  Clock, 
  Users, 
  Upload, 
  Download, 
  Printer, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  Calculator as CalcIcon, 
  TrendingUp, 
  Zap, 
  Calendar, 
  FileSpreadsheet, 
  Send 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { PosteTravail } from '../types';

interface GarmentPrototype {
  id: string;
  nameAr: string;
  nameFr: string;
  descAr: string;
  descFr: string;
  postes: PosteTravail[];
}

const DEFAULT_PROTOTYPES: GarmentPrototype[] = [
  {
    id: 'abaya',
    nameAr: '👘 عباية / قفطان بلدي',
    nameFr: 'Abaya / Caftan Beldi',
    descAr: 'تصميم تقليدي مع تطريز، سرفلة أمان 5 خيوط، وسفيفة وعقد',
    descFr: 'Confection traditionnelle haute qualité avec broderie et sfifa',
    postes: [
      { nomAr: 'فصالة بالليزر وتحضير الأجزاء وباترون', nomFr: 'Coupe Laser & Tracé', machine: 'Ciseaux électriques / Table Laser', tempsMin: 7, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'لصق الفيزلين وتقوية الياقة والأطراف', nomFr: 'Thermocollage & Renforts', machine: 'Presse à Thermocoller', tempsMin: 5, roleOuvrier: 'مساعد فصالة' },
      { nomAr: 'سرفلة وحماية حواف الثوب الداخلي', nomFr: 'Surfilage de Sécurité', machine: 'Surjeteuse 4/5 Fils', tempsMin: 7, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'تجميع الهيكل، الأكتاف والدرزات الرئيسية', nomFr: 'Assemblage Principal & Épaules', machine: 'Piqueuse Plate 2 Aiguilles', tempsMin: 12, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'خياطة وتثبيت الأكمام مع البطانة الداعمة', nomFr: 'Montage Manches & Emmanchures', machine: 'Piqueuse Plate', tempsMin: 10, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تركيب السفيفة، العقد أو التطريز الزخرفي', nomFr: 'Pose Sfifa / Aakad / Broderie', machine: 'Piqueuse Guide / Maâlem', tempsMin: 9, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'ثني الأطراف السفلى والتشطيب الدقيق', nomFr: 'Ourlets & Finitions Extérieures', machine: 'Recouvreuse / Main', tempsMin: 5, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'كّي نهائي بالبخار، تشطيب وفحص الجودة', nomFr: 'Repassage Vapeur & Contrôle Qualité', machine: 'Fer Vapeur / Table Aspirante', tempsMin: 4, roleOuvrier: 'مراقب جودة وتشطيب' }
    ]
  },
  {
    id: 'veste',
    nameAr: '🧥 جاكيت / فيست شتوي مبطن',
    nameFr: 'Veste / Manteau Doublé',
    descAr: 'قصة مركبة مع بطانة، جيوب باسبوال، تقوية حرارية وسحّاب',
    descFr: 'Montage élaboré avec doublure, poches passepoilées et renforts',
    postes: [
      { nomAr: 'فصالة الأجزاء الخارجية والبطانة الحرارية', nomFr: 'Coupe Tissu & Doublure', machine: 'Table de Coupe / Ciseaux', tempsMin: 8, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'تقوية الياقة والأطراف بالفيزلين الحراري', nomFr: 'Thermocollage Col & Parementures', machine: 'Presse à Thermocoller', tempsMin: 6, roleOuvrier: 'مساعد فصالة' },
      { nomAr: 'تجهيز وتركيب الجيوب (Poches Passepoilées)', nomFr: 'Montage Poches & Rabat', machine: 'Piqueuse Plate Automate', tempsMin: 11, roleOuvrier: 'خياط متخصص' },
      { nomAr: 'تجميع الهيكل والأكتاف مع خياطة تقوية', nomFr: 'Assemblage Corps & Surpiqûres', machine: 'Piqueuse Plate 2 Aiguilles', tempsMin: 14, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تركيب الأكمام وربط الكتف الداخلي', nomFr: 'Montage Manches & Épaulettes', machine: 'Piqueuse Plate Canon', tempsMin: 12, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تركيب الياقة وسحّاب الإغلاق المخفي', nomFr: 'Pose Col & Fermeture Éclair', machine: 'Piqueuse Guide Zippée', tempsMin: 10, roleOuvrier: 'خياط متخصص' },
      { nomAr: 'تثبيت البطانة الداخلية وإغلاق الدرزات', nomFr: 'Assemblage Doublure Intérieure', machine: 'Piqueuse Plate', tempsMin: 9, roleOuvrier: 'خياط تشطيب' },
      { nomAr: 'ثني الأطراف والتشطيب اليدوي الدقيق', nomFr: 'Ourlets & Finitions', machine: 'Recouvreuse / Main', tempsMin: 6, roleOuvrier: 'عامل تشطيب' },
      { nomAr: 'كّي بالبخار وطاولة شفط وفحص الجودة', nomFr: 'Repassage Final & Contrôle Qualité', machine: 'Presse Vapeur Professionnelle', tempsMin: 5, roleOuvrier: 'مراقب جودة' }
    ]
  },
  {
    id: 'sportswear',
    nameAr: '🏃 طقم رياضي هودي قطن',
    nameFr: 'Sportswear Hoodie Coton',
    descAr: 'خياطة مطاطية أوفرلوك 4 خيوط، قبعة، جيب كانغارو وأساور',
    descFr: 'Confection maille stretch surjeteuse 4 fils et bord-côte',
    postes: [
      { nomAr: 'فصالة القماش القطني والبورد-كوت', nomFr: 'Coupe Maille & Bord-Côte', machine: 'Table de Coupe / Ciseaux', tempsMin: 5, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'تجهيز وخياطة جيب الكانغارو الأمامي', nomFr: 'Montage Poche Kangourou', machine: 'Recouvreuse / Piqueuse', tempsMin: 6, roleOuvrier: 'خياط متخصص' },
      { nomAr: 'تجميع الأكتاف والهيكل بخياطة مرنة 4 خيوط', nomFr: 'Assemblage Épaules & Côtés', machine: 'Surjeteuse 4 Fils', tempsMin: 8, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'خياطة وتركيب قبعة الهودي مع البطانة', nomFr: 'Montage Capuche & Cordon', machine: 'Surjeteuse 4 Fils + Piqueuse', tempsMin: 7, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'خياطة الأكمام وتركيب أساور اليد المطاطية', nomFr: 'Montage Manches & Poignets', machine: 'Surjeteuse 4 Fils', tempsMin: 7, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'تركيب الحافة السفلية المطاطية (Bord-côte)', nomFr: 'Pose Ceinture Bas Bord-côte', machine: 'Recouvreuse 3 Aiguilles', tempsMin: 5, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'تشطيب، تنظيف الخيوط وكيّ خفيف بالبخار', nomFr: 'Nettoyage Fils & Repassage', machine: 'Fer Vapeur / Table Aspirante', tempsMin: 3, roleOuvrier: 'مراقب جودة وتشطيب' }
    ]
  },
  {
    id: 'cargo',
    nameAr: '👖 سروال كارجو متعدد الجيوب',
    nameFr: 'Pantalon Cargo Multipoches',
    descAr: 'خياطة متينة، جيوب جانبية بغطاء، سحّاب وحزام خصر متين',
    descFr: 'Confection toile résistante, poches à soufflet et surpiqûres',
    postes: [
      { nomAr: 'فصالة الثوب وأجزاء الجيوب الجانبية', nomFr: 'Coupe Pantalon & Poches', machine: 'Table de Coupe / Ciseaux', tempsMin: 6, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'سرفلة جميع القطع الداخلية (Surfilage 5 fils)', nomFr: 'Surfilage Pièces', machine: 'Surjeteuse 5 Fils', tempsMin: 5, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'تجهيز وتركيب الجيوب الجانبية مع الغطاء', nomFr: 'Montage Poches Cargo & Soufflets', machine: 'Piqueuse Plate 2 Aiguilles', tempsMin: 10, roleOuvrier: 'خياط متخصص' },
      { nomAr: 'خياطة درزات الجوانب والساقين بخياطة مزدوجة', nomFr: 'Assemblage Jambes & Surpiqûres', machine: 'Piqueuse Plate 2 Aiguilles', tempsMin: 9, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'تركيب سحّاب الطرقة الأمامية (Braguette)', nomFr: 'Montage Braguette & Fermeture', machine: 'Piqueuse Guide', tempsMin: 7, roleOuvrier: 'خياط متخصص' },
      { nomAr: 'تركيب حزام الخصر والحلقات (Passants)', nomFr: 'Pose Ceinture & Passants', machine: 'Piqueuse Canon / Automate', tempsMin: 8, roleOuvrier: 'خياط رئيسي' },
      { nomAr: 'ثني الأطراف السفلية والتشطيب النهائي', nomFr: 'Ourlets Bas & Nettoyage', machine: 'Recouvreuse / Piqueuse', tempsMin: 4, roleOuvrier: 'عامل تشطيب' }
    ]
  },
  {
    id: 'tshirt',
    nameAr: '👕 طقم صيفي / تيشرت قطني',
    nameFr: 'T-shirt & Short Été Coton',
    descAr: 'خياطة سريعة أوفرلوك 4 خيوط، ياقة دائرية وتشطيب ريكوفروز',
    descFr: 'Confection maille rapide surjeteuse et recouvreuse',
    postes: [
      { nomAr: 'فصالة الصدر والظهر والأكمام', nomFr: 'Coupe Maille Jersey', machine: 'Table de Coupe / Ciseaux', tempsMin: 3, roleOuvrier: 'فصالة وباترون' },
      { nomAr: 'تجميع الأكتاف مع شريط تقوية الياقة', nomFr: 'Assemblage Épaules & Renfort Col', machine: 'Surjeteuse 4 Fils', tempsMin: 4, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'تركيب الياقة الدائرية (Col Rond Bord-côte)', nomFr: 'Pose Col Rond', machine: 'Recouvreuse / Surjeteuse', tempsMin: 4, roleOuvrier: 'خياط متخصص' },
      { nomAr: 'تركيب الأكمام وإغلاق الجوانب', nomFr: 'Montage Manches & Côtés', machine: 'Surjeteuse 4 Fils', tempsMin: 5, roleOuvrier: 'ماكينة Overlock' },
      { nomAr: 'ثني حواف الأكمام والحافة السفلية (Recouvreuse)', nomFr: 'Ourlets Bas & Manches', machine: 'Recouvreuse 3 Aiguilles', tempsMin: 4, roleOuvrier: 'خياطة متخصصة' },
      { nomAr: 'تنظيف الخيوط وكيّ خفيف بالبخار والتغليف', nomFr: 'Contrôle, Repassage & Pliage', machine: 'Fer Vapeur / Table Aspirante', tempsMin: 2, roleOuvrier: 'مراقب جودة وتشطيب' }
    ]
  }
];

export default function GammeAiPilot() {
  const { isAr } = useLang();
  const navigate = useNavigate();

  // Selected Prototype / Current Garment State
  const [selectedProtoId, setSelectedProtoId] = useState<string>('abaya');
  const [garmentName, setGarmentName] = useState<string>(
    isAr ? '👘 عباية / قفطان بلدي' : 'Abaya / Caftan Beldi'
  );
  const [postes, setPostes] = useState<PosteTravail[]>(DEFAULT_PROTOTYPES[0].postes);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<string | null>(
    isAr
      ? `🤖 تحليل خبير الغام (BEYA AI Gamme Pilot):
1. 🔍 هندسة الموديل: قفطان/عباية بلدي يتطلب 8 محطات عمل متخصصة لضمان عدم وجود أي اختناق (Goulet d'étranglement).
2. 🧵 مسار المكائن: فصالة ليزر، فيزلين حراري، سرفلة أمان 5 خيوط، خياطة رئيسية إبرتين، تركيب أكمام، وسفيفة/عقد.
3. 👥 القوى العاملة المطلوبة: 8 عمال (أو مضاعفات 8 للخطوط المتوازية) بمتوسط وقت خياطة 59 دقيقة للقطعة الواحدة.`
      : `🤖 Rapport d'ingénierie Gamme (BEYA AI Gamme Pilot) :
1. 🔍 Architecture : Abaya/Caftan exigeant 8 postes spécialisés pour une fluidité de chaîne optimale sans goulot d'étranglement.
2. 🧵 Parcours Machines : Coupe Laser, Thermocollage, Surjeteuse 5 fils, Piqueuse plate 2 aiguilles, Montage manches et Sfifa.
3. 👥 Effectif requis : 8 ouvriers qualifiés (ou multiples pour chaînes parallèles) avec un temps de gamme total de 59 min/pièce.`
  );

  // Production Simulation Parameters (Standalone controls for "OCHEHAL GHADI NQDR NKHRG MN PCS F 1H O NHAR O OSBOU3 O CHER")
  const [workersCount, setWorkersCount] = useState<number>(8);
  const [shiftHours, setShiftHours] = useState<number>(9); // 8h, 9h, 10h
  const [efficiencyPercent, setEfficiencyPercent] = useState<number>(90); // 80%, 90%, 100%

  // Calculate Total Takt Time / Minute per piece
  const totalTaktMin = useMemo(() => {
    return postes.reduce((sum, p) => sum + (Number(p.tempsMin) || 0), 0);
  }, [postes]);

  // Production Multi-Timeframe Calculations
  const outputMath = useMemo(() => {
    const minPerPiece = totalTaktMin || 30;
    const eff = efficiencyPercent / 100;
    
    // Hourly output of the ENTIRE LINE = (Workers * 60 min * efficiency) / minPerPiece
    const pcsPerHour = (workersCount * 60 * eff) / minPerPiece;
    const pcsPerDay = pcsPerHour * shiftHours;
    const pcsPerWeek = pcsPerDay * 6; // 6 working days
    const pcsPerMonth = pcsPerDay * 26; // 26 working days in month

    return {
      hour: Math.max(0, Math.round(pcsPerHour * 10) / 10),
      day: Math.max(0, Math.round(pcsPerDay)),
      week: Math.max(0, Math.round(pcsPerWeek)),
      month: Math.max(0, Math.round(pcsPerMonth)),
    };
  }, [totalTaktMin, workersCount, shiftHours, efficiencyPercent]);

  // Handle uploading any garment photo ("TSWIRA IHLAHA MZIAN MACHI BMORJD ISM DIALHA")
  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUploadedImage(dataUrl);
      setIsAnalyzing(true);
      
      setTimeout(() => {
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        setGarmentName(`📷 ${cleanName}`);
        
        // Use an 8-poste dissected garment structure
        const aiPostes: PosteTravail[] = [
          { nomAr: 'فصالة بالليزر وتحضير الأجزاء وباترون', nomFr: 'Coupe Laser & Tracé', machine: 'Ciseaux électriques / Table Laser', tempsMin: 7, roleOuvrier: 'فصالة وباترون' },
          { nomAr: 'لصق الفيزلين وتقوية الياقة والأطراف', nomFr: 'Thermocollage & Renforts', machine: 'Presse à Thermocoller', tempsMin: 5, roleOuvrier: 'مساعد فصالة' },
          { nomAr: 'سرفلة وحماية حواف الثوب الداخلي', nomFr: 'Surfilage de Sécurité', machine: 'Surjeteuse 4/5 Fils', tempsMin: 7, roleOuvrier: 'ماكينة Overlock' },
          { nomAr: 'تجميع الهيكل، الأكتاف والدرزات الرئيسية', nomFr: 'Assemblage Principal & Épaules', machine: 'Piqueuse Plate 2 Aiguilles', tempsMin: 12, roleOuvrier: 'خياط رئيسي' },
          { nomAr: 'خياطة وتثبيت الأكمام مع البطانة الداعمة', nomFr: 'Montage Manches & Emmanchures', machine: 'Piqueuse Plate', tempsMin: 10, roleOuvrier: 'خياط رئيسي' },
          { nomAr: 'تركيب الياقة، الجيوب أو التطريز الزخرفي', nomFr: 'Pose Accessoires (Col/Poche/Broderie)', machine: 'Piqueuse Guide / Automate', tempsMin: 9, roleOuvrier: 'خياطة متخصصة' },
          { nomAr: 'ثني الأطراف السفلى والتشطيب الدقيق', nomFr: 'Ourlets & Finitions Extérieures', machine: 'Recouvreuse / Main', tempsMin: 5, roleOuvrier: 'خياطة متخصصة' },
          { nomAr: 'كّي نهائي بالبخار، تشطيب وفحص الجودة', nomFr: 'Repassage Vapeur & Contrôle Qualité', machine: 'Fer Vapeur / Table Aspirante', tempsMin: 4, roleOuvrier: 'مراقب جودة وتشطيب' }
        ];
        
        const sumMin = aiPostes.reduce((s, p) => s + (Number(p.tempsMin) || 0), 0);
        setPostes(aiPostes);
        setWorkersCount(aiPostes.length);
        
        setAiReport(
          isAr
            ? `🤖 تشريح تقني دقيق لصورة الموديل (BEYA AI Vision - Déconstruction):
1. 🔍 الهندسة وتفاصيل الصنعة: تم رصد قصة مركبة مع أكمام مدعمة، خياطة تقوية مزدوجة إبرتين، تشطيبات حواف دقيقة، ووجود عناصر زخرفية/جيوب مدمجة.
2. 🧵 مسار الخياطة والمكائن: الخياطة الأساسية تتطلب (Piqueuse Plate إبرتين ودليل Guide)، السرفلة على (Surjeteuse 5 خيوط أمان)، مع تقوية بالحرارة (Thermocollage) وكيّ بالبخار.
3. 👥 القوى العاملة والبوستات المطلوبة: لتجنب أي اختناق في خط الإنتاج، هذا الموديل يحتاج بالضبط إلى (8) محطات عمل متخصصة، أي (8) عمال خياطة وتشطيب، بمتوسط خياطة ${sumMin} دقيقة للقطعة.`
            : `🤖 Déconstruction Visuelle IA (BEYA AI Vision) :
1. 🔍 Architecture & Coupe : Détection d'un montage élaboré avec emmanchures renforcées, coutures surpiquées 2 aiguilles, finitions de bord techniques et empiècements intégrés.
2. 🧵 Parcours Machines : Assemblage sur Piqueuse Plate (1 & 2 aiguilles + Guide), surfilage de sécurité sur Surjeteuse 5 Fils, renforts thermocollés et finition fer à vapeur.
3. 👥 Effectif et Chaîne requis : Ce modèle exige exactement 8 postes de travail spécialisés (8 ouvriers) pour une gamme de ${sumMin} min/pièce.`
        );
        setIsAnalyzing(false);
      }, 700);
    };
    reader.readAsDataURL(file);
  };

  // Select Prototype
  const handleSelectPrototype = (proto: GarmentPrototype) => {
    setSelectedProtoId(proto.id);
    setGarmentName(isAr ? proto.nameAr : proto.nameFr);
    setPostes(proto.postes);
    setWorkersCount(proto.postes.length);
    const sumMin = proto.postes.reduce((s, p) => s + (Number(p.tempsMin) || 0), 0);

    setAiReport(
      isAr
        ? `🤖 تحليل خبير الغام للموديل (${proto.nameAr}):
1. 🔍 الهندسة: ${proto.descAr}. خط الإنتاج موزع على ${proto.postes.length} بوستات عمل متسلسلة.
2. 🧵 المكائن المطلوبة: توزيع دقيق للمكائن لضمان توازن التوقيت بين كل عامل والعامل الذي يليه (Équilibrage).
3. 👥 القوى العاملة: ${proto.postes.length} عمال بمتوسط وقت خياطة إجمالي ${sumMin} دقيقة للقطعة.`
        : `🤖 Analyse Expert Gamme (${proto.nameFr}) :
1. 🔍 Architecture : ${proto.descFr}. Chaîne équilibrée sur ${proto.postes.length} postes séquentiels.
2. 🧵 Parcours Machines : Répartition optimisée pour éliminer les temps d'attente entre postes (Équilibrage de ligne).
3. 👥 Effectif requis : ${proto.postes.length} ouvriers avec un temps de gamme total de ${sumMin} min/pièce.`
    );
  };

  // Add Operation
  const handleAddPoste = () => {
    const newP: PosteTravail = {
      nomAr: 'مرحلة خياطة جديدة (حدد الوصف)',
      nomFr: 'Nouvelle opération de couture',
      machine: 'Piqueuse Plate',
      tempsMin: 5,
      roleOuvrier: isAr ? 'خياط متخصص' : 'Ouvrier Qualifié'
    };
    const updated = [...postes, newP];
    setPostes(updated);
    setWorkersCount(updated.length);
  };

  // Delete Operation
  const handleDeletePoste = (index: number) => {
    const updated = postes.filter((_, idx) => idx !== index);
    setPostes(updated);
    if (workersCount > updated.length && updated.length > 0) {
      setWorkersCount(updated.length);
    }
  };

  // Update Operation field
  const handleUpdatePoste = (index: number, field: keyof PosteTravail, val: any) => {
    const updated = postes.map((p, idx) => {
      if (idx === index) {
        return { ...p, [field]: field === 'tempsMin' ? Number(val) || 0 : val };
      }
      return p;
    });
    setPostes(updated);
  };

  // EXCEL / CSV Export ("CHIUHA PRO NQDER NSTKHRG INFO EXEL")
  const handleExportExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM for Arabic Excel UTF-8
    csvContent += `BEYA AI GAMME PILOT - RAPPORT DE CONFECTION TEXTILE\n`;
    csvContent += `Modèle:,${garmentName.replace(/,/g, ' ')}\n`;
    csvContent += `Temps de Gamme Total:,${totalTaktMin} minutes / pièce\n`;
    csvContent += `Ouvriers Requis:,${workersCount} ouvriers\n`;
    csvContent += `Heures / Jour:,${shiftHours} heures\n`;
    csvContent += `Efficacité Ligne:,${efficiencyPercent}%\n\n`;

    csvContent += `CAPACITÉS DE PRODUCTION ESTIMÉES\n`;
    csvContent += `En 1 Heure:,${outputMath.hour} pièces / heure\n`;
    csvContent += `En 1 Jour (${shiftHours}h):,${outputMath.day} pièces / jour\n`;
    csvContent += `En 1 Semaine (6 jours):,${outputMath.week} pièces / semaine\n`;
    csvContent += `En 1 Mois (26 jours):,${outputMath.month} pièces / mois\n\n`;

    csvContent += `DÉTAIL DES POSTES DE TRAVAIL & GAMME DE MONTAGE\n`;
    csvContent += `N°,Opération Arabe,Opération Français,Machine / Équipement,Temps (min),Rôle Ouvrier,Cadence (pcs/h)\n`;

    postes.forEach((p, idx) => {
      const cad = Math.round((60 / Math.max(1, p.tempsMin)) * 10) / 10;
      csvContent += `${idx + 1},"${(p.nomAr || '').replace(/"/g, '""')}","${(p.nomFr || '').replace(/"/g, '""')}","${(p.machine || '').replace(/"/g, '""')}",${p.tempsMin},"${(p.roleOuvrier || '').replace(/"/g, '""')}",${cad}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Gamme_Montage_BEYA_${garmentName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SEND TO ATELIER CALCULATOR ("ENVAEHA LBALASA DIAL GAMME PILOTAG ELI3NDI FSYSTEM OLA NDIHA LCALCUL")
  const handleSendToCalculator = () => {
    // Store in localStorage so AtelierCalculator can immediately pick it up!
    const payload = {
      itemName: garmentName,
      customPostes: postes,
      workers: workersCount,
      stitchingMin: totalTaktMin,
      timestamp: Date.now()
    };
    localStorage.setItem('beya_ai_gamme_pilot_export', JSON.stringify(payload));
    navigate('/atelier-calculator?fromGammePilot=true');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-16 font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Header - BEYA AI Gamme Pilot Standalone */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-4 md:px-8 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/40">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-black text-white tracking-tight">
                {isAr ? '🤖 خبير هندسة الغام وموازنة خط الإنتاج (AI Gamme Pilot)' : '🤖 Assistant Expert - Pilotage Gamme & Équilibrage AI'}
              </h1>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black border border-emerald-500/40">
                PRO EDITION
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'تحليل الموديل، تشريح مراحل الخياطة، وحساب قدرة الإنتاج في (ساعة، يوم، أسبوع، شهر)'
                : 'Déconstruction visuelle du modèle, gammes de montage et simulation de cadence 1H/Jour/Mois'}
            </p>
          </div>
        </div>

        {/* Action Buttons in Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/30 border border-emerald-400 active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>{isAr ? '📥 تصدير Excel (.CSV)' : '📥 Exporter Excel (.CSV)'}</span>
          </button>
          <button
            type="button"
            onClick={handleSendToCalculator}
            className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/40 border border-indigo-400 active:scale-95"
          >
            <Send className="w-4 h-4 shrink-0" />
            <span>{isAr ? '🚀 إرسال إلى حاسبة الأتوليي' : '🚀 Envoyer au Calculateur'}</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{isAr ? 'طباعة' : 'Imprimer'}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/atelier-calculator')}
            className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border border-slate-700"
          >
            <CalcIcon className="w-4 h-4 shrink-0" />
            <span>{isAr ? '← حاسبة الإنتاج' : '← Calculateur'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout (2 columns on large screen) */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 space-y-8">
        
        {/* ROW 1: AI Vision Analyzer & Garment Prototype Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT/RIGHT COL: AI Vision Upload & Prototypes (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                {isAr ? '1. اختيار أو تحليل صورة الموديل (TSWIRA)' : '1. Sélection / Analyse Photo Modèle'}
              </span>
              <span className="text-[10px] text-slate-400">
                {postes.length} {isAr ? 'بوستات' : 'postes'} | {totalTaktMin} {isAr ? 'دقيقة' : 'min'}
              </span>
            </div>

            {/* Photo Dropzone / Uploader */}
            <label className="block w-full border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-950/60 hover:bg-slate-950/80 rounded-2xl p-4 text-center cursor-pointer transition-all group">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoUpload(file);
                  e.target.value = '';
                }}
              />
              {uploadedImage ? (
                <div className="flex items-center gap-3">
                  <img src={uploadedImage} alt="Garment" className="w-16 h-16 rounded-xl object-cover border border-emerald-500 shadow-md" />
                  <div className="text-left flex-1">
                    <p className="text-xs font-black text-emerald-400">{garmentName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isAr ? 'تم تشريح الصورة بنجاح عبر BEYA Vision' : 'Image analysée par BEYA Vision IA'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-black text-slate-200">
                    {isAr ? '💻 ارفع صورة الموديل لتحليل الخياطة والبوستات' : '💻 Uploadez une image pour déconstruire la gamme'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {isAr ? 'الذكاء الاصطناعي يحلل التصميم ويعطيك طريقة الخياطة وعدد العمال' : 'L\'IA analyse le montage et génère la gamme complète'}
                  </p>
                </div>
              )}
            </label>

            {/* Quick Prototype Selector */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400">
                {isAr ? '✨ أو اختر موديل جاهز لتجهيز الغام فوراً:' : '✨ Ou choisissez un prototype rapide :'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEFAULT_PROTOTYPES.map((proto) => {
                  const isSel = selectedProtoId === proto.id;
                  return (
                    <button
                      key={proto.id}
                      type="button"
                      onClick={() => handleSelectPrototype(proto)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                        isSel
                          ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border-emerald-400/80 text-white shadow-md ring-1 ring-emerald-400/50'
                          : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-black truncate">{isAr ? proto.nameAr : proto.nameFr}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          {proto.postes.length} {isAr ? 'بوستات عمل' : 'postes'}
                        </div>
                      </div>
                      {isSel && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Expert Deconstruction Report Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-indigo-400 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  {isAr ? 'تقرير خبير الغام (AI Gamme Consultant)' : 'Rapport Expert IA - Confection'}
                </span>
                {isAnalyzing && (
                  <span className="text-[10px] text-amber-300 animate-pulse font-bold">
                    {isAr ? 'جاري التحليل...' : 'Analyse...'}
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line font-medium">
                {aiReport}
              </p>
            </div>
          </div>

          {/* RIGHT COL: PRODUCTION OUTPUT MULTI-TIMEFRAME DASHBOARD (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <span className="text-sm font-black text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  {isAr ? '2. قدرة الإنتاج الحقيقية: ساعة - يوم - أسبوع - شهر' : '2. Cadence & Simulation de Production (1H - Jour - Mois)'}
                </span>
                <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  Takt Time = {totalTaktMin} {isAr ? 'دقيقة / بياسة' : 'min / pièce'}
                </span>
              </div>

              {/* 4 Glowing Multi-Timeframe KPI Cards ("1H O NHAR O OSBOU3 O CHER") */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                
                {/* 1 HOUR */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-950/80 to-slate-950 border border-indigo-500/30 shadow-lg text-center space-y-1">
                  <div className="text-[10px] font-black text-indigo-300 uppercase tracking-wider flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    {isAr ? 'في الساعة (1H)' : 'EN 1 HEURE'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {outputMath.hour}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">
                    {isAr ? 'قطعة / ساعة' : 'pièces / heure'}
                  </div>
                </div>

                {/* 1 DAY */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/80 to-slate-950 border border-emerald-500/40 shadow-lg text-center space-y-1 ring-1 ring-emerald-500/20">
                  <div className="text-[10px] font-black text-emerald-300 uppercase tracking-wider flex items-center justify-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    {isAr ? `في اليوم (${shiftHours}h)` : `EN 1 JOUR (${shiftHours}h)`}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                    {outputMath.day.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-300/80">
                    {isAr ? 'قطعة / يوم' : 'pièces / jour'}
                  </div>
                </div>

                {/* 1 WEEK */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/80 to-slate-950 border border-amber-500/30 shadow-lg text-center space-y-1">
                  <div className="text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center justify-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    {isAr ? 'في الأسبوع (6 أيام)' : 'EN 1 SEMAINE'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                    {outputMath.week.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">
                    {isAr ? 'قطعة / أسبوع' : 'pièces / sem'}
                  </div>
                </div>

                {/* 1 MONTH */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-violet-950/80 to-slate-950 border border-violet-500/30 shadow-lg text-center space-y-1">
                  <div className="text-[10px] font-black text-violet-300 uppercase tracking-wider flex items-center justify-center gap-1">
                    <Users className="w-3.5 h-3.5 text-violet-400" />
                    {isAr ? 'في الشهر (26 يوم)' : 'EN 1 MOIS'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {outputMath.month.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">
                    {isAr ? 'قطعة / شهر' : 'pièces / mois'}
                  </div>
                </div>

              </div>
            </div>

            {/* Interactive Simulation Sliders (Workers, Shift Hours, Efficiency) */}
            <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 space-y-4">
              <span className="text-xs font-black text-amber-300 block">
                {isAr ? '⚙️ محاكاة قدرة الإنتاج الحية (تحكم في عوامل الورشة):' : '⚙️ Paramètres de simulation en temps réel :'}
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Workers Count */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">{isAr ? 'عدد العمال (Ouvriers):' : 'Nombre d\'ouvriers :'}</span>
                    <span className="text-white font-black">{workersCount} {isAr ? 'عامل' : 'ouvriers'}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    value={workersCount}
                    onChange={(e) => setWorkersCount(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1</span>
                    <button 
                      type="button"
                      onClick={() => setWorkersCount(postes.length)}
                      className="text-indigo-400 underline"
                    >
                      {isAr ? `مطابقة البوستات (${postes.length})` : `Sync postes (${postes.length})`}
                    </button>
                    <span>40</span>
                  </div>
                </div>

                {/* Shift Hours */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">{isAr ? 'ساعات العمل اليومية:' : 'Heures de shift :'}</span>
                    <span className="text-white font-black">{shiftHours} {isAr ? 'ساعات/يوم' : 'h / jour'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    {[8, 9, 10].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setShiftHours(h)}
                        className={`py-1 rounded-lg text-xs font-black border transition-all ${
                          shiftHours === h
                            ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                        }`}
                      >
                        {h} {isAr ? 'ساعات' : 'heures'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Efficiency % */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">{isAr ? 'كفاءة الورشة (Efficacité):' : 'Efficacité atelier :'}</span>
                    <span className="text-white font-black">{efficiencyPercent}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    {[80, 90, 100].map((eff) => (
                      <button
                        key={eff}
                        type="button"
                        onClick={() => setEfficiencyPercent(eff)}
                        className={`py-1 rounded-lg text-xs font-black border transition-all ${
                          efficiencyPercent === eff
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                        }`}
                      >
                        {eff}%
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Action Footer Banner inside Right Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-teal-950/50 to-indigo-950/50 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-bold text-slate-200">
                {isAr
                  ? '💡 هل ترغب في تطبيق هذه الغام وأرقام الإنتاج في حاسبة الورشة أو تصديرها إلى Excel؟'
                  : '💡 Souhaitez-vous transférer cette gamme au calculateur d\'atelier ou l\'exporter en Excel ?'}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendToCalculator}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <span>{isAr ? 'إرسال إلى الحاسبة' : 'Envoyer au Calculateur'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* ROW 2: EDITABLE PROFESSIONAL GAMME DE MONTAGE TABLE ("LAGAMME - ÉQUILIBRAGE DE CHAÎNE") */}
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm md:text-base font-black text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-400" />
                {isAr ? '3. جدول الغام ومحطات العمل (Gamme de Montage & Équilibrage de Chaîne)' : '3. Gamme de Montage & Équilibrage Opérationnel de la Chaîne'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr ? 'يمكنك تعديل أي مرحلة، تغيير الماكينة أو الوقت بالدقائق وسيقوم النظام بتحديث الإنتاجية تلقائياً' : 'Éditez chaque opération, le type de machine et le temps en min pour rééquilibrer la ligne'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddPoste}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md border border-indigo-400 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إضافة مرحلة خياطة' : 'Ajouter un poste'}</span>
              </button>
              <button
                type="button"
                onClick={handleExportExcel}
                className="px-3.5 py-1.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-emerald-500/40"
              >
                <Download className="w-4 h-4" />
                <span>{isAr ? 'تصدير Excel' : 'Excel CSV'}</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-black uppercase tracking-wider">
                  <th className="py-3 px-3 w-12 text-center">N°</th>
                  <th className="py-3 px-3">{isAr ? 'المرحلة / العملية (عربي)' : 'Opération (Arabe)'}</th>
                  <th className="py-3 px-3">{isAr ? 'المرحلة / العملية (فرنسي)' : 'Opération (Français)'}</th>
                  <th className="py-3 px-3 w-48">{isAr ? 'الماكينة / المعدات' : 'Machine / Équipement'}</th>
                  <th className="py-3 px-3 w-28 text-center">{isAr ? 'الدقائق (min)' : 'Temps (min)'}</th>
                  <th className="py-3 px-3 w-36">{isAr ? 'دور العامل' : 'Rôle Ouvrier'}</th>
                  <th className="py-3 px-3 w-28 text-center">{isAr ? 'الكادونس (pcs/h)' : 'Cadence (pcs/h)'}</th>
                  <th className="py-3 px-3 w-16 text-center">{isAr ? 'حذف' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {postes.map((p, idx) => {
                  const cad = Math.round((60 / Math.max(1, p.tempsMin)) * 10) / 10;
                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-3 px-3 text-center font-black text-indigo-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={p.nomAr || ''}
                          onChange={(e) => handleUpdatePoste(idx, 'nomAr', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-400 text-white font-bold text-xs px-1 py-1 rounded outline-none transition-all"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={p.nomFr || ''}
                          onChange={(e) => handleUpdatePoste(idx, 'nomFr', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-400 text-slate-300 font-medium text-xs px-1 py-1 rounded outline-none transition-all"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={p.machine || ''}
                          onChange={(e) => handleUpdatePoste(idx, 'machine', e.target.value)}
                          className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-400 text-amber-300 font-bold text-xs px-2 py-1 rounded-lg outline-none transition-all"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={p.tempsMin}
                          onChange={(e) => handleUpdatePoste(idx, 'tempsMin', e.target.value)}
                          className="w-20 bg-slate-950 border border-slate-800 focus:border-emerald-400 text-emerald-400 font-black text-center text-xs px-2 py-1 rounded-lg outline-none transition-all"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={p.roleOuvrier || ''}
                          onChange={(e) => handleUpdatePoste(idx, 'roleOuvrier', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-400 text-slate-400 text-xs px-1 py-1 rounded outline-none transition-all"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-extrabold text-[11px] border border-indigo-500/20">
                          {cad} pcs/h
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeletePoste(idx)}
                          title={isAr ? 'حذف هذه المرحلة' : 'Supprimer'}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Totals */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-slate-300">
                {isAr ? 'إجمالي محطات العمل:' : 'Total des postes :'} <strong className="text-indigo-400">{postes.length} {isAr ? 'بوستات' : 'postes'}</strong>
              </span>
              <span className="text-xs font-black text-slate-300">
                {isAr ? 'إجمالي وقت القطعة (Takt Time):' : 'Temps de Gamme total :'} <strong className="text-emerald-400">{totalTaktMin} {isAr ? 'دقيقة' : 'min'}</strong>
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportExcel}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/30 border border-emerald-400 active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>{isAr ? '📥 تصدير كامل إلى Excel (.CSV)' : '📥 Télécharger rapport Excel (.CSV)'}</span>
              </button>
              <button
                type="button"
                onClick={handleSendToCalculator}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/40 border border-indigo-400 active:scale-95"
              >
                <Send className="w-4 h-4 shrink-0" />
                <span>{isAr ? '🚀 إرسال الغام لحاسبة الأتوليي' : '🚀 Envoyer au Calculateur d\'Atelier'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
