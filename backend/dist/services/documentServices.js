"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromPDF = extractTextFromPDF;
// pdf-parse is a CommonJS module
// Use require() - the module exports a callable function
// @ts-ignore - pdf-parse doesn't have TypeScript definitions
const { PDFParse } = require('pdf-parse');
async function extractTextFromPDF(pdfBuffer) {
    try {
        const parser = new PDFParse({ data: pdfBuffer });
        // Load the document to get metadata and page count
        await parser.load();
        // Get document info and page count
        const info = await parser.getInfo({ parsePageInfo: false });
        const pageCount = info.total;
        // Get text content
        const textData = await parser.getText();
        // Extract metadata
        const metadata = {};
        if (info.info?.Title) {
            metadata.title = info.info.Title;
        }
        if (info.info?.Author) {
            metadata.author = info.info.Author;
        }
        if (info.info?.Subject) {
            metadata.subject = info.info.Subject;
        }
        return {
            text: textData.text,
            pageCount: pageCount,
            metadata,
        };
    }
    catch (error) {
        throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
//# sourceMappingURL=documentServices.js.map