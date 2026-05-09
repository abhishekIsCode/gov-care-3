import fs from 'fs';

const translationsToAdd = {
  followUpConsultation: {
    en: 'Follow-up consultation',
    hi: 'फॉलो-अप परामर्श',
    bn: 'ফলো-আপ পরামর্শ',
    te: 'ఫాలో-అప్ కన్సల్టేషన్',
    mr: 'फॉलो-अप सल्लामसलत',
    ta: 'பின்தொடர்தல் ஆலோசனை',
    gu: 'ફોલો-અપ પરામર્શ',
    kn: 'ಫಾಲೋ-ಅಪ್ ಸಮಾಲೋಚನೆ',
    ml: 'തുടർ കൂടിയാലോചന',
    pa: 'ਫਾਲੋ-ਅਪ ਸਲਾਹ-ਮਸ਼ਵਰਾ'
  }
};

let code = fs.readFileSync('src/components/LanguageProvider.tsx', 'utf-8');

const languages = ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa'];

for (const lang of languages) {
  let entries = [];
  for (const key of Object.keys(translationsToAdd)) {
    entries.push(`    ${key}: '${translationsToAdd[key][lang].replace(/'/g, "\\'")}',`);
  }
  
  const regex = new RegExp(`(${lang}: {[\\s\\S]*?)(  },|  }\n};\n|  }\n})`, '');
  code = code.replace(regex, `$1${entries.join('\n')}\n$2`);
}

fs.writeFileSync('src/components/LanguageProvider.tsx', code);
