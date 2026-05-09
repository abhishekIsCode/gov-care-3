import fs from 'fs';

let code = fs.readFileSync('src/components/Dashboard/PatientManagement.tsx', 'utf-8');

code = code.replace(/'Follow-up consultation'/g, "'followUpConsultation'");

// Look up `appt` inside `appointments.map`
code = code.replace(/\{appt\.reason\}/g, "{t(appt.reason)}");
// status and severity are probably rendered somewhere too
code = code.replace(/\{appt\.status\}/g, "{t(appt.status)}");

fs.writeFileSync('src/components/Dashboard/PatientManagement.tsx', code);
