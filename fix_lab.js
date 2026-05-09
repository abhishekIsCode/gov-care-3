import fs from 'fs';

let code = fs.readFileSync('src/components/Dashboard/PatientManagement.tsx', 'utf-8');

code = code.replace(/'Total Cholesterol'/g, "'totalCholesterol'");
code = code.replace(/'Abnormal'/g, "'abnormalStatus'");
code = code.replace(/'Fasting Glucose'/g, "'fastingGlucose'");
code = code.replace(/'Normal'/g, "'normal'");  // Already translated as 'normal' in existing translations!

// Look up `result` inside `labResults.map`
code = code.replace(/\{result\.testName\}/g, "{t(result.testName)}");
code = code.replace(/\{result\.status\}/g, "{t(result.status)}");

fs.writeFileSync('src/components/Dashboard/PatientManagement.tsx', code);
