import fs from 'fs';

const translationsToAdd = {
  totalCholesterol: {
    en: 'Total Cholesterol',
    hi: 'कुल कोलेस्ट्रॉल',
    bn: 'মোট কোলেস্টেরল',
    te: 'మొత్తం కొలెస్ట్రాల్',
    mr: 'एकूण कोलेस्ट्रॉल',
    ta: 'மொத்த கொழுப்பு',
    gu: 'કુલ કોલેસ્ટ્રોલ',
    kn: 'ಒಟ್ಟು ಕೊಲೆಸ್ಟ್ರಾಲ್',
    ml: 'ആകെ കൊളസ്ട്രോൾ',
    pa: 'ਕੁੱਲ ਕੋਲੈਸਟ੍ਰੋਲ'
  },
  abnormalStatus: {
    en: 'Abnormal',
    hi: 'असामान्य',
    bn: 'অস্বাভাবিক',
    te: 'అసాధారణ',
    mr: 'असामान्य',
    ta: 'நடைமுறைக்கு மாறான',
    gu: 'અસામાન્ય',
    kn: 'ಅಸಹಜ',
    ml: 'അസാധാരണമായ',
    pa: 'ਅਸਧਾਰਨ'
  },
  fastingGlucose: {
    en: 'Fasting Glucose',
    hi: 'फास्टिंग ग्लूकोज',
    bn: 'ফাস্টিং গ্লুকোজ',
    te: 'ఉపవాస గ్లూకోజ్',
    mr: 'फास्टिंग ग्लुकोज',
    ta: 'வெறும் வயிற்றில் குளுக்கோஸ்',
    gu: 'ફાસ્ટિંગ ગ્લુકોઝ',
    kn: 'ಉಪವಾಸದ ಗ್ಲೂಕೋಸ್',
    ml: 'ഫാസ്റ്റിംഗ് ഗ്ലൂക്കോസ്',
    pa: 'ਫਾਸਟਿੰਗ ਗਲੂਕੋਜ਼'
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
