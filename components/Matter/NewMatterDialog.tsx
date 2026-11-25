'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { legalApi } from '@/services/legalApi';
import { DOMAIN_LABEL } from '@/lib/domains';
export function NewMatterDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState(''); const [domain, setDomain] = useState('Contract'); const [touched, setTouched] = useState(false);
  const qc = useQueryClient(); const router = useRouter();
  const create = useMutation({ mutationFn: () => legalApi.createMatter(name.trim(), domain), onSuccess: (m) => { qc.invalidateQueries({ queryKey: ['matters'] }); onClose(); router.push(`/matters/${m.id}`); } });
  const bad = name.trim().length < 3; const field = 'mt-1 block w-full rounded-lg border bg-card px-3 py-2 font-normal text-tx';
  return (
    <Modal title="Create new matter" onClose={onClose}>
      <label className="mb-3 block text-[13px] font-semibold">Matter name
        <input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => setTouched(true)} aria-invalid={touched && bad} aria-describedby="mn-err" placeholder="Client — short description" className={`${field} ${touched && bad ? 'border-er' : 'border-bd'}`} /></label>
      <p id="mn-err" role="alert" className="mb-3 text-er">{touched && bad ? 'Enter at least 3 characters.' : ''}</p>
      <label className="mb-3 block text-[13px] font-semibold">Practice area
        <select value={domain} onChange={(e) => setDomain(e.target.value)} className={`${field} border-bd`}>{Object.entries(DOMAIN_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      {create.isError && <p role="alert" className="mb-3 text-er">{(create.error as Error).message}</p>}
      <div className="flex gap-2"><button className="btn" disabled={create.isPending} onClick={() => { setTouched(true); if (!bad) create.mutate(); }}>{create.isPending ? 'Creating…' : 'Create matter'}</button><button className="btn s" onClick={onClose}>Cancel</button></div>
    </Modal>
  );
}
