const pdfParse = require('pdf-parse');

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
    const data = await pdfParse(pdfBuffer);

    return {
      text: data.text,
      pageCount: data.numpages,
      metadata: {
        title: data.info?.Title,
        author: data.info?.Author,
        subject: data.info?.Subject,
      },
    };
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

