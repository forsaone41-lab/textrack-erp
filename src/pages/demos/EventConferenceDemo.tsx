import React, { useState, useEffect } from 'react';
import {
  Menu, X, ArrowRight, Calendar, MapPin, Clock, CheckCircle2,
  ChevronDown, Mic2, Users, Sparkles, Ticket
} from 'lucide-react';

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);
const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
const Youtube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

export default function EventConferenceDemo() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const preventScroll = (e: React.MouseEvent) => e.preventDefault();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  // Countdown timer to a fixed future event date
  const eventDate = new Date('2026-11-20T09:00:00');
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, eventDate.getTime() - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, eventDate.getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  const speakers = [
    { name: 'Sofia Bennani', role: 'CEO, Nova Ventures', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop' },
    { name: 'Yassine El Idrissi', role: 'CTO, Fintech Atlas', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop' },
    { name: 'Laila Amrani', role: 'Head of Design, Orbit', img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=400&auto=format&fit=crop' },
    { name: 'Karim Fassi', role: 'Founder, Zenith Labs', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop' },
  ];

  const schedule: Record<number, { time: string; title: string; speaker: string; track: string }[]> = {
    1: [
      { time: '09:00 - 09:30', title: "Accueil & Enregistrement", speaker: 'Équipe Nexus', track: 'Hall Principal' },
      { time: '09:30 - 10:30', title: "Keynote: L'Avenir de l'Innovation au Maroc", speaker: 'Sofia Bennani', track: 'Scène Principale' },
      { time: '10:45 - 11:45', title: 'Construire des Produits Tech à Grande Échelle', speaker: 'Yassine El Idrissi', track: 'Salle Fintech' },
      { time: '13:00 - 14:00', title: 'Déjeuner & Networking', speaker: '—', track: 'Terrasse' },
      { time: '14:15 - 15:15', title: 'Design Systems qui Convertissent', speaker: 'Laila Amrani', track: 'Salle Design' },
    ],
    2: [
      { time: '09:30 - 10:30', title: 'Lever des Fonds en 2026: Ce qui Marche Vraiment', speaker: 'Karim Fassi', track: 'Scène Principale' },
      { time: '10:45 - 12:00', title: 'Table Ronde: Écosystème Startup MENA', speaker: 'Panel', track: 'Scène Principale' },
      { time: '13:00 - 14:00', title: 'Déjeuner & Networking', speaker: '—', track: 'Terrasse' },
      { time: '14:15 - 15:30', title: 'Atelier: Growth Hacking pour Startups', speaker: 'Yassine El Idrissi', track: 'Salle Fintech' },
      { time: '16:00 - 17:00', title: 'Clôture & Remise des Prix', speaker: 'Équipe Nexus', track: 'Scène Principale' },
    ],
  };

  const tickets = [
    { id: 'standard', name: 'Standard', price: '899 MAD', features: ['Accès aux 2 journées', 'Déjeuner inclus', 'Kit de bienvenue', 'Accès Networking'] },
    { id: 'vip', name: 'VIP', price: '1 899 MAD', badge: 'Populaire', features: ['Tout du pack Standard', 'Places assises premium', 'Accès Lounge VIP', 'Rencontre avec les speakers', 'Enregistrements vidéo'] },
    { id: 'premium', name: 'Premium', price: '3 500 MAD', features: ['Tout du pack VIP', 'Dîner privé avec speakers', 'Badge Premium', 'Accès salon executive', 'Suivi 1-on-1 post-event'] },
  ];

  const sponsors = ['ATLAS BANK', 'ORBIT TECH', 'NOVA VENTURES', 'ZENITH LABS', 'FINTECH MA', 'CLOUD9'];

  const faqs = [
    { q: 'Où se déroule la conférence ?', a: 'La conférence se déroule au Centre International de Conférences de Casablanca, Maroc.' },
    { q: 'Les billets sont-ils remboursables ?', a: "Oui, jusqu'à 15 jours avant l'événement. Après cette date, les billets sont transférables mais non remboursables." },
    { q: 'Y a-t-il un tarif étudiant ?', a: 'Oui, une réduction de 50% est disponible pour les étudiants sur présentation de leur carte étudiante valide.' },
    { q: 'Le parking est-il disponible sur place ?', a: "Oui, un parking gratuit est disponible pour tous les participants dans la limite des places disponibles." },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white font-sans selection:bg-fuchsia-500 selection:text-white">

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0a0a12]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-fuchsia-500 to-orange-400 flex items-center justify-center font-black text-black text-lg">N</div>
            <span className="font-black text-xl tracking-tight">NEXUS<span className="text-fuchsia-400">SUMMIT</span></span>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-300">
            <button onClick={() => scrollTo('about')} className="hover:text-white transition-colors">À Propos</button>
            <button onClick={() => scrollTo('speakers')} className="hover:text-white transition-colors">Intervenants</button>
            <button onClick={() => scrollTo('schedule')} className="hover:text-white transition-colors">Programme</button>
            <button onClick={() => scrollTo('tickets')} className="hover:text-white transition-colors">Billets</button>
            <button onClick={() => scrollTo('faq')} className="hover:text-white transition-colors">FAQ</button>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <button onClick={() => scrollTo('tickets')} className="bg-gradient-to-r from-fuchsia-500 to-orange-400 text-black px-6 py-2.5 rounded-full font-black text-sm hover:shadow-lg hover:shadow-fuchsia-500/30 hover:-translate-y-0.5 transition-all">
              Réserver un Billet
            </button>
          </div>

          <button className="lg:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#0a0a12] border-t border-white/10 px-6 py-6 flex flex-col gap-5 text-center font-bold text-slate-300">
            <button onClick={() => scrollTo('about')} className="hover:text-white transition-colors">À Propos</button>
            <button onClick={() => scrollTo('speakers')} className="hover:text-white transition-colors">Intervenants</button>
            <button onClick={() => scrollTo('schedule')} className="hover:text-white transition-colors">Programme</button>
            <button onClick={() => scrollTo('tickets')} className="hover:text-white transition-colors">Billets</button>
            <button onClick={() => scrollTo('faq')} className="hover:text-white transition-colors">FAQ</button>
            <button onClick={() => scrollTo('tickets')} className="bg-gradient-to-r from-fuchsia-500 to-orange-400 text-black px-6 py-3 rounded-full font-black text-sm mt-2">
              Réserver un Billet
            </button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-fuchsia-600/20 rounded-full blur-[140px] -z-0 translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] -z-0 -translate-x-1/3 translate-y-1/4" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-fuchsia-300 font-bold text-xs mb-8 uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> Édition 2026 — Casablanca
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.95] mb-8">
            L'AVENIR SE<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-orange-400">CONSTRUIT ICI.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            2 jours, 40+ intervenants, 1500 participants. Le rendez-vous incontournable de la tech, du business et de l'innovation au Maroc.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mb-14 text-slate-300 font-bold text-sm">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-fuchsia-400" /> 20–21 Novembre 2026</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-fuchsia-400" /> Centre de Conférences, Casablanca</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button onClick={() => scrollTo('tickets')} className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-fuchsia-500 to-orange-400 text-black rounded-2xl font-black text-lg hover:-translate-y-1 hover:shadow-2xl hover:shadow-fuchsia-500/30 transition-all flex items-center justify-center gap-2">
              Réserver ma Place <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => scrollTo('schedule')} className="w-full sm:w-auto px-8 py-4 bg-white/5 border-2 border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 hover:border-white/20 transition-all">
              Voir le Programme
            </button>
          </div>

          {/* Countdown */}
          <div className="grid grid-cols-4 gap-3 md:gap-6 max-w-xl mx-auto">
            {[{ label: 'Jours', val: days }, { label: 'Heures', val: hours }, { label: 'Min', val: minutes }, { label: 'Sec', val: seconds }].map((item) => (
              <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl py-4 backdrop-blur-sm">
                <div className="text-3xl md:text-4xl font-black tabular-nums">{String(item.val).padStart(2, '0')}</div>
                <div className="text-[10px] md:text-xs uppercase tracking-widest text-slate-400 font-bold mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / About */}
      <section id="about" className="py-20 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: '40+', label: 'Intervenants' },
            { val: '1500+', label: 'Participants' },
            { val: '2', label: 'Jours Intenses' },
            { val: '25', label: 'Sessions & Ateliers' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-orange-400 mb-2">{s.val}</div>
              <div className="text-slate-400 font-bold text-sm uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Speakers */}
      <section id="speakers" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-fuchsia-400 font-bold text-xs uppercase tracking-widest mb-4">
            <Mic2 className="w-4 h-4" /> Intervenants
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Ils Prendront la Parole</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {speakers.map((sp, idx) => (
            <div key={idx} className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-fuchsia-500/40 transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-[3/4] overflow-hidden">
                <img src={sp.img} alt={sp.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-4">
                <h3 className="font-bold">{sp.name}</h3>
                <p className="text-slate-400 text-xs font-medium">{sp.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Schedule */}
      <section id="schedule" className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-fuchsia-400 font-bold text-xs uppercase tracking-widest mb-4">
              <Clock className="w-4 h-4" /> Programme
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Deux Jours, Un Programme Complet</h2>
          </div>

          <div className="flex justify-center gap-3 mb-10">
            <button onClick={() => setActiveDay(1)} className={`px-6 py-3 rounded-full font-bold text-sm transition-colors ${activeDay === 1 ? 'bg-gradient-to-r from-fuchsia-500 to-orange-400 text-black' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
              Jour 1 — 20 Nov
            </button>
            <button onClick={() => setActiveDay(2)} className={`px-6 py-3 rounded-full font-bold text-sm transition-colors ${activeDay === 2 ? 'bg-gradient-to-r from-fuchsia-500 to-orange-400 text-black' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
              Jour 2 — 21 Nov
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {schedule[activeDay].map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-fuchsia-500/30 transition-colors">
                <div className="text-fuchsia-400 font-black text-sm w-full md:w-32 shrink-0">{item.time}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.speaker} · {item.track}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tickets */}
      <section id="tickets" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-fuchsia-400 font-bold text-xs uppercase tracking-widest mb-4">
            <Ticket className="w-4 h-4" /> Billets
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Choisissez Votre Pass</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tickets.map((tk) => (
            <div key={tk.id} className={`relative rounded-3xl p-8 border transition-all duration-300 hover:-translate-y-2 ${tk.badge ? 'bg-gradient-to-b from-fuchsia-500/10 to-transparent border-fuchsia-500/40 shadow-xl shadow-fuchsia-500/10' : 'bg-white/5 border-white/10'}`}>
              {tk.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-fuchsia-500 to-orange-400 text-black text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider">
                  {tk.badge}
                </span>
              )}
              <h3 className="text-2xl font-black mb-2">{tk.name}</h3>
              <div className="text-4xl font-black mb-6">{tk.price}</div>
              <ul className="space-y-3 mb-8">
                {tk.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-fuchsia-400 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setSelectedTicket(tk)}
                className={`w-full py-3.5 rounded-xl font-black transition-all ${tk.badge ? 'bg-gradient-to-r from-fuchsia-500 to-orange-400 text-black hover:shadow-lg hover:shadow-fuchsia-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                Choisir {tk.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Sponsors */}
      <section className="py-16 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-slate-500 font-bold text-xs uppercase tracking-widest mb-10">Ils Nous Soutiennent</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {sponsors.map((s) => (
              <span key={s} className="text-xl md:text-2xl font-black text-slate-600 hover:text-slate-300 transition-colors tracking-tight cursor-default select-none">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Venue */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-fuchsia-400 font-bold text-xs uppercase tracking-widest mb-4">
              <MapPin className="w-4 h-4" /> Lieu de l'Événement
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-6">Centre de Conférences, Casablanca</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Situé au cœur du quartier d'affaires, facilement accessible en transport et disposant d'un large parking gratuit pour tous les participants.
            </p>
            <button onClick={() => showToast('Ouverture de la carte...')} className="inline-flex items-center gap-2 font-bold text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
              Voir sur la carte <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="rounded-3xl overflow-hidden border border-white/10 h-72">
            <iframe
              title="venue-map"
              className="w-full h-full grayscale invert-[0.9] contrast-125"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-7.6350%2C33.5650%2C-7.5850%2C33.6050&layer=mapnik&marker=33.5850%2C-7.6100"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black tracking-tight">Questions Fréquentes</h2>
          </div>
          <div className="flex flex-col gap-4">
            {faqs.map((f, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full flex items-center justify-between px-6 py-5 text-left font-bold">
                  {f.q}
                  <ChevronDown className={`w-5 h-5 shrink-0 text-fuchsia-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-slate-400 leading-relaxed text-sm">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/20 via-transparent to-orange-500/10" />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <Users className="w-12 h-12 text-fuchsia-400 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Prêt à Rejoindre l'Aventure ?</h2>
          <p className="text-slate-400 text-lg mb-10">Les places sont limitées. Réservez votre billet dès maintenant.</p>
          <button onClick={() => scrollTo('tickets')} className="px-10 py-5 bg-gradient-to-r from-fuchsia-500 to-orange-400 text-black rounded-2xl font-black text-xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-fuchsia-500/30 transition-all inline-flex items-center gap-3">
            Réserver Maintenant <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-20 pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-fuchsia-500 to-orange-400 flex items-center justify-center font-black text-black text-lg">N</div>
              <span className="font-black text-xl tracking-tight">NEXUS<span className="text-fuchsia-400">SUMMIT</span></span>
            </div>
            <div className="flex gap-4">
              <a href="#" onClick={preventScroll} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" onClick={preventScroll} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" onClick={preventScroll} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"><Linkedin className="w-4 h-4" /></a>
              <a href="#" onClick={preventScroll} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"><Youtube className="w-4 h-4" /></a>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm font-medium">
            <p>&copy; {new Date().getFullYear()} Nexus Summit. Tous droits réservés.</p>
            <div className="flex gap-6">
              <a href="#" onClick={preventScroll} className="hover:text-slate-300 transition-colors">Confidentialité</a>
              <a href="#" onClick={preventScroll} className="hover:text-slate-300 transition-colors">Conditions</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedTicket(null)}></div>
          <div className="bg-[#12121c] border border-white/10 rounded-3xl w-full max-w-md relative z-10 p-8 shadow-2xl animate-in zoom-in-95">
            <button onClick={() => setSelectedTicket(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black mb-1">Pass {selectedTicket.name}</h3>
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-orange-400 mb-6">{selectedTicket.price}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast(`Réservation confirmée pour le pass ${selectedTicket.name} !`);
                setSelectedTicket(null);
              }}
              className="flex flex-col gap-4"
            >
              <input required type="text" placeholder="Nom complet" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-fuchsia-500 transition-colors placeholder:text-slate-500" />
              <input required type="email" placeholder="Adresse email" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-fuchsia-500 transition-colors placeholder:text-slate-500" />
              <input required type="tel" placeholder="Téléphone" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-fuchsia-500 transition-colors placeholder:text-slate-500" />
              <button type="submit" className="w-full py-4 mt-2 bg-gradient-to-r from-fuchsia-500 to-orange-400 text-black rounded-xl font-black hover:shadow-lg hover:shadow-fuchsia-500/30 transition-all">
                Confirmer la Réservation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[300] bg-white text-black px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-fuchsia-500" />
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
