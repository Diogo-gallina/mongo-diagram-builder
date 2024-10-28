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
        const sourcePath = path.resolve(__dirname, sourceDir);
        const classesData = await extractProperties(sourcePath, fileExtension);

        const diagramContent = generateClassDiagram(classesData);
        writeDiagramToFile(diagramContent, outputDir, outputFileName);
    } catch (error) {
        console.error('Error in main execution:', error);
    }
}

createDiagramProcess();
