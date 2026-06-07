const fs = require("fs");
const path = require("path");

const pages = [
  {
    page: "doctors.html",
    component: path.join("assets", "components", "doctor-cards.html"),
    containerId: "doctorCards",
    marker: "doctor-cards"
  },
  {
    page: "clinics.html",
    component: path.join("assets", "components", "clinic-cards.html"),
    containerId: "clinicCards",
    marker: "clinic-cards"
  }
];

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(file, content) {
  fs.writeFileSync(file, content, "utf8");
}

function stripComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

function extractCards(html) {
  const activeHtml = stripComments(html);
  return activeHtml.match(/<div class="col\b[\s\S]*?<\/div><\/a>\s*<\/div>/g) || [];
}

function getCardName(card) {
  const match = card.match(/<h6[^>]*>([\s\S]*?)<\/h6>/i);
  return match ? match[1].replace(/<[^>]+>/g, "").trim().toLowerCase() : "";
}

function hasRealImage(card) {
  return !/placeholder/i.test(card);
}

function sortCards(cards) {
  const byName = (a, b) => getCardName(a).localeCompare(getCardName(b));
  const real = cards.filter(hasRealImage).sort(byName);
  const placeholders = cards.filter(card => !hasRealImage(card)).sort(byName);
  return [...real, ...placeholders];
}

function buildSection({ containerId, marker }, cards) {
  const body = cards.map(card => card.trim()).join("\n");
  return [
    '<section class="container py-5">',
    `  <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4" id="${containerId}">`,
    `    <!-- GENERATED:${marker}:start -->`,
    body,
    `    <!-- GENERATED:${marker}:end -->`,
    "  </div>",
    "</section>"
  ].join("\n");
}

function replaceSection(html, config, section) {
  const generatedPattern = new RegExp(
    `<section class="container py-5">\\s*<div class="row(?: row-cols-[\\w-]+)* g-4" id="${config.containerId}">[\\s\\S]*?<!-- GENERATED:${config.marker}:start -->[\\s\\S]*?<!-- GENERATED:${config.marker}:end -->[\\s\\S]*?</div>\\s*</section>`
  );

  if (generatedPattern.test(html)) {
    return html.replace(generatedPattern, section);
  }

  const emptySection = new RegExp(
    `<section class="container py-5">\\s*<div class="row(?: row-cols-[\\w-]+)* g-4" id="${config.containerId}"></div>\\s*</section>`
  );

  if (!emptySection.test(html)) {
    throw new Error(`Could not find ${config.containerId} section in ${config.page}`);
  }

  return html.replace(emptySection, section);
}

function removeLoaderScript(html, containerId) {
  const inlineLoader = new RegExp(
    `\\s*<script>\\s*document\\.addEventListener\\("DOMContentLoaded",\\s*\\(\\)\\s*=>\\s*\\{[\\s\\S]*?targetId:\\s*"${containerId}"[\\s\\S]*?\\}\\);\\s*\\}\\);\\s*</script>\\s*`
  );

  return html
    .replace(inlineLoader, "\n")
    .replace(/\s*<script src="assets\/js\/card-loader\.js"><\/script>\s*/g, "\n");
}

for (const config of pages) {
  const cards = sortCards(extractCards(read(config.component)));
  const section = buildSection(config, cards);
  let html = read(config.page);

  html = replaceSection(html, config, section);
  html = removeLoaderScript(html, config.containerId);

  write(config.page, html);
  console.log(`Generated ${cards.length} cards in ${config.page}`);
}
