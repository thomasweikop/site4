import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const projectRoot = process.cwd();
const sourcePath = resolve(
  projectRoot,
  "src/data/nis2_vendor_area_matrix_real_v4.json",
);
const svgPath = resolve(projectRoot, "public/nis2-specialist-matrix-preview.svg");
const jpgPath = resolve(projectRoot, "public/nis2-specialist-matrix-preview.jpg");

const rows = JSON.parse(readFileSync(sourcePath, "utf8"));

const columns = [
  { key: "Company", label: "Company", width: 380, align: "left" },
  { key: "Primary_type", label: "Type", width: 120, align: "left" },
  { key: "Governance", label: "Governance", width: 92, align: "center" },
  { key: "Technical", label: "Technical", width: 92, align: "center" },
  { key: "Operational", label: "Operational", width: 92, align: "center" },
  { key: "Compliance", label: "Compliance", width: 92, align: "center" },
  { key: "Risikovurdering", label: "Risk", width: 82, align: "center" },
  { key: "Incident response", label: "Incident", width: 92, align: "center" },
  { key: "Identity / MFA / PAM", label: "Identity", width: 92, align: "center" },
  { key: "Logging & monitorering", label: "Logging", width: 92, align: "center" },
  { key: "Audit / assurance", label: "Audit", width: 82, align: "center" },
  { key: "Website", label: "Website", width: 190, align: "left" },
];

const pagePadding = 36;
const headerHeight = 108;
const subHeaderHeight = 34;
const rowHeight = 21;
const width =
  columns.reduce((sum, column) => sum + column.width, 0) + pagePadding * 2;
const height =
  headerHeight + subHeaderHeight + rows.length * rowHeight + pagePadding * 2;

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncate(value, length) {
  const text = String(value ?? "");
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

function cellText(value, column) {
  if (column.align === "center") {
    return value === "●" ? "•" : "";
  }

  if (column.key === "Website") {
    return truncate(String(value ?? "").replace(/^https?:\/\//, ""), 28);
  }

  if (column.key === "Company") {
    return truncate(value ?? "", 34);
  }

  return truncate(value ?? "", 18);
}

let x = pagePadding;
const columnMeta = columns.map((column) => {
  const meta = { ...column, x };
  x += column.width;
  return meta;
});

const rowMarkup = rows
  .map((row, rowIndex) => {
    const y = pagePadding + headerHeight + subHeaderHeight + rowIndex * rowHeight;
    const background = rowIndex % 2 === 0 ? "#ffffff" : "#f7f3eb";
    const textNodes = columnMeta
      .map((column) => {
        const value = cellText(row[column.key], column);
        const textX =
          column.align === "center" ? column.x + column.width / 2 : column.x + 8;
        const textAnchor = column.align === "center" ? "middle" : "start";
        const fill =
          column.align === "center" && value ? "#0a5b50" : "#16322c";
        const fontWeight =
          column.key === "Company" ? "600" : column.align === "center" ? "700" : "400";

        return `
          <text
            x="${textX}"
            y="${y + 14}"
            font-size="${column.key === "Website" ? 8.5 : 9}"
            font-family="Arial, Helvetica, sans-serif"
            font-weight="${fontWeight}"
            fill="${fill}"
            text-anchor="${textAnchor}"
          >${escapeXml(value)}</text>
        `;
      })
      .join("");

    return `
      <rect x="${pagePadding}" y="${y}" width="${width - pagePadding * 2}" height="${rowHeight}" fill="${background}" />
      ${textNodes}
    `;
  })
  .join("");

const headerColumns = columnMeta
  .map(
    (column) => `
      <rect x="${column.x}" y="${pagePadding + headerHeight}" width="${column.width}" height="${subHeaderHeight}" fill="#0f4138" />
      <text
        x="${column.align === "center" ? column.x + column.width / 2 : column.x + 8}"
        y="${pagePadding + headerHeight + 22}"
        font-size="10"
        font-family="Arial, Helvetica, sans-serif"
        font-weight="700"
        fill="#ffffff"
        text-anchor="${column.align === "center" ? "middle" : "start"}"
      >${escapeXml(column.label)}</text>
    `,
  )
  .join("");

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#ede8db" />
  <rect x="${pagePadding}" y="${pagePadding}" width="${width - pagePadding * 2}" height="${height - pagePadding * 2}" rx="0" fill="#ffffff" stroke="#d6d4cc" />
  <rect x="${pagePadding}" y="${pagePadding}" width="${width - pagePadding * 2}" height="${headerHeight}" fill="#0f4138" />
  <text x="${pagePadding + 22}" y="${pagePadding + 34}" font-size="12" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="#b9d9d0" letter-spacing="2">SPECIALIST LISTE</text>
  <text x="${pagePadding + 22}" y="${pagePadding + 68}" font-size="30" font-family="Georgia, 'Times New Roman', serif" font-weight="600" fill="#ffffff">NIS2 specialist matrix</text>
  <text x="${pagePadding + 22}" y="${pagePadding + 92}" font-size="12" font-family="Arial, Helvetica, sans-serif" fill="#dbe8e2">125 danske virksomheder fordelt på typer, områder og matchbare kompetencer</text>
  ${headerColumns}
  ${rowMarkup}
</svg>
`;

mkdirSync(dirname(svgPath), { recursive: true });
writeFileSync(svgPath, svg);

execFileSync("sips", ["-s", "format", "jpeg", svgPath, "--out", jpgPath], {
  stdio: "ignore",
});

console.log(`Generated ${jpgPath}`);
