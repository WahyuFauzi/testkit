import fs from "fs";
import path from "path";
import glob from "glob";

// Process a single file and add attributes
export const processFile = (filePath) => {
  const fileName = path.basename(filePath, path.extname(filePath));
  const fileContent = fs.readFileSync(filePath, "utf8");

  // Match all tags except <template>, <script>, and <style>
  const updatedContent = fileContent.replace(
    /<(?!template|script|style|any)([a-zA-Z][^\s>]*)([^>]*)>/g,
    (match, tagName, attributes) => {
      // Skip if data-testid is already present
      if (attributes.includes("data-testid")) return match;

      // Check for `dataCyCustom` attribute
      const dataCyCustomMatch = attributes.match(/dataCyCustom="([^"]+)"/);

      let newAttributes = [];

      if (dataCyCustomMatch) {
        // Generate :dataTestIdCustom based on dataCyCustom
        const dataCyCustomValue = `${tagName}-${fileName}-${generateRandomHex()}`;
        newAttributes.push(`:dataTestIdCustom="${dataCyCustomValue}"`);
      } else {
        // Generate a unique data-testid
        const testIdValue = `${fileName}-${tagName}-${generateRandomHex()}`;
        newAttributes.push(`data-testid="${testIdValue}"`);
      }

      // Append new attributes to the tag
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
