import { vi } from 'vitest';
Object.defineProperty(window, 'matchMedia', { value: (q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false }) });
vi.mock('next/navigation', () => ({ usePathname: () => '/documents', useRouter: () => ({ push: vi.fn() }), useParams: () => ({ id: 'MTR-2026-300' }) }));
// jsdom has no layout: give elements a size so the virtualised list renders rows.
(globalThis as any).ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
const rect = { width: 800, height: 480, top: 0, left: 0, right: 800, bottom: 480, x: 0, y: 0, toJSON() {} };
HTMLElement.prototype.getBoundingClientRect = () => rect as DOMRect;
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get: () => 480 });
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => 800 });
