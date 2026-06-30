const fs = require('fs');

let c = fs.readFileSync('src/pages/Profil.tsx', 'utf8');

// 1. Fix handleSave
const oldHandleSave = `const handleSave = async () => {
    setLoading(true);
    try {
      await saveRecord('users', { ...currentUser, ...formData });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };`;

const newHandleSave = `const handleSave = async () => {
    setLoading(true);
    try {
      const updatedUser = { ...currentUser, ...formData };
      await saveRecord('users', updatedUser);
      localStorage.setItem('textrack_auth', JSON.stringify(updatedUser));
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        window.location.reload();
      }, 1000);
    } catch (e) {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };`;

c = c.replace(oldHandleSave, newHandleSave);

// 2. Add Remove photo button
const oldPhotoUI = `<button onClick={handlePhotoChange} className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-all border border-slate-100 z-20 hover:scale-110 active:scale-95">
            <Camera className="w-5 h-5" />
          </button>`;

const newPhotoUI = `<button onClick={handlePhotoChange} className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-all border border-slate-100 z-20 hover:scale-110 active:scale-95">
            <Camera className="w-5 h-5" />
          </button>
          {formData.photo && (
            <button 
              onClick={() => setFormData({ ...formData, photo: '' })} 
              title={isAr ? 'حذف الصورة' : 'Supprimer la photo'}
              className="absolute -top-2 -right-2 w-8 h-8 bg-rose-100 rounded-full shadow-lg flex items-center justify-center text-rose-600 hover:text-white hover:bg-rose-500 transition-all border-2 border-white z-20 hover:scale-110 active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}`;

c = c.replace(oldPhotoUI, newPhotoUI);

// Import Trash2 in Profil if missing (it might be missing)
if (!c.includes('Trash2')) {
  c = c.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1, Trash2 } from 'lucide-react';");
}

fs.writeFileSync('src/pages/Profil.tsx', c);
