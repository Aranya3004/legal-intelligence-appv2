'use client';
import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
/** Renders AI-generated or user markup only after DOMPurify sanitisation (XSS guard). */
export function SafeText({ html, className }: { html: string; className?: string }) {
  const [safe, setSafe] = useState('');
  useEffect(() => { setSafe(DOMPurify.sanitize(html, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'mark', 'p', 'br', 'ul', 'li'], ALLOWED_ATTR: [] })); }, [html]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: safe }} />;
}
