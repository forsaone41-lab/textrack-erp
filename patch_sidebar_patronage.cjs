const fs = require('fs');

const file = 'src/components/Sidebar.tsx';
let code = fs.readFileSync(file, 'utf8');

// Insert after {can('fiches') && <NavItem ... />}
const search = `{can('fiches') && (
              <NavItem to="/fiches-techniques" icon={FileText} label={isAr ? 'البطاقات التقنية' : 'Fiches Tech.'} />
            )}`;
const replace = `{can('fiches') && (
              <NavItem to="/fiches-techniques" icon={FileText} label={isAr ? 'البطاقات التقنية' : 'Fiches Tech.'} />
            )}
            {can('evaluation_patronage') && (
              <NavItem to="/evaluation-patronage" icon={Scissors} label={isAr ? 'تسعير الباترون' : 'Prix Patronage'} />
            )}`;

code = code.replace(search, replace);

fs.writeFileSync(file, code);
