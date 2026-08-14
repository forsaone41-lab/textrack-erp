import React, { useState } from 'react';
import { 
  Users, Stethoscope, HeartPulse, ShieldCheck, 
  Smile, Sparkles, Activity, CheckCircle2, 
  MapPin, Phone, Mail, Calendar, Clock
} from 'lucide-react';

const ToothIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10 22v-5M14 22v-5" />
    <path d="M10 17H8a4 4 0 0 1-4-4v-2c0-3 2-6 6-6h4c4 0 6 3 6 6v2a4 4 0 0 1-4 4h-2" />
    <path d="M10 17v5a2 2 0 0 0 4 0v-5" />
  </svg>
);

export default function DentistDemo() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const preventScroll = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      
      {/* Top Banner */}
      <div className="bg-sky-50 py-1 px-6 text-right text-[11px] font-medium text-slate-600 border-b border-sky-100 hidden md:block">
        <span className="text-red-500 font-bold">Emergency?</span> Call: (555) 123-4567
      </div>

      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => showToast('Home')}>
            <div className="bg-sky-500 text-white p-2 rounded-lg">
              <ToothIcon className="w-6 h-6" />
            </div>
            <div className="leading-tight">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">BrightSmile</h1>
              <p className="text-[12px] font-medium text-sky-600 tracking-wide uppercase">Dental</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#" onClick={(e) => { preventScroll(e); showToast('Services'); }} className="hover:text-sky-600 transition-colors">Services</a>
            <a href="#" onClick={(e) => { preventScroll(e); showToast('About Us'); }} className="hover:text-sky-600 transition-colors">About Us</a>
            <a href="#" onClick={(e) => { preventScroll(e); showToast('Patient Info'); }} className="hover:text-sky-600 transition-colors">Patient Info</a>
            <a href="#" onClick={(e) => { preventScroll(e); showToast('Blog'); }} className="hover:text-sky-600 transition-colors">Blog</a>
            <a href="#" onClick={(e) => { preventScroll(e); showToast('Contact'); }} className="hover:text-sky-600 transition-colors">Contact</a>
            <button onClick={() => showToast('Booking Modal')} className="border-2 border-sky-500 text-sky-600 hover:bg-sky-500 hover:text-white px-5 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-colors ml-2">
              Book Online
            </button>
          </nav>

        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#eef8ff]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 items-center">
          <div className="py-20 md:py-32 md:pr-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 leading-tight mb-6">
              Your Family's Partner for a Brighter, Healthier Smile
            </h2>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              Professional, compassionate, and advanced dental care for all ages.
            </p>
            <button onClick={() => showToast('Appointment Form')} className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-sky-500/30">
              Book Your Appointment Now
            </button>
          </div>
          <div className="h-full hidden md:block relative">
            <div className="absolute inset-y-0 right-0 w-full overflow-hidden">
               <img src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1000&auto=format&fit=crop" alt="Dentist and Patient" className="w-full h-full object-cover object-center rounded-bl-[100px]" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Why Choose Us</h2>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => showToast('Experienced Team Info')}>
            <div className="w-20 h-20 rounded-full bg-sky-50 flex items-center justify-center mb-6 group-hover:bg-sky-500 group-hover:text-white transition-colors text-sky-500">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-3">Experienced Team</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Our knowledgeable teams are committed to excellent service and personalized care.</p>
          </div>
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => showToast('Modern Technology Info')}>
            <div className="w-20 h-20 rounded-full bg-sky-50 flex items-center justify-center mb-6 group-hover:bg-sky-500 group-hover:text-white transition-colors text-sky-500">
              <Stethoscope className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-3">Modern Technology</h3>
            <p className="text-sm text-slate-500 leading-relaxed">We utilize professional modern technology and advanced treatments.</p>
          </div>
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => showToast('Comprehensive Care Info')}>
            <div className="w-20 h-20 rounded-full bg-sky-50 flex items-center justify-center mb-6 group-hover:bg-sky-500 group-hover:text-white transition-colors text-sky-500">
              <HeartPulse className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-3">Comprehensive Care</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Engaged professionals offering extensive care from checkups to orthos.</p>
          </div>
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => showToast('Trusted Results Info')}>
            <div className="w-20 h-20 rounded-full bg-sky-50 flex items-center justify-center mb-6 group-hover:bg-sky-500 group-hover:text-white transition-colors text-sky-500">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-3">Trusted Results</h3>
            <p className="text-sm text-slate-500 leading-relaxed">We use tested methods to deliver excellent, long-lasting results for your smile.</p>
          </div>
        </div>
      </section>

      {/* Our Dental Services */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-12">Our Dental Services</h2>
          
          <div className="grid md:grid-cols-4 gap-6 text-left">
            {/* Service 1 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col" onClick={() => showToast('General Dentistry')}>
              <div className="w-24 h-24 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-500 mb-6 mx-auto">
                <Smile className="w-12 h-12" />
              </div>
              <h3 className="font-bold text-lg text-center text-slate-800 mb-3">General Dentistry</h3>
              <p className="text-sm text-slate-500 text-center mb-6 flex-1">Routine checkups, professional cleanings, and preventive care to keep your smile healthy.</p>
              <button className="text-sky-600 font-bold text-sm text-center w-full hover:text-sky-800">Learn More &gt;</button>
            </div>
            {/* Service 2 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col" onClick={() => showToast('Cosmetic Dentistry')}>
              <div className="w-24 h-24 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-500 mb-6 mx-auto">
                <Sparkles className="w-12 h-12" />
              </div>
              <h3 className="font-bold text-lg text-center text-slate-800 mb-3">Cosmetic Dentistry</h3>
              <p className="text-sm text-slate-500 text-center mb-6 flex-1">Teeth whitening, veneers, and smile makeovers for a confident, dazzling look.</p>
              <button className="text-sky-600 font-bold text-sm text-center w-full hover:text-sky-800">Learn More &gt;</button>
            </div>
            {/* Service 3 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col" onClick={() => showToast('Orthodontics')}>
              <div className="w-24 h-24 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-500 mb-6 mx-auto">
                <Activity className="w-12 h-12" />
              </div>
              <h3 className="font-bold text-lg text-center text-slate-800 mb-3">Orthodontics</h3>
              <p className="text-sm text-slate-500 text-center mb-6 flex-1">Straighten your teeth with modern solutions including invisible aligners and braces.</p>
              <button className="text-sky-600 font-bold text-sm text-center w-full hover:text-sky-800">Learn More &gt;</button>
            </div>
            {/* Service 4 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col" onClick={() => showToast('Family Dentistry')}>
              <div className="w-24 h-24 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-500 mb-6 mx-auto">
                <Users className="w-12 h-12" />
              </div>
              <h3 className="font-bold text-lg text-center text-slate-800 mb-3">Family Dentistry</h3>
              <p className="text-sm text-slate-500 text-center mb-6 flex-1">Gentle, specialized care tailored for children, teens, adults, and seniors all in one place.</p>
              <button className="text-sky-600 font-bold text-sm text-center w-full hover:text-sky-800">Learn More &gt;</button>
            </div>
          </div>
        </div>
      </section>

      {/* Appointment Form */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-[#eef8ff] rounded-3xl p-10 md:p-14 text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-10">Request an Appointment</h2>
            
            <form className="grid md:grid-cols-2 gap-6 text-left" onSubmit={(e) => { e.preventDefault(); showToast('Appointment Requested!'); }}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
                <input type="text" placeholder="Name" className="w-full px-4 py-3 rounded-lg border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-lg border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
                <input type="tel" placeholder="Phone" className="w-full px-4 py-3 rounded-lg border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Date</label>
                <div className="relative">
                  <input type="date" className="w-full px-4 py-3 rounded-lg border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Time</label>
                <select className="w-full px-4 py-3 rounded-lg border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-500" required>
                  <option>Morning</option>
                  <option>Afternoon</option>
                  <option>Evening</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Service</label>
                <select className="w-full px-4 py-3 rounded-lg border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-500" required>
                  <option>General Checkup</option>
                  <option>Teeth Whitening</option>
                  <option>Braces / Invisalign</option>
                  <option>Emergency</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Message/Reason</label>
                <textarea rows={3} placeholder="Please provide any details..." className="w-full px-4 py-3 rounded-lg border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500"></textarea>
              </div>
              <div className="md:col-span-2 mt-4">
                <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 rounded-lg shadow-md transition-colors uppercase tracking-wider text-sm">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-sky-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-transparent px-4">
              <span className="text-6xl text-sky-200 font-serif leading-none">"</span>
              <p className="text-sm text-slate-600 italic mb-4 font-medium -mt-4">
                Exceptional service and care! I have never felt so comfortable at a dentist before. The staff is incredible.
              </p>
              <h5 className="font-bold text-slate-800 text-sm">Sarah Jenkins</h5>
            </div>
            <div className="bg-transparent px-4">
              <span className="text-6xl text-sky-200 font-serif leading-none">"</span>
              <p className="text-sm text-slate-600 italic mb-4 font-medium -mt-4">
                Dr. Emily made me feel so comfortable, which is rare. They clearly explained my options and took the time to listen to my concerns.
              </p>
              <h5 className="font-bold text-slate-800 text-sm">Michael T.</h5>
            </div>
            <div className="bg-transparent px-4">
              <span className="text-6xl text-sky-200 font-serif leading-none">"</span>
              <p className="text-sm text-slate-600 italic mb-4 font-medium -mt-4">
                My whole family comes here. The kids actually look forward to their visits! Very professional and comprehensive work.
              </p>
              <h5 className="font-bold text-slate-800 text-sm">Linda Robinson</h5>
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-10">
            <div className="w-2 h-2 rounded-full bg-sky-500"></div>
            <div className="w-2 h-2 rounded-full bg-sky-200"></div>
            <div className="w-2 h-2 rounded-full bg-sky-200"></div>
          </div>
        </div>
      </section>

      {/* Expert Dentists */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-12">Meet Our Expert Dentists</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-64 bg-slate-200">
                <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop" alt="Dr. Emily Reed" className="w-full h-full object-cover" />
              </div>
              <div className="p-8 text-left">
                <h3 className="font-bold text-xl text-slate-800 mb-2">Dr. Emily Reed</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Dr. Emily Reed is a highly professional and dedicated dentist with over 15 years of experience in restorative and cosmetic dentistry. She is passionate about patient care.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-64 bg-slate-200">
                <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=600&auto=format&fit=crop" alt="Dr. Mark Lee" className="w-full h-full object-cover object-top" />
              </div>
              <div className="p-8 text-left">
                <h3 className="font-bold text-xl text-slate-800 mb-2">Dr. Mark Lee</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Dr. Mark Lee is a friendly, exceptionally skilled orthodontist. He works closely with patients to develop customized treatment plans for the perfect smile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sky-50 pt-16 pb-8 border-t border-sky-100">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10 mb-12">
          
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-sky-500 text-white p-1.5 rounded-lg">
                <ToothIcon className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">BrightSmile</h2>
                <p className="text-[10px] font-medium text-sky-600 tracking-wide uppercase">Dental</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                <p>123 Smile Ave,<br/>City, ST 12345</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-sky-500 shrink-0" />
                <p>(555) 123-4567</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-sky-500 shrink-0" />
                <p>hello@brightsmile.com</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-6">Address</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><a href="#" className="hover:text-sky-600" onClick={preventScroll}>Home</a></li>
              <li><a href="#" className="hover:text-sky-600" onClick={preventScroll}>Patient New</a></li>
              <li><a href="#" className="hover:text-sky-600" onClick={preventScroll}>Contact Info</a></li>
              <li><a href="#" className="hover:text-sky-600" onClick={preventScroll}>Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><a href="#" className="hover:text-sky-600" onClick={preventScroll}>Home</a></li>
              <li><a href="#" className="hover:text-sky-600" onClick={preventScroll}>About Us</a></li>
              <li><a href="#" className="hover:text-sky-600" onClick={preventScroll}>Blog</a></li>
              <li><a href="#" className="hover:text-sky-600" onClick={preventScroll}>Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-6">Dental Services</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><a href="#" className="hover:text-sky-600" onClick={preventScroll}>Dental Services</a></li>
              <li><a href="#" className="hover:text-sky-600" onClick={preventScroll}>Cosmetic Dentistry</a></li>
              <li><a href="#" className="hover:text-sky-600" onClick={preventScroll}>Orthodontics</a></li>
              <li><a href="#" className="hover:text-sky-600" onClick={preventScroll}>Family Dentistry</a></li>
            </ul>
          </div>

        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-sky-200 text-center text-xs text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} BrightSmile Dental. All Rights Reserved.
        </div>
      </footer>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-sky-400" />
          <span className="font-sans font-medium">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
