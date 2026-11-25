import DOMPurify from 'dompurify';
/** Client-only. Strips scripts/attributes from AI or user markup before it reaches the editor. */
export const sanitizeReport = (html: string) => DOMPurify.sanitize(html, { ADD_TAGS: ['mark', 'ins', 'del'], ADD_ATTR: ['data-citation', 'data-thread', 'data-change', 'data-author', 'data-date'] });
