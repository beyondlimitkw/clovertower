const fs = require('fs');
const path = require('path');

// === CONFIG ===
const mainPages = ['index.html', 'about.html', 'services.html', 'contact.html', 'specialty.html'];
const contentFolders = ['clinic-pages', 'doctor-pages', 'services-pages'];
const componentFolder = path.join('assets', 'components');
const jsFolder = 'js';
const specialtyScript = 'specialty-cards.js';
const specialtyScriptAr = 'specialty-cards-ar.js';

// === TRANSLATION MAP (basic placeholders) ===
const translationMap = {
  'Doctor': 'دكتور',
  'Clinic': 'عيادة',
  'Service': 'الخدمة',
  'Contact': 'اتصل بنا',
  'Home': 'الرئيسية',
  'Read more': 'اقرأ المزيد',
  'Back to home': 'العودة للرئيسية'
};

// === Utility: Inject RTL, Flip Classes, Translate ===
function localizeHTML(html) {
  // Fix <html> tag
  html = html.replace(/<html[^>]*>/, '<html lang="ar" dir="rtl">');

  // Replace component file *paths only* in fetch() or src=""
  html = html.replace(/(["'])assets\/components\/navbar\.html(["'])/g, '$1assets/components/navbar_ar.html$2');
  html = html.replace(/(["'])assets\/components\/footer\.html(["'])/g, '$1assets/components/footer_ar.html$2');

  // Flip Bootstrap directions
  html = html.replace(/\btext-start\b/g, 'text-end');
  html = html.replace(/\btext-end\b/g, 'text-start');
  html = html.replace(/\bfloat-start\b/g, 'float-end');
  html = html.replace(/\bfloat-end\b/g, 'float-start');
  html = html.replace(/\bflex-row\b/g, 'flex-row-reverse');
  html = html.replace(/\bms-/g, 'TEMP-ME-').replace(/\bme-/g, 'ms-').replace(/TEMP-ME-/g, 'me-');

  // Translate visible text
  Object.entries(translationMap).forEach(([en, ar]) => {
    html = html.replace(new RegExp(en, 'g'), ar);
  });

  return html;
}


// === 1. Convert Main Pages ===
mainPages.forEach(file => {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');
  if (file === 'specialty.html') {
    html = html.replace(specialtyScript, specialtyScriptAr);
  }
  html = localizeHTML(html);
  const arFile = file.replace('.html', '-ar.html');
  fs.writeFileSync(arFile, html, 'utf8');
  console.log(`✔ Created: ${arFile}`);
});

// === 2. Generate _ar versions of navbar/footer in same folder
['navbar.html', 'footer.html'].forEach(file => {
  const src = path.join(componentFolder, file);
  const arName = file.replace('.html', '_ar.html');
  const dest = path.join(componentFolder, arName);

  if (fs.existsSync(src)) {
    let html = fs.readFileSync(src, 'utf8');
    html = localizeHTML(html);
    fs.writeFileSync(dest, html, 'utf8');
    console.log(`✔ Created: ${dest}`);
  }
});

// === 3. Duplicate individual pages into *_ar folders
contentFolders.forEach(folder => {
  const arFolder = `${folder}_ar`;
  if (!fs.existsSync(arFolder)) {
    fs.mkdirSync(arFolder);
  }

  fs.readdirSync(folder).forEach(file => {
    if (!file.endsWith('.html')) return;
    const src = path.join(folder, file);
    const dest = path.join(arFolder, file);
    let html = fs.readFileSync(src, 'utf8');
    html = localizeHTML(html);
    fs.writeFileSync(dest, html, 'utf8');
    console.log(`✔ Created: ${dest}`);
  });
});

// === 4. Duplicate specialty JS
const specialtyJSPath = path.join(jsFolder, specialtyScript);
const specialtyJSArPath = path.join(jsFolder, specialtyScriptAr);
if (fs.existsSync(specialtyJSPath)) {
  let js = fs.readFileSync(specialtyJSPath, 'utf8');
  js = js.replace(/"Cardiology"/g, '"طب القلب"')
         .replace(/"Dermatology"/g, '"الأمراض الجلدية"')
         .replace(/"Internal Medicine"/g, '"الباطنية"');
  fs.writeFileSync(specialtyJSArPath, js, 'utf8');
  console.log(`✔ Created: ${specialtyScriptAr}`);
}
