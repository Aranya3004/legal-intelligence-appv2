export type CitationStatus = 'Verified' | 'Needs Review' | 'Source Unavailable' | 'Potential Mismatch';
export interface Citation { id: string; type: 'Statute' | 'Case'; name: string; location: string; status: CitationStatus; claim: string; passage: string; explanation: string }
export type FactState = 'draft' | 'confirmed' | 'dismissed';
export interface FactItem { id: string; group: string; text: string; confidence: number; source: string; state: FactState }
export interface Matter { id: string; name: string; status: 'Active' | 'In Review' | 'Completed'; updated: string; documents: number; domain?: 'Company' | 'Contract' | 'Partnership' }
export type PipelineStep = 'Uploading' | 'Parsing OCR' | 'Extracting Entities' | 'Complete' | 'Failed';
export const PIPELINE: PipelineStep[] = ['Uploading', 'Parsing OCR', 'Extracting Entities', 'Complete'];
export interface LegalDocument { id: string; name: string; format: 'PDF' | 'DOCX' | 'TXT'; step: PipelineStep; error?: string }
export interface ReportSection { id: string; title: string; html: string; citationIds: string[] }
export interface ResearchSource { id: string; kind: 'Statute' | 'Case'; title: string; meta: string; passage: string; relevance: number; explanation: string; domain: 'Company' | 'Contract' | 'Partnership' }
export interface ReportComment { id: string; threadId: string; quote: string; author: string; text: string; resolved: boolean }
