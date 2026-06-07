const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const baseUrl = process.env.BASE_URL || "http://localhost:4173";
const outDir = path.join(process.cwd(), "audit-screenshots");

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 }
];

const pages = [
  { name: "index", path: "/" },
  { name: "doctors", path: "/doctors.html" },
  { name: "clinics", path: "/clinics.html" }
];

function round(value) {
  return Math.round(value * 100) / 100;
}

async function auditPage(page, pageInfo, viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(`${baseUrl}${pageInfo.path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  const metrics = await page.evaluate(() => {
    const nav = document.querySelector(".clover-navbar");
    const sections = Array.from(document.querySelectorAll("header, body > section"));
    const scrollWidth = document.documentElement.scrollWidth;
    const clientWidth = document.documentElement.clientWidth;
    const navHeight = nav ? nav.getBoundingClientRect().height : 0;

    return {
      navHeight,
      horizontalOverflow: scrollWidth - clientWidth,
      sections: sections.map((section, index) => {
        const rect = section.getBoundingClientRect();
        return {
          index,
          tag: section.tagName.toLowerCase(),
          className: section.className || "",
          top: rect.top + window.scrollY,
          height: rect.height
        };
      }),
      cards: {
        homeDoctors: document.querySelectorAll("#homeDoctors > .col").length,
        homeClinics: document.querySelectorAll("#homeClinics > .col").length,
        doctorCards: document.querySelectorAll("#doctorCards > .col").length,
        clinicCards: document.querySelectorAll("#clinicCards > .col").length
      }
    };
  });

  const issues = [];
  if (metrics.horizontalOverflow > 1) {
    issues.push(`Horizontal overflow: ${round(metrics.horizontalOverflow)}px`);
  }

  if (pageInfo.name === "index") {
    const minimumPanelHeight = viewport.height - metrics.navHeight - 2;
    metrics.sections.slice(0, 6).forEach(section => {
      if (section.height < minimumPanelHeight) {
        issues.push(`Section ${section.index} is short: ${round(section.height)}px < ${round(minimumPanelHeight)}px`);
      }
    });

    if (metrics.cards.homeDoctors !== 4) issues.push(`Homepage doctors loaded ${metrics.cards.homeDoctors} cards`);
    if (metrics.cards.homeClinics !== 4) issues.push(`Homepage clinics loaded ${metrics.cards.homeClinics} cards`);
  }

  const screenshotName = `${pageInfo.name}-${viewport.name}.png`;
  await page.screenshot({
    path: path.join(outDir, screenshotName),
    fullPage: false
  });

  return {
    page: pageInfo.name,
    viewport: viewport.name,
    width: viewport.width,
    height: viewport.height,
    metrics: {
      navHeight: round(metrics.navHeight),
      horizontalOverflow: round(metrics.horizontalOverflow),
      cards: metrics.cards,
      sectionHeights: metrics.sections.map(section => ({
        index: section.index,
        tag: section.tag,
        className: section.className,
        height: round(section.height)
      }))
    },
    issues,
    screenshot: screenshotName
  };
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const results = [];

  for (const viewport of viewports) {
    for (const pageInfo of pages) {
      results.push(await auditPage(page, pageInfo, viewport));
    }
  }

  await browser.close();

  const reportPath = path.join(outDir, "visual-audit-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  const issues = results.flatMap(result => result.issues.map(issue => `${result.page}/${result.viewport}: ${issue}`));
  console.log(`Visual audit complete. Report: ${reportPath}`);
  console.log(`Screenshots: ${outDir}`);

  if (issues.length) {
    console.log("\nIssues:");
    issues.forEach(issue => console.log(`- ${issue}`));
    process.exitCode = 1;
  } else {
    console.log("No layout issues detected by the automated checks.");
  }
})();
