#!/usr/bin/env node
const path = require('path');
const config = require('./config/config');

const { extractProperties } = require('./modules/extract-properties/extract-properties');
const { generateClassDiagram } = require('./modules/generate-diagram/generate-diagram');
const { writeDiagramToFile } = require('./modules/generate-diagram/generate-diagram');

async function createDiagramProcess() {
    try {
        const configContent = await config.read();
        const {sourceDir, fileExtension, outputDir, outputFileName} = configContent;

        const sourcePath = path.resolve(process.cwd(), sourceDir);
        const outputPath = path.resolve(process.cwd(), outputDir);

        const classesData = await extractProperties(sourcePath, fileExtension);

        const diagramContent = generateClassDiagram(classesData);
        writeDiagramToFile(diagramContent, outputPath, outputFileName);
    } catch (error) {
        console.error('Error to create diagram:', error);
    }
}

createDiagramProcess();
