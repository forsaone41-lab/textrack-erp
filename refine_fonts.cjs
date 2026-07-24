const fs = require('fs');

try {
  let content = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

  // Change Hero Title size
  content = content.replace(
    /className="text-5xl md:text-7xl lg:text-\[5\.5rem\] font-black mb-8 tracking-tighter leading-\[1\.05\] uppercase text-slate-900/g,
    'className="text-4xl md:text-5xl lg:text-[4.5rem] font-extrabold mb-8 tracking-tight leading-tight uppercase text-slate-900'
  );

  // Change Hero Subtitle size and remove "Shopify"
  content = content.replace(
    /className="text-lg md:text-2xl text-slate-500 mb-14 font-medium max-w-3xl mx-auto leading-relaxed/g,
    'className="text-base md:text-lg text-slate-500 mb-14 font-medium max-w-3xl mx-auto leading-relaxed'
  );

  // Replace Arabic text
  content = content.replace(
    /سواء كنت تملك متجراً وتحتاج إلى تصنيع ملابس عالية الجودة، أو كنت تبدأ من الصفر وتحتاج لمتجر احترافي قوي كـ Shopify، نحن هنا لنحقق ذلك بأعلى معدل تحويل\./g,
    'سواء كنت تملك متجراً وتحتاج إلى تصنيع ملابس عالية الجودة، أو كنت تبدأ من الصفر وتحتاج لمتجر إلكتروني احترافي قوي، نحن هنا لنحقق ذلك بأعلى معدل تحويل.'
  );

  // Replace French text
  content = content.replace(
    /Que vous ayez déjà un site et cherchiez une confection de qualité, ou que vous partiez de zéro pour créer une boutique pro puissante, nous sommes là pour maximiser votre taux de conversion\./g,
    'Que vous ayez déjà un site et cherchiez une confection de qualité, ou que vous partiez de zéro pour créer une boutique en ligne professionnelle, nous sommes là pour maximiser votre taux de conversion.'
  );

  // Reduce some headings in the Services section from text-4xl md:text-6xl to text-3xl md:text-5xl
  content = content.replace(
    /className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-900 mb-6"/g,
    'className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-slate-900 mb-6"'
  );
  
  // Reduce card titles in Services
  content = content.replace(
    /className="text-3xl lg:text-4xl font-black uppercase tracking-tight mb-6 text-slate-900 leading-tight"/g,
    'className="text-2xl lg:text-3xl font-extrabold uppercase tracking-tight mb-6 text-slate-900 leading-tight"'
  );

  fs.writeFileSync('src/pages/LandingPage.tsx', content, 'utf8');
  console.log("Successfully refined fonts and removed 'Shopify'");
} catch(err) {
  console.error("Failed:", err);
}
