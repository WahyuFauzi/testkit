import fs from "fs";
import glob from "glob";
import path from "path";

function extractTestAttributes(filePattern, existingMapping = {}) {
  const testIdMap = { ...existingMapping };

  // Use glob.sync with the specific pattern
  const files = glob.sync(filePattern);

  files.forEach(filePath => {
    try {
      // Read Vue file content
      const content = fs.readFileSync(filePath, 'utf-8');

      // Regex to find tags with both data-testid and data-cy
      const tagWithBothAttributesRegex = /<[^>]*data-testid="([^"]+)"[^>]*data-cy="([^"]+)"[^>]*>/g;
      const tagWithReversedAttributesRegex = /<[^>]*data-cy="([^"]+)"[^>]*data-testid="([^"]+)"[^>]*>/g;

      let match;
      // Match data-testid first
      while ((match = tagWithBothAttributesRegex.exec(content)) !== null) {
        const [, testId, dataCy] = match;

        // Extract the static value from a conditional expression in data-testid
        const staticTestId = extractStaticValue(testId);

        // Only add if the key doesn't exist
        if (!(staticTestId in testIdMap)) {
          testIdMap[staticTestId] = dataCy;
        }
      }

      // Match data-cy first (in case of different attribute order)
      while ((match = tagWithReversedAttributesRegex.exec(content)) !== null) {
        const [, dataCy, testId] = match;

        // Extract the static value from a conditional expression in data-testid
        const staticTestId = extractStaticValue(testId);

        // Only add if the key doesn't exist
        if (!(staticTestId in testIdMap)) {
          testIdMap[staticTestId] = dataCy;
        }
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  });

  return testIdMap;
}

// Helper function to extract the static value from a conditional expression
function extractStaticValue(testIdExpression) {
  const staticValueMatch = testIdExpression.match(/'([^']+)'/);
  return staticValueMatch ? staticValueMatch[1] : testIdExpression; // Return the static value or the entire expression
}

export function translateAttr(filePattern, outputFile) {
  // Ensure the file pattern is an absolute path
  const absolutePattern = path.isAbsolute(filePattern)
    ? filePattern
    : path.resolve(process.cwd(), filePattern);

  // Try to read existing JSON file
  let existingMapping = {};
  try {
    existingMapping = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
  } catch (error) {
    // If file doesn't exist or is invalid, start with empty object
    console.log('Creating new mapping file');
  }

  // Extract test attributes, preserving existing keys
  const testIdMapping = extractTestAttributes(absolutePattern, existingMapping);

  // Write mapping to JSON file
  fs.writeFileSync(outputFile, JSON.stringify(testIdMapping, null, 2));

  console.log(`Test ID mapping saved to ${outputFile}`);
  console.log('Mapping:', testIdMapping);

  return testIdMapping;
}
