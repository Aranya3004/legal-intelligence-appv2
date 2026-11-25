'use client';
import { Workspace } from '@/components/Layout/Workspace';
import { useTheme, type Theme } from '@/lib/useTheme';
export default function Settings() {
  const { theme, setTheme } = useTheme();
  return (
    <Workspace title="Settings">
      <section className="card"><h2>Alpha account</h2><p>Profile and security settings for an individual workspace.</p><p className="m">Firm administration, invitations and roles arrive with the June 2027 deployment.</p></section>
      <fieldset className="card"><legend>Appearance</legend>{(['system', 'light', 'dark'] as Theme[]).map((t) => <label key={t} className="field inl"><input type="radio" name="theme" checked={theme === t} onChange={() => setTheme(t)} /> {t}</label>)}</fieldset>
    </Workspace>
  );
}
