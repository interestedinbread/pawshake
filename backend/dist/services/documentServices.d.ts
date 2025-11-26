export interface ExtractedTextResult {
    text: string;
    pageCount: number;
    metadata: {
        title?: string;
        author?: string;
        subject?: string;
    };
}
export declare function extractTextFromPDF(pdfBuffer: Buffer): Promise<ExtractedTextResult>;
//# sourceMappingURL=documentServices.d.ts.map