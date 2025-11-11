Core Concept:
A virtual assistant that helps users understand their pet insurance policies and file pet insurance claims.

Core Features:

-Insurance claim Q&A
-Claim filing

MVP user flow:

User uploads policy PDF / takes photo.
User policies can consist of a single pdf or multiple pdfs.
OCR converts pages → text.
Automatic extraction pipeline:
	- Run an LLM extractor to produce a JSON summary (deductible, waiting_period, exclusions, required_docs, reimbursement_rate, plan name if detectable).
	- Generate embeddings of chunked policy and index them for RAG.
Present a one-screen policy summary to the user:
	- Key facts (deductible, waiting period, reimbursement) with sources and a confidence indicator.
	- “Edit” buttons for any field (if something looks wrong).
	- Quick actions: “Start a claim” / “Ask a question about my coverage”.
User either confirms (one click) or edits a small number of fields; the assistant proceeds.
For any Q&A, the system uses the structured facts + RAG retrieval and returns answers with quoted excerpts and links.
Only when the extractor is uncertain should the app ask the user clarifying questions — otherwise upload + confirm is enough.



Extraction techniques (practical)


1) OCR & cleanup

- Use a robust OCR to get clean text + page/line metadata.
 - Normalize dates/currency/units after extraction.
 - Strategy: prefer direct PDF text extraction via pdf-parse; fall back to Tesseract.js OCR for scanned PDFs/images.

2) LLM-based structured extraction

- Use a prompt that asks the LLM to output a single JSON object with fixed keys and provenance (page numbers / chunk ids). 
- Use a few-shot prompt with examples (policy text → JSON) to improve reliability.
- Ask the model to include a confidence value or return null for unknown fields.

3) Heuristics & regex post-processing

- After the LLM returns JSON, run deterministic checks:
	- Parse currency / percent / days with regex.
	- Normalize “per-incident” vs “annual” logic.
	- Validate that numeric fields are consistent with extracted text snippets.
- If numeric parsing fails or multiple conflicting candidates appear, mark the field as low_confidence.

4) Use RAG for verification and citations

- For each extracted field, run a quick retrieval (filter by page id) and get the best text snippet. Use that snippet as the source to show the user and to include in the assistant prompt.
- The model should be instructed to cite the snippet when giving an answer.


UX patterns to minimize friction

- Upload-first: Let the user upload the policy and do the extraction automatically.
- One-screen summary with inline edit: show parsed fields as editable chips. Most users will simply confirm.
- Confidence badges: show “High/Medium/Low confidence” next to parsed facts so users know when to double-check.
- Quick clarifying question only when needed: e.g., “We found two deductible amounts ($200 & $250). Which one is yours?” — single-click answer.
- Show source snippets: let users see the exact policy line the app used (builds trust).
- Progressive disclosure: advanced fields hidden under “Show policy details” so the main UI stays simple.

Claim filing assistance
The MVP version of the project will focus on filing claims for Trupanion. The following is a todo list for setting this up:

Research Trupanion claim submission (API, PDF forms, portal steps)
Define claim schema for Trupanion (fields, enums, required docs)
Create insurer adapter interface and Trupanion adapter stub
Implement PDF filling or portal automation path for Trupanion
Add validation with Zod and completeness checks for Trupanion
Implement backend endpoints: create-claim, upload-invoices, generate-submission
Add audit logging and idempotency for submissions
Create mock/test mode for end-to-end demo without real submission

Acceptance criteria (Trupanion MVP)
- User can upload a policy PDF and one or more invoice files.
- System produces a normalized claim JSON that passes Zod validation with no missing critical fields.
- A submission artifact is generated (fillable PDF/email package or portal automation dry-run) for Trupanion.
- User reviews a confirmation screen and explicitly approves before any submission step.
- An audit log entry is created with a run ID, timestamps, and references to attached documents.

TECH STACK
React with Vite
Typescript
Tailwind CSS
Node.js with Express
PostgreSQL
LangChain
pdf-parse
pdf2pic
Tesseract.js
sharp
Chroma (vector db)
(Use Chroma in development; plan a migration path to a managed vector DB like Pinecone, or to pgvector in PostgreSQL, for production.)
JWT
bcrypt
OpenAI