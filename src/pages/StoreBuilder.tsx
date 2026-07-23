// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingBag, Globe, Palette, Settings, Plus, Monitor, Smartphone, CheckCircle, ExternalLink, Box, X, Search, LayoutTemplate, Paintbrush, Image as ImageIcon, Check, ListOrdered, CreditCard, AlertCircle, ShieldCheck, Loader2, Copy, Save, Maximize2, Minimize2, Users, Truck, LayoutGrid, List as ListIcon, Trash2, Type, MousePointerClick, Mail, Star, Video, Sparkles, ChevronUp, ChevronDown, TrendingUp, Package, RefreshCw, Undo2, Menu, Home, Heart, SlidersHorizontal } from 'lucide-react';
import { useLang } from '../contexts/LangContext';
import StoreManagerDashboard from '../components/Tools/StoreManagerDashboard';
import ProAITools from '../components/Tools/ProAITools';
import CheckoutForm from '../components/CheckoutForm';
import AuthForm from '../components/AuthForm';
import { supabase } from '../supabase';

const THEMES = [
  { id: 'streetwear', name: 'Streetwear Pro', layout: 'hero-center', defaultColor: '#0f172a', defaultFont: 'font-sans', tier: 'free', previewImg: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop' },
  { id: 'minimalist', name: 'Minimalist', layout: 'split-screen', defaultColor: '#171717', defaultFont: 'font-serif', tier: 'free', previewImg: 'https://images.unsplash.com/photo-1489987707023-afc7f93c6508?q=80&w=800&auto=format&fit=crop' },
  { id: 'abaya', name: 'Luxury Abaya', layout: 'elegant', defaultColor: '#b48a44', defaultFont: 'font-serif', tier: 'free', previewImg: 'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?q=80&w=800&auto=format&fit=crop' },
  { id: 'sportswear', name: 'Active Sport', layout: 'hero-center', defaultColor: '#84cc16', defaultFont: 'font-sans', tier: 'free', previewImg: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop' },
  { id: 'eco', name: 'Eco Nature', layout: 'split-screen', defaultColor: '#4d7c0f', defaultFont: 'font-serif', tier: 'free', previewImg: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=800&auto=format&fit=crop' },
  { id: 'kids', name: 'Playful Kids', layout: 'playful', defaultColor: '#0ea5e9', defaultFont: 'font-sans', tier: 'free', previewImg: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop' },
  { id: 'clement', name: 'Clement Design', layout: 'clement', defaultColor: '#1e293b', defaultFont: 'font-sans', tier: 'free', previewImg: 'https://images.unsplash.com/photo-1577221084712-45b0445d2b00?q=80&w=800&auto=format&fit=crop' },
  { id: 'xton', name: 'Xton', layout: 'hero-center', defaultColor: '#f59e0b', defaultFont: 'font-sans', tier: 'free', previewImg: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop' },
  { id: 'amaza', name: 'Amaza', layout: 'sidebar-right', defaultColor: '#06b6d4', defaultFont: 'font-sans', tier: 'free', previewImg: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop' },
  { id: 'ochaka', name: 'Ochaka', layout: 'split-screen', defaultColor: '#9f1239', defaultFont: 'font-sans', tier: 'free', previewImg: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop' },
  { id: 'mazia', name: 'Mazia', layout: 'mazia', defaultColor: '#ef4444', defaultFont: 'font-serif', tier: 'free', previewImg: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=800&auto=format&fit=crop' },
  // PRO themes - locked behind the Pro plan (Settings > Plan Pro)
  { id: 'blush-studio', name: 'Blush Studio', layout: 'hero-center', defaultColor: '#e8a5b5', defaultFont: 'font-serif', tier: 'pro', previewImg: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=800&auto=format&fit=crop' },
  { id: 'pop-fashion', name: 'Pop Fashion', layout: 'playful', defaultColor: '#e11d48', defaultFont: 'font-sans', tier: 'pro', previewImg: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop' },
  { id: 'fitness-pulse', name: 'Fitness Pulse', layout: 'hero-center', defaultColor: '#7c3aed', defaultFont: 'font-sans', tier: 'pro', previewImg: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop' },
  { id: 'editorial-noir', name: 'Editorial Noir', layout: 'split-screen', defaultColor: '#dc2626', defaultFont: 'font-sans', tier: 'pro', previewImg: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop' },
  { id: 'emerald-market', name: 'Emerald Market', layout: 'mazia', defaultColor: '#0d9488', defaultFont: 'font-sans', tier: 'pro', previewImg: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=800&auto=format&fit=crop' }
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
  const [previewProductId, setPreviewProductId] = useState<number | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop'|'mobile'>('desktop');
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showTrash, setShowTrash] = useState(false);
  const [newOrderToast, setNewOrderToast] = useState<string | null>(null);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const knownOrderIdsRef = useRef<Set<string> | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'confirmed' | 'refused'>('all');
  const CONFIRMED_STATUSES = ['Confirmé', 'Confirmée', 'Validée', 'Livrée', 'مؤكد', 'تم التوصيل'];
  const REFUSED_STATUSES = ['Refusé', 'Refusée', 'Annulée', 'Retour', 'مرفوض', 'ملغى'];
  const matchesOrderFilter = (o: any) => {
    const trashMatch = showTrash ? o.deleted : !o.deleted;
    if (!trashMatch) return false;
    if (orderStatusFilter === 'confirmed') return CONFIRMED_STATUSES.includes(o.status);
    if (orderStatusFilter === 'refused') return REFUSED_STATUSES.includes(o.status);
    return true;
  };
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
    if (config.storeName) {
      try {
        // Strip large base64 product photos before caching locally - they can blow past the localStorage quota.
        // The real photo still lives in Supabase/storeProducts and is re-derived on next fetch.
        const lightOrders = storeOrders.slice(0, 100).map((o: any) => ({
          ...o,
          products: (o.products || []).map((p: any) => ({
            ...p,
            photo: typeof p.photo === 'string' && p.photo.startsWith('data:') ? '' : p.photo
          }))
        }));
        localStorage.setItem(`beya_orders_${config.storeName}`, JSON.stringify(lightOrders));
      } catch (e) {
        console.warn('Could not cache store orders locally (quota exceeded):', e);
      }
    }
  }, [storeOrders, config.storeName]);

  // Fetch LIVE orders from Supabase for this specific store.
  // Must match the exact same name resolution submitGlobalOrder uses when writing the order
  // (storeName state first, falling back to the saved config) - otherwise the filter below
  // silently matches nothing and orders placed by real customers never show up here.
  const effectiveStoreName = storeName || config.storeName;

  const fetchStoreOrdersNow = useRef<() => Promise<void>>(async () => {});
  const handleManualRefreshOrders = async () => {
     setIsRefreshingOrders(true);
     try { await fetchStoreOrdersNow.current(); } finally { setIsRefreshingOrders(false); }
  };

  useEffect(() => {
    if (!isLiveStore && effectiveStoreName) {
      const fetchStoreOrders = async () => {
        try {
          const { data, error } = await supabase
            .from('commandes')
            .select('*')
            .ilike('tissu', `%Store: ${effectiveStoreName}%`)
            .order('dateCommande', { ascending: false });
            
          if (data && !error && data.length > 0) {
            const mappedOrders = data.map(cmd => {
              let statusColor = 'bg-slate-100 text-slate-700';
              if (['Confirmé', 'Confirmée', 'Validée', 'Livrée', 'مؤكد', 'تم التوصيل'].includes(cmd.statut)) statusColor = 'bg-emerald-100 text-emerald-700';
              if (['Refusé', 'Refusée', 'Annulée', 'Retour', 'مرفوض', 'ملغى'].includes(cmd.statut)) statusColor = 'bg-rose-100 text-rose-700';
              if (['En attente', 'Nouveau'].includes(cmd.statut)) statusColor = 'bg-amber-100 text-amber-700';
              
              const qtyMatch = cmd.quantite ? parseInt(cmd.quantite.toString()) : 1;
              const price = cmd.prix ? parseFloat(cmd.prix.toString()) : 0;

              // "client" is stored as "Name - Phone" (see submitGlobalOrder) - split the trailing phone back out
              const clientRaw = cmd.client || '';
              const clientPhoneMatch = clientRaw.match(/ - (\S+)$/);
              const clientPhone = clientPhoneMatch ? clientPhoneMatch[1] : '';
              const clientName = clientPhoneMatch ? clientRaw.slice(0, clientPhoneMatch.index) : clientRaw;

              // "tissu" is stored as "Store: <name> - <city> - <address>" (see submitGlobalOrder)
              const tissuRaw = cmd.tissu || '';
              const afterStore = tissuRaw.replace(/^Store:\s*[^-]*-\s*/, '');
              const [tissuCity, ...tissuAddressParts] = afterStore.split(' - ');
              const tissuAddress = tissuAddressParts.join(' - ');

              const matchingProduct = storeProducts.find((p: any) => p.name === cmd.modele);
              const realPhoto = matchingProduct ? (matchingProduct.photo || matchingProduct.image || getCoverImage(matchingProduct)) : '';

              return {
                id: cmd.id,
                customer: clientName || clientRaw,
                phone: clientPhone,
                city: tissuCity || '',
                address: tissuAddress || '',
                amount: `${price.toFixed(2)} MAD`,
                status: cmd.statut || 'Nouveau',
                statusColor,
                date: cmd.dateCommande ? new Date(cmd.dateCommande).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
                items: `${qtyMatch} article${qtyMatch > 1 ? 's' : ''}`,
                products: [{
                  name: cmd.modele,
                  photo: realPhoto,
                  qty: qtyMatch,
                  price: `${price.toFixed(2)} MAD`,
                  options: `Couleurs: ${cmd.couleurs} - Tailles: ${cmd.tailles}`
                }],
                deleted: cmd.statut === 'Annulée'
              };
            });
            
            // Merge with local orders, preferring live orders
            setStoreOrders((prev: any[]) => {
              const liveIds = new Set(mappedOrders.map(o => o.id));
              const localKept = prev.filter(o => !liveIds.has(o.id));
              return [...mappedOrders, ...localKept];
            });

            // Detect newly-arrived orders (skip the very first fetch on page load)
            const currentIds = new Set(mappedOrders.map(o => o.id));
            if (knownOrderIdsRef.current) {
              const freshOrder = mappedOrders.find(o => !knownOrderIdsRef.current!.has(o.id));
              if (freshOrder) {
                setNewOrderToast(freshOrder.customer);
                setTimeout(() => setNewOrderToast(null), 6000);
              }
            }
            knownOrderIdsRef.current = currentIds;
          }
        } catch (err) {
          console.error("Error fetching live store orders:", err);
        }
      };

      fetchStoreOrders();
      fetchStoreOrdersNow.current = fetchStoreOrders;
      const pollInterval = setInterval(fetchStoreOrders, 20000);
      return () => clearInterval(pollInterval);
    }
  }, [isLiveStore, effectiveStoreName]);

  const handleUpdateOrderStatus = (orderId: string, newStatus: string, newColor: string) => {
    setStoreOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, statusColor: newColor } : o));
    setSelectedOrder(null);
  };

  // 'ORD-' ids are local preview-only orders that were never inserted into Supabase.
  // Anything else is a real row in the `commandes` table and must be persisted there too.
  const isRealOrderId = (id: string) => !id.startsWith('ORD-');

  const persistOrderDeleted = async (id: string) => {
    if (isRealOrderId(id)) {
      await supabase.from('commandes').update({ statut: 'Annulée' }).eq('id', id);
    }
  };
  const persistOrderRestored = async (id: string) => {
    if (isRealOrderId(id)) {
      await supabase.from('commandes').update({ statut: 'En attente' }).eq('id', id);
    }
  };
  const persistOrderPermanentDelete = async (id: string) => {
    if (isRealOrderId(id)) {
      await supabase.from('commandes').delete().eq('id', id);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
  };

  const confirmDeleteOrder = async () => {
    if (orderToDelete) {
      setStoreOrders(prev => prev.map(o => o.id === orderToDelete ? { ...o, deleted: true } : o));
      setSelectedOrder(null);
      await persistOrderDeleted(orderToDelete);
      setOrderToDelete(null);
    }
  };

  const handleRestoreOrder = async (orderId: string) => {
    setStoreOrders(prev => prev.map(o => o.id === orderId ? { ...o, deleted: false } : o));
    setSelectedOrder(null);
    await persistOrderRestored(orderId);
  };

  const handlePermanentDelete = async (orderId: string) => {
    setStoreOrders(prev => prev.filter(o => o.id !== orderId));
    setSelectedOrder(null);
    await persistOrderPermanentDelete(orderId);
  };

  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const toggleOrderSelected = (orderId: string) => {
    setSelectedOrderIds(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
  };
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const confirmBulkDelete = async () => {
    const ids = selectedOrderIds;
    if (showTrash) {
      setStoreOrders(prev => prev.filter(o => !ids.includes(o.id)));
      await Promise.all(ids.map(persistOrderPermanentDelete));
    } else {
      setStoreOrders(prev => prev.map(o => ids.includes(o.id) ? { ...o, deleted: true } : o));
      await Promise.all(ids.map(persistOrderDeleted));
    }
    setSelectedOrderIds([]);
    setIsBulkDeleteOpen(false);
  };
  const [storeLang, setStoreLang] = useState<'fr'|'en'|'ar'>(config.storeLang || 'fr');
  const storeIsAr = storeLang === 'ar';
  
  const tr = (t: string) => {
     const dict: Record<string, { fr: string; en: string; ar: string }> = {
        'New Collection': { en: 'New Collection', fr: 'Nouvelle Collection', ar: 'تشكيلة جديدة' },
        'Discover our latest premium quality garments.': { en: 'Discover our latest premium quality garments.', fr: 'Découvrez nos dernières pièces de qualité premium.', ar: 'اكتشف أحدث تشكيلاتنا ذات الجودة العالية.' },
        'Shop Now': { en: 'Shop Now', fr: 'Achetez maintenant', ar: 'تسوق الآن' },
        'Trending Now': { en: 'Trending Now', fr: 'Tendances', ar: 'الأكثر مبيعاً' },
        'All Products': { en: 'All Products', fr: 'Tous les produits', ar: 'جميع المنتجات' },
        'Home': { en: 'Home', fr: 'Accueil', ar: 'الرئيسية' },
        'Collections': { en: 'Collections', fr: 'Collections', ar: 'التشكيلات' },
        'About': { en: 'About', fr: 'À propos', ar: 'من نحن' },
        '© 2026 My Brand. Tous droits réservés.': { en: '© 2026 My Brand. All rights reserved.', fr: '© 2026 My Brand. Tous droits réservés.', ar: '© 2026 My Brand. جميع الحقوق محفوظة.' },
        'Accueil': { en: 'Home', fr: 'Accueil', ar: 'الرئيسية' },
        'Produits': { en: 'Products', fr: 'Produits', ar: 'المنتجات' },
        'All Products ✨': { en: 'All Products ✨', fr: 'Tous les produits ✨', ar: 'جميع المنتجات ✨' },
        'ALL PRODUCTS': { en: 'ALL PRODUCTS', fr: 'TOUS LES PRODUITS', ar: 'جميع المنتجات' },
        'All': { en: 'All', fr: 'Tout', ar: 'الكل' },
        'ALL': { en: 'ALL', fr: 'TOUT', ar: 'الكل' },
        'Outerwear': { en: 'Outerwear', fr: 'Vestes', ar: 'ملابس خارجية' },
        'OUTERWEAR': { en: 'OUTERWEAR', fr: 'VESTES', ar: 'ملابس خارجية' },
        'Tops': { en: 'Tops', fr: 'Hauts', ar: 'قمصان' },
        'TOPS': { en: 'TOPS', fr: 'HAUTS', ar: 'قمصان' },
        'Bottoms': { en: 'Bottoms', fr: 'Bas', ar: 'بناطيل' },
        'BOTTOMS': { en: 'BOTTOMS', fr: 'BAS', ar: 'بناطيل' },
        'Shoes': { en: 'Shoes', fr: 'Chaussures', ar: 'أحذية' },
        'SHOES': { en: 'SHOES', fr: 'CHAUSSURES', ar: 'أحذية' },
        'Dresses': { en: 'Dresses', fr: 'Robes', ar: 'فساتين' },
        'DRESSES': { en: 'DRESSES', fr: 'ROBES', ar: 'فساتين' },
        'Recommandé': { en: 'Recommended', fr: 'Recommandé', ar: 'موصى به' },
        'Sort: Featured': { en: 'Sort: Featured', fr: 'Trier: Recommandé', ar: 'موصى به' },
        'Featured': { en: 'Featured', fr: 'Recommandé', ar: 'موصى به' },
        'Best Matches 🌟': { en: 'Best Matches 🌟', fr: 'Meilleurs choix 🌟', ar: 'موصى به 🌟' },
        'Prix: Croissant': { en: 'Price: Low to High', fr: 'Prix: Croissant', ar: 'السعر: من الأقل للأكثر' },
        'Price: Low to High': { en: 'Price: Low to High', fr: 'Prix: Croissant', ar: 'السعر: من الأقل للأكثر' },
        'Price: Low - High': { en: 'Price: Low - High', fr: 'Prix: Croissant', ar: 'السعر: من الأقل للأكثر' },
        'Price: Low to High 💸': { en: 'Price: Low to High 💸', fr: 'Prix: Croissant 💸', ar: 'السعر: من الأقل للأكثر 💸' },
        'Prix: Décroissant': { en: 'Price: High to Low', fr: 'Prix: Décroissant', ar: 'السعر: من الأكثر للأقل' },
        'Price: High to Low': { en: 'Price: High to Low', fr: 'Prix: Décroissant', ar: 'السعر: من الأكثر للأقل' },
        'Price: High - Low': { en: 'Price: High - Low', fr: 'Prix: Décroissant', ar: 'السعر: من الأكثر للأقل' },
        'Price: High to Low 💎': { en: 'Price: High to Low 💎', fr: 'Prix: Décroissant 💎', ar: 'السعر: من الأكثر للأقل 💎' },
        'De A à Z': { en: 'A to Z', fr: 'De A à Z', ar: 'أ - ي' },
        'De Z à A': { en: 'Z to A', fr: 'De Z à A', ar: 'ي - أ' },
        'Add to cart': { en: 'Add to cart', fr: 'Ajouter au panier', ar: 'أضف للسلة' },
        'ADD TO CART': { en: 'ADD TO CART', fr: 'AJOUTER AU PANIER', ar: 'أضف للسلة' },
        'BUY NOW': { en: 'BUY NOW', fr: 'ACHETER', ar: 'اشتري الآن' },
        'DISCOVER': { en: 'DISCOVER', fr: 'DÉCOUVRIR', ar: 'اكتشف' }
     };
     return dict[t]?.[storeLang] || t;
  };
  
  // Customization States (The PRO way)
  const [activeTheme, setActiveTheme] = useState(config.activeTheme || THEMES[0]);
  const [primaryColor, setPrimaryColor] = useState(config.primaryColor || THEMES[0].defaultColor);
  const [secondaryColor, setSecondaryColor] = useState(config.secondaryColor || '#ffffff');
  const [borderColor, setBorderColor] = useState(config.borderColor || '#e2e8f0');
  const [footerBgColor, setFooterBgColor] = useState(config.footerBgColor || '#f8f9fa');
  const [footerTextColor, setFooterTextColor] = useState(config.footerTextColor || '#64748b');
  const [cardStyle, setCardStyle] = useState<'rounded' | 'square' | 'arch' | 'pill' | 'trend'>(config.cardStyle || 'rounded');
  const [showCardBadge, setShowCardBadge] = useState<boolean>(config.showCardBadge ?? false);
  const [collectionLabelBelow, setCollectionLabelBelow] = useState<boolean>(config.collectionLabelBelow ?? false);
  const getCardRadius = (): string | undefined => {
     if (cardStyle === 'square') return '0px';
     if (cardStyle === 'arch') return '40px 40px 10px 10px';
     if (cardStyle === 'pill') return '999px';
     return undefined;
  };
  const CardBadge = ({ text }: { text: string }) => {
     if (!showCardBadge || !text) return null;
     return (
        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-sm" style={{ backgroundColor: primaryColor }}>
           {text}
        </span>
     );
  };
  const trendCardAccents = ['#fde8ef', '#e8f0fe', '#fef6e4', '#e9f9f0', '#f3e8fd'];
  const ProductCardTrend = ({ p, idx = 0, onClick }: any) => (
     <div className="group cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow bg-white border border-slate-100" onClick={onClick}>
        <div className="aspect-[3/4] relative overflow-hidden" style={{ backgroundColor: trendCardAccents[idx % trendCardAccents.length] }}>
           {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.name} /> : <div className="w-full h-full flex items-center justify-center opacity-20"><Box className="w-10 h-10" /></div>}
           <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-sm" style={{ backgroundColor: primaryColor }}>{p.category || (storeIsAr ? 'جديد' : storeLang === 'en' ? 'New' : 'Nouveau')}</span>
        </div>
        <div className="p-3">
           <h4 className="text-xs font-bold text-slate-800 truncate mb-1">{p.name}</h4>
           <div className="flex items-center gap-0.5 mb-1.5">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
           </div>
           <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900">{p.price} MAD</span>
              <span className="text-[10px] text-slate-400 line-through">{Math.round(parseFloat(p.price) * 1.2)} MAD</span>
           </div>
        </div>
     </div>
  );
  const [heroHeight, setHeroHeight] = useState<number>(config.heroHeight || 450);
  const [heroImagePosX, setHeroImagePosX] = useState<number>(config.heroImagePosX ?? 50);
  const [heroImagePosY, setHeroImagePosY] = useState<number>(config.heroImagePosY ?? 50);
  const [menuTextColor, setMenuTextColor] = useState(config.menuTextColor || '#64748b');
  const [menuActiveColor, setMenuActiveColor] = useState(config.menuActiveColor || '');
  const [menuStyle, setMenuStyle] = useState<'underline' | 'pill' | 'bold'>(config.menuStyle || 'underline');
  const [proThemesUnlocked, setProThemesUnlocked] = useState<boolean>(config.proThemesUnlocked ?? false);
  const [proUpsellTheme, setProUpsellTheme] = useState<any>(null);
  const [quickBuyContext, setQuickBuyContext] = useState<any>(null);
  const [buyNowAsPopup, setBuyNowAsPopup] = useState<boolean>(config.buyNowAsPopup ?? true);
  const [pdpImageWidth, setPdpImageWidth] = useState<number>(config.pdpImageWidth ?? 50);
  const [pdpMaxWidth, setPdpMaxWidth] = useState<number>(config.pdpMaxWidth ?? 1200);
  const [pdpImageAspect, setPdpImageAspect] = useState<string>(config.pdpImageAspect || '4/5');
  const [productCardSize, setProductCardSize] = useState<'small' | 'medium' | 'large'>(config.productCardSize || 'medium');
  const [siteMaxWidth, setSiteMaxWidth] = useState<number>(config.siteMaxWidth ?? 1400);
  const gridColsClass = (variant: 'lg4' | 'lg3' | 'sm2' | 'md4' | 'plain4') => {
     if (variant === 'lg4') return productCardSize === 'small' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' : productCardSize === 'large' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
     if (variant === 'lg3') return productCardSize === 'small' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : productCardSize === 'large' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
     if (variant === 'sm2') return productCardSize === 'small' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2';
     if (variant === 'md4') return productCardSize === 'small' ? 'grid-cols-2 md:grid-cols-5' : productCardSize === 'large' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4';
     return productCardSize === 'small' ? 'grid-cols-5' : productCardSize === 'large' ? 'grid-cols-3' : 'grid-cols-4';
  };
  const [showPdpTrustBadges, setShowPdpTrustBadges] = useState<boolean>(config.showPdpTrustBadges ?? true);
  const [deliveryScope, setDeliveryScope] = useState<'morocco' | 'international'>(config.deliveryScope || 'morocco');
  const [deliveryText, setDeliveryText] = useState<string>(config.deliveryText || 'Livraison 24-48h');
  const [guaranteeText, setGuaranteeText] = useState<string>(config.guaranteeText || 'Satisfait ou remboursé');
  const [returnText, setReturnText] = useState<string>(config.returnText || 'Retour gratuit sous 14 jours');
  const [textStyles, setTextStyles] = useState<Record<string, { fontSize?: number; color?: string; fontFamily?: string }>>(config.textStyles || {});
  const [activeStyleKey, setActiveStyleKey] = useState<string | null>(null);
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [toolbarBaseline, setToolbarBaseline] = useState<{ fontSize: number; color: string }>({ fontSize: 16, color: '#000000' });
  const updateTextStyle = (key: string, patch: any) => {
     setTextStyles(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };
  const resetTextStyle = (key: string) => {
     setTextStyles(prev => { const next = { ...prev }; delete next[key]; return next; });
  };
  const FONT_STACKS: Record<string, string> = {
     sans: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
     serif: 'ui-serif, Georgia, Cambria, serif',
     mono: 'ui-monospace, SFMono-Regular, monospace'
  };
  const rgbToHex = (rgb: string) => {
     const m = rgb.match(/\d+/g);
     if (!m) return '#000000';
     return '#' + m.slice(0, 3).map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
  };
  const [buttonStyle, setButtonStyle] = useState<'rounded' | 'pill' | 'square'>(config.buttonStyle || 'rounded');
  const [fontFamily, setFontFamily] = useState(config.fontFamily || THEMES[0].defaultFont);

  // Undo history for Design tab changes
  const [designHistory, setDesignHistory] = useState<any[]>([]);
  const isRestoringDesign = useRef(false);
  useEffect(() => {
     if (isRestoringDesign.current) { isRestoringDesign.current = false; return; }
     setDesignHistory(prev => [...prev, { primaryColor, secondaryColor, borderColor, buttonStyle, cardStyle, footerBgColor, footerTextColor, fontFamily, heroHeight, heroImagePosX, heroImagePosY }].slice(-20));
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryColor, secondaryColor, borderColor, buttonStyle, cardStyle, footerBgColor, footerTextColor, fontFamily, heroHeight, heroImagePosX, heroImagePosY]);

  const handleUndoDesign = () => {
     setDesignHistory(prev => {
        if (prev.length < 2) return prev;
        const target = prev[prev.length - 2];
        isRestoringDesign.current = true;
        setPrimaryColor(target.primaryColor);
        setSecondaryColor(target.secondaryColor);
        setBorderColor(target.borderColor);
        setButtonStyle(target.buttonStyle);
        setCardStyle(target.cardStyle);
        setFooterBgColor(target.footerBgColor);
        setFooterTextColor(target.footerTextColor);
        setFontFamily(target.fontFamily);
        setHeroHeight(target.heroHeight);
        setHeroImagePosX(target.heroImagePosX);
        setHeroImagePosY(target.heroImagePosY);
        return prev.slice(0, -1);
     });
  };

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
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Preview navigation state (which storefront page/product is shown) lives up
  // here, not inside StorePreviewWrapper - that component is redefined on every
  // StoreBuilder render (it's a nested function), so React remounts it whenever
  // any Design/Settings field changes, which would otherwise reset the preview
  // back to Home every single time an admin tweaks a slider or toggle.
  const [previewPage, setPreviewPage] = useState<string>('home');
  const [previewActiveProductId, setPreviewActiveProductId] = useState<any>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [customerUser, setCustomerUser] = useState<any>(null);
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [requireAccountToOrder, setRequireAccountToOrder] = useState(config.requireAccountToOrder ?? false);
  const [showHeaderLang, setShowHeaderLang] = useState(config.showHeaderLang ?? true);
  const [showHeaderSearch, setShowHeaderSearch] = useState(config.showHeaderSearch ?? true);
  const [showHeaderAccount, setShowHeaderAccount] = useState(config.showHeaderAccount ?? true);
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
  const [appsConfig, setAppsConfig] = useState<Record<string, string>>(config.appsConfig || {});
  const [deliveryCompanies, setDeliveryCompanies] = useState<any[]>(config.deliveryCompanies || [
     { id: 1, name: 'Amana', type: 'Standard • National', isActive: true, initial: 'AM' },
     { id: 2, name: 'Ghazal', type: 'Express • National', isActive: false, initial: 'GR' }
  ]);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [newDeliveryCompany, setNewDeliveryCompany] = useState({ name: '', type: 'Standard • National', isActive: true });
  const [activeAppModal, setActiveAppModal] = useState<string | null>(null);
  const [appInputValue, setAppInputValue] = useState('');

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
  const [showReviews, setShowReviews] = useState(config.showReviews !== undefined ? config.showReviews : true);
  // Computed design vars - available to all Layout components
  const btnRadius = buttonStyle === 'pill' ? '9999px' : buttonStyle === 'square' ? '0px' : '10px';
  const btnStyle = { backgroundColor: primaryColor, borderRadius: btnRadius };
  const cardBg = secondaryColor || '#ffffff';
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
              if (conf.storeProducts) setStoreProducts(conf.storeProducts);
              if (conf.appsConfig) setAppsConfig(conf.appsConfig);
              if (conf.deliveryCompanies) setDeliveryCompanies(conf.deliveryCompanies);
              if (conf.secondaryColor) setSecondaryColor(conf.secondaryColor);
              if (conf.borderColor) setBorderColor(conf.borderColor);
              if (conf.textStyles) setTextStyles(conf.textStyles);
              if (conf.footerBgColor) setFooterBgColor(conf.footerBgColor);
              if (conf.footerTextColor) setFooterTextColor(conf.footerTextColor);
              if (conf.cardStyle) setCardStyle(conf.cardStyle);
              if (conf.showCardBadge !== undefined) setShowCardBadge(conf.showCardBadge);
              if (conf.collectionLabelBelow !== undefined) setCollectionLabelBelow(conf.collectionLabelBelow);
              if (conf.heroHeight) setHeroHeight(conf.heroHeight);
              if (conf.heroImagePosX !== undefined) setHeroImagePosX(conf.heroImagePosX);
              if (conf.heroImagePosY !== undefined) setHeroImagePosY(conf.heroImagePosY);
              if (conf.menuTextColor) setMenuTextColor(conf.menuTextColor);
              if (conf.menuActiveColor !== undefined) setMenuActiveColor(conf.menuActiveColor);
              if (conf.menuStyle) setMenuStyle(conf.menuStyle);
              if (conf.proThemesUnlocked !== undefined) setProThemesUnlocked(conf.proThemesUnlocked);
              if (conf.buyNowAsPopup !== undefined) setBuyNowAsPopup(conf.buyNowAsPopup);
              if (conf.pdpImageWidth !== undefined) setPdpImageWidth(conf.pdpImageWidth);
              if (conf.pdpMaxWidth !== undefined) setPdpMaxWidth(conf.pdpMaxWidth);
              if (conf.pdpImageAspect) setPdpImageAspect(conf.pdpImageAspect);
              if (conf.productCardSize) setProductCardSize(conf.productCardSize);
              if (conf.siteMaxWidth !== undefined) setSiteMaxWidth(conf.siteMaxWidth);
              if (conf.showPdpTrustBadges !== undefined) setShowPdpTrustBadges(conf.showPdpTrustBadges);
              if (conf.deliveryScope) setDeliveryScope(conf.deliveryScope);
              if (conf.deliveryText) setDeliveryText(conf.deliveryText);
              if (conf.guaranteeText) setGuaranteeText(conf.guaranteeText);
              if (conf.returnText) setReturnText(conf.returnText);
              if (conf.buttonStyle) setButtonStyle(conf.buttonStyle);
              if (conf.showReviews !== undefined) setShowReviews(conf.showReviews);
              if (conf.homeBlocks) setHomeBlocks(conf.homeBlocks);
              if (conf.sliderImages) setSliderImages(conf.sliderImages);
              if (conf.newsletterTitle) setNewsletterTitle(conf.newsletterTitle);
              if (conf.newsletterSubtitle) setNewsletterSubtitle(conf.newsletterSubtitle);
              if (conf.featuresData) setFeaturesData(conf.featuresData);
              if (conf.videoUrl) setVideoUrl(conf.videoUrl);
              if (conf.requireAccountToOrder !== undefined) setRequireAccountToOrder(conf.requireAccountToOrder);
              if (conf.showHeaderLang !== undefined) setShowHeaderLang(conf.showHeaderLang);
              if (conf.showHeaderSearch !== undefined) setShowHeaderSearch(conf.showHeaderSearch);
              if (conf.showHeaderAccount !== undefined) setShowHeaderAccount(conf.showHeaderAccount);
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

  // Customer auth session bootstrap (live store only, to avoid swapping the admin's own session in the builder preview)
  useEffect(() => {
     if (!isLiveStore) return;
     const hydrateCustomer = async (user: any) => {
        setCustomerUser(user);
        const { data } = await supabase.from('store_customers').select('*').eq('id', user.id).single();
        setCustomerProfile(data || null);
     };
     supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) hydrateCustomer(data.session.user);
     });
     const { data: authSub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) hydrateCustomer(session.user);
        else { setCustomerUser(null); setCustomerProfile(null); }
     });
     return () => authSub.subscription.unsubscribe();
  }, [isLiveStore]);

  const handleCustomerLogout = async () => {
     await supabase.auth.signOut();
     setCustomerUser(null);
     setCustomerProfile(null);
  };
  
  const [buyMode, setBuyMode] = useState<'cart'|'direct'|'both'|'form'>(config.buyMode || 'both');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState<any>(null);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [newColorInput, setNewColorInput] = useState('#000000');
  const [newTagInput, setNewTagInput] = useState('');
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  const handleAIGenerate = () => {
     if (!productForm?.image) return;
     setIsAIGenerating(true);
     // Simulate AI Vision Analysis
     setTimeout(() => {
        setProductForm({
           ...productForm,
           name: storeIsAr ? "فستان صيفي أنيق" : "Manteau Premium Hiver",
           price: storeIsAr ? "299" : "850",
           stock: "50",
           description: storeIsAr ? "تصميم عصري وخفيف، مثالي للأيام والمناسبات. قماش عالي الجودة." : "Manteau de haute qualité, parfait pour l'hiver. Design élégant et tissu chaud.",
           category: storeIsAr ? "فساتين" : "Outerwear",
           sizes: ["S", "M", "L", "XL"],
           colors: ["#000000", "#FFC0CB", "#FFFFFF"],
           tags: storeIsAr ? ["صيفي", "فستان", "موضة", "أنيق", "2026"] : ["manteau", "hiver", "premium", "fashion", "tendance2026", "outerwear"]
        });
        setIsAIGenerating(false);
     }, 1500);
  };

  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customDomain, setCustomDomain] = useState(config.customDomain || '');
  const [isLinkingDomain, setIsLinkingDomain] = useState(false);
  const [domainError, setDomainError] = useState('');

  const submitGlobalOrder = (product: any, qty: number, formData?: any) => {
    try {
      const customerName = formData?.name || "Client Web";
      const customerPhone = formData?.phone || "Non specifie";
      const customerCity = formData?.city || "Non specifiee";
      const customerAddress = formData?.address || "";
      const orderColor = formData?.color || product?.selectedColor || "Standard";
      const orderSize = formData?.size || product?.selectedSize || "Standard";

    const newOrder = {
        id: "ORD-" + Math.floor(10000 + Math.random() * 90000),
        date: new Date().toLocaleDateString("fr-FR"),
        customer: customerName,
        city: customerCity,
        address: customerAddress,
        phone: customerPhone,
        items: `${qty || 1} article${(qty || 1) > 1 ? 's' : ''}`,
        products: product ? [{
             name: product.name,
             photo: product.photo || product.image || getCoverImage(product) || '',
             qty: qty || 1,
             price: parseFloat(product.price).toFixed(2) + ' MAD',
             options: `Couleurs: ${orderColor} - Tailles: ${orderSize}`
        }] : [],
        amount: product ? (parseFloat(product.price) * (qty || 1)).toFixed(2) + ' MAD' : "0.00 MAD",
        status: "En attente",
        statusColor: "bg-amber-100 text-amber-700"
    };

    // Sync to BEYA ERP Commandes
    const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); });
    const cmd = {
        id: generateUUID(),
        client: customerName + ' - ' + customerPhone,
        modele: product ? product.name : 'Commande E-commerce',
        tissu: 'Store: ' + (storeName || config.storeName || 'Boutique') + ' - ' + customerCity + (customerAddress ? ' - ' + customerAddress : ''),
        couleurs: orderColor,
        tailles: orderSize,
        quantite: qty || 1,
        statut: 'En attente',
        prix: product ? parseFloat(product.price) : 0,
        dateCommande: new Date().toISOString().split('T')[0],
        customer_id: customerUser?.id || null
    };
    supabase.from('commandes').insert(cmd).then(({ error }: any) => {
        if (error) {
            console.error(error);
            // If the customer_id column hasn't been added yet (store_customers_setup.sql not run),
            // don't lose the whole order - retry without it rather than failing silently.
            if (error.code === '42703' || (error.message || '').includes('customer_id')) {
                const { customer_id, ...cmdWithoutCustomerId } = cmd;
                supabase.from('commandes').insert(cmdWithoutCustomerId).then(({ error: retryError }: any) => {
                    if (retryError) console.error('Retry without customer_id also failed:', retryError);
                });
            }
        }
    });
    
    if (!isLiveStore) {
        // Delay the local state update in preview mode to allow the success page to show
        setTimeout(() => {
            setStoreOrders((prev: any) => [newOrder, ...prev]);
        }, 3000);
    }
    } catch (err: any) {
       console.error("Order submission failed:", err);
       alert("Erreur lors de la commande: " + err.message);
    }
  };

  const handleSave = async (overrideProducts?: any[]) => {
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
       storeProducts: overrideProducts || storeProducts,
       appsConfig,
       deliveryCompanies,
       secondaryColor,
       borderColor,
       textStyles,
       footerBgColor,
       footerTextColor,
       cardStyle,
       showCardBadge,
       collectionLabelBelow,
       heroHeight,
       heroImagePosX,
       heroImagePosY,
       menuTextColor,
       menuActiveColor,
       menuStyle,
       proThemesUnlocked,
       buyNowAsPopup,
       pdpImageWidth,
       pdpMaxWidth,
       pdpImageAspect,
       productCardSize,
       siteMaxWidth,
       showPdpTrustBadges,
       deliveryScope,
       deliveryText,
       guaranteeText,
       returnText,
       buttonStyle,
       showReviews,
       requireAccountToOrder,
       showHeaderLang,
       showHeaderSearch,
       showHeaderAccount
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

       // Fallback for SaaS local previews
       await supabase.from('stores').upsert({
          domain: 'latest_saved_store',
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
     const previousPreviewImg = activeTheme.previewImg;
     setActiveTheme(theme);
     setPrimaryColor(theme.defaultColor);
     setFontFamily(theme.defaultFont);
     // Only swap in the theme's suggested photo if the store is still using the
     // previous theme's default - otherwise this silently wipes a real product
     // photo the admin already uploaded every time they switch/preview a theme.
     setHeroImage((prev: string) => (!prev || prev === previousPreviewImg) ? theme.previewImg : prev);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
     e.stopPropagation();
     setCartCount(c => c + 1);
  };

  // --- DYNAMIC LAYOUT COMPONENTS ---
  const EditableText = ({ text, onTextChange, isLiveStore, className, style, as: Tag = 'span', styleKey, ...props }: any) => {
     const displayText = tr(text);
     const override = (styleKey && textStyles[styleKey]) || {};
     const mergedStyle = {
        ...style,
        ...(override.fontSize ? { fontSize: override.fontSize } : {}),
        ...(override.color ? { color: override.color } : {}),
        ...(override.fontFamily ? { fontFamily: FONT_STACKS[override.fontFamily] } : {})
     };
     if (isLiveStore) return <Tag className={className} style={mergedStyle} {...props}>{displayText}</Tag>;
     return (
        <Tag
           className={`${className} cursor-text hover:outline hover:outline-2 hover:outline-indigo-500 hover:outline-dashed hover:bg-black/10 transition-all px-1 rounded min-w-[20px] inline-block empty:before:content-['${storeIsAr ? "فارغ" : "Vide"}'] empty:before:text-slate-400`}
           style={mergedStyle}
           contentEditable
           suppressContentEditableWarning
           onBlur={(e: any) => onTextChange(e.currentTarget.textContent)}
           onClick={(e: any) => {
              e.stopPropagation();
              if (!styleKey) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const computed = window.getComputedStyle(e.currentTarget);
              setToolbarBaseline({ fontSize: override.fontSize || parseFloat(computed.fontSize), color: override.color || rgbToHex(computed.color) });
              setToolbarPos({ top: Math.max(8, rect.top - 56), left: rect.left });
              setActiveStyleKey(styleKey);
           }}
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



  const ThemeFooter = ({ bgColor, textColor, setPage }: any) => {
     const effBg = bgColor || footerBgColor;
     const effText = textColor || footerTextColor;
     return (
        <footer className="mt-auto py-12 px-6 border-t" style={{ backgroundColor: effBg, borderColor }}>
           <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6">
              <div className="text-xl font-bold" style={{ color: effText }}>{storeLogo ? <img src={storeLogo} alt={storeName} className="h-10 object-contain" /> : storeName}</div>
              <div className="flex flex-wrap justify-center gap-6 text-sm font-medium" style={{ color: effText }}>
                 {footerSettings.showPrivacy && <button onClick={() => setPage('privacy')} className="hover:opacity-70 transition-opacity">{storeIsAr ? 'سياسة الخصوصية' : 'Politique de Confidentialité'}</button>}
                 {footerSettings.showTerms && <button onClick={() => setPage('terms')} className="hover:opacity-70 transition-opacity">{storeIsAr ? 'الشروط والأحكام' : 'Conditions Générales'}</button>}
                 {footerSettings.showCookies && <button onClick={() => setPage('cookies')} className="hover:opacity-70 transition-opacity">{storeIsAr ? 'سياسة ملفات الارتباط' : 'Politique des Cookies'}</button>}
              </div>
              <EditableText as="p" text={footerSettings.copyright} onTextChange={(v: string) => setFooterSettings({...footerSettings, copyright: v})} isLiveStore={isLiveStore} className="text-xs opacity-70 mt-4" style={{ color: effText }} styleKey="footerCopyright" />
           </div>
        </footer>
     );
  };

  // Shared trust-badges row (delivery / guarantee / return) shown on the product
  // page to help convince hesitant buyers. Content and delivery scope (Morocco
  // only vs international) are editable from Settings.
  const PdpTrustBadges = () => {
     if (!showPdpTrustBadges) return null;
     const items = [
        {
           icon: deliveryScope === 'morocco'
              ? <img src="https://flagcdn.com/w20/ma.png" alt="MA" className="w-5 h-3.5 rounded-sm object-cover" />
              : <Globe className="w-4 h-4" />,
           title: storeIsAr ? 'التوصيل' : 'Livraison',
           text: deliveryText
        },
        { icon: <ShieldCheck className="w-4 h-4" />, title: storeIsAr ? 'الضمان' : 'Garantie', text: guaranteeText },
        { icon: <RefreshCw className="w-4 h-4" />, title: storeIsAr ? 'الإرجاع' : 'Retour', text: returnText }
     ];
     return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
           {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                 <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0" style={{ color: primaryColor }}>
                    {item.icon}
                 </div>
                 <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider">{item.title}</p>
                    <p className="text-[10px] text-slate-500 font-semibold truncate">{item.text}</p>
                 </div>
              </div>
           ))}
        </div>
     );
  };

  // Shared nav menu link used by every theme's header, so the menu color/style
  // controls in Design apply consistently everywhere.
  const NavLink = ({ p, currentPage, setPage: setPageFn }: any) => {
     const isActive = currentPage === p.id;
     const activeColor = menuActiveColor || primaryColor;
     if (menuStyle === 'pill') {
        return (
           <button onClick={() => setPageFn(p.id)} className="cursor-pointer capitalize px-4 py-2 rounded-full transition-colors" style={{ backgroundColor: isActive ? activeColor : 'transparent', color: isActive ? '#fff' : menuTextColor }}>
              {tr(p.title)}
           </button>
        );
     }
     if (menuStyle === 'bold') {
        return (
           <span onClick={() => setPageFn(p.id)} className="cursor-pointer capitalize transition-colors" style={{ color: isActive ? activeColor : menuTextColor, fontWeight: isActive ? 800 : 500 }}>
              {tr(p.title)}
           </span>
        );
     }
     return (
        <span onClick={() => setPageFn(p.id)} className="cursor-pointer capitalize pb-1 border-b-2 transition-colors" style={{ color: isActive ? activeColor : menuTextColor, borderColor: isActive ? activeColor : 'transparent' }}>
           {tr(p.title)}
        </span>
     );
  };

  // Mobile hamburger toggle - shown only below the md breakpoint since nav links
  // themselves are hidden there (hidden md:flex), so mobile visitors would otherwise
  // have no way to reach Collections/About at all.
  const MobileMenuButton = ({ colorClass = 'text-current' }: any) => (
     <button onClick={() => setIsMobileNavOpen(o => !o)} className={`md:hidden ${colorClass} hover:opacity-70 transition-opacity`} aria-label="Menu">
        {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
     </button>
  );

  const MobileNavPanel = ({ bgClass = 'bg-white', textClass = 'text-slate-800', page: currentPage, setPage: setPageFn }: any) => {
     if (!isMobileNavOpen) return null;
     return (
        <div className={`md:hidden w-full ${bgClass} ${textClass} border-b border-black/5 px-8 py-4 flex flex-col gap-4`}>
           {storePages.map(p => (
              <div key={p.id} onClick={() => setIsMobileNavOpen(false)}>
                 <NavLink p={p} currentPage={currentPage} setPage={setPageFn} />
              </div>
           ))}
        </div>
     );
  };

  // App-shell style bottom tab bar for mobile, so the storefront feels like a real
  // shopping app instead of a shrunk desktop site. Currently wired into Clement only.
  const BottomNavBar = ({ page: currentPage, setPage: setPageFn }: any) => {
     const homePage = storePages.find(p => p.id === 'home') || storePages[0];
     const collectionsPage = storePages.find(p => p.id === 'collections') || storePages[1] || storePages[0];
     const navItems = [
        { id: homePage?.id, icon: Home, label: isAr ? 'الرئيسية' : 'Accueil' },
        { id: collectionsPage?.id, icon: LayoutGrid, label: isAr ? 'التشكيلات' : 'Collections' }
     ].filter(item => item.id);

     return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-around py-2 px-2">
           {navItems.map(item => {
              const isActive = currentPage === item.id;
              const Icon = item.icon;
              return (
                 <button key={item.id} onClick={() => setPageFn(item.id)} className="flex flex-col items-center gap-1 px-3 py-1">
                    <Icon className="w-5 h-5" style={{ color: isActive ? primaryColor : '#94a3b8' }} />
                    <span className="text-[9px] font-bold" style={{ color: isActive ? primaryColor : '#94a3b8' }}>{item.label}</span>
                 </button>
              );
           })}
           <button onClick={() => setIsCartOpen(true)} className="flex flex-col items-center gap-1 px-3 py-1 relative">
              <ShoppingBag className="w-5 h-5 text-slate-400" />
              {cartCount > 0 && <span className="absolute top-0 right-1.5 bg-rose-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{cartCount}</span>}
              <span className="text-[9px] font-bold text-slate-400">{isAr ? 'السلة' : 'Panier'}</span>
           </button>
           <button onClick={() => { if (!customerUser) { setAuthMode('login'); setIsAuthOpen(true); } }} className="flex flex-col items-center gap-1 px-3 py-1">
              <Users className="w-5 h-5 text-slate-400" />
              <span className="text-[9px] font-bold text-slate-400">{customerUser ? (customerProfile?.name?.split(' ')[0] || (isAr ? 'حسابي' : 'Compte')) : (isAr ? 'حسابي' : 'Compte')}</span>
           </button>
        </div>
     );
  };

  // Shared header icon cluster (language / search / account / cart) used by every theme,
  // so they all stay wired the same way and respect the show/hide toggles from Settings.
  const HeaderIconsCluster = ({ variant = 'light' }: any) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

    const langFlags: Record<string, { code: string; label: string }> = {
      fr: { code: 'fr', label: 'FR' },
      en: { code: 'gb', label: 'EN' },
      ar: { code: 'sa', label: 'AR' },
    };
    const nextLang: Record<string, 'fr' | 'en' | 'ar'> = { fr: 'en', en: 'ar', ar: 'fr' };
    const currentLang = langFlags[storeLang] || langFlags.fr;

    const searchResults = searchQuery.trim()
      ? (storeProducts || []).filter((p: any) => p.name?.toLowerCase().includes(searchQuery.trim().toLowerCase())).slice(0, 6)
      : [];

    const isDark = variant === 'dark';
    const iconClass = isDark ? 'text-white' : 'text-slate-700';

    return (
      <div className={`flex gap-4 items-center relative ${iconClass}`}>
        {showHeaderLang && (
          <span
            className="text-xs font-bold uppercase flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => setStoreLang(nextLang[storeLang] || 'fr')}
            title={storeLang === 'ar' ? 'تغيير اللغة' : storeLang === 'en' ? 'Change language' : 'Changer de langue'}
          >
            <img src={`https://flagcdn.com/w20/${currentLang.code}.png`} alt={currentLang.label} className="w-4 h-3 rounded-sm object-cover" /> {currentLang.label}
          </span>
        )}

        {showHeaderSearch && (
          <div className="relative">
            <Search className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setIsSearchOpen(o => !o)} />
            {isSearchOpen && (
              <div className="absolute right-0 top-8 z-50 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 text-slate-800">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={storeLang === 'ar' ? 'ابحث عن منتج...' : storeLang === 'en' ? 'Search a product...' : 'Rechercher un produit...'}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400"
                />
                {searchQuery.trim() && (
                  <div className="mt-2 max-h-64 overflow-y-auto">
                    {searchResults.length > 0 ? searchResults.map((p: any) => (
                      <div
                        key={p.id}
                        onClick={() => { navigateToProduct(p.id); setIsSearchOpen(false); setSearchQuery(''); }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        <img src={p.images?.[0] || p.image} alt={p.name} className="w-9 h-9 object-cover rounded-md bg-slate-100" />
                        <span className="text-xs font-semibold text-slate-700 truncate">{p.name}</span>
                      </div>
                    )) : (
                      <p className="text-xs text-slate-400 text-center py-3">{storeLang === 'ar' ? 'لا توجد نتائج' : storeLang === 'en' ? 'No results' : 'Aucun résultat'}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {showHeaderAccount && (
          <div className="relative flex items-center gap-2">
            {customerUser && (
              <span className="text-xs font-bold hidden md:inline">
                {storeLang === 'ar' ? 'مرحباً' : storeLang === 'en' ? 'Hi' : 'Bonjour'} {(customerProfile?.name || '').split(' ')[0]}
              </span>
            )}
            <Users
              className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => {
                if (customerUser) { setIsAccountMenuOpen(o => !o); }
                else { setAuthMode('login'); setIsAuthOpen(true); }
              }}
            />
            {isAccountMenuOpen && customerUser && (
              <div className="absolute right-0 top-8 z-50 whitespace-nowrap bg-white border border-slate-200 rounded-lg shadow-xl py-2 w-36 text-slate-800">
                <button
                  onClick={() => { handleCustomerLogout(); setIsAccountMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-slate-50"
                >
                  {storeIsAr ? 'تسجيل الخروج' : storeLang === 'en' ? 'Log out' : 'Déconnexion'}
                </button>
              </div>
            )}
          </div>
        )}

        <button className="relative hover:opacity-70 transition-opacity" onClick={() => setIsCartOpen(true)}>
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && <span className="absolute -bottom-1 -right-1 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center bg-black">{cartCount}</span>}
        </button>
      </div>
    );
  };

  const LayoutHeroCenter = ({ isModal = false, page, setPage, activeProductId, navigateToProduct, buyMode, categories, activeCategory, setActiveCategory, filteredProducts, sortBy, setSortBy, setIsCartOpen, submitGlobalOrder, storeProducts }: any) => {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [activePDPTab, setActivePDPTab] = useState('description');
    const [likedProducts, setLikedProducts] = useState<Set<any>>(new Set());

    const toggleLike = (id: any, e: React.MouseEvent) => {
       e.stopPropagation();
       setLikedProducts(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
    };

    const MobileProductCard = ({ p, idx = 0 }: any) => (
       cardStyle === 'trend' ? (
          <ProductCardTrend p={p} idx={idx} onClick={() => navigateToProduct(p.id)} />
       ) : (
       <div className="cursor-pointer" onClick={() => navigateToProduct(p.id)}>
          <div className="relative aspect-square rounded-2xl overflow-hidden mb-2 border" style={{ backgroundColor: cardBg, borderColor, borderRadius: getCardRadius() }}>
                           <CardBadge text={p.category} />
             {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover" alt={p.name} /> : <div className="w-full h-full flex items-center justify-center opacity-20"><Box className="w-10 h-10" /></div>}
             <button onClick={(e) => toggleLike(p.id, e)} className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/90 rounded-full shadow-sm flex items-center justify-center">
                <Heart className={`w-3.5 h-3.5 ${likedProducts.has(p.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
             </button>
          </div>
          <h4 className="font-bold text-xs text-slate-800 truncate">{p.name}</h4>
          <p className="text-xs font-black mt-0.5" style={{ color: primaryColor }}>{p.price} MAD</p>
       </div>
       )
    );

    return (
    <div className={`w-full min-h-full bg-white text-slate-900 ${fontFamily} flex flex-col`}>
      <div className={`p-6 flex justify-between items-center border-b border-slate-100 ${previewDevice === 'mobile' && !isModal ? 'flex-col gap-4' : 'flex-col md:flex-row gap-4 md:gap-0'}`}>
         <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <LogoEditor onClick={() => setPage('home')} className="text-2xl font-black uppercase tracking-tighter" />
            <MobileMenuButton />
         </div>
         <div className={`flex gap-6 text-sm font-bold ${previewDevice === 'mobile' && !isModal ? 'hidden' : 'hidden md:flex'}`}>
            {storePages.map(p => (
               <NavLink key={p.id} p={p} currentPage={page} setPage={setPage} />
            ))}
         </div>
         <HeaderIconsCluster variant="light" />
      </div>
      <MobileNavPanel page={page} setPage={setPage} />

      <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {page === 'home' && (
          <>
            <div className="flex flex-col gap-0 w-full">
             {homeBlocks.map((block: string) => {
                if (block === 'hero') return (
                    <HeroBackgroundEditor key="hero" className="flex flex-col items-center justify-center text-center p-8 bg-cover relative" style={{ backgroundImage: `url(${heroImage})`, height: `${isModal ? heroHeight + 150 : heroHeight}px`, backgroundPosition: `${heroImagePosX}% ${heroImagePosY}%` }}>
                       <div className="absolute inset-0 bg-black/60"></div>
                       <div className="relative z-10 flex flex-col items-center">
                          <EditableText as="h1" text={heroTitle} onTextChange={setHeroTitle} isLiveStore={isLiveStore} className={`${isModal ? 'text-7xl' : 'text-5xl'} font-black text-white uppercase tracking-tighter mb-4`} styleKey="heroTitle" />
                          <EditableText as="p" text={heroSubtitle} onTextChange={setHeroSubtitle} isLiveStore={isLiveStore} className="text-white/90 text-lg mb-8 max-w-md" styleKey="heroSubtitle" />
                          <button onClick={() => setPage('collections')} className="px-8 py-3 text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded" style={{ backgroundColor: primaryColor }}>
                             <EditableText text={heroButtonText} onTextChange={setHeroButtonText} isLiveStore={isLiveStore} styleKey="heroButtonText" />
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
                    <div key="products" className={`${isModal ? 'p-16' : 'p-8'} mx-auto w-full`} style={{ maxWidth: `${siteMaxWidth}px` }}>
                       <div className="flex items-center justify-between mb-6 md:justify-center md:mb-10">
                          <h3 className="text-lg md:text-2xl font-black uppercase">{homeCollectionsTitle}</h3>
                          <span className="md:hidden text-xs font-bold text-slate-400" onClick={() => setPage('collections')}>{isAr ? 'الكل' : 'Voir tout'}</span>
                       </div>
                       <div className="md:hidden grid grid-cols-2 gap-4">
                          {storeProducts.slice(0, 8).map((p: any) => (
                             <MobileProductCard key={p.id} p={p} />
                          ))}
                       </div>
                       <div className={`hidden md:grid gap-8 ${isModal ? gridColsClass('lg4') : gridColsClass('lg3')}`}>
                          {storeProducts.slice(0, 8).map((p: any) => (
                             <div key={p.id} className="group cursor-pointer" onClick={() => navigateToProduct(p.id)}>
                                <div className="aspect-[3/4] bg-slate-100 mb-4 overflow-hidden relative rounded-xl">
                                   {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover" alt={p.name} /> : <div className="absolute inset-0 flex items-center justify-center opacity-20"><Box className="w-12 h-12" /></div>}
                                   <div className="absolute bottom-4 left-0 right-0 flex justify-center transition-opacity opacity-0 group-hover:opacity-100">
                                      <button onClick={handleAddToCart} className="px-8 py-3 text-white text-xs font-bold uppercase tracking-wider shadow-2xl rounded-full" style={btnStyle}>{tr('Add to cart')}</button>
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
                    <div key="collections" className={`${isModal ? 'p-16' : 'p-8'} mx-auto w-full bg-slate-50`} style={{ maxWidth: `${siteMaxWidth}px` }}>
                       <h3 className="text-2xl font-black uppercase text-center mb-10">{tr(allCollectionsTitle)}</h3>
                       <div className={`grid gap-4 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-2' : (isModal ? 'grid-cols-4' : 'grid-cols-3')}`}>
                          {categories.filter((c:string) => c !== 'All').map((cat: string, idx: number) => (
                             cardStyle === 'trend' ? (
                                <div key={idx} onClick={() => { setActiveCategory(cat); setPage('collections'); }} className="cursor-pointer group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all bg-white border border-slate-100">
                                   <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: trendCardAccents[idx % trendCardAccents.length] }}>
                                      <img src={storeProducts.find((p:any)=>p.category===cat)?.image || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=600'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-sm" style={{ backgroundColor: primaryColor }}>{storeIsAr ? 'مجموعة' : storeLang === 'en' ? 'Collection' : 'Collection'}</span>
                                   </div>
                                   <div className="p-3 flex items-center justify-between">
                                      <span className="text-xs font-bold text-slate-800">{cat}</span>
                                      <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-400" />
                                   </div>
                                </div>
                             ) : (collectionLabelBelow || cardStyle === 'pill' || cardStyle === 'arch') ? (
                             <div key={idx} onClick={() => { setActiveCategory(cat); setPage('collections'); }} className="cursor-pointer group">
                                <div className="aspect-square relative overflow-hidden shadow-sm hover:shadow-xl transition-all" style={{ borderRadius: getCardRadius() ?? '16px' }}>
                                   <img src={storeProducts.find((p:any)=>p.category===cat)?.image || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=600'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                <p className="text-center font-bold text-sm mt-3 text-slate-800">{cat}</p>
                             </div>
                             ) : (
                             <div key={idx} onClick={() => { setActiveCategory(cat); setPage('collections'); }} className="cursor-pointer group aspect-square relative overflow-hidden shadow-sm hover:shadow-xl transition-all" style={{ borderRadius: getCardRadius() ?? '16px' }}>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 flex items-end p-6">
                                   <span className="text-white font-bold text-lg">{cat}</span>
                                </div>
                                <div className="absolute inset-0 bg-indigo-900/20 group-hover:bg-transparent transition-colors z-0"></div>
                                <img src={storeProducts.find((p:any)=>p.category===cat)?.image || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=600'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                             </div>
                             )
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
                          <button className="px-6 py-3 text-white font-bold rounded-r-lg" style={btnStyle}>S'abonner</button>
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
            <div className={`${isModal ? 'p-16' : 'p-4 md:p-8'} mx-auto w-full`} style={{ maxWidth: `${siteMaxWidth}px` }}>
               <div className="md:hidden flex items-center gap-2 mb-4 bg-slate-50 rounded-full px-4 py-2.5">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input readOnly placeholder={isAr ? 'بحث...' : 'Rechercher...'} className="bg-transparent text-sm flex-1 outline-none text-slate-600" />
               </div>
               <div className="md:hidden flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar">
                  <span className="flex items-center gap-1 shrink-0 px-3 py-1.5 rounded-full border border-slate-200 text-[11px] font-bold text-slate-600"><SlidersHorizontal className="w-3 h-3" /> {isAr ? 'فلترة' : 'Filtrer'}</span>
                  {categories && categories.filter((c: string) => c !== 'All').map((c: string) => (
                     <button key={tr(c)} onClick={() => setActiveCategory(c)} className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${activeCategory === c ? 'text-white' : 'bg-slate-100 text-slate-600'}`} style={{ backgroundColor: activeCategory === c ? primaryColor : undefined }}>
                        {tr(c)}
                     </button>
                  ))}
               </div>
               <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                  <h3 className="text-2xl font-black uppercase text-center md:text-left hidden md:block">{tr('All Products')}</h3>
                  <div className="hidden md:flex flex-col sm:flex-row items-center gap-4">
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
               <div className="md:hidden grid grid-cols-2 gap-4">
                  {filteredProducts.map((p: any, idx: number) => (
                     <MobileProductCard key={p.id} p={p} idx={idx} />
                  ))}
               </div>
               <div className={`hidden md:grid gap-8 ${isModal ? gridColsClass('lg4') : gridColsClass('lg3')}`}>
                  {filteredProducts.map((p: any, idx: number) => (
                     cardStyle === 'trend' ? (
                        <ProductCardTrend key={p.id} p={p} idx={idx} onClick={() => navigateToProduct(p.id)} />
                     ) : (
                     <div key={p.id} className="group cursor-pointer" onClick={() => navigateToProduct(p.id)}>
                        <div className="aspect-[3/4] mb-4 overflow-hidden relative rounded-xl border" style={{ backgroundColor: cardBg, borderColor, borderRadius: getCardRadius() }}>
                           <CardBadge text={p.category} />
                           {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover" alt={p.name} /> : <div className="absolute inset-0 flex items-center justify-center opacity-20"><Box className="w-12 h-12" /></div>}
                           <div className="absolute bottom-4 left-0 right-0 flex justify-center transition-opacity opacity-0 group-hover:opacity-100">
                              <button onClick={handleAddToCart} className="px-8 py-3 text-white text-xs font-bold uppercase tracking-wider shadow-2xl rounded-full" style={btnStyle}>{tr('Add to cart')}</button>
                           </div>
                        </div>
                        <h4 className="font-bold text-sm">{p.name}</h4>
                        <p className="text-slate-500 text-sm mt-1">{p.price} MAD</p>
                     </div>
                     )
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
           <div className={`${isModal ? 'p-16' : 'p-8 pb-24 md:pb-8'} mx-auto w-full`} style={{ maxWidth: `${pdpMaxWidth}px` }}>
              {storeProducts.filter(p => p.id === activeProductId).map(p => (
                 <div key={p.id} className={`flex gap-12 ${previewDevice === 'mobile' && !isModal ? 'flex-col' : 'flex-col md:flex-row'}`} style={{ '--pdp-img-pct': `${pdpImageWidth}%` } as any}>
                    <div className="pdp-img-col flex-1 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden" style={{ aspectRatio: pdpImageAspect }}>
                       {(selectedColor && p.colorImages?.[selectedColor]) ? <img src={p.colorImages[selectedColor]} className="w-full h-full object-cover" alt={p.name} /> : (p.image ? <img src={p.image} className="w-full h-full object-cover" alt={p.name} /> : <ImageIcon className="w-20 h-20 opacity-10" />)}
                    </div>
                    <div className="pdp-details-col flex-1 flex flex-col justify-center">
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
                             <CheckoutForm
                                 storeIsAr={typeof storeLang !== 'undefined' ? storeLang === 'ar' : storeIsAr}
                                 storeLang={storeLang}
                                 onSubmit={submitGlobalOrder}
                                 product={typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId)}
                                 quantity={typeof quantity !== 'undefined' ? quantity : 1}
                                 disabled={((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.colors?.length > 0 && !selectedColor) || ((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.sizes?.length > 0 && !selectedSize)}
                                 requireAccount={requireAccountToOrder}
                                 isAuthenticated={!!customerUser}
                                 onRequestLogin={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                                 selectedColor={selectedColor}
                                 selectedSize={selectedSize}
                              />
                          </div>
                       ) : (
                          <>
                          <div className="hidden md:flex gap-4">
                             {(buyMode === 'cart' || buyMode === 'both') && (
                                <button onClick={handleAddToCart} disabled={((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize))} className={`flex-1 px-8 py-4 text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded-xl shadow-lg ${((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize)) ? ' opacity-50 cursor-not-allowed' : ''}`} style={{ backgroundColor: '#1e293b' }}>{tr('Add to cart')}</button>
                             )}
                             {(buyMode === 'direct' || buyMode === 'both') && (
                                <button onClick={() => buyNowAsPopup ? setQuickBuyContext({ product: p, quantity, selectedColor, selectedSize, setPage }) : setPage('checkout')} disabled={((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize))} className={`flex-1 px-8 py-4 text-white font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform rounded-xl shadow-lg ${((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize)) ? ' opacity-50 cursor-not-allowed' : ''}`} style={{ backgroundColor: primaryColor }}>Buy Now</button>
                             )}
                          </div>
                          <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-white border-t border-slate-100 p-4 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                             {(buyMode === 'cart' || buyMode === 'both') && (
                                <button onClick={handleAddToCart} disabled={((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize))} className={`flex-1 py-3.5 border-2 border-slate-800 text-slate-800 font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 ${((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize)) ? ' opacity-50 cursor-not-allowed' : ''}`}>
                                   <ShoppingBag className="w-4 h-4" /> {isAr ? 'أضف للسلة' : 'Add to Cart'}
                                </button>
                             )}
                             {(buyMode === 'direct' || buyMode === 'both') && (
                                <button onClick={() => buyNowAsPopup ? setQuickBuyContext({ product: p, quantity, selectedColor, selectedSize, setPage }) : setPage('checkout')} disabled={((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize))} className={`flex-1 py-3.5 bg-slate-900 text-white font-bold uppercase tracking-wider text-xs rounded-xl ${((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize)) ? ' opacity-50 cursor-not-allowed' : ''}`}>
                                   {isAr ? 'اشتري الآن' : 'Buy Now'}
                                </button>
                             )}
                          </div>
                          </>
                       )}
                       <PdpTrustBadges />
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
                    <CheckoutForm
                                 storeIsAr={typeof storeLang !== 'undefined' ? storeLang === 'ar' : storeIsAr}
                                 storeLang={storeLang}
                                 onSubmit={submitGlobalOrder}
                                 product={typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId)}
                                 quantity={typeof quantity !== 'undefined' ? quantity : 1}
                                 disabled={((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.colors?.length > 0 && !selectedColor) || ((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.sizes?.length > 0 && !selectedSize)}
                                 requireAccount={requireAccountToOrder}
                                 isAuthenticated={!!customerUser}
                                 onRequestLogin={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                                 selectedColor={selectedColor}
                                 selectedSize={selectedSize}
                              />
                 </div>
              </div>
           </div>
        )}
        {page === 'success' && (
           <div className={`${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full text-center flex flex-col items-center justify-center min-h-[400px]`}>
              <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-green-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-200/50 relative">
                 <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
                 <CheckCircle className="w-12 h-12 relative z-10" />
              </div>
              <h2 className="text-4xl font-black mb-3 text-slate-800 tracking-tight flex items-center gap-2 justify-center">
                  {storeIsAr ? 'تم تأكيد طلبك بنجاح' : 'Commande Confirmée !'} <Sparkles className="w-8 h-8 text-amber-400" />
              </h2>
              <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed mb-8">
                 {storeIsAr 
                   ? "تهانينا! لقد تلقينا طلبك بنجاح. فريقنا يقوم الآن بتجهيزه بعناية فائقة. سيتم التواصل معك قريباً لتأكيد تفاصيل الشحن."
                   : "Félicitations ! Nous avons bien reçu votre commande. Notre équipe la prépare avec soin et vous contactera très prochainement pour l'expédition."}
              </p>
              
              <div className="flex items-center justify-center gap-6 mb-10 text-slate-400 text-sm font-semibold">
                 <div className="flex flex-col items-center gap-2"><Package className="w-6 h-6 text-indigo-400" /> <span>{storeIsAr ? 'تجهيز الطلب' : 'Préparation'}</span></div>
                 <div className="w-12 h-px bg-slate-200"></div>
                 <div className="flex flex-col items-center gap-2"><Truck className="w-6 h-6 text-emerald-400" /> <span>{storeIsAr ? 'شحن سريع' : 'Expédition'}</span></div>
              </div>

              <button onClick={() => setPage('home')} className="px-10 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-xl shadow-slate-900/20">
                 {storeIsAr ? "العودة للصفحة الرئيسية" : "Retour à l'accueil"}
              </button>
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
      <BottomNavBar page={page} setPage={setPage} />
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
               <NavLink key={p.id} p={p} currentPage={page} setPage={setPage} />
            ))}
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <LogoEditor onClick={() => setPage('home')} className="text-3xl font-normal tracking-wide" style={{ color: primaryColor }} />
            <MobileMenuButton />
         </div>
         <HeaderIconsCluster variant="light" />
      </div>
      <MobileNavPanel page={page} setPage={setPage} />

      <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {page === 'home' && (
          <>
            <div className={`flex ${previewDevice === 'mobile' && !isModal ? 'flex-col' : 'flex-col md:flex-row'} h-auto bg-white`} style={{ minHeight: previewDevice === 'mobile' && !isModal ? undefined : `${isModal ? heroHeight + 150 : heroHeight}px` }}>
               <div className="flex-1 flex flex-col justify-center p-12">
                  <h1 className="text-5xl font-light leading-tight mb-6" style={{ color: primaryColor }}>
                     {storeLang === 'ar' ? <>أناقة في<br/>البساطة.</> : storeLang === 'en' ? <>Elegance in <br/>Simplicity.</> : <>Élégance et<br/>Simplicité.</>}
                  </h1>
                  <p className="text-gray-500 mb-8 max-w-sm leading-relaxed">{storeLang === 'ar' ? 'اكتشف تشكيلة تتميز بخطوط نقية ومواد طبيعية.' : storeLang === 'en' ? 'Experience a collection defined by pure lines and organic materials.' : 'Découvrez une collection définie par des lignes pures et des matériaux naturels.'}</p>
                  <button onClick={() => setPage('collections')} className="w-max px-10 py-4 text-white text-sm tracking-widest transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>{tr('DISCOVER')}</button>
               </div>
               <HeroBackgroundEditor className="flex-1 bg-cover" style={{ backgroundImage: `url(${heroImage})`, backgroundPosition: `${heroImagePosX}% ${heroImagePosY}%` }} />
            </div>
            <div className={`${isModal ? 'p-20' : 'p-8'} mx-auto w-full`} style={{ maxWidth: `${siteMaxWidth}px` }}>
               <div className="flex justify-between items-end mb-12 border-b pb-4">
                  <h3 className="text-2xl font-light">{storeLang === 'ar' ? 'وصل حديثاً' : storeLang === 'en' ? 'New Arrivals' : 'Nouveautés'}</h3>
                  <span className="text-sm cursor-pointer hover:underline" style={{ color: primaryColor }}>{storeLang === 'ar' ? 'عرض الكل' : storeLang === 'en' ? 'View all' : 'Voir tout'}</span>
               </div>
               <div className={`grid gap-x-8 gap-y-12 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : gridColsClass('lg3')}`}>
                  {storeProducts.map((p: any, idx: number) => (
                     cardStyle === 'trend' ? (
                        <ProductCardTrend key={p.id} p={p} idx={idx} onClick={() => navigateToProduct(p.id)} />
                     ) : (
                     <div key={p.id} className="group cursor-pointer" onClick={() => navigateToProduct(p.id)}>
                        <div className="aspect-[4/5] mb-6 relative overflow-hidden flex items-center justify-center border" style={{ backgroundColor: cardBg, borderColor, borderRadius: getCardRadius() }}>
                           <CardBadge text={p.category} />
                           {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover" alt={p.name} /> : <div className="absolute inset-0 flex items-center justify-center opacity-10"><ImageIcon className="w-16 h-16" /></div>}
                           <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={handleAddToCart} disabled={((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize))} className={`px-8 py-3 bg-white text-black text-xs tracking-widest hover:bg-black hover:text-white transition-colors ${((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize)) ? ' opacity-50 cursor-not-allowed' : ''}`}>{tr('ADD TO CART')}</button>
                           </div>
                        </div>
                        <h4 className="font-medium text-lg mb-2">{p.name}</h4>
                        <p className="text-gray-500">{p.price} MAD</p>
                     </div>
                     )
                  ))}
               </div>
            </div>
          </>
        )}
        {page === 'collections' && (
            <div className={`${isModal ? 'p-20' : 'p-8'} mx-auto w-full`} style={{ maxWidth: `${siteMaxWidth}px` }}>
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
               <div className={`grid gap-x-8 gap-y-12 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : gridColsClass('lg3')}`}>
                  {filteredProducts.map((p: any, idx: number) => (
                     cardStyle === 'trend' ? (
                        <ProductCardTrend key={p.id} p={p} idx={idx} onClick={() => navigateToProduct(p.id)} />
                     ) : (
                     <div key={p.id} className="group cursor-pointer" onClick={() => navigateToProduct(p.id)}>
                        <div className="aspect-[4/5] mb-6 relative overflow-hidden flex items-center justify-center border" style={{ backgroundColor: cardBg, borderColor, borderRadius: getCardRadius() }}>
                           <CardBadge text={p.category} />
                           {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover" alt={p.name} /> : <div className="absolute inset-0 flex items-center justify-center opacity-10"><ImageIcon className="w-16 h-16" /></div>}
                           <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={handleAddToCart} disabled={((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize))} className={`px-8 py-3 bg-white text-black text-xs tracking-widest hover:bg-black hover:text-white transition-colors ${((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize)) ? ' opacity-50 cursor-not-allowed' : ''}`}>{tr('ADD TO CART')}</button>
                           </div>
                        </div>
                        <h4 className="font-medium text-lg mb-2">{p.name}</h4>
                        <p className="text-gray-500">{p.price} MAD</p>
                     </div>
                     )
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
           <div className={`${isModal ? 'p-20' : 'p-8'} mx-auto w-full`} style={{ maxWidth: `${pdpMaxWidth}px` }}>
              {storeProducts.filter(p => p.id === activeProductId).map(p => (
                 <div key={p.id} className={`flex gap-16 ${previewDevice === 'mobile' && !isModal ? 'flex-col' : 'flex-col md:flex-row'}`} style={{ '--pdp-img-pct': `${pdpImageWidth}%` } as any}>
                    <div className="pdp-img-col flex-1 relative flex items-center justify-center bg-gray-50 overflow-hidden" style={{ aspectRatio: pdpImageAspect }}>
                       {(selectedColor && p.colorImages?.[selectedColor]) ? <img src={p.colorImages[selectedColor]} className="w-full h-full object-cover" alt={p.name} /> : (p.image ? <img src={p.image} className="w-full h-full object-cover" alt={p.name} /> : <ImageIcon className="w-20 h-20 opacity-10 absolute inset-0 m-auto" />)}
                    </div>
                    <div className="pdp-details-col flex-1 flex flex-col justify-center">
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
                             <CheckoutForm
                                 storeIsAr={typeof storeLang !== 'undefined' ? storeLang === 'ar' : storeIsAr}
                                 storeLang={storeLang}
                                 onSubmit={submitGlobalOrder}
                                 product={typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId)}
                                 quantity={typeof quantity !== 'undefined' ? quantity : 1}
                                 disabled={((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.colors?.length > 0 && !selectedColor) || ((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.sizes?.length > 0 && !selectedSize)}
                                 requireAccount={requireAccountToOrder}
                                 isAuthenticated={!!customerUser}
                                 onRequestLogin={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                                 selectedColor={selectedColor}
                                 selectedSize={selectedSize}
                              />
                          </div>
                       ) : (
                          <div className="flex gap-4">
                             {(buyMode === 'cart' || buyMode === 'both') && (
                                <button onClick={handleAddToCart} disabled={((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize))} className={`w-max px-12 py-4 bg-white border border-black text-black text-xs tracking-widest hover:bg-gray-100 transition-colors ${((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize)) ? ' opacity-50 cursor-not-allowed' : ''}`}>{tr('ADD TO CART')}</button>
                             )}
                             {(buyMode === 'direct' || buyMode === 'both') && (
                                <button onClick={() => buyNowAsPopup ? setQuickBuyContext({ product: p, quantity, selectedColor, selectedSize, setPage }) : setPage('checkout')} disabled={((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize))} className={`w-max px-12 py-4 text-white text-xs tracking-widest transition-opacity hover:opacity-90 ${((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize)) ? ' opacity-50 cursor-not-allowed' : ''}`} style={{ backgroundColor: primaryColor }}>{tr('BUY NOW')}</button>
                             )}
                          </div>
                       )}
                       <PdpTrustBadges />
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
                    <CheckoutForm
                                 storeIsAr={typeof storeLang !== 'undefined' ? storeLang === 'ar' : storeIsAr}
                                 storeLang={storeLang}
                                 onSubmit={submitGlobalOrder}
                                 product={typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId)}
                                 quantity={typeof quantity !== 'undefined' ? quantity : 1}
                                 disabled={((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.colors?.length > 0 && !selectedColor) || ((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.sizes?.length > 0 && !selectedSize)}
                                 requireAccount={requireAccountToOrder}
                                 isAuthenticated={!!customerUser}
                                 onRequestLogin={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                                 selectedColor={selectedColor}
                                 selectedSize={selectedSize}
                              />
                 </div>
              </div>
           </div>
        )}
        {page === 'success' && (
           <div className={`${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full text-center flex flex-col items-center justify-center min-h-[400px] py-20`}>
              <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-green-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-200/50 relative">
                 <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
                 <CheckCircle className="w-12 h-12 relative z-10" />
              </div>
              <h2 className="text-4xl font-light mb-3 tracking-tight flex items-center gap-2 justify-center" style={{ color: primaryColor }}>
                  {storeIsAr ? 'تم تأكيد طلبك بنجاح' : 'Commande Confirmée !'} <Sparkles className="w-8 h-8 text-amber-400" />
              </h2>
              <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed mb-8">
                 {storeIsAr 
                   ? "تهانينا! لقد تلقينا طلبك بنجاح. فريقنا يقوم الآن بتجهيزه بعناية فائقة. سيتم التواصل معك قريباً لتأكيد تفاصيل الشحن."
                   : "Félicitations ! Nous avons bien reçu votre commande. Notre équipe la prépare avec soin et vous contactera très prochainement pour l'expédition."}
              </p>
              
              <div className="flex items-center justify-center gap-6 mb-10 text-slate-400 text-sm font-semibold">
                 <div className="flex flex-col items-center gap-2"><Package className="w-6 h-6 text-indigo-400" /> <span>{storeIsAr ? 'تجهيز الطلب' : 'Préparation'}</span></div>
                 <div className="w-12 h-px bg-slate-200"></div>
                 <div className="flex flex-col items-center gap-2"><Truck className="w-6 h-6 text-emerald-400" /> <span>{storeIsAr ? 'شحن سريع' : 'Expédition'}</span></div>
              </div>

              <button onClick={() => setPage('home')} className="px-10 py-4 border border-black text-xs tracking-widest hover:bg-black hover:text-white transition-colors">
                 {storeIsAr ? "العودة للصفحة الرئيسية" : "RETOUR À L'ACCUEIL"}
              </button>
           </div>
        )}
      </div>
      <BottomNavBar page={page} setPage={setPage} />
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
         <div className="flex items-center gap-4 w-full justify-between md:justify-center md:relative">
            <div className="w-5 md:hidden" />
            <LogoEditor onClick={() => setPage('home')} className="text-4xl font-serif tracking-widest" style={{ color: primaryColor }} />
            <MobileMenuButton />
         </div>
         <div className={`flex gap-12 text-xs tracking-widest uppercase ${previewDevice === 'mobile' && !isModal ? 'hidden' : 'hidden md:flex'}`}>
            {storePages.map(p => (
               <NavLink key={p.id} p={p} currentPage={page} setPage={setPage} />
            ))}
            <HeaderIconsCluster variant="dark" />
         </div>
         <div className="md:hidden">
            <HeaderIconsCluster variant="dark" />
         </div>
      </div>
      <MobileNavPanel bgClass="bg-[#111]" textClass="text-[#f5f5f5]" page={page} setPage={setPage} />

      <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {page === 'home' && (
          <>
            <div className="p-8">
               <HeroBackgroundEditor className="w-full bg-cover relative rounded-sm border" style={{ backgroundImage: `url(${heroImage})`, borderColor: `${primaryColor}40`, height: `${isModal ? heroHeight + 250 : heroHeight + 50}px`, backgroundPosition: `${heroImagePosX}% ${heroImagePosY}%` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent"></div>
                  <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
                     <div>
                        <h1 className="text-5xl font-serif mb-4">{storeLang === 'ar' ? 'التشكيلة الملكية.' : storeLang === 'en' ? 'The Royal Edit.' : 'La Sélection Royale.'}</h1>
                        <button onClick={() => setPage('collections')} className="px-8 py-3 text-xs tracking-widest border transition-colors" style={{ borderColor: primaryColor, color: primaryColor }}>{storeLang === 'ar' ? 'استكشف التشكيلة' : storeLang === 'en' ? 'EXPLORE COLLECTION' : 'EXPLORER LA COLLECTION'}</button>
                     </div>
                  </div>
               </HeroBackgroundEditor>
            </div>
            <div className={`${isModal ? 'p-16' : 'p-8'} mx-auto w-full`} style={{ maxWidth: `${siteMaxWidth}px` }}>
               <h3 className="text-xl tracking-widest uppercase text-center mb-16" style={{ color: primaryColor }}>Curated Selection</h3>
               <div className={`grid gap-4 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : gridColsClass('sm2')}`}>
                  {storeProducts.map((p: any) => (
                     <div key={p.id} className="group cursor-pointer relative aspect-square border p-4 flex flex-col items-center justify-center" style={{ backgroundColor: cardBg, borderColor }} onClick={() => navigateToProduct(p.id)}>
                        {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover mb-8" alt={p.name} /> : <ImageIcon className="w-16 h-16 opacity-10 mb-8" />}
                        <h4 className="font-serif text-2xl mb-2 group-hover:text-white transition-colors" style={{ color: primaryColor }}>{p.name}</h4>
                        <p className="text-white/50 tracking-widest text-sm mb-6">{p.price} MAD</p>
                        <button onClick={handleAddToCart} className="opacity-0 group-hover:opacity-100 transition-opacity px-6 py-2 bg-white text-black text-xs tracking-widest">{tr('ADD TO CART')}</button>
                     </div>
                  ))}
               </div>
            </div>
          </>
        )}
        {page === 'collections' && (
            <div className={`${isModal ? 'p-16' : 'p-8'} mx-auto w-full`} style={{ maxWidth: `${siteMaxWidth}px` }}>
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
               <div className={`grid gap-4 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-1' : gridColsClass('sm2')}`}>
                  {filteredProducts.map((p: any) => (
                     <div key={p.id} className="group cursor-pointer relative aspect-square border p-4 flex flex-col items-center justify-center" style={{ backgroundColor: cardBg, borderColor }} onClick={() => navigateToProduct(p.id)}>
                        {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover mb-8" alt={p.name} /> : <ImageIcon className="w-16 h-16 opacity-10 mb-8" />}
                        <h4 className="font-serif text-2xl mb-2 group-hover:text-white transition-colors" style={{ color: primaryColor }}>{p.name}</h4>
                        <p className="text-white/50 tracking-widest text-sm mb-6">{p.price} MAD</p>
                        <button onClick={handleAddToCart} className="opacity-0 group-hover:opacity-100 transition-opacity px-6 py-2 bg-white text-black text-xs tracking-widest">{tr('ADD TO CART')}</button>
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
           <div className={`${isModal ? 'p-16' : 'p-8'} mx-auto w-full`} style={{ maxWidth: `${pdpMaxWidth}px` }}>
              {storeProducts.filter(p => p.id === activeProductId).map(p => (
                 <div key={p.id} className={`flex gap-16 ${previewDevice === 'mobile' && !isModal ? 'flex-col' : 'flex-col md:flex-row'}`} style={{ '--pdp-img-pct': `${pdpImageWidth}%` } as any}>
                    <div className="pdp-img-col flex-1 bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative" style={{ aspectRatio: pdpImageAspect }}>
                       {(selectedColor && p.colorImages?.[selectedColor]) ? <img src={p.colorImages[selectedColor]} className="w-full h-full object-cover absolute inset-0" alt={p.name} /> : (p.image ? <img src={p.image} className="w-full h-full object-cover absolute inset-0" alt={p.name} /> : <ImageIcon className="w-20 h-20 opacity-10" />)}
                    </div>
                    <div className="pdp-details-col flex-1 flex flex-col justify-center">
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
                             <CheckoutForm
                                 storeIsAr={typeof storeLang !== 'undefined' ? storeLang === 'ar' : storeIsAr}
                                 storeLang={storeLang}
                                 onSubmit={submitGlobalOrder}
                                 product={typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId)}
                                 quantity={typeof quantity !== 'undefined' ? quantity : 1}
                                 disabled={((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.colors?.length > 0 && !selectedColor) || ((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.sizes?.length > 0 && !selectedSize)}
                                 requireAccount={requireAccountToOrder}
                                 isAuthenticated={!!customerUser}
                                 onRequestLogin={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                                 selectedColor={selectedColor}
                                 selectedSize={selectedSize}
                              />
                          </div>
                       ) : (
                          <div className="flex gap-4">
                             {(buyMode === 'cart' || buyMode === 'both') && (
                                <button onClick={handleAddToCart} disabled={((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize))} className={`w-max px-12 py-4 border border-white/20 text-white text-xs tracking-widest hover:bg-white/5 transition-colors ${((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize)) ? ' opacity-50 cursor-not-allowed' : ''}`}>{tr('ADD TO CART')}</button>
                             )}
                             {(buyMode === 'direct' || buyMode === 'both') && (
                                <button onClick={() => buyNowAsPopup ? setQuickBuyContext({ product: p, quantity, selectedColor, selectedSize, setPage }) : setPage('checkout')} disabled={((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize))} className={`w-max px-12 py-4 bg-white text-black text-xs tracking-widest hover:bg-gray-200 transition-colors ${((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize)) ? ' opacity-50 cursor-not-allowed' : ''}`}>{tr('BUY NOW')}</button>
                             )}
                          </div>
                       )}
                       <PdpTrustBadges />
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
                    <CheckoutForm
                                 storeIsAr={typeof storeLang !== 'undefined' ? storeLang === 'ar' : storeIsAr}
                                 storeLang={storeLang}
                                 onSubmit={submitGlobalOrder}
                                 product={typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId)}
                                 quantity={typeof quantity !== 'undefined' ? quantity : 1}
                                 disabled={((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.colors?.length > 0 && !selectedColor) || ((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.sizes?.length > 0 && !selectedSize)}
                                 requireAccount={requireAccountToOrder}
                                 isAuthenticated={!!customerUser}
                                 onRequestLogin={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                                 selectedColor={selectedColor}
                                 selectedSize={selectedSize}
                              />
                 </div>
              </div>
           </div>
        )}
        {page === 'success' && (
           <div className={`${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full text-center flex flex-col items-center justify-center min-h-[400px] py-20`}>
              <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-green-600 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-900/50 relative">
                 <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-10" style={{ animationDuration: '3s' }}></div>
                 <CheckCircle className="w-12 h-12 relative z-10" />
              </div>
              <h2 className="text-4xl font-serif mb-3 text-white tracking-wide flex items-center gap-2 justify-center">
                  {storeIsAr ? 'تم تأكيد طلبك بنجاح' : 'Commande Confirmée !'} <Sparkles className="w-8 h-8 text-amber-500" />
              </h2>
              <p className="text-[#888] text-lg max-w-md mx-auto leading-relaxed mb-8 font-light">
                 {storeIsAr 
                   ? "تهانينا! لقد تلقينا طلبك بنجاح. فريقنا يقوم الآن بتجهيزه بعناية. سيتم التواصل معك قريباً لتأكيد تفاصيل الشحن."
                   : "Félicitations ! Nous avons bien reçu votre commande. Notre équipe la prépare avec soin et vous contactera très prochainement."}
              </p>
              
              <div className="flex items-center justify-center gap-6 mb-10 text-[#666] text-sm font-medium tracking-wider">
                 <div className="flex flex-col items-center gap-2"><Package className="w-6 h-6 text-[#b48a44]" /> <span>{storeIsAr ? 'تجهيز الطلب' : 'PRÉPARATION'}</span></div>
                 <div className="w-12 h-px bg-[#333]"></div>
                 <div className="flex flex-col items-center gap-2"><Truck className="w-6 h-6 text-[#b48a44]" /> <span>{storeIsAr ? 'شحن سريع' : 'EXPÉDITION'}</span></div>
              </div>

              <button onClick={() => setPage('home')} className="px-10 py-4 border border-white/20 text-white text-xs tracking-widest hover:bg-white/5 transition-colors">
                 {storeIsAr ? "العودة للرئيسية" : "RETOUR"}
              </button>
           </div>
        )}
      </div>
      <BottomNavBar page={page} setPage={setPage} />
    </div>
  );
  };

  const LayoutPlayful = ({ isModal = false, page, setPage, activeProductId, navigateToProduct, buyMode, categories, activeCategory, setActiveCategory, filteredProducts, sortBy, setSortBy, setIsCartOpen, submitGlobalOrder, storeProducts }: any) => {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);

    const PLAYFUL_PASTELS = ['#FFE5EC', '#E0F2FE', '#FEF3C7', '#DCFCE7', '#F3E8FF', '#FFEDD5'];
    const MobileProductCard = ({ p, idx }: any) => (
       <div className="group cursor-pointer" onClick={() => navigateToProduct(p.id)}>
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-2 flex items-center justify-center" style={{ backgroundColor: PLAYFUL_PASTELS[idx % PLAYFUL_PASTELS.length] }}>
             <span className="absolute top-2.5 left-2.5 bg-white text-slate-800 text-[8px] font-black uppercase px-2 py-1 rounded-full shadow-sm">{storeIsAr ? 'جديد' : 'New'}</span>
             {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover" alt={p.name} /> : <ImageIcon className="w-10 h-10 opacity-20" />}
             <button onClick={(e) => { e.stopPropagation(); navigateToProduct(p.id); }} className="absolute bottom-2.5 right-2.5 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                <Plus className="w-4 h-4 text-slate-700" />
             </button>
          </div>
          <h4 className="font-bold text-xs text-slate-800 truncate px-0.5">{p.name}</h4>
          <p className="text-xs font-black px-0.5" style={{ color: primaryColor }}>{p.price} MAD</p>
       </div>
    );

    return (
    <div className={`w-full min-h-full bg-white text-slate-900 ${fontFamily} flex flex-col`}>
      <div className={`p-4 mx-4 mt-4 bg-slate-100 rounded-full flex justify-between items-center ${previewDevice === 'mobile' && !isModal ? 'flex-col gap-4 rounded-3xl' : 'flex-col md:flex-row gap-4 rounded-3xl md:rounded-full'}`}>
         <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <LogoEditor onClick={() => setPage('home')} className="text-2xl font-black tracking-tight px-4" style={{ color: primaryColor }} />
            <MobileMenuButton />
         </div>
         <div className={`flex gap-2 text-sm font-bold ${previewDevice === 'mobile' && !isModal ? 'hidden' : 'hidden md:flex'}`}>
            {storePages.map(p => (
               <NavLink key={p.id} p={p} currentPage={page} setPage={setPage} />
            ))}
         </div>
         <div className="p-2 bg-white rounded-full shadow-sm mr-1">
            <HeaderIconsCluster variant="light" />
         </div>
      </div>
      <MobileNavPanel page={page} setPage={setPage} />

      <div className="flex-1 overflow-y-auto pt-6 pb-16 md:pb-0">
        {page === 'home' && (
          <>
            <div className="px-4">
               <HeroBackgroundEditor className="rounded-[2rem] flex flex-col items-center justify-center text-center p-8 bg-cover relative overflow-hidden" style={{ backgroundImage: `url(${heroImage})`, height: `${isModal ? heroHeight + 50 : heroHeight - 150}px`, backgroundPosition: `${heroImagePosX}% ${heroImagePosY}%` }}>
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
                  <div className="relative z-10 flex flex-col items-center p-8 bg-white/90 rounded-[2rem] shadow-xl border-4 border-white">
                     <h1 className={`${isModal ? 'text-6xl' : 'text-4xl'} font-black tracking-tight mb-2`} style={{ color: primaryColor }}>{storeLang === 'ar' ? 'مرح وحيوية!' : storeLang === 'en' ? 'Fun & Fresh!' : 'Fun & Frais !'}</h1>
                     <p className="text-slate-600 font-medium mb-6 max-w-sm">{storeLang === 'ar' ? 'ملونة ومريحة وصُنعت للمرح.' : storeLang === 'en' ? 'Colorful, comfortable, and made for play.' : 'Coloré, confortable, et fait pour jouer.'}</p>
                     <button onClick={() => setPage('collections')} className="px-8 py-4 text-white font-black tracking-wide text-sm hover:scale-110 transition-transform rounded-full shadow-lg" style={{ backgroundColor: primaryColor }}>{storeLang === 'ar' ? 'تسوق الآن 🎈' : storeLang === 'en' ? "LET'S SHOP 🎈" : 'ON Y VA 🎈'}</button>
                  </div>
               </HeroBackgroundEditor>
            </div>
            <div className={`${isModal ? 'p-16' : 'p-6'} mx-auto w-full`} style={{ maxWidth: `${siteMaxWidth}px` }}>
               <h3 className="text-2xl md:text-3xl font-black text-center mb-6 md:mb-10 text-slate-800">{storeLang === 'ar' ? 'وصل حديثاً ✨' : storeLang === 'en' ? 'New Arrivals ✨' : 'Nouveautés ✨'}</h3>
               <div className="md:hidden grid grid-cols-2 gap-3">
                  {storeProducts.map((p: any, idx: number) => (
                     <MobileProductCard key={p.id} p={p} idx={idx} />
                  ))}
               </div>
               <div className={`hidden md:grid gap-6 ${isModal ? gridColsClass('lg4') : gridColsClass('sm2')}`}>
                  {storeProducts.map((p: any, idx: number) => (
                     cardStyle === 'trend' ? (
                        <ProductCardTrend key={p.id} p={p} idx={idx} onClick={() => navigateToProduct(p.id)} />
                     ) : (
                     <div key={p.id} className="group cursor-pointer bg-slate-50 p-4 rounded-3xl hover:bg-slate-100 transition-colors border-2 border-transparent hover:border-current" style={{ borderColor: primaryColor }} onClick={() => navigateToProduct(p.id)}>
                        <div className="aspect-square mb-4 overflow-hidden relative rounded-2xl shadow-sm border flex items-center justify-center" style={{ backgroundColor: cardBg, borderColor, borderRadius: getCardRadius() }}>
                           <CardBadge text={p.category} />
                           {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover" alt={p.name} /> : <ImageIcon className="w-12 h-12 opacity-10" />}
                           <div className={`absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
                              <button onClick={handleAddToCart} className="px-6 py-3 text-white text-xs font-black uppercase tracking-wider rounded-full shadow-xl hover:scale-105 transition-transform" style={btnStyle}>{tr('Add to cart')}</button>
                           </div>
                        </div>
                        <h4 className="font-bold text-base text-center text-slate-700">{p.name}</h4>
                        <p className="text-center font-black mt-1" style={{ color: primaryColor }}>{p.price} MAD</p>
                     </div>
                     )
                  ))}
               </div>
            </div>
          </>
        )}
        {page === 'collections' && (
            <div className={`${isModal ? 'p-16' : 'p-6'} mx-auto w-full`} style={{ maxWidth: `${siteMaxWidth}px` }}>
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
               <div className="md:hidden grid grid-cols-2 gap-3">
                  {filteredProducts.map((p: any, idx: number) => (
                     <MobileProductCard key={p.id} p={p} idx={idx} />
                  ))}
               </div>
               <div className={`hidden md:grid gap-6 ${isModal ? gridColsClass('lg4') : gridColsClass('sm2')}`}>
                  {filteredProducts.map((p: any, idx: number) => (
                     cardStyle === 'trend' ? (
                        <ProductCardTrend key={p.id} p={p} idx={idx} onClick={() => navigateToProduct(p.id)} />
                     ) : (
                     <div key={p.id} className="group cursor-pointer bg-slate-50 p-4 rounded-3xl hover:bg-slate-100 transition-colors border-2 border-transparent hover:border-current" style={{ borderColor: primaryColor }} onClick={() => navigateToProduct(p.id)}>
                        <div className="aspect-square mb-4 overflow-hidden relative rounded-2xl shadow-sm border flex items-center justify-center" style={{ backgroundColor: cardBg, borderColor, borderRadius: getCardRadius() }}>
                           <CardBadge text={p.category} />
                           {getCoverImage(p) ? <img src={getCoverImage(p) as string} className="w-full h-full object-cover" alt={p.name} /> : <ImageIcon className="w-12 h-12 opacity-10" />}
                           <div className={`absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
                              <button onClick={handleAddToCart} className="px-6 py-3 text-white text-xs font-black uppercase tracking-wider rounded-full shadow-xl hover:scale-105 transition-transform" style={btnStyle}>{tr('Add to cart')}</button>
                           </div>
                        </div>
                        <h4 className="font-bold text-base text-center text-slate-700">{p.name}</h4>
                        <p className="text-center font-black mt-1" style={{ color: primaryColor }}>{p.price} MAD</p>
                     </div>
                     )
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
           <div className={`${isModal ? 'p-16' : 'p-8'} mx-auto w-full`} style={{ maxWidth: `${pdpMaxWidth}px` }}>
              {storeProducts.filter(p => p.id === activeProductId).map(p => (
                 <div key={p.id} className={`flex gap-12 bg-slate-50 p-8 rounded-[3rem] ${previewDevice === 'mobile' && !isModal ? 'flex-col' : 'flex-col md:flex-row'}`} style={{ '--pdp-img-pct': `${pdpImageWidth}%` } as any}>
                    <div className="pdp-img-col flex-1 bg-white rounded-[2rem] border-4 border-slate-100 flex items-center justify-center shadow-xl overflow-hidden relative" style={{ aspectRatio: pdpImageAspect }}>
                       {(selectedColor && p.colorImages?.[selectedColor]) ? <img src={p.colorImages[selectedColor]} className="w-full h-full object-cover absolute inset-0" alt={p.name} /> : (p.image ? <img src={p.image} className="w-full h-full object-cover absolute inset-0" alt={p.name} /> : <ImageIcon className="w-20 h-20 opacity-10" />)}
                    </div>
                    <div className="pdp-details-col flex-1 flex flex-col justify-center px-4">
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
                             <h4 className="text-xl font-black text-slate-800 mb-2">{storeLang === 'ar' ? 'الدفع 🎁' : storeLang === 'en' ? 'Yay! Checkout 🎁' : 'Youpi ! Commande 🎁'}</h4>
                             <input type="text" placeholder={storeLang === 'ar' ? 'الاسم الكامل' : storeLang === 'en' ? 'Your Name' : 'Votre nom'} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-full focus:outline-none focus:border-current text-base font-bold" style={{ '--tw-ring-color': primaryColor } as React.CSSProperties} />
                             <input type="text" placeholder={storeLang === 'ar' ? 'رقم الهاتف' : storeLang === 'en' ? 'Phone Number' : 'Numéro de Téléphone'} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-full focus:outline-none focus:border-current text-base font-bold" style={{ '--tw-ring-color': primaryColor } as React.CSSProperties} />
                             <input type="text" placeholder={storeLang === 'ar' ? 'عنوان التوصيل' : storeLang === 'en' ? 'Where to send?' : 'Adresse de livraison ?'} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-full focus:outline-none focus:border-current text-base font-bold" style={{ '--tw-ring-color': primaryColor } as React.CSSProperties} />
                             <button onClick={(e) => submitGlobalOrder(typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId), typeof quantity !== 'undefined' ? quantity : 1, e)} disabled={((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize))} className={`w-full py-5 text-white font-black uppercase tracking-widest text-lg hover:scale-105 transition-transform rounded-full shadow-xl mt-4 ${((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize)) ? ' opacity-50 cursor-not-allowed' : ''}`} style={{ backgroundColor: primaryColor }}>{storeLang === 'ar' ? 'أرسل الطلب! 🚀' : storeLang === 'en' ? 'Send it to me! 🚀' : 'Envoyez-le moi ! 🚀'}</button>
                          </div>
                       ) : (
                          <div className="flex gap-4">
                             {(buyMode === 'cart' || buyMode === 'both') && (
                                <button onClick={handleAddToCart} className="flex-1 px-8 py-5 text-white font-black uppercase tracking-widest text-lg hover:scale-105 transition-transform rounded-full shadow-xl" style={{ backgroundColor: '#f43f5e' }}>{storeLang === 'ar' ? 'السلة 🛒' : storeLang === 'en' ? 'Cart 🛒' : 'Panier 🛒'}</button>
                             )}
                             {(buyMode === 'direct' || buyMode === 'both') && (
                                <button onClick={() => buyNowAsPopup ? setQuickBuyContext({ product: p, quantity, selectedColor, selectedSize, setPage }) : setPage('checkout')} className="flex-1 px-8 py-5 text-white font-black uppercase tracking-widest text-lg hover:scale-105 transition-transform rounded-full shadow-xl" style={{ backgroundColor: primaryColor }}>{storeLang === 'ar' ? 'اشتري الآن 🎈' : storeLang === 'en' ? 'Buy Now 🎈' : 'Achetez maintenant 🎈'}</button>
                             )}
                          </div>
                       )}
                       <PdpTrustBadges />
                    </div>
                 </div>
              ))}
           </div>
        )}
        {page === 'checkout' && (
           <div className={`${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full`}>
              <div className="bg-slate-50 p-10 rounded-[3rem] shadow-sm border-4 border-white">
                 <h2 className="text-3xl font-black mb-6 text-center text-slate-800">{storeLang === 'ar' ? 'الدفع 🎁' : storeLang === 'en' ? 'Yay! Checkout 🎁' : 'Youpi ! Commande 🎁'}</h2>
                 <div className="space-y-4">
                    <CheckoutForm
                                 storeIsAr={typeof storeLang !== 'undefined' ? storeLang === 'ar' : storeIsAr}
                                 storeLang={storeLang}
                                 onSubmit={submitGlobalOrder}
                                 product={typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId)}
                                 quantity={typeof quantity !== 'undefined' ? quantity : 1}
                                 disabled={((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.colors?.length > 0 && !selectedColor) || ((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.sizes?.length > 0 && !selectedSize)}
                                 customSubmitText={storeIsAr ? "أرسل الطلب! 🚀" : "Send it to me! 🚀"}
                                 requireAccount={requireAccountToOrder}
                                 isAuthenticated={!!customerUser}
                                 onRequestLogin={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                                 selectedColor={selectedColor}
                                 selectedSize={selectedSize}
                              />
                 </div>
              </div>
           </div>
        )}
        {page === 'success' && (
           <div className={`${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full text-center flex flex-col items-center justify-center min-h-[400px]`}>
              <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-green-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-200/50 relative border-4 border-white">
                 <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-30" style={{ animationDuration: '3s' }}></div>
                 <CheckCircle className="w-12 h-12 relative z-10" />
              </div>
              <h2 className="text-5xl font-black mb-3 text-slate-800 tracking-tight flex items-center gap-2 justify-center" style={{ color: primaryColor }}>
                  {storeIsAr ? 'تم تأكيد طلبك بنجاح' : 'Commande Confirmée !'} <Sparkles className="w-10 h-10 text-amber-400" />
              </h2>
              <p className="text-slate-500 text-xl font-bold max-w-md mx-auto leading-relaxed mb-8">
                 {storeIsAr 
                   ? "تهانينا! لقد تلقينا طلبك بنجاح. فريقنا يقوم الآن بتجهيزه بعناية فائقة. سيتم التواصل معك قريباً لتأكيد تفاصيل الشحن."
                   : "Félicitations ! Nous avons bien reçu votre commande. Notre équipe la prépare avec soin et vous contactera très prochainement pour l'expédition."}
              </p>
              
              <div className="flex items-center justify-center gap-6 mb-10 text-slate-400 text-sm font-bold">
                 <div className="flex flex-col items-center gap-2"><Package className="w-8 h-8 text-indigo-400" /> <span>{storeIsAr ? 'تجهيز الطلب' : 'Préparation'}</span></div>
                 <div className="w-12 h-2 rounded-full bg-slate-100"></div>
                 <div className="flex flex-col items-center gap-2"><Truck className="w-8 h-8 text-emerald-400" /> <span>{storeIsAr ? 'شحن سريع' : 'Expédition'}</span></div>
              </div>

              <button onClick={() => setPage('home')} className="mt-8 px-10 py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform shadow-lg">
                 {storeIsAr ? "العودة للمرح" : "Retour au magasin"}
              </button>
           </div>
        )}
      </div>
      <BottomNavBar page={page} setPage={setPage} />
    </div>
  );
  };

  const StorePreviewWrapper = ({ isModal = false, initialProductId = null }: any) => {
    const page = previewPage;
    const setPage = setPreviewPage;
    const activeProductId = previewActiveProductId;
    const setActiveProductId = setPreviewActiveProductId;
    const [activeCategory, setActiveCategory] = useState('All');
    const [sortBy, setSortBy] = useState('featured');

    // Only jump to a specific product when the caller actually asks for one
    // (e.g. "preview this product"), not on every re-render.
    useEffect(() => {
       if (initialProductId) {
          setPreviewActiveProductId(initialProductId);
          setPreviewPage('product');
       }
       // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialProductId]);

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

    const handleGlobalSubmit = (p: any, q: any, e?: any) => {
       submitGlobalOrder(p, q, e);
       setPage('success');
    };

    const props = { isModal, page, setPage, activeProductId, navigateToProduct, buyMode, categories, activeCategory, setActiveCategory, filteredProducts, sortBy, setSortBy, storeLang, isCartOpen, setIsCartOpen, submitGlobalOrder: handleGlobalSubmit, storeProducts, primaryColor, secondaryColor, buttonStyle, fontFamily };


  
  const LayoutClement = ({ isModal = false, page, setPage, activeProductId, navigateToProduct, buyMode, categories, activeCategory, setActiveCategory, filteredProducts, sortBy, setSortBy, setIsCartOpen, submitGlobalOrder, storeProducts }: any) => {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);

    return (
    <div className={`w-full min-h-full bg-[#e8e2d7] text-[#1a1a1a] ${fontFamily} flex flex-col`}>
      <div className={`px-8 py-6 flex justify-between items-center ${previewDevice === 'mobile' && !isModal ? 'flex-col gap-4' : 'flex-col md:flex-row gap-4 md:gap-0'}`}>
         <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <LogoEditor onClick={() => setPage('home')} className="text-2xl font-black uppercase tracking-widest text-[#1a1a1a]" style={{ color: primaryColor }} />
            <MobileMenuButton />
         </div>
         <div className={`flex gap-8 text-sm font-medium text-[#4a4a4a] ${previewDevice === 'mobile' && !isModal ? 'hidden' : 'hidden md:flex'}`}>
            {storePages.map(p => (
               <NavLink key={p.id} p={p} currentPage={page} setPage={setPage} />
            ))}
         </div>
         <HeaderIconsCluster variant="light" />
      </div>
      <MobileNavPanel bgClass="bg-[#e8e2d7]" textClass="text-[#1a1a1a]" page={page} setPage={setPage} />

      <div className="flex-1 overflow-y-auto bg-white pb-16 md:pb-0">
        {page === 'home' && (
          <>
            <div className="w-full bg-[#e8e2d7]">
               <HeroBackgroundEditor className="w-full bg-cover relative flex items-center" style={{ backgroundImage: `url(${heroImage})`, height: `${isModal ? heroHeight + 150 : heroHeight}px`, backgroundPosition: `${heroImagePosX}% ${heroImagePosY}%` }}>
                  <div className="max-w-2xl px-12 md:px-24">
                     <EditableText as="h1" text={heroTitle} onTextChange={setHeroTitle} isLiveStore={isLiveStore} className="text-5xl md:text-7xl font-serif italic tracking-wide text-[#2c2c2c] mb-6 leading-tight" style={{ fontFamily: 'Georgia, serif' }} styleKey="heroTitle" />
                  </div>
               </HeroBackgroundEditor>
            </div>

            <div className="py-16 px-8 mx-auto bg-white" style={{ maxWidth: `${siteMaxWidth}px` }}>
               <div className="flex flex-col items-center mb-12">
                  <EditableText as="h2" text={homeCollectionsTitle} onTextChange={setHomeCollectionsTitle} isLiveStore={isLiveStore} className="text-2xl font-black uppercase text-[#1a1a1a] mb-8 tracking-wider" styleKey="homeCollectionsTitle" />
                  
                  {/* Categories */}
                  <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-[#4a4a4a]">
                     {categories.map((c: string) => (
                        <button key={tr(c)} onClick={() => setActiveCategory(c)} className={`pb-1 border-b-2 transition-colors ${activeCategory === c ? 'border-[#1a1a1a] text-[#1a1a1a]' : 'border-transparent hover:border-slate-300'}`}>
                           {c === 'All' ? allCollectionsTitle : tr(c)}
                        </button>
                     ))}
                  </div>
               </div>

               <div className={`grid ${previewDevice === 'mobile' && !isModal ? 'grid-cols-2' : gridColsClass('md4')} gap-6`}>
                  {filteredProducts.map((p: any, idx: number) => (
                     cardStyle === 'trend' ? (
                        <ProductCardTrend key={p.id} p={p} idx={idx} onClick={() => navigateToProduct(p.id)} />
                     ) : (
                     <div key={p.id} className="group cursor-pointer" onClick={() => navigateToProduct(p.id)}>
                        <div className="aspect-[3/4] mb-4 relative overflow-hidden flex items-center justify-center border" style={{ backgroundColor: cardBg, borderColor, borderRadius: getCardRadius() }}>
                           <CardBadge text={p.category} />
                           <img src={getCoverImage(p)} alt={p.name} className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                           <button className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 transition-colors" onClick={(e) => { e.stopPropagation(); }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                           </button>
                        </div>
                        <div className="text-left">
                           <h3 className="text-[13px] font-black uppercase tracking-widest text-[#1a1a1a] mb-1">{p.name}</h3>
                           <p className="text-[11px] text-[#666] mb-2">{p.category}</p>
                           <p className="text-[13px] font-bold text-[#1a1a1a]">{storeIsAr ? 'ابتداءً من' : 'à partir de'} {p.price} MAD</p>
                        </div>
                     </div>
                     )
                  ))}
               </div>
            </div>
          </>
        )}

        {page === 'product' && activeProductId && (() => {
           const product = storeProducts.find((p: any) => p.id === activeProductId);
           if (!product) return null;
           return (
           <div className="p-8 mx-auto min-h-[600px] my-8 flex flex-col md:flex-row gap-12" style={{ backgroundColor: cardBg, maxWidth: `${pdpMaxWidth}px`, '--pdp-img-pct': `${pdpImageWidth}%` } as any}>
              <div className="pdp-img-col w-full md:w-1/2 flex gap-4">
                 <div className="w-full bg-[#f5f1e9] rounded-sm overflow-hidden flex items-center justify-center" style={{ aspectRatio: pdpImageAspect }}>
                    <img src={getCoverImage(product)} className="w-full h-full object-cover mix-blend-multiply" alt="Product" />
                 </div>
              </div>
              <div className="pdp-details-col w-full md:w-1/2 pt-4">
                 <h2 className="text-3xl font-black uppercase tracking-widest text-[#1a1a1a] mb-2">{product.name}</h2>
                 <p className="text-xl font-bold text-[#444] mb-8">{product.price} MAD</p>
                 
                 <div className="space-y-6 mb-8">
                    {product.colors?.length > 0 && (
                       <div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-[#666] mb-3 block">{storeIsAr ? 'لون' : 'Couleur'}</span>
                          <div className="flex gap-2">
                             {product.colors.map((c: string) => (
                                <button key={tr(c)} onClick={() => setSelectedColor(c)} className={`w-8 h-8 rounded-full border-2 transition-transform ${selectedColor === c ? 'border-[#1a1a1a] scale-110' : 'border-transparent hover:scale-105 shadow-sm'}`} style={{ backgroundColor: c }} />
                             ))}
                          </div>
                       </div>
                    )}
                    {product.sizes?.length > 0 && (
                       <div>
                          <span className="text-[11px] font-bold uppercase tracking-widest text-[#666] mb-3 block">{storeIsAr ? 'المقاس' : 'Taille'}</span>
                          <div className="flex flex-wrap gap-2">
                             {product.sizes.map((s: string) => (
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
                    <button onClick={handleAddToCart} disabled={((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize))} className={`w-full h-14 bg-[#1a1a1a] text-white font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors mb-4 ${((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize)) ? ' opacity-50 cursor-not-allowed' : ''}`}>{storeIsAr ? 'أضف للسلة' : 'Ajouter au panier'}</button>
                 )}
                 {(buyMode === 'both' || buyMode === 'direct') && (
                    <button onClick={() => buyNowAsPopup ? setQuickBuyContext({ product: p, quantity, selectedColor, selectedSize, setPage }) : setPage('checkout')} disabled={((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize))} className={`w-full h-14 bg-[#f5f1e9] text-[#1a1a1a] font-bold uppercase tracking-widest text-xs hover:bg-[#e8e2d7] transition-colors ${((p.colors?.length > 0 && !selectedColor) || (p.sizes?.length > 0 && !selectedSize)) ? ' opacity-50 cursor-not-allowed' : ''}`}>{storeIsAr ? 'اشتري الآن' : 'Acheter Maintenant'}</button>
                 )}
                 <PdpTrustBadges />
              </div>
           </div>
         );
        })()}

        {page === 'checkout' && (
           <div className="p-8 max-w-2xl mx-auto my-8 bg-white border border-[#eee] rounded-sm">
              <h2 className="text-2xl font-black uppercase tracking-widest text-[#1a1a1a] mb-8 text-center">{storeIsAr ? 'شراء سريع' : 'Achat Express'}</h2>
              <div className="space-y-4">
                 <CheckoutForm
                                 storeIsAr={typeof storeLang !== 'undefined' ? storeLang === 'ar' : storeIsAr}
                                 storeLang={storeLang}
                                 onSubmit={submitGlobalOrder}
                                 product={typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId)}
                                 quantity={typeof quantity !== 'undefined' ? quantity : 1}
                                 disabled={((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.colors?.length > 0 && !selectedColor) || ((typeof p !== 'undefined' ? p : storeProducts.find((prod) => prod.id === activeProductId))?.sizes?.length > 0 && !selectedSize)}
                                 requireAccount={requireAccountToOrder}
                                 isAuthenticated={!!customerUser}
                                 onRequestLogin={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                                 selectedColor={selectedColor}
                                 selectedSize={selectedSize}
                              />
              </div>
           </div>
        )}

        {page === 'success' && (
           <div className="p-16 max-w-2xl mx-auto my-8 bg-white border border-[#eee] text-center flex flex-col items-center justify-center shadow-sm min-h-[400px]">
              <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-green-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-200/50 relative">
                 <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
                 <CheckCircle className="w-12 h-12 relative z-10" />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-widest text-[#1a1a1a] mb-4 flex items-center gap-2 justify-center">
                  {storeIsAr ? 'تم تأكيد طلبك' : 'Commande Confirmée !'} <Sparkles className="w-6 h-6 text-amber-400" />
              </h2>
              <p className="text-[#666] text-lg max-w-md mx-auto leading-relaxed mb-8">
                 {storeIsAr 
                   ? "تهانينا! لقد تلقينا طلبك بنجاح. فريقنا يقوم الآن بتجهيزه بعناية. سيتم التواصل معك قريباً لتأكيد تفاصيل الشحن."
                   : "Félicitations ! Nous avons bien reçu votre commande. Notre équipe la prépare avec soin et vous contactera très prochainement pour l'expédition."}
              </p>
              
              <div className="flex items-center justify-center gap-6 mb-10 text-[#888] text-sm font-semibold uppercase tracking-wider">
                 <div className="flex flex-col items-center gap-2"><Package className="w-6 h-6 text-[#1a1a1a]" /> <span>{storeIsAr ? 'تجهيز الطلب' : 'Préparation'}</span></div>
                 <div className="w-12 h-px bg-[#eee]"></div>
                 <div className="flex flex-col items-center gap-2"><Truck className="w-6 h-6 text-[#1a1a1a]" /> <span>{storeIsAr ? 'شحن سريع' : 'Expédition'}</span></div>
              </div>

              <button onClick={() => setPage('home')} className="px-8 py-3 bg-[#f5f1e9] text-[#1a1a1a] font-bold uppercase tracking-widest text-xs hover:bg-[#e8e2d7] transition-colors">
                 {storeIsAr ? "العودة للرئيسية" : "Retour à l'accueil"}
              </button>
           </div>
        )}

      </div>
      <ThemeFooter setPage={setPage} />
      <BottomNavBar page={page} setPage={setPage} />
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
               <NavLink key={p.id} p={p} currentPage={page} setPage={setPage} />
            ))}
         </div>
         <MobileMenuButton colorClass="text-slate-800" />
         {/* Logo - Center */}
         <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
            <LogoEditor onClick={() => setPage('home')} className={`text-2xl font-black tracking-tighter text-slate-900 ${fontFamily}`} style={{ color: primaryColor }} />
         </div>
         {/* Icons - Right */}
         <HeaderIconsCluster variant="light" />
      </div>
      <MobileNavPanel page={page} setPage={setPage} />

      {page === 'home' && (
         <div className="flex-1 flex flex-col pb-20">
            {/* Lookbook Hero */}
            <div className={`w-full bg-[#f8f9fa] flex ${previewDevice === 'mobile' && !isModal ? 'flex-col pt-12' : 'flex-row items-center'} min-h-[500px] relative overflow-hidden`}>
               <div className={`z-10 ${previewDevice === 'mobile' && !isModal ? 'px-8 pb-12 text-center' : 'pl-24 pr-8 py-16 w-1/2 text-left'}`}>
                  <h1 className={`text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-4 uppercase`} style={{ color: primaryColor }}>{heroTitle || (storeLang === 'ar' ? 'لوك بوك' : storeLang === 'en' ? 'LOOKBOOK' : 'LOOKBOOK')}</h1>
                  <p className="text-sm text-slate-500 mb-8 max-w-md font-medium leading-relaxed">{heroSubtitle || (storeLang === 'ar' ? 'أحدث إطلالات الربيع. تسوق التشكيلة' : storeLang === 'en' ? 'New Spring drops from Over. Shop the Collection' : 'Nouvelles pièces de printemps. Découvrez la collection')}</p>
                  <button className="px-8 py-3 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors rounded-full" style={btnStyle}>{heroButtonText || (storeLang === 'ar' ? 'تسوق التشكيلة' : storeLang === 'en' ? 'Shop Collection' : 'Découvrir la collection')}</button>
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
            <div className="mx-auto w-full px-4 py-8" style={{ maxWidth: `${siteMaxWidth}px` }}>
               <div className="flex items-center justify-between mb-12">
                  <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{storeLang === 'ar' ? '#وصل_حديثاً' : storeLang === 'en' ? '#New Arrivals' : '#Nouveautés'}</h3>
                  <div className="flex gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden md:flex">
                     <span className="text-slate-900 border-b-2 border-slate-900 pb-1">All</span>
                     <span className="hover:text-slate-900 cursor-pointer">Men</span>
                     <span className="hover:text-slate-900 cursor-pointer">Women</span>
                     <span className="hover:text-slate-900 cursor-pointer">Kids</span>
                  </div>
               </div>
               <div className={`grid gap-x-8 gap-y-12 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-2' : gridColsClass('plain4')}`}>
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
                          <button className="px-8 py-4 text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity" style={btnStyle}>Subscribe</button>
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
         <div className="flex-1 mx-auto w-full px-4 py-16" style={{ maxWidth: `${siteMaxWidth}px` }}>
            <h2 className="text-3xl font-black text-center mb-16 uppercase tracking-tight">{tr(allCollectionsTitle || 'ALL PRODUCTS')}</h2>
            <div className={`grid gap-x-8 gap-y-12 ${previewDevice === 'mobile' && !isModal ? 'grid-cols-2' : gridColsClass('plain4')}`}>
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
            <div className="flex-1 w-full relative" style={{ backgroundColor: cardBg }}>
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
                        <div className="relative flex-1 aspect-[3/4]" style={{ backgroundColor: cardBg }}>
                           <img src={images[0]} className="w-full h-full object-cover" />
                           {/* Tags - conditional on product data */}
                           {(product.isOnSale || product.isNew) && (
                              <div className="absolute top-4 -left-3 flex flex-col gap-2">
                                 {product.isOnSale && <span className="bg-rose-400 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 shadow-sm">SALE</span>}
                                 {product.isNew && <span className="bg-emerald-400 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 shadow-sm">NEW</span>}
                              </div>
                           )}
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
                        
                        {product.reviewCount > 0 && (
                         <div className="flex items-center gap-3 mb-6">
                            <div className="flex text-amber-400">
                               {[...Array(5)].map((_, i) => <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                            </div>
                            <span className="text-[11px] text-slate-400 uppercase font-medium tracking-wide">{product.reviewCount} customers left feedback</span>
                         </div>
                        )}

                        {product.description && (
                         <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-md">
                            {product.description}
                         </p>
                        )}

                        {(product.showStock || product.sku) && (
                         <div className="flex gap-8 mb-8 text-[11px] uppercase tracking-wider font-bold">
                            {product.showStock && <div className="flex gap-2"><span className="text-slate-400">Status:</span> <span className="text-emerald-400">IN STOCK</span></div>}
                            {product.sku && <div className="flex gap-2"><span className="text-slate-400">Article:</span> <span className="text-slate-800">{product.sku}</span></div>}
                         </div>
                        )}

                        <div className="flex items-end gap-4 mb-10">
                           <span className="text-4xl font-black text-slate-900">$\{parseFloat(product.price).toFixed(2)}</span>
                           {product.comparePrice && parseFloat(product.comparePrice) > parseFloat(product.price) && (
                              <span className="text-lg text-slate-400 line-through mb-1">${parseFloat(product.comparePrice).toFixed(2)}</span>
                           )}
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
                        <button onClick={() => setActivePDPTab('description')} className={`pb-4 text-sm tracking-wider font-bold transition-all ${activePDPTab === 'description' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>{storeLang === 'ar' ? 'الوصف' : storeLang === 'en' ? 'Description' : 'Description'}</button>
                        <button onClick={() => setActivePDPTab('reviews')} className={`pb-4 text-sm tracking-wider font-bold transition-all ${activePDPTab === 'reviews' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>{storeLang === 'ar' ? 'التقييمات' : storeLang === 'en' ? 'Reviews' : 'Avis'}</button>
                     </div>
                     <div className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                        {activePDPTab === 'description' ? (
                           <p>{storeLang === 'ar' ? `وصف تفصيلي لـ ${product.name}. هذا المنتج مصنوع من مواد فاخرة تضمن الراحة والمتانة. تصميمه العملي يجعله أساسياً في خزانتك.` : storeLang === 'en' ? `Detailed description about the ${product.name}. This item is crafted from premium materials, ensuring both comfort and durability. Perfect for any occasion, its versatile design makes it a wardrobe essential.` : `Description détaillée de ${product.name}. Cet article est fabriqué à partir de matériaux premium, garantissant confort et durabilité. Parfait pour toute occasion, son design polyvalent en fait un essentiel de la garde-robe.`}</p>
                        ) : (
                           <div className="space-y-6">
                              <div className="flex gap-4">
                                 <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                                 <div>
                                    <h5 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider mb-1">Jane Doe</h5>
                                    <div className="flex text-amber-400 mb-2 w-3 h-3">{'★'.repeat(5)}</div>
                                    <p>{storeLang === 'ar' ? 'أحب هذا المنتج جداً! المقاس مثالي والمظهر رائع.' : storeLang === 'en' ? 'Absolutely love this! Fits perfectly and looks great.' : "J'adore ! La taille est parfaite et le rendu est magnifique."}</p>
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

      {page === 'success' && (
         <div className="flex-1 w-full relative bg-white py-24">
           <div className={`${isModal ? 'p-16 max-w-2xl' : 'p-8'} mx-auto w-full text-center flex flex-col items-center justify-center min-h-[400px]`}>
              <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-green-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-200/50 relative">
                 <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
                 <CheckCircle className="w-12 h-12 relative z-10" />
              </div>
              <h2 className="text-4xl font-black mb-3 text-slate-900 tracking-tight flex items-center gap-2 justify-center">
                  {storeIsAr ? 'تم تأكيد طلبك بنجاح' : 'Commande Confirmée !'} <Sparkles className="w-8 h-8 text-amber-400" />
              </h2>
              <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed mb-8">
                 {storeIsAr 
                   ? "تهانينا! لقد تلقينا طلبك بنجاح. فريقنا يقوم الآن بتجهيزه بعناية. سيتم التواصل معك قريباً لتأكيد تفاصيل الشحن."
                   : "Félicitations ! Nous avons bien reçu votre commande. Notre équipe la prépare avec soin et vous contactera très prochainement."}
              </p>
              
              <div className="flex items-center justify-center gap-6 mb-10 text-slate-400 text-sm font-bold uppercase tracking-wider">
                 <div className="flex flex-col items-center gap-2"><Package className="w-6 h-6 text-slate-900" /> <span>{storeIsAr ? 'تجهيز الطلب' : 'PRÉPARATION'}</span></div>
                 <div className="w-12 h-px bg-slate-200"></div>
                 <div className="flex flex-col items-center gap-2"><Truck className="w-6 h-6 text-slate-900" /> <span>{storeIsAr ? 'شحن سريع' : 'EXPÉDITION'}</span></div>
              </div>

              <button onClick={() => setPage('home')} className="px-10 py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-black transition-colors">
                 {storeIsAr ? "العودة للرئيسية" : "RETOUR À L'ACCUEIL"}
              </button>
           </div>
         </div>
      )}

{/* Footer */}
      <div className="bg-[#f8f9fa] py-16 px-8 text-center text-slate-500 text-xs">
         <LogoEditor className={`text-3xl font-black tracking-tighter text-slate-900 mx-auto mb-8 opacity-20 ${fontFamily}`} style={{ color: primaryColor }} />
         <p>{tr(footerSettings.copyright)}</p>
         <div className="flex justify-center gap-6 mt-6 uppercase tracking-widest text-[10px] font-bold">
            {footerSettings.showTerms && <span className="hover:text-slate-900 cursor-pointer">{tr('Terms of Service')}</span>}
            {footerSettings.showPrivacy && <span className="hover:text-slate-900 cursor-pointer">{tr('Privacy Policy')}</span>}
         </div>
      </div>
      <BottomNavBar page={page} setPage={setPage} />
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
       <div className="store-preview-wrapper min-h-screen w-full relative flex flex-col" onClick={() => setActiveStyleKey(null)}>
          <style>{`
             @media (min-width: 768px) {
                .pdp-img-col { flex: 0 0 var(--pdp-img-pct, 50%) !important; max-width: var(--pdp-img-pct, 50%); }
                .pdp-details-col { flex: 0 0 calc(100% - var(--pdp-img-pct, 50%)) !important; max-width: calc(100% - var(--pdp-img-pct, 50%)); }
             }
          `}</style>
          <Layout />
          {appsConfig && appsConfig['WhatsApp Chat'] && (
             <a href={'https://wa.me/' + appsConfig['WhatsApp Chat'].replace(/[^0-9]/g, '')} target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 z-[998] w-14 h-14 bg-green-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform hover:bg-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.88-.788-1.472-1.761-1.645-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
             </a>
          )}
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
                         style={btnStyle}
                      >
                         <CheckCircle className="w-5 h-5" />
                         {storeIsAr ? 'إتمام الطلب' : 'Valider la commande'}
                      </button>
                   </div>
                </div>
             </div>
          )}
          {isAuthOpen && (
             <div className="fixed inset-0 z-[999] flex justify-end bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsAuthOpen(false)}>
                <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col transform transition-transform" onClick={e => e.stopPropagation()}>
                   <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <h2 className="text-xl font-black uppercase tracking-tight">
                         {authMode === 'login' ? (storeLang === 'ar' ? 'تسجيل الدخول' : storeLang === 'en' ? 'Sign In' : 'Se connecter') : (storeLang === 'ar' ? 'إنشاء حساب' : storeLang === 'en' ? 'Create Account' : 'Créer un compte')}
                      </h2>
                      <button onClick={() => setIsAuthOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all">
                         <X className="w-4 h-4" />
                      </button>
                   </div>
                   <div className="flex-1 overflow-y-auto p-6">
                      <AuthForm
                         storeIsAr={storeIsAr}
                         storeLang={storeLang}
                         mode={authMode}
                         onModeChange={setAuthMode}
                         storeDomain={customDomain || `${storeName.toLowerCase().replace(/\s+/g, '')}.beyacreative.com`}
                         storeName={storeName}
                         onAuthed={(user: any, profile: any) => { setCustomerUser(user); setCustomerProfile(profile); setIsAuthOpen(false); }}
                      />
                   </div>
                </div>
             </div>
          )}
          {quickBuyContext && (
             <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setQuickBuyContext(null)}>
                <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl" onClick={e => e.stopPropagation()}>
                   <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 rounded-t-3xl z-10">
                      <h2 className="text-lg font-black uppercase tracking-tight">{storeLang === 'ar' ? 'شراء سريع' : storeLang === 'en' ? 'Quick Buy' : 'Achat Rapide'}</h2>
                      <button onClick={() => setQuickBuyContext(null)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all">
                         <X className="w-4 h-4" />
                      </button>
                   </div>
                   <div className="p-6">
                      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                         <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                            {getCoverImage(quickBuyContext.product) ? <img src={getCoverImage(quickBuyContext.product) as string} className="w-full h-full object-cover" alt={quickBuyContext.product.name} /> : <ImageIcon className="w-6 h-6 text-slate-300" />}
                         </div>
                         <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-slate-800 truncate">{quickBuyContext.product.name}</h4>
                            <p className="text-sm font-black" style={{ color: primaryColor }}>{quickBuyContext.product.price} MAD {quickBuyContext.quantity > 1 ? `× ${quickBuyContext.quantity}` : ''}</p>
                         </div>
                      </div>
                      <CheckoutForm
                         storeIsAr={storeIsAr}
                         storeLang={storeLang}
                         onSubmit={(product: any, qty: any, formData: any) => {
                            submitGlobalOrder(product, qty, formData);
                            quickBuyContext.setPage('success');
                            setQuickBuyContext(null);
                         }}
                         product={quickBuyContext.product}
                         quantity={quickBuyContext.quantity}
                         selectedColor={quickBuyContext.selectedColor}
                         selectedSize={quickBuyContext.selectedSize}
                         disabled={false}
                         requireAccount={requireAccountToOrder}
                         isAuthenticated={!!customerUser}
                         onRequestLogin={() => { setQuickBuyContext(null); setAuthMode('login'); setIsAuthOpen(true); }}
                      />
                   </div>
                </div>
             </div>
          )}
          {!isLiveStore && activeStyleKey && (() => {
             const current = { ...toolbarBaseline, ...textStyles[activeStyleKey] };
             return (
                <div
                   className="fixed z-[1000] bg-white rounded-xl shadow-2xl border border-slate-200 p-2 flex items-center gap-1"
                   style={{ top: toolbarPos.top, left: toolbarPos.left }}
                   onClick={(e) => e.stopPropagation()}
                >
                   <div className="flex items-center gap-1 bg-slate-50 rounded-lg px-1">
                      <button onClick={() => updateTextStyle(activeStyleKey, { fontSize: Math.max(8, (current.fontSize || 16) - 2) })} className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded-md font-black">-</button>
                      <span className="text-[11px] font-bold text-slate-600 w-9 text-center">{Math.round(current.fontSize || 16)}px</span>
                      <button onClick={() => updateTextStyle(activeStyleKey, { fontSize: (current.fontSize || 16) + 2 })} className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded-md font-black">+</button>
                   </div>
                   <label className="relative cursor-pointer w-8 h-8 rounded-lg border border-slate-200 overflow-hidden shrink-0" style={{ backgroundColor: current.color || '#000000' }}>
                      <input type="color" value={current.color || '#000000'} onChange={(e) => updateTextStyle(activeStyleKey, { color: e.target.value })} className="opacity-0 w-full h-full cursor-pointer" />
                   </label>
                   <select
                      value={textStyles[activeStyleKey]?.fontFamily || ''}
                      onChange={(e) => updateTextStyle(activeStyleKey, { fontFamily: e.target.value || undefined })}
                      className="text-[11px] font-bold text-slate-600 bg-slate-50 rounded-lg px-2 py-1.5 border-none focus:outline-none"
                   >
                      <option value="">{isAr ? 'الخط' : 'Thème'}</option>
                      <option value="sans">Sans</option>
                      <option value="serif">Serif</option>
                      <option value="mono">Mono</option>
                   </select>
                   <button onClick={() => resetTextStyle(activeStyleKey)} title={isAr ? 'إعادة تعيين' : 'Réinitialiser'} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-50">
                      <RefreshCw className="w-3.5 h-3.5" />
                   </button>
                   <button onClick={() => setActiveStyleKey(null)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100">
                      <X className="w-3.5 h-3.5" />
                   </button>
                </div>
             );
          })()}
       </div>
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
       <div className={`space-y-6 ${isAr ? 'text-right' : 'text-left'} bg-slate-50 min-h-screen p-6 md:p-12`}>
         <StoreManagerDashboard onSelectStore={(store?: any) => {
             if (store && store.config_json) {
                localStorage.setItem('beya_store_config', JSON.stringify(store.config_json));
             } else {
                localStorage.setItem('beya_store_config', JSON.stringify({})); // Empty config for new store
             }
             setBuilderMode('editor');
             window.location.reload(); // Force all state to re-initialize with new config
         }} onOpenAI={() => setBuilderMode('pro_ai')} isAr={isAr} />
       </div>
     );
  }
  
  if (builderMode === 'pro_ai') {
     return (
       <div className={`space-y-6 ${isAr ? 'text-right' : 'text-left'} bg-slate-50 min-h-screen p-6 md:p-12`}>
         <ProAITools onBack={() => setBuilderMode('dashboard')} isAr={isAr} />
       </div>
     );
  }

  return (
    <div className={`space-y-6 ${isAr ? 'text-right' : 'text-left'} bg-slate-50 min-h-screen p-6`}>
      {newOrderToast && (
         <div className="fixed top-6 right-6 z-[700] bg-white border border-emerald-200 shadow-2xl rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
               <ShoppingBag className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-sm font-black text-slate-800">{isAr ? '🎉 طلب جديد!' : '🎉 Nouvelle commande !'}</p>
               <p className="text-xs font-bold text-slate-500 truncate">{newOrderToast}</p>
            </div>
            <button onClick={() => setNewOrderToast(null)} className="text-slate-400 hover:text-slate-600 shrink-0"><X className="w-4 h-4" /></button>
         </div>
      )}
      {/* Top Navigation / Back Button */}
      <div className="flex items-center justify-between mb-4">
         <button onClick={() => setBuilderMode('dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
            {isAr ? '→ العودة إلى لوحة المتاجر' : '← Retour aux Boutiques'}
         </button>
         <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{isAr ? 'المتجر نشط' : 'SaaS Builder Actif'}</span>
         </div>
      </div>

      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isAr ? 'sm:flex-row-reverse' : ''}`}>
        <div className={isAr ? 'text-right' : 'text-left'}>
          <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">BEYA STORE PRO</h1>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded uppercase tracking-widest">{isAr ? 'نسخة الساس' : 'SaaS ÉDITION'}</span>
            <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-black rounded uppercase tracking-widest" title="Connexion chiffrée de bout en bout et route protégée (Admin uniquement)"><ShieldCheck className="w-3 h-3" /> {isAr ? 'آمن' : 'Sécurisé'}</span>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl w-max mt-4 shadow-inner">
             <button onClick={() => { setPlatformMode('gestion'); setActiveTab('orders'); }} className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${platformMode === 'gestion' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>{isAr ? 'إدارة المتجر' : 'Gestion Boutique'}</button>
             <button onClick={() => { setPlatformMode('builder'); setActiveTab('themes'); }} className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${platformMode === 'builder' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>{isAr ? 'تطوير الموقع' : 'Développement Site'}</button>
          </div>
        </div>
        <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
          <button onClick={handleSave} disabled={isSaving} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${isSaving ? 'bg-green-500 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            {isSaving ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />} {isSaving ? (isAr ? 'تم الحفظ' : 'Enregistré') : (isAr ? 'حفظ' : 'Enregistrer')}
          </button>
          <button onClick={() => { setPreviewProductId(null); setShowPreview(true); }} className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-2 rounded-xl text-sm font-black hover:bg-indigo-100 hover:scale-105 transition-all shadow-sm" title={isAr ? 'محرر الموقع الاحترافي' : 'Éditeur Visuel PRO'}>
            <LayoutTemplate className="w-4 h-4" /> {isAr ? 'بناء الموقع' : 'Éditeur PRO'}
          </button>
          <button
             onClick={() => {
                const url = customDomain ? `https://${customDomain}` : `https://${storeName.toLowerCase().replace(/\s+/g, '')}.beyacreative.com`;
                window.open(url, '_blank');
             }}
             disabled={!config.storeName}
             className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${!config.storeName ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
             title={!config.storeName ? (isAr ? 'يرجى حفظ المتجر أولاً' : 'Veuillez enregistrer d\'abord') : (isAr ? 'زيارة المتجر المباشر' : 'Visiter la boutique en ligne')}
          >
            <ExternalLink className="w-4 h-4" /> {isAr ? 'زيارة المتجر' : 'Visiter'}
          </button>
          <button
             onClick={handlePublish}
             disabled={isPublishing || !config.storeName}
             className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${!config.storeName ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed'}`}
             title={!config.storeName ? (isAr ? 'يرجى حفظ المتجر أولاً' : 'Veuillez enregistrer d\'abord') : undefined}
          >
            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            {isPublishing ? (isAr ? 'جاري النشر...' : 'Publication...') : (isAr ? 'نشر' : 'Publier')}
          </button>
        </div>
      </div>

      <div className={`flex gap-6 ${isAr ? 'flex-row-reverse' : ''}`}>
        {/* VERTICAL SIDE NAVIGATION */}
        <div className="w-24 shrink-0 flex flex-col gap-3">
           {(platformMode === 'gestion' ? [
                 { id: 'orders', icon: ListOrdered, label: isAr ? 'الطلبات' : 'Commandes' },
                 { id: 'products', icon: ShoppingBag, label: isAr ? 'المنتجات' : 'Produits' },
                 { id: 'customers', icon: Users, label: isAr ? 'الزبائن' : 'Clients' },
                 { id: 'payments', icon: CreditCard, label: isAr ? 'الأداء' : 'Paiements' },
                 { id: 'delivery', icon: Truck, label: isAr ? 'التوصيل' : 'Livraison' }
           ] : [
                 { id: 'themes', icon: LayoutTemplate, label: isAr ? 'القوالب' : 'Thèmes' },
                 { id: 'design', icon: Paintbrush, label: isAr ? 'التصميم' : 'Design' },
                 { id: 'apps', icon: Box, label: isAr ? 'تطبيقات' : 'Apps' },
                 { id: 'settings', icon: Settings, label: isAr ? 'إعدادات' : 'Config' }
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

                      {/* Reviews Toggle */}
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-4">
                         <h4 className="text-xs font-black text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                           <Star className="w-4 h-4 text-amber-500" /> {isAr ? 'تقييمات العملاء' : 'Avis Clients (Reviews)'}
                         </h4>
                         <label className="flex items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                            <div>
                               <span className="text-sm font-bold text-slate-700">{isAr ? 'تفعيل قسم التقييمات' : 'Activer la section Avis'}</span>
                               <p className="text-[10px] text-slate-400 mt-0.5">{isAr ? 'السماح للعملاء بترك تقييماتهم' : 'Permettre aux clients de laisser des avis'}</p>
                            </div>
                            <div onClick={() => setShowReviews(!showReviews)} className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${showReviews ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                               <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${showReviews ? 'translate-x-7' : 'translate-x-1'}`} />
                            </div>
                         </label>
                      </div>
                      <p className="text-xs font-bold text-slate-800 text-center py-1">Layout: {activeTheme.layout}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Catalogue de Thèmes</label>
                    <div className="grid grid-cols-2 gap-3">
                      {THEMES.filter(t => t.id !== activeTheme.id).map(t => {
                         const isLocked = t.tier === 'pro' && !proThemesUnlocked;
                         return (
                        <div
                           key={t.id}
                           onClick={() => isLocked ? setProUpsellTheme(t) : applyTheme(t)}
                           className={`border rounded-xl p-1 cursor-pointer transition-all group relative ${isLocked ? 'border-amber-200 opacity-90 hover:opacity-100' : 'border-slate-200 hover:border-indigo-500 opacity-80 hover:opacity-100'}`}
                        >
                          <div className="aspect-video bg-cover bg-center rounded-lg mb-1 relative" style={{ backgroundImage: `url(${t.previewImg})` }}>
                             <div className={`absolute inset-0 rounded-lg flex items-center justify-center transition-colors ${isLocked ? 'bg-black/55' : 'bg-black/40 group-hover:bg-black/20'}`}>
                                <span className="text-white text-[8px] font-black tracking-widest uppercase text-center px-1">{t.name}</span>
                             </div>
                             {isLocked && (
                                <div className="absolute top-1.5 right-1.5 bg-amber-400 text-slate-900 rounded-full p-1 shadow-md">
                                   <ShieldCheck className="w-3 h-3" />
                                </div>
                             )}
                             {t.tier === 'pro' && (
                                <span className="absolute bottom-1.5 left-1.5 bg-amber-400 text-slate-900 text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">PRO</span>
                             )}
                          </div>
                          <p className="text-[9px] font-bold text-slate-500 text-center">{t.layout}</p>
                        </div>
                         );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ORDERS TAB (NEW PRO DASHBOARD!) */}
              {activeTab === 'orders' && (
                 <div className="space-y-6">
                    {/* Dashboard KPIs */}
                    {/* Dashboard KPIs PRO EDITION */}
                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-700 p-4 rounded-2xl shadow-lg shadow-indigo-300/50 flex flex-col justify-between relative overflow-hidden group">
                          {/* Glow effect */}
                          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-400 opacity-20 rounded-full blur-xl group-hover:translate-x-4 transition-transform duration-700"></div>
                          
                          <div className="flex items-center justify-between mb-4 relative z-10">
                             <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest drop-shadow-sm">Commandes</span>
                             <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner"><ShoppingBag className="w-4 h-4 text-white" /></div>
                          </div>
                          <div className="relative z-10">
                             <h4 className="text-3xl font-black text-white tracking-tight drop-shadow-md">{storeOrders.filter((o: any) => !o.deleted).length.toLocaleString('fr-FR')}</h4>
                             <div className="flex items-center gap-1 mt-1">
                               <div className="bg-emerald-400/20 px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm">
                                 <TrendingUp className="w-2.5 h-2.5 text-emerald-300" />
                                 <span className="text-[9px] font-black text-emerald-200">+12%</span>
                               </div>
                               <p className="text-[9px] text-indigo-200 font-bold ml-1">{isAr ? 'هذا الشهر' : 'ce mois'}</p>
                             </div>
                          </div>
                       </div>
                       
                       <div className="bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 p-4 rounded-2xl shadow-lg shadow-emerald-300/50 flex flex-col justify-between relative overflow-hidden group">
                          {/* Glow effect */}
                          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-teal-200 opacity-20 rounded-full blur-xl group-hover:-translate-y-4 transition-transform duration-700"></div>
                          
                          <div className="flex items-center justify-between mb-4 relative z-10">
                             <span className="text-[10px] font-black text-emerald-50 uppercase tracking-widest drop-shadow-sm">Revenus</span>
                             <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner"><CreditCard className="w-4 h-4 text-white" /></div>
                          </div>
                          <div className="relative z-10">
                             <h4 className="text-2xl font-black text-white tracking-tight drop-shadow-md">{storeOrders.filter((o: any) => !o.deleted).reduce((sum: number, ord: any) => sum + (parseFloat(ord.amount) || 0), 0).toLocaleString('fr-FR')} <span className="text-[10px] font-bold text-emerald-100">MAD</span></h4>
                             <div className="flex items-center gap-1 mt-1">
                               <div className="bg-white/20 px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm">
                                 <TrendingUp className="w-2.5 h-2.5 text-white" />
                                 <span className="text-[9px] font-black text-white">+8.5%</span>
                               </div>
                               <p className="text-[9px] text-emerald-100 font-bold ml-1">{isAr ? 'هذا الشهر' : 'ce mois'}</p>
                             </div>
                          </div>
                       </div>

                       <div
                          onClick={() => { setShowTrash(false); setSelectedOrderIds([]); setOrderStatusFilter(prev => prev === 'confirmed' ? 'all' : 'confirmed'); }}
                          className={`bg-white p-3.5 rounded-2xl border shadow-sm hover:shadow-md transition-all flex items-center justify-between group cursor-pointer relative overflow-hidden ${orderStatusFilter === 'confirmed' ? 'border-green-400 ring-2 ring-green-100' : 'border-slate-100'}`}
                       >
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-400 group-hover:w-2 transition-all"></div>
                          <div className="pl-2">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'مؤكدة' : 'Confirmées'}</p>
                             <h4 className="text-xl font-black text-slate-800 tracking-tight">{storeOrders.filter((ord: any) => !ord.deleted && CONFIRMED_STATUSES.includes(ord.status)).length.toLocaleString('fr-FR')}</h4>
                          </div>
                          <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-green-100 transition-all"><CheckCircle className="w-5 h-5 text-green-500" /></div>
                       </div>

                       <div
                          onClick={() => { setShowTrash(false); setSelectedOrderIds([]); setOrderStatusFilter(prev => prev === 'refused' ? 'all' : 'refused'); }}
                          className={`bg-white p-3.5 rounded-2xl border shadow-sm hover:shadow-md transition-all flex items-center justify-between group cursor-pointer relative overflow-hidden ${orderStatusFilter === 'refused' ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-100'}`}
                       >
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-400 group-hover:w-2 transition-all"></div>
                          <div className="pl-2">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAr ? 'مرفوضة' : 'Refusées'}</p>
                             <h4 className="text-xl font-black text-slate-800 tracking-tight">{storeOrders.filter((ord: any) => !ord.deleted && REFUSED_STATUSES.includes(ord.status)).length.toLocaleString('fr-FR')}</h4>
                          </div>
                          <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-100 transition-all"><X className="w-5 h-5 text-rose-500" /></div>
                       </div>
                    </div>
                    
                    {/* Recent Orders List */}
                    <div>
                       <div className="flex justify-between items-center mb-3">
                          <div className="flex gap-4 items-center">
                            <h3 className={`text-xs font-black uppercase tracking-wider cursor-pointer transition-colors ${!showTrash ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`} onClick={() => { setShowTrash(false); setSelectedOrderIds([]); }}>Récentes</h3>
                            <h3 className={`text-xs font-black uppercase tracking-wider cursor-pointer flex items-center gap-1 transition-colors ${showTrash ? 'text-rose-600' : 'text-slate-400 hover:text-rose-400'}`} onClick={() => { setShowTrash(true); setSelectedOrderIds([]); }}>
                               <Trash2 className="w-3 h-3" /> Poubelle
                            </h3>
                            <button onClick={handleManualRefreshOrders} disabled={isRefreshingOrders} title={isAr ? 'تحديث الطلبات' : 'Actualiser les commandes'} className="text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-50">
                               <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingOrders ? 'animate-spin' : ''}`} />
                            </button>
                          </div>
                          {selectedOrderIds.length > 0 ? (
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500">{selectedOrderIds.length} {isAr ? 'محدد' : 'sélectionné(s)'}</span>
                                <button onClick={() => setSelectedOrderIds([])} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors">{isAr ? 'إلغاء' : 'Annuler'}</button>
                                <button onClick={() => setIsBulkDeleteOpen(true)} className="flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-lg hover:bg-rose-100 transition-colors">
                                   <Trash2 className="w-3 h-3" /> {showTrash ? (isAr ? 'حذف نهائي' : 'Supprimer définitivement') : (isAr ? 'حذف' : 'Supprimer')}
                                </button>
                             </div>
                          ) : orderStatusFilter !== 'all' ? (
                             <button onClick={() => setOrderStatusFilter('all')} className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-colors ${orderStatusFilter === 'confirmed' ? 'text-green-700 bg-green-50 hover:bg-green-100' : 'text-rose-700 bg-rose-50 hover:bg-rose-100'}`}>
                                {orderStatusFilter === 'confirmed' ? (isAr ? 'مؤكدة' : 'Confirmées') : (isAr ? 'مرفوضة' : 'Refusées')} <X className="w-3 h-3" />
                             </button>
                          ) : (
                             <span className="text-[10px] text-indigo-600 font-bold cursor-pointer hover:underline">Voir tout</span>
                          )}
                       </div>
                       <div className="space-y-3">
                          {storeOrders.filter(matchesOrderFilter).length === 0 ? (
                             <div className="border-2 border-dashed border-slate-100 rounded-3xl p-10 flex flex-col items-center justify-center text-center bg-gradient-to-b from-slate-50/50 to-white shadow-sm mt-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100 relative">
                                   <div className="absolute inset-0 bg-indigo-50 rounded-2xl animate-ping opacity-20"></div>
                                   <Package className="w-8 h-8 text-slate-300 relative z-10" />
                                </div>
                                <h4 className="text-sm font-black text-slate-700 mb-1">{showTrash ? (isAr ? 'سلة المهملات فارغة' : 'Corbeille vide') : (isAr ? 'لا توجد طلبات بعد' : 'Aucune commande pour le moment')}</h4>
                                <p className="text-[10px] font-bold text-slate-400 max-w-[200px] leading-relaxed">{showTrash ? '' : (isAr ? 'ستظهر طلباتك هنا بمجرد أن يقوم عملاؤك بالشراء' : 'Vos commandes apparaîtront ici dès que vos clients commenceront à acheter')}</p>
                             </div>
                          ) : storeOrders.filter(matchesOrderFilter).map(order => (
                             <div key={order.id} onClick={() => setSelectedOrder(order)} className={`p-3 border rounded-2xl bg-white shadow-sm cursor-pointer transition-colors hover:shadow-md group flex gap-3 items-start ${selectedOrderIds.includes(order.id) ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-indigo-500'}`}>
                                <button
                                   onClick={(e) => { e.stopPropagation(); toggleOrderSelected(order.id); }}
                                   className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${selectedOrderIds.includes(order.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 hover:border-indigo-400'}`}
                                >
                                   {selectedOrderIds.includes(order.id) && <Check className="w-3 h-3 text-white" />}
                                </button>
                                <div className="flex-1 min-w-0">
                                   <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center gap-2">
                                         <span className="text-xs font-black text-slate-800 group-hover:text-indigo-600 transition-colors">#{order.id.substring(0, 8).toUpperCase()}</span>
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
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              )}

              {/* PRODUCTS TAB */}
              {activeTab === 'products' && (
                 <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                       <h3 className="text-xl font-black text-slate-800 tracking-tight">{isAr ? 'إدارة المنتجات' : 'Gestion des Produits'}</h3>
                       <button onClick={() => { setProductForm({ name: '', price: '', stock: '', description: '', category: '', sizes: [], colors: [], colorImages: {}, variantQuantities: {} }); setIsProductModalOpen(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm">
                          <Plus className="w-4 h-4" /> {isAr ? 'إضافة منتج' : 'Ajouter Produit'}
                       </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       {storeProducts.map((p: any) => (
                          <div key={p.id} onClick={() => { setProductForm(p); setIsProductModalOpen(true); }} className="bg-white border border-slate-200 rounded-2xl p-3 flex gap-3 hover:border-indigo-300 transition-colors cursor-pointer group shadow-sm relative">
                             <button onClick={(e) => { e.stopPropagation(); const newProds = storeProducts.filter((prod: any) => prod.id !== p.id); setStoreProducts(newProds); handleSave(newProds); }} className={`absolute top-2 ${isAr ? 'left-2' : 'right-2'} w-7 h-7 bg-white text-rose-500 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all z-10 border border-slate-100`} title={isAr ? 'حذف المنتج' : 'Supprimer'}>
                                <Trash2 className="w-3.5 h-3.5" />
                             </button>
                             <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                                {getCoverImage(p) ? <img src={getCoverImage(p)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <ImageIcon className="w-6 h-6 text-slate-300" />}
                             </div>
                             <div className="flex flex-col justify-center overflow-hidden">
                                <h4 className="text-sm font-bold text-slate-800 truncate">{p.name}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{p.category}</p>
                                <p className="text-xs font-black text-slate-900 mt-1">{p.price} MAD</p>
                             </div>
                          </div>
                       ))}
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
                           <h3 className="text-xl font-black text-slate-800 tracking-tight">{isAr ? 'التوصيل' : 'Livraison'}</h3>
                           <p className="text-xs text-slate-500 font-bold mt-1">{isAr ? 'إدارة شركات التوصيل الخاصة بك' : 'Gérez vos sociétés de livraison partenaires'}</p>
                        </div>
                        <button onClick={() => setIsDeliveryModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm transition-colors">
                           <Plus className="w-4 h-4" /> {isAr ? 'إضافة شركة' : 'Ajouter société'}
                        </button>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {deliveryCompanies.map((comp: any) => (
                           <div key={comp.id || comp.name} onClick={() => setDeliveryCompanies(deliveryCompanies.map(c => c.name === comp.name ? {...c, isActive: !c.isActive} : c))} className={`p-4 border-2 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer transition-all ${comp.isActive ? 'border-indigo-600 bg-indigo-50/30 hover:bg-indigo-50' : 'border-slate-200 bg-white opacity-60 hover:opacity-100'}`}>
                              <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm font-black text-xs ${comp.isActive ? 'bg-white text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {comp.initial || comp.name.substring(0, 2).toUpperCase()}
                                 </div>
                                 <div>
                                    <h4 className={`font-black ${comp.isActive ? 'text-slate-800' : 'text-slate-600'}`}>{comp.name}</h4>
                                    <p className={`text-[10px] font-bold ${comp.isActive ? 'text-slate-500' : 'text-slate-400'}`}>{comp.type}</p>
                                 </div>
                              </div>
                              <span className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-wider ${comp.isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                 {comp.isActive ? (isAr ? 'نشط' : 'Actif') : (isAr ? 'غير نشط' : 'Inactif')}
                              </span>
                           </div>
                        ))}
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
                             {isAr ? 'محرر الموقع الاحترافي' : 'Éditeur Visuel PRO'}
                          </h3>
                          <p className="text-indigo-100 text-xs mb-5 leading-relaxed px-2 font-medium">
                             {isAr ? 'صمم موقعك بالكامل! أضف نصوصاً، صوراً، أقساماً، وتحكم بكل شيء بسهولة تامة.' : 'Concevez votre site de A à Z ! Gérez le design, le texte et les sections avec des outils pro.'}
                          </p>
                          <button onClick={() => setShowPreview(true)} className="w-full bg-white text-indigo-600 font-black py-3.5 rounded-xl shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3)] hover:bg-slate-50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                             <Paintbrush className="w-4 h-4" />
                             {isAr ? 'افتح المحرر المرئي' : 'Ouvrir l\'Éditeur PRO'}
                          </button>
                       </div>
                    </div>

                    {/* PRIMARY COLOR */}
                     <div className="pt-2 space-y-5">
                        <div>
                           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{isAr ? 'اللون الرئيسي' : 'Couleur Principale'}</label>
                           <div className="flex items-center gap-3 mb-3">
                              <label className="relative cursor-pointer">
                                 <div className="w-10 h-10 rounded-xl border-2 border-white shadow-md ring-1 ring-slate-200 hover:scale-105 transition-transform" style={{ backgroundColor: primaryColor }} />
                                 <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="opacity-0 w-0 h-0 absolute" />
                              </label>
                              <div className="flex-1">
                                 <span className="text-sm font-mono font-bold text-slate-700">{primaryColor.toUpperCase()}</span>
                                 <p className="text-[10px] text-slate-400 mt-0.5">{isAr ? 'أزرار وروابط' : 'Boutons, liens & accents'}</p>
                              </div>
                           </div>
                           <div className="flex gap-2 flex-wrap">
                              {[
                                 { color: '#0f172a', label: 'Noir' }, { color: '#1e3a8a', label: 'Marine' },
                                 { color: '#7c3aed', label: 'Violet' }, { color: '#db2777', label: 'Rose' },
                                 { color: '#dc2626', label: 'Rouge' }, { color: '#d97706', label: 'Ambre' },
                                 { color: '#16a34a', label: 'Vert' }, { color: '#0891b2', label: 'Cyan' },
                                 { color: '#b48a44', label: 'Or' }, { color: '#64748b', label: 'Ardoise' }
                              ].map(({ color, label }) => (
                                 <button key={color} onClick={() => setPrimaryColor(color)} title={label}
                                    className={`w-7 h-7 rounded-full border-2 shadow-sm hover:scale-110 transition-transform ${primaryColor === color ? 'border-indigo-500 scale-110 ring-2 ring-indigo-300' : 'border-white'}`}
                                    style={{ backgroundColor: color }} />
                              ))}
                           </div>
                        </div>

                        {/* Secondary Color */}
                        <div className="pt-3 border-t border-slate-100">
                           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{isAr ? 'لون الخلفية / الثانوي' : 'Couleur de Fond / Secondaire'}</label>
                           <div className="flex items-center gap-3 mb-3">
                              <label className="relative cursor-pointer">
                                 <div className="w-10 h-10 rounded-xl border-2 shadow-md ring-1 ring-slate-200 hover:scale-105 transition-transform" style={{ backgroundColor: secondaryColor, borderColor: '#e2e8f0' }} />
                                 <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="opacity-0 w-0 h-0 absolute" />
                              </label>
                              <div className="flex-1">
                                 <span className="text-sm font-mono font-bold text-slate-700">{secondaryColor.toUpperCase()}</span>
                                 <p className="text-[10px] text-slate-400 mt-0.5">{isAr ? 'خلفية البطاقات والأقسام' : 'Fond des cartes & sections'}</p>
                              </div>
                           </div>
                           <div className="flex gap-2 flex-wrap">
                              {[
                                 { color: '#ffffff', label: 'Blanc' }, { color: '#f8fafc', label: 'Perle' },
                                 { color: '#f1f5f9', label: 'Slate' }, { color: '#fef9f0', label: 'Crème' },
                                 { color: '#f0fdf4', label: 'Menthe' }, { color: '#fdf4ff', label: 'Lilas' },
                                 { color: '#111827', label: 'Nuit' }, { color: '#1a1a1a', label: 'Noir' }
                              ].map(({ color, label }) => (
                                 <button key={color} onClick={() => setSecondaryColor(color)} title={label}
                                    className={`w-7 h-7 rounded-full border-2 shadow-sm hover:scale-110 transition-transform ${secondaryColor === color ? 'border-indigo-500 scale-110 ring-2 ring-indigo-300' : 'border-slate-200'}`}
                                    style={{ backgroundColor: color }} />
                              ))}
                           </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100">
                           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{isAr ? 'لون الحدود والخطوط' : 'Couleur des Bordures & Lignes'}</label>
                           <div className="flex items-center gap-3 mb-3">
                              <label className="relative cursor-pointer">
                                 <div className="w-10 h-10 rounded-xl border-2 shadow-md ring-1 ring-slate-200 hover:scale-105 transition-transform" style={{ backgroundColor: borderColor, borderColor: '#e2e8f0' }} />
                                 <input type="color" value={borderColor} onChange={e => setBorderColor(e.target.value)} className="opacity-0 w-0 h-0 absolute" />
                              </label>
                              <div className="flex-1">
                                 <span className="text-sm font-mono font-bold text-slate-700">{borderColor.toUpperCase()}</span>
                                 <p className="text-[10px] text-slate-400 mt-0.5">{isAr ? 'حدود بطاقات المنتجات والفواصل' : 'Bordures des cartes produits & séparateurs'}</p>
                              </div>
                           </div>
                           <div className="flex gap-2 flex-wrap">
                              {[
                                 { color: '#e2e8f0', label: 'Slate' }, { color: '#f1f5f9', label: 'Perle' },
                                 { color: '#e5e7eb', label: 'Gris' }, { color: '#fde68a', label: 'Or' },
                                 { color: '#000000', label: 'Noir' }, { color: '#ffffff', label: 'Blanc' }
                              ].map(({ color, label }) => (
                                 <button key={color} onClick={() => setBorderColor(color)} title={label}
                                    className={`w-7 h-7 rounded-full border-2 shadow-sm hover:scale-110 transition-transform ${borderColor === color ? 'border-indigo-500 scale-110 ring-2 ring-indigo-300' : 'border-slate-200'}`}
                                    style={{ backgroundColor: color }} />
                              ))}
                           </div>
                        </div>

                        {/* Live Preview Mini */}
                        <div className="pt-3 border-t border-slate-100">
                           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{isAr ? 'معاينة فورية' : 'Aperçu Instantané'}</label>
                           <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200" style={{ backgroundColor: secondaryColor }}>
                              <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
                                 <div className="text-xs font-black" style={{ color: primaryColor }}>STORE</div>
                                 <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                                    <div className="w-2 h-2 rounded-full opacity-30" style={{ backgroundColor: primaryColor }} />
                                 </div>
                              </div>
                              <div className="p-3 flex items-center gap-2">
                                 <div className="flex-1 h-5 rounded opacity-20" style={{ backgroundColor: primaryColor }} />
                                 <button className={`px-3 py-1 text-white text-[10px] font-bold ${buttonStyle === 'pill' ? 'rounded-full' : buttonStyle === 'square' ? 'rounded-none' : 'rounded-md'}`} style={btnStyle}>
                                    {isAr ? 'شراء' : 'Acheter'}
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* BUTTON STYLE */}
                     <div className="pt-4 border-t border-slate-100">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{isAr ? 'شكل الأزرار' : 'Style des Boutons'}</label>
                        <div className="grid grid-cols-3 gap-2">
                           {([
                              { key: 'rounded', labelFr: 'Arrondi', labelAr: 'مستدير', radius: 'rounded-lg' },
                              { key: 'pill', labelFr: 'Capsule', labelAr: 'كبسولة', radius: 'rounded-full' },
                              { key: 'square', labelFr: 'Carré', labelAr: 'مربع', radius: 'rounded-none' }
                           ] as const).map(({ key, labelFr, labelAr, radius }) => (
                              <button key={key} onClick={() => setButtonStyle(key)}
                                 className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl transition-all ${buttonStyle === key ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                 <div className={`px-3 py-1.5 text-white text-[10px] font-bold ${radius}`} style={{ backgroundColor: primaryColor }}>
                                    {isAr ? 'زر' : 'Btn'}
                                 </div>
                                 <span className={`text-[10px] font-bold ${buttonStyle === key ? 'text-indigo-600' : 'text-slate-500'}`}>{isAr ? labelAr : labelFr}</span>
                              </button>
                           ))}
                        </div>
                     </div>
                     
                     {/* HERO SIZE & IMAGE POSITION */}
                     <div className="pt-4 border-t border-slate-100">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{isAr ? 'حجم صورة البانر (Hero)' : 'Taille de la Bannière (Hero)'}</label>
                        <div className="flex items-center gap-3">
                           <input
                              type="range"
                              min={250}
                              max={800}
                              step={10}
                              value={heroHeight}
                              onChange={e => setHeroHeight(parseInt(e.target.value))}
                              className="flex-1 accent-indigo-600"
                           />
                           <span className="text-[10px] font-mono font-bold text-slate-600 w-12 text-right">{heroHeight}px</span>
                        </div>
                     </div>

                     <div className="pt-4 border-t border-slate-100">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{isAr ? 'موضع صورة البانر' : "Position de l'image"}</label>
                        <div className="grid grid-cols-3 gap-1.5 w-32">
                           {[0, 50, 100].map(y => (
                              [0, 50, 100].map(x => (
                                 <button
                                    key={`${x}-${y}`}
                                    onClick={() => { setHeroImagePosX(x); setHeroImagePosY(y); }}
                                    className={`w-9 h-9 rounded-md border-2 flex items-center justify-center transition-all ${heroImagePosX === x && heroImagePosY === y ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                                    title={`${x}% / ${y}%`}
                                 >
                                    <span className={`w-2 h-2 rounded-full ${heroImagePosX === x && heroImagePosY === y ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                                 </button>
                              ))
                           ))}
                        </div>
                     </div>

                     {/* PDP IMAGE / DETAILS RATIO */}
                     <div className="pt-4 border-t border-slate-100">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{isAr ? 'نسبة الصورة/التفاصيل في صفحة المنتج' : 'Ratio Image / Détails (page produit)'}</label>
                        <div className="flex items-center gap-3">
                           <input
                              type="range"
                              min={30}
                              max={70}
                              step={5}
                              value={pdpImageWidth}
                              onChange={e => setPdpImageWidth(parseInt(e.target.value))}
                              className="flex-1 accent-indigo-600"
                           />
                           <span className="text-[10px] font-mono font-bold text-slate-600 w-16 text-right">{pdpImageWidth}% / {100 - pdpImageWidth}%</span>
                        </div>
                     </div>

                     {/* PDP IMAGE HEIGHT / ASPECT */}
                     <div className="pt-4 border-t border-slate-100">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{isAr ? 'ارتفاع صورة المنتج' : "Hauteur de l'image produit"}</label>
                        <div className="grid grid-cols-4 gap-2">
                           {([
                              { key: '3/4', labelFr: 'Portrait', labelAr: 'طولي' },
                              { key: '4/5', labelFr: 'Standard', labelAr: 'قياسي' },
                              { key: '1/1', labelFr: 'Carré', labelAr: 'مربع' },
                              { key: '4/3', labelFr: 'Large', labelAr: 'عريض' }
                           ] as const).map(({ key, labelFr, labelAr }) => (
                              <button key={key} onClick={() => setPdpImageAspect(key)}
                                 className={`py-2 text-[9px] font-bold rounded-lg border ${pdpImageAspect === key ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-500'}`}>
                                 {isAr ? labelAr : labelFr}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* PDP CONTAINER WIDTH */}
                     <div className="pt-4 border-t border-slate-100">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{isAr ? 'عرض صفحة المنتج' : 'Largeur de la page produit'}</label>
                        <div className="flex items-center gap-3">
                           <input
                              type="range"
                              min={800}
                              max={1600}
                              step={50}
                              value={pdpMaxWidth}
                              onChange={e => setPdpMaxWidth(parseInt(e.target.value))}
                              className="flex-1 accent-indigo-600"
                           />
                           <span className="text-[10px] font-mono font-bold text-slate-600 w-14 text-right">{pdpMaxWidth}px</span>
                        </div>
                     </div>

                     {/* CARD STYLE */}
                     <div className="pt-4 border-t border-slate-100">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{isAr ? 'شكل بطاقات المنتجات' : 'Style des Cartes Produits'}</label>
                        <div className="grid grid-cols-3 gap-2">
                           {([
                              { key: 'rounded', labelFr: 'Arrondi', labelAr: 'مستدير', radius: '12px' },
                              { key: 'square', labelFr: 'Carré', labelAr: 'مربع', radius: '0px' },
                              { key: 'arch', labelFr: 'Arche', labelAr: 'قوس', radius: '30px 30px 6px 6px' },
                              { key: 'pill', labelFr: 'Pilule', labelAr: 'كبسولة', radius: '999px' }
                           ] as const).map(({ key, labelFr, labelAr, radius }) => (
                              <button key={key} onClick={() => setCardStyle(key)}
                                 className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl transition-all ${cardStyle === key ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                 <div className="w-12 h-12 border" style={{ backgroundColor: secondaryColor, borderColor, borderRadius: radius }} />
                                 <span className={`text-[10px] font-bold ${cardStyle === key ? 'text-indigo-600' : 'text-slate-500'}`}>{isAr ? labelAr : labelFr}</span>
                              </button>
                           ))}
                           <button onClick={() => setCardStyle('trend')}
                              className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl transition-all ${cardStyle === 'trend' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                              <div className="w-12 h-12 rounded-xl overflow-hidden flex flex-col shadow-sm" style={{ backgroundColor: '#fde8ef' }}>
                                 <div className="flex-1 flex items-center justify-center"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /></div>
                                 <div className="h-2.5 bg-white" />
                              </div>
                              <span className={`text-[10px] font-bold ${cardStyle === 'trend' ? 'text-indigo-600' : 'text-slate-500'}`}>{isAr ? 'ترند' : 'Trendy'}</span>
                           </button>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                           <span className="text-[10px] font-bold text-slate-500">{isAr ? 'إظهار شارة الفئة على الصورة' : 'Afficher un badge catégorie sur l\'image'}</span>
                           <button onClick={() => setShowCardBadge(v => !v)} className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${showCardBadge ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showCardBadge ? 'translate-x-4' : ''}`} />
                           </button>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                           <span className="text-[10px] font-bold text-slate-500">{isAr ? 'اسم الفئة تحت الصورة (وليس فوقها)' : 'Nom de la collection en dessous de l\'image'}</span>
                           <button onClick={() => setCollectionLabelBelow(v => !v)} className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${collectionLabelBelow || cardStyle === 'pill' || cardStyle === 'arch' ? 'bg-indigo-600' : 'bg-slate-300'}`} disabled={cardStyle === 'pill' || cardStyle === 'arch'}>
                              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${collectionLabelBelow || cardStyle === 'pill' || cardStyle === 'arch' ? 'translate-x-4' : ''}`} />
                           </button>
                        </div>
                        {(cardStyle === 'pill' || cardStyle === 'arch') && (
                           <p className="text-[9px] text-slate-400 mt-1.5">{isAr ? 'مفعّل تلقائيًا مع هذا الشكل' : 'Activé automatiquement avec cette forme de carte'}</p>
                        )}
                     </div>

                     {/* PRODUCT CARD SIZE */}
                     <div className="pt-4 border-t border-slate-100">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{isAr ? 'حجم بطاقات المنتجات' : 'Taille des Cartes Produits'}</label>
                        <div className="grid grid-cols-3 gap-2">
                           {([
                              { key: 'small', labelFr: 'Petites', labelAr: 'صغيرة', cols: 5 },
                              { key: 'medium', labelFr: 'Moyennes', labelAr: 'متوسطة', cols: 4 },
                              { key: 'large', labelFr: 'Grandes', labelAr: 'كبيرة', cols: 3 }
                           ] as const).map(({ key, labelFr, labelAr, cols }) => (
                              <button key={key} onClick={() => setProductCardSize(key)}
                                 className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl transition-all ${productCardSize === key ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                 <div className="flex gap-0.5 w-12 h-8">
                                    {Array.from({ length: cols > 4 ? 4 : cols }).map((_, i) => (
                                       <div key={i} className="flex-1 bg-slate-300 rounded-sm" style={productCardSize === key ? { backgroundColor: primaryColor, opacity: 0.6 } : undefined} />
                                    ))}
                                 </div>
                                 <span className={`text-[10px] font-bold ${productCardSize === key ? 'text-indigo-600' : 'text-slate-500'}`}>{isAr ? labelAr : labelFr}</span>
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* SITE WIDTH */}
                     <div className="pt-4 border-t border-slate-100">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{isAr ? 'عرض الموقع' : 'Largeur du Site'}</label>
                        <div className="flex items-center gap-3">
                           <input
                              type="range"
                              min={1000}
                              max={1920}
                              step={20}
                              value={siteMaxWidth}
                              onChange={e => setSiteMaxWidth(parseInt(e.target.value))}
                              className="flex-1 accent-indigo-600"
                           />
                           <span className="text-[10px] font-mono font-bold text-slate-600 w-14 text-right">{siteMaxWidth}px</span>
                        </div>
                     </div>

                     {/* FOOTER COLORS */}
                     <div className="pt-4 border-t border-slate-100">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{isAr ? 'ألوان التذييل (Footer)' : 'Couleurs du Footer'}</label>
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <label className="relative cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg border-2 shadow-sm ring-1 ring-slate-200" style={{ backgroundColor: footerBgColor, borderColor: '#e2e8f0' }} />
                                    <input type="color" value={footerBgColor} onChange={e => setFooterBgColor(e.target.value)} className="opacity-0 w-0 h-0 absolute" />
                                 </label>
                                 <span className="text-[10px] font-mono font-bold text-slate-600">{footerBgColor.toUpperCase()}</span>
                              </div>
                              <p className="text-[9px] text-slate-400">{isAr ? 'خلفية' : 'Fond'}</p>
                           </div>
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <label className="relative cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg border-2 shadow-sm ring-1 ring-slate-200" style={{ backgroundColor: footerTextColor, borderColor: '#e2e8f0' }} />
                                    <input type="color" value={footerTextColor} onChange={e => setFooterTextColor(e.target.value)} className="opacity-0 w-0 h-0 absolute" />
                                 </label>
                                 <span className="text-[10px] font-mono font-bold text-slate-600">{footerTextColor.toUpperCase()}</span>
                              </div>
                              <p className="text-[9px] text-slate-400">{isAr ? 'النص والشعار' : 'Texte & Logo'}</p>
                           </div>
                        </div>
                     </div>

                     {/* MENU STYLE */}
                     <div className="pt-4 border-t border-slate-100">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{isAr ? 'قائمة التنقل (Menu)' : 'Menu de Navigation'}</label>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <label className="relative cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg border-2 shadow-sm ring-1 ring-slate-200" style={{ backgroundColor: menuTextColor, borderColor: '#e2e8f0' }} />
                                    <input type="color" value={menuTextColor} onChange={e => setMenuTextColor(e.target.value)} className="opacity-0 w-0 h-0 absolute" />
                                 </label>
                                 <span className="text-[10px] font-mono font-bold text-slate-600">{menuTextColor.toUpperCase()}</span>
                              </div>
                              <p className="text-[9px] text-slate-400">{isAr ? 'لون غير نشط' : 'Lien inactif'}</p>
                           </div>
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <label className="relative cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg border-2 shadow-sm ring-1 ring-slate-200" style={{ backgroundColor: menuActiveColor || primaryColor, borderColor: '#e2e8f0' }} />
                                    <input type="color" value={menuActiveColor || primaryColor} onChange={e => setMenuActiveColor(e.target.value)} className="opacity-0 w-0 h-0 absolute" />
                                 </label>
                                 <span className="text-[10px] font-mono font-bold text-slate-600">{(menuActiveColor || primaryColor).toUpperCase()}</span>
                              </div>
                              <p className="text-[9px] text-slate-400">{isAr ? 'لون نشط' : 'Lien actif'}</p>
                           </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                           {([
                              { key: 'underline', labelFr: 'Soulignement', labelAr: 'تسطير' },
                              { key: 'pill', labelFr: 'Capsule', labelAr: 'كبسولة' },
                              { key: 'bold', labelFr: 'Gras', labelAr: 'عريض' }
                           ] as const).map(({ key, labelFr, labelAr }) => (
                              <button key={key} onClick={() => setMenuStyle(key)}
                                 className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl transition-all ${menuStyle === key ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                 <span
                                    className={`text-[11px] font-bold ${key === 'pill' ? 'px-3 py-1 rounded-full text-white' : key === 'bold' ? 'font-black' : 'border-b-2'}`}
                                    style={key === 'pill' ? { backgroundColor: primaryColor } : key === 'bold' ? { color: primaryColor } : { color: primaryColor, borderColor: primaryColor }}
                                 >
                                    {isAr ? 'قسم' : 'Item'}
                                 </span>
                                 <span className={`text-[10px] font-bold ${menuStyle === key ? 'text-indigo-600' : 'text-slate-500'}`}>{isAr ? labelAr : labelFr}</span>
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* TYPOGRAPHY */}
                     <div className="pt-4 border-t border-slate-100">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{isAr ? 'الخط' : 'Typographie'}</label>
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

               {/* APPS TAB */}
               {activeTab === 'apps' && (
                 <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="text-xl font-black text-slate-800">{isAr ? 'تطبيقات المتجر' : 'Applications (Apps)'}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {[
                         { id: 'WhatsApp Chat', name: 'WhatsApp', desc: isAr ? 'زر واتساب عائم للتواصل السريع' : 'Bouton flottant pour chat rapide', icon: Smartphone, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                         { id: 'Facebook Pixel', name: 'Facebook Pixel', desc: isAr ? 'تتبع زوار المتجر وحملات فيسبوك' : 'Suivi des conversions Facebook', icon: Monitor, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                         { id: 'TikTok Pixel', name: 'TikTok Pixel', desc: isAr ? 'تتبع تحويلات حملات تيك توك' : 'Suivi des conversions TikTok', icon: Video, color: 'text-slate-900', bg: 'bg-slate-100', border: 'border-slate-300' },
                         { id: 'Google Analytics 4', name: 'Google Analytics 4', desc: isAr ? 'إحصائيات دقيقة لزوار متجرك' : 'Statistiques détaillées des visiteurs', icon: Globe, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
                         { id: 'AI Auto-Builder', name: 'AI Product Builder', desc: isAr ? 'Premium: توليد تفاصيل المنتجات والـ SEO بالذكاء الاصطناعي من الصور' : 'Premium: Génération IA des détails et SEO via image', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' }
                       ].map(app => (
                          <div key={app.id} className={`bg-white border ${appsConfig[app.id] ? app.border : 'border-slate-200'} rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer`} onClick={() => { setAppInputValue(appsConfig[app.id] || ''); setActiveAppModal(app.id); }}>
                             {appsConfig[app.id] && <div className="absolute top-3 right-3 bg-green-100 text-green-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">{isAr ? 'نشط' : 'Actif'}</div>}
                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${appsConfig[app.id] ? app.bg : 'bg-slate-50'}`}>
                                <app.icon className={`w-6 h-6 ${appsConfig[app.id] ? app.color : 'text-slate-400'}`} />
                             </div>
                             <h4 className="font-black text-slate-800 mb-1">{app.name}</h4>
                             <p className="text-xs font-bold text-slate-500 line-clamp-2">{app.desc}</p>
                             <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span className={`text-[10px] font-black uppercase tracking-wider ${appsConfig[app.id] ? 'text-indigo-600' : 'text-slate-400'}`}>{appsConfig[app.id] ? (isAr ? 'تعديل الإعدادات' : 'Modifier Config') : (isAr ? 'تثبيت التطبيق' : 'Installer l\'App')}</span>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${appsConfig[app.id] ? 'bg-indigo-50 group-hover:bg-indigo-100' : 'bg-slate-50 group-hover:bg-slate-200'} transition-colors`}>
                                   <Plus className={`w-3 h-3 ${appsConfig[app.id] ? 'text-indigo-600' : 'text-slate-400'}`} />
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
               )}

               {/* SETTINGS TAB */}
               {activeTab === 'settings' && (
                 <div className="space-y-6">
                     <div className={`p-4 rounded-xl border space-y-3 ${proThemesUnlocked ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <ShieldCheck className={`w-4 h-4 ${proThemesUnlocked ? 'text-amber-500' : 'text-slate-400'}`} />
                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? 'باقة Pro' : 'Plan Pro'}</h4>
                           </div>
                           <button
                              onClick={() => setProThemesUnlocked((v: boolean) => !v)}
                              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${proThemesUnlocked ? 'bg-amber-400' : 'bg-slate-300'}`}
                           >
                              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${proThemesUnlocked ? 'translate-x-5' : ''}`} />
                           </button>
                        </div>
                        <p className="text-[11px] text-slate-500 font-semibold">
                           {isAr
                              ? 'إذا فُعّلت، تُفتح جميع التصاميم المميزة (Pro). يتم التفعيل يدويًا حاليًا (بدون نظام دفع إلكتروني مربوط بعد).'
                              : "Une fois activé, tous les thèmes Pro sont débloqués. Activation manuelle pour l'instant (pas encore de paiement en ligne branché)."}
                        </p>
                     </div>

                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                        <div>
                           <h4 className="text-xs font-black text-slate-800 mb-2 uppercase tracking-wider">{isAr ? 'لغة المتجر' : 'Langue de la boutique'}</h4>
                           <div className="flex gap-2">
                              <button onClick={() => setStoreLang('fr')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${storeLang === 'fr' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>Français</button>
                              <button onClick={() => setStoreLang('en')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${storeLang === 'en' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>English</button>
                              <button onClick={() => setStoreLang('ar')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${storeLang === 'ar' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>العربية</button>
                           </div>
                        </div>
                     </div>

                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                           <div>
                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? 'يتطلب حساب لإتمام الطلب' : 'Compte requis pour commander'}</h4>
                              <p className="text-[11px] text-slate-500 font-semibold mt-1">{isAr ? 'إذا تم التفعيل، يجب على الزبناء إنشاء حساب قبل إتمام الطلب' : "Si activé, les clients doivent créer un compte avant de finaliser une commande."}</p>
                           </div>
                           <button
                              onClick={() => setRequireAccountToOrder((v: boolean) => !v)}
                              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${requireAccountToOrder ? 'bg-indigo-600' : 'bg-slate-300'}`}
                           >
                              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${requireAccountToOrder ? 'translate-x-5' : ''}`} />
                           </button>
                        </div>
                     </div>

                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                           <div>
                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? '"اشتري الآن" كنافذة منبثقة' : "'Acheter Maintenant' en popup"}</h4>
                              <p className="text-[11px] text-slate-500 font-semibold mt-1">{isAr ? 'إذا فُعّل، يفتح "اشتري الآن" نافذة شراء سريع بدل الانتقال لصفحة كاملة' : "Si activé, le bouton ouvre une fenêtre d'achat rapide au lieu d'aller sur une page de commande complète."}</p>
                           </div>
                           <button
                              onClick={() => setBuyNowAsPopup((v: boolean) => !v)}
                              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${buyNowAsPopup ? 'bg-indigo-600' : 'bg-slate-300'}`}
                           >
                              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${buyNowAsPopup ? 'translate-x-5' : ''}`} />
                           </button>
                        </div>
                     </div>

                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                           <div>
                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? 'عناصر الثقة في صفحة المنتج' : 'Réassurance (page produit)'}</h4>
                              <p className="text-[11px] text-slate-500 font-semibold mt-1">{isAr ? 'معلومات التوصيل والضمان والإرجاع أسفل زر الشراء' : "Infos livraison/garantie/retour affichées sous le bouton d'achat."}</p>
                           </div>
                           <button
                              onClick={() => setShowPdpTrustBadges((v: boolean) => !v)}
                              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${showPdpTrustBadges ? 'bg-indigo-600' : 'bg-slate-300'}`}
                           >
                              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showPdpTrustBadges ? 'translate-x-5' : ''}`} />
                           </button>
                        </div>

                        {showPdpTrustBadges && (
                           <div className="space-y-3 pt-3 border-t border-slate-200">
                              <div>
                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">{isAr ? 'نطاق التوصيل' : 'Zone de livraison'}</label>
                                 <div className="flex gap-2">
                                    <button onClick={() => setDeliveryScope('morocco')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${deliveryScope === 'morocco' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                                       <img src="https://flagcdn.com/w20/ma.png" alt="MA" className="w-4 h-3 rounded-sm object-cover" /> {isAr ? 'المغرب فقط' : 'Maroc uniquement'}
                                    </button>
                                    <button onClick={() => setDeliveryScope('international')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${deliveryScope === 'international' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                                       <Globe className="w-3.5 h-3.5" /> {isAr ? 'دولي' : 'International'}
                                    </button>
                                 </div>
                              </div>
                              <div>
                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">{isAr ? 'نص التوصيل' : 'Texte livraison'}</label>
                                 <input type="text" value={deliveryText} onChange={e => setDeliveryText(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                              </div>
                              <div>
                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">{isAr ? 'نص الضمان' : 'Texte garantie'}</label>
                                 <input type="text" value={guaranteeText} onChange={e => setGuaranteeText(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                              </div>
                              <div>
                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">{isAr ? 'نص الإرجاع' : 'Texte retour'}</label>
                                 <input type="text" value={returnText} onChange={e => setReturnText(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                              </div>
                           </div>
                        )}
                     </div>

                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isAr ? 'أيقونات رأس المتجر' : "Icônes de l'en-tête"}</h4>
                        <div className="flex items-center justify-between">
                           <p className="text-xs font-bold text-slate-600">{isAr ? 'اختيار اللغة' : 'Sélecteur de langue'}</p>
                           <button onClick={() => setShowHeaderLang((v: boolean) => !v)} className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${showHeaderLang ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showHeaderLang ? 'translate-x-5' : ''}`} />
                           </button>
                        </div>
                        <div className="flex items-center justify-between">
                           <p className="text-xs font-bold text-slate-600">{isAr ? 'البحث' : 'Recherche'}</p>
                           <button onClick={() => setShowHeaderSearch((v: boolean) => !v)} className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${showHeaderSearch ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showHeaderSearch ? 'translate-x-5' : ''}`} />
                           </button>
                        </div>
                        <div className="flex items-center justify-between">
                           <p className="text-xs font-bold text-slate-600">{isAr ? 'حساب الزبون (تسجيل الدخول)' : 'Compte client (connexion)'}</p>
                           <button onClick={() => setShowHeaderAccount((v: boolean) => !v)} className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${showHeaderAccount ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showHeaderAccount ? 'translate-x-5' : ''}`} />
                           </button>
                        </div>
                     </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                       <div>
                          <h4 className="text-xs font-black text-slate-800 mb-1 uppercase tracking-wider">{isAr ? 'اسم المتجر' : 'Nom de la boutique'}</h4>
                          <input 
                            type="text" 
                            value={storeName} 
                            onChange={e => setStoreName(e.target.value)} 
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 mt-2"
                          />
                       </div>
                       
                       <div className="pt-4 border-t border-slate-200">
                          <h4 className="text-xs font-black text-slate-800 mb-2 uppercase tracking-wider">{isAr ? 'شعار المتجر (اختياري)' : 'Logo de la boutique (Optionnel)'}</h4>
                          <div className="flex items-center gap-4">
                             <div className="w-16 h-16 bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                                {storeLogo ? <img src={storeLogo} className="w-full h-full object-contain p-1" alt="Logo" /> : <ImageIcon className="w-6 h-6 text-slate-300" />}
                             </div>
                             <label className="cursor-pointer px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm">
                                {isAr ? 'رفع الشعار' : 'Importer un logo'}
                                <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                   const file = e.target.files?.[0];
                                   if (file) setStoreLogo(await readFileAsBase64(file));
                                }} />
                             </label>
                             {storeLogo && (
                                <button onClick={() => setStoreLogo('')} className="text-xs font-bold text-rose-500 hover:text-rose-600">{isAr ? 'إزالة' : 'Retirer'}</button>
                             )}
                          </div>
                       </div>

                       <div className="pt-4 border-t border-slate-200">
                          <h4 className="text-xs font-black text-slate-800 mb-2 uppercase tracking-wider">{isAr ? 'أيقونة المتجر (Favicon)' : 'Favicon de la boutique'}</h4>
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                                {storeFavicon ? <img src={storeFavicon} className="w-full h-full object-contain" alt="Favicon" /> : <ImageIcon className="w-4 h-4 text-slate-300" />}
                             </div>
                             <label className="cursor-pointer px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm">
                                {isAr ? 'رفع الأيقونة' : 'Importer un favicon'}
                                <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                   const file = e.target.files?.[0];
                                   if (file) setStoreFavicon(await readFileAsBase64(file));
                                }} />
                             </label>
                             {storeFavicon && (
                                <button onClick={() => setStoreFavicon('')} className="text-xs font-bold text-rose-500 hover:text-rose-600">{isAr ? 'إزالة' : 'Retirer'}</button>
                             )}
                          </div>
                       </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                       <h4 className="text-xs font-black text-slate-800 mb-1 uppercase tracking-wider flex items-center gap-2"><Globe className="w-4 h-4 text-indigo-600" /> {isAr ? 'نطاق مخصص (دومين)' : 'Domaine Personnalisé'}</h4>
                       <p className="text-[10px] text-slate-500 mb-2">{isAr ? 'اربط النطاق الخاص بك (مثال: www.maboutique.com)' : 'Connectez votre propre domaine (ex: www.maboutique.com).'}</p>
                       <div className="flex gap-2">
                         <input
                           type="text"
                           placeholder={isAr ? 'مثال: www.maboutique.com' : 'ex: www.maboutique.com'}
                           value={customDomain}
                           onChange={e => setCustomDomain(e.target.value)}
                           className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 font-medium"
                         />
                         <button onClick={handleLinkDomain} disabled={isLinkingDomain} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50">
                           {isLinkingDomain ? '...' : isAr ? 'ربط' : 'Lier'}
                         </button>
                       </div>
                       {domainError && <p className="text-xs text-rose-500 mt-2 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {domainError}</p>}

                       {customDomain && (
                          <div className="mt-4 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                             <div className="bg-indigo-50/50 p-3 border-b border-slate-100 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                                <span className="text-xs font-bold text-slate-700">{isAr ? 'إعدادات مطلوبة (Namecheap, Hostinger...)' : 'Configuration requise (Namecheap, Hostinger...)'}</span>
                             </div>
                             <div className="p-4 space-y-4">
                                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                                   {isAr ? <>لكي يعمل نطاقك، أضف <b>سجل A (A Record)</b> عند مزود الخدمة الخاص بك (Namecheap, Hostinger...) بهذه المعلومات :</> : <>Pour que votre domaine fonctionne, ajoutez un <b>Enregistrement A (A Record)</b> chez votre fournisseur (Namecheap, Hostinger...) avec ces informations :</>}
                                </p>
                                <div className="space-y-2">
                                   <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg group">
                                      <span className="text-xs text-slate-500 font-medium w-16">{isAr ? 'النوع' : 'Type'}</span>
                                      <code className="text-xs font-black text-slate-800 tracking-wide flex-1">A</code>
                                   </div>
                                   <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg group">
                                      <span className="text-xs text-slate-500 font-medium w-16">{isAr ? 'الاسم/المضيف' : 'Nom/Hôte'}</span>
                                      <code className="text-xs font-black text-slate-800 tracking-wide flex-1">@</code>
                                      <button onClick={() => navigator.clipboard.writeText('@')} className="p-1 text-slate-400 group-hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Copier"><Copy className="w-3.5 h-3.5" /></button>
                                   </div>
                                   <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg group">
                                      <span className="text-xs text-slate-500 font-medium w-16">{isAr ? 'القيمة/IP' : 'Valeur/IP'}</span>
                                      <code className="text-xs font-black text-slate-800 tracking-wide flex-1">76.76.21.21</code>
                                      <button onClick={() => navigator.clipboard.writeText('76.76.21.21')} className="p-1 text-slate-400 group-hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Copier"><Copy className="w-3.5 h-3.5" /></button>
                                   </div>
                                </div>
                                <p className="text-[10px] text-slate-400 italic">{isAr ? 'قد يستغرق انتشار DNS ما بين 15 دقيقة و24 ساعة.' : 'La propagation DNS peut prendre entre 15 minutes et 24 heures.'}</p>
                             </div>
                          </div>
                       )}
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                       <h4 className="text-xs font-black text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                         <LayoutTemplate className="w-4 h-4 text-indigo-600" /> {isAr ? 'إدارة الصفحات' : 'Gestion des Pages'}
                       </h4>

                       <div className="flex gap-2 mb-4">
                          <input
                            type="text"
                            placeholder={isAr ? 'العنوان (مثال: اتصل بنا)' : 'Titre (ex: Contact)'}
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
                            {isAr ? 'إضافة' : 'Ajouter'}
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
                                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2 py-1 bg-slate-200 rounded-md">{isAr ? 'نظام' : 'Système'}</span>
                                   )}
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-4 mb-4">
                        <h4 className="text-xs font-black text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                          <LayoutTemplate className="w-4 h-4 text-indigo-600" /> {isAr ? 'تذييل الصفحة (Footer)' : 'Pied de page (Footer)'}
                        </h4>

                        <div className="space-y-4">
                           <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{isAr ? 'نص حقوق النشر' : 'Texte du Copyright'}</label>
                              <input
                                type="text"
                                value={footerSettings.copyright}
                                onChange={e => setFooterSettings({...footerSettings, copyright: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                              />
                           </div>

                           <div className="space-y-2 pt-2">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{isAr ? 'الصفحات القانونية (تُنشأ تلقائياً)' : 'Pages Légales (Générées Automatiquement)'}</label>

                              <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                                 <input type="checkbox" checked={footerSettings.showPrivacy} onChange={e => setFooterSettings({...footerSettings, showPrivacy: e.target.checked})} className="w-4 h-4 accent-indigo-600" />
                                 <span className="text-sm font-bold text-slate-700">{isAr ? 'سياسة الخصوصية' : 'Politique de Confidentialité'}</span>
                              </label>

                              <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                                 <input type="checkbox" checked={footerSettings.showTerms} onChange={e => setFooterSettings({...footerSettings, showTerms: e.target.checked})} className="w-4 h-4 accent-indigo-600" />
                                 <span className="text-sm font-bold text-slate-700">{isAr ? 'الشروط والأحكام العامة للبيع' : 'Conditions Générales de Vente (CGV)'}</span>
                              </label>

                              <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                                 <input type="checkbox" checked={footerSettings.showCookies} onChange={e => setFooterSettings({...footerSettings, showCookies: e.target.checked})} className="w-4 h-4 accent-indigo-600" />
                                 <span className="text-sm font-bold text-slate-700">{isAr ? 'سياسة ملفات الارتباط' : 'Politique des Cookies'}</span>
                              </label>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-4">
                       <h4 className="text-xs font-black text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                         <ShoppingBag className="w-4 h-4 text-indigo-600" /> {isAr ? 'طريقة الشراء (الأزرار)' : "Mode d'Achat (Boutons)"}
                       </h4>
                       <div className="space-y-3">
                          <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                             <input type="radio" name="buyMode" checked={buyMode === 'both'} onChange={() => setBuyMode('both')} className="accent-indigo-600" />
                             {isAr ? "عرض 'أضف للسلة' و'اشتري الآن'" : "Afficher 'Ajouter au panier' & 'Acheter direct'"}
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                             <input type="radio" name="buyMode" checked={buyMode === 'direct'} onChange={() => setBuyMode('direct')} className="accent-indigo-600" />
                             {isAr ? "فقط 'اشتري مباشرة' (سريع)" : "Uniquement 'Acheter direct' (Express)"}
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                             <input type="radio" name="buyMode" checked={buyMode === 'cart'} onChange={() => setBuyMode('cart')} className="accent-indigo-600" />
                             {isAr ? "فقط 'أضف للسلة' (كلاسيكي)" : "Uniquement 'Ajouter au panier' (Classique)"}
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                             <input type="radio" name="buyMode" checked={buyMode === 'form'} onChange={() => setBuyMode('form')} className="accent-indigo-600" />
                             {isAr ? "نموذج مدمج (سريع في الصفحة)" : "Formulaire intégré (Express sur la page)"}
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
              {activeTab === 'design' && (
                 <button onClick={handleUndoDesign} disabled={designHistory.length < 2} title={isAr ? 'تراجع' : 'Annuler la dernière modification'} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors border border-slate-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-500 disabled:hover:bg-transparent">
                    <Undo2 className="w-3.5 h-3.5" /> {isAr ? 'تراجع' : 'Annuler'}
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
                   <span className="font-black tracking-tight">{isAr ? 'المحرر المرئي' : 'Éditeur Visuel PRO'}</span>
                </div>
                <button onClick={() => setShowPreview(false)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded hover:text-rose-500 transition-colors">
                   <X className="w-4 h-4" />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                   <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3">{isAr ? 'العناصر الأساسية' : 'Éléments de Base'}</h4>
                   {(() => {
                      const blockDefs = [
                         { id: 'hero', name: isAr ? 'القسم الرئيسي' : 'Bannière (Hero)', icon: Type, activeClasses: 'border-indigo-500 shadow-md ring-2 ring-indigo-100', bgClasses: 'bg-indigo-50 text-indigo-500', checkClass: 'text-indigo-500' },
                         { id: 'slider', name: isAr ? 'معرض صور' : 'Slider', icon: ImageIcon, activeClasses: 'border-emerald-500 shadow-md ring-2 ring-emerald-100', bgClasses: 'bg-emerald-50 text-emerald-500', checkClass: 'text-emerald-500' },
                         { id: 'collections', name: isAr ? 'تصنيفات' : 'Collections', icon: MousePointerClick, activeClasses: 'border-amber-500 shadow-md ring-2 ring-amber-100', bgClasses: 'bg-amber-50 text-amber-500', checkClass: 'text-amber-500' },
                         { id: 'products', name: isAr ? 'منتجات' : 'Produits', icon: LayoutGrid, activeClasses: 'border-rose-500 shadow-md ring-2 ring-rose-100', bgClasses: 'bg-rose-50 text-rose-500', checkClass: 'text-rose-500' }
                      ];
                      return (
                         <div className="space-y-2">
                            {/* ACTIVE BLOCKS (SORTABLE) */}
                            {homeBlocks.map((blockId, index) => {
                               const def = blockDefs.find(b => b.id === blockId);
                               if (!def) return null;
                               const Icon = def.icon;
                               const isActive = activeSidebarSection === blockId;
                               return (
                                  <div key={blockId} className={`bg-white border ${isActive ? def.activeClasses : 'border-slate-200'} rounded-lg p-2.5 flex items-center gap-3 transition-all group relative`}>
                                     <div onClick={() => setActiveSidebarSection(blockId)} className="flex-1 flex items-center gap-3 cursor-pointer">
                                        <div className={`w-8 h-8 rounded ${def.bgClasses} flex items-center justify-center group-hover:scale-110 transition-transform`}><Icon className="w-4 h-4" /></div>
                                        <span className="text-[11px] font-bold text-slate-700">{def.name}</span>
                                        <CheckCircle className={`w-3.5 h-3.5 ${def.checkClass} ml-auto mr-2`} />
                                     </div>
                                     <div className="flex flex-col border-l border-slate-100 pl-2">
                                        <button disabled={index === 0} onClick={() => { const newB = [...homeBlocks]; newB[index] = newB[index-1]; newB[index-1] = blockId; setHomeBlocks(newB); }} className="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                                        <button disabled={index === homeBlocks.length - 1} onClick={() => { const newB = [...homeBlocks]; newB[index] = newB[index+1]; newB[index+1] = blockId; setHomeBlocks(newB); }} className="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                                     </div>
                                     <button onClick={() => setHomeBlocks(homeBlocks.filter(b => b !== blockId))} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md ml-1" title="Masquer"><X className="w-3.5 h-3.5" /></button>
                                  </div>
                               );
                            })}
                            
                            {/* INACTIVE BLOCKS */}
                            {blockDefs.filter(b => !homeBlocks.includes(b.id)).map(def => {
                               const Icon = def.icon;
                               return (
                                  <div key={def.id} onClick={() => { setHomeBlocks([...homeBlocks, def.id]); setActiveSidebarSection(def.id); }} className={`bg-slate-50/50 border border-slate-200 border-dashed rounded-lg p-2.5 flex items-center gap-3 cursor-pointer hover:bg-white transition-all opacity-60 hover:opacity-100`}>
                                     <div className="w-8 h-8 rounded bg-slate-100 text-slate-400 flex items-center justify-center"><Icon className="w-4 h-4" /></div>
                                     <span className="text-[11px] font-bold text-slate-500 flex-1">{def.name}</span>
                                     <Plus className="w-4 h-4 text-slate-400 mr-2" />
                                  </div>
                               );
                            })}
                         </div>
                      );
                   })()}
                </div>

                <div className="space-y-4">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isAr ? 'إعدادات القسم المحدد' : 'Paramètres de la Section'}</h4>
                   
                    {activeSidebarSection === 'hero' && (
                       <>
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'النص الرئيسي' : 'Texte Principal'}</label>
                          <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'النص الفرعي' : 'Sous-titre'}</label>
                          <input type="text" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'نص الزر' : 'Texte du Bouton'}</label>
                          <input type="text" value={heroButtonText} onChange={(e) => setHeroButtonText(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'صورة الغلاف' : 'Image de Couverture'}</label>
                          <label className="w-full h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors group relative overflow-hidden">
                             {heroImage ? (
                                <img src={heroImage} className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                             ) : null}
                             <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-slate-400 mb-1" />
                                <span className="text-[10px] font-bold text-slate-500">{isAr ? 'تغيير الصورة' : 'Changer l\'image'}</span>
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
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'صور السلايدر' : 'Images du Slider'}</label>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                             {sliderImages.map((img, idx) => (
                                <div key={idx} className="relative aspect-video rounded border border-slate-200 overflow-hidden group">
                                   <img src={img} className="w-full h-full object-cover" />
                                   <button onClick={() => setSliderImages(sliderImages.filter((_, i) => i !== idx))} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow"><X className="w-3 h-3"/></button>
                                </div>
                             ))}
                          </div>
                          <label className="w-full h-12 border-2 border-dashed border-indigo-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 text-indigo-500 transition-colors">
                             <span className="text-xs font-bold flex items-center gap-1"><Plus className="w-3 h-3"/> {isAr ? 'إضافة صورة' : 'Ajouter une image'}</span>
                             <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) setSliderImages([...sliderImages, await readFileAsBase64(file)]);
                             }} />
                          </label>
                       </div>
                    )}

                    {activeSidebarSection === 'collections' && (
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'عنوان التصنيفات' : 'Titre des Collections'}</label>
                          <input type="text" value={allCollectionsTitle} onChange={(e) => setAllCollectionsTitle(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                       </div>
                    )}

                    {activeSidebarSection === 'products' && (
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'عنوان المنتجات المميزة' : 'Titre des Produits'}</label>
                          <input type="text" value={homeCollectionsTitle} onChange={(e) => setHomeCollectionsTitle(e.target.value)} className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2" />
                       </div>
                    )}

                    <div className="pt-4 mt-4 border-t border-slate-100 space-y-4">
                       <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isAr ? 'التصميم والألوان' : 'Design & Couleurs'}</h4>

                       <div className="space-y-3">
                          <div>
                             <div className="flex items-center gap-2 mb-1.5">
                                <label className="w-7 h-7 rounded-lg border border-slate-200 cursor-pointer shrink-0 shadow-inner" style={{ backgroundColor: primaryColor }}>
                                   <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="opacity-0 w-0 h-0" />
                                </label>
                                <span className="text-[9px] font-bold text-slate-500 uppercase">{isAr ? 'أساسي' : 'Principale'}</span>
                             </div>
                             <div className="flex gap-1 flex-wrap">
                                {['#0f172a', '#1e3a8a', '#7c3aed', '#db2777', '#dc2626', '#d97706', '#16a34a', '#0891b2', '#b48a44', '#64748b'].map(color => (
                                   <button key={color} onClick={() => setPrimaryColor(color)} className={`w-5 h-5 rounded-full border-2 ${primaryColor === color ? 'border-indigo-500 scale-110' : 'border-white'} shadow-sm`} style={{ backgroundColor: color }} />
                                ))}
                             </div>
                          </div>
                          <div>
                             <div className="flex items-center gap-2 mb-1.5">
                                <label className="w-7 h-7 rounded-lg border border-slate-200 cursor-pointer shrink-0 shadow-inner" style={{ backgroundColor: secondaryColor }}>
                                   <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="opacity-0 w-0 h-0" />
                                </label>
                                <span className="text-[9px] font-bold text-slate-500 uppercase">{isAr ? 'ثانوي' : 'Secondaire'}</span>
                             </div>
                             <div className="flex gap-1 flex-wrap">
                                {['#ffffff', '#f8fafc', '#f1f5f9', '#fef9f0', '#f0fdf4', '#fdf4ff', '#111827', '#1a1a1a'].map(color => (
                                   <button key={color} onClick={() => setSecondaryColor(color)} className={`w-5 h-5 rounded-full border-2 ${secondaryColor === color ? 'border-indigo-500 scale-110' : 'border-slate-200'} shadow-sm`} style={{ backgroundColor: color }} />
                                ))}
                             </div>
                          </div>
                          <div>
                             <div className="flex items-center gap-2 mb-1.5">
                                <label className="w-7 h-7 rounded-lg border border-slate-200 cursor-pointer shrink-0 shadow-inner" style={{ backgroundColor: borderColor }}>
                                   <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="opacity-0 w-0 h-0" />
                                </label>
                                <span className="text-[9px] font-bold text-slate-500 uppercase">{isAr ? 'حدود' : 'Bordures'}</span>
                             </div>
                             <div className="flex gap-1 flex-wrap">
                                {['#e2e8f0', '#f1f5f9', '#e5e7eb', '#fde68a', '#000000', '#ffffff'].map(color => (
                                   <button key={color} onClick={() => setBorderColor(color)} className={`w-5 h-5 rounded-full border-2 ${borderColor === color ? 'border-indigo-500 scale-110' : 'border-slate-200'} shadow-sm`} style={{ backgroundColor: color }} />
                                ))}
                             </div>
                          </div>
                       </div>

                       <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'شكل الأزرار' : 'Style des boutons'}</label>
                          <div className="grid grid-cols-3 gap-1.5">
                             {(['rounded', 'pill', 'square'] as const).map(key => (
                                <button key={key} onClick={() => setButtonStyle(key)} className={`py-1.5 text-[9px] font-bold rounded-lg border ${buttonStyle === key ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-500'}`}>
                                   {key === 'rounded' ? (isAr ? 'مستدير' : 'Arrondi') : key === 'pill' ? (isAr ? 'كبسولة' : 'Capsule') : (isAr ? 'مربع' : 'Carré')}
                                </button>
                             ))}
                          </div>
                       </div>

                       <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'شكل بطاقات المنتجات' : 'Cartes produits'}</label>
                          <div className="grid grid-cols-3 gap-1.5">
                             {(['rounded', 'square', 'arch', 'pill', 'trend'] as const).map(key => (
                                <button key={key} onClick={() => setCardStyle(key)} className={`py-1.5 text-[9px] font-bold rounded-lg border ${cardStyle === key ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-500'}`}>
                                   {key === 'rounded' ? (isAr ? 'مستدير' : 'Arrondi') : key === 'square' ? (isAr ? 'مربع' : 'Carré') : key === 'arch' ? (isAr ? 'قوس' : 'Arche') : key === 'pill' ? (isAr ? 'كبسولة' : 'Pilule') : (isAr ? 'ترند' : 'Trendy')}
                                </button>
                             ))}
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-2">
                          <div>
                             <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block truncate">{isAr ? 'فوتر - خلفية' : 'Footer - Fond'}</label>
                             <label className="w-full h-8 rounded-lg border border-slate-200 cursor-pointer block shadow-inner" style={{ backgroundColor: footerBgColor }}>
                                <input type="color" value={footerBgColor} onChange={(e) => setFooterBgColor(e.target.value)} className="opacity-0 w-0 h-0" />
                             </label>
                          </div>
                          <div>
                             <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block truncate">{isAr ? 'فوتر - نص' : 'Footer - Texte'}</label>
                             <label className="w-full h-8 rounded-lg border border-slate-200 cursor-pointer block shadow-inner" style={{ backgroundColor: footerTextColor }}>
                                <input type="color" value={footerTextColor} onChange={(e) => setFooterTextColor(e.target.value)} className="opacity-0 w-0 h-0" />
                             </label>
                          </div>
                       </div>

                       <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'قائمة التنقل' : 'Menu de navigation'}</label>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                             <label className="w-full h-8 rounded-lg border border-slate-200 cursor-pointer block shadow-inner" style={{ backgroundColor: menuTextColor }} title={isAr ? 'لون غير نشط' : 'Inactif'}>
                                <input type="color" value={menuTextColor} onChange={(e) => setMenuTextColor(e.target.value)} className="opacity-0 w-0 h-0" />
                             </label>
                             <label className="w-full h-8 rounded-lg border border-slate-200 cursor-pointer block shadow-inner" style={{ backgroundColor: menuActiveColor || primaryColor }} title={isAr ? 'لون نشط' : 'Actif'}>
                                <input type="color" value={menuActiveColor || primaryColor} onChange={(e) => setMenuActiveColor(e.target.value)} className="opacity-0 w-0 h-0" />
                             </label>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                             {(['underline', 'pill', 'bold'] as const).map(key => (
                                <button key={key} onClick={() => setMenuStyle(key)} className={`py-1.5 text-[9px] font-bold rounded-lg border ${menuStyle === key ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-500'}`}>
                                   {key === 'underline' ? (isAr ? 'تسطير' : 'Souligné') : key === 'pill' ? (isAr ? 'كبسولة' : 'Capsule') : (isAr ? 'عريض' : 'Gras')}
                                </button>
                             ))}
                          </div>
                       </div>

                       <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'حجم البانر' : 'Taille de la bannière'}</label>
                          <div className="flex items-center gap-2">
                             <input type="range" min={250} max={800} step={10} value={heroHeight} onChange={e => setHeroHeight(parseInt(e.target.value))} className="flex-1 accent-indigo-600" />
                             <span className="text-[9px] font-mono font-bold text-slate-500 w-9 text-right">{heroHeight}px</span>
                          </div>
                       </div>

                       <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'موضع صورة البانر' : "Position de l'image"}</label>
                          <div className="grid grid-cols-3 gap-1 w-24">
                             {[0, 50, 100].map(y => (
                                [0, 50, 100].map(x => (
                                   <button key={`${x}-${y}`} onClick={() => { setHeroImagePosX(x); setHeroImagePosY(y); }} className={`w-7 h-7 rounded border flex items-center justify-center ${heroImagePosX === x && heroImagePosY === y ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${heroImagePosX === x && heroImagePosY === y ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                                   </button>
                                ))
                             ))}
                          </div>
                       </div>

                       <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">{isAr ? 'الخط' : 'Typographie'}</label>
                          <div className="grid grid-cols-3 gap-1.5">
                             <button onClick={() => setFontFamily('font-sans')} className={`py-1.5 text-[9px] font-bold rounded-lg border font-sans ${fontFamily === 'font-sans' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-500'}`}>Sans</button>
                             <button onClick={() => setFontFamily('font-serif')} className={`py-1.5 text-[9px] font-bold rounded-lg border font-serif ${fontFamily === 'font-serif' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-500'}`}>Serif</button>
                             <button onClick={() => setFontFamily('font-mono')} className={`py-1.5 text-[9px] font-bold rounded-lg border font-mono ${fontFamily === 'font-mono' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-500'}`}>Mono</button>
                          </div>
                       </div>
                    </div>
                </div>
             </div>

             <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button onClick={handleSave} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                   <Save className="w-4 h-4" /> {isAr ? 'حفظ التغييرات' : 'Sauvegarder'}
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
                  <StorePreviewWrapper isModal={true} initialProductId={previewProductId} />
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
                  <button onClick={() => setIsPageModalOpen(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">{isAr ? 'إلغاء' : 'Annuler'}</button>
                  <button onClick={() => {
                     setStorePages(storePages.map(p => p.id === pageForm.id ? pageForm : p));
                     setIsPageModalOpen(false);
                  }} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">{isAr ? 'حفظ' : 'Enregistrer'}</button>
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
      {isDeliveryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
               <h3 className="text-lg font-black text-slate-800">{isAr ? 'إضافة شركة توصيل' : 'Ajouter une société'}</h3>
               <button onClick={() => setIsDeliveryModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{isAr ? 'اسم الشركة' : 'Nom de la société'}</label>
                  <input type="text" value={newDeliveryCompany.name} onChange={(e) => setNewDeliveryCompany({...newDeliveryCompany, name: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold text-sm" placeholder="Ex: Amana, Ghazal..." />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{isAr ? 'نوع الخدمة' : 'Type de service'}</label>
                  <input type="text" value={newDeliveryCompany.type} onChange={(e) => setNewDeliveryCompany({...newDeliveryCompany, type: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold text-sm" placeholder="Ex: Express, Standard..." />
               </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
               <button onClick={() => setIsDeliveryModalOpen(false)} className="flex-1 py-3 font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors">{isAr ? 'إلغاء' : 'Annuler'}</button>
               <button onClick={() => {
                  if(newDeliveryCompany.name) {
                     setDeliveryCompanies([...deliveryCompanies, { ...newDeliveryCompany, id: Date.now() }]);
                     setNewDeliveryCompany({ name: '', type: 'Standard • National', isActive: true });
                     setIsDeliveryModalOpen(false);
                  }
               }} className="flex-1 py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors">{isAr ? 'إضافة' : 'Ajouter'}</button>
            </div>
          </div>
        </div>
      )}

      {activeAppModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
               <h3 className="text-lg font-black text-slate-800">{isAr ? 'إعداد' : 'Configurer'} {activeAppModal}</h3>
               <button onClick={() => setActiveAppModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6">
               <label className="block text-sm font-bold text-slate-700 mb-2">
                  {activeAppModal === 'WhatsApp Chat' ? (isAr ? 'رقم الواتساب (مثال: +212600000000)' : 'Numéro WhatsApp (ex: +212600000000)') :
                   activeAppModal === 'Facebook Pixel' ? (isAr ? 'معرف بيكسل فيسبوك' : 'ID Pixel Facebook') :
                   activeAppModal === 'TikTok Pixel' ? (isAr ? 'معرف بيكسل تيك توك' : 'ID Pixel TikTok') :
                   activeAppModal === 'Google Analytics 4' ? (isAr ? 'معرف التتبع (G-XXXXXXX)' : 'ID de suivi (G-XXXXXXX)') :
                   activeAppModal === 'AI Auto-Builder' ? (isAr ? 'اكتب "ACTIF" لتفعيل الميزة' : 'Tapez "ACTIF" pour activer cette option') :
                   (isAr ? 'رقم التعريف / المفتاح' : 'ID / Clé d\'API')}
               </label>
               <input 
                  type="text" 
                  value={appInputValue}
                  onChange={(e) => setAppInputValue(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                  placeholder="..."
               />
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
               <button onClick={() => setActiveAppModal(null)} className="flex-1 py-3 font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors">{isAr ? 'إلغاء' : 'Annuler'}</button>
               <button onClick={() => {
                  setAppsConfig(prev => ({ ...prev, [activeAppModal]: appInputValue }));
                  setActiveAppModal(null);
               }} className="flex-1 py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors">{isAr ? 'حفظ التغييرات' : 'Enregistrer'}</button>
            </div>
          </div>
        </div>
      )}

      {isProductModalOpen && (
        <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8">
           <div className="bg-white w-full max-w-7xl max-h-[95vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
                 <div>
                    <h2 className="text-3xl font-black text-slate-800">{productForm?.id ? (isAr ? 'تعديل المنتج' : 'Modifier le Produit') : (isAr ? 'إضافة منتج جديد' : 'Créer un Produit')}</h2>
                    <p className="text-slate-500 mt-2">{isAr ? 'التفاصيل، المخزون، والمتغيرات.' : 'Détails, inventaire, et variantes de votre article.'}</p>
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
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-4">{isAr ? 'صورة المنتج' : 'Image du Produit'}</label>
                          <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors group relative overflow-hidden">
                             {productForm?.image ? (
                                <img src={productForm.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                             ) : (
                                <>
                                   <ImageIcon className="w-12 h-12 text-slate-300 group-hover:text-indigo-400 mb-2 transition-colors" />
                                   <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600">{isAr ? 'إضافة صورة' : 'Ajouter une image'}</span>
                                </>
                             )}
                             <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                   setProductForm({...productForm, image: await readFileAsBase64(file)});
                                }
                             }} />
                          </label>
                          {appsConfig['AI Auto-Builder'] && productForm?.image && (
                             <button onClick={handleAIGenerate} disabled={isAIGenerating} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-purple-600/30 hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100">
                                {isAIGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                {isAr ? 'تحليل بالذكاء الاصطناعي' : 'Analyser avec l\'IA ✨'}
                             </button>
                          )}
                       </div>
                    </div>
                    {/* Middle Column (Details) */}
                    <div className="col-span-5 space-y-6 flex flex-col">
                       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">{isAr ? 'المعلومات الأساسية' : 'Informations Générales'}</label>
                          <div>
                             <input type="text" placeholder={isAr ? 'اسم المنتج (مثال: قميص فاخر)' : 'Titre du produit (ex: Premium T-Shirt)'} value={productForm?.name || ''} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-lg font-bold" />
                          </div>
                          <div className="flex gap-4">
                             <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">{isAr ? 'السعر (درهم)' : 'Prix (MAD)'}</label>
                                <input type="number" placeholder="0.00" value={productForm?.price || ''} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold" />
                             </div>
                             <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">{isAr ? 'المخزون (الكمية)' : 'Stock (Quantité)'}</label>
                                <input type="number" placeholder="10" value={productForm?.stock || ''} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold" />
                             </div>
                          </div>
                          <div>
                             <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">{isAr ? 'الوصف' : 'Description'}</label>
                             <textarea rows={4} placeholder={isAr ? 'اوصف منتجك بالتفصيل...' : 'Décrivez votre produit en détail...'} value={productForm?.description || ''} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 resize-none"></textarea>
                          </div>
                       </div>
                    </div>
                    {/* Right Column (Variants) */}
                    <div className="col-span-4 space-y-6">
                       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">{isAr ? 'المتغيرات (المقاسات والألوان)' : 'Variantes (Tailles & Couleurs)'}</label>
                          <div>
                             <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3">{isAr ? 'المقاسات المتاحة' : 'Tailles Disponibles'}</label>
                             <div className="flex gap-2 mb-4">
                                <input type="text" placeholder={isAr ? 'مثال: XXL, 42, 6 سنوات...' : 'Ex: XXL, 42, 6 Ans...'} value={newSizeInput} onChange={e => setNewSizeInput(e.target.value)} onKeyDown={e => { if(e.key === 'Enter' && newSizeInput) { setProductForm({...productForm, sizes: [...(productForm.sizes||[]), newSizeInput]}); setNewSizeInput(''); e.preventDefault(); } }} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                                <button onClick={() => { if(newSizeInput) { setProductForm({...productForm, sizes: [...(productForm.sizes||[]), newSizeInput]}); setNewSizeInput(''); } }} className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors">{isAr ? 'إضافة' : 'Ajouter'}</button>
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
                             <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3">{isAr ? 'الألوان المتاحة' : 'Couleurs Disponibles'}</label>
                             <div className="flex gap-2 mb-4">
                                <div className="relative w-12 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-sm shrink-0">
                                   <input type="color" value={newColorInput} onChange={e => setNewColorInput(e.target.value)} className="absolute -inset-4 w-[200%] h-[200%] cursor-pointer" />
                                </div>
                                <input type="text" value={newColorInput} readOnly className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none uppercase" />
                                <button onClick={() => { if(!productForm?.colors?.includes(newColorInput)) { setProductForm({...productForm, colors: [...(productForm.colors||[]), newColorInput]}); } }} className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors">{isAr ? 'إضافة' : 'Ajouter'}</button>
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
                                 <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3">{isAr ? 'صور لكل لون (اختياري)' : 'Images par Couleur (Optionnel)'}</label>
                                 <div className="space-y-3">
                                    {productForm.colors.map((color: string) => (
                                       <div key={color} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                          <div className="flex items-center gap-3">
                                             <div className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: color }}></div>
                                             <span className="text-xs font-bold text-slate-600 capitalize">{isAr ? 'صورة المتغير' : 'Image Variante'}</span>
                                          </div>
                                          <div>
                                             <label className="cursor-pointer px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors flex items-center gap-2 shadow-sm">
                                                {productForm?.colorImages?.[color] ? (
                                                   <img src={productForm.colorImages[color]} className="w-5 h-5 rounded object-cover" alt="" />
                                                ) : (
                                                   <ImageIcon className="w-4 h-4" />
                                                )}
                                                {productForm?.colorImages?.[color] ? (isAr ? 'تغيير' : 'Changer') : (isAr ? 'ربط صورة' : 'Lier une image')}
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
                                      <label className="block text-xs font-black text-slate-800 uppercase mb-4">{isAr ? 'المخزون لكل متغير' : 'Stock par Variante'}</label>
                                      <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                          <table className="w-full text-left text-sm">
                                              <thead className="bg-white border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                                  <tr>
                                                      <th className="px-6 py-4">{isAr ? 'المتغير' : 'Variante'}</th>
                                                      <th className="px-6 py-4 w-40">{isAr ? 'الكمية (المخزون)' : 'Quantité (Stock)'}</th>
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
                                                                  {(!comb.size && comb.color) && <span className="uppercase text-[10px] text-slate-400 font-bold">{isAr ? 'لون' : 'Couleur'}</span>}
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
                           <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">{isAr ? 'الفئة' : 'Catégorie'}</label>
                           <input type="text" placeholder={isAr ? 'مثال: قميص, جاكيت, فستان...' : 'Ex: T-Shirt, Chemise, Robe...'} value={productForm?.category || ''} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold" />
                           <p className="text-[10px] text-slate-400 mt-2 font-medium">{isAr ? 'لتصنيف المنتج في فلاتر المتجر.' : 'Permet de classer le produit dans les filtres du magasin.'}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                           <div className="flex items-center gap-2 mb-2">
                              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">{isAr ? 'الكلمات الدلالية (SEO Tags)' : 'Mots-clés (SEO Tags)'}</label>
                              {appsConfig['AI Auto-Builder'] && <Sparkles className="w-3 h-3 text-purple-500" />}
                           </div>
                           <div className="flex gap-2 mb-3">
                              <input type="text" placeholder={isAr ? 'مثال: صيفي, فستان...' : 'Ex: été, robe, premium...'} value={newTagInput} onChange={e => setNewTagInput(e.target.value)} onKeyDown={e => { if(e.key === 'Enter' && newTagInput) { setProductForm({...productForm, tags: [...(productForm.tags||[]), newTagInput]}); setNewTagInput(''); e.preventDefault(); } }} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                              <button onClick={() => { if(newTagInput) { setProductForm({...productForm, tags: [...(productForm.tags||[]), newTagInput]}); setNewTagInput(''); } }} className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors">{isAr ? 'إضافة' : 'Ajouter'}</button>
                           </div>
                           <div className="flex flex-wrap gap-2">
                              {(productForm?.tags || []).map((tag: string) => (
                                 <div key={tag} className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700">
                                    {tag}
                                    <button onClick={() => setProductForm({...productForm, tags: productForm.tags.filter((t:string) => t !== tag)})} className="text-slate-400 hover:text-rose-500 ml-1"><X className="w-3 h-3" /></button>
                                 </div>
                              ))}
                           </div>
                           <p className="text-[10px] text-slate-400 mt-2 font-medium">{isAr ? 'تساعد في ظهور المنتج في محركات البحث.' : 'Améliore le référencement (SEO) de votre produit.'}</p>
                        </div>
                    </div>
                 </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                 <button onClick={() => setIsProductModalOpen(false)} className="px-8 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">{isAr ? 'إلغاء' : 'Annuler'}</button>
                 <button onClick={() => {
                    if(productForm?.name && productForm?.price) {
                       let newProds;
                       if(productForm.id) {
                          newProds = storeProducts.map(p => p.id === productForm.id ? productForm : p);
                       } else {
                          newProds = [{ id: Date.now(), ...productForm }, ...storeProducts];
                       }
                       setStoreProducts(newProds);
                       setIsProductModalOpen(false);
                       handleSave(newProds);
                    }
                 }} className="px-10 py-4 font-black uppercase tracking-widest bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-105 transition-all">
                    {productForm?.id ? (isAr ? 'تحديث المنتج' : 'Mettre à jour') : (isAr ? 'حفظ المنتج' : 'Enregistrer le produit')}
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
                        <h2 className="text-lg font-black text-slate-800">Commande #{selectedOrder.id.substring(0, 8).toUpperCase()}</h2>
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
                              <p className="text-sm font-black text-slate-800">{selectedOrder.phone || '-'}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-white rounded-full border border-slate-200 flex items-center justify-center"><Globe className="w-4 h-4 text-slate-400" /></div>
                           <div>
                              <p className="text-[10px] font-bold text-slate-500">Ville / Adresse</p>
                              <p className="text-sm font-black text-slate-800">{[selectedOrder.city, selectedOrder.address].filter(Boolean).join(', ') || '-'}</p>
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
                                 <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                                    {prod.photo ? (
                                       <img src={prod.photo} alt={prod.name} className="w-full h-full object-cover" onError={(e: any) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                    ) : null}
                                    <ImageIcon className={`w-6 h-6 text-slate-300 ${prod.photo ? 'hidden' : ''}`} />
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
                        <button onClick={() => handleDeleteOrder(selectedOrder.id)} className="w-12 h-12 shrink-0 bg-white border border-rose-200 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-700 transition-colors active:scale-95" title={isAr ? 'حذف الطلب' : 'Supprimer'}>
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
                  <h2 className="text-xl font-black text-slate-800 mb-2">{isAr ? 'نقل إلى سلة المهملات؟' : 'Déplacer vers la corbeille ?'}</h2>
                  <p className="text-slate-500 text-sm mb-6">{isAr ? 'سيتم نقل هذا الطلب إلى سلة المهملات. يمكنك حذفه نهائياً من هناك.' : 'Cette commande sera déplacée vers la corbeille. Vous pourrez la supprimer définitivement par la suite.'}</p>
                  
                  <div className="flex gap-3">
                     <button onClick={() => setOrderToDelete(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">{isAr ? 'إلغاء' : 'Annuler'}</button>
                     <button onClick={confirmDeleteOrder} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-md shadow-rose-200 transition-colors text-sm">{isAr ? 'نقل' : 'Confirmer'}</button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* BULK DELETE CONFIRMATION MODAL */}
      {isBulkDeleteOpen && (
         <div className="fixed inset-0 z-[600] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
               <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                     <Trash2 className="w-8 h-8 text-rose-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 mb-2">
                     {showTrash
                        ? (isAr ? `حذف ${selectedOrderIds.length} طلب نهائياً؟` : `Supprimer définitivement ${selectedOrderIds.length} commande(s) ?`)
                        : (isAr ? `نقل ${selectedOrderIds.length} طلب إلى سلة المهملات؟` : `Déplacer ${selectedOrderIds.length} commande(s) vers la corbeille ?`)}
                  </h2>
                  <p className="text-slate-500 text-sm mb-6">
                     {showTrash
                        ? (isAr ? 'لا يمكن التراجع عن هذا الإجراء.' : 'Cette action est irréversible.')
                        : (isAr ? 'يمكنك استعادتها لاحقاً من سلة المهملات.' : 'Vous pourrez les restaurer depuis la corbeille.')}
                  </p>
                  <div className="flex gap-3">
                     <button onClick={() => setIsBulkDeleteOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">{isAr ? 'إلغاء' : 'Annuler'}</button>
                     <button onClick={confirmBulkDelete} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-md shadow-rose-200 transition-colors text-sm">{isAr ? 'تأكيد' : 'Confirmer'}</button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* PRO THEME UPSELL MODAL */}
      {proUpsellTheme && (
         <div className="fixed inset-0 z-[600] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setProUpsellTheme(null)}>
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
               <div className="aspect-video bg-cover bg-center relative" style={{ backgroundImage: `url(${proUpsellTheme.previewImg})` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-slate-900/10 flex items-end p-4">
                     <span className="text-white font-black tracking-widest uppercase">{proUpsellTheme.name}</span>
                  </div>
               </div>
               <div className="p-6 text-center">
                  <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                     <ShieldCheck className="w-7 h-7 text-amber-500" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 mb-2">{isAr ? 'تصميم Pro' : 'Thème Pro'}</h2>
                  <p className="text-slate-500 text-sm mb-6">
                     {isAr ? 'هذا التصميم متاح فقط لأصحاب باقة Pro. تواصل معنا لترقية باقتك وفتح جميع التصاميم المميزة.' : "Ce thème fait partie du Pack Pro. Contactez-nous pour passer au plan Pro et débloquer tous les thèmes premium."}
                  </p>
                  <div className="flex gap-3">
                     <button onClick={() => setProUpsellTheme(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">{isAr ? 'إغلاق' : 'Fermer'}</button>
                     <button onClick={() => { setProUpsellTheme(null); setActiveTab('settings'); }} className="flex-1 py-3 bg-amber-400 text-slate-900 font-bold rounded-xl hover:bg-amber-500 transition-colors text-sm flex items-center justify-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> {isAr ? 'ترقية' : 'Upgrade'}
                     </button>
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
                <span className="text-xs font-black text-slate-700 pl-2 uppercase tracking-wider">{isAr ? 'اللون:' : 'Couleur:'}</span>
                <label className="w-10 h-10 rounded-full cursor-pointer shadow-inner border-[3px] border-white ring-2 ring-slate-100" style={{ backgroundColor: primaryColor }} title="Changer la couleur">
                   <input type="color" className="opacity-0 w-0 h-0" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                </label>
             </div>
          </div>
       )}
    </div>
  );
}
