import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import { Providers } from '@/components/Layout/Providers';
import './globals.css';
const inter = Inter({ subsets: ['latin'], variable: '--font-ui' });
const lora = Lora({ subsets: ['latin'], variable: '--font-serif' });
export const metadata: Metadata = { title: 'AI Legal Intelligence Platform', description: 'Alpha — individual workspace' };
const noFlash = "try{var t=localStorage.getItem('theme');var d=t==='dark'||((!t||t==='system')&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light'}catch(e){}";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: noFlash }} /></head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
