import fs from 'fs';

let code = fs.readFileSync('src/components/Dashboard/PatientManagement.tsx', 'utf-8');

code = code.replace(/\{p\.medication\}/g, "{t(p.medication)}");
code = code.replace(/\{p\.dosage\}/g, "{p.dosage}"); // Keeping dosage untranslated, usually not translated, but let's see. Wait, "30 Days" and "As needed" are stored in p.duration?
code = code.replace(/\{p\.duration\}/g, "{t(p.duration)}");

fs.writeFileSync('src/components/Dashboard/PatientManagement.tsx', code);
