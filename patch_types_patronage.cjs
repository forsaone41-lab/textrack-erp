const fs = require('fs');

const file = 'src/types.ts';
let code = fs.readFileSync(file, 'utf8');

// Add fields to Lead
code = code.replace(/rejectedAt\?: string;\n\}/, "rejectedAt?: string;\n  patronageStatus?: 'requested' | 'priced';\n  patronagePrice?: number;\n  patronageNotes?: string;\n}");

// Add page to AppPage
code = code.replace(/\| 'tarifs' \| 'tarifs_edit' \| 'devis' \| 'recus';/, "| 'tarifs' | 'tarifs_edit' | 'devis' | 'recus' | 'evaluation_patronage';");

// Add to admin permissions
code = code.replace(/admin: \['dashboard', 'demandes', 'crm',/, "admin: ['dashboard', 'demandes', 'crm', 'evaluation_patronage',");

// Add to modeliste permissions
code = code.replace(/modeliste: \['fiches', 'ai_space'\],/, "modeliste: ['evaluation_patronage', 'fiches', 'ai_space'],");

// Force addition in loadPermissions
code = code.replace(/if \(\!result\.admin\.includes\('tarifs'\)\) result\.admin\.push\('tarifs'\);/, "if (!result.admin.includes('tarifs')) result.admin.push('tarifs');\n      if (!result.admin.includes('evaluation_patronage')) result.admin.push('evaluation_patronage');");

// Ensure modeliste gets the page in loadPermissions
code = code.replace(/if \(\!result\.admin\.includes\('evaluation_patronage'\)\) result\.admin\.push\('evaluation_patronage'\);/, "if (!result.admin.includes('evaluation_patronage')) result.admin.push('evaluation_patronage');\n      if (result.modeliste && !result.modeliste.includes('evaluation_patronage')) result.modeliste.push('evaluation_patronage');");


fs.writeFileSync(file, code);
