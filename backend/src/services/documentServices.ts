// pdf-parse is a CommonJS module
// Use require() - the module exports a callable function
// @ts-ignore - pdf-parse doesn't have TypeScript definitions
const { PDFParse } = require('pdf-parse')

export interface ExtractedTextResult {
  text: string;
  pageCount: number;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
  };
}

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<ExtractedTextResult> {
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
    const metadata: ExtractedTextResult['metadata'] = {};
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
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

