const fs = require('fs');

const filePath = 'C:/Users/hp/Downloads/GZeed/src/pages/GZeedDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Restore buttons
const brokenButtons = `              <div className="flex items-center gap-4 pl-4 relative">
            <button 
              onClick={() => {
                setTasksCompleted(prev => ({ ...prev, product: true }));
                showToastAndNavigate(
                  lang === 'ar' ? 'تم إضافة المنتج بنجاح!' : lang === 'en' ? 'Product added successfully!' : 'Produit ajouté avec succès !',
                  'products'
                );
              }}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-md shadow-slate-900/10"
            >
                  <MonitorPlay className="w-4 h-4" />
                  {lang === 'ar' ? 'عرض المتجر' : lang === 'en' ? 'View Store' : 'Voir la boutique'}
                </button>`;

const fixedButtons = `              <div className="flex gap-3">
                <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                  <MonitorPlay className="w-4 h-4" />
                  {lang === 'ar' ? 'عرض المتجر' : lang === 'en' ? 'View Store' : 'Voir la boutique'}
                </button>
                <button 
                  onClick={() => {
                    setTasksCompleted(prev => ({ ...prev, product: true }));
                    showToastAndNavigate(
                      lang === 'ar' ? 'تم إضافة المنتج بنجاح!' : lang === 'en' ? 'Product added successfully!' : 'Produit ajouté avec succès !',
                      'products'
                    );
                  }}
                  className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  {lang === 'ar' ? 'إضافة منتج' : lang === 'en' ? 'Add Product' : 'Ajouter un produit'}
                </button>`;

content = content.replace(brokenButtons, fixedButtons);

// Task rendering string replacements
const task1Uncompleted = `<div className="w-6 h-6 rounded-full border-2 border-cyan-500 flex items-center justify-center shrink-0 mt-0.5 bg-white">
                        <div className="w-2 h-2 rounded-full bg-cyan-500" />
                      </div>`;
const task1Completed = `{tasksCompleted.name ? (
                        <div className="w-6 h-6 rounded-full border-2 border-emerald-500 bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3.5 h-3.5" /></div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-cyan-500 flex items-center justify-center shrink-0 mt-0.5 bg-white"><div className="w-2 h-2 rounded-full bg-cyan-500" /></div>
                      )}`;

content = content.replace(task1Uncompleted, task1Completed);

const task2Uncompleted = `<div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0 mt-0.5 bg-white" />`;
const task2Completed = `{tasksCompleted.theme ? (
                        <div className="w-6 h-6 rounded-full border-2 border-emerald-500 bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3.5 h-3.5" /></div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0 mt-0.5 bg-white" />
                      )}`;
content = content.replace(task2Uncompleted, task2Completed);

const task3Uncompleted = `<div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0 mt-0.5 bg-white" />`;
const task3Completed = `{tasksCompleted.product ? (
                        <div className="w-6 h-6 rounded-full border-2 border-emerald-500 bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3.5 h-3.5" /></div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0 mt-0.5 bg-white" />
                      )}`;
content = content.replace(task3Uncompleted, task3Completed);


// Make settings save update task progress
const settingsSaveOld = `onClick={() => {
                        setIsBasicInfoEditing(false);
                        setToastMessage(lang === 'ar' ? 'تم حفظ المعلومات!' : lang === 'en' ? 'Information saved!' : 'Informations enregistrées !');
                        setTimeout(() => setToastMessage(null), 3000);
                      }}`;
const settingsSaveNew = `onClick={() => {
                        setIsBasicInfoEditing(false);
                        setTasksCompleted(prev => ({ ...prev, name: true }));
                        setToastMessage(lang === 'ar' ? 'تم حفظ المعلومات!' : lang === 'en' ? 'Information saved!' : 'Informations enregistrées !');
                        setTimeout(() => setToastMessage(null), 3000);
                      }}`;
