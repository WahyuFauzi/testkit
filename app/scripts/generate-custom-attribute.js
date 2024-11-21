import fs from "fs";
import path from "path";
import glob from "glob";
export const processFile = (filePath) => {
  const fileName = path.basename(filePath, path.extname(filePath));
  const fileContent = fs.readFileSync(filePath, "utf8");
  // Match all tags except <template>, <script>, and <style>
  const updatedContent = fileContent.replace(
    /<(?!template|script|style|any)([a-zA-Z][^>\s]*)([^>]*)>/g,
    (match, tagName, attributes) => {
      // If :test-id is already present, skip
      if (attributes.includes("data-testid")) return match;

      // Add the :test-id attribute dynamically
      const testIdValue = `${fileName}-${tagName}`;
      if (attributes) {
        // If the tag has existing attributes, append the :data-testid to them
        return `<${tagName} data-testid="${testIdValue}-${generateRandomHex()}"${attributes}>`;
      } else {
        return `<${tagName} data-testid="${testIdValue}-${generateRandomHex()}">`;
      }
    }
  );
  
  fs.writeFileSync(filePath, updatedContent, "utf8");
  console.log(`Processed: ${filePath}`);
};

export const generateAttributes = (globPattern) => {
  glob(globPattern, (err, files) => {
    if (err) {
      console.error("Error reading files:", err);
      return;
    }

    // Filter out directories
    const validFiles = files.filter((file) => fs.statSync(file).isFile());

    validFiles.forEach((file) => {
      processFile(file);
    });
  });
}

function generateRandomHex(length = 6) {
  return Math.floor(Math.random() * Math.pow(16, length)).toString(16).padStart(length, '0');
}
