import React, { useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { Camera, ExternalLink, ChevronRight, Filter, Play } from 'lucide-react';
import { loadCompanyProfile } from '../types';

// Mock data representing BEYA Creative's Instagram portfolio
const PORTFOLIO_ITEMS = [
  {
    id: 1,
    type: 'image',
    category: 'traditional',
    src: '/portfolio/Capture.PNG',
    title: 'Instagram Post 1',
    description: 'BEYA Creative Instagram'
  },
  {
    id: 2,
    type: 'image',
    category: 'streetwear',
    src: '/portfolio/download.jpg',
    title: 'Instagram Post 2',
    description: 'BEYA Creative Instagram'
  },
  {
    id: 3,
    type: 'image',
    category: 'traditional',
    src: '/portfolio/download.png',
    title: 'Instagram Post 3',
    description: 'BEYA Creative Instagram'
  },
  {
    id: 4,
    type: 'image',
    category: 'streetwear',
    src: '/portfolio/h.jpg',
    title: 'Instagram Post 4',
    description: 'BEYA Creative Instagram'
  },
  {
    id: 5,
    type: 'image',
    category: 'process',
    src: '/portfolio/hh.jpg',
    title: 'Instagram Post 5',
    description: 'BEYA Creative Instagram'
  },
  {
    id: 6,
    type: 'image',
    category: 'traditional',
    src: '/portfolio/j.jpg',
    title: 'Instagram Post 6',
    description: 'BEYA Creative Instagram'
  },
  {
    id: 7,
    type: 'image',
    category: 'corporate',
    src: '/portfolio/jok.PNG',
    title: 'Instagram Post 7',
    description: 'BEYA Creative Instagram'
  },
  {
    id: 8,
    type: 'image',
    category: 'streetwear',
    src: '/portfolio/k.PNG',
    title: 'Instagram Post 8',
    description: 'BEYA Creative Instagram'
  },
  {
    id: 9,
    type: 'image',
    category: 'corporate',
    src: '/portfolio/s.jpg',
    title: 'Instagram Post 9',
    description: 'BEYA Creative Instagram'
  }
];



export default function Portfolio() {
  const { isAr } = useLang();
  const company = loadCompanyProfile();
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  return (
    <div className={`min-h-screen bg-slate-50 ${isAr ? 'font-sans' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header / Hero */}
      <div className="bg-slate-900 text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/atelier_background.png')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-slate-900/40" />
        
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 rounded-full p-1 mb-6 shadow-2xl">
            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center border-4 border-slate-900">
              <ExternalLink className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            {isAr ? 'معرض الأعمال' : 'Notre Portfolio'}
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium max-w-2xl mb-8">
            {isAr 
              ? 'اكتشف أحدث إبداعاتنا من الملابس الجاهزة، الستريتوير، وتصاميم الورشة المباشرة من حسابنا على إنستغرام.' 
              : 'Découvrez nos dernières créations, streetwear, et les coulisses de notre atelier.'}
          </p>
          
          <a 
            href="https://www.instagram.com/beyacreative/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 hover:scale-105 transition-all shadow-xl"
          >
            <ExternalLink className="w-5 h-5 text-pink-600" />
            {isAr ? 'تابعنا على إنستغرام' : 'Suivez-nous sur Instagram'}
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        
        {/* Masonry Layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 md:gap-8 space-y-6 md:space-y-8">
          {PORTFOLIO_ITEMS.map(item => (
            <div 
              key={item.id}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 cursor-pointer break-inside-avoid"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => window.open('https://www.instagram.com/beyacreative/', '_blank')}
            >
              {/* Image / Video Thumbnail */}
              <div className="relative w-full h-auto overflow-hidden bg-slate-900 group">
                <img 
                  src={item.src} 
                  alt={item.title}
                  className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Overlay on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent transition-opacity duration-300 ${hoveredItem === item.id ? 'opacity-100' : 'opacity-0 md:opacity-0 opacity-100'}`} />
                
                {/* Video Play Icon Indicator */}
                {item.type === 'video' && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                    <Play className="w-4 h-4 ml-0.5" />
                  </div>
                )}

                {/* Content Overlay */}
                <div className={`absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-300 ${hoveredItem === item.id ? 'translate-y-0' : 'translate-y-4 md:translate-y-8 translate-y-0'}`}>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 drop-shadow-md">
                    {item.title}
                  </h3>
                  <p className={`text-sm text-slate-200 font-medium line-clamp-2 transition-opacity duration-300 ${hoveredItem === item.id ? 'opacity-100' : 'opacity-100 md:opacity-0'}`}>
                    {item.description}
                  </p>
                  
                  <div className={`mt-4 flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-widest transition-opacity duration-300 ${hoveredItem === item.id ? 'opacity-100' : 'opacity-0'}`}>
                    <ExternalLink className="w-4 h-4" />
                    <span>{isAr ? 'عرض على إنستغرام' : 'Voir sur Instagram'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Footer */}
        <div className="mt-20 bg-indigo-50 border border-indigo-100 rounded-[3rem] p-8 md:p-12 text-center flex flex-col items-center">
          <Camera className="w-12 h-12 text-indigo-400 mb-6" />
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">
            {isAr ? 'هل أعجبتك أعمالنا؟' : 'Nos réalisations vous inspirent ?'}
          </h2>
          <p className="text-slate-600 font-medium mb-8 max-w-lg">
            {isAr 
              ? 'تواصل معنا الآن لتحويل فكرتك إلى واقع. نحن هنا لتصنيع أفضل الملابس لعلامتك التجارية.'
              : 'Contactez-nous dès maintenant pour transformer votre idée en réalité. Nous sommes là pour confectionner les meilleurs vêtements pour votre marque.'}
          </p>
          <a 
            href="/#/store-landing"
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg flex items-center gap-2"
          >
            {isAr ? 'ابدأ مشروعك معنا' : 'Démarrer votre projet'}
            <ChevronRight className="w-5 h-5" />
          </a>
        </div>

      </div>
    </div>
  );
}