content = content.replace(settingsSaveOld, settingsSaveNew);

// Make domain save update task progress
const domainSaveOld = `onClick={() => {
                          setIsDomainEditing(false);
                          setToastMessage(lang === 'ar' ? 'تم حفظ النطاق! اختر الآن قالبك.' : lang === 'en' ? 'Domain saved! Now choose your theme.' : 'Domaine enregistré ! Choisissez maintenant votre thème.');
                          setTimeout(() => setToastMessage(null), 3000);
                          setActiveTab('themes');
                        }}`;
const domainSaveNew = `onClick={() => {
                          setIsDomainEditing(false);
                          setTasksCompleted(prev => ({ ...prev, domain: true }));
                          setToastMessage(lang === 'ar' ? 'تم حفظ النطاق! اختر الآن قالبك.' : lang === 'en' ? 'Domain saved! Now choose your theme.' : 'Domaine enregistré ! Choisissez maintenant votre thème.');
                          setTimeout(() => setToastMessage(null), 3000);
                          setActiveTab('themes');
                        }}`;
content = content.replace(domainSaveOld, domainSaveNew);
const domainSaveOld2 = `onClick={() => {
                          setIsDomainEditing(false);
                          setToastMessage(lang === 'ar' ? 'تم ربط النطاق! اختر الآن قالبك.' : lang === 'en' ? 'Domain connected! Now choose your theme.' : 'Domaine connecté ! Choisissez maintenant votre thème.');
                          setTimeout(() => setToastMessage(null), 3000);
                          setActiveTab('themes');
                        }}`;
const domainSaveNew2 = `onClick={() => {
                          setIsDomainEditing(false);
                          setTasksCompleted(prev => ({ ...prev, domain: true }));
                          setToastMessage(lang === 'ar' ? 'تم ربط النطاق! اختر الآن قالبك.' : lang === 'en' ? 'Domain connected! Now choose your theme.' : 'Domaine connecté ! Choisissez maintenant votre thème.');
                          setTimeout(() => setToastMessage(null), 3000);
                          setActiveTab('themes');
                        }}`;
content = content.replace(domainSaveOld2, domainSaveNew2);

// Update progress circle visual
const circleOld = `<circle cx="64" cy="64" r="60" className="stroke-cyan-500 fill-none" strokeWidth="8" strokeDasharray="377" strokeDashoffset="282.75" strokeLinecap="round" />`;
const circleNew = `<circle cx="64" cy="64" r="60" className="stroke-cyan-500 fill-none stroke-[8px] transition-all duration-1000 ease-out" strokeDasharray="377" strokeDashoffset={progressOffset} strokeLinecap="round" />`;
content = content.replace(circleOld, circleNew);

const textOld = `1<span className="text-xl text-slate-400">/4</span>`;
const textNew = `{completedCount}<span className="text-xl text-slate-400">/4</span>`;
content = content.replace(textOld, textNew);


// Fix task backgrounds to be checked
const t1bgOld = `className="flex items-start gap-4 p-4 rounded-xl border border-cyan-100 bg-cyan-50/50 hover:bg-cyan-50 transition-colors cursor-pointer group"`;
const t1bgNew = `className={\`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer group \${tasksCompleted.name ? 'border-emerald-100 bg-emerald-50/50' : 'border-cyan-100 bg-cyan-50/50 hover:bg-cyan-50'}\`}`;
content = content.replace(t1bgOld, t1bgNew);

const t2bgOld = `className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer group"`;
const t2bgNew = `className={\`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer group \${tasksCompleted.theme ? 'border-emerald-100 bg-emerald-50/50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}\`}`;
content = content.replace(t2bgOld, t2bgNew);
content = content.replace(t2bgOld, `className={\`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer group \${tasksCompleted.product ? 'border-emerald-100 bg-emerald-50/50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}\`}`);

fs.writeFileSync(filePath, content);
console.log('Fixed tasks completed correctly!');
