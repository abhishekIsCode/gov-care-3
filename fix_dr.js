import fs from 'fs';

let code = fs.readFileSync('src/components/Dashboard/PatientManagement.tsx', 'utf-8');

code = code.replace(
  /<div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-\[10px\] font-black text-white">DR<\/div>/g,
  '<div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-[10px] font-black text-white">{t(\'dr\').replace(\'.\', \'\')}</div>'
);

fs.writeFileSync('src/components/Dashboard/PatientManagement.tsx', code);
