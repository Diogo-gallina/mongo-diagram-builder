const fs = require('fs').promises;
const path = require('path');

function generateClassRelations(classesData) {
  const relations = [];
  const classNames = classesData.map(classData => classData.className.toLowerCase());

  classesData.forEach(classData => {
    const { className, properties } = classData;

    properties.forEach((_type, prop) => {
      if (prop.endsWith('Id')) {
        const relatedClassName = prop.slice(0, -2).toLowerCase();

        if (classNames.includes(relatedClassName) && relatedClassName !== className.toLowerCase()) {
          relations.push(`${className} --> ${relatedClassName.charAt(0).toUpperCase() + relatedClassName.slice(1)}`);
        }
      }
    });
  });

  return relations.join('\n  ');
}

function generateClassDiagram(classesData) {  
  let diagram = '```mermaid\nclassDiagram\n';

  const classRelations = generateClassRelations(classesData);
  if(classRelations) diagram += `  ${classRelations}\n\n`;

  classesData.forEach(classData => {
    const { className, properties } = classData;

    diagram += `  class ${className} {\n`;
    properties.forEach((type, prop) => {
      diagram += `    +${type}: ${prop}\n`;
    });
    diagram += '  }\n';
  });

  diagram += '```';
  return diagram;
}

function resolveOutputFileName(outputFileName) {
  const DEFAULT_OUTPUT_FILE_NAME = 'class-diagram.md';
  if (!outputFileName) outputFileName = DEFAULT_OUTPUT_FILE_NAME;
}

function writeDiagramToFile(diagramContent, outputDir, outputFileName) {
  const sourceDir = path.resolve(__dirname, outputDir);
  resolveOutputFileName(outputFileName);
  const outputPath = path.resolve(sourceDir, `${outputFileName}.md`);

  fs.writeFile(outputPath, diagramContent, 'utf-8');
  console.log(`Class diagram generated on path "${outputPath}" with success!`);
}

module.exports = {
  generateClassDiagram,
  writeDiagramToFile
};