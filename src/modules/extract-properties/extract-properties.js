const fs = require('fs').promises;
const path = require('path');

async function getFilesFromDirectory(sourceDir, fileExtension) {
  let filesFound = [];

  async function readDir(dir) {
    const files = await fs.readdir(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        await readDir(filePath);
      } else if (file.endsWith(fileExtension)) {
        filesFound.push(filePath);
      }
    }
  }

  await readDir(sourceDir);

  if (filesFound.length === 0) {
    throw new Error(`No files with "${fileExtension}" extension found in this directory: ${sourceDir}`);
  }

  return filesFound;
}

function convertFileNameToClassName(fileName) {
  return fileName
    .replace('.schema', '') 
    .split('-')          
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) 
    .join(''); 
}


async function extractClassOrInterfaceProperties(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const fileName = path.basename(filePath, path.extname(filePath));
  const classNameConverted = convertFileNameToClassName(fileName);

  const schemaClassRegex = new RegExp(`@Schema\\([^)]*\\)\\s*export\\s+class\\s+${classNameConverted}\\s+extends\\s+Document\\s*{([\\s\\S]*?)}\\s*export`, 'm');
  
  const match = schemaClassRegex.exec(content);
  if (!match) {
    throw new Error(`Class with name ${fileName} not founded at: ${filePath}`);
  }

  const body = match[1];
  const propertiesMap = new Map();
  
  const propertyRegex = /@Prop\([^)]*\)\s+([\w]+)\s*:\s*([\w<>.\[\]]+)/g;
  let propertyMatch;

  while ((propertyMatch = propertyRegex.exec(body)) !== null) {
    const propertyName = propertyMatch[1];
    const propertyType = propertyMatch[2];
    propertiesMap.set(propertyName, propertyType);
  }

  return [{ className: classNameConverted, properties: propertiesMap }];
}


async function extractProperties(sourceDir, fileExtension) {
  try {
    const files = await getFilesFromDirectory(sourceDir, fileExtension);
    const results = [];

    for (const file of files) {
      const extractedData = await extractClassOrInterfaceProperties(file);
      results.push(...extractedData);
    }

    return results;
  } catch (error) {
    console.error('Error to extract properties:', error);
    throw error;
  }
}

module.exports = {
  getFilesFromDirectory,
  convertFileNameToClassName,
  extractClassOrInterfaceProperties,
  extractProperties,
};