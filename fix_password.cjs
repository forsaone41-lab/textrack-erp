const fs = require('fs');

let content = fs.readFileSync('src/pages/Profil.tsx', 'utf8');

// 1. Add states for password change modal
if (!content.includes('const [showPasswordModal, setShowPasswordModal]')) {
    content = content.replace(
        /const \[isUploading, setIsUploading\] = useState\(false\);/,
        `const [isUploading, setIsUploading] = useState(false);\n  const [showPasswordModal, setShowPasswordModal] = useState(false);\n  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });\n  const [passError, setPassError] = useState('');`
    );
}

// 2. Add handlePasswordSubmit function
if (!content.includes('const handlePasswordSubmit')) {
    content = content.replace(
        /const handlePhotoChange = \(\) => \{/,
        `const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    
    if (currentUser.password && passForm.current !== currentUser.password) {
      setPassError(isAr ? 'كلمة المرور الحالية غير صحيحة' : 'Mot de passe actuel incorrect');
      return;
    }
    if (passForm.new.length < 4) {
      setPassError(isAr ? 'يجب أن تحتوي كلمة المرور على 4 أحرف على الأقل' : 'Le mot de passe doit contenir au moins 4 caractères');
      return;
    }
    if (passForm.new !== passForm.confirm) {
      setPassError(isAr ? 'كلمات المرور غير متطابقة' : 'Les mots de passe ne correspondent pas');
      return;
    }
    
    try {
      await saveRecord('users', { ...currentUser, password: passForm.new });
      setShowPasswordModal(false);
      setPassForm({ current: '', new: '', confirm: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setPassError(isAr ? 'حدث خطأ أثناء الحفظ' : 'Erreur lors de la sauvegarde');
    }
  };

  const handlePhotoChange = () => {`
    );
}

// 3. Add onClick to the "Changer le mot de passe" button
content = content.replace(
    /<button className="w-full flex items-center justify-between p-4 bg-white\/5 hover:bg-white\/10 rounded-2xl border border-white\/5 transition-all group">/g,
    `<button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group">`
);

// 4. Add the modal JSX just before the final </div> of the component (before ChevronRight)
if (!content.includes('Changer le mot de passeModal')) {
    const modalJSX = `
      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                {isAr ? 'تغيير كلمة المرور' : 'Changer le mot de passe'}
              </h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
              {passError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
                  {passError}
                </div>
              )}
              
              {currentUser.password && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{isAr ? 'كلمة المرور الحالية' : 'Mot de passe actuel'}</label>
                  <input
                    type="password"
                    value={passForm.current}
                    onChange={(e) => setPassForm({ ...passForm, current: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{isAr ? 'كلمة المرور الجديدة' : 'Nouveau mot de passe'}</label>
                <input
                  type="password"
                  value={passForm.new}
                  onChange={(e) => setPassForm({ ...passForm, new: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                  required
                  minLength={4}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{isAr ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe'}</label>
                <input
                  type="password"
                  value={passForm.confirm}
                  onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                  required
                  minLength={4}
                />
              </div>
              
              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-indigo-200">
                  {isAr ? 'حفظ كلمة المرور' : 'Enregistrer le mot de passe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
`;
    content = content.replace(/    <\/div>\s*  \);\s*}\s*function ChevronRight/g, modalJSX + '\nfunction ChevronRight');
}

fs.writeFileSync('src/pages/Profil.tsx', content);
