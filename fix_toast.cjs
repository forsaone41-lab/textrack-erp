const fs = require('fs');

const file = 'src/pages/EvaluationPatronage.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace("import { toast, Toaster } from 'react-hot-toast';", "");
code = code.replace("toast.error('Erreur de chargement');", "alert('Erreur de chargement');");
code = code.replace("toast.error(isAr ? 'أدخل الثمن أولا' : 'Veuillez entrer un prix');", "alert(isAr ? 'أدخل الثمن أولا' : 'Veuillez entrer un prix');");
code = code.replace("toast.success(isAr ? 'تم حفظ الثمن بنجاح' : 'Prix enregistré avec succès');", "alert(isAr ? 'تم حفظ الثمن بنجاح' : 'Prix enregistré avec succès');");
code = code.replace("toast.error(isAr ? 'حدث خطأ' : 'Erreur lors de la sauvegarde');", "alert(isAr ? 'حدث خطأ' : 'Erreur lors de la sauvegarde');");
code = code.replace("<Toaster position=\"top-center\" />", "");

fs.writeFileSync(file, code);
