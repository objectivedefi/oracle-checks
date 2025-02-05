import fs from "fs";
import path from "path";

export function saveFile<T>(data: T, filePath: string): void {
  // Create the directory path without the filename
  const dirPath = path.dirname(filePath);
  fs.mkdirSync(dirPath, { recursive: true });

  const jsonString = JSON.stringify(
    data,
    (key, value) => (typeof value === "bigint" ? value.toString() : value),
    2,
  );

  fs.writeFileSync(filePath, jsonString);
}

export function loadFile<T>(path: string): T {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

export function cleanDataDir(): void {
  const dataDir = "./data";
  if (fs.existsSync(dataDir)) {
    // Delete all contents except .gitkeep
    const files = fs.readdirSync(dataDir);
    for (const file of files) {
      const filePath = path.join(dataDir, file);
      if (file !== ".gitkeep") {
        if (fs.lstatSync(filePath).isDirectory()) {
          fs.rmSync(filePath, { recursive: true });
        } else {
          fs.unlinkSync(filePath);
        }
      }
    }
    console.log(`Cleaned data directory: ${dataDir}`);
  }
}
