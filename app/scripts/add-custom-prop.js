import fs from 'fs';
import glob from 'glob';

export function addPropToTSFiles(directory) {
  // Use glob to get all the TypeScript files matching the pattern
  glob(`${directory}`, (err, files) => {
    if (err) {
      console.error('Error finding files:', err);
      return;
    }
  
    // Process each file
    files.forEach(file => {
      console.log(`Processing file: ${file}`);
      addPropToFile(file);
    });
  
    console.log('Finished processing files.');
  });
}

// Function to process each TypeScript file
function addPropToFile(filePath) {
  // Read the content of the file
  let fileContent = fs.readFileSync(filePath, 'utf-8');

  // Define the marker text and the new property to add
  const markerText = 'START VARIABLES';
  const newPropLine = '@Prop({ default: \'\' }) public dataTestIdCustom: string;';

  // Find the line with the marker text (case-sensitive search for simplicity)
  const markerIndex = fileContent.indexOf(markerText);

  if (markerIndex !== -1) {
    // Check if the property already exists
    if (!fileContent.includes('dataTestIdCustom')) {
      // Find the line after the marker to insert the new property
      const beforeMarker = fileContent.slice(0, markerIndex + markerText.length);
      const afterMarker = fileContent.slice(markerIndex + markerText.length);

      // Add the new property declaration after the marker
      fileContent = `${beforeMarker}\n  ${newPropLine}\n${afterMarker}`;
      
      // Write the modified content back to the file
      fs.writeFileSync(filePath, fileContent, 'utf-8');
      console.log(`Added prop to file: ${filePath}`);
    } else {
      console.log(`Prop already exists in file: ${filePath}`);
    }
  } else {
    console.log(`Marker not found in file: ${filePath}`);
  }
}
