const fs = require('fs');

const file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace("const FichesTechniques = lazy(() => import('./pages/FichesTechniques'));", "const FichesTechniques = lazy(() => import('./pages/FichesTechniques'));\nconst EvaluationPatronage = lazy(() => import('./pages/EvaluationPatronage'));");
fs.writeFileSync(file, code);
