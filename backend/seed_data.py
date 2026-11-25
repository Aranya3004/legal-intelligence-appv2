"""Fictional sample data used to seed an empty database."""
CLIENTS = ["Meridian Supplies", "Harbour Foods", "Rahman & Sen", "Kestrel Logistics", "Nila Textiles", "Orion Traders", "Delta Mills", "Sundarban Exports"]
KINDS = ["Supply Agreement Dispute", "Director Liability Review", "Partnership Dissolution", "Shareholder Agreement", "Breach of Contract Claim"]
STAT = ["Active", "In Review", "Completed"]
MATTERS = [{"id": f"MTR-2026-{300 - i:03d}", "name": f"{CLIENTS[i % 8]} — {KINDS[i % 5]}", "status": STAT[i % 3], "updated": f"{1 + i % 28:02d} Oct 2026", "documents": 3 + i % 9, "domain": "Contract"} for i in range(300)]
_next = [301]
CITATIONS = [
    {"id": "c1", "type": "Statute", "name": "Contract Act 1872 (sample passage)", "location": "Illustrative section A", "status": "Verified", "claim": "Damages are available for direct loss caused by breach.", "passage": "Sample text: a party who suffers loss from a breach may claim compensation for loss that naturally arose from the breach.", "explanation": "The passage supports the claim."},
    {"id": "c2", "type": "Statute", "name": "Companies Act 1994 (sample passage)", "location": "Illustrative section B", "status": "Needs Review", "claim": "Directors owe duties to the company.", "passage": "Sample text: directors must act in good faith in the interests of the company.", "explanation": "Plausible, but the version date is unconfirmed."},
    {"id": "c3", "type": "Case", "name": "Alpha Traders Ltd v. Meridian Supplies (fictional)", "location": "Para. 14", "status": "Potential Mismatch", "claim": "Late delivery is a material breach of the agreement.", "passage": "Sample text: delay in payment was held not to defeat the contract absent an express time stipulation.", "explanation": "The passage concerns payment delay, so it may not support this claim."},
    {"id": "c4", "type": "Case", "name": "Delta Mills v. Orion Foods (fictional)", "location": "Para. 9", "status": "Source Unavailable", "claim": "Repeated late delivery can justify termination.", "passage": "Source passage could not be retrieved.", "explanation": "No explanation: the source is unavailable."},
]
FACTS = [
    {"id": "f1", "group": "Parties", "text": "Meridian Supplies Ltd (buyer); Alpha Traders Ltd (seller)", "confidence": 96, "source": "Supply_Agreement_2024.pdf · p.1", "state": "draft"},
    {"id": "f2", "group": "Key facts", "text": "Three consignments arrived 18–25 days after the agreed date.", "confidence": 78, "source": "Email_Thread.txt · msg 4", "state": "draft"},
    {"id": "f3", "group": "Potential legal issues", "text": "Whether the liquidated damages clause is enforceable.", "confidence": 62, "source": "Supply_Agreement_2024.pdf · p.9", "state": "draft"},
]
SOURCES = [
    {"id": "s1", "kind": "Statute", "title": "Contract Act 1872", "meta": "Illustrative section A (sample)", "passage": "Sample text: a party who suffers loss from a breach may claim compensation for loss that naturally arose from it.", "relevance": 92, "explanation": "Suggests direct loss from late delivery may be compensable; the lawyer must check the real section.", "domain": "Contract"},
    {"id": "s2", "kind": "Statute", "title": "Companies Act 1994", "meta": "Illustrative section B (sample)", "passage": "Sample text: directors must act in good faith in the interests of the company.", "relevance": 61, "explanation": "Marginal relevance unless director conduct is in issue.", "domain": "Company"},
    {"id": "s3", "kind": "Statute", "title": "Partnership Act 1932", "meta": "Illustrative section C (sample)", "passage": "Sample text: partners are jointly liable for acts of the firm.", "relevance": 44, "explanation": "Low relevance to a buyer–seller dispute.", "domain": "Partnership"},
    {"id": "s4", "kind": "Case", "title": "Alpha Traders Ltd v. Meridian Supplies (fictional)", "meta": "Sample High Court Division · 2025 (fictional)", "passage": "Sample text: delay in payment was held not to defeat the contract absent an express time stipulation.", "relevance": 88, "explanation": "Possibly distinguishable: it concerns payment, not delivery.", "domain": "Contract"},
    {"id": "s5", "kind": "Case", "title": "Delta Mills v. Orion Foods (fictional)", "meta": "Sample High Court Division · 2024 (fictional)", "passage": "Sample text: repeated late delivery may justify termination where timing was essential.", "relevance": 81, "explanation": "Supports a materiality argument if the delivery clause is time-critical.", "domain": "Contract"},
]
SECTIONS = [
    {"id": "r1", "title": "Executive Summary", "html": "The buyer may have a claim for damages for repeated late deliveries. Strength depends on whether time was essential.", "citationIds": []},
    {"id": "r2", "title": "Background and Facts", "html": "Three consignments arrived 18–25 days after the agreed date under a supply agreement.", "citationIds": []},
    {"id": "r3", "title": "Legal Issues", "html": "(1) Materiality of late delivery. (2) Enforceability of the liquidated damages clause.", "citationIds": []},
    {"id": "r4", "title": "Applicable Laws and Statutes", "html": "Compensation for loss caused by breach is addressed in sample section A.", "citationIds": ["c1", "c2"]},
    {"id": "r5", "title": "Relevant Judicial Decisions", "html": "Sample decisions point both ways on delay; one may be distinguishable.", "citationIds": ["c3", "c4"]},
    {"id": "r6", "title": "Legal Analysis", "html": "<em>AI-generated:</em> materiality likely turns on the contract’s timing wording and the history of delay.", "citationIds": ["c1"]},
    {"id": "r7", "title": "Potential Arguments", "html": "For the buyer: repeated delay shows a pattern. For the seller: timing was not stipulated as essential.", "citationIds": ["c3"]},
    {"id": "r8", "title": "Limitations and Unresolved Issues", "html": "One source is unavailable and clause 11 has not been tested against authority.", "citationIds": ["c4"]},
    {"id": "r9", "title": "References and Citations", "html": "See the citation list; every reference must be verified before approval.", "citationIds": []},
]
