// Extend Express Request type to include custom properties
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      file?: {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
      };
      files?: Array<{
        buffer: Buffer;
        originalname: string;
        mimetype: string;
      }>;
    }
  }
}

export {}; // Makes this a module