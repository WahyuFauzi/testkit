import fs from "fs";
import path from "path";
import glob from "glob";

// Process a single file and add attributes
const processFile = (filePath) => {
  const fileName = path.basename(filePath, path.extname(filePath));
  const fileContent = fs.readFileSync(filePath, "utf8");

  const updatedContent = fileContent.replace(
    /<(div|button|input|p|img)(\s+[^>]*)?>/g,
    (match, tagName, attributes = "") => {
      // Skip if `data-testid` is already present
      if (attributes.includes("data-testid")) return match;

      let newAttributes = [];
      const testIdValue = `${fileName}-${tagName}-${generateRandomHex()}`;
      newAttributes.push(`data-testid="${testIdValue}"`);

      // Append new attributes to the existing attributes
      return `<${tagName} ${newAttributes.join(" ")}${attributes}>`;
    }
  );

  fs.writeFileSync(filePath, updatedContent, "utf8");
  console.log(`Processed: ${filePath}`);
};


// Process all files matching a glob pattern
export const generateAttributes = (globPattern) => {
  glob(globPattern, (err, files) => {
    if (err) {
      console.error("Error reading files:", err);
      return;
    }

    // Filter out directories
    const validFiles = files.filter((file) => fs.statSync(file).isFile());

    validFiles.forEach(processFile);
  });
};

// Generate a random hex string
function generateRandomHex(length = 6) {
  return Math.floor(Math.random() * Math.pow(16, length))
    .toString(16)
    .padStart(length, "0");
}
