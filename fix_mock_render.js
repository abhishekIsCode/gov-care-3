import fs from 'fs';

let code = fs.readFileSync('src/components/Dashboard/PatientManagement.tsx', 'utf-8');

code = code.replace(/\{record\.diagnosis\}/g, "{t(record.diagnosis)}");
code = code.replace(/\{record\.notes\}/g, "{t(record.notes)}");
code = code.replace(/\{prescription\.medication\}/g, "{t(prescription.medication)}");
code = code.replace(/\{prescription\.dosage\}/g, "{t(prescription.dosage)}");
code = code.replace(/\{prescription\.duration\}/g, "{t(prescription.duration)}");
code = code.replace(/\{order\.testName\}/g, "{t(order.testName)}");
code = code.replace(/\{order\.status\}/g, "{t(order.status)}");


code = code.replace(/'Hypertension Stage 1'/g, "'hypertensionStage1'");
code = code.replace(/'Systemic evaluation shows consistent elevated readings\. Initiating lifestyle modification protocol\.'/g, "'hypertensionNotes'");
code = code.replace(/'Seasonal Allergies'/g, "'seasonalAllergies'");
code = code.replace(/'Patient reports persistent rhinitis and ocular pruritus during spring cycles\.'/g, "'allergiesNotes'");

code = code.replace(/'Lisinopril'/g, "'lisinopril'");
code = code.replace(/'Loratadine'/g, "'loratadine'");
code = code.replace(/'30 Days'/g, "'thirtyDays'");
code = code.replace(/'As needed'/g, "'asNeeded'");

code = code.replace(/'Lipid Panel'/g, "'lipidPanel'");
code = code.replace(/'Metabolic Screening'/g, "'metabolicScreening'");
code = code.replace(/'Completed'/g, "'completedStatus'");
code = code.replace(/'Ordered'/g, "'orderedStatus'");

fs.writeFileSync('src/components/Dashboard/PatientManagement.tsx', code);
