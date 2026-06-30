const fs = require('fs'); 
let c = fs.readFileSync('src/App.tsx', 'utf8'); 
c = c.replace(/const Settings         = lazy\(\(\) => import\('\.\/pages\/Settings'\)\);\r?\nconst Login/, 'const Settings         = lazy(() => import(\'./pages/Settings\'));\nconst Profil           = lazy(() => import(\'./pages/Profil\'));\nconst Login'); 
c = c.replace(/<Route path=\"parametres\" element=\{can\('parametres'\) \? <Settings \/> : <Navigate to=\"\/\" replace \/>\} \/>\r?\n\s*<Route path=\"reglement\"/, '<Route path=\"parametres\" element={can(\'parametres\') ? <Settings /> : <Navigate to=\"/\" replace />} />\n        <Route path=\"profil\" element={<Profil currentUser={currentUser} />} />\n        <Route path=\"reglement\"'); 
fs.writeFileSync('src/App.tsx', c);
