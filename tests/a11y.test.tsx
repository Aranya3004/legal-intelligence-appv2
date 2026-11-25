import { describe, it, expect } from 'vitest';
import { render, fireEvent, act, screen, cleanup } from '@testing-library/react';
import axe from 'axe-core';
import { Providers } from '@/components/Layout/Providers';
import Dashboard from '@/app/dashboard/page'; import Matters from '@/app/matters/page'; import MatterPage from '@/app/matters/[id]/page';
import Documents from '@/app/documents/page'; import Research from '@/app/research/page'; import Citations from '@/app/citations/page';
import Reports from '@/app/reports/page'; import Settings from '@/app/settings/page'; import DesignSystem from '@/app/design-system/page';

const settle = (ms = 1300) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });
// Colour contrast needs real layout/rendering, so it is covered separately by scripts/contrast.mjs.
async function audit(label: string) {
  const r = await axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] }, rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
  const msg = r.violations.map((v) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`);
  expect(msg, `${label}\n${msg.join('\n')}`).toEqual([]);
}
const mount = async (ui: React.ReactElement) => { cleanup(); render(<Providers>{ui}</Providers>); await settle(); };

describe('axe: WCAG 2.1 A/AA + best practice on rendered pages', () => {
  it.each([['dashboard', Dashboard], ['matters', Matters], ['matter workspace', MatterPage], ['documents', Documents], ['research', Research], ['citations', Citations], ['reports', Reports], ['settings', Settings], ['design system', DesignSystem]] as const)('%s', async (name, Page) => { await mount(<Page />); await audit(name); });

  it('research results + preview', async () => {
    await mount(<Research />);
    fireEvent.change(screen.getByLabelText(/research question/i), { target: { value: 'late delivery' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' })); await settle(); await audit('research results');
  });
  it('research validation error', async () => { await mount(<Research />); fireEvent.click(screen.getByRole('button', { name: 'Search' })); await settle(200); await audit('research error'); });
  it('fact edit mode', async () => { await mount(<Documents />); fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]); await audit('fact edit'); });
  it('citation mismatch confirmation modal', async () => {
    await mount(<Citations />); fireEvent.click(screen.getByRole('button', { name: /Alpha Traders/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Mark as Verified' })); await settle(100); expect(screen.getByRole('dialog')).toBeTruthy(); await audit('citation modal');
  });
  it('new matter dialog', async () => { await mount(<Matters />); fireEvent.click(screen.getByRole('button', { name: '+ New matter' })); await audit('new matter'); });
  it('report editing + comment dialog', async () => {
    await mount(<Reports />); fireEvent.click(screen.getByRole('button', { name: 'Edit Report' })); await settle(300); await audit('report edit');
    fireEvent.click(screen.getByLabelText(/track changes/i)); await audit('report tracking');
  });
});

describe('audit sanity (negative controls)', () => {
  it('axe really flags broken markup', async () => {
    cleanup(); render(<div><img src="x.png" /><button /><input /><table><tr><td>x</td></tr></table></div>);
    const r = await axe.run(document.body, { rules: { 'color-contrast': { enabled: false } } });
    expect(r.violations.map((v) => v.id)).toEqual(expect.arrayContaining(['image-alt', 'button-name', 'label']));
  });
  it('virtualised matters list renders rows and the pages have real content', async () => {
    await mount(<Matters />); expect(screen.getAllByRole('listitem').length).toBeGreaterThan(3);
    await mount(<Citations />); expect(document.querySelectorAll('tbody tr').length).toBe(4);
  });
});
