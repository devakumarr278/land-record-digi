import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Search, History, Link2, ShieldAlert, FileBarChart,
  Settings as SettingsIcon, LogOut, ChevronsLeft, ChevronsRight,
  ShieldCheck, AlertTriangle, UserCog, CheckCircle2, XCircle, MapPin,
  Download, Filter, ChevronRight, Hash, Lock, X, Loader2, Eye, Clock,
  FileSearch
} from 'lucide-react';

/* =========================================================================
   MOCK DATA
   ========================================================================= */

const AUDIT_EVENTS = [
  { t: '10:42 AM', role: 'Tehsildar', user: 'R. Subramaniam', action: 'approved Area change', doc: 'LR-1021', tone: 'green' },
  { t: '10:38 AM', role: 'Field Officer', user: 'Meena R', action: 'uploaded new scan', doc: 'LR-1044', tone: 'ink' },
  { t: '10:31 AM', role: 'District Admin', user: 'K. Prakash', action: 'reassigned case to Verification Officer', doc: 'LR-1039', tone: 'ink' },
  { t: '10:19 AM', role: 'Tehsildar', user: 'S. Iyer', action: 'rejected Ownership transfer', doc: 'LR-1012', tone: 'rust' },
  { t: '10:05 AM', role: 'Verification Officer', user: 'Karthik S', action: 'corrected Owner field (manual override)', doc: 'LR-1017', tone: 'rust' },
  { t: '9:54 AM', role: 'Auditor', user: 'You', action: 'exported compliance log', doc: 'Q3-2026', tone: 'ink' },
  { t: '9:41 AM', role: 'System', user: 'AI Engine', action: 'auto-validated all fields', doc: 'LR-1009', tone: 'green' },
  { t: '9:22 AM', role: 'Tehsildar', user: 'R. Subramaniam', action: 'approved Mutation record', doc: 'LR-1004', tone: 'green' },
];

// Decision Provenance — every case where a human overruled / corrected the AI.
// `evidence` is the source document the officer checked against, `officerId`
// is the internal ID stamped on the decision record.
const DECISIONS = [
  { doc: 'LR-1017', field: 'Owner Name', role: 'Verification Officer', user: 'Karthik S', officerId: 'OFC-1042', from: 'RAVI KUAMR', to: 'RAVI KUMAR', reason: 'OCR misread — corrected against original scan', evidence: 'Mutation-2010.pdf', t: '9:54 AM', date: '30 Aug 2026' },
  { doc: 'LR-1021', field: 'Area', role: 'Tehsildar', user: 'S. Iyer', officerId: 'OFC-1008', from: '2.50 Aores', to: '2.50 Acres', reason: 'AI confidence below threshold (43%) — manual verification against register', evidence: 'Survey_Register_Vol4.pdf', t: '9:12 AM', date: '30 Aug 2026' },
  { doc: 'LR-1012', field: 'Ownership Transfer', role: 'Tehsildar', user: 'S. Iyer', officerId: 'OFC-1008', from: 'Pending', to: 'Rejected', reason: 'Supporting sale deed did not match claimant identity', evidence: 'sale_deed_1012.pdf', t: '10:19 AM', date: '30 Aug 2026' },
  { doc: 'LR-0988', field: 'Khata No', role: 'District Admin', user: 'K. Prakash', officerId: 'OFC-1001', from: '441', to: '458', reason: 'Cross-checked against legacy archive volume 12', evidence: 'legacy_archive_vol12.pdf', t: '4:03 PM', date: '29 Aug 2026' },
  { doc: 'LR-0975', field: 'Classification', role: 'Verification Officer', user: 'Deepa N', officerId: 'OFC-1055', from: 'Residential', to: 'Agricultural', reason: 'Field visit confirmed land use mismatch', evidence: 'field_visit_report_0975.pdf', t: '2:47 PM', date: '29 Aug 2026' },
];

// Document Provenance — where every extracted value came from:
// Document → Page → Region → OCR/HTR → Extracted Value → Field → Confidence → Model
const DOCUMENT_PROVENANCE = {
  'LR-1017': { page: 4, region: 'Owner field — row 3, left column', coords: { x: 14, y: 52, w: 34, h: 8 }, ocrEngine: 'HTR-v2.1 (handwritten)', field: 'Owner Name', rawValue: 'RAVI KUAMR', confidence: 43, model: 'ExtractNet-v3', extractedAt: '9:04 AM', sourceFile: 'scan_1017_04.jpg' },
  'LR-1021': { page: 2, region: 'Survey table — Area column, row 7', coords: { x: 55, y: 28, w: 30, h: 6 }, ocrEngine: 'OCR-v2.1 (printed)', field: 'Area', rawValue: '2.50 Aores', confidence: 51, model: 'ExtractNet-v3', extractedAt: '8:47 AM', sourceFile: 'scan_1021_02.jpg' },
  'LR-1012': { page: 1, region: 'Transfer clause — paragraph 2', coords: { x: 10, y: 62, w: 72, h: 10 }, ocrEngine: 'OCR-v2.1 (printed)', field: 'Ownership Transfer', rawValue: 'Pending', confidence: 88, model: 'ExtractNet-v3', extractedAt: '9:58 AM', sourceFile: 'sale_deed_1012.pdf' },
  'LR-0988': { page: 6, region: 'Khata register — column 3', coords: { x: 40, y: 18, w: 22, h: 6 }, ocrEngine: 'HTR-v2.0 (handwritten)', field: 'Khata No', rawValue: '441', confidence: 39, model: 'ExtractNet-v2', extractedAt: '3:40 PM · 29 Aug', sourceFile: 'legacy_vol12_p6.jpg' },
  'LR-0975': { page: 3, region: 'Land-use classification box', coords: { x: 20, y: 42, w: 38, h: 6 }, ocrEngine: 'OCR-v2.1 (printed)', field: 'Classification', rawValue: 'Residential', confidence: 67, model: 'ExtractNet-v3', extractedAt: '1:58 PM · 29 Aug', sourceFile: 'field_visit_0975.jpg' },
  'LR-1044': { page: 1, region: 'Header block', coords: { x: 20, y: 8, w: 60, h: 8 }, ocrEngine: 'OCR-v2.1 (printed)', field: 'Survey Number', rawValue: '1044/A', confidence: 96, model: 'ExtractNet-v3', extractedAt: '10:38 AM', sourceFile: 'scan_1044_01.jpg' },
  'LR-1039': { page: 2, region: 'Case assignment note (system)', coords: { x: 12, y: 70, w: 50, h: 6 }, ocrEngine: '—', field: 'Assigned Officer', rawValue: '—', confidence: null, model: '—', extractedAt: '10:31 AM', sourceFile: '—' },
  'LR-1009': { page: 1, region: 'Full-page auto-validation', coords: { x: 8, y: 8, w: 84, h: 84 }, ocrEngine: 'OCR-v2.1 (printed)', field: 'All Fields', rawValue: '—', confidence: 92, model: 'ExtractNet-v3', extractedAt: '9:41 AM', sourceFile: 'scan_1009_01.jpg' },
  'LR-1004': { page: 1, region: 'Mutation record header', coords: { x: 15, y: 10, w: 60, h: 8 }, ocrEngine: 'OCR-v2.1 (printed)', field: 'Mutation Type', rawValue: 'Sale', confidence: 94, model: 'ExtractNet-v3', extractedAt: '9:15 AM', sourceFile: 'mutation_1004.pdf' },
};

