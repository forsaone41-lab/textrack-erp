// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingBag, Globe, Palette, Settings, Plus, Monitor, Smartphone, CheckCircle, ExternalLink, Box, X, Search, LayoutTemplate, Paintbrush, Image as ImageIcon, Check, ListOrdered, CreditCard, AlertCircle, ShieldCheck, Loader2, Copy, Save, Maximize2, Minimize2, Users, Truck, LayoutGrid, List as ListIcon, Trash2, Type, MousePointerClick, Mail, Star, Video } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import StoreManagerDashboard from '../components/Tools/StoreManagerDashboard';
import ProAITools from '../components/Tools/ProAITools';
import { supabase } from '../supabase';

const THEMES = [
  { id: 'streetwear', name: 'Streetwear Pro', layout: 'hero-center', defaultColor: '#0f172a', defaultFont: 'font-sans', previewImg: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop' },
  { id: 'minimalist', name: 'Minimalist', layout: 'split-screen', defaultColor: '#171717', defaultFont: 'font-serif', previewImg: 'https://images.unsplash.com/photo-1489987707023-afc7f93c6508?q=80&w=800&auto=format&fit=crop' },
  { id: 'abaya', name: 'Luxury Abaya', layout: 'elegant', defaultColor: '#b48a44', defaultFont: 'font-serif', previewImg: 'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?q=80&w=800&auto=format&fit=crop' },
  { id: 'sportswear', name: 'Active Sport', layout: 'hero-center', defaultColor: '#84cc16', defaultFont: 'font-sans', previewImg: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop' },
  { id: 'eco', name: 'Eco Nature', layout: 'split-screen', defaultColor: '#4d7c0f', defaultFont: 'font-serif', previewImg: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=800&auto=format&fit=crop' },
  { id: 'kids', name: 'Playful Kids', layout: 'playful', defaultColor: '#0ea5e9', defaultFont: 'font-sans', previewImg: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop' },
  { id: 'clement', name: 'Clement Design', layout: 'clement', defaultColor: '#1e293b', defaultFont: 'font-sans', previewImg: 'https://images.unsplash.com/photo-1577221084712-45b0445d2b00?q=80&w=800&auto=format&fit=crop' },
  { id: 'xton', name: 'Xton', layout: 'hero-center', defaultColor: '#f59e0b', defaultFont: 'font-sans', previewImg: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop' },
  { id: 'amaza', name: 'Amaza', layout: 'sidebar-right', defaultColor: '#06b6d4', defaultFont: 'font-sans', previewImg: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop' },
  { id: 'ochaka', name: 'Ochaka', layout: 'split-screen', defaultColor: '#9f1239', defaultFont: 'font-sans', previewImg: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop' },
  { id: 'mazia', name: 'Mazia', layout: 'mazia', defaultColor: '#ef4444', defaultFont: 'font-serif', previewImg: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=800&auto=format&fit=crop' }
];

const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
};

const getSavedConfig = () => {
    try {
        const saved = localStorage.getItem('beya_store_config');
        return saved ? JSON.parse(saved) : {};
    } catch(e) { return {}; }
};

export default function StoreBuilder({ isLiveStore = false }: { isLiveStore?: boolean }) {
  const { storeNameUrl } = useParams<{storeNameUrl: string}>();
  const config = getSavedConfig();
  const { isAr } = useLang();
  const [platformMode, setPlatformModeState] = useState<'gestion'|'builder'>(
     (localStorage.getItem('beya_platform_mode') as any) || (config.storeName ? 'gestion' : 'builder')
  );
  const setPlatformMode = (mode: 'gestion'|'builder') => {
     localStorage.setItem('beya_platform_mode', mode);
     setPlatformModeState(mode);
  };
  
  const [builderMode, setBuilderModeState] = useState<'dashboard'|'editor'|'pro_ai'>(
    (localStorage.getItem('beya_builder_mode') as any) || 'dashboard'
  );
  
  const setBuilderMode = (mode: 'dashboard'|'editor'|'pro_ai') => {
    localStorage.setItem('beya_builder_mode', mode);
    setBuilderModeState(mode);
  };

  const [productsViewMode, setProductsViewMode] = useState<'list'|'grid'>('list');
  const [activeTab, setActiveTabState] = useState<string>(
     localStorage.getItem('beya_active_tab') || (config.storeName ? 'orders' : 'settings')
  );
  const setActiveTab = (tab: string) => {
     localStorage.setItem('beya_active_tab', tab);
     setActiveTabState(tab);
  };
  const [storeName, setStoreName] = useState(config.storeName || '');
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop'|'mobile'>('desktop');
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showTrash, setShowTrash] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string|null>(null);
    const [storeOrders, setStoreOrders] = useState(() => {
    if (!config.storeName) return [];
    try {
      const saved = localStorage.getItem(`beya_orders_${config.storeName}`);
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return [
      { id: '#1042', customer: 'Youssef El Amrani', amount: '850.00 MAD', status: 'Nouveau', statusColor: 'bg-indigo-100 text-indigo-700', date: 'Il y a 10 min', items: '2 articles', products: [{ name: 'Premium Hoodie', photo: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop', qty: 1, price: '450.00 MAD', options: 'Taille: L, Couleur: Noir' }, { name: 'Cargo Pants', photo: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop', qty: 1, price: '400.00 MAD', options: 'Taille: M, Couleur: Kaki' }] },
      { id: '#1041', customer: 'Sara Bennani', amount: '450.00 MAD', status: 'Confirmé', statusColor: 'bg-emerald-100 text-emerald-700', date: 'Il y a 1h', items: '1 article', products: [{ name: 'Essential T-Shirt', photo: 'https://images.unsplash.com/photo-1489987707023-afc7f93c6508?q=80&w=800&auto=format&fit=crop', qty: 1, price: '450.00 MAD', options: 'Taille: S, Couleur: Blanc' }] },
      { id: '#1040', customer: 'Karim Tazi', amount: '1200.00 MAD', status: 'En cours', statusColor: 'bg-amber-100 text-amber-700', date: 'Hier', items: '3 articles', products: [{ name: 'Classic Sneakers', photo: 'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?q=80&w=800&auto=format&fit=crop', qty: 2, price: '400.00 MAD', options: 'Pointure: 42, Couleur: Blanc' }, { name: 'Cargo Pants', photo: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop', qty: 1, price: '400.00 MAD', options: 'Taille: L, Couleur: Noir' }] },
      { id: '#1039', customer: 'Maha Alami', amount: '350.00 MAD', status: 'Refusé', statusColor: 'bg-rose-100 text-rose-700', date: 'Hier', items: '1 article', products: [{ name: 'Summer Dress', photo: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop', qty: 1, price: '350.00 MAD', options: 'Taille: M, Couleur: Rouge' }] }
    ];
  });

  useEffect(() => {
    if (config.storeName && storeOrders.length > 0) {
      localStorage.setItem(`beya_orders_${config.storeName}`, JSON.stringify(storeOrders));
    }
  }, [storeOrders, config.storeName]);

  const handleUpdateOrderStatus = (orderId: string, newStatus: string, newColor: string) => {
    setStoreOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, statusColor: newColor } : o));
    setSelectedOrder(null);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
  };

  const confirmDeleteOrder = () => {
    if (orderToDelete) {
      setStoreOrders(prev => prev.map(o => o.id === orderToDelete ? { ...o, deleted: true } : o));
      setSelectedOrder(null);
      setOrderToDelete(null);
    }
  };

  const handleRestoreOrder = (orderId: string) => {
    setStoreOrders(prev => prev.map(o => o.id === orderId ? { ...o, deleted: false } : o));
    setSelectedOrder(null);
  };

  const handlePermanentDelete = (orderId: string) => {
    setStoreOrders(prev => prev.filter(o => o.id !== orderId));
    setSelectedOrder(null);
  };
  const [storeLang, setStoreLang] = useState<'fr'|'en'|'ar'>(config.storeLang || 'fr');
  const storeIsAr = storeLang === 'ar';
  
  const tr = (t: string) => {
     if (!storeIsAr) return t;
     const dict: Record<string, string> = {
        'New Collection': 'تشكيلة جديدة',
        'Discover our latest premium quality garments.': 'اكتشف أحدث تشكيلاتنا ذات الجودة العالية.',
        'Shop Now': 'تسوق الآن',
        'Trending Now': 'الأكثر مبيعاً',
        'All Products': 'جميع المنتجات',
        'Home': 'الرئيسية',
        'Collections': 'التشكيلات',
        'About': 'من نحن',
        '© 2026 My Brand. Tous droits réservés.': '© 2026 My Brand. جميع الحقوق محفوظة.',
        'Accueil': 'الرئيسية',
        'Produits': 'المنتجات',
        'All Products ✨': 'جميع المنتجات ✨',
        'ALL PRODUCTS': 'جميع المنتجات',
        'All': 'الكل',
        'ALL': 'الكل',
        'Outerwear': 'ملابس خارجية',
        'OUTERWEAR': 'ملابس خارجية',
        'Tops': 'قمصان',
        'TOPS': 'قمصان',
        'Bottoms': 'بناطيل',
        'BOTTOMS': 'بناطيل',
        'Shoes': 'أحذية',
        'SHOES': 'أحذية',
        'Dresses': 'فساتين',
        'DRESSES': 'فساتين',
        'Recommandé': 'موصى به',
        'Sort: Featured': 'موصى به',
        'Featured': 'موصى به',
        'Best Matches 🌟': 'موصى به 🌟',
        'Prix: Croissant': 'السعر: من الأقل للأكثر',
        'Price: Low to High': 'السعر: من الأقل للأكثر',
        'Price: Low - High': 'السعر: من الأقل للأكثر',
        'Price: Low to High 💸': 'السعر: من الأقل للأكثر 💸',
        'Prix: Décroissant': 'السعر: من الأكثر للأقل',
        'Price: High to Low': 'السعر: من الأكثر للأقل',
        'Price: High - Low': 'السعر: من الأكثر للأقل',
        'Price: High to Low 💎': 'السعر: من الأكثر للأقل 💎',
        'De A à Z': 'أ - ي',
        'De Z à A': 'ي - أ'
     };
     return dict[t] || t;
  };
  
  // Customization States (The PRO way)
  const [activeTheme, setActiveTheme] = useState(config.activeTheme || THEMES[0]);
  const [primaryColor, setPrimaryColor] = useState(config.primaryColor || THEMES[0].defaultColor);
  const [fontFamily, setFontFamily] = useState(config.fontFamily || THEMES[0].defaultFont);
  const [heroImage, setHeroImage] = useState(config.heroImage || THEMES[0].previewImg);
  
  // Theme Inline Texts
  const [heroTitle, setHeroTitle] = useState(config.heroTitle || 'New Collection');
  const [heroSubtitle, setHeroSubtitle] = useState(config.heroSubtitle || 'Discover our latest premium quality garments.');
  const [heroButtonText, setHeroButtonText] = useState(config.heroButtonText || 'Shop Now');
  const [homeCollectionsTitle, setHomeCollectionsTitle] = useState(config.homeCollectionsTitle || 'Trending Now');
  const [allCollectionsTitle, setAllCollectionsTitle] = useState(config.allCollectionsTitle || 'All Products');
  const [homeBlocks, setHomeBlocks] = useState<string[]>(config.homeBlocks || ['hero', 'collections', 'products']);
  const [sliderImages, setSliderImages] = useState<string[]>(config.sliderImages || []);
  const [activeSidebarSection, setActiveSidebarSection] = useState<string>('hero');
  
  const [cartCount, setCartCount] = useState(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [storeProducts, setStoreProducts] = useState(config.storeProducts || [
    { id: 1, name: 'Premium Hoodie', price: '450.00', category: 'Outerwear', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800' },
    { id: 2, name: 'Essential T-Shirt', price: '150.00', category: 'Tops', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800' },
    { id: 3, name: 'Cargo Pants', price: '350.00', category: 'Bottoms', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800' },
    { id: 4, name: 'Classic Sneakers', price: '550.00', category: 'Shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800' },
    { id: 5, name: 'Summer Dress', price: '290.00', category: 'Dresses', image: 'https://images.unsplash.com/photo-1515347619152-16b713b194d2?auto=format&fit=crop&q=80&w=800' },
    { id: 6, name: 'Leather Jacket', price: '890.00', category: 'Outerwear', image: 'https://images.unsplash.com/photo-1551028719-0c124a1119ce?auto=format&fit=crop&q=80&w=800' }
  ]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '' });

  // Helper to get any available image for a product
  const getCoverImage = (p: any) => p.image || (p.colorImages ? Object.values(p.colorImages)[0] : null);

  const [storePages, setStorePages] = useState([
    { id: 'home', title: 'Home', isDefault: true },
    { id: 'collections', title: 'Collections', isDefault: true },
    { id: 'about', title: 'About', isDefault: false }
  ]);
  const [footerSettings, setFooterSettings] = useState(config.footerSettings || {
    copyright: '© 2024 Mon Magasin. Tous droits réservés.',
    links: ['À Propos', 'Contact', 'Politique de Retour', 'Termes & Conditions']
  });
  const [newsletterTitle, setNewsletterTitle] = useState(config.newsletterTitle || 'Rejoignez notre Newsletter');
  const [newsletterSubtitle, setNewsletterSubtitle] = useState(config.newsletterSubtitle || 'Recevez nos dernières offres et nouveautés directement dans votre boîte mail.');
  const [featuresData, setFeaturesData] = useState(config.featuresData || [
    { icon: 'Truck', title: 'Livraison Rapide', subtitle: 'Partout au Maroc' },
    { icon: 'ShieldCheck', title: 'Paiement Sécurisé', subtitle: '100% garanti' },
    { icon: 'Star', title: 'Qualité Premium', subtitle: 'Produits certifiés' }
  ]);
  const [videoUrl, setVideoUrl] = useState(config.videoUrl || '');
  const [newPageTitle, setNewPageTitle] = useState('');
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [pageForm, setPageForm] = useState<any>(null);
  
  const [storeLogo, setStoreLogo] = useState(config.storeLogo || '');
  const [storeFavicon, setStoreFavicon] = useState(config.storeFavicon || '');
  
  useEffect(() => {
     if (isLiveStore) {
        document.title = storeName;
        const finalIcon = storeFavicon || storeLogo || "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛍️</text></svg>";
        
        document.querySelectorAll("link[rel*='icon']").forEach(node => {
            (node as HTMLLinkElement).href = finalIcon;
        });
        let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
        if (!appleLink) {
            appleLink = document.createElement('link');
            appleLink.rel = 'apple-touch-icon';
            document.getElementsByTagName('head')[0].appendChild(appleLink);
        }
        appleLink.href = finalIcon;
     }
  }, [isLiveStore, storeName, storeLogo, storeFavicon]);

  const [isLoadingLiveConfig, setIsLoadingLiveConfig] = useState(isLiveStore);

  // Fetch from Supabase for live store to handle cross-domain loading
  useEffect(() => {
     const fetchLiveConfig = async () => {
        try {
           const currentDomain = window.location.hostname;
           // Fetch the exact domain config first, OR by storeName if provided via url parameter
           let query = supabase.from('stores').select('config_json');
           if (storeNameUrl) {
              query = query.eq('domain', `${storeNameUrl}.beyacreative.com`);
           } else {
              query = query.eq('domain', currentDomain);
           }
           let { data, error } = await query.single();
           
           // Fallback for SaaS mockup: if domain not found, grab the latest saved store
           if (!data) {
              const fallback = await supabase
                 .from('stores')
                 .select('config_json')
                 .eq('domain', 'latest_saved_store')
                 .single();
              
              if (fallback.data) {
                  data = fallback.data;
              } else {
                  // Final fallback
                  const lastResort = await supabase
                     .from('stores')
                     .select('config_json')
                     .order('updated_at', { ascending: false })
                     .limit(1)
                     .single();
                  data = lastResort.data;
              }
           }
           
           if (data && data.config_json) {
              const conf = data.config_json;
              if (conf.storeLang) setStoreLang(conf.storeLang);
              if (conf.storeName) setStoreName(conf.storeName);
              if (conf.storeLogo) setStoreLogo(conf.storeLogo);
              if (conf.storeFavicon) setStoreFavicon(conf.storeFavicon);
              if (conf.activeTheme) setActiveTheme(conf.activeTheme);
              if (conf.primaryColor) setPrimaryColor(conf.primaryColor);
              if (conf.fontFamily) setFontFamily(conf.fontFamily);
              if (conf.heroImage) setHeroImage(conf.heroImage);
              if (conf.heroTitle) setHeroTitle(conf.heroTitle);
              if (conf.heroSubtitle) setHeroSubtitle(conf.heroSubtitle);
              if (conf.heroButtonText) setHeroButtonText(conf.heroButtonText);
              if (conf.homeCollectionsTitle) setHomeCollectionsTitle(conf.homeCollectionsTitle);
              if (conf.allCollectionsTitle) setAllCollectionsTitle(conf.allCollectionsTitle);
              if (conf.buyMode) setBuyMode(conf.buyMode);
              if (conf.footerSettings) setFooterSettings(conf.footerSettings);
           }
        } catch (err) {
           console.warn('No live config found in Supabase or table missing:', err);
        } finally {
           setIsLoadingLiveConfig(false);
        }
     };

     if (isLiveStore) {
        fetchLiveConfig();
     }
  }, [isLiveStore]);
  
  const [buyMode, setBuyMode] = useState<'cart'|'direct'|'both'|'form'>(config.buyMode || 'both');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState<any>(null);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [newColorInput, setNewColorInput] = useState('#000000');

  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customDomain, setCustomDomain] = useState(config.customDomain || '');
  const [isLinkingDomain, setIsLinkingDomain] = useState(false);
  const [domainError, setDomainError] = useState('');

  const submitGlobalOrder = (product: any, qty: number) => {
    const inputs = Array.from(document.querySelectorAll('input[type="text"]')).slice(-4);
    const nameInput = inputs[0] as HTMLInputElement;
    const phoneInput = inputs[1] as HTMLInputElement;
    const cityInput = inputs[2] as HTMLInputElement;

    const newOrder = {
        id: "ORD-" + Math.floor(10000 + Math.random() * 90000),
        date: new Date().toLocaleDateString("fr-FR"),
        customer: nameInput?.value || "Client Web",
        city: cityInput?.value || "Non specifiee",
        phone: phoneInput?.value || "Non specifie",
        product: product ? product.name : "Produit inconnu",
        quantity: qty || 1,
        amount: product ? (parseFloat(product.price) * (qty || 1)).toFixed(2) : "0.00",
        status: "En attente",
        statusColor: "#f59e0b"
    };
    
    setStoreOrders((prev: any) => [newOrder, ...prev]);
    setPage("success");
  };

  const handleSave = async () => {
    setIsSaving(true);
    const storeConfig = {
       storeLang,
       storeName,
       storeLogo,
       storeFavicon,
       customDomain,
       activeTheme,
       primaryColor,
       fontFamily,
       heroImage,
       heroTitle,
       heroSubtitle,
       heroButtonText,
       homeCollectionsTitle,
       allCollectionsTitle,
       buyMode,
       homeBlocks,
       sliderImages,
       footerSettings,
       newsletterTitle,
       newsletterSubtitle,
       featuresData,
       videoUrl,
       storeProducts
    };
    localStorage.setItem('beya_store_config', JSON.stringify(storeConfig));
    
    // Sync to Supabase for cross-domain live preview (SaaS mode)
    try {
       const domain = customDomain || `${storeName.toLowerCase().replace(/\\s+/g, '')}.beyacreative.com`;
       
       // Update both exact domain AND a fallback to ensure changes apply immediately
       await supabase.from('stores').upsert({
          domain: domain,
          config_json: storeConfig,
          name: storeName,
          updated_at: new Date()
       }, { onConflict: 'domain' });

       

    } catch (err) {
       console.warn("Supabase sync failed (Table 'stores' might not exist yet):", err);
    }
    
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleLinkDomain = async () => {
    if (!customDomain) return;
    setIsLinkingDomain(true);
    setDomainError('');
    
    // Mock successful domain linking for MVP/SaaS UI since there's no backend API right now
    setTimeout(async () => {
       setIsLinkingDomain(false);
       await handleSave(); // Automatically save the domain to DB
    }, 1500);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    await handleSave();
    setTimeout(() => {
      setIsPublishing(false);
      setShowPublishModal(true);
    }, 1000);
  };

  const applyTheme = (theme: typeof THEMES[0]) => {
     setActiveTheme(theme);
     setPrimaryColor(theme.defaultColor);
     setFontFamily(theme.defaultFont);
     setHeroImage(theme.previewImg);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
     e.stopPropagation();
     setCartCount(c => c + 1);
  };

  // --- DYNAMIC LAYOUT COMPONENTS ---
  const EditableText = ({ text, onTextChange, isLiveStore, className, as: Tag = 'span', ...props }: any) => {
     const displayText = tr(text);
     if (isLiveStore) return <Tag className={className} {...props}>{displayText}</Tag>;
     return (
        <Tag 
           className={`${className} cursor-text hover:outline hover:outline-2 hover:outline-indigo-500 hover:outline-dashed hover:bg-black/10 transition-all px-1 rounded min-w-[20px] inline-block empty:before:content-['${storeIsAr ? "فارغ" : "Vide"}'] empty:before:text-slate-400`} 
           contentEditable 
           suppressContentEditableWarning 
           onBlur={(e: any) => onTextChange(e.currentTarget.textContent)}
           onClick={(e: any) => e.stopPropagation()}
           {...props}
        >{displayText}</Tag>
     );
  };

   const LogoEditor = ({ className, style, onClick }: any) => {
      if (isLiveStore) {
         return (
            <div onClick={onClick} className={`cursor-pointer ${className}`} style={style}>
               {storeLogo ? <img src={storeLogo} alt={storeName} className="h-10 object-contain" /> : storeName}
            </div>
         );
      }
      return (
         <label className={`cursor-pointer relative group inline-flex items-center ${className}`} style={style} onClick={(e) => e.stopPropagation()}>
            <div onClick={onClick} className="hover:opacity-80 transition-opacity outline-dashed outline-2 outline-transparent hover:outline-indigo-500 rounded px-1">
               {storeLogo ? <img src={storeLogo} alt={storeName} className="h-10 object-contain" /> : storeName}
            </div>
            <div className="absolute -top-3 -right-4 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-50" title={storeIsAr ? 'تغيير الشعار' : 'Changer le logo'}>
               <ImageIcon className="w-3 h-3" />
               <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) setStoreLogo(await readFileAsBase64(file));
               }} />
            </div>
         </label>
      );
   };

   const HeroBackgroundEditor = ({ children, className, style }: any) => {
      if (isLiveStore) return <div className={className} style={style}>{children}</div>;
      return (
         <div className={`relative group ${className}`} style={style}>
            {children}
            <label className="absolute top-4 right-4 bg-white/90 backdrop-blur text-slate-800 px-4 py-2 rounded-full text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-2 z-50 hover:bg-white border border-slate-200">
               <ImageIcon className="w-4 h-4" />{storeIsAr ? 'تغيير الصورة' : "Changer l'image"}
               <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) setHeroImage(await readFileAsBase64(file));
               }} />
            </label>
         </div>
      );
   };



  const ThemeFooter = ({ bgColor = '#f8f9fa', textColor = '#64748b', setPage }: any) => (
     <footer className="mt-auto py-12 px-6 border-t" style={{ backgroundColor: bgColor, borderColor: 'rgba(0,0,0,0.05)' }}>
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6">
           <div className="text-xl font-bold" style={{ color: primaryColor }}>{storeLogo ? <img src={storeLogo} alt={storeName} className="h-10 object-contain" /> : storeName}</div>
           <div className="flex flex-wrap justify-center gap-6 text-sm font-medium" style={{ color: textColor }}>
              {footerSettings.showPrivacy && <button onClick={() => setPage('privacy')} className="hover:opacity-70 transition-opacity">{storeIsAr ? 'سياسة الخصوصية' : 'Politique de Confidentialité'}</button>}
              {footerSettings.showTerms && <button onClick={() => setPage('terms')} className="hover:opacity-70 transition-opacity">{storeIsAr ? 'الشروط والأحكام' : 'Conditions Générales'}</button>}
              {footerSettings.showCookies && <button onClick={() => setPage('cookies')} className="hover:opacity-70 transition-opacity">{storeIsAr ? 'سياسة ملفات الارتباط' : 'Politique des Cookies'}</button>}
           </div>
           <EditableText as="p" text={footerSettings.copyright} onTextChange={(v: string) => setFooterSettings({...footerSettings, copyright: v})} isLiveStore={isLiveStore} className="text-xs opacity-70 mt-4" style={{ color: textColor }} />
        </div>
     </footer>
  );

  const LayoutHeroCenter = ({ isModal = false, page, setPage, activeProductId, navigateToProduct, buyMode, categories, activeCategory, setActiveCategory, filteredProducts, sortBy, setSortBy, setIsCartOpen, submitGlobalOrder, storeProducts }: any) => {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [activePDPTab, setActivePDPTab] = useState('description');
    
    return (
    <div className={`w-full min-h-full bg-white text-slate-900 ${fontFamily} flex flex-col`}>
      <div className={`p-6 flex justify-between items-center border-b border-slate-100 ${previewDevice === 'mobile' && !isModal ? 'flex-col gap-4' : 'flex-col md:flex-row gap-4 md:gap-0'}`}>
         <LogoEditor onClick={() => setPage('home')} className="text-2xl font-black uppercase tracking-tighter" />
         <div className={`flex gap-6 text-sm font-bold ${previewDevice === 'mobile' && !isModal ? 'hidden' : 'hidden md:flex'}`}>
            {storePages.map(p => (
               <span key={p.id} onClick={() => setPage(p.id)} className="cursor-pointer capitalize hover:opacity-70 transition-opacity" style={{ color: page === p.id ? primaryColor : '#64748b' }}>{tr(p.title)}</span>
            ))}
         </div>
         <button onClick={() => setIsCartOpen(true)} className="relative hover:scale-110 transition-transform">
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>{cartCount}</span>}
         </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {page === 'home' && (
          <>
            <div className="flex flex-col gap-0 w-full">
             {homeBlocks.map((block: string) => {
                if (block === 'hero') return (
                    <HeroBackgroundEditor key="hero" className={`h-[${isModal ? '600px' : '400px'}] flex flex-col items-center justify-center text-center p-8 bg-cover bg-center relative`} style={{ backgroundImage: `url(${heroImage})` }}>
                       <div className="absolute inset-0 bg-black/60"></div>
                       <div className="relative z-10 flex flex-col items-center">
                          <EditableText as="h1" text={heroTitle} onTextChange={setHeroTitle} isLiveStore={isLiveStore} className={`${isModal ? 'text-7xl' : 'text-5xl'} font-black text-white uppercase tracking-tighter mb-4`} />
                          <EditableText as="p" text={heroSubtitle} onTextChange={setHeroSubtitle} isLiveStore={isLiveStore} className="text-white/90 text-lg mb-8 max-w-md" />
                          <button onClick={() => setPage('collections')} className="px-8 py-3 text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded" style={{ backgroundColor: primaryColor }}>
                             <EditableText text={heroButtonText} onTextChange={setHeroButtonText} isLiveStore={isLiveStore} />
                          </button>
                       </div>
                    </HeroBackgroundEditor>
                );
                
                if (block === 'slider' && sliderImages.length > 0) return (
                    <div key="slider" className="w-full relative overflow-hidden flex bg-slate-900" style={{ height: isModal ? '500px' : '300px' }}>
                       <div className="flex w-full overflow-x-auto snap-x snap-mandatory no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {sliderImages.map((img:string, idx:number) => (
                             <div key={idx} className="min-w-full h-full snap-center relative shrink-0">
                                <img src={img} className="w-full h-full object-cover" />
                             </div>
                          ))}
                       </div>
                       {sliderImages.length > 1 && (
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                             {sliderImages.map((_:any, idx:number) => (
                                <div key={idx} className="w-2 h-2 rounded-full bg-white shadow-lg" />
                             ))}
                          </div>
                       )}
                    </div>
                );

                if (block === 'products') return (
                    <div key="products" className={`${isModal ? 'p-16 max-w-[1400px]' : 'p-8'} mx-auto w-full`}>
                       <h3 className="text-2xl font-black uppercase text-center mb-10">{homeCollectionsTitle}</h3>
                       <div className={`grid gap-8 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : (isModal ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')}`}>
                          {storeProducts.slice(0, 8).map((p: any) => (
                             <div key={p.id} className="group cursor-pointer" onClick={() => navigateToProduct(p.id)}>
                                <div className="aspect-[3/4] bg-slate-100 mb-4 overflow-hidden relative rounded-xl">
                                   {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover" alt={p.name} /> : <div className="absolute inset-0 flex items-center justify-center opacity-20"><Box className="w-12 h-12" /></div>}
                                   <div className={`absolute bottom-4 left-0 right-0 flex justify-center transition-opacity ${(previewDevice === 'mobile' && !isModal) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                      <button onClick={handleAddToCart} className="px-8 py-3 text-white text-xs font-bold uppercase tracking-wider shadow-2xl rounded-full" style={{ backgroundColor: primaryColor }}>Add to cart</button>
                                   </div>
                                </div>
                                <h4 className="font-bold text-sm">{p.name}</h4>
                                <p className="text-slate-500 text-sm mt-1">{p.price} MAD</p>
                             </div>
                          ))}
                       </div>
                    </div>
                );
                
                if (block === 'collections' && categories.length > 1) return (
                    <div key="collections" className={`${isModal ? 'p-16 max-w-[1400px]' : 'p-8'} mx-auto w-full bg-slate-50`}>
                       <h3 className="text-2xl font-black uppercase text-center mb-10">{allCollectionsTitle}</h3>
                       <div className={`grid gap-4 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-2' : (isModal ? 'grid-cols-4' : 'grid-cols-3')}`}>
                          {categories.filter((c:string) => c !== 'All').map((cat: string, idx: number) => (
                             <div key={idx} onClick={() => { setActiveCategory(cat); setPage('collections'); }} className="cursor-pointer group aspect-square relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 flex items-end p-6">
                                   <span className="text-white font-bold text-lg">{cat}</span>
                                </div>
                                <div className="absolute inset-0 bg-indigo-900/20 group-hover:bg-transparent transition-colors z-0"></div>
                                <img src={storeProducts.find((p:any)=>p.category===cat)?.image || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=600'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                             </div>
                          ))}
                       </div>
                    </div>
                );
                
                 if (block === 'newsletter') return (
                    <div key="newsletter" className="w-full py-16 px-4 bg-slate-50 border-t border-b border-slate-100 flex flex-col items-center justify-center text-center">
                       <h3 className="text-2xl font-black text-slate-900 mb-2">{newsletterTitle}</h3>
                       <p className="text-slate-500 mb-6 max-w-md text-sm">{newsletterSubtitle}</p>
                       <div className="flex w-full max-w-md">
                          <input type="email" placeholder="Votre email" className="flex-1 bg-white border border-slate-200 rounded-l-lg px-4 py-3 outline-none focus:border-slate-300" />
                          <button className="px-6 py-3 text-white font-bold rounded-r-lg" style={{ backgroundColor: primaryColor }}>S'abonner</button>
                       </div>
                    </div>
                 );
                 
                 if (block === 'features') return (
                    <div key="features" className="w-full py-12 px-4 bg-white border-b border-slate-100">
                       <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                          {featuresData.map((f: any, i: number) => (
                             <div key={i} className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                                   {f.icon === 'Truck' && <Truck className="w-6 h-6" />}
                                   {f.icon === 'ShieldCheck' && <ShieldCheck className="w-6 h-6" />}
                                   {f.icon === 'Star' && <Star className="w-6 h-6" />}
                                </div>
                                <h4 className="font-bold text-slate-900">{f.title}</h4>
                                <p className="text-slate-500 text-sm mt-1">{f.subtitle}</p>
                             </div>
                          ))}
                       </div>
                    </div>
                 );
                 
                 if (block === 'video') return (
                    <div key="video" className="w-full py-16 px-4 bg-white border-b border-slate-100 flex flex-col items-center justify-center">
                       <div className="w-full max-w-4xl aspect-video bg-slate-100 rounded-2xl overflow-hidden shadow-xl">
                          {videoUrl ? (
                             <iframe src={videoUrl} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media"></iframe>
                          ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                <Video className="w-16 h-16 mb-4 opacity-50" />
                                <p>Aucune vidéo sélectionnée</p>
                             </div>
                          )}
                       </div>
                    </div>
                 );
                 
                 return null;
             })}
          </div>
          </>
        )}
        {page === 'collections' && (
            <div className={`${isModal ? 'p-16 max-w-[1400px]' : 'p-8'} mx-auto w-full`}>
               <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                  <h3 className="text-2xl font-black uppercase text-center md:text-left">{tr('All Products')}</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                     {categories && categories.length > 1 && (
                        <div className="flex flex-wrap gap-2 justify-center">
                           {categories.map((c: string) => (
                              <button key={tr(c)} onClick={() => setActiveCategory(c)} className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${activeCategory === c ? 'text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`} style={{ backgroundColor: activeCategory === c ? primaryColor : undefined }}>
                                 {tr(c)}
                              </button>
                           ))}
                        </div>
                     )}
                     <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-full focus:ring-slate-500 focus:border-slate-500 block px-4 py-2 outline-none cursor-pointer">
                        <option value="featured">{tr('Recommandé')}</option>
                        <option value="price-low-high">{tr('Prix: Croissant')}</option>
                        <option value="price-high-low">{tr('Prix: Décroissant')}</option>
                        <option value="az">{tr('De A à Z')}</option>
                        <option value="za">{tr('De Z à A')}</option>
                     </select>
                  </div>
               </div>
               <div className={`grid gap-8 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : (isModal ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')}`}>
                  {filteredProducts.map((p: any) => (
                     <div key={p.id} className="group cursor-pointer" onClick={() => navigateToProduct(p.id)}>
                        <div className="aspect-[3/4] bg-slate-100 mb-4 overflow-hidden relative rounded-xl">
                           {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover" alt={p.name} /> : <div className="absolute inset-0 flex items-center justify-center opacity-20"><Box className="w-12 h-12" /></div>}
                           <div className={`absolute bottom-4 left-0 right-0 flex justify-center transition-opacity ${(previewDevice === 'mobile' && !isModal) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              <button onClick={handleAddToCart} className="px-8 py-3 text-white text-xs font-bold uppercase tracking-wider shadow-2xl rounded-full" style={{ backgroundColor: primaryColor }}>Add to cart</button>
                           </div>
                        </div>
                        <h4 className="font-bold text-sm">{p.name}</h4>
                        <p className="text-slate-500 text-sm mt-1">{p.price} MAD</p>
                     </div>
                  ))}
               </div>
            </div>
        )}
        {page === 'about' && (
           <div className={`${isModal ? 'p-16 max-w-3xl' : 'p-8'} mx-auto w-full text-center mt-10`}>
              <h3 className="text-3xl font-black uppercase mb-6 text-slate-800">About {storeName}</h3>
              <p className="text-slate-500 text-lg leading-relaxed mb-6">Welcome to {storeName}. We are dedicated to providing the best quality products for our customers. Every piece is carefully crafted to ensure maximum comfort and style.</p>
           </div>
        )}
        {page === 'product' && activeProductId && (
           <div className={`${isModal ? 'p-16 max-w-[1200px]' : 'p-8'} mx-auto w-full`}>
              {storeProducts.filter(p => p.id === activeProductId).map(p => (
                 <div key={p.id} className={`flex gap-12 ${previewDevice === 'mobile' && !isModal ? 'flex-col' : 'flex-col md:flex-row'}`}>
                    <div className="flex-1 aspect-[4/5] bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden">
                       {(selectedColor && p.colorImages?.[selectedColor]) ? <img src={p.colorImages[selectedColor]} className="w-full h-full object-cover" alt={p.name} /> : (p.image ? <img src={p.image} className="w-full h-full object-cover" alt={p.name} /> : <ImageIcon className="w-20 h-20 opacity-10" />)}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                       <h2 className="text-4xl font-black mb-4">{p.name}</h2>
                       <p className="text-2xl font-bold mb-8" style={{ color: primaryColor }}>{p.price} MAD</p>
                       <p className="text-slate-500 mb-8 leading-relaxed">{p.description || 'This is a premium quality product. Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}</p>
                       
                       {/* PRO SELECTORS */}
                       <div className="mb-8 space-y-6">
                          {p.colors?.length > 0 && (
                             <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">{storeIsAr ? 'لون' : 'Couleur'}</span>
                                <div className="flex gap-3">
                                   {p.colors.map((c: string) => (
                                      <button key={tr(c)} onClick={() => setSelectedColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === c ? 'border-slate-800 scale-125' : 'border-transparent hover:scale-110 shadow-sm'}`} style={{ backgroundColor: c }} />
                                   ))}
                                </div>
                             </div>
                          )}
                          {p.sizes?.length > 0 && (
                             <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">{storeIsAr ? 'المقاس' : 'Taille'}</span>
                                <div className="flex flex-wrap gap-2">
                                   {p.sizes.map((s: string) => (
                                      <button key={s} onClick={() => setSelectedSize(s)} className={`px-4 py-2 text-sm font-bold border rounded-lg transition-colors ${selectedSize === s ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'}`}>
                                         {s}
                                      </button>
                                   ))}
                                </div>
                             </div>
                          )}
                          <div>
                             <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">{storeIsAr ? 'الكمية' : 'Quantité'}</span>
                             <div className="flex items-center justify-between bg-slate-50 w-32 px-4 py-2 rounded-lg border border-slate-200">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-slate-500 hover:text-slate-800 font-bold text-lg">-</button>
                                <span className="font-bold text-slate-800">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="text-slate-500 hover:text-slate-800 font-bold text-lg">+</button>
                             </div>
                          </div>
                       </div>

                       {buyMode === 'form' ? (
                          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                             <h4 className="font-black text-slate-800 mb-2">{storeLang === 'ar' ? 'شراء سريع' : storeLang === 'en' ? 'Express Checkout' : 'Achat Express'}</h4>
                             <input type="text" placeholder={storeLang === 'ar' ? 'الاسم الكامل' : storeLang === 'en' ? 'Full Name' : 'Nom Complet'} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm" />
                             <input type="text" placeholder={storeLang === 'ar' ? 'رقم الهاتف' : storeLang === 'en' ? 'Phone Number' : 'Numéro de Téléphone'} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm" />
                             <input type="text" placeholder={storeLang === 'ar' ? 'المدينة' : storeLang === 'en' ? 'City' : 'Ville'} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm" />
                              <input type="text" placeholder={storeLang === 'ar' ? 'العنوان' : storeLang === 'en' ? 'Delivery Address' : 'Adresse de Livraison'} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm" />
                             <button onClick={() => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1)} className="w-full py-4 text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded-xl shadow-lg mt-2" style={{ backgroundColor: primaryColor }}>{storeLang === 'ar' ? 'تأكيد الطلب (الدفع عند الاستلام)' : storeLang === 'en' ? 'Confirm Order (COD)' : 'Confirmer la Commande'}</button>
                              <p className="text-center text-xs font-bold text-green-600 mt-4 flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" /> {storeLang === 'ar' ? 'توصيل مجاني (الدفع عند الاستلام)' : storeLang === 'en' ? 'Free Delivery (Cash on Delivery)' : 'Livraison Gratuite (Paiement à la livraison)'}</p>
                          </div>
                       ) : (
                          <div className="flex gap-4">
                             {(buyMode === 'cart' || buyMode === 'both') && (
                                <button onClick={handleAddToCart} className="flex-1 px-8 py-4 text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded-xl shadow-lg" style={{ backgroundColor: '#1e293b' }}>Add to cart</button>
                             )}
                             {(buyMode === 'direct' || buyMode === 'both') && (
                                <button onClick={() => setPage('checkout')} className="flex-1 px-8 py-4 text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded-xl shadow-lg" style={{ backgroundColor: primaryColor }}>Buy Now</button>
                             )}
                          </div>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        )}
        {page === 'checkout' && (
           <div className={`${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full`}>
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                 <h2 className="text-2xl font-black mb-6 text-center text-slate-800">{storeLang === 'ar' ? 'شراء سريع' : storeLang === 'en' ? 'Express Checkout' : 'Achat Express'}</h2>
                 <div className="space-y-4">
                    <input type="text" placeholder={storeLang === 'ar' ? 'الاسم الكامل' : storeLang === 'en' ? 'Full Name' : 'Nom Complet'} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500" />
                    <input type="text" placeholder={storeLang === 'ar' ? 'رقم الهاتف' : storeLang === 'en' ? 'Phone Number' : 'Numéro de Téléphone'} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500" />
                    <input type="text" placeholder={storeLang === 'ar' ? 'المدينة' : storeLang === 'en' ? 'City' : 'Ville'} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500" />
                              <input type="text" placeholder={storeLang === 'ar' ? 'العنوان' : storeLang === 'en' ? 'Delivery Address' : 'Adresse de Livraison'} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500" />
                    <button onClick={() => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1)} className="w-full py-4 text-white font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded-xl shadow-lg mt-4" style={{ backgroundColor: primaryColor }}>{storeLang === 'ar' ? 'تأكيد الطلب (الدفع عند الاستلام)' : storeLang === 'en' ? 'Confirm Order (COD)' : 'Confirmer la Commande'}</button>
                              <p className="text-center text-xs font-bold text-green-600 mt-4 flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" /> {storeLang === 'ar' ? 'توصيل مجاني (الدفع عند الاستلام)' : storeLang === 'en' ? 'Free Delivery (Cash on Delivery)' : 'Livraison Gratuite (Paiement à la livraison)'}</p>
                 </div>
              </div>
           </div>
        )}
        {page === 'success' && (
           <div className={`${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full text-center flex flex-col items-center justify-center min-h-[400px]`}>
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100/50">
                 <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-4xl font-black mb-4 text-slate-800">Order Placed!</h2>
              <p className="text-slate-500 text-lg">Thank you! Your order has been successfully sent to the BEYA ERP system.</p>
              <button onClick={() => setPage('home')} className="mt-8 px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">Return to Home</button>
           </div>
        )}
        {['privacy', 'terms', 'cookies'].includes(page) && (
           <div className={`${isModal ? 'p-16 max-w-4xl' : 'p-8'} mx-auto w-full`}>
              <h1 className="text-3xl font-black mb-6 text-slate-800">
                {page === 'privacy' ? (storeIsAr ? 'سياسة الخصوصية' : 'Politique de Confidentialité') : page === 'terms' ? (storeIsAr ? 'الشروط والأحكام' : 'Conditions Générales') : (storeIsAr ? 'سياسة ملفات الارتباط' : 'Politique des Cookies')}
              </h1>
              <div className="prose prose-slate max-w-none text-slate-600 space-y-4">
                 <p>{storeIsAr ? 'آخر تحديث : ' : 'Dernière mise à jour : '}{new Date().toLocaleDateString()}</p>
                 <p>{storeIsAr ? 'هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التى يولدها التطبيق.' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.'}</p>
                 <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">{storeIsAr ? '1. جمع البيانات' : '1. Collecte des données'}</h3>
                 <p>{storeIsAr ? 'إذا كنت تحتاج إلى عدد أكبر من الفقرات يتيح لك مولد النص العربى زيادة عدد الفقرات كما تريد، النص لن يبدو مقسما ولا يحوي أخطاء لغوية، مولد النص العربى مفيد لمصممي المواقع على وجه الخصوص.' : 'Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim.'}</p>
                 <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">{storeIsAr ? '2. الاستخدام' : '2. Utilisation'}</h3>
                 <p>{storeIsAr ? 'حيث يحتاج العميل فى كثير من الأحيان أن يطلع على صورة حقيقية لتصميم الموقع. ومن هنا وجب على المصمم أن يضع نصوصا مؤقتة على التصميم ليظهر للعميل الشكل كاملاً.' : 'Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede.'}</p>
              </div>
           </div>
        )}
        <ThemeFooter setPage={setPage} />
      </div>
    </div>
  );
  };

  const LayoutSplitScreen = ({ isModal = false, page, setPage, activeProductId, navigateToProduct, buyMode, categories, activeCategory, setActiveCategory, filteredProducts, sortBy, setSortBy, setIsCartOpen, submitGlobalOrder, storeProducts }: any) => {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);

    return (
    <div className={`w-full min-h-full bg-[#f8f9fa] text-[#212529] ${fontFamily} flex flex-col`}>
      <div className={`px-8 py-6 flex justify-between items-center bg-white ${previewDevice === 'mobile' && !isModal ? 'flex-col gap-4' : 'flex-col md:flex-row gap-4 md:gap-0'}`}>
         <div className={`flex gap-8 text-sm ${previewDevice === 'mobile' && !isModal ? 'hidden' : 'hidden md:flex'}`}>
            {storePages.map(p => (
               <span key={p.id} onClick={() => setPage(p.id)} className={`cursor-pointer capitalize pb-1 border-b-2 ${page === p.id ? 'border-current' : 'border-transparent text-gray-400'}`}>{tr(p.title)}</span>
            ))}
         </div>
         <LogoEditor onClick={() => setPage('home')} className="text-3xl font-normal tracking-wide" style={{ color: primaryColor }} />
         <button className="relative" onClick={() => alert(storeIsAr ? 'تم النقر على السلة!' : 'Panier cliqué !')}>
            <ShoppingBag className="w-6 h-6 font-light" />
            {cartCount > 0 && <span className="absolute -top-2 -right-2 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>{cartCount}</span>}
         </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {page === 'home' && (
          <>
            <div className={`flex ${previewDevice === 'mobile' && !isModal ? 'flex-col' : 'flex-col md:flex-row'} h-auto md:h-[${isModal ? '600px' : '400px'}] bg-white`}>
               <div className="flex-1 flex flex-col justify-center p-12">
                  <h1 className="text-5xl font-light leading-tight mb-6" style={{ color: primaryColor }}>Elegance in <br/>Simplicity.</h1>
                  <p className="text-gray-500 mb-8 max-w-sm leading-relaxed">Experience a collection defined by pure lines and organic materials.</p>
                  <button onClick={() => setPage('collections')} className="w-max px-10 py-4 text-white text-sm tracking-widest transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>DISCOVER</button>
               </div>
               <HeroBackgroundEditor className="flex-1 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
            </div>
            <div className={`${isModal ? 'p-20' : 'p-8'} mx-auto w-full`}>
               <div className="flex justify-between items-end mb-12 border-b pb-4">
                  <h3 className="text-2xl font-light">New Arrivals</h3>
                  <span className="text-sm cursor-pointer hover:underline" style={{ color: primaryColor }}>View all</span>
               </div>
               <div className={`grid gap-x-8 gap-y-12 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                  {storeProducts.map((p: any) => (
                     <div key={p.id} className="group cursor-pointer" onClick={() => navigateToProduct(p.id)}>
                        <div className="aspect-[4/5] bg-gray-100 mb-6 relative overflow-hidden flex items-center justify-center">
                           {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover" alt={p.name} /> : <div className="absolute inset-0 flex items-center justify-center opacity-10"><ImageIcon className="w-16 h-16" /></div>}
                           <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={handleAddToCart} className="px-8 py-3 bg-white text-black text-xs tracking-widest hover:bg-black hover:text-white transition-colors">ADD TO CART</button>
                           </div>
                        </div>
                        <h4 className="font-medium text-lg mb-2">{p.name}</h4>
                        <p className="text-gray-500">{p.price} MAD</p>
                     </div>
                  ))}
               </div>
            </div>
          </>
        )}
        {page === 'collections' && (
            <div className={`${isModal ? 'p-20' : 'p-8'} mx-auto w-full`}>
               <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b pb-4 gap-6">
                  <h3 className="text-2xl font-light">{tr('All Products')}</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                     {categories && categories.length > 1 && (
                        <div className="flex flex-wrap gap-4 text-sm">
                           {categories.map((c: string) => (
                              <button key={tr(c)} onClick={() => setActiveCategory(c)} className={`pb-1 border-b-2 transition-colors ${activeCategory === c ? 'border-current' : 'border-transparent text-gray-400 hover:text-black'}`} style={{ color: activeCategory === c ? primaryColor : undefined }}>
                                 {tr(c)}
                              </button>
                           ))}
                        </div>
                     )}
                     <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent border-none text-gray-500 text-sm focus:ring-0 outline-none cursor-pointer">
                        <option value="featured">{tr('Sort: Featured')}</option>
                        <option value="price-low-high">{tr('Price: Low to High')}</option>
                        <option value="price-high-low">{tr('Price: High to Low')}</option>
                     </select>
                  </div>
               </div>
               <div className={`grid gap-x-8 gap-y-12 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                  {filteredProducts.map((p: any) => (
                     <div key={p.id} className="group cursor-pointer" onClick={() => navigateToProduct(p.id)}>
                        <div className="aspect-[4/5] bg-gray-100 mb-6 relative overflow-hidden flex items-center justify-center">
                           {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover" alt={p.name} /> : <div className="absolute inset-0 flex items-center justify-center opacity-10"><ImageIcon className="w-16 h-16" /></div>}
                           <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={handleAddToCart} className="px-8 py-3 bg-white text-black text-xs tracking-widest hover:bg-black hover:text-white transition-colors">ADD TO CART</button>
                           </div>
                        </div>
                        <h4 className="font-medium text-lg mb-2">{p.name}</h4>
                        <p className="text-gray-500">{p.price} MAD</p>
                     </div>
                  ))}
               </div>
            </div>
        )}
        {page === 'about' && (
           <div className={`${isModal ? 'p-20 max-w-4xl' : 'p-8'} mx-auto w-full text-center mt-12`}>
              <h3 className="text-4xl font-light mb-8">About {storeName}</h3>
              <p className="text-gray-500 text-xl font-light leading-relaxed mb-6">Welcome to {storeName}. We are dedicated to providing the best quality products for our customers. Every piece is carefully crafted to ensure maximum comfort and style.</p>
           </div>
        )}
        {page === 'product' && activeProductId && (
           <div className={`${isModal ? 'p-20 max-w-5xl' : 'p-8'} mx-auto w-full`}>
              {storeProducts.filter(p => p.id === activeProductId).map(p => (
                 <div key={p.id} className={`flex gap-16 ${previewDevice === 'mobile' && !isModal ? 'flex-col' : 'flex-col md:flex-row'}`}>
                    <div className="flex-1 relative flex items-center justify-center bg-gray-50 overflow-hidden aspect-[3/4]">
                       {(selectedColor && p.colorImages?.[selectedColor]) ? <img src={p.colorImages[selectedColor]} className="w-full h-full object-cover" alt={p.name} /> : (p.image ? <img src={p.image} className="w-full h-full object-cover" alt={p.name} /> : <ImageIcon className="w-20 h-20 opacity-10 absolute inset-0 m-auto" />)}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                       <h2 className="text-5xl font-light mb-4">{p.name}</h2>
                       <p className="text-2xl font-light text-gray-500 mb-8">{p.price} MAD</p>
                       <p className="text-gray-500 mb-12 leading-relaxed font-light">{p.description || 'Experience true elegance with this meticulously designed piece. Perfect for every occasion.'}</p>
                       
                       {/* PRO SELECTORS */}
                       <div className="mb-12 space-y-8">
                          {p.colors?.length > 0 && (
                             <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 block">Color</span>
                                <div className="flex gap-4">
                                   {p.colors.map((c: string) => (
                                      <button key={tr(c)} onClick={() => setSelectedColor(c)} className={`w-6 h-6 rounded-full border border-gray-200 transition-all ${selectedColor === c ? 'ring-1 ring-offset-4 ring-black' : 'hover:scale-110'}`} style={{ backgroundColor: c }} />
                                   ))}
                                </div>
                             </div>
                          )}
                          {p.sizes?.length > 0 && (
                             <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 block">Size</span>
                                <div className="flex flex-wrap gap-3">
                                   {p.sizes.map((s: string) => (
                                      <button key={s} onClick={() => setSelectedSize(s)} className={`px-4 py-2 text-xs tracking-widest border transition-colors ${selectedSize === s ? 'bg-black border-black text-white' : 'bg-transparent border-gray-200 text-gray-600 hover:border-black'}`}>
                                         {s}
                                      </button>
                                   ))}
                                </div>
                             </div>
                          )}
                          <div>
                             <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 block">Quantity</span>
                             <div className="flex items-center justify-between border-b border-gray-200 w-24 pb-2">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-400 hover:text-black font-light text-lg">-</button>
                                <span className="font-light text-black">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="text-gray-400 hover:text-black font-light text-lg">+</button>
                             </div>
                          </div>
                       </div>

                       {buyMode === 'form' ? (
                          <div className="p-8 border border-gray-200 bg-white space-y-4">
                             <h4 className="text-xl font-light mb-4" style={{ color: primaryColor }}>Checkout</h4>
                             <input type="text" placeholder={storeLang === 'ar' ? 'الاسم الكامل' : storeLang === 'en' ? 'Full Name' : 'Nom Complet'} className="w-full px-0 py-3 border-b border-gray-300 focus:border-black focus:outline-none rounded-none bg-transparent" />
                             <input type="text" placeholder={storeLang === 'ar' ? 'رقم الهاتف' : storeLang === 'en' ? 'Phone Number' : 'Numéro de Téléphone'} className="w-full px-0 py-3 border-b border-gray-300 focus:border-black focus:outline-none rounded-none bg-transparent" />
                             <input type="text" placeholder={storeLang === 'ar' ? 'المدينة' : storeLang === 'en' ? 'City' : 'Ville'} className="w-full px-0 py-3 border-b border-gray-300 focus:border-black focus:outline-none rounded-none bg-transparent" />
                              <input type="text" placeholder={storeLang === 'ar' ? 'العنوان' : storeLang === 'en' ? 'Delivery Address' : 'Adresse de Livraison'} className="w-full px-0 py-3 border-b border-gray-300 focus:border-black focus:outline-none rounded-none bg-transparent" />
                             <button onClick={() => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1)} className="w-full py-5 text-white text-xs tracking-widest mt-4 transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>CONFIRM ORDER</button>
                          </div>
                       ) : (
                          <div className="flex gap-4">
                             {(buyMode === 'cart' || buyMode === 'both') && (
                                <button onClick={handleAddToCart} className="w-max px-12 py-4 bg-white border border-black text-black text-xs tracking-widest hover:bg-gray-100 transition-colors">ADD TO CART</button>
                             )}
                             {(buyMode === 'direct' || buyMode === 'both') && (
                                <button onClick={() => setPage('checkout')} className="w-max px-12 py-4 text-white text-xs tracking-widest transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>BUY NOW</button>
                             )}
                          </div>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        )}
        {page === 'checkout' && (
           <div className={`${isModal ? 'p-20 max-w-2xl' : 'p-8'} mx-auto w-full`}>
              <div className="p-12 border border-gray-200 bg-white">
                 <h2 className="text-3xl font-light mb-8 text-center" style={{ color: primaryColor }}>Checkout</h2>
                 <div className="space-y-6">
                    <input type="text" placeholder={storeLang === 'ar' ? 'الاسم الكامل' : storeLang === 'en' ? 'Full Name' : 'Nom Complet'} className="w-full px-0 py-3 border-b border-gray-300 focus:border-black focus:outline-none rounded-none bg-transparent" />
                    <input type="text" placeholder={storeLang === 'ar' ? 'رقم الهاتف' : storeLang === 'en' ? 'Phone Number' : 'Numéro de Téléphone'} className="w-full px-0 py-3 border-b border-gray-300 focus:border-black focus:outline-none rounded-none bg-transparent" />
                    <input type="text" placeholder={storeLang === 'ar' ? 'المدينة' : storeLang === 'en' ? 'City' : 'Ville'} className="w-full px-0 py-3 border-b border-gray-300 focus:border-black focus:outline-none rounded-none bg-transparent" />
                              <input type="text" placeholder={storeLang === 'ar' ? 'العنوان' : storeLang === 'en' ? 'Delivery Address' : 'Adresse de Livraison'} className="w-full px-0 py-3 border-b border-gray-300 focus:border-black focus:outline-none rounded-none bg-transparent" />
                    <button onClick={() => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1)} className="w-full py-5 text-white text-xs tracking-widest mt-8 transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>CONFIRM ORDER</button>
                 </div>
              </div>
           </div>
        )}
        {page === 'success' && (
           <div className={`${isModal ? 'p-20 max-w-2xl' : 'p-8'} mx-auto w-full text-center py-20`}>
              <h2 className="text-5xl font-light mb-6" style={{ color: primaryColor }}>Thank You.</h2>
              <p className="text-gray-500 text-xl font-light mb-12">Your order has been successfully placed.</p>
              <button onClick={() => setPage('home')} className="px-10 py-4 border border-black text-xs tracking-widest hover:bg-black hover:text-white transition-colors">CONTINUE SHOPPING</button>
           </div>
        )}
      </div>
    </div>
  );
  };

  const LayoutElegant = ({ isModal = false, page, setPage, activeProductId, navigateToProduct, buyMode, categories, activeCategory, setActiveCategory, filteredProducts, sortBy, setSortBy, setIsCartOpen, submitGlobalOrder, storeProducts }: any) => {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);

    return (
    <div className={`w-full min-h-full bg-[#111] text-[#f5f5f5] ${fontFamily} flex flex-col`}>
      <div className={`p-8 flex flex-col items-center gap-6 border-b border-white/10 ${previewDevice === 'mobile' && !isModal ? 'p-4' : 'p-4 md:p-8'}`}>
         <LogoEditor onClick={() => setPage('home')} className="text-4xl font-serif tracking-widest" style={{ color: primaryColor }} />
         <div className={`flex gap-12 text-xs tracking-widest uppercase ${previewDevice === 'mobile' && !isModal ? 'hidden' : 'hidden md:flex'}`}>
            {storePages.map(p => (
               <span key={p.id} onClick={() => setPage(p.id)} className="cursor-pointer hover:text-white transition-colors" style={{ color: page === p.id ? primaryColor : '#888' }}>{tr(p.title)}</span>
            ))}
            <span className="cursor-pointer hover:text-white flex items-center gap-2" onClick={() => alert(storeIsAr ? 'تم النقر على السلة!' : 'Panier cliqué !')}>
               CART ({cartCount})
            </span>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {page === 'home' && (
          <>
            <div className="p-8">
               <HeroBackgroundEditor className={`w-full h-[${isModal ? '700px' : '500px'}] bg-cover bg-center relative rounded-sm border`} style={{ backgroundImage: `url(${heroImage})`, borderColor: `${primaryColor}40` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent"></div>
                  <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
                     <div>
                        <h1 className="text-5xl font-serif mb-4">The Royal Edit.</h1>
                        <button onClick={() => setPage('collections')} className="px-8 py-3 text-xs tracking-widest border transition-colors" style={{ borderColor: primaryColor, color: primaryColor }}>EXPLORE COLLECTION</button>
                     </div>
                  </div>
               </HeroBackgroundEditor>
            </div>
            <div className={`${isModal ? 'p-16' : 'p-8'} mx-auto w-full`}>
               <h3 className="text-xl tracking-widest uppercase text-center mb-16" style={{ color: primaryColor }}>Curated Selection</h3>
               <div className={`grid gap-4 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  {storeProducts.map((p: any) => (
                     <div key={p.id} className="group cursor-pointer relative aspect-square bg-[#1a1a1a] border border-white/5 p-4 flex flex-col items-center justify-center" onClick={() => navigateToProduct(p.id)}>
                        {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover mb-8" alt={p.name} /> : <ImageIcon className="w-16 h-16 opacity-10 mb-8" />}
                        <h4 className="font-serif text-2xl mb-2 group-hover:text-white transition-colors" style={{ color: primaryColor }}>{p.name}</h4>
                        <p className="text-white/50 tracking-widest text-sm mb-6">{p.price} MAD</p>
                        <button onClick={handleAddToCart} className="opacity-0 group-hover:opacity-100 transition-opacity px-6 py-2 bg-white text-black text-xs tracking-widest">ADD TO CART</button>
                     </div>
                  ))}
               </div>
            </div>
          </>
        )}
        {page === 'collections' && (
            <div className={`${isModal ? 'p-16' : 'p-8'} mx-auto w-full`}>
               <h3 className="text-xl tracking-widest uppercase text-center mb-8" style={{ color: primaryColor }}>{tr('All Products')}</h3>
               <div className="flex flex-col items-center gap-6 mb-16">
                  {categories && categories.length > 1 && (
                     <div className="flex flex-wrap justify-center gap-8 text-xs tracking-widest uppercase">
                        {categories.map((c: string) => (
                           <button key={tr(c)} onClick={() => setActiveCategory(c)} className="transition-colors" style={{ color: activeCategory === c ? '#fff' : '#555', borderBottom: activeCategory === c ? `1px solid ${primaryColor}` : '1px solid transparent', paddingBottom: '4px' }}>
                              {tr(c)}
                           </button>
                        ))}
                     </div>
                  )}
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent border border-white/20 text-[#888] text-xs tracking-widest uppercase focus:border-white focus:outline-none cursor-pointer py-2 px-4 rounded-sm">
                     <option value="featured">{tr('Featured')}</option>
                     <option value="price-low-high">{tr('Price: Low - High')}</option>
                     <option value="price-high-low">{tr('Price: High - Low')}</option>
                  </select>
               </div>
               <div className={`grid gap-4 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  {filteredProducts.map((p: any) => (
                     <div key={p.id} className="group cursor-pointer relative aspect-square bg-[#1a1a1a] border border-white/5 p-4 flex flex-col items-center justify-center" onClick={() => navigateToProduct(p.id)}>
                        {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover mb-8" alt={p.name} /> : <ImageIcon className="w-16 h-16 opacity-10 mb-8" />}
                        <h4 className="font-serif text-2xl mb-2 group-hover:text-white transition-colors" style={{ color: primaryColor }}>{p.name}</h4>
                        <p className="text-white/50 tracking-widest text-sm mb-6">{p.price} MAD</p>
                        <button onClick={handleAddToCart} className="opacity-0 group-hover:opacity-100 transition-opacity px-6 py-2 bg-white text-black text-xs tracking-widest">ADD TO CART</button>
                     </div>
                  ))}
               </div>
            </div>
        )}
        {page === 'about' && (
           <div className={`${isModal ? 'p-16 max-w-3xl' : 'p-8'} mx-auto w-full text-center mt-12`}>
              <h3 className="text-3xl font-serif mb-8 text-white">About {storeName}</h3>
              <p className="text-[#888] text-lg tracking-wide leading-relaxed mb-6">Welcome to {storeName}. We are dedicated to providing the best quality products for our customers. Every piece is carefully crafted to ensure maximum comfort and style.</p>
           </div>
        )}
        {page === 'product' && activeProductId && (
           <div className={`${isModal ? 'p-16 max-w-5xl' : 'p-8'} mx-auto w-full`}>
              {storeProducts.filter(p => p.id === activeProductId).map(p => (
                 <div key={p.id} className={`flex gap-16 ${previewDevice === 'mobile' && !isModal ? 'flex-col' : 'flex-col md:flex-row'}`}>
                    <div className="flex-1 bg-white/5 border border-white/10 flex items-center justify-center aspect-[3/4] overflow-hidden relative">
                       {(selectedColor && p.colorImages?.[selectedColor]) ? <img src={p.colorImages[selectedColor]} className="w-full h-full object-cover absolute inset-0" alt={p.name} /> : (p.image ? <img src={p.image} className="w-full h-full object-cover absolute inset-0" alt={p.name} /> : <ImageIcon className="w-20 h-20 opacity-10" />)}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                       <h2 className="text-5xl font-serif mb-4 text-white">{p.name}</h2>
                       <p className="text-2xl tracking-widest mb-8" style={{ color: primaryColor }}>{p.price} MAD</p>
                       <div className="w-12 h-px bg-white/20 mb-8"></div>
                       <p className="text-[#888] mb-12 tracking-wide leading-relaxed">{p.description || 'Embrace luxury with this exclusive item. Crafted with precision for the modern elegant individual.'}</p>
                       
                       {/* PRO SELECTORS */}
                       <div className="mb-12 space-y-8">
                          {p.colors?.length > 0 && (
                             <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-4 block">Color</span>
                                <div className="flex gap-4">
                                   {p.colors.map((c: string) => (
                                      <button key={tr(c)} onClick={() => setSelectedColor(c)} className={`w-6 h-6 rounded-full border border-white/20 transition-all ${selectedColor === c ? 'ring-1 ring-offset-4 ring-offset-[#111] ring-white scale-110' : 'hover:scale-110'}`} style={{ backgroundColor: c }} />
                                   ))}
                                </div>
                             </div>
                          )}
                          {p.sizes?.length > 0 && (
                             <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-4 block">Size</span>
                                <div className="flex flex-wrap gap-3">
                                   {p.sizes.map((s: string) => (
                                      <button key={s} onClick={() => setSelectedSize(s)} className={`px-4 py-2 text-xs tracking-widest border transition-colors ${selectedSize === s ? 'bg-white border-white text-black' : 'bg-transparent border-white/20 text-white/70 hover:border-white'}`}>
                                         {s}
                                      </button>
                                   ))}
                                </div>
                             </div>
                          )}
                          <div>
                             <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-4 block">Quantity</span>
                             <div className="flex items-center justify-between border-b border-white/20 w-24 pb-2">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-white/50 hover:text-white font-light text-lg">-</button>
                                <span className="font-light text-white">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="text-white/50 hover:text-white font-light text-lg">+</button>
                             </div>
                          </div>
                       </div>

                       {buyMode === 'form' ? (
                          <div className="p-8 border border-white/10 bg-[#151515] space-y-4">
                             <h4 className="text-xl font-serif mb-4 text-white">Secure Checkout</h4>
                             <input type="text" placeholder={storeLang === 'ar' ? 'الاسم الكامل' : storeLang === 'en' ? 'Full Name' : 'Nom Complet'} className="w-full px-4 py-3 bg-[#111] border border-white/10 text-white focus:border-white/50 focus:outline-none rounded-none" />
                             <input type="text" placeholder={storeLang === 'ar' ? 'رقم الهاتف' : storeLang === 'en' ? 'Phone Number' : 'Numéro de Téléphone'} className="w-full px-4 py-3 bg-[#111] border border-white/10 text-white focus:border-white/50 focus:outline-none rounded-none" />
                             <input type="text" placeholder={storeLang === 'ar' ? 'المدينة' : storeLang === 'en' ? 'City' : 'Ville'} className="w-full px-4 py-3 bg-[#111] border border-white/10 text-white focus:border-white/50 focus:outline-none rounded-none" />
                              <input type="text" placeholder={storeLang === 'ar' ? 'العنوان' : storeLang === 'en' ? 'Delivery Address' : 'Adresse de Livraison'} className="w-full px-4 py-3 bg-[#111] border border-white/10 text-white focus:border-white/50 focus:outline-none rounded-none" />
                             <button onClick={() => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1)} className="w-full py-5 bg-white text-black text-xs tracking-widest mt-4 hover:bg-gray-200 transition-colors">PLACE ORDER</button>
                          </div>
                       ) : (
                          <div className="flex gap-4">
                             {(buyMode === 'cart' || buyMode === 'both') && (
                                <button onClick={handleAddToCart} className="w-max px-12 py-4 border border-white/20 text-white text-xs tracking-widest hover:bg-white/5 transition-colors">ADD TO CART</button>
                             )}
                             {(buyMode === 'direct' || buyMode === 'both') && (
                                <button onClick={() => setPage('checkout')} className="w-max px-12 py-4 bg-white text-black text-xs tracking-widest hover:bg-gray-200 transition-colors">BUY NOW</button>
                             )}
                          </div>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        )}
        {page === 'checkout' && (
           <div className={`${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full`}>
              <div className="p-12 border border-white/10 bg-[#151515]">
                 <h2 className="text-3xl font-serif mb-8 text-center text-white">Secure Checkout</h2>
                 <div className="space-y-6">
                    <input type="text" placeholder={storeLang === 'ar' ? 'الاسم الكامل' : storeLang === 'en' ? 'Full Name' : 'Nom Complet'} className="w-full px-4 py-3 bg-[#111] border border-white/10 text-white focus:border-white/50 focus:outline-none rounded-none" />
                    <input type="text" placeholder={storeLang === 'ar' ? 'رقم الهاتف' : storeLang === 'en' ? 'Phone Number' : 'Numéro de Téléphone'} className="w-full px-4 py-3 bg-[#111] border border-white/10 text-white focus:border-white/50 focus:outline-none rounded-none" />
                    <input type="text" placeholder={storeLang === 'ar' ? 'المدينة' : storeLang === 'en' ? 'City' : 'Ville'} className="w-full px-4 py-3 bg-[#111] border border-white/10 text-white focus:border-white/50 focus:outline-none rounded-none" />
                              <input type="text" placeholder={storeLang === 'ar' ? 'العنوان' : storeLang === 'en' ? 'Delivery Address' : 'Adresse de Livraison'} className="w-full px-4 py-3 bg-[#111] border border-white/10 text-white focus:border-white/50 focus:outline-none rounded-none" />
                    <button onClick={() => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1)} className="w-full py-5 bg-white text-black text-xs tracking-widest mt-8 hover:bg-gray-200 transition-colors">PLACE ORDER</button>
                 </div>
              </div>
           </div>
        )}
        {page === 'success' && (
           <div className={`${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full text-center py-20`}>
              <h2 className="text-4xl font-serif mb-6 text-white">Order Confirmed</h2>
              <p className="text-[#888] text-lg tracking-wide mb-12">An expression of elegance is on its way to you.</p>
              <button onClick={() => setPage('home')} className="px-10 py-4 border border-white/20 text-white text-xs tracking-widest hover:bg-white/5 transition-colors">RETURN</button>
           </div>
        )}
      </div>
    </div>
  );
  };

  const LayoutPlayful = ({ isModal = false, page, setPage, activeProductId, navigateToProduct, buyMode, categories, activeCategory, setActiveCategory, filteredProducts, sortBy, setSortBy, setIsCartOpen, submitGlobalOrder, storeProducts }: any) => {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);

    return (
    <div className={`w-full min-h-full bg-white text-slate-900 ${fontFamily} flex flex-col`}>
      <div className={`p-4 mx-4 mt-4 bg-slate-100 rounded-full flex justify-between items-center ${previewDevice === 'mobile' && !isModal ? 'flex-col gap-4 rounded-3xl' : 'flex-col md:flex-row gap-4 rounded-3xl md:rounded-full'}`}>
         <LogoEditor onClick={() => setPage('home')} className="text-2xl font-black tracking-tight px-4" style={{ color: primaryColor }} />
         <div className={`flex gap-2 text-sm font-bold ${previewDevice === 'mobile' && !isModal ? 'hidden' : 'hidden md:flex'}`}>
            {storePages.map(p => (
               <span key={p.id} onClick={() => setPage(p.id)} className="cursor-pointer capitalize px-4 py-2 rounded-full transition-colors" style={{ backgroundColor: page === p.id ? primaryColor : 'transparent', color: page === p.id ? '#fff' : '#64748b' }}>{tr(p.title)}</span>
            ))}
         </div>
         <button className="relative p-3 bg-white rounded-full shadow-sm hover:scale-105 transition-transform mr-1" onClick={() => alert(storeIsAr ? 'تم النقر على السلة!' : 'Panier cliqué !')}>
            <ShoppingBag className="w-5 h-5" style={{ color: primaryColor }} />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm" style={{ backgroundColor: '#f43f5e' }}>{cartCount}</span>}
         </button>
      </div>

      <div className="flex-1 overflow-y-auto pt-6">
        {page === 'home' && (
          <>
            <div className="px-4">
               <HeroBackgroundEditor className={`h-[${isModal ? '500px' : '300px'}] rounded-[2rem] flex flex-col items-center justify-center text-center p-8 bg-cover bg-center relative overflow-hidden`} style={{ backgroundImage: `url(${heroImage})` }}>
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
                  <div className="relative z-10 flex flex-col items-center p-8 bg-white/90 rounded-[2rem] shadow-xl border-4 border-white">
                     <h1 className={`${isModal ? 'text-6xl' : 'text-4xl'} font-black tracking-tight mb-2`} style={{ color: primaryColor }}>Fun & Fresh!</h1>
                     <p className="text-slate-600 font-medium mb-6 max-w-sm">Colorful, comfortable, and made for play.</p>
                     <button onClick={() => setPage('collections')} className="px-8 py-4 text-white font-black tracking-wide text-sm hover:scale-110 transition-transform rounded-full shadow-lg" style={{ backgroundColor: primaryColor }}>LET'S SHOP 🎈</button>
                  </div>
               </HeroBackgroundEditor>
            </div>
            <div className={`${isModal ? 'p-16 max-w-[1200px]' : 'p-6'} mx-auto w-full`}>
               <h3 className="text-3xl font-black text-center mb-10 text-slate-800">New Arrivals ✨</h3>
               <div className={`grid gap-6 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : (isModal ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2')}`}>
                  {storeProducts.map((p: any) => (
                     <div key={p.id} className="group cursor-pointer bg-slate-50 p-4 rounded-3xl hover:bg-slate-100 transition-colors border-2 border-transparent hover:border-current" style={{ borderColor: primaryColor }} onClick={() => navigateToProduct(p.id)}>
                        <div className="aspect-square bg-white mb-4 overflow-hidden relative rounded-2xl shadow-sm flex items-center justify-center">
                           {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover" alt={p.name} /> : <ImageIcon className="w-12 h-12 opacity-10" />}
                           <div className={`absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
                              <button onClick={handleAddToCart} className="px-6 py-3 text-white text-xs font-black uppercase tracking-wider rounded-full shadow-xl hover:scale-105 transition-transform" style={{ backgroundColor: primaryColor }}>Add to cart</button>
                           </div>
                        </div>
                        <h4 className="font-bold text-base text-center text-slate-700">{p.name}</h4>
                        <p className="text-center font-black mt-1" style={{ color: primaryColor }}>{p.price} MAD</p>
                     </div>
                  ))}
               </div>
            </div>
          </>
        )}
        {page === 'collections' && (
            <div className={`${isModal ? 'p-16 max-w-[1200px]' : 'p-6'} mx-auto w-full`}>
               <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                  <h3 className="text-3xl font-black text-center text-slate-800">{tr('All Products ✨')}</h3>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border-2 border-slate-200 text-slate-700 text-sm font-black rounded-full focus:ring-slate-500 focus:border-slate-500 px-4 py-2 outline-none cursor-pointer shadow-sm">
                     <option value="featured">{tr('Best Matches 🌟')}</option>
                     <option value="price-low-high">{tr('Price: Low to High 💸')}</option>
                     <option value="price-high-low">{tr('Price: High to Low 💎')}</option>
                  </select>
               </div>
               {categories && categories.length > 1 && (
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-10">
                     {categories.map((c: string) => (
                        <button key={tr(c)} onClick={() => setActiveCategory(c)} className="px-6 py-2 rounded-full text-sm font-black transition-transform hover:scale-105 border-2 border-transparent" style={{ backgroundColor: activeCategory === c ? primaryColor : '#f1f5f9', color: activeCategory === c ? '#fff' : '#64748b', borderColor: activeCategory === c ? 'transparent' : '#e2e8f0' }}>
                           {tr(c)}
                        </button>
                     ))}
                  </div>
               )}
               <div className={`grid gap-6 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : (isModal ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2')}`}>
                  {filteredProducts.map((p: any) => (
                     <div key={p.id} className="group cursor-pointer bg-slate-50 p-4 rounded-3xl hover:bg-slate-100 transition-colors border-2 border-transparent hover:border-current" style={{ borderColor: primaryColor }} onClick={() => navigateToProduct(p.id)}>
                        <div className="aspect-square bg-white mb-4 overflow-hidden relative rounded-2xl shadow-sm flex items-center justify-center">
                           {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover" alt={p.name} /> : <ImageIcon className="w-12 h-12 opacity-10" />}
                           <div className={`absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
                              <button onClick={handleAddToCart} className="px-6 py-3 text-white text-xs font-black uppercase tracking-wider rounded-full shadow-xl hover:scale-105 transition-transform" style={{ backgroundColor: primaryColor }}>Add to cart</button>
                           </div>
                        </div>
                        <h4 className="font-bold text-base text-center text-slate-700">{p.name}</h4>
                        <p className="text-center font-black mt-1" style={{ color: primaryColor }}>{p.price} MAD</p>
                     </div>
                  ))}
               </div>
            </div>
        )}
        {page === 'about' && (
           <div className={`${isModal ? 'p-16 max-w-3xl' : 'p-6'} mx-auto w-full text-center mt-10 bg-slate-100 rounded-[3rem] p-12`}>
              <h3 className="text-4xl font-black mb-6 text-slate-800">About {storeName}</h3>
              <p className="text-slate-600 text-xl font-bold leading-relaxed mb-6">Welcome to {storeName}. We are dedicated to providing the best quality products for our customers. Every piece is carefully crafted to ensure maximum comfort and style.</p>
           </div>
        )}
        {page === 'product' && activeProductId && (
           <div className={`${isModal ? 'p-16 max-w-[1200px]' : 'p-8'} mx-auto w-full`}>
              {storeProducts.filter(p => p.id === activeProductId).map(p => (
                 <div key={p.id} className={`flex gap-12 bg-slate-50 p-8 rounded-[3rem] ${previewDevice === 'mobile' && !isModal ? 'flex-col' : 'flex-col md:flex-row'}`}>
                    <div className="flex-1 bg-white rounded-[2rem] border-4 border-slate-100 flex items-center justify-center aspect-square shadow-xl overflow-hidden relative">
                       {(selectedColor && p.colorImages?.[selectedColor]) ? <img src={p.colorImages[selectedColor]} className="w-full h-full object-cover absolute inset-0" alt={p.name} /> : (p.image ? <img src={p.image} className="w-full h-full object-cover absolute inset-0" alt={p.name} /> : <ImageIcon className="w-20 h-20 opacity-10" />)}
                    </div>
                    <div className="flex-1 flex flex-col justify-center px-4">
                       <h2 className="text-5xl font-black mb-4 text-slate-800">{p.name}</h2>
                       <p className="text-3xl font-black mb-8" style={{ color: primaryColor }}>{p.price} MAD</p>
                       <p className="text-slate-500 font-medium mb-8 text-lg">{p.description || 'Fun, fresh, and perfectly designed for everyday adventures!'}</p>
                       
                       {/* PRO SELECTORS */}
                       <div className="mb-8 space-y-6 bg-white p-6 rounded-[2rem] border-4 border-slate-100">
                          {p.colors?.length > 0 && (
                             <div>
                                <span className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3 block">Color</span>
                                <div className="flex gap-3">
                                   {p.colors.map((c: string) => (
                                      <button key={tr(c)} onClick={() => setSelectedColor(c)} className={`w-10 h-10 rounded-full border-4 transition-transform ${selectedColor === c ? 'border-slate-800 scale-125' : 'border-transparent hover:scale-110 shadow-sm'}`} style={{ backgroundColor: c }} />
                                   ))}
                                </div>
                             </div>
                          )}
                          {p.sizes?.length > 0 && (
                             <div>
                                <span className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3 block">Size</span>
                                <div className="flex flex-wrap gap-2">
                                   {p.sizes.map((s: string) => (
                                      <button key={s} onClick={() => setSelectedSize(s)} className={`px-5 py-3 text-sm font-black rounded-xl transition-transform border-4 ${selectedSize === s ? 'bg-slate-800 border-slate-800 text-white scale-105 shadow-xl' : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200'}`}>
                                         {s}
                                      </button>
                                   ))}
                                </div>
                             </div>
                          )}
                          <div>
                             <span className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3 block">Quantity</span>
                             <div className="flex items-center justify-between bg-slate-50 w-40 px-4 py-2 rounded-xl border-4 border-slate-100">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-slate-400 hover:text-slate-800 font-black text-2xl">-</button>
                                <span className="font-black text-xl text-slate-800">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="text-slate-400 hover:text-slate-800 font-black text-2xl">+</button>
                             </div>
                          </div>
                       </div>

                       {buyMode === 'form' ? (
                          <div className="bg-white p-8 rounded-[2rem] border-4 border-slate-100 space-y-4">
                             <h4 className="text-xl font-black text-slate-800 mb-2">Yay! Checkout 🎁</h4>
                             <input type="text" placeholder="Your Name" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-full focus:outline-none focus:border-current text-base font-bold" style={{ '--tw-ring-color': primaryColor } as React.CSSProperties} />
                             <input type="text" placeholder={storeLang === 'ar' ? 'رقم الهاتف' : storeLang === 'en' ? 'Phone Number' : 'Numéro de Téléphone'} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-full focus:outline-none focus:border-current text-base font-bold" style={{ '--tw-ring-color': primaryColor } as React.CSSProperties} />
                             <input type="text" placeholder="Where to send?" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-full focus:outline-none focus:border-current text-base font-bold" style={{ '--tw-ring-color': primaryColor } as React.CSSProperties} />
                             <button onClick={() => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1)} className="w-full py-5 text-white font-black uppercase tracking-widest text-lg hover:scale-105 transition-transform rounded-full shadow-xl mt-4" style={{ backgroundColor: primaryColor }}>Send it to me! 🚀</button>
                          </div>
                       ) : (
                          <div className="flex gap-4">
                             {(buyMode === 'cart' || buyMode === 'both') && (
                                <button onClick={handleAddToCart} className="flex-1 px-8 py-5 text-white font-black uppercase tracking-widest text-lg hover:scale-105 transition-transform rounded-full shadow-xl" style={{ backgroundColor: '#f43f5e' }}>Cart 🛒</button>
                             )}
                             {(buyMode === 'direct' || buyMode === 'both') && (
                                <button onClick={() => setPage('checkout')} className="flex-1 px-8 py-5 text-white font-black uppercase tracking-widest text-lg hover:scale-105 transition-transform rounded-full shadow-xl" style={{ backgroundColor: primaryColor }}>Buy Now 🎈</button>
                             )}
                          </div>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        )}
        {page === 'checkout' && (
           <div className={`${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full`}>
              <div className="bg-slate-50 p-10 rounded-[3rem] shadow-sm border-4 border-white">
                 <h2 className="text-3xl font-black mb-6 text-center text-slate-800">Yay! Checkout 🎁</h2>
                 <div className="space-y-4">
                    <input type="text" placeholder="Your Name" className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-full focus:outline-none focus:border-current text-lg font-bold" style={{ borderColor: 'transparent', '--tw-ring-color': primaryColor } as React.CSSProperties} />
                    <input type="text" placeholder={storeLang === 'ar' ? 'رقم الهاتف' : storeLang === 'en' ? 'Phone Number' : 'Numéro de Téléphone'} className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-full focus:outline-none focus:border-current text-lg font-bold" style={{ borderColor: 'transparent', '--tw-ring-color': primaryColor } as React.CSSProperties} />
                    <input type="text" placeholder="Where to send?" className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-full focus:outline-none focus:border-current text-lg font-bold" style={{ borderColor: 'transparent', '--tw-ring-color': primaryColor } as React.CSSProperties} />
                    <button onClick={() => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1)} className="w-full py-5 text-white font-black uppercase tracking-widest text-xl hover:scale-105 transition-transform rounded-full shadow-xl mt-6" style={{ backgroundColor: primaryColor }}>Send it to me! 🚀</button>
                 </div>
              </div>
           </div>
        )}
        {page === 'success' && (
           <div className={`${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full text-center flex flex-col items-center justify-center min-h-[400px]`}>
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-white">
                 <CheckCircle className="w-12 h-12" />
              </div>
              <h2 className="text-5xl font-black mb-4 text-slate-800" style={{ color: primaryColor }}>Woohoo! 🎉</h2>
              <p className="text-slate-500 text-xl font-bold">Your order is on the way!</p>
              <button onClick={() => setPage('home')} className="mt-8 px-10 py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform shadow-lg">Back to fun 🎈</button>
           </div>
        )}
      </div>
    </div>
  );
  };

  const StorePreviewWrapper = ({ isModal = false }) => {
    const [page, setPage] = useState('home');
    const [activeProductId, setActiveProductId] = useState<any>(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [sortBy, setSortBy] = useState('featured');
    const [isCartOpen, setIsCartOpen] = useState(false);

    const navigateToProduct = (id: any) => {
        setActiveProductId(id);
        setPage('product');
    };

    const categories = ['All', ...Array.from(new Set(storeProducts.map(p => p.category).filter(Boolean)))];
    let filteredProducts = activeCategory === 'All' ? storeProducts : storeProducts.filter(p => p.category === activeCategory);

    filteredProducts = [...filteredProducts].sort((a, b) => {
       if (sortBy === 'price-low-high') return parseFloat(a.price) - parseFloat(b.price);
       if (sortBy === 'price-high-low') return parseFloat(b.price) - parseFloat(a.price);
       if (sortBy === 'az') return a.name.localeCompare(b.name);
       if (sortBy === 'za') return b.name.localeCompare(a.name);
       return 0;
    });

    const props = { isModal, page, setPage, activeProductId, navigateToProduct, buyMode, categories, activeCategory, setActiveCategory, filteredProducts, sortBy, setSortBy, storeLang, isCartOpen, setIsCartOpen, submitGlobalOrder, storeProducts };

  
  const LayoutClement = ({ isModal = false, page, setPage, activeProductId, navigateToProduct, buyMode, categories, activeCategory, setActiveCategory, filteredProducts, sortBy, setSortBy, setIsCartOpen, submitGlobalOrder, storeProducts }: any) => {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);

    return (
    <div className={`w-full min-h-full bg-[#e8e2d7] text-[#1a1a1a] ${fontFamily} flex flex-col`}>
      <div className={`px-8 py-6 flex justify-between items-center ${previewDevice === 'mobile' && !isModal ? 'flex-col gap-4' : 'flex-col md:flex-row gap-4 md:gap-0'}`}>
         <LogoEditor onClick={() => setPage('home')} className="text-2xl font-black uppercase tracking-widest text-[#1a1a1a]" style={{ color: primaryColor }} />
         <div className={`flex gap-8 text-sm font-medium text-[#4a4a4a] ${previewDevice === 'mobile' && !isModal ? 'hidden' : 'hidden md:flex'}`}>
            {storePages.map(p => (
               <span key={p.id} onClick={() => setPage(p.id)} className="cursor-pointer hover:text-black transition-colors" style={{ color: page === p.id ? primaryColor : undefined }}>{tr(p.title)}</span>
            ))}
         </div>
         <div className="flex gap-4 items-center">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 cursor-pointer"><img src="https://flagcdn.com/w20/fr.png" alt="FR" className="w-4 h-3 rounded-sm object-cover" /> FR</span>
            <Search className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity" />
            <Users className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity" />
            <button className="relative hover:opacity-70 transition-opacity" onClick={() => alert(storeIsAr ? 'تم النقر على السلة!' : 'Panier cliqué !')}>
               <ShoppingBag className="w-5 h-5" />
               {cartCount > 0 && <span className="absolute -bottom-1 -right-1 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center bg-black">{cartCount}</span>}
            </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        {page === 'home' && (
          <>
            <div className="w-full bg-[#e8e2d7]">
               <HeroBackgroundEditor className={`w-full h-[${isModal ? '600px' : '400px'}] bg-cover bg-right-top relative flex items-center`} style={{ backgroundImage: `url(${heroImage})` }}>
                  <div className="max-w-2xl px-12 md:px-24">
                     <EditableText as="h1" text={heroTitle} onTextChange={setHeroTitle} isLiveStore={isLiveStore} className="text-5xl md:text-7xl font-serif italic tracking-wide text-[#2c2c2c] mb-6 leading-tight" style={{ fontFamily: 'Georgia, serif' }} />
                  </div>
               </HeroBackgroundEditor>
            </div>

            <div className="py-16 px-8 max-w-7xl mx-auto bg-white">
               <div className="flex flex-col items-center mb-12">
                  <EditableText as="h2" text={homeCollectionsTitle} onTextChange={setHomeCollectionsTitle} isLiveStore={isLiveStore} className="text-2xl font-black uppercase text-[#1a1a1a] mb-8 tracking-wider" />
                  
                  {/* Categories */}
                  <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-[#4a4a4a]">
                     {categories.map((c: string) => (
                        <button key={tr(c)} onClick={() => setActiveCategory(c)} className={`pb-1 border-b-2 transition-colors ${activeCategory === c ? 'border-[#1a1a1a] text-[#1a1a1a]' : 'border-transparent hover:border-slate-300'}`}>
                           {c === 'All' ? allCollectionsTitle : tr(c)}
                        </button>
                     ))}
                  </div>
               </div>

               <div className={`grid ${previewDevice === 'mobile' && !isModal ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-6`}>
                  {filteredProducts.map((p: any) => (
                     <div key={p.id} className="group cursor-pointer" onClick={() => navigateToProduct(p.id)}>
                        <div className="aspect-[3/4] bg-[#f5f1e9] mb-4 relative overflow-hidden flex items-center justify-center">
                           <img src={getCoverImage(p)} alt={p.name} className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                           <button className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 transition-colors" onClick={(e) => { e.stopPropagation(); alert(storeIsAr ? 'تمت الإضافة للمفضلة' : 'Ajouté aux favoris'); }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                           </button>
                        </div>
                        <div className="text-left">
                           <h3 className="text-[13px] font-black uppercase tracking-widest text-[#1a1a1a] mb-1">{p.name}</h3>
                           <p className="text-[11px] text-[#666] mb-2">{p.category}</p>
                           <p className="text-[13px] font-bold text-[#1a1a1a]">{storeIsAr ? 'ابتداءً من' : 'à partir de'} {p.price} MAD</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          </>
        )}

        {page === 'product' && (
           <div className="p-8 max-w-6xl mx-auto bg-white min-h-[600px] my-8 flex flex-col md:flex-row gap-12">
              <div className="w-full md:w-1/2 flex gap-4">
                 <div className="w-full aspect-[3/4] bg-[#f5f1e9] rounded-sm overflow-hidden flex items-center justify-center">
                    <img src={getCoverImage(storeProducts.find(p => p.id === activeProductId))} className="w-full h-full object-cover mix-blend-multiply" alt="Product" />
                 </div>
              </div>
              <div className="w-full md:w-1/2 pt-4">
                 <h2 className="text-3xl font-black uppercase tracking-widest text-[#1a1a1a] mb-2">{storeProducts.find(p => p.id === activeProductId)?.name}</h2>
                 <p className="text-xl font-bold text-[#444] mb-8">{storeProducts.find(p => p.id === activeProductId)?.price} MAD</p>
                 
                 <div className="space-y-6 mb-8">
                    {storeProducts.find(p => p.id === activeProductId)?.colors?.length > 0 && (
                       <div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-[#666] mb-3 block">{storeIsAr ? 'لون' : 'Couleur'}</span>
                          <div className="flex gap-2">
                             {storeProducts.find(p => p.id === activeProductId)?.colors.map((c: string) => (
                                <button key={tr(c)} onClick={() => setSelectedColor(c)} className={`w-8 h-8 rounded-full border-2 transition-transform ${selectedColor === c ? 'border-[#1a1a1a] scale-110' : 'border-transparent hover:scale-105 shadow-sm'}`} style={{ backgroundColor: c }} />
                             ))}
                          </div>
                       </div>
                    )}
                    {storeProducts.find(p => p.id === activeProductId)?.sizes?.length > 0 && (
                       <div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-[#666] mb-3 block">{storeIsAr ? 'المقاس' : 'Taille'}</span>
                          <div className="flex flex-wrap gap-2">
                             {storeProducts.find(p => p.id === activeProductId)?.sizes.map((s: string) => (
                                <button key={s} onClick={() => setSelectedSize(s)} className={`min-w-[40px] h-10 px-3 text-[11px] font-bold uppercase tracking-widest transition-colors border ${selectedSize === s ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-[#444] border-[#ddd] hover:border-[#1a1a1a]'}`}>
                                   {s}
                                </button>
                             ))}
                          </div>
                       </div>
                    )}
                    
                    <div>
                       <span className="text-[11px] font-bold uppercase tracking-widest text-[#666] mb-3 block">{storeIsAr ? 'الكمية' : 'Quantité'}</span>
                       <div className="flex items-center gap-4">
                          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 border border-[#ddd] flex items-center justify-center text-lg hover:border-[#1a1a1a] transition-colors">-</button>
                          <span className="text-sm font-bold w-4 text-center">{quantity}</span>
                          <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 border border-[#ddd] flex items-center justify-center text-lg hover:border-[#1a1a1a] transition-colors">+</button>
                       </div>
                    </div>
                 </div>

                 {(buyMode === 'both' || buyMode === 'cart') && (
                    <button onClick={handleAddToCart} className="w-full h-14 bg-[#1a1a1a] text-white font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors mb-4">{storeIsAr ? 'أضف للسلة' : 'Ajouter au panier'}</button>
                 )}
                 {(buyMode === 'both' || buyMode === 'direct') && (
                    <button onClick={() => setPage('checkout')} className="w-full h-14 bg-[#f5f1e9] text-[#1a1a1a] font-bold uppercase tracking-widest text-xs hover:bg-[#e8e2d7] transition-colors">{storeIsAr ? 'اشتري الآن' : 'Acheter Maintenant'}</button>
                 )}
              </div>
           </div>
        )}

        {page === 'checkout' && (
           <div className="p-8 max-w-2xl mx-auto my-8 bg-white border border-[#eee] rounded-sm">
              <h2 className="text-2xl font-black uppercase tracking-widest text-[#1a1a1a] mb-8 text-center">{storeIsAr ? 'شراء سريع' : 'Achat Express'}</h2>
              <div className="space-y-4">
                 <input type="text" placeholder={storeIsAr ? 'الاسم الكامل' : 'Nom Complet'} className="w-full px-4 py-3 bg-white border border-[#ddd] text-sm focus:outline-none focus:border-[#1a1a1a]" />
                 <input type="text" placeholder={storeIsAr ? 'رقم الهاتف' : 'Numéro de Téléphone'} className="w-full px-4 py-3 bg-white border border-[#ddd] text-sm focus:outline-none focus:border-[#1a1a1a]" />
                 <input type="text" placeholder={storeIsAr ? 'المدينة' : 'Ville'} className="w-full px-4 py-3 bg-white border border-[#ddd] text-sm focus:outline-none focus:border-[#1a1a1a]" />
                 <input type="text" placeholder={storeIsAr ? 'عنوان التوصيل' : 'Adresse de Livraison'} className="w-full px-4 py-3 bg-white border border-[#ddd] text-sm focus:outline-none focus:border-[#1a1a1a]" />
                 <button onClick={() => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1)} className="w-full py-4 bg-[#1a1a1a] text-white font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors mt-8">{storeIsAr ? 'تأكيد الطلب' : 'Confirmer la Commande'}</button>
              </div>
           </div>
        )}

        {page === 'success' && (
           <div className="p-16 max-w-2xl mx-auto my-8 bg-white border border-[#eee] text-center flex flex-col items-center justify-center">
              <CheckCircle className="w-16 h-16 text-green-500 mb-6" />
              <h2 className="text-3xl font-black uppercase tracking-widest text-[#1a1a1a] mb-4">{storeIsAr ? 'تم تأكيد الطلب' : 'Commande Confirmée'}</h2>
              <p className="text-[#666] mb-8">{storeIsAr ? 'شكرا لثقتك. سنتصل بك قريباً.' : 'Merci de votre confiance. Nous vous contacterons bientôt.'}</p>
              <button onClick={() => setPage('home')} className="px-8 py-3 bg-[#f5f1e9] text-[#1a1a1a] font-bold uppercase tracking-widest text-xs hover:bg-[#e8e2d7] transition-colors">{storeIsAr ? 'العودة للرئيسية' : "Retour à l'accueil"}</button>
           </div>
        )}

      </div>
      <ThemeFooter bgColor="#1a1a1a" textColor="#fff" setPage={setPage} />
    </div>
  );
  };

    const LayoutMazia = ({ isModal, page, setPage, activeProductId, navigateToProduct, setIsCartOpen, submitGlobalOrder, storeProducts }: any) => {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [activePDPTab, setActivePDPTab] = useState('description');
    
    return (
    <div className={`w-full min-h-full bg-white text-slate-800 flex flex-col font-sans`}>
      {/* Header */}
      <div className={`flex justify-between items-center bg-white border-b border-slate-100 relative ${previewDevice === 'mobile' && !isModal ? 'p-4' : 'px-8 py-6'}`}>
         {/* Navigation - Left on desktop */}
         <div className={`hidden md:flex items-center gap-6 text-[11px] font-bold uppercase tracking-wider text-slate-500`}>
            {storePages.map(p => (
               <button key={p.id} onClick={() => setPage(p.id)} className={`hover:text-[${primaryColor}] transition-colors ${page === p.id ? `text-[${primaryColor}]` : ''}`}>{tr(p.title)}</button>
            ))}
         </div>
         {/* Logo - Center */}
         <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
            <LogoEditor onClick={() => setPage('home')} className={`text-2xl font-black tracking-tighter text-slate-900 ${fontFamily}`} style={{ color: primaryColor }} />
         </div>
         {/* Icons - Right */}
         <div className="flex items-center gap-4 text-slate-400">
            <div className="text-[10px] uppercase font-bold tracking-widest hidden md:block">Login / Sign up</div>
            <Search className="w-4 h-4 cursor-pointer hover:text-slate-900" />
            <div className="relative cursor-pointer hover:text-slate-900">
               <ShoppingBag className="w-4 h-4" />
               <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full font-bold">2</span>
            </div>
         </div>
      </div>

      {page === 'home' && (
         <div className="flex-1 flex flex-col pb-20">
            {/* Lookbook Hero */}
            <div className={`w-full bg-[#f8f9fa] flex ${previewDevice === 'mobile' && !isModal ? 'flex-col pt-12' : 'flex-row items-center'} min-h-[500px] relative overflow-hidden`}>
               <div className={`z-10 ${previewDevice === 'mobile' && !isModal ? 'px-8 pb-12 text-center' : 'pl-24 pr-8 py-16 w-1/2 text-left'}`}>
                  <h1 className={`text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-4 uppercase`} style={{ color: primaryColor }}>{heroTitle || 'LOOKBOOK'}</h1>
                  <p className="text-sm text-slate-500 mb-8 max-w-md font-medium leading-relaxed">{heroSubtitle || 'New Spring drops from Over. Shop the Collection'}</p>
                  <button className="px-8 py-3 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors rounded-full" style={{ backgroundColor: primaryColor }}>{heroButtonText || 'Shop Collection'}</button>
               </div>
               <div className={`absolute right-0 top-0 bottom-0 ${previewDevice === 'mobile' && !isModal ? 'w-full opacity-30 pointer-events-none' : 'w-1/2'} bg-cover bg-top`} style={{ backgroundImage: `url(${heroImage || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop'})` }}>
               </div>
            </div>

            {/* Sub-banner (Lookbook block) */}
            <div className="max-w-6xl mx-auto w-full px-4 py-20 text-center">
               <h3 className="text-2xl font-bold text-slate-900 mb-4 font-serif">{homeCollectionsTitle || 'New & Stylish Collections'}</h3>
               <p className="text-slate-400 text-xs max-w-xl mx-auto mb-16 leading-relaxed">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>
               
               <div className={`grid gap-8 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  <div className="bg-[#f8f9fa] p-8 flex items-center gap-6 text-left hover:shadow-lg transition-shadow">
                     <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-900 mb-2 leading-snug">Mazia Clothing Collections For Woman's 2019</h4>
                        <button className="text-[10px] font-bold uppercase tracking-widest mt-6" style={{ color: primaryColor }}>Discover Now</button>
                     </div>
                     <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop" className="w-1/3 aspect-[3/4] object-cover" />
                  </div>
                  <div className="bg-[#f8f9fa] p-8 flex items-center gap-6 text-left hover:shadow-lg transition-shadow">
                     <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-900 mb-2 leading-snug">Top Sneaker Collections For Men's</h4>
                        <button className="text-[10px] font-bold uppercase tracking-widest mt-6" style={{ color: primaryColor }}>Discover Now</button>
                     </div>
                     <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop" className="w-1/3 aspect-[3/4] object-cover" />
                  </div>
               </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-6xl mx-auto w-full px-4 py-8">
               <div className="flex items-center justify-between mb-12">
                  <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">#New Arrivals</h3>
                  <div className="flex gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden md:flex">
                     <span className="text-slate-900 border-b-2 border-slate-900 pb-1">All</span>
                     <span className="hover:text-slate-900 cursor-pointer">Men</span>
                     <span className="hover:text-slate-900 cursor-pointer">Women</span>
                     <span className="hover:text-slate-900 cursor-pointer">Kids</span>
                  </div>
               </div>
               <div className={`grid gap-x-8 gap-y-12 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-2' : 'grid-cols-4'}`}>
                  {storeProducts.slice(0, 8).map((p: any) => (
                     <div key={p.id} className="group cursor-pointer" onClick={() => navigateToProduct(p.id)}>
                        <div className="relative aspect-[3/4] bg-[#f8f9fa] mb-4 overflow-hidden">
                           <img src={getCoverImage(p)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                           {p.id === 1 && <div className="absolute top-3 right-3 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">Sale</div>}
                           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-900 text-[10px] font-bold uppercase tracking-widest px-6 py-2 shadow-lg whitespace-nowrap">
                              Quick View
                           </div>
                        </div>
                        <div className="text-left px-1">
                           <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1.5">{p.category || 'Clothing'}</p>
                           <h4 className="text-sm font-bold text-slate-800 truncate mb-1.5 group-hover:text-red-500 transition-colors">{p.name}</h4>
                           <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-slate-900">{p.price} MAD</span>
                              {p.id === 1 && <span className="text-[11px] text-slate-400 line-through">{(parseFloat(p.price) * 1.2).toFixed(2)} MAD</span>}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
            
            {/* Dynamic Blocks */}
            <div className="w-full flex flex-col items-center">
              {homeBlocks.map((block: string) => {
                 if (block === 'newsletter') return (
                    <div key="newsletter" className="w-full py-20 px-4 bg-white border-t border-slate-100 flex flex-col items-center justify-center text-center">
                       <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter uppercase">{newsletterTitle}</h3>
                       <p className="text-slate-500 mb-8 max-w-md text-sm leading-relaxed">{newsletterSubtitle}</p>
                       <div className="flex w-full max-w-md shadow-2xl shadow-slate-200/50 rounded-r-full rounded-l-full overflow-hidden">
                          <input type="email" placeholder="Votre email" className="flex-1 bg-[#f8f9fa] border-none px-6 py-4 outline-none text-sm" />
                          <button className="px-8 py-4 text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity" style={{ backgroundColor: primaryColor }}>Subscribe</button>
                       </div>
                    </div>
                 );
                 
                 if (block === 'features') return (
                    <div key="features" className="w-full py-16 px-4 bg-[#f8f9fa] border-t border-slate-100">
                       <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                          {featuresData.map((f: any, i: number) => (
                             <div key={i} className="flex flex-col items-center group">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-white shadow-sm group-hover:-translate-y-2 transition-transform duration-300" style={{ color: primaryColor }}>
                                   {f.icon === 'Truck' && <Truck className="w-6 h-6" />}
                                   {f.icon === 'ShieldCheck' && <ShieldCheck className="w-6 h-6" />}
                                   {f.icon === 'Star' && <Star className="w-6 h-6" />}
                                </div>
                                <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-2">{f.title}</h4>
                                <p className="text-slate-400 text-xs leading-relaxed max-w-[200px]">{f.subtitle}</p>
                             </div>
                          ))}
                       </div>
                    </div>
                 );
                 
                 if (block === 'video') return (
                    <div key="video" className="w-full py-24 px-4 bg-white flex flex-col items-center justify-center">
                       <div className="w-full max-w-5xl aspect-video bg-slate-100 overflow-hidden relative group">
                          {videoUrl ? (
                             <iframe src={videoUrl} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media"></iframe>
                          ) : (
                             <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                                <Video className="w-12 h-12 mb-4 opacity-30 group-hover:scale-110 transition-transform" />
                                <p className="text-xs uppercase tracking-widest font-bold">Promotion Video Area</p>
                             </div>
                          )}
                       </div>
                    </div>
                 );
                 
                 return null;
              })}
            </div>
         </div>
      )}

      {page === 'collections' && (
         <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-16">
            <h2 className="text-3xl font-black text-center mb-16 uppercase tracking-tight">{tr(allCollectionsTitle || 'ALL PRODUCTS')}</h2>
            <div className={`grid gap-x-8 gap-y-12 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-2' : 'grid-cols-4'}`}>
               {storeProducts.map((p: any) => (
                  <div key={p.id} className="group cursor-pointer" onClick={() => navigateToProduct(p.id)}>
                     <div className="relative aspect-[3/4] bg-[#f8f9fa] mb-4 overflow-hidden">
                        <img src={getCoverImage(p)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-900 text-[10px] font-bold uppercase tracking-widest px-6 py-2 shadow-lg whitespace-nowrap">
                           Quick View
                        </div>
                     </div>
                     <div className="text-left px-1">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1.5">{p.category || 'Clothing'}</p>
                        <h4 className="text-sm font-bold text-slate-800 truncate mb-1.5 group-hover:text-red-500 transition-colors">{p.name}</h4>
                        <span className="text-sm font-black text-slate-900">{p.price} MAD</span>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}
      

      {page === 'product' && activeProductId && (() => {
         const product = storeProducts.find((p: any) => p.id === activeProductId);
         if (!product) return null;
         const images = [getCoverImage(product), ...(product.gallery || []), 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80'].slice(0, 3);
         const sizes = ['S', 'M', 'XL', 'XXL'];
         
         return (
            <div className="flex-1 w-full bg-white relative">
               {/* Decorative Dotted Grid on Right */}
               <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
               
               <div className="max-w-6xl mx-auto px-4 py-16 lg:py-24 relative z-10">
                  <div className="flex flex-col lg:flex-row gap-16 items-start">
                     
                     {/* Left: Images */}
                     <div className="w-full lg:w-1/2 flex gap-4">
                        <div className="flex flex-col gap-4">
                           {images.map((img: string, idx: number) => (
                              <button key={idx} className={`w-3 h-10 ${idx === 0 ? 'bg-slate-900' : 'bg-slate-200'} transition-colors`}></button>
                           ))}
                        </div>
                        <div className="relative flex-1 aspect-[3/4] bg-[#f8f9fa]">
                           <img src={images[0]} className="w-full h-full object-cover" />
                           {/* Tags */}
                           <div className="absolute top-4 -left-3 flex flex-col gap-2">
                              <span className="bg-rose-400 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 shadow-sm">SALE</span>
                              <span className="bg-emerald-400 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 shadow-sm">NEW</span>
                           </div>
                        </div>
                     </div>

                     {/* Right: Details */}
                     <div className="w-full lg:w-1/2 pt-4">
                        <div className="flex items-center justify-between mb-4">
                           <h1 className="text-4xl lg:text-5xl font-sans text-slate-900 leading-tight" style={{ fontWeight: 400 }}>{product.name}</h1>
                           <button className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                           </button>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6">
                           <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                           </div>
                           <span className="text-[11px] text-slate-400 uppercase font-medium tracking-wide">3 customers left feedback</span>
                        </div>

                        <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-md">
                           {product.description || "Stylish shirt from the Fashionee collection. Model made of high-quality fabric, pleasant to the touch. A perfect choice for every day."}
                        </p>

                        <div className="flex gap-8 mb-8 text-[11px] uppercase tracking-wider font-bold">
                           <div className="flex gap-2"><span className="text-slate-400">Status:</span> <span className="text-emerald-400">IN STOCK</span></div>
                           <div className="flex gap-2"><span className="text-slate-400">Article:</span> <span className="text-slate-800">000{product.id}DZ1</span></div>
                        </div>

                        <div className="flex items-end gap-4 mb-10">
                           <span className="text-4xl font-black text-slate-900">$\{parseFloat(product.price).toFixed(2)}</span>
                           <span className="text-lg text-slate-400 line-through mb-1">$\{(parseFloat(product.price) * 1.4).toFixed(2)}</span>
                        </div>

                        <div className="flex items-center gap-6 mb-12">
                           {sizes.map((sz, i) => (
                              <button key={sz} onClick={() => setSelectedSize(sz)} className={`w-12 h-12 flex items-center justify-center text-[11px] font-bold transition-all ${selectedSize === sz || (i===1 && !selectedSize) ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                                 {sz}
                              </button>
                           ))}
                        </div>

                        <div className="flex gap-4 mb-16">
                           <div className="flex items-center bg-slate-50 h-14 px-6 gap-6">
                              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-slate-400 hover:text-slate-900">-</button>
                              <span className="text-sm font-bold text-slate-900">{quantity}</span>
                              <button onClick={() => setQuantity(quantity + 1)} className="text-slate-400 hover:text-slate-900">+</button>
                           </div>
                           <button onClick={() => setIsCartOpen(true)} className="flex-1 bg-slate-900 text-white h-14 font-bold text-sm tracking-wider hover:bg-black transition-colors">
                              Add To Cart
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Tabs */}
                  <div className="mt-24 max-w-4xl">
                     <div className="flex gap-8 border-b border-slate-200 mb-8">
                        <button onClick={() => setActivePDPTab('description')} className={`pb-4 text-sm tracking-wider font-bold transition-all ${activePDPTab === 'description' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Description</button>
                        <button onClick={() => setActivePDPTab('reviews')} className={`pb-4 text-sm tracking-wider font-bold transition-all ${activePDPTab === 'reviews' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Reviews</button>
                     </div>
                     <div className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                        {activePDPTab === 'description' ? (
                           <p>Detailed description about the {product.name}. This item is crafted from premium materials, ensuring both comfort and durability. Perfect for any occasion, its versatile design makes it a wardrobe essential.</p>
                        ) : (
                           <div className="space-y-6">
                              <div className="flex gap-4">
                                 <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                                 <div>
                                    <h5 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider mb-1">Jane Doe</h5>
                                    <div className="flex text-amber-400 mb-2 w-3 h-3">{'★'.repeat(5)}</div>
                                    <p>Absolutely love this! Fits perfectly and looks great.</p>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         );
      })()}
\n            {/* Footer */}
      <div className="bg-[#f8f9fa] py-16 px-8 text-center text-slate-500 text-xs">
         <LogoEditor className={`text-3xl font-black tracking-tighter text-slate-900 mx-auto mb-8 opacity-20 ${fontFamily}`} style={{ color: primaryColor }} />
         <p>{tr(footerSettings.copyright)}</p>
         <div className="flex justify-center gap-6 mt-6 uppercase tracking-widest text-[10px] font-bold">
            {footerSettings.showTerms && <span className="hover:text-slate-900 cursor-pointer">{tr('Terms of Service')}</span>}
            {footerSettings.showPrivacy && <span className="hover:text-slate-900 cursor-pointer">{tr('Privacy Policy')}</span>}
         </div>
      </div>
    </div>
    );
  };
  
  const Layout = () => {
       if (activeTheme.layout === 'hero-center') return <LayoutHeroCenter {...props} />;
       if (activeTheme.layout === 'split-screen') return <LayoutSplitScreen {...props} />;
       if (activeTheme.layout === 'elegant') return <LayoutElegant {...props} />;
       if (activeTheme.layout === 'mazia') return <LayoutMazia {...props} />;
       if (activeTheme.layout === 'playful') return <LayoutPlayful {...props} />;
       if (activeTheme.layout === 'clement') return <LayoutClement {...props} />;
       return <LayoutHeroCenter {...props} />;
    };

    return (
       <>
          <Layout />
          {isCartOpen && (
             <div className="fixed inset-0 z-[999] flex justify-end bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}>
                <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col transform transition-transform" onClick={e => e.stopPropagation()}>
                   <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                         <ShoppingBag className="w-5 h-5" />
                         {storeIsAr ? 'سلة المشتريات' : 'Votre Panier'}
                      </h2>
                      <button onClick={() => setIsCartOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all">
                         <X className="w-4 h-4" />
                      </button>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                      {cartCount === 0 ? (
                         <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 space-y-4">
                            <ShoppingBag className="w-16 h-16 text-slate-300" />
                            <p className="text-lg font-bold text-slate-500">{storeIsAr ? 'السلة فارغة' : 'Votre panier est vide'}</p>
                         </div>
                      ) : (
                         Array.from({ length: cartCount }).map((_, i) => (
                            <div key={i} className="flex gap-4 p-4 border border-slate-100 rounded-2xl bg-white shadow-sm">
                               <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
                                  <ImageIcon className="w-8 h-8 text-slate-300" />
                               </div>
                               <div className="flex-1 flex flex-col justify-center">
                                  <h4 className="font-bold text-slate-800">{storeIsAr ? 'منتج تجريبي' : 'Produit Démo'}</h4>
                                  <p className="text-sm font-black mt-1" style={{ color: primaryColor }}>299 MAD</p>
                                  <div className="flex items-center gap-3 mt-2">
                                     <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">Qt: 1</span>
                                     <button className="text-xs text-red-500 font-bold hover:underline">{storeIsAr ? 'حذف' : 'Retirer'}</button>
                                  </div>
                               </div>
                            </div>
                         ))
                      )}
                   </div>
                   
                   <div className="p-6 border-t border-slate-100 bg-slate-50">
                      <div className="flex justify-between items-center mb-6">
                         <span className="text-sm font-bold text-slate-500 uppercase">{storeIsAr ? 'المجموع' : 'Total'}</span>
                         <span className="text-2xl font-black" style={{ color: primaryColor }}>
                            {cartCount * 299} MAD
                         </span>
                      </div>
                      <button 
                         disabled={cartCount === 0}
                         className="w-full py-4 text-white font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                         style={{ backgroundColor: primaryColor }}
                      >
                         <CheckCircle className="w-5 h-5" />
                         {storeIsAr ? 'إتمام الطلب' : 'Valider la commande'}
                      </button>
                   </div>
                </div>
             </div>
          )}
       </>
    );
  };

  if (isLiveStore) {
    if (isLoadingLiveConfig) {
       return (
          <div className="w-full h-screen bg-white flex flex-col items-center justify-center">
             <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
       );
    }
    
    return (
      <div className="w-full min-h-screen bg-white">
        <StorePreviewWrapper isModal={false} />
      </div>
    );
  }

  if (builderMode === 'dashboard') {
     return (
       <div className={`space-y-6 ${storeIsAr ? 'text-right' : 'text-left'} bg-slate-50 min-h-screen p-6 md:p-12`}>
         <StoreManagerDashboard onSelectStore={(store?: any) => {
             if (store && store.config_json) {
                localStorage.setItem('beya_store_config', JSON.stringify(store.config_json));
             } else {
                localStorage.setItem('beya_store_config', JSON.stringify({})); // Empty config for new store
             }
             setBuilderMode('editor');
             window.location.reload(); // Force all state to re-initialize with new config
         }} onOpenAI={() => setBuilderMode('pro_ai')} storeIsAr={storeIsAr} />
       </div>
     );
  }
  
  if (builderMode === 'pro_ai') {
     return (
       <div className={`space-y-6 ${storeIsAr ? 'text-right' : 'text-left'} bg-slate-50 min-h-screen p-6 md:p-12`}>
         <ProAITools onBack={() => setBuilderMode('dashboard')} storeIsAr={storeIsAr} />
       </div>
     );
  }

  return (
    <div className={`space-y-6 ${storeIsAr ? 'text-right' : 'text-left'} bg-slate-50 min-h-screen p-6`}>
      {/* Top Navigation / Back Button */}
      <div className="flex items-center justify-between mb-4">
         <button onClick={() => setBuilderMode('dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
            {storeIsAr ? '→ العودة إلى لوحة المتاجر' : '← Retour aux Boutiques'}
         </button>
         <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{storeIsAr ? 'المتجر نشط' : 'SaaS Builder Active'}</span>
         </div>
      </div>

      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${storeIsAr ? 'sm:flex-row-reverse' : ''}`}>
        <div className={storeIsAr ? 'text-right' : 'text-left'}>
          <div className={`flex items-center gap-3 ${storeIsAr ? 'flex-row-reverse' : ''}`}>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">BEYA STORE PRO</h1>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded uppercase tracking-widest">{storeIsAr ? 'نسخة الساس' : 'SaaS ÉDITION'}</span>
            <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-black rounded uppercase tracking-widest" title="Connexion chiffrée de bout en bout et route protégée (Admin uniquement)"><ShieldCheck className="w-3 h-3" /> {storeIsAr ? 'آمن' : 'Sécurisé'}</span>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl w-max mt-4 shadow-inner">
             <button onClick={() => { setPlatformMode('gestion'); setActiveTab('orders'); }} className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${platformMode === 'gestion' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>{storeIsAr ? 'إدارة المتجر' : 'Gestion Boutique'}</button>
             <button onClick={() => { setPlatformMode('builder'); setActiveTab('themes'); }} className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${platformMode === 'builder' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>{storeIsAr ? 'تطوير الموقع' : 'Développement Site'}</button>
          </div>
        </div>
        <div className={`flex items-center gap-2 ${storeIsAr ? 'flex-row-reverse' : ''}`}>
          <button onClick={handleSave} disabled={isSaving} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${isSaving ? 'bg-green-500 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            {isSaving ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />} {isSaving ? (storeIsAr ? 'تم الحفظ' : 'Enregistré') : (storeIsAr ? 'حفظ' : 'Enregistrer')}
          </button>
          <button onClick={() => setShowPreview(true)} className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-2 rounded-xl text-sm font-black hover:bg-indigo-100 hover:scale-105 transition-all shadow-sm" title={storeIsAr ? 'محرر الموقع الاحترافي' : 'Éditeur Visuel PRO'}>
            <LayoutTemplate className="w-4 h-4" /> {storeIsAr ? 'بناء الموقع' : 'Éditeur PRO'}
          </button>
          <button onClick={() => {
             const url = customDomain ? `https://${customDomain}` : `https://${storeName.toLowerCase().replace(/\s+/g, '')}.beyacreative.com`;
             window.open(url, '_blank');
          }} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm" title={storeIsAr ? 'زيارة المتجر المباشر' : 'Visiter la boutique en ligne'}>
            <ExternalLink className="w-4 h-4" /> {storeIsAr ? 'زيارة المتجر' : 'Visiter'}
          </button>
          <button onClick={handlePublish} disabled={isPublishing} className="flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:shadow-lg transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />} 
            {isPublishing ? (storeIsAr ? 'جاري النشر...' : 'Publication...') : (storeIsAr ? 'نشر' : 'Publier')}
          </button>
        </div>
      </div>

      <div className={`flex gap-6 ${storeIsAr ? 'flex-row-reverse' : ''}`}>
        {/* VERTICAL SIDE NAVIGATION */}
        <div className="w-24 shrink-0 flex flex-col gap-3">
           {(platformMode === 'gestion' ? [
                 { id: 'orders', icon: ListOrdered, label: storeIsAr ? 'الطلبات' : 'Commandes' },
                 { id: 'products', icon: ShoppingBag, label: storeIsAr ? 'المنتجات' : 'Produits' },
                 { id: 'customers', icon: Users, label: storeIsAr ? 'الزبائن' : 'Clients' },
                 { id: 'payments', icon: CreditCard, label: storeIsAr ? 'الأداء' : 'Paiements' },
                 { id: 'delivery', icon: Truck, label: storeIsAr ? 'التوصيل' : 'Livraison' }
           ] : [
                 { id: 'themes', icon: LayoutTemplate, label: storeIsAr ? 'القوالب' : 'Thèmes' },
                 { id: 'design', icon: Paintbrush, label: storeIsAr ? 'التصميم' : 'Design' },
                 { id: 'apps', icon: Box, label: storeIsAr ? 'تطبيقات' : 'Apps' },
                 { id: 'settings', icon: Settings, label: storeIsAr ? 'إعدادات' : 'Config' }
           ]).map(tab => (
                 <button 
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`w-full py-4 px-2 text-[10px] font-bold flex flex-col items-center justify-center gap-2 rounded-2xl transition-all border ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg scale-105 border-indigo-600' : 'bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 border-slate-200 shadow-sm'}`}
                 >
                   <tab.icon className="w-5 h-5" /> <span className="text-center leading-tight">{tab.label}</span>
                 </button>
           ))}
        </div>

        {/* CONTROLS / CONTENT PANEL */}
        <div className={`${['themes', 'design'].includes(activeTab) ? (isControlsCollapsed ? 'w-0 border-0 opacity-0 mx-0 p-0 overflow-hidden' : 'w-[420px]') : 'flex-1'} bg-white rounded-3xl ${isControlsCollapsed ? 'border-transparent' : 'border-slate-200'} shadow-sm shrink-0 transition-all duration-300 overflow-hidden flex flex-col h-[calc(100vh-140px)]`}>
            <div className={`p-8 overflow-y-auto flex-1 flex justify-center`}>
              <div className="w-full max-w-5xl">
              {/* THEMES TAB */}
              {activeTab === 'themes' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Thème Actif</label>
                    <div className="border-2 border-indigo-600 rounded-xl p-1 relative bg-slate-50">
                      <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow-lg z-10"><CheckCircle className="w-3 h-3" /></div>
                      <div className="aspect-video bg-cover bg-center rounded-lg mb-2 relative" style={{ backgroundImage: `url(${activeTheme.previewImg})` }}>
                         <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                            <span className="text-white font-black tracking-widest uppercase drop-shadow-md">{activeTheme.name}</span>
                         </div>
                      </div>
                      <p className="text-xs font-bold text-slate-800 text-center py-1">Layout: {activeTheme.layout}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Catalogue de Thèmes</label>
                    <div className="grid grid-cols-2 gap-3">
                      {THEMES.filter(t => t.id !== activeTheme.id).map(t => (
                        <div 
                           key={t.id} 
                           onClick={() => applyTheme(t)}
                           className="border border-slate-200 rounded-xl p-1 cursor-pointer hover:border-indigo-500 transition-all opacity-80 hover:opacity-100 group"
                        >
                          <div className="aspect-video bg-cover bg-center rounded-lg mb-1 relative" style={{ backgroundImage: `url(${t.previewImg})` }}>
                             <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                                <span className="text-white text-[8px] font-black tracking-widest uppercase text-center px-1">{t.name}</span>
                             </div>
                          </div>
                          <p className="text-[9px] font-bold text-slate-500 text-center">{t.layout}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ORDERS TAB (NEW PRO DASHBOARD!) */}
              {activeTab === 'orders' && (
                 <div className="space-y-6">
                    {/* Dashboard KPIs */}
                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-200 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-[10px] font-black text-indigo-100 uppercase tracking-wider">Commandes</span>
                             <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"><ShoppingBag className="w-3 h-3 text-white" /></div>
                          </div>
                          <div>
                             <h4 className="text-2xl font-black text-white">{!config.storeName ? '0' : '1,248'}</h4>
                             <p className="text-[9px] text-indigo-200 font-bold mt-1">+12% ce mois</p>
                          </div>
                       </div>
                       
                       <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-200 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-[10px] font-black text-emerald-50 uppercase tracking-wider">Revenus</span>
                             <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"><CreditCard className="w-3 h-3 text-white" /></div>
                          </div>
                          <div>
                             <h4 className="text-xl font-black text-white">{!config.storeName ? '0' : '45,200'} <span className="text-[10px]">MAD</span></h4>
                             <p className="text-[9px] text-emerald-100 font-bold mt-1">+18% ce mois</p>
                          </div>
                       </div>

                       <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group cursor-pointer hover:border-green-300 transition-colors">
                          <div>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Confirmées</p>
                             <h4 className="text-lg font-black text-slate-800">{!config.storeName ? '0' : '856'}</h4>
                          </div>
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors"><CheckCircle className="w-4 h-4 text-green-600" /></div>
                       </div>

                       <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group cursor-pointer hover:border-rose-300 transition-colors">
                          <div>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Refusées</p>
                             <h4 className="text-lg font-black text-slate-800">{!config.storeName ? '0' : '124'}</h4>
                          </div>
                          <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center group-hover:bg-rose-200 transition-colors"><X className="w-4 h-4 text-rose-600" /></div>
                       </div>
                    </div>
                    
                    {/* Recent Orders List */}
                    <div>
                       <div className="flex justify-between items-center mb-3">
                          <div className="flex gap-4 items-center">
                            <h3 className={`text-xs font-black uppercase tracking-wider cursor-pointer transition-colors ${!showTrash ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`} onClick={() => setShowTrash(false)}>Récentes</h3>
                            <h3 className={`text-xs font-black uppercase tracking-wider cursor-pointer flex items-center gap-1 transition-colors ${showTrash ? 'text-rose-600' : 'text-slate-400 hover:text-rose-400'}`} onClick={() => setShowTrash(true)}>
                               <Trash2 className="w-3 h-3" /> Poubelle
                            </h3>
                          </div>
                          <span className="text-[10px] text-indigo-600 font-bold cursor-pointer hover:underline">Voir tout</span>
                       </div>
                       <div className="space-y-3">
                          {storeOrders.filter(o => showTrash ? o.deleted : !o.deleted).length === 0 ? (
                             <div className="text-center p-6 text-slate-400 text-sm font-bold border-2 border-dashed border-slate-200 rounded-2xl">{showTrash ? (storeIsAr ? 'سلة المهملات فارغة' : 'La corbeille est vide') : (storeIsAr ? 'لا توجد طلبات' : 'Aucune commande')}</div>
                          ) : storeOrders.filter(o => showTrash ? o.deleted : !o.deleted).map(order => (
                             <div key={order.id} onClick={() => setSelectedOrder(order)} className="p-3 border border-slate-200 rounded-2xl bg-white shadow-sm cursor-pointer hover:border-indigo-500 transition-colors hover:shadow-md group">
                                <div className="flex justify-between items-start mb-2">
                                   <div className="flex items-center gap-2">
                                      <span className="text-xs font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{order.id}</span>
                                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${order.statusColor}`}>{order.status}</span>
                                   </div>
                                   <span className="text-[10px] text-slate-400 font-bold">{order.date}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                   <div>
                                      <p className="text-sm font-bold text-slate-700">{order.customer}</p>
                                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">{order.items}</p>
                                   </div>
                                   <span className="text-xs font-black text-slate-800">{order.amount}</span>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              )}

              {/* CUSTOMERS TAB (NEW!) */}
              {activeTab === 'customers' && (
                 <div className="space-y-4">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Gestion des Clients</h3>
                    <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                       <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                       <h4 className="text-lg font-bold text-slate-600">Aucun client pour le moment</h4>
                       <p className="text-sm text-slate-400 mt-2">Les clients apparaîtront ici lorsqu'ils passeront des commandes.</p>
                    </div>
                 </div>
              )}

              {/* DELIVERY TAB (NEW!) */}
              {activeTab === 'delivery' && (
                 <div className="space-y-4">
                    <div className="flex justify-between items-center mb-6">
                       <div>
                          <h3 className="text-xl font-black text-slate-800 tracking-tight">Livraison</h3>
                          <p className="text-xs text-slate-500 font-bold mt-1">Gérez vos sociétés de livraison partenaires</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="p-4 border-2 border-indigo-600 bg-indigo-50/30 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer hover:bg-indigo-50 transition-colors">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm font-black text-indigo-600 text-xs">AM</div>
                             <div>
                                <h4 className="font-black text-slate-800">Amana</h4>
                                <p className="text-[10px] text-slate-500 font-bold">Standard • National</p>
                             </div>
                          </div>
                          <span className="text-[10px] bg-indigo-600 text-white px-2 py-1 rounded-lg font-black uppercase tracking-wider">Actif</span>
                       </div>
                       <div className="p-4 border border-slate-200 bg-white rounded-2xl flex items-center justify-between opacity-60 cursor-pointer hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shadow-sm font-black text-slate-400 text-xs">GR</div>
                             <div>
                                <h4 className="font-black text-slate-600">Ghazal</h4>
                                <p className="text-[10px] text-slate-400 font-bold">Express • National</p>
                             </div>
                          </div>
                          <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-1 rounded-lg font-black uppercase tracking-wider">Inactif</span>
                       </div>
                    </div>
                 </div>
              )}

              {/* PAYMENTS TAB (NEW!) */}
              {activeTab === 'payments' && (
                 <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Méthodes de Paiement</h3>
                    
                    <div className="p-4 border-2 border-indigo-600 rounded-xl bg-indigo-50/30 shadow-sm relative overflow-hidden">
                       <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded-bl-lg">Actif</div>
                       <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                             <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                             <h4 className="text-sm font-black text-slate-800">Paiement à la Livraison (COD)</h4>
                             <p className="text-[10px] text-slate-500">Le client paie à la réception.</p>
                          </div>
                       </div>
                    </div>

                    <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                       <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center">
                             <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                             <h4 className="text-sm font-black text-slate-800">Carte Bancaire (Stripe)</h4>
                             <p className="text-[10px] text-slate-500">Acceptez les paiements par carte.</p>
                          </div>
                       </div>
                       <button className="mt-3 w-full py-2 bg-slate-900 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">Configurer</button>
                    </div>

                    <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                       <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center">
                             <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                             <h4 className="text-sm font-black text-slate-800">PayPal</h4>
                             <p className="text-[10px] text-slate-500">Paiement via compte PayPal.</p>
                          </div>
                       </div>
                       <button className="mt-3 w-full py-2 bg-slate-900 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">Configurer</button>
                    </div>
                 </div>
              )}

              {/* DESIGN TAB (NEW!) */}
              {activeTab === 'design' && (
                 <div className="space-y-6">
                    {/* PRO BUILDER BANNER */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/30 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-2 duration-500">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                       <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                       
                       <div className="relative z-10 flex flex-col items-center text-center">
                          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-3 border border-white/20 backdrop-blur-sm">
                             <LayoutTemplate className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-xl font-black tracking-tight mb-2">
                             {storeIsAr ? 'محرر الموقع الاحترافي' : 'Éditeur Visuel PRO'}
                          </h3>
                          <p className="text-indigo-100 text-xs mb-5 leading-relaxed px-2 font-medium">
                             {storeIsAr ? 'صمم موقعك بالكامل! أضف نصوصاً، صوراً، أقساماً، وتحكم بكل شيء بسهولة تامة.' : 'Concevez votre site de A à Z ! Gérez le design, le texte et les sections avec des outils pro.'}
                          </p>
                          <button onClick={() => setShowPreview(true)} className="w-full bg-white text-indigo-600 font-black py-3.5 rounded-xl shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3)] hover:bg-slate-50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                             <Paintbrush className="w-4 h-4" />
                             {storeIsAr ? 'افتح المحرر المرئي' : 'Ouvrir l\'Éditeur PRO'}
                          </button>
                       </div>
                    </div>

                    <div className="pt-2">
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Couleur Principale</label>
                       <div className="flex items-center gap-3 mb-3">
                          <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                          <span className="text-sm font-mono text-slate-600">{primaryColor.toUpperCase()}</span>
                       </div>
                       <div className="flex gap-2">
                          {['#0f172a', '#171717', '#b48a44', '#84cc16', '#4d7c0f', '#0ea5e9', '#e11d48'].map(c => (
                             <button key={tr(c)} onClick={() => setPrimaryColor(c)} className="w-6 h-6 rounded-full border border-black/10 shadow-sm hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                          ))}
                       </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100">
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Typographie</label>
                       <div className="space-y-2">
                          <button onClick={() => setFontFamily('font-sans')} className={`w-full p-3 rounded-lg border text-left flex justify-between items-center ${fontFamily === 'font-sans' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                             <span className="font-sans font-medium">Inter / Roboto (Sans-serif)</span>
                             {fontFamily === 'font-sans' && <Check className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setFontFamily('font-serif')} className={`w-full p-3 rounded-lg border text-left flex justify-between items-center ${fontFamily === 'font-serif' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                             <span className="font-serif font-medium">Playfair / Merriweather (Serif)</span>
                             {fontFamily === 'font-serif' && <Check className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setFontFamily('font-mono')} className={`w-full p-3 rounded-lg border text-left flex justify-between items-center ${fontFamily === 'font-mono' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                             <span className="font-mono font-medium">Space Mono (Monospace)</span>
                             {fontFamily === 'font-mono' && <Check className="w-4 h-4" />}
                          </button>
                       </div>
                    </div>
                 </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{storeIsAr ? 'اسم العلامة التجارية' : 'Nom de la marque'}</label>
                    <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{storeIsAr ? 'النطاق (URL)' : 'Domaine (URL)'}</label>
                    <div className="flex items-center">
                      <input type="text" value={storeName.toLowerCase().replace(/\s+/g, '')} disabled className="w-full px-3 py-2 border border-slate-200 rounded-l-lg text-sm font-medium bg-slate-50 text-slate-500" />
                      <span className="px-3 py-2 bg-slate-100 border border-l-0 border-slate-200 rounded-r-lg text-xs font-bold text-slate-500">.beyacreative.com</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PRODUCTS TAB */}
              {activeTab === 'products' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                     <div>
                        <h2 className="text-2xl font-black text-slate-800">Produits</h2>
                        <p className="text-sm text-slate-500 font-medium">Gérez votre catalogue et vos stocks.</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <button onClick={() => setIsImportModalOpen(true)} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-2 shadow-sm">
                           <Search className="w-4 h-4" /> Importer de l'ERP
                        </button>
                        <button onClick={() => { 
                           setProductForm({ name: '', price: '', stock: '', description: '', colors: [], sizes: [] }); 
                           setIsProductModalOpen(true); 
                        }} className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors flex items-center gap-2 shadow-md">
                           <Plus className="w-4 h-4" /> Nouveau produit
                        </button>
                     </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                     <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-700">Tous les produits ({storeProducts.length})</h3>
                        <div className="flex items-center gap-4">
                           <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
                              <button onClick={() => setProductsViewMode('list')} className={`p-1.5 rounded-md transition-colors ${productsViewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}><ListIcon className="w-4 h-4" /></button>
                              <button onClick={() => setProductsViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${productsViewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid className="w-4 h-4" /></button>
                           </div>
                           <div className="relative">
                              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input type="text" placeholder="Rechercher..." className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white" />
                           </div>
                        </div>
                     </div>
                     
                     {productsViewMode === 'list' ? (
                        <div className="divide-y divide-slate-100">
                           {storeProducts.map(p => (
                              <div key={p.id} onClick={() => { setProductForm(p); setIsProductModalOpen(true); }} className="p-4 flex items-center gap-6 hover:bg-slate-50 cursor-pointer transition-colors group">
                                 <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                                    {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover" alt="" /> : <Box className="w-6 h-6 text-slate-300 group-hover:text-indigo-400" />}
                                 </div>
                                 <div className="flex-1">
                                    <h4 className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{p.name}</h4>
                                    <div className="flex items-center gap-4 mt-1">
                                       <span className="text-xs font-medium text-slate-500 flex items-center gap-1"><Box className="w-3 h-3" /> {Object.keys(p.variantQuantities || {}).length > 0 ? 'Stock par variante' : (p.stock || 0) + ' en stock'}</span>
                                       {p.sizes?.length > 0 && <span className="text-xs font-medium text-slate-500 flex items-center gap-1"><LayoutTemplate className="w-3 h-3" /> {p.sizes.length} Tailles</span>}
                                    </div>
                                 </div>
                                 <div className="text-right shrink-0">
                                    <p className="text-base font-black text-slate-800">{p.price} MAD</p>
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded">Actif</span>
                                 </div>
                                 <div className="pl-4 shrink-0 border-l border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    <button 
                                      onClick={(e) => { 
                                         e.stopPropagation(); 
                                         setShowPreview(true);
                                      }}
                                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                      title={storeIsAr ? 'معاينة في المتجر' : 'Voir sur le site'}
                                    >
                                       <ExternalLink className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={(e) => { 
                                         e.stopPropagation(); 
                                         setStoreProducts(storeProducts.filter(x => x.id !== p.id));
                                      }}
                                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                      title={storeIsAr ? 'حذف المنتج' : 'Supprimer'}
                                    >
                                       <X className="w-4 h-4" />
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="p-4 grid grid-cols-3 gap-4">
                           {storeProducts.map(p => (
                              <div key={p.id} onClick={() => { setProductForm(p); setIsProductModalOpen(true); }} className="border border-slate-200 rounded-xl bg-white hover:border-indigo-500 cursor-pointer transition-colors group overflow-hidden flex flex-col h-full">
                                 <div className="aspect-square bg-slate-50 relative border-b border-slate-100">
                                    {getCoverImage(p) ? (
                                       <img src={getCoverImage(p) as string} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                       <div className="w-full h-full flex items-center justify-center"><Box className="w-10 h-10 text-slate-300 group-hover:text-indigo-400" /></div>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-1">
                                       <span className="px-2 py-0.5 bg-green-500 text-white text-[9px] font-black uppercase rounded shadow-sm">Actif</span>
                                    </div>
                                 </div>
                                 <div className="p-4 flex flex-col flex-1">
                                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">{p.name}</h4>
                                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{p.category || 'Sans catégorie'}</p>
                                    <div className="mt-auto pt-3 flex items-center justify-between">
                                       <span className="text-sm font-black text-slate-800">{p.price} MAD</span>
                                       <div className="flex items-center gap-1">
                                          <button onClick={(e) => { e.stopPropagation(); setShowPreview(true); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title={storeIsAr ? 'معاينة في المتجر' : 'Voir sur le site'}>
                                             <ExternalLink className="w-4 h-4" />
                                          </button>
                                          <button onClick={(e) => { e.stopPropagation(); setStoreProducts(storeProducts.filter(x => x.id !== p.id)); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title={storeIsAr ? 'حذف المنتج' : 'Supprimer'}>
                                             <X className="w-4 h-4" />
                                          </button>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
                </div>
              )}

              {/* APPS TAB */}
              {activeTab === 'apps' && (
                 <div className="space-y-4">
                     <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4">
                        <h4 className="text-sm font-black text-indigo-800 mb-1">{storeIsAr ? 'متجر تطبيقات BEYA' : 'App Store BEYA'}</h4>
                        <p className="text-xs text-indigo-600">{storeIsAr ? 'طوّر متجرك بإضافات بنقرة واحدة (مثل تطبيقات Shopify).' : 'Développez votre boutique avec nos plugins 1-clic (Similaires aux apps Shopify).'}</p>
                     </div>
                     <div className="space-y-3">
                        {[
                           { name: 'WhatsApp Chat', desc: 'Discutez avec vos clients en direct', descAr: 'تواصل مع عملائك مباشرة', icon: '💬', color: 'bg-green-100 text-green-600' },
                           { name: 'Facebook Pixel', desc: 'Suivez vos conversions Facebook Ads', descAr: 'تتبع تحويلات إعلانات فيسبوك', icon: 'f', color: 'bg-blue-100 text-blue-600 font-serif' },
                           { name: 'TikTok Pixel', desc: 'Optimisez vos campagnes TikTok', descAr: 'حسّن حملاتك الإعلانية على TikTok', icon: '♪', color: 'bg-black text-white' },
                           { name: 'Google Analytics 4', desc: 'Analysez votre trafic en temps réel', descAr: 'حلّل زيارات موقعك في الوقت الحقيقي', icon: 'G', color: 'bg-orange-100 text-orange-600 font-serif' },
                           { name: 'Mailchimp Sync', desc: "Synchronisez vos clients pour l'emailing", descAr: 'زامن قائمة عملائك للتسويق بالبريد', icon: 'M', color: 'bg-yellow-100 text-yellow-600 font-serif' },
                        ].map(app => (
                           <div key={app.name} className="p-3 border border-slate-200 rounded-xl flex items-center gap-4 hover:border-indigo-300 transition-colors">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black ${app.color}`}>{app.icon}</div>
                              <div className="flex-1">
                                 <p className="text-sm font-bold text-slate-800">{app.name}</p>
                                 <p className="text-[10px] text-slate-500 mt-1">{storeIsAr ? (app.descAr || app.desc) : app.desc}</p>
                              </div>
                              <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 transition-colors shadow-sm">{storeIsAr ? 'إضافة' : 'Ajouter'}</button>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {/* SETTINGS TAB */}
               {activeTab === 'settings' && (
                 <div className="space-y-6">
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                        <div>
                           <h4 className="text-xs font-black text-slate-800 mb-2 uppercase tracking-wider">{storeIsAr ? 'لغة المتجر' : 'Langue de la boutique'}</h4>
                           <div className="flex gap-2">
                              <button onClick={() => setStoreLang('fr')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${storeLang === 'fr' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>Français</button>
                              <button onClick={() => setStoreLang('en')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${storeLang === 'en' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>English</button>
                              <button onClick={() => setStoreLang('ar')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${storeLang === 'ar' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>العربية</button>
                           </div>
                        </div>
                     </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                       <div>
                          <h4 className="text-xs font-black text-slate-800 mb-1 uppercase tracking-wider">{storeIsAr ? 'اسم المتجر' : 'Nom de la boutique'}</h4>
                          <input 
                            type="text" 
                            value={storeName} 
                            onChange={e => setStoreName(e.target.value)} 
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 mt-2"
                          />
                       </div>
                       
                       <div className="pt-4 border-t border-slate-200">
                          <h4 className="text-xs font-black text-slate-800 mb-2 uppercase tracking-wider">{storeIsAr ? 'شعار المتجر (اختياري)' : 'Logo de la boutique (Optionnel)'}</h4>
                          <div className="flex items-center gap-4">
                             <div className="w-16 h-16 bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                                {storeLogo ? <img src={storeLogo} className="w-full h-full object-contain p-1" alt="Logo" /> : <ImageIcon className="w-6 h-6 text-slate-300" />}
                             </div>
                             <label className="cursor-pointer px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm">
                                {storeIsAr ? 'رفع الشعار' : 'Importer un logo'}
                                <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                   const file = e.target.files?.[0];
                                   if (file) setStoreLogo(await readFileAsBase64(file));
                                }} />
                             </label>
                             {storeLogo && (
                                <button onClick={() => setStoreLogo('')} className="text-xs font-bold text-rose-500 hover:text-rose-600">{storeIsAr ? 'إزالة' : 'Retirer'}</button>
                             )}
                          </div>
                       </div>
                       
                       <div className="pt-4 border-t border-slate-200">
                          <h4 className="text-xs font-black text-slate-800 mb-2 uppercase tracking-wider">{storeIsAr ? 'أيقونة المتجر (Favicon)' : 'Favicon de la boutique'}</h4>
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                                {storeFavicon ? <img src={storeFavicon} className="w-full h-full object-contain" alt="Favicon" /> : <ImageIcon className="w-4 h-4 text-slate-300" />}
                             </div>
                             <label className="cursor-pointer px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm">
                                {storeIsAr ? 'رفع الأيقونة' : 'Importer un favicon'}
                                <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                   const file = e.target.files?.[0];
                                   if (file) setStoreFavicon(await readFileAsBase64(file));
                                }} />
                             </label>
                             {storeFavicon && (
                                <button onClick={() => setStoreFavicon('')} className="text-xs font-bold text-rose-500 hover:text-rose-600">{storeIsAr ? 'إزالة' : 'Retirer'}</button>
                             )}
                          </div>
                       </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                       <h4 className="text-xs font-black text-slate-800 mb-1 uppercase tracking-wider flex items-center gap-2"><Globe className="w-4 h-4 text-indigo-600" /> {storeIsAr ? 'نطاق مخصص (دومين)' : 'Domaine Personnalisé'}</h4>
                       <p className="text-[10px] text-slate-500 mb-2">{storeIsAr ? 'اربط النطاق الخاص بك (مثال: www.maboutique.com)' : 'Connectez votre propre domaine (ex: www.maboutique.com).'}</p>
                       <div className="flex gap-2">
                         <input 
                           type="text" 
                           placeholder={storeIsAr ? 'مثال: www.maboutique.com' : 'ex: www.maboutique.com'}
                           value={customDomain} 
                           onChange={e => setCustomDomain(e.target.value)} 
                           className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 font-medium"
                         />
                         <button onClick={handleLinkDomain} disabled={isLinkingDomain} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50">
                           {isLinkingDomain ? '...' : storeIsAr ? 'ربط' : 'Lier'}
                         </button>
                       </div>
                       {domainError && <p className="text-xs text-rose-500 mt-2 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {domainError}</p>}
                       
                       {customDomain && (
                          <div className="mt-4 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                             <div className="bg-indigo-50/50 p-3 border-b border-slate-100 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                                <span className="text-xs font-bold text-slate-700">{storeIsAr ? 'إعدادات مطلوبة (Namecheap, Hostinger...)' : 'Configuration requise (Namecheap, Hostinger...)'}</span>
                             </div>
                             <div className="p-4 space-y-4">
                                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                                   {storeIsAr ? <>لكي يعمل نطاقك، أضف <b>سجل A (A Record)</b> عند مزود الخدمة الخاص بك (Namecheap, Hostinger...) بهذه المعلومات :</> : <>Pour que votre domaine fonctionne, ajoutez un <b>Enregistrement A (A Record)</b> chez votre fournisseur (Namecheap, Hostinger...) avec ces informations :</>}
                                </p>
                                <div className="space-y-2">
                                   <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg group">
                                      <span className="text-xs text-slate-500 font-medium w-16">{storeIsAr ? 'النوع' : 'Type'}</span>
                                      <code className="text-xs font-black text-slate-800 tracking-wide flex-1">A</code>
                                   </div>
                                   <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg group">
                                      <span className="text-xs text-slate-500 font-medium w-16">Nom/Hôte</span>
                                      <code className="text-xs font-black text-slate-800 tracking-wide flex-1">@</code>
                                      <button onClick={() => navigator.clipboard.writeText('@')} className="p-1 text-slate-400 group-hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Copier"><Copy className="w-3.5 h-3.5" /></button>
                                   </div>
                                   <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg group">
                                      <span className="text-xs text-slate-500 font-medium w-16">Valeur/IP</span>
                                      <code className="text-xs font-black text-slate-800 tracking-wide flex-1">76.76.21.21</code>
                                      <button onClick={() => navigator.clipboard.writeText('76.76.21.21')} className="p-1 text-slate-400 group-hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Copier"><Copy className="w-3.5 h-3.5" /></button>
                                   </div>
                                </div>
                                <p className="text-[10px] text-slate-400 italic">La propagation DNS peut prendre entre 15 minutes et 24 heures.</p>
                             </div>
                          </div>
                       )}
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                       <h4 className="text-xs font-black text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                         <LayoutTemplate className="w-4 h-4 text-indigo-600" /> {storeIsAr ? 'إدارة الصفحات' : 'Gestion des Pages'}
                       </h4>
                       
                       <div className="flex gap-2 mb-4">
                          <input 
                            type="text" 
                            placeholder="Titre (ex: Contact)" 
                            value={newPageTitle}
                            onChange={e => setNewPageTitle(e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" 
                          />
                          <button 
                            onClick={() => {
                               if(newPageTitle) {
                                  const id = newPageTitle.toLowerCase().replace(/\s+/g, '-');
                                  setStorePages([...storePages, { id, title: newPageTitle, isDefault: false }]);
                                  setNewPageTitle('');
                               }
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                          >
                            {storeIsAr ? 'إضافة' : 'Ajouter'}
                          </button>
                       </div>

                       <div className="space-y-2">
                          {storePages.map(page => (
                             <div key={page.id} onClick={() => { setPageForm(page); setIsPageModalOpen(true); }} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/30 transition-colors">
                                <div className="flex items-center gap-3">
                                   <div className={`w-2 h-2 rounded-full ${page.isDefault ? 'bg-indigo-400' : 'bg-green-400'}`}></div>
                                   <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{tr(page.title)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                   {!page.isDefault && (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); setStorePages(storePages.filter(p => p.id !== page.id)); }}
                                        className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-md hover:bg-rose-50"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                   )}
                                   {page.isDefault && (
                                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2 py-1 bg-slate-200 rounded-md">{storeIsAr ? 'نظام' : 'Système'}</span>
                                   )}
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-4 mb-4">
                        <h4 className="text-xs font-black text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                          <LayoutTemplate className="w-4 h-4 text-indigo-600" /> Pied de page (Footer)
                        </h4>
                        
                        <div className="space-y-4">
                           <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{storeIsAr ? 'نص حقوق النشر' : 'Texte du Copyright'}</label>
                              <input 
                                type="text" 
                                value={footerSettings.copyright}
                                onChange={e => setFooterSettings({...footerSettings, copyright: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" 
                              />
                           </div>

                           <div className="space-y-2 pt-2">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pages Légales (Générées Automatiquement)</label>
                              
                              <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                                 <input type="checkbox" checked={footerSettings.showPrivacy} onChange={e => setFooterSettings({...footerSettings, showPrivacy: e.target.checked})} className="w-4 h-4 accent-indigo-600" />
                                 <span className="text-sm font-bold text-slate-700">{storeIsAr ? 'سياسة الخصوصية' : 'Politique de Confidentialité'}</span>
                              </label>
                              
                              <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                                 <input type="checkbox" checked={footerSettings.showTerms} onChange={e => setFooterSettings({...footerSettings, showTerms: e.target.checked})} className="w-4 h-4 accent-indigo-600" />
                                 <span className="text-sm font-bold text-slate-700">Conditions Générales de Vente (CGV)</span>
                              </label>
                              
                              <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                                 <input type="checkbox" checked={footerSettings.showCookies} onChange={e => setFooterSettings({...footerSettings, showCookies: e.target.checked})} className="w-4 h-4 accent-indigo-600" />
                                 <span className="text-sm font-bold text-slate-700">{storeIsAr ? 'سياسة ملفات الارتباط' : 'Politique des Cookies'}</span>
                              </label>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-4">
                       <h4 className="text-xs font-black text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                         <ShoppingBag className="w-4 h-4 text-indigo-600" /> Mode d'Achat (Boutons)
                       </h4>
                       <div className="space-y-3">
                          <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                             <input type="radio" name="buyMode" checked={buyMode === 'both'} onChange={() => setBuyMode('both')} className="accent-indigo-600" />
                             {storeIsAr ? "عرض 'أضف للسلة' و'اشتري الآن'" : "Afficher 'Ajouter au panier' & 'Acheter direct'"}
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                             <input type="radio" name="buyMode" checked={buyMode === 'direct'} onChange={() => setBuyMode('direct')} className="accent-indigo-600" />
                             Uniquement 'Acheter direct' (Express)
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                             <input type="radio" name="buyMode" checked={buyMode === 'cart'} onChange={() => setBuyMode('cart')} className="accent-indigo-600" />
                             {storeIsAr ? "فقط 'أضف للسلة' (كلاسيكي)" : "Uniquement 'Ajouter au panier' (Classique)"}
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                             <input type="radio" name="buyMode" checked={buyMode === 'form'} onChange={() => setBuyMode('form')} className="accent-indigo-600" />
                             Formulaire intégré (Express sur la page)
                          </label>
                       </div>
                    </div>
                 </div>
               )}
              </div>
            </div>
          </div>

        {/* Right Area - Live Preview */}
        {['themes', 'design'].includes(activeTab) && (
        <div className="flex-1 bg-slate-100 rounded-3xl border-4 border-slate-200 overflow-hidden flex flex-col relative h-[calc(100vh-140px)] animate-in fade-in slide-in-from-right-4 duration-500">
          {/* Browser Header */}
          <div className="bg-white border-b border-slate-200 p-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              {['themes', 'design'].includes(activeTab) && (
                 <button onClick={() => setIsControlsCollapsed(!isControlsCollapsed)} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors border border-slate-200 shadow-sm">
                    {isControlsCollapsed ? <><Minimize2 className="w-3.5 h-3.5" /> Afficher outils</> : <><Maximize2 className="w-3.5 h-3.5" /> Agrandir</>}
                 </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <button onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded-md ${previewDevice === 'desktop' ? 'text-indigo-600 bg-indigo-50' : 'hover:bg-slate-100'}`}><Monitor className="w-4 h-4" /></button>
              <button onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded-md ${previewDevice === 'mobile' ? 'text-indigo-600 bg-indigo-50' : 'hover:bg-slate-100'}`}><Smartphone className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Iframe / Preview Area */}
          <div className="flex-1 bg-slate-200 relative overflow-y-auto flex items-start justify-center p-4">
             <div className={`bg-white shadow-2xl transition-all duration-500 overflow-hidden ${previewDevice === 'mobile' ? 'w-[375px] h-[812px] rounded-[2rem] border-[8px] border-slate-800' : 'w-full min-h-full rounded-lg'}`}>
                <StorePreviewWrapper />
             </div>
          </div>
        </div>
        )}
      </div>

      {/* FULL SCREEN PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-[200] bg-slate-100 flex overflow-hidden">
          {/* VISUAL BUILDER SIDEBAR (LEFT) */}
          <div className="w-[320px] bg-white border-r border-slate-200 flex flex-col shrink-0 z-20 shadow-2xl">
             <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2 text-indigo-700">
                   <LayoutTemplate className="w-5 h-5" />
                   <span className="font-black tracking-tight">{storeIsAr ? 'المحرر المرئي' : 'Éditeur Visuel PRO'}</span>
                </div>
                <button onClick={() => setShowPreview(false)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded hover:text-rose-500 transition-colors">
                   <X className="w-4 h-4" />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                   <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3">{storeIsAr ? 'العناصر الأساسية' : 'Éléments de Base'}</h4>
                   <div className="grid grid-cols-2 gap-2">
                       <div onClick={() => { setActiveSidebarSection('hero'); if (!homeBlocks.includes('hero')) setHomeBlocks([...homeBlocks, 'hero']); }} className={`bg-white border ${activeSidebarSection === 'hero' ? 'border-indigo-500 shadow-md ring-2 ring-indigo-100' : 'border-slate-200'} rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group relative`}>
                          {homeBlocks.includes('hero') && <div className="absolute top-1 right-1"><CheckCircle className="w-3 h-3 text-indigo-500" /></div>}
                          <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform"><Type className="w-4 h-4" /></div>
                          <span className="text-[10px] font-bold text-slate-600">{storeIsAr ? 'القسم الرئيسي' : 'Bannière (Hero)'}</span>
                       </div>
                       <div onClick={() => { setActiveSidebarSection('slider'); if (!homeBlocks.includes('slider')) setHomeBlocks([...homeBlocks, 'slider']); else setHomeBlocks(homeBlocks.filter(b => b !== 'slider')); }} className={`bg-white border ${activeSidebarSection === 'slider' ? 'border-emerald-500 shadow-md ring-2 ring-emerald-100' : 'border-slate-200'} rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group relative`}>
                          {homeBlocks.includes('slider') && <div className="absolute top-1 right-1"><CheckCircle className="w-3 h-3 text-emerald-500" /></div>}
                          <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform"><ImageIcon className="w-4 h-4" /></div>
                          <span className="text-[10px] font-bold text-slate-600">{storeIsAr ? 'معرض صور' : 'Slider'}</span>
                       </div>
                       <div onClick={() => { setActiveSidebarSection('collections'); if (!homeBlocks.includes('collections')) setHomeBlocks([...homeBlocks, 'collections']); else setHomeBlocks(homeBlocks.filter(b => b !== 'collections')); }} className={`bg-white border ${activeSidebarSection === 'collections' ? 'border-amber-500 shadow-md ring-2 ring-amber-100' : 'border-slate-200'} rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group relative`}>
                          {homeBlocks.includes('collections') && <div className="absolute top-1 right-1"><CheckCircle className="w-3 h-3 text-amber-500" /></div>}
                          <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform"><MousePointerClick className="w-4 h-4" /></div>
                          <span className="text-[10px] font-bold text-slate-600">{storeIsAr ? 'تصنيفات' : 'Collections'}</span>
                       </div>
                       <div onClick={() => { setActiveSidebarSection('products'); if (!homeBlocks.includes('products')) setHomeBlocks([...homeBlocks, 'products']); else setHomeBlocks(homeBlocks.filter(b => b !== 'products')); }} className={`bg-white border ${activeSidebarSection === 'products' ? 'border-rose-500 shadow-md ring-2 ring-rose-100' : 'border-slate-200'} rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group relative`}>
                          {homeBlocks.includes('products') && <div className="absolute top-1 right-1"><CheckCircle className="w-3 h-3 text-rose-500" /></div>}
                          <div className="w-8 h-8 rounded bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform"><LayoutGrid className="w-4 h-4" /></div>
                          <span className="text-[10px] font-bold text-slate-600">{storeIsAr ? 'منتجات' : 'Produits'}</span>
                       </div>
                    </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{storeIsAr ? 'إعدادات القسم المحدد' : 'Paramètres de la Section'}</h4>
                   
                    {activeSidebarSection === 'hero' && (
                       <>
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? 'النص الرئيسي' : 'Texte Principal'}</label>
                          <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? 'النص الفرعي' : 'Sous-titre'}</label>
                          <input type="text" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? 'نص الزر' : 'Texte du Bouton'}</label>
                          <input type="text" value={heroButtonText} onChange={(e) => setHeroButtonText(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? 'صورة الغلاف' : 'Image de Couverture'}</label>
                          <label className="w-full h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors group relative overflow-hidden">
                             {heroImage ? (
                                <img src={heroImage} className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                             ) : null}
                             <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-slate-400 mb-1" />
                                <span className="text-[10px] font-bold text-slate-500">{storeIsAr ? 'تغيير الصورة' : 'Changer l\'image'}</span>
                             </div>
                             <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) setHeroImage(await readFileAsBase64(file));
                             }} />
                          </label>
                       </div>
                       </>
                    )}

                    {activeSidebarSection === 'slider' && (
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? 'صور السلايدر' : 'Images du Slider'}</label>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                             {sliderImages.map((img, idx) => (
                                <div key={idx} className="relative aspect-video rounded border border-slate-200 overflow-hidden group">
                                   <img src={img} className="w-full h-full object-cover" />
                                   <button onClick={() => setSliderImages(sliderImages.filter((_, i) => i !== idx))} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow"><X className="w-3 h-3"/></button>
                                </div>
                             ))}
                          </div>
                          <label className="w-full h-12 border-2 border-dashed border-indigo-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 text-indigo-500 transition-colors">
                             <span className="text-xs font-bold flex items-center gap-1"><Plus className="w-3 h-3"/> {storeIsAr ? 'إضافة صورة' : 'Ajouter une image'}</span>
                             <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) setSliderImages([...sliderImages, await readFileAsBase64(file)]);
                             }} />
                          </label>
                       </div>
                    )}

                    {activeSidebarSection === 'collections' && (
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? 'عنوان التصنيفات' : 'Titre des Collections'}</label>
                          <input type="text" value={allCollectionsTitle} onChange={(e) => setAllCollectionsTitle(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                       </div>
                    )}

                    {activeSidebarSection === 'products' && (
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? 'عنوان المنتجات المميزة' : 'Titre des Produits'}</label>
                          <input type="text" value={homeCollectionsTitle} onChange={(e) => setHomeCollectionsTitle(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                       </div>
                    )}

                    <div className="pt-4 mt-4 border-t border-slate-100">
                       <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{storeIsAr ? 'اللون الرئيسي' : 'Couleur Principale'}</label>
                       <div className="flex items-center gap-2">
                          <label className="w-8 h-8 rounded-full border border-slate-200 cursor-pointer flex-shrink-0 shadow-inner" style={{ backgroundColor: primaryColor }}>
                             <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="opacity-0 w-0 h-0" />
                          </label>
                          <input type="text" value={primaryColor} readOnly className="flex-1 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-2 py-1" />
                       </div>
                    </div>
                </div>
             </div>

             <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button onClick={handleSave} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                   <Save className="w-4 h-4" /> {storeIsAr ? 'حفظ التغييرات' : 'Sauvegarder'}
                </button>
             </div>
          </div>

          {/* VISUAL BUILDER CANVAS (RIGHT) */}
          <div className="flex-1 flex flex-col relative bg-slate-200/50">
             <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-center gap-4 px-4 shadow-sm z-10 shrink-0">
                <button onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded ${previewDevice === 'desktop' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>
                   <Monitor className="w-4 h-4" />
                </button>
                <button onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded ${previewDevice === 'mobile' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>
                   <Smartphone className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-200 mx-2"></div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                   <Globe className="w-3 h-3" />
                   {customDomain || `${storeName.toLowerCase().replace(/\s+/g, '')}.beyacreative.com`}
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start">
                <div className={`bg-white shadow-2xl rounded-b-2xl overflow-hidden transition-all duration-300 ring-1 ring-slate-900/5 ${previewDevice === 'mobile' ? 'w-[375px] rounded-t-3xl min-h-[812px]' : 'w-full max-w-5xl'}`}>
                   <StorePreviewWrapper isModal={true} />
                </div>
             </div>
          </div>
        </div>
      )}

      {/* PAGE EDIT MODAL */}
      {isPageModalOpen && pageForm && (
         <div className="fixed inset-0 z-[200] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div>
                     <h3 className="text-xl font-black text-slate-800">Éditer la page</h3>
                     <p className="text-xs text-slate-500 font-bold mt-1">Gérez le contenu et le référencement (SEO).</p>
                  </div>
                  <button onClick={() => setIsPageModalOpen(false)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 shadow-sm transition-all"><X className="w-5 h-5" /></button>
               </div>
               
               <div className="p-8 overflow-y-auto flex-1 space-y-6">
                  <div>
                     <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Titre de la page</label>
                     <input type="text" value={pageForm.title} onChange={e => setPageForm({...pageForm, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors" />
                     {pageForm.isDefault && <p className="text-[10px] text-amber-600 mt-2 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> C'est une page système. Son URL ne peut pas être modifiée.</p>}
                  </div>

                  {!pageForm.isDefault && (
                     <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Contenu (Texte / HTML)</label>
                        <textarea rows={8} value={pageForm.content || ''} onChange={e => setPageForm({...pageForm, content: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors" placeholder="Rédigez le contenu de votre page ici..."></textarea>
                     </div>
                  )}

                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                     <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2"><Globe className="w-4 h-4 text-slate-400" /> Aperçu SEO</h4>
                     <div className="space-y-1">
                        <p className="text-lg text-blue-600 font-medium truncate hover:underline cursor-pointer">{pageForm.title} - {storeName}</p>
                        <p className="text-sm text-green-700 truncate">https://{storeName.toLowerCase().replace(/\s+/g, '')}.beyacreative.com/{pageForm.isDefault ? pageForm.id : pageForm.title.toLowerCase().replace(/\s+/g, '-')}</p>
                        <p className="text-xs text-slate-600 line-clamp-2">{pageForm.content ? pageForm.content.substring(0, 150) : "Description automatique générée à partir du contenu de la page pour les moteurs de recherche..."}</p>
                     </div>
                  </div>
               </div>

               <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                  <button onClick={() => setIsPageModalOpen(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">{storeIsAr ? 'إلغاء' : 'Annuler'}</button>
                  <button onClick={() => {
                     setStorePages(storePages.map(p => p.id === pageForm.id ? pageForm : p));
                     setIsPageModalOpen(false);
                  }} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">{storeIsAr ? 'حفظ' : 'Enregistrer'}</button>
               </div>
            </div>
         </div>
      )}


      {/* ERP IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-8">
           <div className="bg-white w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                 <div>
                    <h2 className="text-3xl font-black text-slate-800">Importer depuis l'ERP</h2>
                    <p className="text-slate-500 mt-2">Sélectionnez les produits que vous souhaitez synchroniser avec votre boutique en ligne.</p>
                 </div>
                 <button onClick={() => setIsImportModalOpen(false)} className="p-4 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-200">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <div className="p-6 border-b border-slate-100 bg-white flex gap-4">
                 <div className="flex-1 relative">
                    <Search className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Rechercher un produit dans l'inventaire ERP..." className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 font-medium text-lg" />
                 </div>
                 <button className="px-8 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors border border-slate-200">Filtrer</button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                 <div className="grid grid-cols-4 gap-8">
                    {[
                       { id: 101, name: 'T-Shirt Oversize Black', price: '250.00', stock: 45 },
                       { id: 102, name: 'Cargo Pants Beige', price: '399.00', stock: 12 },
                       { id: 103, name: 'Sneakers Pro X', price: '850.00', stock: 8 },
                       { id: 104, name: 'Cap Classic Navy', price: '120.00', stock: 150 },
                       { id: 105, name: 'Hoodie Winter Essential', price: '550.00', stock: 34 },
                       { id: 106, name: 'Socks Pack (3)', price: '90.00', stock: 200 },
                       { id: 107, name: 'Jacket Denim Vintage', price: '650.00', stock: 5 },
                       { id: 108, name: 'Sunglasses Retro', price: '199.00', stock: 22 },
                    ].map(erpItem => (
                       <div key={erpItem.id} className="bg-white p-5 rounded-3xl border-2 border-slate-100 hover:border-indigo-500 transition-colors group cursor-pointer shadow-sm hover:shadow-xl">
                          <div className="aspect-square bg-slate-50 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden">
                             <ImageIcon className="w-16 h-16 text-slate-300" />
                             <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                <button 
                                   onClick={() => {
                                      setStoreProducts([{ id: Date.now(), name: erpItem.name, price: erpItem.price }, ...storeProducts]);
                                      setIsImportModalOpen(false);
                                   }}
                                   className="px-8 py-3 bg-indigo-600 text-white text-sm font-bold uppercase tracking-widest rounded-xl shadow-lg hover:scale-105 transition-transform"
                                >
                                   Importer
                                </button>
                             </div>
                          </div>
                          <h4 className="font-bold text-slate-800 text-lg">{erpItem.name}</h4>
                          <div className="flex items-center justify-between mt-3">
                             <p className="text-indigo-600 font-black text-lg">{erpItem.price} MAD</p>
                             <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">{erpItem.stock} en stock</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* PRO PRODUCT FORM MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8">
           <div className="bg-white w-full max-w-7xl max-h-[95vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
                 <div>
                    <h2 className="text-3xl font-black text-slate-800">{productForm?.id ? (storeIsAr ? 'تعديل المنتج' : 'Modifier le Produit') : (storeIsAr ? 'إضافة منتج جديد' : 'Créer un Produit')}</h2>
                    <p className="text-slate-500 mt-2">{storeIsAr ? 'التفاصيل، المخزون، والمتغيرات.' : 'Détails, inventaire, et variantes de votre article.'}</p>
                 </div>
                 <button onClick={() => setIsProductModalOpen(false)} className="p-4 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-200">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                 <div className="grid grid-cols-12 gap-6">
                    {/* Left Column (Images & Basic) */}
                    <div className="col-span-3 space-y-6 flex flex-col">
                       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-4">{storeIsAr ? 'صورة المنتج' : 'Image du Produit'}</label>
                          <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors group relative overflow-hidden">
                             {productForm?.image ? (
                                <img src={productForm.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                             ) : (
                                <>
                                   <ImageIcon className="w-12 h-12 text-slate-300 group-hover:text-indigo-400 mb-2 transition-colors" />
                                   <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600">{storeIsAr ? 'إضافة صورة' : 'Ajouter une image'}</span>
                                </>
                             )}
                             <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                   setProductForm({...productForm, image: await readFileAsBase64(file)});
                                }
                             }} />
                          </label>
                       </div>
                    </div>
                    {/* Middle Column (Details) */}
                    <div className="col-span-5 space-y-6 flex flex-col">
                       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">{storeIsAr ? 'المعلومات الأساسية' : 'Informations Générales'}</label>
                          <div>
                             <input type="text" placeholder={storeIsAr ? 'اسم المنتج (مثال: قميص فاخر)' : 'Titre du produit (ex: Premium T-Shirt)'} value={productForm?.name || ''} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-lg font-bold" />
                          </div>
                          <div className="flex gap-4">
                             <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">{storeIsAr ? 'السعر (درهم)' : 'Prix (MAD)'}</label>
                                <input type="number" placeholder="0.00" value={productForm?.price || ''} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold" />
                             </div>
                             <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">{storeIsAr ? 'المخزون (الكمية)' : 'Stock (Quantité)'}</label>
                                <input type="number" placeholder="10" value={productForm?.stock || ''} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold" />
                             </div>
                          </div>
                          <div>
                             <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">{storeIsAr ? 'الوصف' : 'Description'}</label>
                             <textarea rows={4} placeholder={storeIsAr ? 'اوصف منتجك بالتفصيل...' : 'Décrivez votre produit en détail...'} value={productForm?.description || ''} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 resize-none"></textarea>
                          </div>
                       </div>
                    </div>
                    {/* Right Column (Variants) */}
                    <div className="col-span-4 space-y-6">
                       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">{storeIsAr ? 'المتغيرات (المقاسات والألوان)' : 'Variantes (Tailles & Couleurs)'}</label>
                          <div>
                             <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3">{storeIsAr ? 'المقاسات المتاحة' : 'Tailles Disponibles'}</label>
                             <div className="flex gap-2 mb-4">
                                <input type="text" placeholder={storeIsAr ? 'مثال: XXL, 42, 6 سنوات...' : 'Ex: XXL, 42, 6 Ans...'} value={newSizeInput} onChange={e => setNewSizeInput(e.target.value)} onKeyDown={e => { if(e.key === 'Enter' && newSizeInput) { setProductForm({...productForm, sizes: [...(productForm.sizes||[]), newSizeInput]}); setNewSizeInput(''); e.preventDefault(); } }} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                                <button onClick={() => { if(newSizeInput) { setProductForm({...productForm, sizes: [...(productForm.sizes||[]), newSizeInput]}); setNewSizeInput(''); } }} className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors">{storeIsAr ? 'إضافة' : 'Ajouter'}</button>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {(productForm?.sizes || []).map((size: string) => (
                                   <div key={size} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg group">
                                      <span className="text-xs font-bold text-slate-700">{size}</span>
                                      <button onClick={() => setProductForm({...productForm, sizes: productForm.sizes.filter((s:string) => s !== size)})} className="text-slate-400 hover:text-rose-500"><X className="w-3 h-3" /></button>
                                   </div>
                                ))}
                             </div>
                          </div>
                          <div>
                             <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3">{storeIsAr ? 'الألوان المتاحة' : 'Couleurs Disponibles'}</label>
                             <div className="flex gap-2 mb-4">
                                <div className="relative w-12 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-sm shrink-0">
                                   <input type="color" value={newColorInput} onChange={e => setNewColorInput(e.target.value)} className="absolute -inset-4 w-[200%] h-[200%] cursor-pointer" />
                                </div>
                                <input type="text" value={newColorInput} readOnly className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none uppercase" />
                                <button onClick={() => { if(!productForm?.colors?.includes(newColorInput)) { setProductForm({...productForm, colors: [...(productForm.colors||[]), newColorInput]}); } }} className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors">{storeIsAr ? 'إضافة' : 'Ajouter'}</button>
                             </div>
                             <div className="flex flex-wrap gap-3">
                                {(productForm?.colors || []).map((color: string) => (
                                   <div key={color} className="relative group">
                                      <div className="w-8 h-8 rounded-full border shadow-sm" style={{ backgroundColor: color }}></div>
                                      <button onClick={() => {
                                         const newColors = productForm.colors.filter((c:string) => c !== color);
                                         const newColorImages = {...(productForm.colorImages||{})};
                                         delete newColorImages[color];
                                         setProductForm({...productForm, colors: newColors, colorImages: newColorImages});
                                      }} className="absolute -top-2 -right-2 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><X className="w-3 h-3" /></button>
                                   </div>
                                ))}
                             </div>
                          </div>
                           {/* VARIANT IMAGES UPLOAD */}
                           {productForm?.colors?.length > 0 && (
                              <div className="mt-6 border-t border-slate-100 pt-6">
                                 <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3">{storeIsAr ? 'صور لكل لون (اختياري)' : 'Images par Couleur (Optionnel)'}</label>
                                 <div className="space-y-3">
                                    {productForm.colors.map((color: string) => (
                                       <div key={color} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                          <div className="flex items-center gap-3">
                                             <div className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: color }}></div>
                                             <span className="text-xs font-bold text-slate-600 capitalize">{storeIsAr ? 'صورة المتغير' : 'Image Variante'}</span>
                                          </div>
                                          <div>
                                             <label className="cursor-pointer px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors flex items-center gap-2 shadow-sm">
                                                {productForm?.colorImages?.[color] ? (
                                                   <img src={productForm.colorImages[color]} className="w-5 h-5 rounded object-cover" alt="" />
                                                ) : (
                                                   <ImageIcon className="w-4 h-4" />
                                                )}
                                                {productForm?.colorImages?.[color] ? (storeIsAr ? 'تغيير' : 'Changer') : (storeIsAr ? 'ربط صورة' : 'Lier une image')}
                                                <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                                   const file = e.target.files?.[0];
                                                   if (file) {
                                                      const b64 = await readFileAsBase64(file);
                                                      setProductForm({
                                                         ...productForm, 
                                                         colorImages: { ...(productForm.colorImages || {}), [color]: b64 }
                                                      });
                                                   }
                                                }} />
                                             </label>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}

                           {/* VARIANT QUANTITY MATRIX */}
                           {(() => {
                              const sizes = productForm?.sizes || [];
                              const colors = productForm?.colors || [];

                              let combinations: {size?: string, color?: string}[] = [];
                              if (sizes.length > 0 && colors.length > 0) {
                                  sizes.forEach((s:string) => colors.forEach((c:string) => combinations.push({size: s, color: c})));
                              } else if (sizes.length > 0) {
                                  sizes.forEach((s:string) => combinations.push({size: s}));
                              } else if (colors.length > 0) {
                                  colors.forEach((c:string) => combinations.push({color: c}));
                              }

                              if (combinations.length === 0) return null;

                              return (
                                  <div className="mt-8 pt-8 border-t border-slate-100">
                                      <label className="block text-xs font-black text-slate-800 uppercase mb-4">{storeIsAr ? 'المخزون لكل متغير' : 'Stock par Variante'}</label>
                                      <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                          <table className="w-full text-left text-sm">
                                              <thead className="bg-white border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                                  <tr>
                                                      <th className="px-6 py-4">{storeIsAr ? 'المتغير' : 'Variante'}</th>
                                                      <th className="px-6 py-4 w-40">{storeIsAr ? 'الكمية (المخزون)' : 'Quantité (Stock)'}</th>
                                                  </tr>
                                              </thead>
                                              <tbody className="divide-y divide-slate-100 bg-white">
                                                  {combinations.map((comb) => {
                                                      const key = `${comb.size || 'nosize'}-${comb.color || 'nocolor'}`;
                                                      const qty = productForm.variantQuantities?.[key] || '';
                                                      return (
                                                          <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                                                              <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-3">
                                                                  {comb.color && <div className="w-5 h-5 rounded-full border shadow-sm shrink-0" style={{ backgroundColor: comb.color }}></div>}
                                                                  {comb.size && <span className="bg-slate-100 px-2 py-1 rounded text-xs">{comb.size}</span>}
                                                                  {(!comb.size && comb.color) && <span className="uppercase text-[10px] text-slate-400 font-bold">{storeIsAr ? 'لون' : 'Couleur'}</span>}
                                                              </td>
                                                              <td className="px-6 py-3">
                                                                  <input type="number" placeholder="0" value={qty} onChange={async (e) => {
                                                                      setProductForm({
                                                                          ...productForm, 
                                                                          variantQuantities: { ...(productForm.variantQuantities || {}), [key]: e.target.value }
                                                                      });
                                                                  }} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors" />
                                                              </td>
                                                          </tr>
                                                      )
                                                  })}
                                              </tbody>
                                          </table>
                                      </div>
                                  </div>
                              );
                           })()}
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                           <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">{storeIsAr ? 'الفئة' : 'Catégorie'}</label>
                           <input type="text" placeholder={storeIsAr ? 'مثال: قميص, جاكيت, فستان...' : 'Ex: T-Shirt, Chemise, Robe...'} value={productForm?.category || ''} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold" />
                           <p className="text-[10px] text-slate-400 mt-2 font-medium">{storeIsAr ? 'لتصنيف المنتج في فلاتر المتجر.' : 'Permet de classer le produit dans les filtres du magasin.'}</p>
                        </div>
                    </div>
                 </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                 <button onClick={() => setIsProductModalOpen(false)} className="px-8 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">{storeIsAr ? 'إلغاء' : 'Annuler'}</button>
                 <button onClick={() => {
                    if(productForm?.name && productForm?.price) {
                       if(productForm.id) {
                          setStoreProducts(storeProducts.map(p => p.id === productForm.id ? productForm : p));
                       } else {
                          setStoreProducts([{ id: Date.now(), ...productForm }, ...storeProducts]);
                       }
                       setIsProductModalOpen(false);
                    }
                 }} className="px-10 py-4 font-black uppercase tracking-widest bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-105 transition-all">
                    {productForm?.id ? (storeIsAr ? 'تحديث المنتج' : 'Mettre à jour') : (storeIsAr ? 'حفظ المنتج' : 'Enregistrer le produit')}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
         <div className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                        <ListOrdered className="w-5 h-5" />
                     </div>
                     <div>
                        <h2 className="text-lg font-black text-slate-800">Commande {selectedOrder.id}</h2>
                        <p className="text-xs font-bold text-slate-500">{selectedOrder.date}</p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"><X className="w-4 h-4" /></button>
               </div>
               
               <div className="p-6 space-y-6">
                  {/* Customer Info */}
                  <div>
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Informations du Client</h3>
                     <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-white rounded-full border border-slate-200 flex items-center justify-center"><Users className="w-4 h-4 text-slate-400" /></div>
                           <div>
                              <p className="text-[10px] font-bold text-slate-500">Nom Complet</p>
                              <p className="text-sm font-black text-slate-800">{selectedOrder.customer}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-white rounded-full border border-slate-200 flex items-center justify-center"><Smartphone className="w-4 h-4 text-slate-400" /></div>
                           <div>
                              <p className="text-[10px] font-bold text-slate-500">Téléphone</p>
                              <p className="text-sm font-black text-slate-800">06 12 34 56 78</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-white rounded-full border border-slate-200 flex items-center justify-center"><Globe className="w-4 h-4 text-slate-400" /></div>
                           <div>
                              <p className="text-[10px] font-bold text-slate-500">Ville / Adresse</p>
                              <p className="text-sm font-black text-slate-800">Casablanca, Maarif</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Order Summary */}
                  <div>
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Détails de la Commande</h3>
                     
                     {/* Added Products Section */}
                     {selectedOrder.products && (
                        <div className="space-y-3 mb-4">
                           {selectedOrder.products.map((prod: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-3 bg-white border border-slate-100 p-2 rounded-xl shadow-sm hover:border-indigo-200 transition-colors">
                                 <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                    <img src={prod.photo} alt={prod.name} className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex-1">
                                    <h4 className="text-sm font-bold text-slate-800 leading-tight">{prod.name}</h4>
                                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">{prod.options}</p>
                                 </div>
                                 <div className="text-right shrink-0 px-2">
                                    <p className="text-xs font-black text-slate-800">{prod.price}</p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Qté: {prod.qty}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}

                     <div className="bg-white border border-slate-200 rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
                           <span className="text-sm font-bold text-slate-600">{selectedOrder.items}</span>
                           <span className="text-sm font-black text-slate-800">{selectedOrder.amount}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500 font-bold mb-1">
                           <span>Frais de livraison</span>
                           <span className="text-green-600 uppercase tracking-widest font-black text-[10px]">Gratuite</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-black text-slate-800 pt-3 mt-3 border-t border-slate-100">
                           <span>Total</span>
                           <span className="text-indigo-600">{selectedOrder.amount}</span>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                  {selectedOrder.deleted ? (
                     <>
                        <button onClick={() => handleRestoreOrder(selectedOrder.id)} className="flex-1 py-3 bg-white border border-indigo-200 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors text-sm active:scale-95">Restaurer</button>
                        <button onClick={() => handlePermanentDelete(selectedOrder.id)} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors text-sm shadow-md shadow-rose-200 flex items-center justify-center gap-2 active:scale-95">
                           <Trash2 className="w-4 h-4" /> Supprimer
                        </button>
                     </>
                  ) : (
                     <>
                        <button onClick={() => handleDeleteOrder(selectedOrder.id)} className="w-12 h-12 shrink-0 bg-white border border-rose-200 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-700 transition-colors active:scale-95" title={storeIsAr ? 'حذف الطلب' : 'Supprimer'}>
                           <Trash2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Refusé', 'bg-rose-100 text-rose-700')} className="flex-1 py-3 bg-white border border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition-colors text-sm active:scale-95">Refuser</button>
                        <button onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Confirmé', 'bg-emerald-100 text-emerald-700')} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors text-sm shadow-md shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95">
                           <CheckCircle className="w-4 h-4" /> Confirmer
                        </button>
                     </>
                  )}
               </div>
            </div>
         </div>
      )}

      {/* PUBLISH MODAL */}
      
      {/* DELETE CONFIRMATION MODAL */}
      {orderToDelete && (
         <div className="fixed inset-0 z-[600] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
               <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                     <Trash2 className="w-8 h-8 text-rose-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 mb-2">{storeIsAr ? 'نقل إلى سلة المهملات؟' : 'Déplacer vers la corbeille ?'}</h2>
                  <p className="text-slate-500 text-sm mb-6">{storeIsAr ? 'سيتم نقل هذا الطلب إلى سلة المهملات. يمكنك حذفه نهائياً من هناك.' : 'Cette commande sera déplacée vers la corbeille. Vous pourrez la supprimer définitivement par la suite.'}</p>
                  
                  <div className="flex gap-3">
                     <button onClick={() => setOrderToDelete(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">{storeIsAr ? 'إلغاء' : 'Annuler'}</button>
                     <button onClick={confirmDeleteOrder} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-md shadow-rose-200 transition-colors text-sm">{storeIsAr ? 'نقل' : 'Confirmer'}</button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {showPublishModal && (
         <div className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
               <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                     <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 mb-2">Boutique Publiée !</h2>
                  <p className="text-slate-500 mb-8">Votre boutique est maintenant en ligne et prête à recevoir des commandes.</p>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3 mb-8">
                     <Globe className="w-5 h-5 text-indigo-600 shrink-0" />
                     <div className="flex-1 text-left overflow-hidden">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Lien de démonstration (Provisoire)</p>
                        <p className="text-sm font-medium text-slate-800 truncate">https://{storeName.toLowerCase().replace(/\s+/g, '')}.beyacreative.com</p>
                     </div>
                     <button 
                        onClick={() => {
                           navigator.clipboard.writeText(`https://${storeName.toLowerCase().replace(/\s+/g, '')}.beyacreative.com`);
                        }} 
                        className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" 
                        title="Copier le lien"
                     >
                        <Copy className="w-4 h-4" />
                     </button>
                  </div>

                  <div className="flex gap-3">
                     <button onClick={() => setShowPublishModal(false)} className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Fermer</button>
                     <button onClick={() => { setShowPublishModal(false); setShowPreview(true); }} className="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">Visiter la boutique</button>
                  </div>
               </div>
            </div>
         </div>
      )}

    
       {!isLiveStore && platformMode === 'builder' && (
          <div className="fixed bottom-6 right-6 z-[300] flex flex-col items-end gap-2">
             <div className="bg-white p-2 rounded-full shadow-2xl flex items-center gap-3 border-2 border-slate-200 hover:scale-105 transition-transform">
                <span className="text-xs font-black text-slate-700 pl-2 uppercase tracking-wider">{storeIsAr ? 'اللون:' : 'Couleur:'}</span>
                <label className="w-10 h-10 rounded-full cursor-pointer shadow-inner border-[3px] border-white ring-2 ring-slate-100" style={{ backgroundColor: primaryColor }} title="Changer la couleur">
                   <input type="color" className="opacity-0 w-0 h-0" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                </label>
             </div>
          </div>
       )}
    </div>
  );
}
