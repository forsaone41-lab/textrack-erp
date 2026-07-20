const fs = require('fs');

let content = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// 1. Add orderToDelete state
const stateOld = `  const [showTrash, setShowTrash] = useState(false);`;
const stateNew = `  const [showTrash, setShowTrash] = useState(false);\n  const [orderToDelete, setOrderToDelete] = useState<string|null>(null);`;

if (content.includes(stateOld) && !content.includes('orderToDelete')) {
    content = content.replace(stateOld, stateNew);
}

// 2. Replace handleDeleteOrder
const handleOld1 = `  const handleDeleteOrder = (orderId: string) => {\r\n    if (window.confirm(storeIsAr ? 'هل أنت متأكد من نقل هذا الطلب إلى سلة المهملات؟' : 'Êtes-vous sûr de vouloir déplacer cette commande vers la corbeille ?')) {\r\n      setStoreOrders(prev => prev.map(o => o.id === orderId ? { ...o, deleted: true } : o));\r\n      setSelectedOrder(null);\r\n      // Auto-delete after 10 seconds\r\n      setTimeout(() => {\r\n        setStoreOrders(current => current.filter(o => !(o.id === orderId && o.deleted)));\r\n      }, 10000);\r\n    }\r\n  };`;
const handleOld2 = handleOld1.replace(/\r\n/g, '\n');

const handleNew = `  const handleDeleteOrder = (orderId: string) => {\n    setOrderToDelete(orderId);\n  };\n\n  const confirmDeleteOrder = () => {\n    if (orderToDelete) {\n      setStoreOrders(prev => prev.map(o => o.id === orderToDelete ? { ...o, deleted: true } : o));\n      setSelectedOrder(null);\n      setOrderToDelete(null);\n    }\n  };`;

if (content.includes(handleOld1)) {
    content = content.replace(handleOld1, handleNew);
} else if (content.includes(handleOld2)) {
    content = content.replace(handleOld2, handleNew);
} else {
    // try a more generic replace if formatting is weird
    const regex = /const handleDeleteOrder = \([\s\S]*?10000\);\s*\}\s*\};/g;
    content = content.replace(regex, handleNew);
}

// 3. Inject Modal UI
const modalUI = `
      {/* DELETE CONFIRMATION MODAL */}
      {orderToDelete && (
         <div className="fixed inset-0 z-[600] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
               <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                     <Trash2 className="w-8 h-8 text-rose-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 mb-2">{storeIsAr ? 'نقل إلى سلة المهملات؟' : 'Déplacer vers la corbeille ?'}</h2>
                  <p className="text-slate-500 text-sm mb-6">{storeIsAr ? 'سيتم نقل هذا الطلب إلى سلة المهملات. يمكنك حذفه نهائياً من هناك.' : 'Cette commande sera déplacée vers la corbeille. Vous pourrez la supprimer définitivement par la suite.'}</p>
                  
                  <div className="flex gap-3">
                     <button onClick={() => setOrderToDelete(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">{storeIsAr ? 'إلغاء' : 'Annuler'}</button>
                     <button onClick={confirmDeleteOrder} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-md shadow-rose-200 transition-colors text-sm">{storeIsAr ? 'نقل' : 'Confirmer'}</button>
                  </div>
               </div>
            </div>
         </div>
      )}
`;

const publishModalStr = `{showPublishModal && (`;
if (content.includes(publishModalStr) && !content.includes('DELETE CONFIRMATION MODAL')) {
    content = content.replace(publishModalStr, modalUI + '\n      ' + publishModalStr);
}

fs.writeFileSync('src/pages/StoreBuilder.tsx', content, 'utf-8');
console.log('Trash and Modal fixed successfully!');
