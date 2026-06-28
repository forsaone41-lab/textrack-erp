const fs = require('fs');

function patchApp() {
  const file = 'src/App.tsx';
  let code = fs.readFileSync(file, 'utf8');
  
  if (!code.includes('import EvaluationPatronage')) {
    code = code.replace("import FichesTechniques from './pages/FichesTechniques';", "import FichesTechniques from './pages/FichesTechniques';\nimport EvaluationPatronage from './pages/EvaluationPatronage';");
  }
  
  if (!code.includes('<Route path="evaluation-patronage"')) {
    code = code.replace(/<Route path="fiches-techniques" element=\{can\('fiches'\) \? <FichesTechniques \/> : <Navigate to="\/" replace \/>\} \/>/, 
      "<Route path=\"fiches-techniques\" element={can('fiches') ? <FichesTechniques /> : <Navigate to=\"/\" replace />} />\n              <Route path=\"evaluation-patronage\" element={can('evaluation_patronage') ? <EvaluationPatronage /> : <Navigate to=\"/\" replace />} />");
  }
  fs.writeFileSync(file, code);
}

function patchSidebar() {
  const file = 'src/components/DashboardLayout.tsx';
  let code = fs.readFileSync(file, 'utf8');
  
  if (!code.includes('evaluation-patronage')) {
    const search = `{ id: 'fiches', name: 'Fiches Techniques', icon: Layers, path: '/fiches-techniques', permission: 'fiches' },`;
    const replace = `{ id: 'fiches', name: 'Fiches Techniques', icon: Layers, path: '/fiches-techniques', permission: 'fiches' },\n  { id: 'evaluation_patronage', name: 'Prix Patronage', icon: Scissors, path: '/evaluation-patronage', permission: 'evaluation_patronage' },`;
    code = code.replace(search, replace);
    
    if (!code.includes('Scissors,')) {
      code = code.replace('Layers,', 'Layers, Scissors,');
    }
  }
  fs.writeFileSync(file, code);
}

patchApp();
patchSidebar();
