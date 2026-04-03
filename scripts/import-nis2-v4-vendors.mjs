import fs from "node:fs";
import path from "node:path";

const sourcePath =
  process.argv[2] ??
  path.resolve(
    process.cwd(),
    "/Users/thomasweikop/Downloads/nis2_vendor_area_matrix_real_v4.csv",
  );
const targetPath =
  process.argv[3] ??
  path.resolve(
    process.cwd(),
    "src/data/nis2_vendor_area_matrix_real_v4.json",
  );

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current);
  return cells;
}

function parseCsv(content) {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    );
  });
}

const csvContent = fs.readFileSync(sourcePath, "utf8");
const rows = parseCsv(csvContent);

fs.writeFileSync(targetPath, `${JSON.stringify(rows, null, 2)}\n`);

console.log(
  `Imported ${rows.length} vendor rows from ${sourcePath} to ${targetPath}`,
);
