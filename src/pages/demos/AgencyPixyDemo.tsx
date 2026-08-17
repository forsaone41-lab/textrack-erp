import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, Menu, X, ArrowUpRight } from 'lucide-react';
import { trackPixelEvent } from '../../utils/pixel';

// CSS for the infinite marquee
const styles = `
  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-100%); }
  }
  @keyframes marquee-reverse {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(0%); }
  }
  .animate-marquee {
    display: flex;
    width: max-content;
    animation: marquee 30s linear infinite;
  }
  .animate-marquee-reverse {
    display: flex;
    width: max-content;
    animation: marquee-reverse 30s linear infinite;
  }
  .marquee-item {
    flex-shrink: 0;
    width: 300px;
    height: 400px;
    margin-right: 24px;
    border-radius: 16px;
    overflow: hidden;
  }
  @media (min-width: 768px) {
    .marquee-item {
      width: 400px;
      height: 500px;
    }
  }
`;

export default function AgencyPixyDemo() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    trackPixelEvent('ViewContent', { content_name: 'Agency Pixy Demo' });
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const marqueeImages1 = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607688969-a5bfcd64bd28?q=80&w=1000&auto=format&fit=crop",
  ];

  const marqueeImages2 = [
    "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?q=80&w=1000&auto=format&fit=crop",
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white selection:text-black overflow-hidden font-sans">
      <style>{styles}</style>
      
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0a0a0a]/80 backdrop-blur-md py-4 border-b border-white/10' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
          <div className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2">
             <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black">
                P
             </div>
             PIXY.
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {['About', 'Portfolio', 'Services', 'Contact'].map(link => (
              <a key={link} href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">{link}</a>
            ))}
          </nav>
          <button className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-200 transition-colors">
            Let's Talk <ArrowUpRight className="w-4 h-4" />
          </button>
          <button className="md:hidden text-white" onClick={() => setMobileMenu(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="fixed inset-0 z-[60] bg-[#0a0a0a] flex flex-col p-6 animate-in slide-in-from-top-4 duration-300">
           <div className="flex justify-end">
              <button onClick={() => setMobileMenu(false)} className="p-2 bg-white/10 rounded-full text-white">
                 <X className="w-6 h-6" />
              </button>
           </div>
           <nav className="flex flex-col gap-6 mt-12 text-3xl font-bold">
            {['About', 'Portfolio', 'Services', 'Contact'].map(link => (
              <a key={link} href="#" onClick={() => setMobileMenu(false)} className="text-white hover:text-gray-400 transition-colors">{link}</a>
            ))}
           </nav>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 lg:px-12 relative">
         <div className="container mx-auto">
            <h1 className="text-5xl md:text-7xl lg:text-[100px] font-black leading-[1.1] tracking-tighter uppercase mb-8 max-w-5xl">
               Pioneering <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">Creative</span> <br/>
               Excellence
            </h1>
            <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between max-w-5xl">
               <p className="text-lg md:text-xl text-gray-400 max-w-md leading-relaxed">
                 We specialize in crafting unique brands, captivating campaigns, and effective digital strategies.
               </p>
               <div className="flex items-center gap-4">
                  <button className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                     <ArrowRight className="w-6 h-6" />
                  </button>
                  <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Scroll Down</span>
               </div>
            </div>
         </div>
      </section>

      {/* Moving Pictures / Marquee Section */}
      <section className="py-20 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
        
        {/* Row 1 (LTR) */}
        <div className="flex mb-6">
          <div className="animate-marquee hover:[animation-play-state:paused]">
            {[...marqueeImages1, ...marqueeImages1, ...marqueeImages1, ...marqueeImages1].map((src, i) => (
              <div key={i} className="marquee-item group relative">
                <img src={src} alt="Portfolio" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 (RTL) */}
        <div className="flex">
          <div className="animate-marquee-reverse hover:[animation-play-state:paused]">
            {[...marqueeImages2, ...marqueeImages2, ...marqueeImages2, ...marqueeImages2].map((src, i) => (
              <div key={i} className="marquee-item group relative">
                <img src={src} alt="Portfolio" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 px-6 lg:px-12 bg-[#111]">
         <div className="container mx-auto">
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
               <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Our Services</h2>
               <p className="text-gray-400 max-w-sm">Comprehensive solutions designed to elevate your brand in the digital landscape.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
               {[
                 { title: "UI/UX Design", desc: "Design of intuitive and visually appealing user interfaces for web and mobile applications." },
                 { title: "Brand Strategy", desc: "Comprehensive brand development, including logo creation and visual style design." },
                 { title: "Marketing & SMM", desc: "Creation of impactful advertising campaigns designed to increase brand visibility." }
               ].map((srv, i) => (
                 <div key={i} className="group p-8 rounded-3xl bg-[#1a1a1a] border border-white/5 hover:border-white/20 transition-all duration-300">
                    <div className="text-5xl font-black text-white/10 mb-8 group-hover:text-white/20 transition-colors">0{i+1}</div>
                    <h3 className="text-2xl font-bold mb-4">{srv.title}</h3>
                    <p className="text-gray-400 leading-relaxed mb-8">{srv.desc}</p>
                    <a href="#" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest group-hover:text-white text-gray-500 transition-colors">
                       Read More <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </a>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-6 lg:px-12 border-y border-white/10">
         <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "14+", label: "Years Experience" },
              { num: "150+", label: "Unique Customers" },
              { num: "250+", label: "Completed Projects" },
              { num: "100%", label: "Client Satisfaction" }
            ].map((stat, i) => (
              <div key={i}>
                 <h4 className="text-5xl md:text-7xl font-black mb-2">{stat.num}</h4>
                 <p className="text-sm font-bold uppercase tracking-widest text-gray-500">{stat.label}</p>
              </div>
            ))}
         </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 px-6 lg:px-12 text-center">
         <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-8">Let's Talk</h2>
         <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">Ready to start your next project? We accept your requests 24/7. Feel free to write to us whenever it is convenient for you.</p>
         <button className="px-10 py-5 bg-white text-black rounded-full font-black text-lg hover:scale-105 transition-transform inline-flex items-center gap-3">
            Get in touch <ArrowUpRight className="w-6 h-6" />
         </button>
      </section>
    </div>
  );
}