const CHAIN_BLOCKS = [
  { id: 'B-88231', doc: 'LR-1021', hash: '7a3f9e...c02d', prev: '4b1c88...7f11', t: '10:42 AM' },
  { id: 'B-88230', doc: 'LR-1044', hash: '4b1c88...7f11', prev: '9e0a21...3bd4', t: '10:38 AM' },
  { id: 'B-88229', doc: 'LR-1039', hash: '9e0a21...3bd4', prev: 'd12f66...aa08', t: '10:31 AM' },
  { id: 'B-88228', doc: 'LR-1012', hash: 'd12f66...aa08', prev: '81cbe3...5502', t: '10:19 AM' },
  { id: 'B-88227', doc: 'LR-1017', hash: '81cbe3...5502', prev: '2fd410...9c77', t: '10:05 AM' },
  { id: 'B-88226', doc: 'LR-1009', hash: '2fd410...9c77', prev: 'e6a879...10f3', t: '9:41 AM' },
];

const TAMPER_ALERTS = [];

const COMPLIANCE_LOGS = [
  { period: 'August 2026', events: 45210, overrides: 24, status: 'Ready', size: '3.2 MB' },
  { period: 'July 2026', events: 61840, overrides: 31, status: 'Ready', size: '4.1 MB' },
  { period: 'June 2026', events: 58920, overrides: 19, status: 'Ready', size: '3.9 MB' },
  { period: 'May 2026', events: 52310, overrides: 27, status: 'Ready', size: '3.5 MB' },
];

