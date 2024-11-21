import fs from "fs";
import path from "path";
import glob from "glob";

export function generateDynamicAttribute(globPattern) {
  glob(globPattern, (err, files) => {
    if (err) {
      console.error("Error reading files:", err);
      return;
    }

    // Filter out directories
    const validFiles = files.filter((file) => fs.statSync(file).isFile());

    validFiles.forEach(processFile);
  });
}

// Function to process the files
const processFile = (filePath) => {
  const fileName = path.basename(filePath, path.extname(filePath));
  const fileContent = fs.readFileSync(filePath, "utf8");

  // Match all tags except <template>, <script>, and <style>
  const updatedContent = fileContent.replace(
    /<(?!template|script|style|any)([a-zA-Z][^\s>]*)([^>]*)>/g,
    (match, tagName, attributes) => {
      // Skip if data-testid is already present
      if (attributes.includes("data-testid")) return match;

      let newAttributes = [];
      const testIdValue = `${tagName}-${fileName}-${generateRandomHex()}`;
      const testIdWithoutHex = `${tagName}-${fileName}`
      newAttributes.push(`:data-testid="dataTestIdCustom ? \`\${dataTestIdCustom}-${testIdWithoutHex}\` : '${testIdValue}'"`);

      // Append new attributes to the tag
      return `<${tagName} ${newAttributes.join(" ")}${attributes}>`;
    }
  );

  fs.writeFileSync(filePath, updatedContent, "utf8");
  console.log(`Processed: ${filePath}`);
}

// Generate a random hex string
function generateRandomHex(length = 6) {
  return Math.floor(Math.random() * Math.pow(16, length))
    .toString(16)
    .padStart(length, "0");
}
