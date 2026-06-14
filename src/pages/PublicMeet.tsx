import React from 'react';
import { loadCompanyProfile } from '../types';

export default function PublicMeet() {
  const company = loadCompanyProfile();
  
  // Read the 'server' query param from the URL to determine which server to load
  const serverMode = new URLSearchParams(window.location.hash.split('?')[1]).get('server') || 'jitsi';
  
  const roomName = `BEYA_${(company.name || 'COMPANY').replace(/[^a-zA-Z0-9]/g, '_')}_Room`;
  
  const jitsiUrl = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.disableDeepLinking=true&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false&interfaceConfig.SHOW_BRAND_WATERMARK=false`;
  const dailyUrl = `https://beyacreative.daily.co/BEYACREATIVE`;

  const finalUrl = serverMode === 'daily' ? dailyUrl : jitsiUrl;

  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col">
      {/* Header with Company Logo */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-center shadow-md z-10 relative">
        <img src={company.logoUrl || '/logo.png'} alt={company.name} className="h-8 object-contain drop-shadow-xl" />
        <span className="ml-3 text-white font-black tracking-widest uppercase text-sm">Meeting Room</span>
      </div>
      
      {/* Full screen iframe */}
      <div className="flex-1 w-full relative bg-black">
        <iframe
          src={finalUrl}
          allow="camera; microphone; display-capture; fullscreen"
          className="w-full h-full border-0 absolute inset-0"
        />
      </div>
    </div>
  );
}
