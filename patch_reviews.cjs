const fs = require('fs');
let c = fs.readFileSync('src/pages/StoreBuilder.tsx', 'utf-8');

// 1. Add showReviews state after footerSettings
const stateTarget = `  const [newsletterTitle, setNewsletterTitle] = useState(config.newsletterTitle || 'Rejoignez notre Newsletter');`;
const stateNew = `  const [showReviews, setShowReviews] = useState(config.showReviews !== undefined ? config.showReviews : true);\r\n  const [newsletterTitle, setNewsletterTitle] = useState(config.newsletterTitle || 'Rejoignez notre Newsletter');`;
c = c.replace(stateTarget, stateNew);

// 2. Fix \n bug on line 1865
c = c.replace('\\n            {/* Footer */}', '{/* Footer */}');

// 3. Make the Reviews tab conditional - if showReviews is false, hide entire Reviews section
const reviewsTabOld = `                         <button onClick={() => setActivePDPTab('reviews')} className={\`pb-4 text-sm tracking-wider font-bold transition-all \${activePDPTab === 'reviews' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'}\`}>Reviews</button>`;
const reviewsTabNew = `                         {showReviews && <button onClick={() => setActivePDPTab('reviews')} className={\`pb-4 text-sm tracking-wider font-bold transition-all \${activePDPTab === 'reviews' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'}\`}>Reviews</button>}`;
c = c.replace(reviewsTabOld, reviewsTabNew);

// 4. Wrap reviews content conditionally
const reviewsContentOld = `                         ) : (
                            <div className="space-y-6">
                               <div className="flex gap-4">
                                  <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                                  <div>
                                     <h5 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider mb-1">Jane Doe</h5>
                                     <div className="flex text-amber-400 mb-2 w-3 h-3">{'★'.repeat(5)}</div>
                                     <p>Absolutely love this! Fits perfectly and looks great.</p>
                                  </div>
                               </div>
                            </div>
                         )}`;
const reviewsContentNew = `                         ) : showReviews ? (
                            <div className="space-y-6">
                               <div className="flex gap-4">
                                  <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                                  <div>
                                     <h5 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider mb-1">Jane Doe</h5>
                                     <div className="flex text-amber-400 mb-2 w-3 h-3">{'★'.repeat(5)}</div>
                                     <p>Absolutely love this! Fits perfectly and looks great.</p>
                                  </div>
                               </div>
                            </div>
                         ) : null}`;
c = c.replace(reviewsContentOld, reviewsContentNew);

// 5. Add showReviews to storeConfig save
c = c.replace('       secondaryColor,\r\n       buttonStyle\r\n    };', '       secondaryColor,\r\n       buttonStyle,\r\n       showReviews\r\n    };');

fs.writeFileSync('src/pages/StoreBuilder.tsx', c, 'utf-8');

// Verify
const hasShowReviews = c.includes('const [showReviews');
const fixedBackslashN = !c.includes('\\n            {/* Footer */}');
console.log('showReviews state added:', hasShowReviews);
console.log('\\n bug fixed:', fixedBackslashN);