const NAV = [
  { group: 'Main', items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  { group: 'Provenance', items: [
    { id: 'trace', label: 'Trace Document', icon: Search },
    { id: 'decisions', label: 'Decision History', icon: History },
  ] },
  { group: 'Ledger', items: [
    { id: 'chain', label: 'Hash-Chain Viewer', icon: Link2 },
    { id: 'alerts', label: 'Tamper Alerts', icon: ShieldAlert },
  ] },
  { group: 'Reports', items: [
    { id: 'compliance', label: 'Compliance Logs', icon: FileBarChart },
  ] },
];

/* =========================================================================
   HELPERS
   ========================================================================= */

function docTrail(docId) {
  return [
    { t: '9:02 AM', role: 'Field Officer', user: 'Meena R', action: `Uploaded ${docId} (scan_04.jpg)`, tone: 'ink' },
    { t: '9:03 AM', role: 'System', user: 'AI Engine', action: 'Preprocessing + OCR completed', tone: 'ink' },
    { t: '9:04 AM', role: 'System', user: 'AI Engine', action: 'Fields extracted — Area flagged (43% confidence)', tone: 'rust' },
    { t: '9:54 AM', role: 'Verification Officer', user: 'Karthik S', action: 'Manually corrected Area field', tone: 'rust' },
    { t: '10:12 AM', role: 'Tehsildar', user: 'S. Iyer', action: 'Reviewed and approved for submission', tone: 'green' },
    { t: '10:42 AM', role: 'District Admin', user: 'K. Prakash', action: 'Signed off — record finalized', tone: 'green' },
  ];
}

function getProvenance(docId) {
  return DOCUMENT_PROVENANCE[docId] || null;
}

function getDecisionFor(docId) {
  return DECISIONS.find(d => d.doc === docId) || null;
}

function getChainBlockFor(docId) {
  return CHAIN_BLOCKS.find(b => b.doc === docId) || null;
}

// Builds the "Who → Action → Object → Time → Result" trail for a single
// document by combining its extraction provenance, any human decision, and
// any matching entries from the live audit feed.
function buildDocumentAuditTrail(docId) {
  const prov = getProvenance(docId);
  const decision = getDecisionFor(docId);
  const rows = [];

  if (prov) {
    rows.push({
      t: prov.extractedAt, who: 'Field Officer', role: 'Field Officer',
      action: 'Uploaded document', object: prov.sourceFile, result: 'ok',
    });
    if (prov.ocrEngine !== '—') {
      rows.push({
        t: prov.extractedAt, who: 'AI Engine', role: 'System',
        action: `Extracted "${prov.field}" via ${prov.ocrEngine}`,
        object: prov.rawValue,
        result: prov.confidence != null && prov.confidence < 60 ? 'flagged' : 'ok',
      });
    }
  }

  AUDIT_EVENTS.filter(e => e.doc === docId).forEach(e => {
    rows.push({
      t: e.t, who: e.user, role: e.role, action: e.action, object: docId,
      result: e.tone === 'rust' ? 'flagged' : e.tone === 'green' ? 'ok' : 'info',
    });
  });

  if (decision) {
    rows.push({
      t: decision.t, who: decision.user, role: decision.role,
      action: `Corrected "${decision.field}": ${decision.reason}`,
      object: `${decision.from} → ${decision.to}`,
      result: 'decision',
    });
  }

  return rows;
}

/* =========================================================================
   ROOT COMPONENT
   ========================================================================= */

export default function AuditorDashboard({ userName = 'Auditor', onLogout = () => {}, addToast = () => {} }) {
  useEffect(() => {
    if (document.getElementById('op-dash-fonts')) return;
    const link = document.createElement('link');
    link.id = 'op-dash-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);

  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchId, setSearchId] = useState('');
  const [tracedDoc, setTracedDoc] = useState(null);
  const [exporting, setExporting] = useState(null);
  const [provenanceDoc, setProvenanceDoc] = useState(null); // doc id currently open in the provenance modal

  const events = AUDIT_EVENTS;
  const tamperCount = TAMPER_ALERTS.length;

  function handleTrace(e) {
    e.preventDefault();
    const id = searchId.trim();
    if (!id) { addToast('Enter a document ID to trace.'); return; }
    setTracedDoc(id);
  }

  function goSearch() {
    setActiveTab('trace');
  }

  function exportLog(period) {
    setExporting(period);
    setTimeout(() => {
      const log = COMPLIANCE_LOGS.find(l => l.period === period);

      // Build a CSV export: summary row + the underlying audit events for context
      const rows = [
        ['Compliance Log', period],
        ['Total Audit Events', log ? log.events : ''],
        ['Manual Overrides', log ? log.overrides : ''],
        ['Ledger Integrity', '100% Verified'],
        ['Exported By', userName],
        ['Exported At', new Date().toLocaleString('en-IN')],
        [],
        ['Time', 'Role', 'User', 'Action', 'Document'],
        ...events.map(e => [e.t, e.role, e.user, e.action, e.doc]),
      ];
      const csv = rows
        .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-log-${period.replace(/\s+/g, '-').toLowerCase()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExporting(null);
      addToast(`Compliance log for ${period} downloaded.`, 'success');
    }, 700);
  }

  // Small helper so any document ID anywhere in the UI opens the same
  // provenance modal — this is the "click a doc → see everything" entry point.
  function DocLink({ id }) {
    return (
      <button type="button" className="doc-link mono" onClick={() => setProvenanceDoc(id)} title={`View provenance for ${id}`}>
        {id}
      </button>
    );
  }

  /* ---------------------------------------------------------------------
     PAGE RENDERERS
     --------------------------------------------------------------------- */

  function renderDashboard() {
    return (
      <>
        <PageHead title={`Welcome, ${userName} 🧾`} sub="Provenance, decisions, and ledger integrity across the platform." />
        <div className="kpi-grid">
          <KPI label="Total Audit Events" val="45,210" sub="Today" icon={History} />
          <KPI label="Tamper Alerts" val={tamperCount} icon={ShieldAlert} tone={tamperCount > 0 ? 'rust' : 'green'} />
          <KPI label="Manual Overrides" val="24" icon={UserCog} />
          <KPI label="Ledger Integrity" val="100% Verified" icon={ShieldCheck} tone="green" />
        </div>

        <div className="grid-2">
          <div className="panel">
            <div className="panel-head"><h3>LIVE AUDIT TRAIL</h3><span className="live-dot" /></div>
            <div className="panel-body" style={{ padding: 0 }}>
              <div className="feed-list">
                {events.map((e, i) => (
                  <div key={i} className="feed-row">
                    <span className="feed-time mono">{e.t}</span>
                    <div className="feed-body">
                      <span className={`feed-role tone-${e.tone}`}>{e.role}</span>
                      <span> <b>{e.user}</b> {e.action} on {DOCUMENT_PROVENANCE[e.doc] ? <DocLink id={e.doc} /> : <span className="mono">{e.doc}</span>}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><h3>HASH-CHAIN INTEGRITY</h3><span className="badge badge-green"><Lock size={11} /> Intact</span></div>
            <div className="panel-body">
              <div className="chain-mini">
                {CHAIN_BLOCKS.slice(0, 5).map((b, i) => (
                  <React.Fragment key={b.id}>
                    <div className="chain-block-mini">
                      <Hash size={12} />
                      <span className="mono">{b.hash}</span>
                    </div>
                    {i < 4 && <div className="chain-link" />}
                  </React.Fragment>
                ))}
              </div>
              <button className="btn btn-outline btn-block" style={{ marginTop: 16 }} onClick={() => setActiveTab('chain')}>
                <Link2 size={15} /> Open Full Chain Viewer
              </button>
            </div>
          </div>
        </div>

        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-head"><h3>QUICK ACTIONS</h3></div>
          <div className="panel-body quick-actions quick-actions-row">
            <button className="qa-btn" onClick={goSearch}><Search size={17} /> Search by Document ID</button>
            <button className="qa-btn" onClick={() => setActiveTab('alerts')}><AlertTriangle size={17} /> View Tamper Alerts</button>
            <button className="qa-btn" onClick={() => exportLog('August 2026')}><Download size={17} /> Export Compliance Log</button>
          </div>
        </div>
      </>
    );
  }

  function renderTrace() {
    const trail = tracedDoc ? docTrail(tracedDoc) : null;
    const hasProvenance = tracedDoc && DOCUMENT_PROVENANCE[tracedDoc];
    return (
      <>
        <PageHead title="Trace Document" sub="Look up the full provenance history of any record." />
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-body">
            <form onSubmit={handleTrace} className="trace-form">
              <div className="tb-search trace-search">
                <Search size={14} />
                <input placeholder="Enter document ID, e.g. LR-1021" value={searchId} onChange={e => setSearchId(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary">Trace</button>
            </form>
          </div>
        </div>

        {trail ? (
          <div className="panel">
            <div className="panel-head">
              <h3>PROVENANCE — {tracedDoc.toUpperCase()}</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="badge badge-green"><ShieldCheck size={11} /> Chain Verified</span>
                {hasProvenance && (
                  <button className="btn btn-outline btn-sm" onClick={() => setProvenanceDoc(tracedDoc)}>
                    <FileSearch size={13} /> Full Document + Decision Provenance
                  </button>
                )}
              </div>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              <div className="feed-list">
                {trail.map((e, i) => (
                  <div key={i} className="feed-row">
                    <span className="feed-time mono">{e.t}</span>
                    <div className="feed-body">
                      <span className={`feed-role tone-${e.tone}`}>{e.role}</span>
                      <span> <b>{e.user}</b> — {e.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState icon={Search} title="No document traced yet" sub="Enter a document ID above to see its full history." />
        )}
      </>
    );
  }

  function renderDecisions() {
    return (
      <>
        <PageHead title="Decision History" sub="Every case where a human overruled or corrected the AI. Click a document to see its full provenance." />
        <div className="panel">
          <div className="panel-body">
            <table>
              <thead><tr><th>Document</th><th>Field</th><th>Change</th><th>By</th><th>Reason</th><th>When</th><th></th></tr></thead>
              <tbody>
                {DECISIONS.map((d, i) => (
                  <tr key={i}>
                    <td className="mono"><DocLink id={d.doc} /></td>
                    <td>{d.field}</td>
                    <td><span className="mono strike">{d.from}</span> <ChevronRight size={12} style={{ verticalAlign: 'middle', margin: '0 2px' }} /> <span className="mono">{d.to}</span></td>
                    <td>{d.user}<span className="int-sub">{d.role}</span></td>
                    <td className="reason-cell">{d.reason}</td>
                    <td className="mono" style={{ whiteSpace: 'nowrap' }}>{d.date}<br /><span className="int-sub">{d.t}</span></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setProvenanceDoc(d.doc)}>
                        <Eye size={13} /> Evidence
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  function renderChain() {
    return (
      <>
        <PageHead title="Hash-Chain Viewer" sub="Every record is cryptographically linked to the one before it — a tamper-evident chain, not a blockchain." />
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          <KPI label="Chain Length" val="88,231 Blocks" icon={Link2} />
          <KPI label="Broken Links" val="0" icon={ShieldAlert} tone="green" />
          <KPI label="Last Verified" val="Just now" icon={ShieldCheck} tone="green" />
        </div>
        <div className="panel">
          <div className="panel-head"><h3>RECENT CHAIN — MOST RECENT FIRST</h3></div>
          <div className="panel-body">
            <div className="chain-full">
              {CHAIN_BLOCKS.map((b, i) => (
                <React.Fragment key={b.id}>
                  <div className="chain-block">
                    <div className="cb-top">
                      <span className="mono cb-id">{b.id}</span>
                      <span className="badge badge-green"><CheckCircle2 size={11} /> Verified</span>
                    </div>
                    <div className="cb-row"><span className="k">Document</span><span className="v"><DocLink id={b.doc} /></span></div>
                    <div className="cb-row"><span className="k">Hash</span><span className="v mono">{b.hash}</span></div>
                    <div className="cb-row"><span className="k">Prev Hash</span><span className="v mono">{b.prev}</span></div>
                    <div className="cb-row"><span className="k">Timestamp</span><span className="v mono">{b.t}</span></div>
                  </div>
                  {i < CHAIN_BLOCKS.length - 1 && <div className="chain-link-v" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  function renderAlerts() {
    if (tamperCount === 0) {
      return (
        <>
          <PageHead title="Tamper Alerts" sub="Discrepancies between the ledger and the underlying records." />
          <div className="panel">
            <div className="panel-body">
              <EmptyState icon={ShieldCheck} title="No tamper alerts" sub="The hash-chain has been continuously verified — no broken links or record mismatches detected." />
            </div>
          </div>
        </>
      );
    }
    return (
      <>
        <PageHead title="Tamper Alerts" sub="Discrepancies between the ledger and the underlying records." />
        <div className="panel"><div className="panel-body">{/* would render TAMPER_ALERTS table if non-empty */}</div></div>
      </>
    );
  }

  function renderCompliance() {
    return (
      <>
        <PageHead title="Compliance Logs" sub="Monthly exportable logs of every audited event." />
        <div className="panel">
          <div className="panel-body">
            <table>
              <thead><tr><th>Period</th><th>Audit Events</th><th>Manual Overrides</th><th>File Size</th><th></th></tr></thead>
              <tbody>
                {COMPLIANCE_LOGS.map(l => (
                  <tr key={l.period}>
                    <td><b>{l.period}</b></td>
                    <td className="mono">{l.events.toLocaleString('en-IN')}</td>
                    <td className="mono">{l.overrides}</td>
                    <td className="mono">{l.size}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => exportLog(l.period)} disabled={exporting === l.period}>
                        {exporting === l.period ? <Loader2 size={13} className="spin" /> : <Download size={13} />}
                        {exporting === l.period ? 'Exporting…' : 'Export'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  function renderSettings() {
    return (
      <>
        <PageHead title="Settings" sub="Your account preferences." />
        <div className="panel"><div className="panel-body">
          <div className="field"><label>Name</label><input type="text" defaultValue={userName} /></div>
          <div className="field"><label>Role</label><input type="text" defaultValue="Auditor" disabled /></div>
          <button className="btn btn-primary" onClick={() => addToast('Settings saved.', 'success')}>Save Changes</button>
        </div></div>
      </>
    );
  }

  function renderContent() {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'trace': return renderTrace();
      case 'decisions': return renderDecisions();
      case 'chain': return renderChain();
      case 'alerts': return renderAlerts();
      case 'compliance': return renderCompliance();
      case 'settings': return renderSettings();
      default: return null;
    }
  }

  /* ---------------------------------------------------------------------
     LAYOUT
     --------------------------------------------------------------------- */

  return (
    <div className="op-dash">
      <style>{CSS}</style>

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} no-print`}>
        <div className="sb-top">
          <div className="brand">
            <div className="brand-mark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 20V10L12 4L20 10V20" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M9 20V14H15V20" stroke="white" strokeWidth="1.8" />
              </svg>
            </div>
            {!collapsed && <span className="brand-name">Land<em>Intel</em></span>}
          </div>
          <button className="sb-toggle" onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>

        <nav className="sb-nav">
          {NAV.map(g => (
            <div key={g.group} className="sb-group">
              {!collapsed && <div className="sb-group-label">{g.group}</div>}
              {g.items.map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button key={item.id} className={`sb-item ${active ? 'active' : ''}`} onClick={() => setActiveTab(item.id)} title={collapsed ? item.label : undefined}>
                    <Icon size={17} />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sb-bottom">
          <button className={`sb-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')} title={collapsed ? 'Settings' : undefined}>
            <SettingsIcon size={17} />{!collapsed && <span>Settings</span>}
          </button>
          <button className="sb-item" onClick={onLogout} title={collapsed ? 'Logout' : undefined}>
            <LogOut size={17} />{!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar no-print">
          <div className="tb-left">
            <span className="tb-title">LandIntel</span>
            <span className="tb-chip">Auditor</span>
          </div>
          <div className="tb-right">
            <div className="tb-search"><Search size={14} /><input placeholder="Search document, user, event…"
              onKeyDown={e => { if (e.key === 'Enter') { setSearchId(e.target.value); setActiveTab('trace'); } }} /></div>
            <div className="tb-user"><MapPin size={13} /> {userName}</div>
          </div>
        </header>
        <div className="page">{renderContent()}</div>
      </div>

      {provenanceDoc && (
        <ProvenanceModal docId={provenanceDoc} onClose={() => setProvenanceDoc(null)} />
      )}
    </div>
  );
}

/* =========================================================================
   PROVENANCE MODAL
   Opens whenever any document ID is clicked. Shows, in order:
     1. Document Provenance  — where the value physically came from
     2. Decision Provenance  — what a human changed and why (if any)
     3. Audit Trail          — who → action → object → time → result
     4. Ledger Verification  — the tamper-evident hash-chain block
   ========================================================================= */

function ProvenanceModal({ docId, onClose }) {
  const [showEvidence, setShowEvidence] = useState(false);
  const prov = getProvenance(docId);
  const decision = getDecisionFor(docId);
  const chainBlock = getChainBlockFor(docId);
  const trail = buildDocumentAuditTrail(docId);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const steps = prov ? [
    { label: 'Document', value: docId },
    { label: 'Page', value: `Page ${prov.page}` },
    { label: 'Region', value: prov.region },
    { label: 'OCR / HTR Engine', value: prov.ocrEngine },
    { label: 'Extracted Value', value: prov.rawValue, mono: true },
    { label: 'Field', value: prov.field },
    { label: 'Confidence', value: prov.confidence != null ? `${prov.confidence}%` : '—', tone: prov.confidence != null && prov.confidence < 60 ? 'rust' : 'green' },
    { label: 'Model', value: prov.model },
  ] : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <style>{MODAL_CSS}</style>
      <div className="modal-panel" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <span className="modal-eyebrow">DOCUMENT PROVENANCE</span>
            <h3 className="mono">{docId}</h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="modal-body">
          {/* 1. DOCUMENT PROVENANCE */}
          <section className="prov-section">
            <div className="prov-section-head"><FileSearch size={15} /><h4>Where this value came from</h4></div>
            {prov ? (
              <>
                <div className="prov-chain">
                  {steps.map((s, i) => (
                    <div className="prov-step" key={s.label}>
                      <div className="prov-step-marker">
                        <span className="prov-step-num">{i + 1}</span>
                        {i < steps.length - 1 && <span className="prov-step-line" />}
                      </div>
                      <div className="prov-step-body">
                        <span className="prov-step-label">{s.label}</span>
                        <span className={`prov-step-val ${s.mono ? 'mono' : ''} ${s.tone ? `tone-text-${s.tone}` : ''}`}>{s.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="btn btn-outline btn-sm" style={{ marginTop: 4 }} onClick={() => setShowEvidence(v => !v)}>
                  <Eye size={13} /> {showEvidence ? 'Hide' : 'View'} Evidence Region
                </button>

                {showEvidence && (
                  <div className="evidence-wrap">
                    <div className="evidence-page">
                      <div
                        className="evidence-highlight"
                        style={{ left: `${prov.coords.x}%`, top: `${prov.coords.y}%`, width: `${prov.coords.w}%`, height: `${prov.coords.h}%` }}
                        title={prov.region}
                      />
                    </div>
                    <span className="evidence-caption mono">{prov.sourceFile} — page {prov.page} — {prov.region}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="muted">No extraction provenance recorded for this document yet.</p>
            )}
          </section>

          {/* 2. DECISION PROVENANCE */}
          {decision && (
            <section className="prov-section">
              <div className="prov-section-head"><UserCog size={15} /><h4>Decision Provenance</h4></div>
              <div className="decision-diff">
                <div className="diff-card diff-ai">
                  <span className="diff-label">AI VALUE</span>
                  <span className="diff-val mono strike">{decision.from}</span>
                  <span className="diff-sub">Confidence {prov?.confidence ?? '—'}%</span>
                </div>
                <ChevronRight size={18} className="diff-arrow" />
                <div className="diff-card diff-human">
                  <span className="diff-label">HUMAN VALUE</span>
                  <span className="diff-val mono">{decision.to}</span>
                  <span className="diff-sub">Verified by authorized official</span>
                </div>
              </div>

              <div className="decision-meta">
                <div className="dm-row"><span className="k">Changed by</span><span className="v">{decision.user} · {decision.role}{decision.officerId ? ` (${decision.officerId})` : ''}</span></div>
                <div className="dm-row"><span className="k">Time</span><span className="v mono">{decision.date}, {decision.t}</span></div>
                <div className="dm-row"><span className="k">Reason</span><span className="v">{decision.reason}</span></div>
                <div className="dm-row"><span className="k">Evidence</span><span className="v mono">{decision.evidence || '—'}</span></div>
              </div>

              <div className="authority-note"><ShieldCheck size={13} /> AI assisted the extraction — the authorized official made the final decision.</div>
            </section>
          )}

          {/* 3. AUDIT TRAIL */}
          <section className="prov-section">
            <div className="prov-section-head"><History size={15} /><h4>Audit Trail — {docId}</h4></div>
            <table className="trail-table">
              <thead><tr><th>Who</th><th>Action</th><th>Object</th><th>Time</th><th>Result</th></tr></thead>
              <tbody>
                {trail.map((r, i) => (
                  <tr key={i}>
                    <td>{r.who}<span className="int-sub">{r.role}</span></td>
                    <td>{r.action}</td>
                    <td className="mono">{r.object}</td>
                    <td className="mono" style={{ whiteSpace: 'nowrap' }}><Clock size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />{r.t}</td>
                    <td>
                      {r.result === 'ok' && <span className="badge badge-green"><CheckCircle2 size={11} /> OK</span>}
                      {r.result === 'flagged' && <span className="badge badge-rust"><AlertTriangle size={11} /> Flagged</span>}
                      {r.result === 'decision' && <span className="badge badge-ink"><UserCog size={11} /> Decision</span>}
                      {r.result === 'info' && <span className="badge badge-ink">Info</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 4. LEDGER VERIFICATION */}
          <section className="prov-section">
            <div className="prov-section-head"><Link2 size={15} /><h4>Ledger Verification</h4></div>
            {chainBlock ? (
              <div className="ledger-check">
                <span className="badge badge-green"><Lock size={11} /> Tamper-evident chain — Verified</span>
                <div className="cb-row"><span className="k">Block</span><span className="v mono">{chainBlock.id}</span></div>
                <div className="cb-row"><span className="k">Hash</span><span className="v mono">{chainBlock.hash}</span></div>
                <div className="cb-row"><span className="k">Previous Hash</span><span className="v mono">{chainBlock.prev}</span></div>
                <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>
                  Each audit entry stores the hash of the one before it. Editing this record after the fact
                  would change its hash and break every block that follows — the mismatch is what surfaces
                  as a tamper alert, not a rewritten history.
                </p>
              </div>
            ) : (
              <span className="muted">No ledger block recorded yet for this document.</span>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   SMALL SHARED PIECES
   ========================================================================= */

function PageHead({ title, sub, rightBtn }) {
  return (
    <div className="page-head">
      <div><h2>{title}</h2><p>{sub}</p></div>
      {rightBtn}
    </div>
  );
}

function KPI({ label, val, icon: Icon, tone = 'ink', sub }) {
  return (
    <div className="kpi">
      <div className={`kpi-ic tone-${tone}`}><Icon size={16} /></div>
      <div className="kpi-val">{val}</div>
      <div className="kpi-label">{label}{sub && <span className="kpi-sub"> · {sub}</span>}</div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, sub }) {
  return <div className="empty-state"><Icon size={28} /><b>{title}</b><span>{sub}</span></div>;
}

/* =========================================================================
   CSS — same design tokens as the Operator dashboard, extended for the
   audit feed, hash-chain visuals, and compliance log table
   ========================================================================= */

const CSS = `
:root{
  --ink:#1B2A41; --ink-soft:#3B4A63; --ink-faint:#7C879B;
  --paper:#F6F5F0; --paper-raised:#FFFFFF; --line:#DCD9CE; --line-strong:#C7C3B5;
  --rust:#C1502E; --rust-soft:#F4E3DC;
  --green:#2F4A3D; --green-soft:#E4EAE3;
  --navy-soft:#E2E7EF;
}
.op-dash{ display:flex; min-height:100vh; background:var(--paper); color:var(--ink);
  font-family:'IBM Plex Sans', system-ui, sans-serif; font-size:14px; line-height:1.5; }
.op-dash *{ box-sizing:border-box; }
.op-dash h1,.op-dash h2,.op-dash h3,.op-dash h4{ font-family:'Source Serif 4', Georgia, serif; margin:0; color:var(--ink); }
.op-dash .mono{ font-family:'IBM Plex Mono', monospace; }
.op-dash button{ font-family:inherit; cursor:pointer; }
.op-dash input,.op-dash select{ font-family:inherit; }
.spin{ animation:spin 1s linear infinite; }
@keyframes spin{ to{ transform:rotate(360deg); } }

/* Sidebar */
.sidebar{ width:240px; background:var(--ink); color:#C9D2DE; display:flex; flex-direction:column; flex:none; transition:width .18s ease; }
.sidebar.collapsed{ width:72px; }
.sb-top{ display:flex; align-items:center; justify-content:space-between; padding:18px 16px; border-bottom:1px solid rgba(255,255,255,0.1); }
.brand{ display:flex; align-items:center; gap:10px; overflow:hidden; }
.brand-mark{ width:30px; height:30px; border-radius:50%; background:rgba(255,255,255,0.12); display:flex; align-items:center; justify-content:center; flex:none; }
.brand-name{ font-family:'Source Serif 4', serif; font-size:16px; font-weight:600; color:#fff; white-space:nowrap; }
.brand-name em{ font-style:normal; color:var(--rust); }
.sb-toggle{ background:transparent; border:1px solid rgba(255,255,255,0.15); color:#C9D2DE; border-radius:4px; width:26px; height:26px; display:flex; align-items:center; justify-content:center; flex:none; }
.sb-toggle:hover{ background:rgba(255,255,255,0.08); }
.sb-nav{ flex:1; overflow-y:auto; padding:14px 10px; }
.sb-group{ margin-bottom:16px; }
.sb-group-label{ font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#7C879B; padding:0 10px; margin-bottom:6px; }
.sb-item{ display:flex; align-items:center; gap:11px; width:100%; padding:9px 10px; border:none; background:transparent; color:#C9D2DE; border-radius:4px; font-size:13.5px; font-weight:500; text-align:left; white-space:nowrap; overflow:hidden; }
.sb-item span{ overflow:hidden; text-overflow:ellipsis; }
.sb-item:hover{ background:rgba(255,255,255,0.06); color:#fff; }
.sb-item.active{ background:rgba(193,80,46,0.18); color:#fff; box-shadow:inset 2px 0 0 var(--rust); }
.sb-bottom{ padding:12px 10px 16px; border-top:1px solid rgba(255,255,255,0.1); display:flex; flex-direction:column; gap:2px; }

/* Main / topbar */
.main{ flex:1; display:flex; flex-direction:column; min-width:0; }
.topbar{ height:60px; background:var(--paper-raised); border-bottom:1px solid var(--line); display:flex; align-items:center; justify-content:space-between; padding:0 26px; flex:none; }
.tb-left{ display:flex; align-items:center; gap:12px; }
.tb-title{ font-family:'Source Serif 4', serif; font-weight:600; font-size:16px; }
.tb-chip{ font-family:'IBM Plex Mono', monospace; font-size:10.5px; letter-spacing:0.06em; text-transform:uppercase; background:var(--rust-soft); color:var(--rust); padding:3px 9px; border-radius:2px; }
.tb-right{ display:flex; align-items:center; gap:18px; }
.tb-search{ display:flex; align-items:center; gap:8px; background:var(--paper); border:1px solid var(--line); border-radius:4px; padding:7px 12px; color:var(--ink-faint); }
.tb-search input{ border:none; background:transparent; outline:none; font-size:13px; width:200px; color:var(--ink); }
.tb-user{ display:flex; align-items:center; gap:6px; font-size:13px; color:var(--ink-soft); font-weight:500; }

.page{ padding:30px 32px 60px; overflow-y:auto; }
.page-head{ display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:24px; }
.page-head h2{ font-size:24px; font-weight:600; }
.page-head p{ margin:6px 0 0; color:var(--ink-soft); font-size:13.5px; }

/* KPI */
.kpi-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:24px; }
.kpi{ background:var(--paper-raised); border:1px solid var(--line); padding:18px; position:relative; }
.kpi-ic{ width:30px; height:30px; border-radius:6px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
.tone-ink{ background:var(--navy-soft); color:var(--ink); }
.tone-rust{ background:var(--rust-soft); color:var(--rust); }
.tone-green{ background:var(--green-soft); color:var(--green); }
.kpi-val{ font-family:'Source Serif 4', serif; font-size:24px; font-weight:600; }
.kpi-label{ font-size:12px; color:var(--ink-faint); margin-top:2px; }
.kpi-sub{ color:var(--ink-faint); }

/* Panels */
.grid-2{ display:grid; grid-template-columns:1.2fr 1fr; gap:16px; }
.panel{ background:var(--paper-raised); border:1px solid var(--line); }
.panel-head{ display:flex; justify-content:space-between; align-items:center; padding:14px 20px; border-bottom:1px solid var(--line); }
.panel-head h3{ font-family:'IBM Plex Mono', monospace; font-size:11.5px; letter-spacing:0.08em; color:var(--ink-faint); font-weight:500; }
.panel-body{ padding:20px; }
.muted{ color:var(--ink-faint); font-size:13px; }
.live-dot{ width:8px; height:8px; border-radius:50%; background:var(--green); box-shadow:0 0 0 3px var(--green-soft); }

.quick-actions{ display:flex; flex-direction:column; gap:10px; }
.quick-actions-row{ flex-direction:row; flex-wrap:wrap; }
.qa-btn{ display:flex; align-items:center; gap:10px; padding:12px 14px; border:1px solid var(--line); background:var(--paper); border-radius:2px; font-size:13.5px; font-weight:500; color:var(--ink); flex:1; min-width:220px; }
.qa-btn:hover{ border-color:var(--rust); color:var(--rust); }

/* Buttons / forms */
.btn{ display:inline-flex; align-items:center; gap:7px; font-size:13.5px; font-weight:600; padding:10px 18px; border-radius:2px; border:1px solid var(--ink); background:transparent; }
.btn-primary{ background:var(--ink); color:#fff; border-color:var(--ink); }
.btn-primary:hover{ background:var(--ink-soft); }
.btn-outline{ color:var(--ink); border-color:var(--line-strong); }
.btn-outline:hover{ border-color:var(--ink); }
.btn-ghost{ display:inline-flex; align-items:center; gap:6px; border-color:transparent; color:var(--rust); padding:6px 10px; }
.btn-sm{ padding:8px 14px; font-size:12.5px; }
.btn-block{ width:100%; justify-content:center; }

.field{ margin-bottom:14px; }
.field label{ display:block; font-size:11.5px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:var(--ink-faint); margin-bottom:6px; }
.field input,.field select{ width:100%; padding:9px 11px; border:1px solid var(--line-strong); background:#fff; border-radius:2px; font-size:13.5px; color:var(--ink); }

/* Table */
table{ width:100%; border-collapse:collapse; font-size:13.5px; }
th{ text-align:left; font-family:'IBM Plex Mono', monospace; font-size:10.5px; letter-spacing:0.06em; text-transform:uppercase; color:var(--ink-faint); padding:8px 10px; border-bottom:1px solid var(--line); }
td{ padding:11px 10px; border-bottom:1px solid var(--line); vertical-align:top; }
.reason-cell{ max-width:260px; color:var(--ink-soft); font-size:12.5px; }
.strike{ text-decoration:line-through; color:var(--ink-faint); }

.badge{ font-family:'IBM Plex Mono', monospace; font-size:11px; font-weight:600; padding:3px 9px; border-radius:2px; letter-spacing:0.03em; display:inline-flex; align-items:center; gap:5px; }
.badge-ink{ background:var(--navy-soft); color:var(--ink); }
.badge-rust{ background:var(--rust-soft); color:var(--rust); }
.badge-green{ background:var(--green-soft); color:var(--green); }

/* Audit feed */
.feed-list{ display:flex; flex-direction:column; }
.feed-row{ display:grid; grid-template-columns:70px 1fr; gap:14px; padding:12px 20px; border-bottom:1px solid var(--line); font-size:13px; }
.feed-list .feed-row:last-child{ border-bottom:none; }
.feed-time{ color:var(--ink-faint); font-size:11.5px; padding-top:2px; }
.feed-role{ display:inline-block; font-family:'IBM Plex Mono', monospace; font-size:10.5px; font-weight:600; letter-spacing:0.03em; padding:2px 7px; border-radius:2px; margin-right:4px; }
.feed-role.tone-ink{ background:var(--navy-soft); color:var(--ink); }
.feed-role.tone-rust{ background:var(--rust-soft); color:var(--rust); }
.feed-role.tone-green{ background:var(--green-soft); color:var(--green); }

/* Clickable document IDs — the entry point into provenance everywhere */
.doc-link{ background:transparent; border:none; padding:0; color:var(--ink); font-weight:600; text-decoration:underline; text-decoration-color:var(--line-strong); text-underline-offset:2px; cursor:pointer; }
.doc-link:hover{ color:var(--rust); text-decoration-color:var(--rust); }

/* Chain — mini (dashboard) */
.chain-mini{ display:flex; flex-direction:column; }
.chain-block-mini{ display:flex; align-items:center; gap:8px; padding:9px 12px; background:var(--paper); border:1px solid var(--line); font-size:12px; color:var(--ink-soft); }
.chain-link{ width:1px; height:14px; background:var(--line-strong); margin-left:20px; }

/* Chain — full viewer */
.chain-full{ display:flex; flex-direction:column; align-items:flex-start; }
.chain-block{ width:100%; max-width:460px; border:1px solid var(--line-strong); background:var(--paper); padding:14px 16px; }
.cb-top{ display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.cb-id{ font-size:13px; font-weight:600; }
.cb-row{ display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px dashed var(--line); font-size:12.5px; }
.cb-row:last-child{ border-bottom:none; }
.cb-row .k{ color:var(--ink-faint); }
.cb-row .v{ font-weight:500; }
.chain-link-v{ width:1px; height:20px; background:var(--line-strong); margin-left:24px; }

/* Trace */
.trace-form{ display:flex; gap:10px; }
.trace-search{ flex:1; }
.trace-search input{ width:100%; }

/* Extract-row reused */
.extract-row{ display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--line); font-size:13.5px; }

.empty-state{ display:flex; flex-direction:column; align-items:center; gap:8px; padding:50px 20px; color:var(--ink-faint); text-align:center; }
.empty-state b{ color:var(--ink); font-size:14.5px; }

@media (max-width:1100px){
  .kpi-grid{ grid-template-columns:repeat(2,1fr); }
  .grid-2{ grid-template-columns:1fr; }
  .feed-row{ grid-template-columns:1fr; gap:4px; }
}
`;

/* CSS specific to the provenance modal, injected only while it's open */
const MODAL_CSS = `
.modal-overlay{ position:fixed; inset:0; background:rgba(27,42,65,0.55); display:flex; align-items:flex-start; justify-content:center;
  padding:5vh 20px; z-index:1000; overflow-y:auto; }
.modal-panel{ width:100%; max-width:640px; background:var(--paper-raised); border:1px solid var(--line-strong); box-shadow:0 20px 50px rgba(27,42,65,0.35);
  margin-bottom:5vh; }
.modal-head{ display:flex; justify-content:space-between; align-items:flex-start; padding:20px 24px; border-bottom:1px solid var(--line); position:sticky; top:0; background:var(--paper-raised); }
.modal-eyebrow{ font-family:'IBM Plex Mono', monospace; font-size:10.5px; letter-spacing:0.08em; color:var(--rust); font-weight:600; }
.modal-head h3{ font-size:19px; margin-top:4px; }
.modal-close{ background:transparent; border:1px solid var(--line-strong); border-radius:4px; width:30px; height:30px; display:flex; align-items:center; justify-content:center; color:var(--ink-soft); flex:none; }
.modal-close:hover{ border-color:var(--ink); color:var(--ink); }
.modal-body{ padding:22px 24px 28px; display:flex; flex-direction:column; gap:26px; }

.prov-section-head{ display:flex; align-items:center; gap:8px; margin-bottom:14px; color:var(--ink-soft); }
.prov-section-head h4{ font-size:14.5px; font-weight:600; color:var(--ink); }

/* Document provenance stepper */
.prov-chain{ display:flex; flex-direction:column; }
.prov-step{ display:flex; gap:14px; }
.prov-step-marker{ display:flex; flex-direction:column; align-items:center; flex:none; }
.prov-step-num{ width:22px; height:22px; border-radius:50%; background:var(--navy-soft); color:var(--ink); font-family:'IBM Plex Mono', monospace; font-size:11px; font-weight:600; display:flex; align-items:center; justify-content:center; }
.prov-step-line{ width:1px; flex:1; min-height:16px; background:var(--line-strong); margin:2px 0; }
.prov-step-body{ display:flex; flex-direction:column; padding-bottom:14px; }
.prov-step-label{ font-family:'IBM Plex Mono', monospace; font-size:10.5px; letter-spacing:0.05em; text-transform:uppercase; color:var(--ink-faint); }
.prov-step-val{ font-size:13.5px; font-weight:500; color:var(--ink); margin-top:2px; }
.tone-text-rust{ color:var(--rust); }
.tone-text-green{ color:var(--green); }

/* Evidence region preview (mocked page + highlighted box) */
.evidence-wrap{ margin-top:12px; display:flex; flex-direction:column; align-items:flex-start; gap:8px; }
.evidence-page{ position:relative; width:220px; aspect-ratio:3/4; background:
    repeating-linear-gradient(0deg, #fff, #fff 7px, #F1EFE7 7px, #F1EFE7 8px);
  border:1px solid var(--line-strong); }
.evidence-highlight{ position:absolute; border:2px solid var(--rust); background:rgba(193,80,46,0.14); }
.evidence-caption{ font-size:11px; color:var(--ink-faint); }

/* Decision provenance diff */
.decision-diff{ display:flex; align-items:stretch; gap:10px; }
.diff-card{ flex:1; border:1px solid var(--line); padding:12px 14px; display:flex; flex-direction:column; gap:4px; }
.diff-ai{ background:var(--rust-soft); border-color:#E6C4B4; }
.diff-human{ background:var(--green-soft); border-color:#C7D6CC; }
.diff-label{ font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:0.06em; color:var(--ink-faint); }
.diff-val{ font-size:14.5px; font-weight:600; }
.diff-sub{ font-size:11px; color:var(--ink-soft); }
.diff-arrow{ align-self:center; color:var(--ink-faint); flex:none; }

.decision-meta{ display:flex; flex-direction:column; margin-top:14px; border:1px solid var(--line); }
.dm-row{ display:flex; justify-content:space-between; gap:16px; padding:9px 14px; border-bottom:1px dashed var(--line); font-size:13px; }
.dm-row:last-child{ border-bottom:none; }
.dm-row .k{ color:var(--ink-faint); flex:none; }
.dm-row .v{ text-align:right; }

.authority-note{ display:flex; align-items:center; gap:7px; margin-top:12px; font-size:12.5px; color:var(--green); background:var(--green-soft); padding:8px 12px; border-radius:2px; }

/* Trail table inside modal reuses global table styles */
.trail-table{ font-size:12.5px; }
.trail-table th{ padding:6px 8px; }
.trail-table td{ padding:8px; }

.ledger-check{ border:1px solid var(--line); padding:14px 16px; }
.ledger-check .cb-row{ margin-top:8px; }

@media (max-width:600px){
  .modal-panel{ max-width:100%; }
  .decision-diff{ flex-direction:column; }
  .diff-arrow{ transform:rotate(90deg); align-self:flex-start; margin-left:8px; }
}
`;