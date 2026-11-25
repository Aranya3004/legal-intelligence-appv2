// Exercises the real frontend API client against a running backend: upload → poll → extracted facts.
process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8001';
const run = async () => {
  const { legalApi } = await import('../services/legalApi');
  const steps: string[] = []; const text = 'Agreement between Meridian Supplies Ltd and Alpha Traders Ltd, signed on 12 March 2024. Clause 7.2 requires delivery within 30 days. Price: BDT 500,000.';
  await legalApi.processDocument(new File([text], 'e2e.txt', { type: 'text/plain' }), (s, e) => { if (steps.at(-1) !== s) steps.push(s); if (e) console.log('error:', e); });
  const facts = (await legalApi.getFacts()).filter((f) => f.source.startsWith('e2e.txt'));
  console.log('steps:', steps.join(' → ')); console.log('facts:', facts.map((f) => `${f.group}: ${f.text.slice(0, 40)} (${f.confidence}%)`).join(' | '));
  const bad: string[] = []; await legalApi.processDocument(new File(['x'], 'bad.exe'), (s, e) => { if (s === 'Failed') bad.push(e ?? ''); });
  console.log('rejected:', bad[0]);
  if (steps.at(-1) !== 'Complete' || facts.length < 3 || !bad[0]) process.exit(1);
  console.log('frontend↔backend upload OK'); process.exit(0);
};
run();
